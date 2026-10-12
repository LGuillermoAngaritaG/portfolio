<script lang="ts">
	export let options: string[] = [];
	export let value: string[] = [];
	export let placeholder: string = 'Search...';
	export let onChange: (newValue: string[]) => void;

	let searchTerm = '';

	$: filteredOptions = options.filter((option) =>
		option.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Get selected tags that match the search term
	$: selectedTagsFiltered = value.filter((tag) =>
		tag.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Get non-selected tags from filtered options
	$: nonSelectedOptions = filteredOptions.filter((option) => !value.includes(option));

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		searchTerm = target.value;
	}

	function toggleTag(tag: string) {
		if (value.includes(tag)) {
			// Remove tag if already selected
			onChange(value.filter((t) => t !== tag));
		} else {
			// Add tag if not selected
			onChange([...value, tag]);
		}
	}

	function clearAllTags() {
		onChange([]);
	}
</script>

<div class="tags-wrapper">
	<div class="search-container">
		<input
			type="search"
			bind:value={searchTerm}
			on:input={handleInput}
			autocomplete="off"
			autocapitalize="off"
			spellcheck="false"
			aria-label={placeholder}
			{placeholder}
			class="search-input"
		/>
	</div>

	<div class="search-tags-container">
		<button
			class="search-tag"
			class:active={value.length === 0}
			on:click={clearAllTags}
			type="button"
		>
			All Tags
		</button>

		<!-- Show selected tags first -->
		{#each selectedTagsFiltered as selectedTag}
			<button class="search-tag active" on:click={() => toggleTag(selectedTag)} type="button">
				{selectedTag}
			</button>
		{/each}

		<!-- Then show non-selected tags -->
		{#each nonSelectedOptions as option}
			<button class="search-tag" on:click={() => toggleTag(option)} type="button">
				{option}
			</button>
		{/each}
	</div>
</div>

<style>
	.tags-wrapper {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin-bottom: 1.75rem;
	}

	/* The search box and the tags share one wrapping row. */
	.search-container,
	.search-tags-container {
		display: contents;
	}

	.search-input,
	.search-tag {
		height: 2rem;
		padding-inline: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 999px;
		background: none;
		color: var(--text-secondary-color);
		font: inherit;
		font-size: 0.8125rem;
		font-weight: 500;
	}

	.search-input {
		width: 10rem;
		color: var(--text-color);
	}

	.search-input::placeholder {
		color: var(--text-secondary-color);
	}

	.search-tag {
		cursor: pointer;
		transition:
			color 0.15s ease,
			background-color 0.15s ease;
	}

	.search-tag:hover:not(.active) {
		background: var(--hover-background-subtle);
		color: var(--text-color);
	}

	.search-tag.active {
		border-color: transparent;
		background: var(--primary-color);
		color: var(--text-on-primary);
	}

	/* On phones the row scrolls sideways instead of pushing the list down. */
	@media (max-width: 600px) {
		.tags-wrapper {
			flex-wrap: nowrap;
			margin-inline: calc(-1 * var(--gutter));
			padding-inline: var(--gutter);
			overflow-x: auto;
			scrollbar-width: none;
		}

		.search-input,
		.search-tag {
			flex-shrink: 0;
			white-space: nowrap;
		}
	}
</style>
