import { redirect } from '@sveltejs/kit';
import { hackatimeSeconds } from '#lib/server/hackatime.ts';

export const load = async ({ locals }) => {
	const u = locals.user;
	if (!u) redirect(302, '/auth/login?next=/account');

	const seconds = u.hackatimeToken ? await hackatimeSeconds(u) : null;
	return {
		account: {
			username: u.username,
			firstName: u.firstName,
			avatar: u.avatar,
			email: u.email,
			slackId: u.slackId,
			verificationStatus: u.verificationStatus,
			joined: u.createdAt.toISOString(),
			hackatimeLinked: !!u.hackatimeToken,
			hackatimeHours: seconds === null ? null : Math.round((seconds / 3600) * 10) / 10
		}
	};
};
