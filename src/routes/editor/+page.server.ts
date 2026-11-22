export const load = ({ locals }) => {
	return { project: null, loggedIn: !!locals.user };
};
