import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { TOKEN_ENCRYPTION_KEY } from '$app/env/private';

const key = Buffer.from(TOKEN_ENCRYPTION_KEY, 'hex');

export function encrypt(plain: string): string {
	const iv = randomBytes(12);
	const cipher = createCipheriv('aes-256-gcm', key, iv);
	const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
	return [iv, cipher.getAuthTag(), data].map((b) => b.toString('base64url')).join('.');
}

export function decrypt(stored: string): string {
	const [iv, tag, data] = stored.split('.').map((s) => Buffer.from(s, 'base64url'));
	const decipher = createDecipheriv('aes-256-gcm', key, iv);
	decipher.setAuthTag(tag);
	return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}
