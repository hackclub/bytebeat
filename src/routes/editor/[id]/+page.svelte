<script lang="ts">
	import Editor from '#lib/components/Editor.svelte';
	import VolumeNotice from '#lib/components/VolumeNotice.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.project.title} · bytebeat</title>
</svelte:head>

{#key data.project.id}
	<Editor project={data.project} loggedIn={data.loggedIn} />
{/key}
<VolumeNotice />
