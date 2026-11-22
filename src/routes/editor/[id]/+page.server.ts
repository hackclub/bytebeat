import { error } from '@sveltejs/kit';
import { getProject } from '#lib/server/projects.ts';

export const load = async ({ locals, params }) => {
	const p = await getProject(params.id);
	if (!p) error(404, 'project not found');
	return {
		loggedIn: !!locals.user,
		project: {
			id: p.id,
			title: p.title,
			code: p.code,
			mode: p.mode,
			sampleRate: p.sampleRate,
			author: p.author ?? p.authorFirstName ?? 'someone',
			isOwner: locals.user?.id === p.userId
		}
	};
};
