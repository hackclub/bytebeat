export const load = ({ locals }) => {
	const u = locals.user;
	return {
		user: u && {
			username: u.username,
			firstName: u.firstName,
			avatar: u.avatar,
			verificationStatus: u.verificationStatus,
			hackatimeLinked: !!u.hackatimeToken
		}
	};
};