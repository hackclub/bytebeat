<script lang="ts">
	import { page } from '$app/state';
	import DemoEditor from '#lib/components/DemoEditor.svelte';
	import VolumeNotice from '#lib/components/VolumeNotice.svelte';
	import SiteHeader from '#lib/components/layout/SiteHeader.svelte';
	import SiteFooter from '#lib/components/layout/SiteFooter.svelte';

	let { data } = $props();
	const error = $derived(page.url.searchParams.get('error'));

	const HERO = 't*(t>>5|t>>8)';

</script>

<svelte:head>
	<title>bytebeat</title>
	<meta name="description" content="make music from one line of code. a hack club ysws." />
</svelte:head>

<SiteHeader flagHref="https://hackclub.com" flagAlt="Hack Club" big>
	{#if data.user}
		<form method="POST" action="/auth/logout" class="who">
			<a href="/account" class="me">
				{#if data.user.avatar}<img src={data.user.avatar} alt="" width="24" height="24" />{/if}
				<span>{data.user.username ?? data.user.firstName}</span>
			</a>
			<button class="link">log out</button>
		</form>
	{:else}
		<a href="/auth/login" class="btn ghost">log in</a>
	{/if}
</SiteHeader>

<main>
	<section class="wrap hero">
		<h1>bytebeat</h1>
		<p class="lede">
			bytebeat is music written as one line of code. ship a track to earn some tasty bites from
			<a href="https://hackclub.com">hack club</a>.
		</p>
		<p class="ctas">
			<a href="/editor" class="btn">open the editor</a>
			<a href="/guide" class="btn ghost">read the guide</a>
		</p>

		{#if error}
			<p class="notice">login failed ({error}). try again.</p>
		{/if}

		{#if data.user}
			{#if data.user.verificationStatus !== 'verified'}
				<p class="notice" role="alert">
					you can't get prizes until you're verified on
					<a href="https://auth.hackclub.com" target="_blank" rel="noopener">hack club auth</a>
					(it might take a day or two). log out and back in to refresh your status.
				</p>
			{/if}
			{#if data.user.hackatimeLinked}
				<div class="account">
					<span>
						hackatime linked{#if data.hackatimeHours !== null}: {data.hackatimeHours}h in the last 7
							days{/if}
					</span>
					<form method="POST" action="/auth/hackatime/disconnect">
						<button class="link">disconnect</button>
					</form>
				</div>
			{/if}
		{/if}
	</section>

	<section class="wrap split">
		<div>
			<h2>what even is bytebeat???</h2>
			<p>
				digital audio is actually just a list of numbers that tells the speaker where to move, usually thousands
				per second. in bytebeat, you'll write a formula that makes that list. the music player will count
				<code>t</code> up from 0, 8,000 times a second, and runs your formula each time. the result
				is cut down to a number from 0 to 255 which is played through your speakers.
			</p>
			<p>you'll be able to make these run in-browser, so there's nothing to install.</p>
		</div>
		<div>
			<h2>here's a demo track!</h2>
			<DemoEditor initial={HERO} />
		</div>
	</section>

	<section class="wrap big">
		<h2>you'll ship:</h2>
		<ol class="plain">
			<li>go through the <a href="/guide">guide</a> and make your first song.</li>
			<li>
				write a track in the <a href="/editor">bytebeat editor</a>. track your time with
				<a href="https://lapse.hackclub.com">lapse</a>.
			</li>
			<li><a href="/submit">submit</a> your track to get your reward.</li>
		</ol>
	</section>

	<section class="wrap big">
		<h2>we'll ship</h2>
		<div class="split">
			<div class="reward">
				<h3>a byte-sized snack</h3>
				<p>ship a track and we'll send you a $5 grant to grab a snack on us. a byte to eat!</p>
			</div>
			<div class="reqs">
				<h3>requirements</h3>
				<ul class="plain">
					<li>be at least 30 seconds long, with drums, a melody and chords.</li>
					<li>be your own song, not a copy of the guide's or someone else's.</li>
					<li>be exported from the editor, so it has its own link.</li>
					<li>
						have your time recorded with <a href="https://lapse.hackclub.com">lapse</a>.
					</li>
					<li>
						come from someone verified on
						<a href="https://auth.hackclub.com" target="_blank" rel="noopener">hack club auth</a>.
					</li>
				</ul>
			</div>
		</div>
		<p>read more on the <a href="/requirements">requirements page</a>.</p>
	</section>

	<section class="wrap">
		<h2>running a club?</h2>
		<p>
			club leaders will be able to get a workshop link, so members can log in and make a track
			during a meeting. this is coming soon.
		</p>
	</section>
</main>

<VolumeNotice />

<SiteFooter
	links={[
		{ href: 'https://hackclub.com', label: 'hack club' },
		{ href: 'https://forms.hackclub.com/bounty', label: 'fulfillment bounty' },
		{ href: 'https://hackclub.com/privacy-and-terms', label: 'privacy & terms' }
	]}
/>

<style>
	.who {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin: 0;
		font-size: 0.9rem;
	}
	.me {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		color: inherit;
		text-decoration: none;
	}
	.me:hover span {
		color: var(--orange);
	}
	.who img {
		image-rendering: pixelated;
		border: 2px solid var(--line);
	}
	.link {
		background: none;
		border: 0;
		padding: 0;
		color: var(--orange);
		font: inherit;
		text-decoration: underline;
		cursor: pointer;
	}

	section {
		padding-top: 3.5rem;
	}

	.split {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2.5rem;
		align-items: start;
	}
	h2 {
		font-size: 1rem;
		margin-bottom: 1.2rem;
		display: flex;
		align-items: center;
		gap: 0.8rem;
	}
	h2::before {
		content: '';
		width: 0.6rem;
		height: 0.6rem;
		background: var(--orange);
		flex: none;
	}
	p {
		max-width: 62ch;
	}
	.ctas {
		display: flex;
		gap: 0.8rem;
		flex-wrap: wrap;
	}

	.hero {
		padding-top: 4rem;
	}
	h1 {
		font-size: clamp(2rem, 9vw, 4.5rem);
		color: var(--orange);
		letter-spacing: -0.02em;
	}
	.lede {
		font-size: 1.1rem;
		margin: 1.5rem 0 2rem;
	}


	.notice {
		border: 2px solid var(--orange);
		padding: 0.8rem 1rem;
	}
	.account {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.account form {
		margin: 0;
	}

	/* "you'll ship" and "we'll ship": larger than the other sections */
	.big h2 {
		font-size: 1.5rem;
	}
	.big h2::before {
		width: 0.9rem;
		height: 0.9rem;
	}
	.big p,
	.big li {
		font-size: 1.15rem;
	}
	.big .reward h3,
	.reqs h3 {
		font-size: 1rem;
	}
	.reqs h3 {
		color: var(--orange);
		margin-bottom: 0.8rem;
	}

	.reward {
		max-width: 62ch;
		margin-bottom: 1.5rem;
		padding: 1rem 1.2rem;
		border: 2px solid var(--orange);
		background: var(--navy-2);
	}
	.reward h3 {
		color: var(--orange);
		font-size: 0.8rem;
		margin-bottom: 0.6rem;
	}
	.reward p {
		margin: 0;
	}
	.plain {
		padding-left: 1.4rem;
		max-width: 62ch;
	}
	.plain li {
		margin-bottom: 0.5rem;
	}
	.plain li::marker {
		color: var(--orange);
		font-family: var(--pixel);
		font-size: 0.7rem;
	}
</style>
