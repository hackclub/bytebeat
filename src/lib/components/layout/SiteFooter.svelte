<script lang="ts">
	let {
		links = [
			{ href: '/', label: 'home' },
			{ href: 'https://hackclub.com', label: 'hack club' },
			{ href: 'https://hackclub.com/privacy-and-terms', label: 'privacy & terms' }
		]
	}: { links?: { href: string; label: string }[] } = $props();
</script>

<footer class="wrap">
	<nav>
		{#each links as l (l.href)}
			<a href={l.href}>{l.label}</a>
		{/each}
	</nav>
	<span class="muted">made by Hack Clubbers for Hack Clubbers!</span>
</footer>

<style>
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
	nav {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
	}
	.muted {
		color: var(--muted);
	}
</style>
