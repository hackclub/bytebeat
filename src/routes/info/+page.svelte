<script lang="ts">
	import SiteHeader from '#lib/components/layout/SiteHeader.svelte';
	import SiteFooter from '#lib/components/layout/SiteFooter.svelte';

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
			title: "arduino",
			img: "/images/history/arduino.jpg",
			contain: true,
			alt: "an arduino uno board",
			text: "in october 2011, people on the arduino forum ported the formulas to arduino boards.",
			link: "see the thread",
			href: "https://forum.arduino.cc/t/one-line-algorithmic-music/73409"
		}
	];
</script>

<svelte:head>
	<title>info · bytebeat</title>
	<meta name="description" content="where bytebeat came from and where it's been used." />
</svelte:head>

<SiteHeader>
	<a href="/guide" class="btn ghost">guide</a>
</SiteHeader>

<main class="wrap">
	<h1>where it's been used</h1>
	<div class="split">
		<p>
			bytebeat started in september 2011, when viznut posted a video called "experimental music
			from very short c programs" and wrote about it on his blog,
			<a href="http://countercomplex.blogspot.com">countercomplex</a>. people started sharing their
			own formulas, and the name "bytebeat" came out of that. later that year he wrote
			<a href="https://arxiv.org/abs/1112.1368">a paper</a> about it.
		</p>
		<p>
			while bytebeat sounds a lot like chiptune (the music from consoles like the nes and game boy),
			it actually works differently. those consoles have sound chips with a few fixed channels (pulse
			waves, noise and so on), and the game tells each channel which note to play. bytebeat instead	
			calculates every sample itself, so one formula is the whole sound.
		</p>
	</div>
	<p>here's some examples of people using bytebeat:</p>
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
</main>

<SiteFooter />

<style>
	main {
		padding-top: 3rem;
	}
	h1 {
		font-size: clamp(1.4rem, 6vw, 2.5rem);
		color: var(--orange);
		margin-bottom: 1.5rem;
	}
	p {
		max-width: 62ch;
	}
	/* two columns side by side; stacks on narrow screens */
	.split {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2.5rem;
		align-items: start;
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
</style>
