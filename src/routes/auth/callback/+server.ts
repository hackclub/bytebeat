import { redirect } from '@sveltejs/kit';
import {
	NEXT_COOKIE,
	STATE_COOKIE,
	cookieOpts,
	createSession,
	safeNext,
	exchangeCode,
	fetchIdentity,
	upsertUser
} from '#lib/server/auth.ts';
import { FRAUD_URL, linkedHackatimeBanned } from '#lib/server/hackatime.ts';

export const GET = async ({ url, cookies }) => {
	const expected = cookies.get(STATE_COOKIE);
	cookies.delete(STATE_COOKIE, { path: '/' });
	const next = safeNext(cookies.get(NEXT_COOKIE));
	cookies.delete(NEXT_COOKIE, { path: '/' });

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	if (!code || !expected || state !== expected) redirect(302, '/?error=auth-failed');

	const accessToken = await exchangeCode(code);
	const identity = accessToken && (await fetchIdentity(accessToken));
	if (!identity) redirect(302, '/?error=auth-failed');

	const user = await upsertUser(identity);
	const banned = user.role === 'banned' || (await linkedHackatimeBanned(user));
	if (banned) redirect(302, FRAUD_URL, { external: [FRAUD_URL] });

	await createSession(cookies, user.id);

	if (!user.hackatimeToken) {
		if (next !== '/') cookies.set(NEXT_COOKIE, next, { ...cookieOpts, maxAge: 60 * 10 });
		redirect(302, '/auth/hackatime');
	}
	redirect(302, next);
};
