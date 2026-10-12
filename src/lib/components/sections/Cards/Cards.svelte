<script lang="ts">
	export let sectionTitle: string;
	export let items: any[];
	export let itemsPerPage: number;
	export let truncationLimit: number = 150;
	export let totalItems: number;

	import Pagination from '$lib/components/common/Pagination.svelte';
	import SearchableDropdown from '$lib/components/common/TagSearch.svelte';
	import BaseCard from './BaseCard.svelte';
	import { createCardsStore } from '$lib/stores/cardsStore';

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
</script>

<section id={sectionTitle.toLowerCase().replace(/\s+/g, '-')} class="section">
	<h2 class="section-title">{sectionTitle}</h2>
	<div>
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
					<BaseCard {item} {truncationLimit} />
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
</section>
