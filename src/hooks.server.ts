import type { Handle } from '@sveltejs/kit/hooks';
import { SESSION_COOKIE, userFromSession } from '#lib/server/auth.ts';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = await userFromSession(event.cookies.get(SESSION_COOKIE));
	return resolve(event);
};
