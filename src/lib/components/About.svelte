<script lang="ts">
	import type { PortfolioData } from '../types/types.js';
	import { marked } from 'marked';
	import { asset } from '$lib/utils/assetUtils';
	export let portfolioData: PortfolioData;
</script>

<section id="about" class="intro">
	<div class="intro-text">
		<h1>{portfolioData.settings.name}</h1>
		<p class="title">{portfolioData.settings.title}</p>
		<div class="bio">
			{@html marked.parse(portfolioData.settings.bio)}
		</div>
		<div class="actions">
			{#each portfolioData.social as social}
				{#if social.name.toLowerCase() === 'email'}
					<a class="btn btn-primary" href={`mailto:${social.link}`}>Email me</a>
				{:else}
					<a class="btn" href={asset(social.link)} target="_blank" rel="noopener noreferrer">
						{#if social.icon}<img class="icon" src={asset(social.icon)} alt="" />{/if}
						{social.name}
					</a>
				{/if}
			{/each}
		</div>
		<ul class="tags">
			{#each portfolioData.settings.expertises as expertise}
				<li class="tag">{expertise}</li>
			{/each}
		</ul>
	</div>
	<img
		class="portrait"
		src={asset(portfolioData.settings.potrait_image)}
		alt={portfolioData.settings.name}
	/>
</section>

<style>
	.intro {
		display: grid;
		grid-template-columns: minmax(0, 1fr) min(34%, 21rem);
		gap: clamp(2rem, 6vw, 5rem);
		align-items: start;
		padding-top: calc(var(--nav-height) + clamp(2.5rem, 8vw, 6rem));
		padding-bottom: clamp(3.5rem, 8vw, 6rem);
	}

	h1 {
		margin: 0;
		font-size: clamp(2.5rem, 1.6rem + 4.2vw, 4.5rem);
		font-weight: 700;
		line-height: 1.02;
		letter-spacing: -0.035em;
		text-wrap: balance;
	}

	.title {
		margin: 0.75rem 0 0;
		color: var(--text-secondary-color);
		font-size: clamp(1.125rem, 1rem + 0.6vw, 1.5rem);
		letter-spacing: -0.01em;
	}

	.bio {
		max-width: 62ch;
		margin-top: 1.75rem;
		color: var(--text-secondary-color);
		font-size: 1.0625rem;
		line-height: 1.65;
	}

	.bio :global(p) {
		margin: 0 0 1em;
	}

	.bio :global(p:last-child) {
		margin-bottom: 0;
	}

	.bio :global(strong) {
		color: var(--text-color);
		font-weight: 600;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 1.75rem;
	}

	.tags {
		margin-top: 1.5rem;
	}

	.portrait {
		width: 100%;
		aspect-ratio: 1;
		border: 1px solid var(--border-color);
		border-radius: 1.5rem;
		object-fit: cover;
	}

	@media (prefers-reduced-motion: no-preference) {
		.intro-text > *,
		.portrait {
			animation: rise 0.7s var(--ease-out) both;
		}

		.intro-text > :nth-child(2) {
			animation-delay: 0.05s;
		}

		.intro-text > :nth-child(3),
		.portrait {
			animation-delay: 0.1s;
		}

		.intro-text > :nth-child(4) {
			animation-delay: 0.15s;
		}

		.intro-text > :nth-child(5) {
			animation-delay: 0.2s;
		}

		@keyframes rise {
			from {
				opacity: 0;
				transform: translateY(0.75rem);
			}
		}
	}

	@media (max-width: 900px) {
		.intro {
			grid-template-columns: minmax(0, 1fr);
		}

		.portrait {
			order: -1;
			width: 7.5rem;
			border-radius: 1.25rem;
		}
	}
</style>
