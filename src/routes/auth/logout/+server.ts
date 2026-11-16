import { redirect } from '@sveltejs/kit';
import { destroySession } from '#lib/server/auth.ts';

export const POST = async ({ cookies }) => {
	await destroySession(cookies);
	redirect(303, '/');
};
