<script lang="ts">
	import SiteHeader from '#lib/components/layout/SiteHeader.svelte';
	import SiteFooter from '#lib/components/layout/SiteFooter.svelte';

	let { data } = $props();
	const a = $derived(data.account);
	const name = $derived(a.username ?? a.firstName ?? 'you');
	const joined = $derived(
		new Date(a.joined).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
	);
</script>

<svelte:head>
	<title>account · bytebeat</title>
</svelte:head>

<SiteHeader>
	<a href="/editor" class="btn ghost">editor</a>
</SiteHeader>

<main class="wrap">
	<section class="profile">
		{#if a.avatar}
			<img class="avatar" src={a.avatar} alt="" width="96" height="96" />
		{:else}
			<div class="avatar empty" aria-hidden="true">{name[0]}</div>
		{/if}
		<div>
			<h1>{name}</h1>
			{#if a.firstName && a.firstName !== name}<p class="muted">{a.firstName}</p>{/if}
			<p class="muted">joined {joined}</p>
		</div>
	</section>

	{#if a.verificationStatus !== 'verified'}
		<p class="notice" role="alert">
			you can't get prizes until you're verified on
			<a href="https://auth.hackclub.com" target="_blank" rel="noopener">hack club auth</a>. log out
			and back in to refresh your status.
		</p>
	{/if}

	<section>
		<h2>details</h2>
		<dl>
			<dt>email</dt>
			<dd>{a.email || '—'}</dd>
			<dt>slack id</dt>
			<dd>{#if a.slackId}<code>{a.slackId}</code>{:else}not linked{/if}</dd>
			<dt>verification</dt>
			<dd>{a.verificationStatus ?? 'unknown'}</dd>
		</dl>
		<p class="muted">
			your name and picture come from slack and update each time you log in.
		</p>
	</section>

	<section>
		<h2>hackatime</h2>
		{#if a.hackatimeLinked}
			<p>
				linked{#if a.hackatimeHours !== null}: {a.hackatimeHours}h in the last 7 days{/if}.
			</p>
			<form method="POST" action="/auth/hackatime/disconnect">
				<button class="btn ghost">disconnect</button>
			</form>
		{:else}
			<p>link hackatime so your time counts.</p>
			<a href="/auth/hackatime" class="btn">connect hackatime</a>
		{/if}
	</section>

	<section>
		<form method="POST" action="/auth/logout">
			<button class="btn ghost">log out</button>
		</form>
	</section>
</main>

<SiteFooter />

<style>
	main {
		max-width: 760px;
	}
	section {
		padding-top: 2.5rem;
	}
	.profile {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding-top: 3rem;
	}
	.avatar {
		width: 96px;
		height: 96px;
		flex-shrink: 0;
		border: 2px solid var(--orange);
		image-rendering: pixelated;
	}
	.avatar.empty {
		display: grid;
		place-items: center;
		font-family: var(--pixel);
		font-size: 2rem;
		color: var(--orange);
		background: var(--navy-2);
	}
	
	h1 {
		font-size: clamp(1.2rem, 5vw, 2rem);
		color: var(--orange);
		margin-bottom: 0.4rem;
		overflow-wrap: anywhere;
	}
	h1 + p,
	.profile p {
		margin: 0;
	}
	h2 {
		font-size: 1rem;
		margin-bottom: 1rem;
	}
	.muted {
		color: var(--muted);
		font-size: 0.9rem;
	}
	.notice {
		margin-top: 2rem;
		padding: 0.6rem 0.9rem;
		border-left: 2px solid var(--orange);
		background: var(--navy-2);
	}

	dl {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 0.4rem 1.5rem;
		margin: 0 0 1rem;
	}
	dt {
		color: var(--muted);
	}
	dd {
		margin: 0;
		overflow-wrap: anywhere;
	}
</style>
