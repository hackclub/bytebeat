<script lang="ts">
	import type { GuidePlayer } from '#lib/bytebeat/guide.svelte.ts';
	import EditorScope from './EditorScope.svelte';

	let {
		gp,
		id,
		code: initial,
		project = null,
		hideCode = false,
		title = null
	}: {
		gp: GuidePlayer;
		id: string;
		code: string;
		project?: string | null;
		hideCode?: boolean;
		title?: string | null;
	} = $props();

	let code = $state(initial);
	let copied = $state(false);

	const active = $derived(gp.current === id);
	const playing = $derived(gp.isPlaying(id));
	const rows = $derived.by(() => {
		const lines = code.split('\n');
		return lines.length + (lines.some((l) => l.length > 70) ? 1 : 0);
	});
	const href = $derived(
		`/editor?title=${encodeURIComponent('my first song')}&code=${encodeURIComponent(code)}`
	);

	let timer: ReturnType<typeof setTimeout>;
	function input() {
		clearTimeout(timer);
		timer = setTimeout(() => gp.update(id, code), 250);
	}

	function reset() {
		code = initial;
		gp.update(id, code);
	}

	function onKey(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
			e.preventDefault();
			gp.toggle(id, code);
		}
	}

	async function copy() {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {}
	}
</script>

<div class="ex" class:project class:active>
	{#if project}<p class="label">your project · {project}</p>{/if}
	<div class="row" class:titled={title}>
		{#if title}<p class="title">{title}</p>{/if}
		<button class="btn" onclick={() => gp.toggle(id, code)}>{playing ? '❚❚ pause' : '▶ play'}</button>
		{#if code !== initial}<button class="btn ghost" onclick={reset}>reset</button>{/if}
		{#if project}
			<button class="btn ghost" onclick={copy}>{copied ? 'copied' : 'copy'}</button>
			<a class="btn ghost" {href} target="_blank" rel="noopener">open in editor</a>
		{/if}
	</div>
	{#if !hideCode}
		<textarea
			bind:value={code}
			oninput={input}
			onkeydown={onKey}
			{rows}
			wrap="off"
			spellcheck="false"
			autocapitalize="off"
			autocomplete="off"
			aria-label="code"
		></textarea>
	{/if}
	{#if active}
		{#if gp.engine.error}
			<p class="error" role="status">{gp.engine.error}</p>
		{:else if gp.engine.runtimeError}
			<p class="error" role="status">{gp.engine.runtimeError}</p>
		{/if}
	{/if}
	<EditorScope engine={active ? gp.engine : null} />
</div>

<style>
	.ex {
		margin: 1.2rem 0;
		padding: 1rem;
		background: var(--navy-2);
		border: 2px solid var(--line);
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}
	.ex.project {
		border-color: var(--orange);
	}
	.label {
		margin: 0;
		font-family: var(--pixel);
		font-size: 0.6rem;
		color: var(--orange);
	}
	.row {
		display: flex;
		gap: 0.6rem;
		flex-wrap: wrap;
	}
	.row.titled {
		align-items: center;
	}
	.title {
		margin: 0 auto 0 0;
	}
	textarea {
		width: 100%;
		resize: vertical;
		font-family: var(--mono);
		font-size: 0.95rem;
		line-height: 1.6;
		color: var(--text);
		background: var(--navy);
		border: 2px solid var(--line);
		border-radius: 0;
		padding: 0.6rem 0.8rem;
		tab-size: 2;
	}
	textarea:focus {
		border-color: var(--orange);
		outline: none;
	}
	.error {
		margin: 0;
		padding: 0.5rem 0.8rem;
		border: 2px solid var(--orange);
		font-family: var(--retro);
		font-size: 1.2rem;
		color: var(--orange);
		word-break: break-word;
	}
</style>
