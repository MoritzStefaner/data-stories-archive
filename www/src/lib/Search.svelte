<script>
	import { find, throttle } from 'lodash-es';
	import { page } from '$app/stores';

	const url = 'https://datastories-archive-moritzstefaner.turso.io/v2/pipeline';
	const authToken = import.meta.env.VITE_TURSO_KEY;
	let searchTerm = '';
	let limit = 50;
	let results = null;
	export let active = false;

	const doSearch = async () => {
		const response = await fetch(url, {
			method: 'POST',
			mode: 'cors',
			headers: {
				Authorization: `Bearer ${authToken}`,
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			},
			body: JSON.stringify({
				requests: [
					{
						type: 'execute',
						stmt: {
							sql: `
              SELECT
                *
              FROM
                search
              WHERE
                text MATCH "${searchTerm}"
              ORDER BY
                RANK
              LIMIT
                ${limit};`
						}
					},
					{ type: 'close' }
				]
			})
		});

		const resultsList = await response.json();
		results = find(resultsList.results, { response: { type: 'execute' } })?.response?.result;
		searched = searchTerm;
	};

	let searched = null;

	$: resultsObject =
		searchTerm && results?.cols
			? results.rows.map((row) =>
					Object.fromEntries(row.map((col, i) => [results.cols[i].name, col.value]))
				)
			: null;

	const throttledSearch = throttle(doSearch, 1000);

	function submit() {
		if (searchTerm) {
			resultsObject = null;
			throttledSearch();
		} else {
			results = null;
		}
	}

	$: regex = new RegExp(searchTerm, 'ig');
	$: active = searchTerm;
</script>

<div class="group flex h-full w-full flex-col pt-2">
	<form
		on:submit={submit}
		class="pointer-events-auto flex items-center justify-end gap-2 pl-[6em] pr-2"
	>
		<!-- <h3 class="mb-2 mr-4 mt-2 text-sm uppercase tracking-wider text-purple-500">Search</h3> -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="22"
			height="22"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="icon icon-tabler icons-tabler-outline icon-tabler-search text-purple-600"
		>
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
			<path d="M21 21l-6 -6" />
		</svg>

		<input
			type="search"
			class="w-24 rounded-md px-2 py-1 transition-all"
			bind:value={searchTerm}
			on:change={() => (searched = null)}
			class:grow={active}
		/>

		{#if searchTerm}
			<button
				class="inline-block aspect-square w-8 rounded-md border-gray-700 bg-white py-1 text-xs tracking-wider text-purple-500 disabled:text-gray-400"
				type="submit"
				on:click={() => (searched === searchTerm ? (searchTerm = null) : submit())}
			>
				{searched === searchTerm ? '×' : 'GO'}
			</button>
		{/if}
	</form>

	{#if resultsObject && searched === searchTerm}
		<div class="mt-4 flex h-0 grow flex-col overflow-y-auto border pl-2">
			{#each resultsObject as result (result.id)}
				<a
					class="pointer-events-auto mr-2 block rounded-md border p-2 hover:bg-white"
					href="/episode/{result.episode_num}/#{result.id}"
					class:active={result.id === $page.url.hash.replace('#', '')}
				>
					<div class="flex flex-col">
						<div class="flex gap-2 text-xs text-gray-600">
							<div>{result.episode_num}</div>
							<div>{result.episode_title}</div>
						</div>
						<div class="text-xs text-gray-600">{result.speaker}</div>
						<p class="my-2 text-sm">
							{@html result.text.replace(regex, `<strong>${searchTerm}</strong>`)}
						</p>
					</div>
				</a>
			{:else}
				No results found.
			{/each}
		</div>
	{/if}
</div>
