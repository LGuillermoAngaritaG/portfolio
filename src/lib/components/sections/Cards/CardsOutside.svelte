<script lang="ts">
	export let sectionTitle: string;
	export let items: any[];
	export let itemsPerPage: number;
	export let truncationLimit: number = 150;
	export let totalItems: number;

	import { base } from '$app/paths';
	import { createCardsStore } from '$lib/stores/cardsStore';

	import SearchableDropdown from '$lib/components/common/TagSearch.svelte';
	import TruncatedMarkdown from '$lib/components/common/TruncatedMarkdown.svelte';
	import Pagination from '$lib/components/common/Pagination.svelte';

	const {
		currentPage,
		selectedTags,
		availableTags,
		viableTags,
		paginatedItems,
		totalPages,
		handlePageChange,
		handleTagChange
	} = createCardsStore(items, itemsPerPage);

	function getItemUrl(item: any) {
		if (item.metadata?.skip) {
			return item.metadata.link;
		}
		// Convert sectionId to the same format used in route generation
		const routeType = sectionTitle.toLowerCase().replace(/\s+/g, '-');
		return `${base}/${routeType}/${item.slug}/`;
	}
</script>

{#snippet card(item: any)}
	<article class="entry">
		<div class="entry-date">{item.metadata?.date ?? ''}</div>
		<div class="entry-main">
			<div>
				<h3 class="entry-title">
					<a
						href={getItemUrl(item)}
						target={item.metadata?.skip ? '_blank' : null}
						rel={item.metadata?.skip ? 'noopener noreferrer' : null}
					>
						{item.metadata?.title}
					</a>
				</h3>
				{#if item.metadata?.description}
					<div class="entry-body">
						<TruncatedMarkdown text={item.metadata.description} limit={truncationLimit} />
					</div>
				{/if}
				{#if item.metadata?.tags?.length}
					<ul class="tags">
						{#each Array.isArray(item.metadata.tags) ? item.metadata.tags : item.metadata.tags
									.split(/[\s,]+/)
									.map((t: string) => t.trim()) as tag}
							<li class="tag">{tag}</li>
						{/each}
					</ul>
				{/if}
			</div>
			{#if item.metadata?.image}
				<img
					class="entry-image"
					class:contain={item.metadata.image_fit === 'contain'}
					src={item.metadata.image}
					alt={item.metadata.image_alt ||
						(item.metadata.title ? `${item.metadata.title} image` : 'Card image')}
					loading="lazy"
				/>
			{/if}
		</div>
	</article>
{/snippet}

<section id={sectionTitle.toLowerCase().replace(/\s+/g, '-')} class="section">
	<h2 class="section-title">{sectionTitle}</h2>
	<div>
		<div class="js-only">
			{#if $availableTags.length > 0}
				<SearchableDropdown
					options={$viableTags}
					value={$selectedTags}
					onChange={handleTagChange}
					placeholder="Search tags..."
				/>
			{/if}

			{#if $paginatedItems.length === 0}
				<p class="no-results">
					No {sectionTitle} match the selected tags. Try selecting different tags or clear the filter.
				</p>
			{:else}
				<div>
					{#each $paginatedItems as item, index (`${item.title || 'untitled'}-${index}`)}
						{@render card(item)}
					{/each}
				</div>
			{/if}
			<Pagination
				currentPage={$currentPage}
				totalPages={$totalPages}
				onPageChange={handlePageChange}
				{totalItems}
				itemLabel={sectionTitle}
			/>
		</div>
		<!-- The complete list, for visitors and crawlers without scripts. -->
		<noscript>
			{#each items as item}
				{@render card(item)}
			{/each}
		</noscript>
	</div>
</section>

<style>
	.entry-main {
		display: flex;
		gap: 1.5rem;
		align-items: start;
		justify-content: space-between;
	}

	.entry-image {
		flex-shrink: 0;
		width: 9rem;
		aspect-ratio: 3 / 2;
		border: 1px solid var(--border-color);
		border-radius: 0.625rem;
		object-fit: cover;
	}

	.entry-image.contain {
		object-fit: contain;
	}

	@media (max-width: 600px) {
		.entry-main {
			flex-direction: column-reverse;
			gap: 0.75rem;
		}

		.entry-image {
			width: 100%;
		}
	}
</style>
