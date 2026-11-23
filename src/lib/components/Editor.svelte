<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { Engine } from '#lib/bytebeat/engine.svelte.ts';
	import { MODES, RATES, type Mode } from '#lib/bytebeat/constants.ts';
	import { player } from '#lib/bytebeat.svelte.ts';
	import CodeArea from './CodeArea.svelte';
	import EditorScope from './EditorScope.svelte';
	import EditorTour from './EditorTour.svelte';

	type Project = {
		id: string;
		title: string;
		code: string;
		mode: string;
		sampleRate: number;
		author: string;
		isOwner: boolean;
	};

	let { project, loggedIn }: { project: Project | null; loggedIn: boolean } = $props();

	const STARTER = `melody = [4, 5, 6, 8][t >> 12 & 3]\nbass = t >> 2 & t >> 7\n\nt * melody & 128 | bass & 63\n`;
	const DRAFT_KEY = 'bytebeat:draft';

	// svelte-ignore state_referenced_locally
	let id = $state(project?.id ?? null);
	let isOwner = $state(project?.isOwner ?? false);
	let title = $state(project?.title ?? 'untitled');
	let code = $state(project?.code ?? STARTER);
	let mode = $state<Mode>((project?.mode as Mode) ?? 'bytebeat');
	let rate = $state(project?.sampleRate ?? 8000);

	let dirty = $state(false);
	let status = $state<string | null>(null);
	let saving = $state(false);
	let copied = $state(false);

	let tour = $state<ReturnType<typeof EditorTour>>();

	const engine = new Engine();
	const link = $derived(id ? `${page.url.origin}/editor/${id}` : null);
	const seconds = $derived((engine.t / rate).toFixed(2));
	const canSave = $derived(id !== null && isOwner);

	onMount(() => {
		const shared = page.url.searchParams.get('code');
		if (!project && shared !== null) {
			code = shared;
			title = page.url.searchParams.get('title') ?? title;
			mode = 'bytebeat';
			rate = 8000;
			try {
				localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, code, mode, rate }));
			} catch {}
			try {
				replaceState('/editor', {});
			} catch {}
		} else if (!project) {
			try {
				const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null');
				if (draft?.code) {
					title = draft.title ?? title;
					code = draft.code;
					mode = MODES.includes(draft.mode) ? draft.mode : mode;
					rate = RATES.includes(draft.rate) ? draft.rate : rate;
				}
			} catch {}
		}
		engine.setCode(code, mode, rate);

		const warn = (e: BeforeUnloadEvent) => {
			if (dirty && canSave) e.preventDefault();
		};
		addEventListener('beforeunload', warn);
		return () => {
			removeEventListener('beforeunload', warn);
			engine.destroy();
		};
	});

	let timer: ReturnType<typeof setTimeout>;
	function changed() {
		dirty = true;
		status = null;
		clearTimeout(timer);
		timer = setTimeout(() => {
			engine.setCode(code, mode, rate);
			if (!id) {
				try {
					localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, code, mode, rate }));
				} catch {}
			}
		}, 250);
	}

	async function playPause() {
		if (engine.playing) return engine.pause();
		if (!player.allowed()) return;
		engine.setCode(code, mode, rate);
		await engine.play();
	}

	function onKey(e: KeyboardEvent) {
		const mod = e.ctrlKey || e.metaKey;
		if (mod && e.key === 'Enter') {
			e.preventDefault();
			playPause();
		} else if (mod && e.key.toLowerCase() === 's') {
			e.preventDefault();
			exportOrSave();
		}
	}

	async function exportOrSave() {
		if (!loggedIn) {
			try {
				localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, code, mode, rate }));
			} catch {}
			location.href = `/auth/login?next=${encodeURIComponent(page.url.pathname)}`;
			return;
		}
		saving = true;
		status = null;
		const body = JSON.stringify({ title, code, mode, sampleRate: rate });
		try {
			const res = canSave
				? await fetch(`/api/projects/${id}`, {
						method: 'PUT',
						headers: { 'content-type': 'application/json' },
						body
					})
				: await fetch('/api/projects', {
						method: 'POST',
						headers: { 'content-type': 'application/json' },
						body
					});
			const json = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(json.message ?? `failed (${res.status})`);
			if (!canSave) {
				id = json.id;
				isOwner = true;
				replaceState(`/editor/${json.id}`, {});
				try {
					localStorage.removeItem(DRAFT_KEY);
				} catch {}
			}
			dirty = false;
			status = 'saved';
		} catch (err) {
			status = err instanceof Error ? err.message : 'could not save';
		} finally {
			saving = false;
		}
	}

	async function copyLink() {
		if (!link) return;
		try {
			await navigator.clipboard.writeText(link);
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {}
	}
</script>

<div class="editor">
	<header class="bar">
		<a href="/" class="flag"><img src="/flag-8bit.svg" alt="Hack Club" width="96" height="34" /></a>
		<input class="title" data-tour="title" bind:value={title} oninput={changed} maxlength="80" aria-label="title" />
		{#if project && !isOwner}
			<span class="by">by {project.author}. export to save your own copy.</span>
		{/if}
	</header>

	<div class="toolbar">
		<button class="btn" data-tour="play" onclick={playPause}>{engine.playing ? '❚❚ pause' : '▶ play'}</button>
		<button class="btn ghost" data-tour="play" onclick={() => engine.restart()}>↺ restart</button>

		<label data-tour="settings">
			<span>mode</span>
			<select bind:value={mode} onchange={changed}>
				{#each MODES as m (m)}<option value={m}>{m === 'bytebeat' ? 'classic' : m}</option>{/each}
			</select>
		</label>
		<label data-tour="settings">
			<span>rate</span>
			<select bind:value={rate} onchange={changed}>
				{#each RATES as r (r)}<option value={r}>{r} hz</option>{/each}
			</select>
		</label>
		<label class="vol" data-tour="volume">
			<span>volume</span>
			<input
				type="range"
				min="0"
				max="1"
				step="0.01"
				value={engine.volume}
				oninput={(e) => engine.setVolume(+e.currentTarget.value)}
			/>
		</label>

		<span class="time" data-tour="time">t = {engine.t} · {seconds}s</span>

		<div class="save">
			{#if status}<span class="status" role="status">{status}</span>{/if}
			<button class="btn" data-tour="save" onclick={exportOrSave} disabled={saving}>
				{#if !loggedIn}log in to export{:else if canSave}{dirty ? 'save' : 'saved'}{:else}export{/if}
			</button>
		</div>
	</div>

	{#if link}
		<div class="link">
			<span>link:</span>
			<a href={link}>{link}</a>
			<button class="btn ghost" onclick={copyLink}>{copied ? 'copied' : 'copy'}</button>
		</div>
	{/if}

	<div class="main">
		<div class="left" data-tour="code">
			<CodeArea bind:value={code} oninput={changed} onkeydown={onKey} />
		</div>
		<aside class="right">
			<div class="scope" data-tour="scope">
				<EditorScope {engine} />
				{#if engine.error}
					<p class="error" role="status">{engine.error}</p>
				{:else if engine.runtimeError}
					<p class="error" role="status">{engine.runtimeError}</p>
				{/if}
			</div>make sure to lower your sound! this is REALLY loud.
			<p class="help">
				learn how to use this in the <a href="/guide">guide</a>, or
				<button class="link-btn" onclick={() => tour?.start()}>restart the tutorial</button>.
			</p>
		</aside>
	</div>
</div>

<EditorTour bind:this={tour} />

<style>
	.editor {
		max-width: 1280px;
		margin: 0 auto;
		padding: 0 16px 2rem;
	}
	.bar {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
		padding: 1rem 0;
		border-bottom: 2px solid var(--line);
	}
	.flag img {
		width: 144px;
		height: auto;
		display: block;
	}
	.title {
		flex: 1;
		min-width: 12rem;
		font-family: var(--pixel);
		font-size: 0.9rem;
		color: var(--orange);
		background: transparent;
		border: 2px solid transparent;
		border-radius: 0;
		padding: 0.5rem;
	}
	.title:hover,
	.title:focus {
		border-color: var(--line);
		outline: none;
	}
	.by {
		color: var(--muted);
		font-size: 0.85rem;
	}

	.toolbar {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.75rem 1rem;
		padding: 1rem 0;
	}
	label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
		color: var(--muted);
	}
	select {
		font: inherit;
		color: var(--text);
		background: var(--navy-2);
		border: 2px solid var(--line);
		border-radius: 0;
		padding: 0.35rem 0.5rem;
	}
	.vol input {
		accent-color: var(--orange);
		width: 7rem;
	}
	.time {
		font-family: var(--retro);
		font-size: 1.3rem;
		color: var(--muted);
		min-width: 12ch;
	}
	.save {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.status {
		font-size: 0.85rem;
		color: var(--orange);
	}
	.btn:disabled {
		opacity: 0.6;
		cursor: wait;
	}

	.link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
		padding: 0.6rem 0.9rem;
		margin-bottom: 1rem;
		border: 2px solid var(--line);
		font-size: 0.9rem;
	}
	.link a {
		word-break: break-all;
	}

	.main {
		display: grid;
		grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
		gap: 1rem;
		min-height: 60vh;
	}
	.left {
		display: flex;
		flex-direction: column;
	}
	.right {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.error {
		margin: 0;
		padding: 0.6rem 0.8rem;
		border: 2px solid var(--orange);
		font-family: var(--retro);
		font-size: 1.2rem;
		color: var(--orange);
		word-break: break-word;
	}
	.scope {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.link-btn {
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		color: var(--orange);
		text-decoration: underline;
		cursor: pointer;
	}
	.help {
		margin: 0;
		font-size: 0.9rem;
		color: var(--muted);
	}

	@media (max-width: 800px) {
		.main {
			grid-template-columns: 1fr;
		}
		.save {
			margin-left: 0;
		}
	}
</style>
