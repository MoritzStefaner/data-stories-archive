export const prerender = true;
export const trailingSlash = 'always';

export async function load({ params, fetch }) {
	const { id } = params;

	// Fetch data from an API or perform any other async operations
	// const response = await fetch(`https://datastori.es/wp-json/podlove/v2/episodes`);
	const response = await fetch(`/data/episode_and_authors_list_01.json`);
	const result = await response.json();
	// console.log(result);

	const episodes = Object.entries(result)
		.map(([key, value]) => ({
			...value,
			title: value.episode_title,
			id: key,
			number: +key
		}))
		.reverse()
		.slice(1);
	// console.log('episodes', episodes);

	// Return the data to be used in the Svelte component
	return {
		episodes,
		id
	};
}
