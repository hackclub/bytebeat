import { error, json } from '@sveltejs/kit';
import { getProject, updateProject, validateProject } from '#lib/server/projects.ts';

export const PUT = async ({ locals, params, request }) => {
	if (!locals.user) error(401, 'log in to save');
	const project = await getProject(params.id);
	if (!project) error(404, 'project not found');
	if (project.userId !== locals.user.id) error(403, 'this project belongs to someone else');
	const input = validateProject(await request.json().catch(() => null));
	await updateProject(params.id, input);
	return json({ id: params.id });
};
