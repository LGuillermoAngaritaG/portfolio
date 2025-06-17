<script lang="ts">
	export let sectionTitle: string;
	export let items: any[];
	export let itemsPerPage: number = 3;
	export let truncationLimit: number = 150;

	import { fadeIn } from '$lib/utils/fadeInUtils';
	import Pagination from '$lib/components/common/Pagination.svelte';
	import SearchableDropdown from '$lib/components/common/TagSearch.svelte';
	import BaseCard from './BaseCard.svelte';
	import { createCardsStore } from '$lib/stores/cardsStore';

	import '/src/styles/cards.css';

	const {
		currentPage,
		selectedTags,
		availableTags,
		paginatedItems,
		totalPages,
		handlePageChange,
		handleTagChange
	} = createCardsStore(items, itemsPerPage);
</script>

<section id={sectionTitle.toLowerCase().replace(/\s+/g, '-')} class="section" use:fadeIn>
	<h2 class="section-title">{sectionTitle}</h2>
	{#if $availableTags.length > 0}
		<div class="tag-filter">
			<SearchableDropdown
				options={$availableTags}
				value={$selectedTags}
				onChange={handleTagChange}
				placeholder="Search tags..."
			/>
		</div>
	{/if}
	{#if $paginatedItems.length === 0}
		<div class="no-results">
			<p>
				No {sectionTitle} match the selected tags. Try selecting different tags or clear the filter.
			</p>
		</div>
	{:else}
		{#each $paginatedItems as item, index (`${item.title || 'untitled'}-${index}`)}
			{#if item.link}
				<a href={item.link} class="card-link" target="_blank" rel="noopener noreferrer">
					<BaseCard {item} {truncationLimit} />
				</a>
			{:else}
				<BaseCard {item} {truncationLimit} />
			{/if}
		{/each}
	{/if}
	<Pagination currentPage={$currentPage} totalPages={$totalPages} onPageChange={handlePageChange} />
</section>
