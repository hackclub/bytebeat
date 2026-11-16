import { redirect } from '@sveltejs/kit';
import { authorizeUrl, newState } from '#lib/server/auth.ts';

export const GET = ({ cookies }) => {
	redirect(302, authorizeUrl(newState(cookies)), { external: ['https://auth.hackclub.com'] });
};
