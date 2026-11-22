import { error, json } from '@sveltejs/kit';
import { createProject, validateProject } from '#lib/server/projects.ts';

export const POST = async ({ locals, request }) => {
	if (!locals.user) error(401, 'log in to export');
	const input = validateProject(await request.json().catch(() => null));
	const id = await createProject(locals.user.id, input);
	return json({ id }, { status: 201 });
};
