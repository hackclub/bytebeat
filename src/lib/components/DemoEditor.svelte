<script lang="ts">
	import { compile, player } from '#lib/bytebeat.svelte.ts';
	import Scope from './Scope.svelte';

	let { initial = 't*(t>>5|t>>8)' }: { initial?: string } = $props();

	const SOURCE = 'editor';

	// svelte-ignore state_referenced_locally
	let code = $state(initial);
	// svelte-ignore state_referenced_locally
	let valid = $state(initial);
	let error = $state<string | null>(null);

	const mine = $derived(player.source === SOURCE);
	const playing = $derived(mine && player.playing);

	function tryCompile() {
		try {
			const fn = compile(code);
			error = null;
			valid = code;
			return fn;
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
			return null;
		}
	}

	function playPause() {
		if (playing) return player.pause();
		const fn = tryCompile();
		if (!fn) return;
		player.play(SOURCE, fn, mine ? (player.t ?? 0) : 0);
	}

	function restart() {
		const fn = tryCompile();
		if (fn) player.play(SOURCE, fn, 0);
	}

	let timer: ReturnType<typeof setTimeout>;
	function onInput() {
		clearTimeout(timer);
		timer = setTimeout(() => {
			const fn = tryCompile();
			if (fn && playing) player.play(SOURCE, fn, player.t ?? 0);
		}, 200);
	}
</script>

<div class="editor">
	<label for="formula">formula</label>
	<input
		id="formula"
		bind:value={code}
		oninput={onInput}
		onkeydown={(e) => e.key === 'Enter' && playPause()}
		spellcheck="false"
		autocomplete="off"
		autocapitalize="off"
	/>

	<div class="controls">
		<button class="btn" onclick={playPause}>{playing ? '❚❚ pause' : '▶ play'}</button>
		<button class="btn ghost" onclick={restart}>↺ restart</button>
		{#if error}<span class="error" role="status">{error}</span>{/if}
	</div>

	<Scope formula={valid} />

	<p class="volume">the examples are loud. lower your volume before pressing play.</p>
</div>

<style>
	.editor {
		max-width: 560px;
		background: var(--navy-2);
		border: 2px solid var(--line);
		padding: 1rem;
	}
	label {
		display: block;
		font-family: var(--pixel);
		font-size: 0.6rem;
		color: var(--muted);
		margin-bottom: 0.5rem;
	}
	input {
		width: 100%;
		font-family: var(--retro);
		font-size: 2rem;
		line-height: 1.1;
		color: var(--orange);
		background: var(--navy);
		border: 2px solid var(--line);
		border-radius: 0;
		padding: 0.3rem 0.6rem;
	}
	input:focus {
		border-color: var(--orange);
		outline: none;
	}
	.controls {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin: 0.9rem 0;
	}
	.error {
		font-family: var(--retro);
		font-size: 1.2rem;
		color: var(--orange);
	}
	.volume {
		margin: 0.8rem 0 0;
		font-size: 0.85rem;
		color: var(--muted);
	}
</style>
