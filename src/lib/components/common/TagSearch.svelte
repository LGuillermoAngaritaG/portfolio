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
			{placeholder}
			class="search-input"
		/>
	</div>

	<div class="search-tags-container">
		<button class="search-tag" class:active={value.length === 0} on:click={clearAllTags} type="button">
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
		flex-direction: row;
		gap: 1rem;
		align-items: center;
		margin: 0 20px;
	}

	.search-container {
		width: 100%;
		max-width: 300px;
	}

	.search-input {
		width: 100%;
		padding: 0.6rem;
		border: 2px solid var(--primary-color, #ccc);
		border-radius: 20px;
		background-color: var(--background-color, #fff);
		color: var(--text-color, #333);
		font-size: 1rem;
		outline: none;
	}

	.search-input:focus {
		outline: 2px solid var(--primary-color, #007bff);
		outline-offset: 1px;
	}

	.search-tags-container {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		overflow: hidden;
		max-height: 36px;
		padding: 0 4px;
	}

	.search-tag {
		background: var(--tag-background, #f0f0f0);
		color: var(--tag-color, #333);
		border: var(--tag-border, 1px solid #ddd);
		padding: 8px 12px;
		border-radius: 20px;
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.search-tag:hover {
		transform: scale(1.05);
		background: var(--tag-background-hover, #e0e0e0);
		box-shadow: 0 2px 8px var(--tag-shadow-hover, rgba(0, 0, 0, 0.1));
	}

	.search-tag.active {
		background: var(--primary-color, #007bff);
		color: var(--background-color, #fff);
		border-color: var(--primary-color, #007bff);
	}

	@media (max-width: 900px) {
		.tags-wrapper {
			flex-direction: column;
			align-items: flex-start;
		}
		.search-container {
			max-width: 200px;
		}
	}
</style>
