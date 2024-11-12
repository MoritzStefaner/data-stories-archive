<script context="module">
	import { page } from '$app/stores';
	import { scaleOrdinal } from 'd3';

	import twColors from 'tailwindcss/colors';

	const colorScale = scaleOrdinal().range([
		twColors.blue[500],
		twColors.lime[600],
		twColors.rose[500],
		twColors.amber[600]
	]);

	const hostColors = {
		'Moritz Stefaner': twColors.cyan[600],
		'Enrico Bertini': twColors.purple[500]
	};

	const colors = (d) => hostColors[d] || colorScale(d);
</script>

<script>
	import { find, map, uniq, uniqBy } from 'lodash-es';

	import { afterNavigate } from '$app/navigation';

	import Episodes from '$lib/Episodes.svelte';
	import Logo from '$lib/Logo.svelte';
	import Search from '$lib/Search.svelte';

	export let data = {};

	$: ({
		episodes,
		id,
		transcript,
		transcript: { audio_url }
	} = data);

	$: speakerIds = uniq(map(transcript.utterances, 'speaker'));
	$: speakerLabels = transcript.episode_metadata.speakers;
	$: speakerLabel = scaleOrdinal().domain(speakerIds).range(speakerLabels);
	$: episode = episodes.find((d) => d.id === id);
	$: offset = scaleOrdinal().range(['0px', '4px', '8px', '12px']).domain(speakerIds);

	$: utterances = transcript.utterances.map((u, i) => ({
		...u,
		duration: u.end - u.start,
		speaker: speakerLabel(u.speaker)
	}));

	$: chapters = transcript.chapters
		.map((d, i) => ({
			...d,
			utterances: utterances.filter(
				(u) => (u.start >= d.start && u.start <= d.end) || (u.end >= d.start && u.end <= d.end)
			)
		}))
		.map((d, i) => ({
			...d,
			duration: d.end - d.start
		}));

	$: activeChapter = chapters.find(isActive);
	$: activeUtterance = utterances.find(isActive);

	// some utterances are outside chapters
	// we'll match them with the closest chapter
	$: utterancesWithoutChapter = utterances
		.filter((u) => !chapters.find((c) => c.start <= u.start && c.end >= u.end))
		.map((d) => ({ ...d, closestChapter: find(chapters, (x) => x.start >= d.start)?.id }));

	// navigation and playback

	$: hash = $page.url.hash;

	let player;
	let currentTime;
	let duration;
	let paused = true;

	$: autoplay = player && duration && !paused;

	$: isActive = ({ start, end }) => currentTime >= start / 1000 && currentTime <= end / 1000;

	let targetCurrentTime = null;
	afterNavigate(() => {
		if (hash) {
			// if we have a hash, jump to the corresponding utterance after episode is loaded
			duration = null;
			targetCurrentTime =
				find(utterances.concat(chapters), (d) => d.id === hash.replace('#', ''))?.start / 1000;
		} else {
			// just jump to start
			targetCurrentTime = 0;
		}
	});

	// jump to targetCurrentTime once duration is set, i.e. audio is loaded
	$: if (duration && targetCurrentTime !== null) {
		currentTime = targetCurrentTime;
		targetCurrentTime = null;
	}

	let searchActive = false;
</script>

