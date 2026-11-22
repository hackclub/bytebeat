import { redirect } from '@sveltejs/kit';
import { NEXT_COOKIE, authorizeUrl, cookieOpts, newState, safeNext } from '#lib/server/auth.ts';

export const GET = ({ cookies, url }) => {
	const next = safeNext(url.searchParams.get('next'));
	if (next !== '/') cookies.set(NEXT_COOKIE, next, { ...cookieOpts, maxAge: 60 * 10 });
	else cookies.delete(NEXT_COOKIE, { path: '/' });
	redirect(302, authorizeUrl(newState(cookies)), { external: ['https://auth.hackclub.com'] });
};
