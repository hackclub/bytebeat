<script lang="ts">
	import { RATE, compile, player } from '#lib/bytebeat.svelte.ts';

	let { formula }: { formula: string } = $props();

	const W = 256;
	const H = 96;
	const STEP = 32;
	const DOTS = 8;

	const BG = 0xff30170a;
	const MID = 0xff784329;
	const DIM = 0xff94603d;
	const HOT = 0xff1a7aff;

	let canvas: HTMLCanvasElement;
	let tNow = $state<number | null>(null);

	$effect(() => {
		let preview: (t: number) => number;
		try {
			preview = compile(formula);
		} catch {
			preview = () => 128;
		}
		const g = canvas.getContext('2d')!;
		const img = g.createImageData(W, H);
		const px = new Uint32Array(img.data.buffer);
		let raf = 0;

		const draw = () => {
			px.fill(BG);
			for (let x = 0; x < W; x += 4) px[(H / 2) * W + x] = px[(H / 2) * W + x + 1] = MID;

			const t = player.t;
			tNow = t;
			const start = t === null ? 0 : t - W * STEP;
			const color = t === null ? DIM : HOT;
			const sample = t === null ? (n: number) => preview(n) & 255 : (n: number) => player.sample(n);

			for (let x = 0; x < W; x++) {
				const base = start + x * STEP;
				if (base < 0) continue;
				for (let k = 0; k < DOTS; k++) {
					const v = sample(base + k * (STEP / DOTS));
					const y = H - 1 - ((v * H) >> 8);
					px[y * W + x] = color;
				}
			}
			g.putImageData(img, 0, 0);
			raf = requestAnimationFrame(draw);
		};
		draw();
		return () => cancelAnimationFrame(raf);
	});
</script>

<canvas bind:this={canvas} width={W} height={H} aria-hidden="true"></canvas>
<div class="readout" aria-hidden="true">
	<span>t = {String(tNow ?? 0).padStart(6, '0')}</span>
	<span>
		{#if tNow === null}stopped{:else if player.playing}{(tNow / RATE).toFixed(2)}s{:else}paused at
			{(tNow / RATE).toFixed(2)}s{/if}
	</span>
</div>

<style>
	canvas {
		display: block;
		width: 100%;
		aspect-ratio: 256 / 96;
		image-rendering: pixelated;
		border: 2px solid var(--line);
	}
	.readout {
		display: flex;
		justify-content: space-between;
		margin-top: 0.4rem;
		font-family: var(--retro);
		font-size: 1.25rem;
		line-height: 1;
		color: var(--muted);
	}
</style>
