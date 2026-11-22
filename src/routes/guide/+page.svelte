<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { GuidePlayer } from '#lib/bytebeat/guide.svelte.ts';
	import Example from '#lib/components/Example.svelte';
	import VolumeNotice from '#lib/components/VolumeNotice.svelte';

	const gp = new GuidePlayer();
	onDestroy(() => gp.destroy());

	let current = $state<string | null>(null);
	onMount(() => {
		const els = sections
			.map(([id]) => document.getElementById(id))
			.filter((el): el is HTMLElement => el !== null);
		const update = () => {
			let found: string | null = null;
			for (const el of els) if (el.getBoundingClientRect().top <= innerHeight * 0.3) found = el.id;
			current = found;
		};
		update();
		addEventListener('scroll', update, { passive: true });
		return () => removeEventListener('scroll', update);
	});

	const KICK = `kick = (t * 2 & 64) * (~t >> 6 & 63) >> 6
hat = random() * (~t >> 7 & 15)`;
	const LEAD = `scale = [24, 27, 30, 32, 36, 40, 45, 48]
tune = [0, 2, 4, 7, 4, 2, 5, 4]
lead = t * scale[tune[t >> 12 & 7]] >> 2 & 64`;
	const CHORD = `root = [24, 32, 24, 36][t >> 14 & 3]
chord = (t * root >> 3 & 31) + (t * root * 5 >> 5 & 31) + (t * root * 3 >> 4 & 31)`;

	const p = {
		pitch: 't * 6 & 64',
		rhythm: `${KICK}\n\nkick + hat`,
		melody: `${LEAD}\n\n${KICK}\n\nlead + kick + hat`,
		chords: `${LEAD}\n\n${CHORD}\n\n${KICK}\n\nlead + chord + kick + hat`,
		combine: `${LEAD}\n\n${CHORD}\n\n${KICK}\n\nlead * (t >> 16 > 0) + chord + kick + hat`
	};

	const SAW = (() => {
		const w = 640,
			h = 200,
			x0 = 40,
			y0 = 10,
			y1 = 170,
			n = 40,
			step = 16;
		const slot = (w - 4 - x0) / n;
		const bw = slot - 3;
		const bars = Array.from({ length: n }, (_, i) => {
			const t = i * step;
			return { t, x: x0 + 2 + i * slot, y: y1 - ((t & 255) / 255) * (y1 - y0) };
		});
		const marks = [0, 256, 512].map((t) => ({ t, x: x0 + 2 + (t / step) * slot }));
		return { w, h, x0, y0, y1, bw, bars, marks };
	})();

	const sections = [
		['sound', 'sound'],
		['pitch', 'pitch'],
		['rhythm', 'rhythm'],
		['melody', 'melody'],
		['chords', 'chords'],
		['combine', 'combine'],
		['share', 'save and share']
	];
</script>

<svelte:head>
	<title>guide · bytebeat</title>
	<meta name="description" content="learn how bytebeat works and make your first song." />
</svelte:head>

<header class="wrap bar">
	<a href="/" class="flag"><img src="/flag-8bit.svg" alt="bytebeat home" width="96" height="34" /></a>
	<a href="/editor" class="btn ghost">editor</a>
</header>

