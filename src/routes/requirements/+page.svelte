<script lang="ts">
	import SiteHeader from '#lib/components/layout/SiteHeader.svelte';
	import SiteFooter from '#lib/components/layout/SiteFooter.svelte';
</script>

<svelte:head>
	<title>requirements · bytebeat</title>
	<meta name="description" content="what your bytebeat track needs to get the reward." />
</svelte:head>

<SiteHeader>
	<a href="/guide" class="btn ghost">guide</a>
</SiteHeader>

<main class="wrap">
	<h1>requirements</h1>
	<p>to get the reward, your track needs to:</p>
	<ul class="plain">
		<li>be at least 30 seconds long, with drums, a melody and chords.</li>
		<li>be your own song, not a copy of the guide's or someone else's.</li>
		<li>be exported from the editor, so it has its own link.</li>
		<li>have your time recorded with <a href="https://lapse.hackclub.com">lapse</a>.</li>
		<li>
			come from someone verified on
			<a href="https://auth.hackclub.com" target="_blank" rel="noopener">hack club auth</a>.
		</li>
	</ul>
</main>

<SiteFooter />

<style>
	main {
		max-width: 760px;
		padding-top: 3rem;
	}
	h1 {
		font-size: clamp(1.6rem, 7vw, 3rem);
		color: var(--orange);
		margin-bottom: 1.5rem;
	}
	.plain {
		padding-left: 1.4rem;
	}
	.plain li {
		margin-bottom: 0.5rem;
	}
	.plain li::marker {
		color: var(--orange);
	}
</style>
