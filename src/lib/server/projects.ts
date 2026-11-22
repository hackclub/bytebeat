import { randomBytes } from 'node:crypto';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { MODES, RATES } from '#lib/bytebeat/constants.ts';
import { db } from './db/index.ts';
import { projects, users } from './db/schema.ts';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const MAX_CODE = 20_000;
const MAX_TITLE = 80;

export function newProjectId(length = 10) {
	const bytes = randomBytes(length);
	let id = '';
	for (const b of bytes) id += ALPHABET[b % ALPHABET.length];
	return id;
}

export type ProjectInput = { title: string; code: string; mode: string; sampleRate: number };

export function validateProject(body: unknown): ProjectInput {
	const b = (body ?? {}) as Record<string, unknown>;
	const title = String(b.title ?? '').trim().slice(0, MAX_TITLE) || 'untitled';
	const code = String(b.code ?? '');
	const mode = String(b.mode ?? '');
	const sampleRate = Number(b.sampleRate);
	if (!code.trim()) error(400, 'code is empty');
	if (code.length > MAX_CODE) error(400, `code is longer than ${MAX_CODE} characters`);
	if (!(MODES as readonly string[]).includes(mode)) error(400, 'unknown mode');
	if (!(RATES as readonly number[]).includes(sampleRate)) error(400, 'unsupported sample rate');
	return { title, code, mode, sampleRate };
}

export async function getProject(id: string) {
	const [row] = await db
		.select({
			id: projects.id,
			userId: projects.userId,
			title: projects.title,
			code: projects.code,
			mode: projects.mode,
			sampleRate: projects.sampleRate,
			updatedAt: projects.updatedAt,
			author: users.username,
			authorFirstName: users.firstName
		})
		.from(projects)
		.innerJoin(users, eq(users.id, projects.userId))
		.where(eq(projects.id, id))
		.limit(1);
	return row ?? null;
}

export async function createProject(userId: number, input: ProjectInput) {
	for (let attempt = 0; attempt < 5; attempt++) {
		const id = newProjectId();
		const rows = await db
			.insert(projects)
			.values({ id, userId, ...input })
			.onConflictDoNothing()
			.returning({ id: projects.id });
		if (rows.length) return rows[0].id;
	}
	error(500, 'could not create a project id');
}

export async function updateProject(id: string, input: ProjectInput) {
	await db
		.update(projects)
		.set({ ...input, updatedAt: new Date() })
		.where(eq(projects.id, id));
}
