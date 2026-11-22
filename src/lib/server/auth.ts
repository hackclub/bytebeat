import { createHash, randomBytes } from 'node:crypto';
import { and, eq, gt } from 'drizzle-orm';
import type { Cookies } from '@sveltejs/kit';
import { dev } from '$app/env';
import {
	HCAUTH_CLIENT_ID,
	HCAUTH_CLIENT_SECRET,
	HCAUTH_REDIRECT_URI
} from '$app/env/private';
import { db } from './db/index.ts';
import { sessions, users, type User } from './db/schema.ts';

const HC_AUTH = 'https://auth.hackclub.com';
const SCOPE = 'openid email name profile verification_status slack_id';
const SESSION_DAYS = 7;

export const SESSION_COOKIE = 'session';
export const STATE_COOKIE = 'oauth_state';
export const NEXT_COOKIE = 'post_login_redirect';

export function safeNext(raw: string | null | undefined): string {
	if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return '/';
	return raw;
}

const hash = (token: string) => createHash('sha256').update(token).digest('hex');
export const cookieOpts = { path: '/', httpOnly: true, sameSite: 'lax', secure: !dev } as const;

export function authorizeUrl(state: string) {
	const q = new URLSearchParams({
		client_id: HCAUTH_CLIENT_ID,
		redirect_uri: HCAUTH_REDIRECT_URI,
		response_type: 'code',
		scope: SCOPE,
		state
	});
	return `${HC_AUTH}/oauth/authorize?${q}`;
}

export function newState(cookies: Cookies) {
	const state = randomBytes(16).toString('hex');
	cookies.set(STATE_COOKIE, state, { ...cookieOpts, maxAge: 60 * 10 });
	return state;
}

export async function exchangeCode(code: string): Promise<string | null> {
	const res = await fetch(`${HC_AUTH}/oauth/token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			client_id: HCAUTH_CLIENT_ID,
			client_secret: HCAUTH_CLIENT_SECRET,
			redirect_uri: HCAUTH_REDIRECT_URI,
			code,
			grant_type: 'authorization_code'
		})
	});
	if (!res.ok) return null;
	const json = await res.json();
	return json.access_token ?? null;
}

export type Identity = {
	id: string;
	first_name?: string;
	primary_email?: string;
	slack_id?: string;
	verification_status?: string;
	ysws_eligible?: boolean;
};

export async function fetchIdentity(accessToken: string): Promise<Identity | null> {
	const res = await fetch(`${HC_AUTH}/api/v1/me`, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
	if (!res.ok) return null;
	const json = await res.json();
	return json.identity ?? null;
}

async function slackProfile(slackId: string) {
	try {
		const res = await fetch(`https://cachet.dunkirk.sh/users/${slackId}`, {
			signal: AbortSignal.timeout(5000)
		});
		if (!res.ok) return null;
		const j = await res.json();
		return {
			username: (j.displayName || j.realName || null) as string | null,
			avatar: (j.imageUrl || null) as string | null
		};
	} catch {
		return null;
	}
}

export async function upsertUser(identity: Identity): Promise<User> {
	const profile = identity.slack_id ? await slackProfile(identity.slack_id) : null;
	const fields = {
		email: identity.primary_email ?? '',
		firstName: identity.first_name ?? null,
		slackId: identity.slack_id ?? null,
		verificationStatus: identity.verification_status ?? null,
		yswsEligible: identity.ysws_eligible ?? null,
		...(profile?.username && { username: profile.username }),
		...(profile?.avatar && { avatar: profile.avatar })
	};
	const [user] = await db
		.insert(users)
		.values({ sub: identity.id, username: identity.first_name ?? null, ...fields })
		.onConflictDoUpdate({ target: users.sub, set: { ...fields, updatedAt: new Date() } })
		.returning();
	return user;
}

export async function createSession(cookies: Cookies, userId: number) {
	const token = randomBytes(32).toString('hex');
	const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000);
	await db.insert(sessions).values({ token: hash(token), userId, expiresAt });
	cookies.set(SESSION_COOKIE, token, { ...cookieOpts, expires: expiresAt });
}

export async function userFromSession(token: string | undefined): Promise<User | null> {
	if (!token) return null;
	const [row] = await db
		.select({ user: users })
		.from(sessions)
		.innerJoin(users, eq(users.id, sessions.userId))
		.where(and(eq(sessions.token, hash(token)), gt(sessions.expiresAt, new Date())))
		.limit(1);
	return row?.user ?? null;
}

export async function destroySession(cookies: Cookies) {
	const token = cookies.get(SESSION_COOKIE);
	if (token) await db.delete(sessions).where(eq(sessions.token, hash(token)));
	cookies.delete(SESSION_COOKIE, { path: '/' });
}
