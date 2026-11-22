<script lang="ts">
	import Editor from '#lib/components/Editor.svelte';
	import VolumeNotice from '#lib/components/VolumeNotice.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>editor · bytebeat</title>
</svelte:head>

<Editor project={null} loggedIn={data.loggedIn} />
<VolumeNotice />
