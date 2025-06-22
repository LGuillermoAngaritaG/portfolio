<script lang="ts">
	import type { PortfolioData, PageData } from '../types/types.js';
	import CardsOutside from '$lib/components/sections/Cards/CardsOutside.svelte';
	import Cards from './sections/Cards/Cards.svelte';
	import CardsWithIcons from '$lib/components/sections/Cards/CardsWithIcons.svelte';
	import { sortItemsByDate, shouldSortSectionByDate } from '$lib/utils/dateSortUtils';

	export let portfolioData: PortfolioData;
	export let content: PageData['content'];

	// Function to get sorted items for a section
	function getSortedItems(section: any): any[] {
		if (!section.content) return [];

		// Only sort if the section has items with date fields
		if (shouldSortSectionByDate(section)) {
			return sortItemsByDate(section.content);
		}

		return section.content;
	}
</script>

{#each portfolioData.sections as section}
	{#if section.type === 'cards'}
		<Cards
			sectionTitle={section.title}
			items={getSortedItems(section)}
			itemsPerPage={section.cards_before_pagination || 3}
			truncationLimit={section.truncation_limit || 150}
			totalItems={section.content?.length || 0}
		/>
	{:else if section.type === 'cards_with_icons'}
		<CardsWithIcons skillsData={section.content as any} sectionTitle={section.title} />
	{:else if section.type === 'cards_outside'}
		<CardsOutside
			sectionTitle={section.title}
			items={content[section.title.toLowerCase()]?.content || []}
			itemsPerPage={section.cards_before_pagination || 3}
			truncationLimit={section.truncation_limit || 150}
			totalItems={content[section.title.toLowerCase()]?.content?.length || 0}
		/>
	{/if}
{/each}