<div class="wrap layout">
<nav class="side" aria-label="sections">
	<ol class="toc">
		{#each sections as [id, label], i (id)}
			<li>
				<a href="#{id}" class:current={current === id} aria-current={current === id ? 'location' : undefined}>
					<span>{String(i + 1).padStart(2, '0')}</span>
					{label}
				</a>
			</li>
		{/each}
	</ol>
</nav>

<main>
	<section class="intro">
		<h1>the guide<sup class="tm">™</sup></h1>
		<p>
			this guide will explain how bytebeat works and walk you through making a short song! 
			each of these sections will be trying to explain a different concept to you, and
			by the end you'll have a track with drums, a melody and chords. it should
			only take about an hour.
		</p>
		<p>
			you'll be able to play and edit every example in the guide! these orange boxes are small
			snippets of code; make sure you're continuing to make your own version with the
			<a href="/editor" target="_blank">editor</a> as you go along the guide.
		</p>
		<Example
			{gp}
			id="preview"
			code={p.combine}
			hideCode
			title="here's what your song might sound like:"
		/>

	</section>

	<section id="sound">
		<h2><span>01</span> sound</h2>
		<p>
			to play sounds, a speaker moves back and forth, where digital audio tells it how to move through
			list of numbers called samples.
		</p>
		<p>
			in bytebeat, you'll write a formula that makes those samples. the computer counts a number
			<code>t</code> that starts at 0 and goes up by one 8,000 times a second. each
			time your formula runs, that answer the computer gets is what the speaker will play. the simplest formula is just <code>t</code>:
		</p>
		<Example {gp} id="sound-t" code="t" />
		<p>however, that doesn't sound that good...</p>
		<p>
			computers store numbers as <b>bits</b>, which are just 0s and 1s. 8 bits together make a
			<b>byte</b>, and a byte can only hold the numbers 0 to 255. bytebeat keeps just one byte of
			your answer (that's where the name comes from), so anything past 255 wraps back around to 0,
			like a clock going from 12 back to 1.
		</p>
		<p>
			so as <code>t</code> counts up, the output climbs from 0 to 255, drops back to 0 and climbs
			again:
		</p>
		<figure class="chart">
			<svg
				viewBox="0 0 {SAW.w} {SAW.h}"
				role="img"
				aria-label="bar chart: as t goes from 0 to 640, the output climbs from 0 to 255, drops to 0 at t = 256, climbs again, and drops again at t = 512"
			>
				<line class="axis" x1={SAW.x0} y1={SAW.y0} x2={SAW.x0} y2={SAW.y1} />
				<line class="axis" x1={SAW.x0} y1={SAW.y1} x2={SAW.w - 4} y2={SAW.y1} />
				<text class="lbl" x={SAW.x0 - 6} y={SAW.y0 + 4} text-anchor="end">255</text>
				<text class="lbl" x={SAW.x0 - 6} y={SAW.y1} text-anchor="end">0</text>
				{#each SAW.bars as b (b.t)}
					<rect class="bar" x={b.x} y={b.y} width={SAW.bw} height={SAW.y1 - b.y} />
				{/each}
				{#each SAW.marks as m (m.t)}
					<text class="lbl" x={m.x} y={SAW.y1 + 18} text-anchor="start">t = {m.t}</text>
				{/each}
			</svg>
			<figcaption>
				every 256th sample, the output will wrap back to 0!
			</figcaption>
		</figure>
		<p>
			this type of shape is called a <b>sawtooth wave</b>, because it looks like the teeth of a saw. you
			hear it as a low buzz.
		</p>
		<p>
			one climb takes 256 samples, so it happens 8000 / 256 = 31.25 times a second. that's the
			frequency of the note, measured in hertz (hz).
		</p>
		<p>
			go to the <a href="/editor" target="_blank">editor</a> and see how <code>t</code> sounds.
		</p>
	</section>

	<section id="pitch">
		<h2><span>02</span> pitch</h2>
		<p>
			<b>pitch</b> is how high or low a sound is. the faster the speaker moves back and forth, the
			higher it sounds.
		</p>
		<p>
			to raise the pitch, make the wave repeat faster. <code>t * 2</code> climbs twice as fast as
			<code>t</code>, so it wraps around twice as often:
		</p>
		<p class="eq">
			8000 samples a second × 2 ÷ 256 = <b>62.5 hz</b> ≈ the note <b>B1</b>
		</p>
		<Example {gp} id="pitch-2" code="t * 2" />
		<p>
			the frequency is 31.25 hz times the number. each time you double the number, the note goes
			up one octave. change the 2 above to 4, then 8, then 16 while it plays.
		</p>
		<p>
			numbers in between give the notes in between. <code>t * 3</code> is a fifth above
			<code>t * 2</code>, the same jump as the second "twinkle" in "twinkle twinkle little star".
		</p>
		<p>
			the sawtooth is one shape. <code>&amp; 128</code> keeps a single bit of the result, so the
			output jumps between 0 and 128 with nothing in between. that's a square wave: the same note
			with a hollower sound, like an old game console.
		</p>
		<Example {gp} id="pitch-square" code="t * 4 & 128" />
		<p>
			<code>*</code> runs before <code>&amp;</code>, so <code>t * 4 &amp; 128</code> means
			<code>(t * 4) &amp; 128</code>. <code>&amp; 64</code> makes a smaller jump, so it's quieter.
			you'll need that later, when several sounds play at once.
		</p>
		<p>
			change your project to a quiet square wave. 6 × 31.25 = 187.5 hz, which will be the lowest
			note of your melody.
		</p>
		<Example {gp} id="p-pitch" code={p.pitch} project="step 2" />
	</section>

	<section id="rhythm">
		<h2><span>03</span> rhythm</h2>
		<p>
			rhythm needs something that changes much slower than the sound. <code>&gt;&gt;</code> shifts
			the bits of a number to the right, which divides by a power of two and drops the
			remainder. <code>t &gt;&gt; 11</code> is <code>t</code> divided by 2048, so it goes up by one
			every 2048 samples, about a quarter of a second. that's a beat counter.
		</p>
		<p>
			<code>&amp; 1</code> keeps the lowest bit, so <code>t &gt;&gt; 11 &amp; 1</code> goes 0, 1, 0,
			1, one step per beat. multiply a sound by it and the sound turns off and on:
		</p>
		<Example {gp} id="rhythm-gate" code="(t * 8 & 128) * (t >> 11 & 1)" />
		<p>
			for a pattern, write the beats as a binary number. each 1 is a hit and each 0 is a rest,
			read from right to left. <code>t &gt;&gt; 11 &amp; 7</code> counts 0 to 7, and shifting the
			pattern by that much picks out one bit:
		</p>
		<Example
			{gp}
			id="rhythm-pattern"
			code={'pattern = 0b10110101\nhit = pattern >> (t >> 11 & 7) & 1\n\nhit * (t * 8 & 128)'}
		/>
		<p>
			you can write more than one line. the lines above the last one set variables, and the last
			line is the sound.
		</p>
		<p>
			the last line starts with <code>hit</code> and not <code>(</code> on purpose. javascript
			joins a line that starts with <code>(</code> or <code>[</code> onto the line above it, so
			<code>(t * 8 &amp; 128) * hit</code> would break. if you need a bracket first, end the line
			above with <code>;</code>.
		</p>
		<p>
			drums don't stay on. they hit and fade out. <code>~t</code> flips every bit of
			<code>t</code>, so <code>~t &gt;&gt; 4 &amp; 127</code> counts down from 127 to 0, once
			per beat. multiply by it and each beat starts loud and fades:
		</p>
		<Example {gp} id="rhythm-decay" code="(t * 8 & 255) * (~t >> 4 & 127) >> 7" />
		<p>
			the <code>&gt;&gt; 7</code> at the end divides by 128 to bring the result back under 256.
		</p>
		<p>
			a kick drum is the same idea with a very low note, fading over half a second. for a hi-hat,
			use noise: <code>random()</code> gives a different number every sample, which sounds like
			hiss. adding two sounds together plays both. replace your project with this:
		</p>
		<Example {gp} id="p-rhythm" code={p.rhythm} project="step 3" />
		<p class="muted">
			your square wave from step 2 comes back in the next step.
		</p>
	</section>

	<section id="melody">
		<h2><span>04</span> melody</h2>
		<p>
			a melody is a list of notes that changes over time. put the numbers in an array and use a
			counter to pick one:
		</p>
		<Example {gp} id="melody-array" code="t * [4, 5, 6, 8][t >> 12 & 3] & 128" />
		<p>
			<code>t &gt;&gt; 12 &amp; 3</code> goes 0, 1, 2, 3 and repeats, moving on every half second.
			<code>[4, 5, 6, 8][...]</code> picks the number at that position.
		</p>
		<p>
			4, 5, 6 and 8 sound good together, but that's only four notes. for more, use a scale. these
			numbers are the major scale (do re mi fa so la ti do) as whole-number ratios. do is 24 and
			the do an octave up is 48:
		</p>
		<Example
			{gp}
			id="melody-scale"
			code={'scale = [24, 27, 30, 32, 36, 40, 45, 48]\nt * scale[t >> 12 & 7] >> 2 & 128'}
		/>
		<p>
			this plays the scale going up. <code>&gt;&gt; 2</code> divides by 4 so the notes aren't too
			high.
		</p>
		<p>
			now write a tune as positions in the scale, where 0 is the first note and 7 is the last.
			add it to your project, and change the numbers in <code>tune</code> to make it yours:
		</p>
		<Example {gp} id="p-melody" code={p.melody} project="step 4" />
	</section>

	<section id="chords">
		<h2><span>05</span> chords</h2>
		<p>
			a chord is a few notes played at once. you already know how: add them. keep each one small
			so the total stays under 256. if it goes over, it wraps around and crackles.
		</p>
		<Example {gp} id="chords-major" code="(t * 4 & 64) + (t * 5 & 64) + (t * 6 & 64)" />
		<p>4, 5 and 6 make a major chord. try 10, 12 and 15 for a minor one, which sounds sadder.</p>
		<p>
			songs move between chords. this picks a root note every two seconds and builds a chord on
			it. the three parts are root ÷ 8, root × 5 ÷ 32 and root × 3 ÷ 16. that's the same 4 : 5 : 
			6 shape, an octave under the melody:
		</p>
		<Example
			{gp}
			id="chords-prog"
			code={'root = [24, 32, 24, 36][t >> 14 & 3]\nchord = (t * root >> 3 & 31) + (t * root * 5 >> 5 & 31) + (t * root * 3 >> 4 & 31)\n\nchord'}
		/>
		<p>
			the roots are F♯, B, F♯ and C♯. add the chords to your project:
		</p>
		<Example {gp} id="p-chords" code={p.chords} project="step 5" />
		<p class="muted">
			the parts add up to at most 64 + 93 + 63 + 15 = 235, which stays under 256.
		</p>
	</section>

	<section id="combine">
		<h2><span>06</span> combine</h2>
		<p>
			you have all the parts. now arrange them so the song changes over time. a comparison gives 0
			when it's false and 1 when it's true. <code>t &gt;&gt; 16 &gt; 0</code> is false for the
			first 8 seconds and true after that, so multiplying the lead by it brings the melody in at
			8 seconds:
		</p>
		<Example {gp} id="p-combine" code={p.combine} project="step 6" />
		<p>that's the whole song. some ways to make it your own:</p>
		<ul class="plain">
			<li>change <code>tune</code> and <code>root</code> to write your own parts.</li>
			<li>use a binary pattern from step 3 so the hat only plays on some beats.</li>
			<li>use <code>t &gt;&gt; 17 &amp; 1</code> to switch between two tunes every 16 seconds.</li>
			<li>change <code>&gt;&gt; 2</code> in the lead to <code>&gt;&gt; 1</code> to move it up an octave.</li>
		</ul>
	</section>

	<section id="share">
		<h2><span>07</span> save and share</h2>
		<p>
			in the editor, press export (or <kbd>ctrl</kbd>+<kbd>s</kbd>). you need to be logged in.
			you'll get a link to your song that anyone can open. on your own link the button says save,
			and saving updates the same link. if you open someone else's link, export makes your own
			copy.
		</p>
		<p><kbd>ctrl</kbd>+<kbd>enter</kbd> plays and pauses, in the editor and on this page.</p>
		<h3>if something sounds wrong</h3>
		<ul class="plain">
			<li>
				a line that starts with <code>(</code> or <code>[</code> joins onto the line above it. end
				the line above with <code>;</code>.
			</li>
			<li>
				crackling usually means the parts add up to more than 255. use smaller <code>&amp;</code>
				numbers.
			</li>
			<li>
				math functions work without <code>Math.</code>, like <code>sin(t)</code> or
				<code>random()</code>.
			</li>
			<li>
				the editor also has a signed and floatbeat mode, which will treat the result as −128 to 127 or
				−1 to 1. this guide uses classic mode (0 to 255).
			</li>
		</ul>
		<p><a href="/editor" class="btn">open the editor</a></p>
	</section>
</main>
</div>

<VolumeNotice />

<footer class="wrap">
	<nav>
		<a href="/">home</a>
		<a href="https://hackclub.com">hack club</a>
		<a href="https://hackclub.com/privacy-and-terms">privacy &amp; terms</a>
	</nav>
	<span class="muted">made by Hack Clubbers for Hack Clubbers!</span>
</footer>

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

	.layout {
		max-width: 1120px;
		display: grid;
		grid-template-columns: 13rem minmax(0, 760px);
		gap: 3rem;
	}
	.side {
		position: sticky;
		top: 0;
		align-self: start;
		max-height: 100vh;
		overflow-y: auto;
		padding-top: 3rem;
	}
	main {
		min-width: 0;
	}
	section {
		padding-top: 3.5rem;
		scroll-margin-top: 1rem;
	}
	.intro {
		padding-top: 3rem;
	}
	h1 {
		font-size: clamp(1.6rem, 7vw, 3rem);
		color: var(--orange);
		margin-bottom: 1.5rem;
	}
	.tm {
		font-family: var(--mono);
		font-size: 0.35em;
		vertical-align: super;
		margin-left: 0.2em;
	}
	h2 {
		font-size: 1rem;
		margin-bottom: 1.2rem;
		display: flex;
		align-items: baseline;
		gap: 0.8rem;
	}
	h2 span {
		font-size: 0.65rem;
		color: var(--muted);
	}
	h3 {
		font-size: 0.75rem;
		margin: 2rem 0 1rem;
	}
	.muted {
		color: var(--muted);
		font-size: 0.9rem;
	}
	kbd {
		font-family: var(--mono);
		font-size: 0.85rem;
		border: 1px solid var(--line);
		padding: 0 0.3rem;
	}

	.toc {
		list-style: none;
		padding: 0;
		margin: 0;
		border-left: 2px solid var(--line);
		display: flex;
		flex-direction: column;
	}
	.toc a {
		display: block;
		padding: 0.4rem 0.9rem;
		margin-left: -2px;
		border-left: 2px solid transparent;
		color: var(--muted);
		text-decoration: none;
	}
	.toc a:hover {
		color: var(--text);
	}
	.toc a.current {
		color: var(--orange);
		border-left-color: var(--orange);
	}
	.toc span {
		font-family: var(--pixel);
		font-size: 0.6rem;
		margin-right: 0.4rem;
	}

	@media (max-width: 900px) {
		.layout {
			display: block;
		}
		.side {
			position: static;
			max-height: none;
			padding-top: 2rem;
		}
		.toc {
			border: 2px solid var(--line);
			padding: 0.6rem;
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
		}
		.toc a {
			margin-left: 0;
			border-left: none;
			padding: 0.3rem 0.4rem;
		}
	}

	.eq {
		padding: 0.6rem 0.9rem;
		border-left: 2px solid var(--orange);
		background: var(--navy-2);
		font-size: 0.95rem;
	}
	.eq b {
		color: var(--orange);
		font-weight: 400;
	}

	.chart {
		margin: 1.2rem 0;
		padding: 1rem;
		background: var(--navy-2);
		border: 2px solid var(--line);
	}
	.chart svg {
		display: block;
		width: 100%;
		height: auto;
	}
	.chart .bar {
		fill: var(--orange);
	}
	.chart .axis {
		stroke: var(--line);
		stroke-width: 2;
	}
	.chart .lbl {
		fill: var(--muted);
		font-family: var(--mono);
		font-size: 13px;
	}
	.chart figcaption {
		margin-top: 0.6rem;
		font-size: 0.85rem;
		color: var(--muted);
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

	footer {
		margin-top: 4rem;
		padding-top: 1.5rem;
		padding-bottom: 2rem;
		border-top: 2px solid var(--line);
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		font-size: 0.85rem;
	}
	footer nav {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
	}
</style>
