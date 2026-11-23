<script lang="ts">
	import { page } from '$app/state';
	import { player } from '#lib/bytebeat.svelte.ts';
	import DemoEditor from '#lib/components/DemoEditor.svelte';
	import VolumeNotice from '#lib/components/VolumeNotice.svelte';
	import SiteHeader from '#lib/components/layout/SiteHeader.svelte';
	import SiteFooter from '#lib/components/layout/SiteFooter.svelte';

	let { data } = $props();
	const error = $derived(page.url.searchParams.get('error'));

	const HERO = 't*(t>>5|t>>8)';

	const steps = [
		{
			title: 'sound',
			code: 't',
			text: 't counts up to 255, then wraps back to 0. that repeating ramp is a sawtooth wave, which sounds like a low buzz.'
		},
		{
			title: 'pitch',
			code: 't*4',
			text: 'multiplying t makes the ramp wrap 4 times as often, so the note is higher.'
		},
		{
			title: 'rhythm',
			code: 't*4*(t>>11&1)',
			text: 't>>11&1 switches between 0 and 1 every quarter second. multiplying by 0 mutes the sound, so it turns on and off.'
		},
		{
			title: 'melody',
			code: 't*[4,5,6,8][t>>12&3]',
			text: 't>>12&3 steps through 0, 1, 2, 3 (one step about every half second) and picks a multiplier from the list, so the note changes.'
		},
		{
			title: 'chords',
			code: '((t*4&255)+(t*6&255))/2',
			text: 'adding two waves plays both notes at the same time. dividing by 2 keeps the result in range.'
		},
		{
			title: 'combine',
			code: 't*(t>>5|t>>8)',
			text: 'two slow counters joined with | (bitwise or) change the pitch in a pattern that repeats, which you hear as a melody.'
		}
	];
	const history = [
		{
			title: "2011: the first video",
			img: "/images/history/viznut.jpg",
			alt: "a bytebeat formula in pixel text from viznut's video",
			text: "viznut's video that started it, with formulas sent in by other people.",
			link: "watch on youtube",
			href: "https://www.youtube.com/watch?v=GtQdIYUtAHg"
		},
		{
			title: "no man's sky",
			img: "/images/history/nms.jpg",
			alt: "a player standing next to bytebeat devices on a red planet in no man's sky",
			text: "hello games added a bytebeat device to the game in its beyond update (2019). players use it to make their own music, or have it generate random presets.",
			link: "read the update",
			href: "https://www.nomanssky.com/2019/12/beyond-development-update-5-bytebeat/"
		},
		{
			title: "demoscene",
			img: "/images/history/hellmood.jpg",
			alt: "green symbols falling on a black screen",
			text: "hellmood made a 16-byte ms-dos program that plays a bytebeat-style tune through the pc speaker.",
			link: "read the article",
			href: "https://gizmodo.com/this-matrix-inspired-program-only-needs-16-bytes-to-produce-a-chiptune-banger-2000762683"
		},
		{
			title: "arduino",
			img: "/images/history/arduino.jpg",
			contain: true,
			alt: "an arduino uno board",
			text: "in october 2011, people on the arduino forum ported the formulas to arduino boards.",
			link: "see the thread",
			href: "https://forum.arduino.cc/t/one-line-algorithmic-music/73409"
		},
		{
			title: "game boy",
			img: "/images/history/gameboy.jpg",
			contain: true,
			alt: "an original game boy",
			text: "there's a guide to building a game boy rom that plays bytebeat, using gbdk.",
			link: "read the guide",
			href: "https://moddingfridays.bleu255.com/Simple_Bytebeat_GB_ROM"
		},
		{
			title: "synths",
			img: "/images/history/bt110.jpg",
			alt: "two dod circuits bt-110 synths on a desk",
			text: "the dod circuits bt-110 is a portable synth built on bytebeat. eurorack modules like maneco labs' grone voice use it as an oscillator too.",
			link: "read about the bt-110",
			href: "https://synthanatomy.com/2024/04/dod-circuits-bt-110.html"
		}
	];
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
			bytebeat is music written as one line of code. ship a track to earn music gear from hack
			club.
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
			<div class="account">
				{#if data.user.hackatimeLinked}
					<span>
						hackatime linked{#if data.hackatimeHours !== null}: {data.hackatimeHours}h in the last 7
							days{/if}
					</span>
					<form method="POST" action="/auth/hackatime/disconnect">
						<button class="link">disconnect</button>
					</form>
				{:else}
					<span>link hackatime so your time counts.</span>
					<a href="/auth/hackatime" class="btn">connect hackatime</a>
				{/if}
			</div>
		{:else}
			<a href="/auth/login" class="btn">log in with hack club</a>
		{/if}
	</section>

	<section class="wrap">
		<h2>try it</h2>
		<p class="muted">edit the formula and press play. changes apply while it plays.</p>
		<DemoEditor initial={HERO} />
		<p class="ctas">
			<a href="/editor" class="btn">open the full editor</a>
			<a href="/guide" class="btn ghost">read the guide</a>
		</p>
	</section>

	<section class="wrap">
		<h2>what is bytebeat?</h2>
		<p>
			digital audio is a list of numbers that tells the speaker where to move, usually thousands
			per second. in bytebeat you write a formula that makes that list. the player counts
			<code>t</code> up from 0, 8,000 times a second, and runs your formula each time. the result is
			cut down to a number from 0 to 255, and that number is the next sample.
		</p>
		<p>it runs in the browser, so there's nothing to install.</p>
	</section>

	<section class="wrap">
		<h2>the basics</h2>
		<p class="muted">each step adds one idea to the step before it. press play to hear it.</p>
		<ol class="steps">
			{#each steps as step, i (step.title)}
				<li class:on={player.playing && player.source === step.title}>
					<div class="step-head">
						<span class="num">{String(i + 1).padStart(2, '0')}</span>
						<h3>{step.title}</h3>
					</div>
					<code class="formula">{step.code}</code>
					<p>{step.text}</p>
					<button class="btn ghost" onclick={() => player.toggle(step.title, step.code)}>
						{player.playing && player.source === step.title ? '■ stop' : '▶ play'}
					</button>
				</li>
			{/each}
		</ol>
	</section>

	<section class="wrap">
		<h2>where it's been used</h2>
		<p>
			bytebeat started in september 2011, when viznut posted a video called "experimental music
			from very short c programs" and wrote about it on his blog,
			<a href="http://countercomplex.blogspot.com">countercomplex</a>. people started sharing their
			own formulas, and the name "bytebeat" came out of that. later that year he wrote
			<a href="https://arxiv.org/abs/1112.1368">a paper</a> about it.
		</p>
		<ul class="history">
			{#each history as item (item.title)}
				<li>
					<a href={item.href} class="shot">
						<img
							src={item.img}
							alt={item.alt}
							class:contain={item.contain}
							loading="lazy"
							width="640"
							height="360"
						/>
					</a>
					<h3>{item.title}</h3>
					<p>{item.text} <a href={item.href}>{item.link}</a></p>
				</li>
			{/each}
		</ul>
		<p>
			bytebeat sounds a lot like chiptune, the music from consoles like the nes and game boy, but
			it works differently. those consoles have sound chips with a few fixed channels (pulse
			waves, noise and so on), and the game tells each channel which note to play. bytebeat
			calculates every sample itself, so one formula is the whole sound.
		</p>
	</section>

	<section class="wrap">
		<h2>how it works</h2>
		<ol class="plain">
			<li>go through the <a href="/guide">guide</a> and make your first song.</li>
			<li>
				write a track in the <a href="/editor">bytebeat editor</a>. track your time with
				<a href="https://lapse.hackclub.com">lapse</a>.
			</li>
			<li>ship the track to earn prizes. the prize list isn't out yet.</li>
		</ol>
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
	.muted {
		color: var(--muted);
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

	.history {
		list-style: none;
		padding: 0;
		margin: 1.5rem 0 0.75rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 1rem;
	}
	.history li {
		background: var(--navy-2);
		border: 2px solid var(--line);
		display: flex;
		flex-direction: column;
	}
	.shot {
		display: block;
		line-height: 0;
		border-bottom: 2px solid var(--line);
	}
	.shot img {
		width: 100%;
		height: auto;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		background: #fff;
	}
	.shot img.contain {
		object-fit: contain;
	}
	.history h3 {
		font-size: 0.75rem;
		color: var(--orange);
		margin: 1rem 1rem 0;
	}
	.history p {
		margin: 0.6rem 1rem 1rem;
		font-size: 0.95rem;
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

	.steps {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 1rem;
	}
	.steps li {
		background: var(--navy-2);
		border: 2px solid var(--line);
		padding: 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}
	.steps li.on {
		border-color: var(--orange);
	}
	.steps p {
		margin: 0;
		flex: 1;
		font-size: 0.95rem;
	}
	.steps .btn {
		align-self: flex-start;
	}
	.step-head {
		display: flex;
		align-items: baseline;
		gap: 0.8rem;
	}
	.num {
		font-family: var(--pixel);
		font-size: 0.65rem;
		color: var(--muted);
	}
	h3 {
		font-size: 0.85rem;
	}
	.formula {
		display: block;
		background: var(--navy);
		border: 2px solid var(--line);
		padding: 0.5rem 0.7rem;
		overflow-x: auto;
		white-space: nowrap;
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
