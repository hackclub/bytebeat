<script lang="ts">
	import { track } from '#lib/track.svelte.ts';
	import TrackPicker from '#lib/components/TrackPicker.svelte';
	import SiteHeader from '#lib/components/layout/SiteHeader.svelte';
	import SiteFooter from '#lib/components/layout/SiteFooter.svelte';
</script>

<svelte:head>
	<title>submit · bytebeat</title>
</svelte:head>

<SiteHeader>
	<a href="/editor" class="btn ghost">editor</a>
</SiteHeader>

<main class="wrap">
	<h1>submit</h1>
	<TrackPicker question="are you submitting on your own or with your club?" />

	{#if track.value === 'club'}
		<section>
			<h2>submitting with your club</h2>
			<p>
				club tracks are submitted by your club leader. go to
				<a href="https://clubs.hackclub.com" target="_blank" rel="noopener">clubs.hackclub.com</a>,
				find your club, and send your export link to your club leader so they can submit it.
			</p>
		</section>
	{:else if track.value === 'individual'}
		<section>
			<h2>submitting on your own</h2>
			<p>
				individual submissions aren't open yet. keep your export link and your
				<a href="https://lapse.hackclub.com" target="_blank" rel="noopener">lapse</a> recording
				safe, you'll need both.
			</p>
		</section>
	{/if}
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
		margin-bottom: 1rem;
	}
	h2 {
		font-size: 1rem;
		margin-bottom: 1rem;
	}
	section {
		padding-top: 1rem;
	}
</style>
