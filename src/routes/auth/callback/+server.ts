import { redirect } from '@sveltejs/kit';
import {
	NEXT_COOKIE,
	STATE_COOKIE,
	createSession,
	safeNext,
	exchangeCode,
	fetchIdentity,
	upsertUser
} from '#lib/server/auth.ts';

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
	await createSession(cookies, user.id);
	redirect(302, next);
};
