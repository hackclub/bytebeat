import { redirect } from '@sveltejs/kit';
import {
	HT_STATE_COOKIE,
	fetchHackatimeMe,
	hackatimeExchangeCode,
	linkHackatime
} from '#lib/server/hackatime.ts';

export const GET = async ({ url, cookies, locals }) => {
	const expected = cookies.get(HT_STATE_COOKIE);
	cookies.delete(HT_STATE_COOKIE, { path: '/' });
	if (!locals.user) redirect(302, '/auth/login');

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	if (!code || !expected || state !== expected) redirect(302, '/?error=hackatime-failed');

	const token = await hackatimeExchangeCode(code);
	const me = token && (await fetchHackatimeMe(token));
	if (!token || !me) redirect(302, '/?error=hackatime-failed');

	await linkHackatime(locals.user.id, token, me);
	redirect(302, '/');
};
