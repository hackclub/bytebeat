<script lang="ts">
	import { onDestroy } from 'svelte';
	import { GuidePlayer } from '#lib/bytebeat/guide.svelte.ts';
	import Example from '#lib/components/Example.svelte';
	import VolumeNotice from '#lib/components/VolumeNotice.svelte';
	import SiteHeader from '#lib/components/layout/SiteHeader.svelte';
	import SiteFooter from '#lib/components/layout/SiteFooter.svelte';

	const gp = new GuidePlayer();
	onDestroy(() => gp.destroy());

	const operators = [
		['t', 'the sample counter. goes up by 1, 8000 times a second.'],
		['+  -  *  /', 'normal math. + also mixes two sounds together.'],
		['%', 'remainder. t % 256 does the same wrap bytebeat does anyway.'],
		['&', 'bitwise and. keeps only the bits both sides share. & 128 makes a square wave.'],
		['|', 'bitwise or. keeps bits from either side. gives a crunchy, glitchy mix.'],
		['^', 'bitwise xor. keeps bits that are on in only one side.'],
		['>>', 'shift right. >> 1 halves, >> 2 quarters, and so on. used for slow counters.'],
		['<<', 'shift left. << 1 doubles.'],
		['~', 'flips every bit. ~t counts down instead of up.'],
		['a > b', 'comparison. gives 1 if true, 0 if false.'],
		['[a, b, c][i]', 'array. picks the item at position i (starting at 0).']
	];

	const timing = [
		['t >> 10', '~0.13 s', 'fast notes'],
		['t >> 11', '~0.26 s', 'one beat'],
		['t >> 12', '~0.5 s', 'a melody note'],
		['t >> 13', '~1 s', 'a bar'],
		['t >> 14', '~2 s', 'a chord'],
		['t >> 16', '~8 s', 'a song section']
	]; 

	const snippets = [
		{ id: 'r-saw', title: 'sawtooth', code: 't * 4' },
		{ id: 'r-square', title: 'square', code: 't * 4 & 128' },
		{ id: 'r-tri', title: 'triangle', code: '(t * 4 & 255) ^ (t * 4 & 128 ? 255 : 0)' },
		{ id: 'r-sine', title: 'sine', code: '128 + 127 * sin(t * 4 * PI / 128)' },
		{ id: 'r-noise', title: 'noise', code: 'random() * 64' },
		{ id: 'r-kick', title: 'kick drum', code: '(t * 2 & 64) * (~t >> 6 & 63) >> 6' },
		{
			id: 'r-pattern',
			title: 'beat pattern',
			code: 'pattern = 0b10110101\nhit = pattern >> (t >> 11 & 7) & 1\n\nhit * (t * 8 & 128)'
		}
	];

	const links = [
		{
			href: 'http://countercomplex.blogspot.com/2011/10/algorithmic-symphonies-from-one-line-of.html',
			name: 'algorithmic symphonies from one line of code',
			text: "viznut's 2011 blog post that started bytebeat. explains how and why it works."
		},
		{
			href: 'https://arxiv.org/abs/1112.1368',
			name: 'discovering novel computer music techniques',
			text: 'the follow-up paper by viznut. goes deeper into why these formulas sound like music.'
		},
		{
			href: 'https://dollchan.net/bytebeat/',
			name: 'bytebeat composer',
			text: 'another online editor with a big library of songs other people made. good for ideas.'
		},
		{
			href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_AND',
			name: 'mdn: bitwise and (&)',
			text: 'how & works on bits, with examples.'
		},
		{
			href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Right_shift',
			name: 'mdn: right shift (>>)',
			text: 'how >> works on bits, with examples.'
		}
	];
</script>

<svelte:head>
	<title>references · bytebeat</title>
	<meta name="description" content="bytebeat cheat sheet, handy snippets and links to learn more." />
</svelte:head>

<SiteHeader>
	<nav class="top">
		<a href="/guide" class="btn ghost">guide</a>
		<a href="/editor" class="btn ghost">editor</a>
	</nav>
