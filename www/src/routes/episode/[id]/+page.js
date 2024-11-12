export async function load({ params, fetch, parent }) {
	const { id } = params;
	const { episodes } = await parent();

	// console.log({ id });
	// Fetch data from an API or perform any other async operations
	const response = await fetch(`/data/${id}/transcript.json`);
	const transcript = await response.json();
	// let speakerLabels = ['A', 'B', 'C', 'D'];
	// try {
	// 	const response = await fetch(`/episodes/${id}/speakers.json`);
	// 	speakerLabels = await response.json();
	// } catch (error) {};
	const episode = episodes.find((episode) => episode.id === id);
	// console.log(transcript);
	return {
		id,
		transcript,
		episodes,
		meta: { title: `DS ${episode.number} — ${episode.title}` }
	};
}
