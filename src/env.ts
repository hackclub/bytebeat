import { defineEnvVars } from '@sveltejs/kit/env';

const optional = (v: string | undefined) => v ?? '';

export const variables = defineEnvVars({
	DATABASE_URL: { schema: optional },
	HCAUTH_CLIENT_ID: { schema: optional },
	HCAUTH_CLIENT_SECRET: { schema: optional },
	HCAUTH_REDIRECT_URI: {
		schema: (v) => v || 'http://localhost:8008/auth/callback'
	},
	HACKATIME_CLIENT_ID: { schema: optional },
	HACKATIME_CLIENT_SECRET: { schema: optional },
	HACKATIME_REDIRECT_URI: {
		schema: (v) => v || 'http://localhost:8008/auth/hackatime/callback'
	},
	TOKEN_ENCRYPTION_KEY: { schema: optional }
});
