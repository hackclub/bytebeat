<script lang="ts">
	let {
		value = $bindable(''),
		oninput,
		onkeydown
	}: {
		value?: string;
		oninput?: () => void;
		onkeydown?: (e: KeyboardEvent) => void;
	} = $props();

	let textarea: HTMLTextAreaElement;
	let gutter: HTMLDivElement;

	const lines = $derived(value.split('\n').length);

	function keydown(e: KeyboardEvent) {
		if (e.key === 'Tab' && !e.ctrlKey && !e.metaKey && !e.altKey) {
			e.preventDefault();
			const { selectionStart: s, selectionEnd: end } = textarea;
			value = value.slice(0, s) + '\t' + value.slice(end);
			queueMicrotask(() => textarea.setSelectionRange(s + 1, s + 1));
			oninput?.();
			return;
		}
		onkeydown?.(e);
	}
</script>

<div class="code">
	<div class="gutter" bind:this={gutter} aria-hidden="true">
		{#each { length: lines }, i (i)}<div>{i + 1}</div>{/each}
	</div>
	<textarea
		bind:this={textarea}
		bind:value
		oninput={() => oninput?.()}
		onkeydown={keydown}
		onscroll={() => (gutter.scrollTop = textarea.scrollTop)}
		spellcheck="false"
		autocomplete="off"
		autocapitalize="off"
		aria-label="code"
		wrap="off"
	></textarea>
</div>

<style>
	.code {
		display: flex;
		height: 100%;
		min-height: 320px;
		background: var(--navy);
		border: 2px solid var(--line);
		font-family: var(--mono);
		font-size: 0.95rem;
		line-height: 1.5;
	}
	.code:focus-within {
		border-color: var(--orange);
	}
	.gutter {
		flex: none;
		overflow: hidden;
		padding: 0.75rem 0.6rem;
		text-align: right;
		color: var(--line);
		user-select: none;
		min-width: 3.2ch;
		border-right: 2px solid var(--line);
	}
	textarea {
		flex: 1;
		resize: none;
		border: 0;
		outline: none;
		padding: 0.75rem;
		margin: 0;
		background: transparent;
		color: var(--text);
		font: inherit;
		line-height: inherit;
		tab-size: 2;
		white-space: pre;
		overflow: auto;
	}
</style>
