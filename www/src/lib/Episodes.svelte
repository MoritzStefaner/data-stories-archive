<script>
	import { afterNavigate } from '$app/navigation';
	export let episodes = [];
	export let id = [];

	afterNavigate(() => {
		const active = document.querySelector('a.active');
		if (active) {
			active.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
		}
	});
</script>

<div class="flex grow flex-col gap-2 overflow-y-auto pr-2">
	{#each episodes || [] as episode (episode.id)}
		<a
			class="flex items-center p-2 text-sm"
			class:active={episode.id === id}
			href="/episode/{episode.id}"
			><div
				class="mr-4 flex h-full w-8 items-center justify-end border-r border-r-slate-300 pr-2 text-center text-xs text-slate-500"
			>
				{episode.number}
			</div>
			<div class="w-0 grow pr-2">
				{episode.title}
			</div></a
		>
	{/each}
</div>

<style lang="postcss">
</style>
