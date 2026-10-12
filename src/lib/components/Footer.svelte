<script lang="ts">
	import type { PortfolioData } from '../types/types.js';
	import { asset } from '$lib/utils/assetUtils';

	export let portfolioData: PortfolioData;

	let copied: boolean = false;

	function copyToClipboard(email: string): void {
		if (!email) {
			console.error('Clipboard API not available.');
			alert('Sorry, copying to clipboard is not supported in your browser.');
			return;
		}
		navigator.clipboard
			.writeText(email)
			.then(() => {
				copied = true;
				requestAnimationFrame(() => {
					setTimeout(() => {
						copied = false;
					}, 2000);
				});
			})
			.catch((err: Error) => {
				console.error('Failed to copy email: ', err);
				alert('Failed to copy email to clipboard.');
			});
	}
</script>

<footer class="footer">
	<div class="container footer-content">
		<p class="footer-name">{portfolioData.settings.name}</p>

		<div class="footer-links">
			{#each portfolioData.social as social}
				{#if social.name.toLowerCase() === 'email'}
					<a href={`mailto:${social.link}`} class="email-link">{social.link}</a>
					<button
						class="footer-icon-link"
						on:click={() => social.link && copyToClipboard(social.link)}
						title="Copy email address"
						aria-label="Copy email address"
					>
						<img
							class="icon"
							src={asset(copied ? 'icons/check-icon.svg' : 'icons/copy-icon.svg')}
							alt={copied ? 'Copied' : ''}
						/>
					</button>
				{:else}
					<a
						class="footer-icon-link"
						href={asset(social.link)}
						title={social.name}
						aria-label={social.name}
						target="_blank"
						rel="noopener noreferrer"
					>
						<img class="icon" src={asset(social.icon)} alt="" />
					</a>
				{/if}
			{/each}
		</div>
	</div>
</footer>

<style>
	.footer {
		margin-top: 2rem;
		border-top: 1px solid var(--border-color);
	}

	.footer-content {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem 2rem;
		padding-block: 1.75rem;
	}

	.footer-name {
		margin: 0;
		font-weight: 600;
	}

	.footer-links {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1.25rem;
	}

	.email-link {
		color: var(--text-secondary-color);
		font-size: 0.9375rem;
	}

	.email-link:hover {
		color: var(--text-color);
	}

	/* Padding grows the hit area; the negative margin keeps the icons aligned with the text. */
	.footer-icon-link {
		display: grid;
		margin: -0.5625rem;
		padding: 0.5625rem;
		border: 0;
		border-radius: 0.5rem;
		background: none;
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.footer-icon-link:hover {
		background: var(--hover-background-subtle);
	}

	/* Keep the links clear of the chat button that floats in the corner. */
	@media (max-width: 80rem) {
		.footer-content {
			padding-bottom: 5.5rem;
		}
	}
</style>
