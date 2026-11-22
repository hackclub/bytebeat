<script lang="ts">
	import { onMount, tick } from 'svelte';

	const KEY = 'bytebeat:onboarded';

	type Step = { target: string; title: string; body: string };

	const steps: Step[] = [
		{
			target: 'code',
			title: 'your editor',
			body: "this is where your code lives! your song runs what's written here from top to bottom, and the last line is what you hear."
		},
		{
			target: 'play',
			title: 'play and restart',
			body: 'play runs your formula. edits apply while it plays. restart sets t back to 0 so the song starts over. ctrl + enter also plays and pauses.'
		},
		{
			target: 'settings',
			title: 'mode and rate',
			body: 'mode changes how the result becomes sound. classic is the normal one. rate is how many times a second t goes up. higher rates make every note higher.'
		},
		{
			target: 'volume',
			title: 'volume',
			body: 'bytebeat is loud. start low and turn it up.'
		},
		{
			target: 'time',
			title: 'time',
			body: 't is the current value of t. the seconds next to it are how far into the song you are.'
		},
		{
			target: 'scope',
			title: 'the graph',
			body: 'this draws the wave as it plays, so you can see what your formula does. if the code has a mistake, the error shows up under it.'
		},
		{
			target: 'title',
			title: 'name it',
			body: 'click the title to rename your song.'
		},
		{
			target: 'save',
			title: 'save and share',
			body: 'log in to save your song. once saved you get a link you can send to anyone. ctrl + s saves too.'
		}
	];

	let open = $state(false);
	let i = $state(0);
	let rect = $state<{ top: number; left: number; width: number; height: number } | null>(null);
	let card = $state<HTMLElement>();
	let cardH = $state(0);
	let vw = $state(0);
	let vh = $state(0);

	const step = $derived(steps[i]);
	const PAD = 6;
	const GAP = 12;
	const CARD_W = 340;

	const cardPos = $derived.by(() => {
		const width = Math.min(CARD_W, vw - 32);
		if (!rect) return { top: vh / 2 - cardH / 2, left: (vw - width) / 2, width };
		const below = rect.top + rect.height + PAD + GAP;
		const above = rect.top - PAD - GAP - cardH;
		let top = below + cardH <= vh - 16 || above < 16 ? below : above;
		top = Math.max(16, Math.min(top, vh - cardH - 16));
		const left = Math.max(16, Math.min(rect.left, vw - width - 16));
		return { top, left, width };
	});

	function targets() {
		return [...document.querySelectorAll<HTMLElement>(`[data-tour="${step.target}"]`)].filter(
			(el) => el.offsetParent !== null
		);
	}

	function measure() {
		vw = innerWidth;
		vh = innerHeight;
		const els = targets();
		if (!els.length) return (rect = null);
		const rs = els.map((el) => el.getBoundingClientRect());
		const top = Math.min(...rs.map((r) => r.top));
		const left = Math.min(...rs.map((r) => r.left));
		const bottom = Math.max(...rs.map((r) => r.bottom));
		const right = Math.max(...rs.map((r) => r.right));
		rect = { top, left, width: right - left, height: bottom - top };
	}

	async function go(n: number) {
		i = n;
		await tick();
		targets()[0]?.scrollIntoView({ block: 'center', behavior: 'instant' });
		measure();
		card?.focus();
	}

	function finish() {
		open = false;
		try {
			localStorage.setItem(KEY, '1');
		} catch {}
	}

	function next() {
		if (i < steps.length - 1) go(i + 1);
		else finish();
	}

	function back() {
		if (i > 0) go(i - 1);
	}

	function onKey(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') finish();
		else if (e.key === 'ArrowRight') next();
		else if (e.key === 'ArrowLeft') back();
	}

	export function start() {
		open = true;
		go(0);
	}

	onMount(() => {
		let seen = false;
		try {
			seen = localStorage.getItem(KEY) === '1';
		} catch {}
		if (!seen) start();

		const update = () => open && measure();
		addEventListener('resize', update);
		addEventListener('scroll', update, true);
		return () => {
			removeEventListener('resize', update);
			removeEventListener('scroll', update, true);
		};
	});
</script>

<svelte:window onkeydown={onKey} />

{#if open}
	<div class="shade" class:full={!rect} aria-hidden="true"></div>
	{#if rect}
		<div
			class="spot"
			aria-hidden="true"
			style:top="{rect.top - PAD}px"
			style:left="{rect.left - PAD}px"
			style:width="{rect.width + PAD * 2}px"
			style:height="{rect.height + PAD * 2}px"
		></div>
	{/if}
	<div
		class="card"
		role="dialog"
		aria-modal="true"
		aria-labelledby="tour-title"
		tabindex="-1"
		bind:this={card}
		bind:clientHeight={cardH}
		style:top="{cardPos.top}px"
		style:left="{cardPos.left}px"
		style:width="{cardPos.width}px"
	>
		<p class="count">{i + 1} / {steps.length}</p>
		<h2 id="tour-title">{step.title}</h2>
		<p class="body">{step.body}</p>
		<div class="row">
			{#if i > 0}<button class="btn ghost" onclick={back}>back</button>{/if}
			<button class="btn" onclick={next}>{i < steps.length - 1 ? 'next' : 'done'}</button>
		</div>
	</div>
	<button class="btn ghost skip" onclick={finish}>skip tutorial</button>
{/if}

<style>
	.shade {
		position: fixed;
		inset: 0;
		z-index: 50;
	}
	.shade.full {
		background: rgb(5 12 26 / 0.75);
	}
	.spot {
		position: fixed;
		z-index: 51;
		border: 2px dashed var(--orange);
		box-shadow: 0 0 0 9999px rgb(5 12 26 / 0.75);
		pointer-events: none;
		transition:
			top 0.2s,
			left 0.2s,
			width 0.2s,
			height 0.2s;
	}
	.card {
		position: fixed;
		z-index: 52;
		padding: 1rem;
		background: var(--navy-2);
		border: 2px solid var(--orange);
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		outline: none;
	}
	.count {
		margin: 0;
		font-family: var(--retro);
		font-size: 1.1rem;
		color: var(--muted);
	}
	h2 {
		font-size: 0.75rem;
		color: var(--orange);
	}
	.body {
		margin: 0;
		font-size: 0.9rem;
	}
	.row {
		display: flex;
		gap: 0.6rem;
		align-items: center;
		justify-content: flex-end;
		margin-top: 0.4rem;
	}
	.skip {
		position: fixed;
		z-index: 53;
		right: 16px;
		top: 50%;
		transform: translateY(-50%);
		background: var(--navy);
	}
	@media (prefers-reduced-motion: reduce) {
		.spot {
			transition: none;
		}
	}
</style>
