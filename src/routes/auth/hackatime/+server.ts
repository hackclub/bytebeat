import { redirect } from '@sveltejs/kit';
import { HACKATIME, hackatimeAuthorizeUrl } from '#lib/server/hackatime.ts';

export const GET = ({ locals, cookies }) => {
	if (!locals.user) redirect(302, '/auth/login');
	redirect(302, hackatimeAuthorizeUrl(cookies), { external: [HACKATIME] });
};
