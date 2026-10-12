<script lang="ts">
	import type { ContentItem } from '$lib/types/types';
	import { base } from '$app/paths';

	export let data: ContentItem;
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/atom-one-dark.min.css"
	/>
</svelte:head>

<article class="container slug-article">
	<header>
		<h1>{data.metadata.title}</h1>
		<div class="metadata">
			{#if data.metadata.date}
				<time datetime={data.metadata.date}>{data.metadata.date}</time>
			{/if}
			<ul class="tags">
				{#each Array.isArray(data.metadata.tags) ? data.metadata.tags : data.metadata.tags
							.split(',')
							.map((tag: string) => tag.trim()) as tag}
					<li class="tag">{tag}</li>
				{/each}
			</ul>
		</div>
	</header>
	{#if data.metadata.image}
		<img
			class="cover"
			src={data.metadata.image}
			alt={data.metadata.image_alt || `${data.metadata.title} project visual`}
		/>
	{/if}
	<div class="content">
		{@html data.html}
	</div>
	{#if data.nextItem}
		<a href="{base}/{data.nextItem.type}/{data.nextItem.slug}/" class="next-link">
			<span>Next</span>
			{data.nextItem.title}
			<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
		</a>
	{/if}
</article>

<style>
	.slug-article {
		--page-width: 44rem;
		min-height: 100vh;
		padding-top: calc(var(--nav-height) + clamp(2.5rem, 7vw, 4.5rem));
		padding-bottom: 4rem;
	}

	h1 {
		margin: 0;
		font-size: clamp(2rem, 1.4rem + 2.8vw, 3rem);
		font-weight: 700;
		line-height: 1.1;
		letter-spacing: -0.03em;
		text-wrap: balance;
	}

	.metadata {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 1rem;
		margin-top: 1.25rem;
	}

	time {
		color: var(--text-secondary-color);
		font-size: 0.9375rem;
		font-variant-numeric: tabular-nums;
	}

	.tags {
		margin-top: 0;
	}

	.cover {
		display: block;
		width: 100%;
		margin-top: 2rem;
		border: 1px solid var(--border-color);
		border-radius: 1rem;
	}

	.content {
		margin-top: 2.5rem;
		font-size: 1.0625rem;
		line-height: 1.75;
		overflow-wrap: break-word;
	}

	.content :global(h2),
	.content :global(h3) {
		margin: 2.5rem 0 0.75rem;
		font-weight: 650;
		line-height: 1.25;
		letter-spacing: -0.02em;
	}

	.content :global(h2) {
		font-size: 1.625rem;
	}

	.content :global(h3) {
		font-size: 1.25rem;
	}

	.content :global(p),
	.content :global(ul),
	.content :global(ol),
	.content :global(pre),
	.content :global(blockquote),
	.content :global(table) {
		margin: 1.2rem 0;
	}

	.content :global(ul),
	.content :global(ol) {
		padding-left: 1.5rem;
	}

	.content :global(li) {
		margin: 0.4rem 0;
	}

	.content :global(a) {
		text-decoration: underline;
	}

	.content :global(img) {
		border-radius: 0.75rem;
	}

	.content :global(:not(pre) > code) {
		padding: 0.15em 0.35em;
		border-radius: 0.3rem;
		background: var(--hover-background-subtle);
		font-family: var(--font-mono);
		font-size: 0.875em;
	}

	.content :global(pre) {
		border-radius: 0.75rem;
		font-size: 0.875rem;
		line-height: 1.6;
		overflow-x: auto;
	}

	.content :global(pre code) {
		font-family: var(--font-mono);
	}

	.content :global(blockquote) {
		padding-left: 1.25rem;
		border-left: 2px solid var(--border-color);
		color: var(--text-secondary-color);
	}

	.content :global(table) {
		display: block;
		border-collapse: collapse;
		overflow-x: auto;
	}

	.content :global(th),
	.content :global(td) {
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid var(--border-color);
		text-align: left;
	}

	.content :global(hr) {
		margin: 2.5rem 0;
		border: 0;
		border-top: 1px solid var(--border-color);
	}

	.next-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 3.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border-color);
		color: var(--text-color);
		font-weight: 600;
	}

	.next-link span {
		color: var(--text-secondary-color);
		font-weight: 400;
	}

	.next-link svg {
		width: 1rem;
		height: 1rem;
		margin-left: auto;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
		transition: transform 0.2s var(--ease-out);
	}

	.next-link:hover {
		color: var(--secondary-color);
		text-decoration: none;
	}

	.next-link:hover svg {
		transform: translateX(0.25rem);
	}
</style>
