import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import type { Cookies } from '@sveltejs/kit';
import {
	HACKATIME_CLIENT_ID,
	HACKATIME_CLIENT_SECRET,
	HACKATIME_REDIRECT_URI
} from '$app/env/private';
import { cookieOpts } from './auth.ts';
import { decrypt, encrypt } from './crypto.ts';
import { db } from './db/index.ts';
import { users, type User } from './db/schema.ts';

export const HACKATIME = 'https://hackatime.hackclub.com';
const SCOPE = 'profile read';
export const HT_STATE_COOKIE = 'hackatime_state';

export function hackatimeAuthorizeUrl(cookies: Cookies) {
	const state = randomBytes(16).toString('hex');
	cookies.set(HT_STATE_COOKIE, state, { ...cookieOpts, maxAge: 60 * 10 });
	const q = new URLSearchParams({
		client_id: HACKATIME_CLIENT_ID,
		redirect_uri: HACKATIME_REDIRECT_URI,
		response_type: 'code',
		scope: SCOPE,
		state
	});
	return `${HACKATIME}/oauth/authorize?${q}`;
}

export async function hackatimeExchangeCode(code: string): Promise<string | null> {
	const res = await fetch(`${HACKATIME}/oauth/token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			client_id: HACKATIME_CLIENT_ID,
			client_secret: HACKATIME_CLIENT_SECRET,
			redirect_uri: HACKATIME_REDIRECT_URI,
			code,
			grant_type: 'authorization_code'
		})
	});
	if (!res.ok) return null;
	return (await res.json()).access_token ?? null;
}

async function api<T>(token: string, path: string): Promise<T | null> {
	const res = await fetch(`${HACKATIME}/api/v1/authenticated/${path}`, {
		headers: { Authorization: `Bearer ${token}` },
		signal: AbortSignal.timeout(8000)
	});
	return res.ok ? ((await res.json()) as T) : null;
}

export const FRAUD_URL = 'https://fraud.hackclub.com';

export type HackatimeMe = {
	id: number;
	emails: string[];
	slack_id: string | null;
	trust_factor?: { trust_level: string; trust_value: number };
};

export const isHackatimeBanned = (me: HackatimeMe) => me.trust_factor?.trust_level === 'red';
export type HackatimeProject = {
	name: string;
	total_seconds: number;
	most_recent_heartbeat: string | null;
	languages: string[];
	archived: boolean;
};

export const fetchHackatimeMe = (token: string) => api<HackatimeMe>(token, 'me');

export async function linkHackatime(userId: number, token: string, me: HackatimeMe) {
	await db
		.update(users)
		.set({ hackatimeUserId: me.id, hackatimeToken: encrypt(token), updatedAt: new Date() })
		.where(eq(users.id, userId));
}

export async function unlinkHackatime(user: User) {
	if (user.hackatimeToken) {
		await fetch(`${HACKATIME}/oauth/revoke`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				token: decrypt(user.hackatimeToken),
				client_id: HACKATIME_CLIENT_ID,
				client_secret: HACKATIME_CLIENT_SECRET
			})
		}).catch(() => {});
	}
	await db
		.update(users)
		.set({ hackatimeUserId: null, hackatimeToken: null, updatedAt: new Date() })
		.where(eq(users.id, user.id));
}

const tokenOf = (user: User) => (user.hackatimeToken ? decrypt(user.hackatimeToken) : null);

export async function linkedHackatimeBanned(user: User) {
	const token = tokenOf(user);
	if (!token) return false;
	const me = await fetchHackatimeMe(token);
	return !!me && isHackatimeBanned(me);
}

export async function hackatimeSeconds(user: User, startDate?: string, endDate?: string) {
	const token = tokenOf(user);
	if (!token) return null;
	const q = new URLSearchParams();
	if (startDate) q.set('start_date', startDate);
	if (endDate) q.set('end_date', endDate);
	const r = await api<{ total_seconds: number }>(token, `hours?${q}`);
	return r?.total_seconds ?? null;
}

export async function hackatimeProjects(user: User) {
	const token = tokenOf(user);
	if (!token) return null;
	const r = await api<{ projects: HackatimeProject[] }>(token, 'projects');
	return r?.projects ?? null;
}
