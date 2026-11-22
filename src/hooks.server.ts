import type { Handle, ServerInit } from '@sveltejs/kit/hooks';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { building } from '$app/env';
import * as env from '$app/env/private';
import { SESSION_COOKIE, userFromSession } from '#lib/server/auth.ts';
import { db } from '#lib/server/db/index.ts';

export const init: ServerInit = async () => {
	if (building) return;

	const expected = [
		'DATABASE_URL',
		'HCAUTH_CLIENT_ID',
		'HCAUTH_CLIENT_SECRET',
		'HACKATIME_CLIENT_ID',
		'HACKATIME_CLIENT_SECRET',
		'TOKEN_ENCRYPTION_KEY'
	] as const;
	const missing = expected.filter((k) => !env[k]);
	if (missing.length) console.warn(`Not set, related features won't work: ${missing.join(', ')}`);
	if (env.TOKEN_ENCRYPTION_KEY && !/^[0-9a-f]{64}$/i.test(env.TOKEN_ENCRYPTION_KEY))
		throw new Error('TOKEN_ENCRYPTION_KEY must be 64 hex chars (openssl rand -hex 32)');

	await ensureMigrated();
};

let migrated: Promise<boolean> | null = null;
function ensureMigrated() {
	if (!env.DATABASE_URL) return Promise.resolve(false);
	migrated ??= migrate(db, { migrationsFolder: 'drizzle' }).then(
		() => true,
		(err) => {
			console.error('database not reachable, will retry on next request:', err.cause ?? err);
			migrated = null;
			return false;
		}
	);
	return migrated;
}

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;
	if (await ensureMigrated()) {
		try {
			event.locals.user = await userFromSession(event.cookies.get(SESSION_COOKIE));
		} catch (err) {
			console.error('could not load session:', err);
		}
	}
	return resolve(event);
};
