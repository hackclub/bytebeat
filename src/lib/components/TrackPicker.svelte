<script lang="ts">
	import { onMount } from 'svelte';
	import { track, type Track } from '#lib/track.svelte.ts';

	let { question }: { question: string } = $props();

	onMount(() => track.load());

	const options: [Track, string][] = [
		['individual', 'on my own'],
		['club', 'with my club']
	];
</script>

<div class="picker" role="group" aria-label={question}>
	<p>{question}</p>
	<div class="options">
		{#each options as [value, label] (value)}
			<button
				class="btn"
				class:ghost={track.value !== value}
				aria-pressed={track.value === value}
				onclick={() => track.set(value)}
			>
				{label}
			</button>
		{/each}
	</div>
</div>

<style>
	.picker {
		margin: 1.5rem 0;
		padding: 1rem;
		border: 2px solid var(--line);
		background: var(--navy-2);
	}
	p {
		margin: 0 0 0.8rem;
	}
	.options {
		display: flex;
		gap: 0.8rem;
		flex-wrap: wrap;
	}
</style>