<main class="h-dvh w-full border-y-[6px] border-purple-700 bg-gray-200">
	<div class="flex items-center justify-start pr-4" style:grid-area="logo">
		<Logo />
	</div>

	<div class="relative flex min-w-[20em] flex-col overflow-y-auto !pb-0" style:grid-area="episodes">
		<h3 class="mb-4 text-sm uppercase tracking-wider text-purple-500">Episodes</h3>
		<div class="pointer-events-none absolute inset-0 gap-4">
			<Search bind:active={searchActive} />
		</div>
		{#if !searchActive}
			<Episodes {episodes} {id} />
		{/if}
	</div>

	<div class="h-full" style:grid-area="audio">
		<h3 class="mb-4 text-sm uppercase tracking-wider text-purple-500">Audio</h3>
		<div class="border-1 mr-4 flex items-center rounded-lg border border-purple-500 shadow-sm">
			{#key audio_url}
				<audio
					class=" grow border-white"
					controls
					{autoplay}
					bind:currentTime
					bind:duration
					bind:paused
					bind:this={player}
				>
					<source src={audio_url} type="audio/mpeg" />
				</audio>
			{/key}
		</div>
	</div>

	<div class="flex flex-col gap-4 !pb-0" style:grid-area="chapters">
		<h3 class="text-sm uppercase tracking-wider text-purple-500">Chapters (AI generated)</h3>
		<div class="flex h-0 grow flex-col gap-2 overflow-y-auto pr-2">
			{#each chapters as { summary, headline, gist, start, end, utterances, duration: chapterDuration, id: chapterId } (chapterId)}
				<a
					class="top-0 p-2 text-sm"
					class:active={activeChapter?.id === chapterId}
					href="#{chapterId}"
					on:click={() => (currentTime = start / 1000)}
				>
					<span>{gist}</span>

					<div class="mt-1 flex w-full">
						{#each utterances as { start, end, speaker, text, duration, id } (id)}
							<div
								style:background-color={colors(speaker)}
								style:opacity={isActive({ start, end }) ? 1 : 0.66}
								style:width={(duration / chapterDuration) * 100 + '%'}
								style:margin-top={offset(speaker)}
								class="h-[4px] rounded-full"
							></div>
							<!--
								on:click|stopPropagation={() => (currentTime = start / 1000)}
									href="#{chapterId}-{id}"
									-->
						{/each}
					</div>
				</a>
			{/each}
		</div>
	</div>
	<div style:grid-area="speakers" class="flex flex-col gap-4">
		<h3 class="text-sm uppercase tracking-wider text-purple-500">Speakers</h3>
		<div class="flex flex-wrap gap-2 pr-4">
			{#each speakerLabel.range() as label (label)}
				<div
					class="border-r-1 flex items-center gap-2 rounded-full border py-1 pl-2 pr-3 text-xs text-white"
					style:border-color={colors(label)}
					style:color={colors(label)}
				>
					{label}
				</div>
			{/each}
		</div>
	</div>

	<div class="transcript flex flex-col !pb-0" style:grid-area="transcript">
		<h3 class="mb-4 text-sm uppercase tracking-wider text-purple-500">Transcript</h3>
		<div class="flex h-0 grow justify-center overflow-y-auto scroll-smooth">
			<div class="min-w-[20em] max-w-[40em]">
				{#if episode}
					<div class="flex flex-col gap-2 p-2 text-sm">
						<div class="flex gap-2">
							<div>Data Stories: Episode #{episode.number}</div>
						</div>
						<h1>{episode.title}</h1>
					</div>
				{/if}
				{#each chapters as { summary, utterances, headline, gist, id, id: chapterId, start, end } (id)}
					<a
						class="h2 top-0 my-8 block p-4"
						class:active={activeChapter?.id === id}
						href="#{chapterId}"
						id={chapterId}
						on:click={() => (currentTime = start / 1000)}
					>
						{gist}
					</a>
					<!-- <h3>{headline}</h3> -->
					<span class="relative z-10 m-2 bg-gray-200 px-2 text-sm font-normal text-purple-800/70"
						>AI generated chapter summary:</span
					>
					<p
						class="text-md mb-16 mt-[-.5em] rounded-lg border border-dashed border-purple-500/80 p-4 py-4 font-normal italic text-gray-500"
						id={chapterId + '_summary'}
					>
						{summary}
					</p>

					{#each uniqBy(utterancesWithoutChapter
							.filter((u) => u.closestChapter === chapterId)
							.concat(utterances), 'id') as { start, end, speaker, text, id } (id)}
						<a
							class="mt-8 block p-4 pb-1 pt-2 text-sm"
							class:active={activeUtterance?.id === id}
							{id}
							href="#{id}"
							on:click={() => (currentTime = start / 1000)}
						>
							<span class="text-xs" style:color={colors(speaker)}>
								{speaker}
							</span><br />
							<p>
								{text}
							</p>
						</a>
					{/each}
					<hr class="my-8 border-purple-500" />
				{/each}
			</div>
		</div>
	</div>
</main>

<style lang="postcss">
	main {
		display: grid;
		grid-template-columns:
			minmax(min-content, 1fr) minmax(min-content, 1fr)
			2fr;
		grid-template-rows: auto 1fr auto;
		grid-template-areas: 'logo audio transcript' 'episodes chapters transcript' 'episodes speakers transcript';
		> * {
			@apply border border-[.5px] border-purple-400;

			@apply py-4 pl-4;
		}
	}
</style>
