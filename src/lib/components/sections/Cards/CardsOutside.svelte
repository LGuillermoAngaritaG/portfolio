<script lang="ts">
	export let sectionTitle: string;
	export let items: any[];
	export let itemsPerPage: number;
	export let truncationLimit: number = 150;
	export let totalItems: number;

	import { base } from '$app/paths';
	import { fadeIn } from '$lib/utils/fadeInUtils';
	import { createCardsStore } from '$lib/stores/cardsStore';

	import SearchableDropdown from '$lib/components/common/TagSearch.svelte';
	import TruncatedMarkdown from '$lib/components/common/TruncatedMarkdown.svelte';
	import Pagination from '$lib/components/common/Pagination.svelte';

	import '/src/styles/cards.css';
	import '/src/styles/cards-outside.css';

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

	// Preserve the original cards and expose the complete list when scripts are disabled.
	const escapeHtml = (value: unknown) =>
		String(value)
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;');
	function noJsCards() {
		return items
			.map((item) => {
				const m = item.metadata;
				return `<a class="timeline-content" href="${escapeHtml(getItemUrl(item))}"><div class="header-container"><span class="date">${escapeHtml(m.date)}</span><div class="tags-container">${m.tags.map((tag: string) => `<span class="card-tag">${escapeHtml(tag)}</span>`).join('')}</div></div><div class="card-container">${m.image ? `<div class="card-image"><img src="${escapeHtml(m.image)}"${m.image_fit === 'contain' ? ' style="object-fit:contain;transform:none"' : ''} alt="${escapeHtml(m.image_alt || `${m.title} project visual`)}" loading="lazy"></div>` : ''}<div class="details"><h3 class="title-ref">${escapeHtml(m.title)}</h3><p class="description">${escapeHtml(m.description)}</p></div></div></a>`;
			})
			.join('');
	}
</script>

<section
	id={sectionTitle.toLowerCase().replace(/\s+/g, '-')}
	class="section slug-section"
	use:fadeIn
>
	<h2 class="section-title">{sectionTitle}</h2>
	{#if $availableTags.length > 0}
		<div class="tag-filter">
			<SearchableDropdown
				options={$viableTags}
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
			<a
				class="timeline-content"
				href={getItemUrl(item)}
				target={item.metadata?.skip ? '_blank' : null}
				rel={item.metadata?.skip ? 'noopener noreferrer' : null}
			>
				<div class="header-container">
					{#if item.metadata?.date}
						<span class="date">{item.metadata.date}</span>
					{/if}
					{#if item.metadata?.tags}
						<div class="tags-container">
							{#each Array.isArray(item.metadata.tags) ? item.metadata.tags : item.metadata.tags
										.split(/[\s,]+/)
										.map((t) => t.trim()) as tag}
								<span class="card-tag">{tag}</span>
							{/each}
						</div>
					{/if}
				</div>
				<div class="card-container">
					{#if item.metadata?.image}
						<div class="card-image">
							<img
								src={item.metadata.image}
								style={item.metadata?.image_fit === 'contain'
									? 'object-fit:contain;transform:none'
									: undefined}
								alt={item.metadata?.image_alt ||
									(item.metadata?.title ? `${item.metadata.title} image` : 'Card image')}
								loading="lazy"
							/>
						</div>
					{/if}
					<div class="details">
						<h3 class="title-ref">{item.metadata?.title}</h3>
						{#if item.metadata?.description}
							<p class="description">
								<TruncatedMarkdown text={item.metadata.description} limit={truncationLimit} />
							</p>
						{/if}
					</div>
				</div>
			</a>
		{/each}
	{/if}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	<noscript><div class="nojs-projects">{@html noJsCards()}</div></noscript>
	<Pagination
		currentPage={$currentPage}
		totalPages={$totalPages}
		onPageChange={handlePageChange}
		{totalItems}
		itemLabel={sectionTitle}
	/>
</section>
