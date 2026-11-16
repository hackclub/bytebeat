import { redirect } from '@sveltejs/kit';
import { unlinkHackatime } from '#lib/server/hackatime.ts';

export const POST = async ({ locals }) => {
	if (locals.user) await unlinkHackatime(locals.user);
	redirect(303, '/');
};
