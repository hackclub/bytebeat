import { hackatimeSeconds } from '#lib/server/hackatime.ts';

export const load = async ({ locals }) => {
	const user = locals.user;
	if (!user?.hackatimeToken) return { hackatimeHours: null };
	const seconds = await hackatimeSeconds(user);
	return { hackatimeHours: seconds === null ? null : Math.round((seconds / 3600) * 10) / 10 };
};
