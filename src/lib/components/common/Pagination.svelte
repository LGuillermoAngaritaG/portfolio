<script lang="ts">
	export let currentPage: number;
	export let totalPages: number;
	export let onPageChange: (newPage: number) => void;
	export let totalItems: number;
	export let itemLabel: string = 'items';

	function handlePageClick(newPage: number) {
		if (newPage >= 1 && newPage <= totalPages) {
			onPageChange(newPage);
		}
	}
</script>

{#if totalPages > 1}
	<div class="pagination">
		<button
			class="pagination-button"
			disabled={currentPage === 1}
			on:click={() => handlePageClick(currentPage - 1)}
			aria-label="Previous page"
		>
			Previous
		</button>
		{#each Array(totalPages) as _, i}
			<button
				class="pagination-button"
				class:active={currentPage === i + 1}
				on:click={() => handlePageClick(i + 1)}
				aria-label={`Go to page ${i + 1}`}
				aria-current={currentPage === i + 1 ? 'page' : undefined}
			>
				{i + 1}
			</button>
		{/each}
		<button
			class="pagination-button"
			disabled={currentPage === totalPages}
			on:click={() => handlePageClick(currentPage + 1)}
			aria-label="Next page"
		>
			Next
		</button>
		<span class="total-items">{totalItems} {itemLabel}</span>
	</div>
{/if}

<style>
	.pagination {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem;
		margin-top: 1.75rem;
	}

	.pagination-button {
		min-width: 2.25rem;
		height: 2.25rem;
		padding-inline: 0.625rem;
		border: 0;
		border-radius: 0.5rem;
		background: none;
		color: var(--text-secondary-color);
		font: inherit;
		font-size: 0.875rem;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		transition:
			color 0.15s ease,
			background-color 0.15s ease;
	}

	.pagination-button:hover:not(:disabled):not(.active) {
		background: var(--hover-background-subtle);
		color: var(--text-color);
	}

	.pagination-button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.pagination-button.active {
		background: var(--primary-color);
		color: var(--text-on-primary);
	}

	.total-items {
		margin-left: auto;
		color: var(--text-secondary-color);
		font-size: 0.875rem;
		white-space: nowrap;
	}
</style>
