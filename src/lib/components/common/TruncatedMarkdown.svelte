<script lang="ts">
	import { onMount } from 'svelte';
	import { marked } from 'marked';

	export let text: string;
	// Character limit, passed from parent
	export let limit: number;

	let element: HTMLElement;
	let isExpanded = false;
	// Whether the clamped text is really cut off; measured once mounted.
	let overflows = true;

	$: htmlContent = marked.parse(text || '', { async: false });
	// The collapsed state is a height clamp, so the limit is mapped to lines (about 80 characters each).
	$: lines = Math.max(2, Math.round(limit / 80));
	$: isLong = htmlContent.replace(/<[^>]*>/g, '').length > limit;
	$: clamped = isLong && !isExpanded;

	onMount(() => {
		if (!element) return;
		const observer = new ResizeObserver(() => {
			if (clamped) overflows = element.scrollHeight > element.clientHeight + 1;
		});
		observer.observe(element);
		return () => observer.disconnect();
	});
</script>

{#if text && text.trim()}
	<div
		class="markdown-content"
		class:clamped
		class:fade={clamped && overflows}
		style="--lines: {lines}"
		bind:this={element}
	>
		{@html htmlContent}
	</div>
	{#if isLong && (overflows || isExpanded)}
		<button
			class="show-more-btn"
			type="button"
			aria-expanded={isExpanded}
			on:click={() => (isExpanded = !isExpanded)}
		>
			{isExpanded ? 'Show less' : 'Show more'}
		</button>
	{/if}
{/if}

<style>
	.markdown-content {
		line-height: 1.6;
	}

	.clamped {
		max-height: calc(var(--lines) * 1.6em);
		overflow: hidden;
	}

	.fade {
		-webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 1.6em), transparent);
		mask-image: linear-gradient(to bottom, #000 calc(100% - 1.6em), transparent);
	}

	.show-more-btn {
		margin-top: 0.375rem;
		padding: 0;
		border: 0;
		background: none;
		color: var(--secondary-color);
		font: inherit;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
	}

	.show-more-btn:hover {
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	.markdown-content :global(p),
	.markdown-content :global(ul),
	.markdown-content :global(ol) {
		margin: 0 0 0.5em;
	}

	.markdown-content :global(ul),
	.markdown-content :global(ol) {
		padding-left: 1.2em;
	}

	.markdown-content :global(li + li) {
		margin-top: 0.25em;
	}

	.markdown-content :global(:last-child) {
		margin-bottom: 0;
	}

	.markdown-content :global(strong) {
		color: var(--text-color);
		font-weight: 600;
	}
</style>
