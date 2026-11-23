<script lang="ts">
	import { player } from '#lib/bytebeat.svelte.ts';

	let dialog: HTMLDialogElement;

	$effect(() => {
		if (player.showVolumeNotice && !dialog.open) dialog.showModal();
		if (!player.showVolumeNotice && dialog.open) dialog.close();
	});
</script>

<dialog
	bind:this={dialog}
	aria-labelledby="volume-title"
	oncancel={(e) => {
		e.preventDefault();
		player.dismissVolumeNotice();
	}}
>
	<h2 id="volume-title">turn your volume down</h2>
	<p><strong>make sure to lower your sound! this is REALLY loud.</strong></p>
	<button class="btn" onclick={() => player.dismissVolumeNotice()}>got it</button>
</dialog>

<style>
	dialog {
		max-width: min(420px, calc(100vw - 32px));
		padding: 1.5rem;
		background: var(--navy-2);
		color: var(--text);
		border: 2px solid var(--orange);
		border-radius: 0;
	}
	dialog::backdrop {
		background: rgb(5 12 26 / 0.8);
	}
	h2 {
		font-size: 0.85rem;
		color: var(--orange);
		margin-bottom: 1rem;
	}
	p {
		margin: 0 0 1.25rem;
	}
</style>