</SiteHeader>

<main class="wrap">
	<section class="intro">
		<h1>references</h1>
		<p>
			a cheat sheet for when you're writing your own songs. new to bytebeat? start with the
			<a href="/guide">guide</a> first.
		</p>
	</section>

	<section id="links">
		<h2>learn more</h2>
		<p>
			this page is only a short compilation. there's a lot more out there about bytebeat, so go
			do some research of your own! these are good places to start:
		</p>
		<ul class="links">
			{#each links as l (l.href)}
				<li>
					<a href={l.href} target="_blank" rel="noopener">{l.name}</a>
					<span class="muted">{l.text}</span>
				</li>
			{/each}
		</ul>
	</section>

	<section id="operators">
		<h2>operators</h2>
		<table>
			<tbody>
				{#each operators as [op, what] (op)}
					<tr><td><code>{op}</code></td><td>{what}</td></tr>
				{/each}
			</tbody>
		</table>
		<p>operators run in this order, from first to last:</p>
		<ol class="plain">
			<li><code>*</code> <code>/</code> <code>%</code></li>
			<li><code>+</code> <code>-</code></li>
			<li><code>&gt;&gt;</code> <code>&lt;&lt;</code></li>
			<li><code>&gt;</code> <code>&lt;</code></li>
			<li><code>&amp;</code></li>
			<li><code>^</code></li>
			<li><code>|</code></li>
		</ol>
		<p class="muted">if you're unsure, add brackets.</p>
	</section>

	<section id="timing">
		<h2>timing</h2>
		<p>at 8000 samples a second, each shift doubles how long a step lasts:</p>
		<table>
			<thead><tr><th>counter</th><th>one step</th><th>good for</th></tr></thead>
			<tbody>
				{#each timing as [c, len, use] (c)}
					<tr><td><code>{c}</code></td><td>{len}</td><td>{use}</td></tr>
				{/each}
			</tbody>
		</table>
		<p class="muted">add <code>&amp; 3</code>, <code>&amp; 7</code> or <code>&amp; 15</code> to make the counter loop over 4, 8 or 16 steps.</p>
	</section>

	<section id="snippets">
		<h2>snippets</h2>
		<p>building blocks you can copy into your song.</p>
		{#each snippets as s (s.id)}
			<Example {gp} id={s.id} code={s.code} title={s.title} />
		{/each}
	</section>

	<section id="tips">
		<h2>things to know</h2>
		<ul class="plain">
			<li>the output wraps at 256, so keep the parts you add together small.</li>
			<li>a line that starts with <code>(</code> or <code>[</code> joins onto the line above. end the line above with <code>;</code>.</li>
			<li>math functions work without <code>Math.</code>, like <code>sin(t)</code>, <code>random()</code> or <code>PI</code>.</li>
			<li>doubling a number moves a note up one octave. 4 : 5 : 6 is a major chord.</li>
		</ul>
	</section>
</main>

<VolumeNotice />

<SiteFooter />

<style>
	.top {
		display: flex;
		gap: 0.6rem;
	}
	main {
		max-width: 760px;
	}
	section {
		padding-top: 3rem;
	}
	h1 {
		font-size: clamp(1.6rem, 7vw, 3rem);
		color: var(--orange);
		margin-bottom: 1.5rem;
	}
	h2 {
		font-size: 1.4rem;
		margin-bottom: 1.2rem;
	}
	.muted {
		color: var(--muted); 
		font-size: 0.9rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.95rem;
	}
	th,
	td {
		text-align: left;
		vertical-align: top;
		padding: 0.5rem 0.8rem 0.5rem 0;
		border-bottom: 1px solid var(--line);
	}
	th {
		color: var(--muted);
		font-weight: 400;
	}
	td:first-child {
		white-space: nowrap;
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

	.links {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.links li {
		display: flex;
		flex-direction: column;
	}
</style>
