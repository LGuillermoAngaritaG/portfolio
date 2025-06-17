<script lang="ts">
	import { marked } from 'marked';
	import TruncatedMarkdown from '$lib/components/common/TruncatedMarkdown.svelte';

	export let item: any;
	export let truncationLimit: number = 150;
</script>

<div class="timeline-content">
	<div class="details">
		<div class="header-container">
			<span class="date">{item.date}</span>
			{#if item.keywords}
				<div class="tags-container">
					{#each item.keywords as keyword}
						<span class="card-tag">{keyword}</span>
					{/each}
				</div>
			{/if}
		</div>
		<!-- Check for icon -->
		{#if item?.icon}
			<div class="timeline-header">
				<div class="timeline-icon">
					<img src={item.icon} alt="" />
				</div>
				<div class="timeline-title with-icon">
					{@html marked.parse(item.title)}
				</div>
			</div>
		{:else}
			<div class="timeline-title without-icon">
				{@html marked.parse(item.title)}
			</div>
		{/if}

		<div class="content-item">
			{#if item.description}
				<TruncatedMarkdown text={item.description} limit={truncationLimit} />
			{/if}
		</div>
	</div>
</div>

<style>
	/* Override default markdown heading styles */
	:global(.timeline-title h1),
	:global(.timeline-title h2),
	:global(.timeline-title h3),
	:global(.timeline-title h4),
	:global(.timeline-title h5),
	:global(.timeline-title h6),
	:global(.timeline-title p) {
		margin: 0;
		padding: 0;
		line-height: 1.4;
		font-size: 1.8rem;
		color: var(--primary-color);
		font-weight: 600;
	}
</style>
