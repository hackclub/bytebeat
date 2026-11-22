<script lang="ts">
	import type { Snippet } from 'svelte';

	// top bar shared by the home, guide and references pages.
	// the flag sits on the left; whatever you pass as children goes on the right.
	let {
		flagHref = '/',
		flagAlt = 'bytebeat home',
		big = false,
		children
	}: {
		flagHref?: string;
		flagAlt?: string;
		big?: boolean;
		children?: Snippet;
	} = $props();
</script>

<header class="wrap bar">
	<a href={flagHref} class="flag" class:big>
		<img src="/flag-8bit.svg" alt={flagAlt} width="96" height="34" />
	</a>
	{@render children?.()}
</header>

<style>
	.bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding-top: 1rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid var(--line);
	}
	.flag {
		display: block;
		line-height: 0;
	}
	.flag img {
		width: 144px;
		height: auto;
		image-rendering: pixelated;
	}
	.flag.big img {
		width: 192px;
	}
</style>
