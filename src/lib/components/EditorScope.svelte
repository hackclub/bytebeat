<script lang="ts">
	import { SCOPE_SIZE, type Engine } from '#lib/bytebeat/engine.svelte.ts';

	let { engine }: { engine: Engine | null } = $props();

	const W = 256;
	const H = 96;
	const PER_COL = SCOPE_SIZE / W;
	const DOTS = 8;
	const BG = 0xff30170a;
	const MID = 0xff784329;
	const HOT = 0xff1a7aff;

	let canvas: HTMLCanvasElement;

	$effect(() => {
		const g = canvas.getContext('2d')!;
		const img = g.createImageData(W, H);
		const px = new Uint32Array(img.data.buffer);
		const midline = () => {
			for (let x = 0; x < W; x += 4) px[(H / 2) * W + x] = px[(H / 2) * W + x + 1] = MID;
		};

		if (!engine) {
			px.fill(BG);
			midline();
			g.putImageData(img, 0, 0);
			return;
		}

		let raf = 0;
		let drawn = -1;

		const draw = () => {
			if (engine.scopeVersion !== drawn) {
				drawn = engine.scopeVersion;
				px.fill(BG);
				midline();
				const start = engine.scopeWrite;
				for (let x = 0; x < W; x++) {
					for (let k = 0; k < DOTS; k++) {
						const i = (start + x * PER_COL + k * (PER_COL / DOTS)) % SCOPE_SIZE;
						const v = engine.scope[i];
						const y = Math.min(H - 1, Math.max(0, Math.round(((1 - v) / 2) * (H - 1))));
						px[y * W + x] = HOT;
					}
				}
				g.putImageData(img, 0, 0);
			}
			raf = requestAnimationFrame(draw);
		};
		raf = requestAnimationFrame(draw);
		return () => cancelAnimationFrame(raf);
	});
</script>

<canvas bind:this={canvas} width={W} height={H} aria-hidden="true"></canvas>

<style>
	canvas {
		display: block;
		width: 100%;
		aspect-ratio: 256 / 96;
		image-rendering: pixelated;
		border: 2px solid var(--line);
	}
</style>
