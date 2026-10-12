<script lang="ts">
	import { marked } from 'marked';
	import TruncatedMarkdown from '$lib/components/common/TruncatedMarkdown.svelte';
	import { asset } from '$lib/utils/assetUtils';

	export let item: any;
	export let truncationLimit: number = 150;
</script>

<article class="entry">
	<div class="entry-date">{item.date ?? ''}</div>
	<div>
		<h3 class="entry-title">
			{#if item.icon}<img class="title-icon" src={asset(item.icon)} alt="" />{/if}
			{#if item.link}
				<a href={item.link} target="_blank" rel="noopener noreferrer">
					{@html marked.parseInline(item.title)}
					<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 8.5l5-5M4.5 3.5h4v4" /></svg>
				</a>
			{:else}
				{@html marked.parseInline(item.title)}
			{/if}
		</h3>
		{#if item.description}
			<div class="entry-body">
				<TruncatedMarkdown text={item.description} limit={truncationLimit} />
			</div>
		{/if}
		{#if item.keywords}
			<ul class="tags">
				{#each item.keywords as keyword}
					<li class="tag">{keyword}</li>
				{/each}
			</ul>
		{/if}
	</div>
</article>

<style>
	.title-icon {
		width: 1.25rem;
		height: 1.25rem;
		margin-right: 0.375rem;
		vertical-align: -0.2em;
	}

	svg {
		width: 0.7em;
		height: 0.7em;
		margin-left: 0.15em;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0.6;
	}
</style>
