import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	DATABASE_URL: {},
	HCAUTH_CLIENT_ID: {},
	HCAUTH_CLIENT_SECRET: {},
	HCAUTH_REDIRECT_URI: {
		schema: (v) => v || 'http://localhost:8008/auth/callback'
	},
	HACKATIME_CLIENT_ID: {},
	HACKATIME_CLIENT_SECRET: {},
	HACKATIME_REDIRECT_URI: {
		schema: (v) => v || 'http://localhost:8008/auth/hackatime/callback'
	},
	TOKEN_ENCRYPTION_KEY: {
		schema: (v) => {
			if (!v || !/^[0-9a-f]{64}$/i.test(v))
				throw new Error('must be 64 hex chars (openssl rand -hex 32)');
			return v;
		}
	}
});
