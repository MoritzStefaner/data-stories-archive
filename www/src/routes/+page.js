import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export function load() {
	// redirect to default subpage
	redirect(302, '/episode/170');
}
