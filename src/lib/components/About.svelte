<script lang="ts">
	import type { PortfolioData } from '../types/types.js';
	import { marked } from 'marked';
	export let portfolioData: PortfolioData;
</script>

<section id="about" class="intro">
	<div class="intro-content">
		<div class="left-content">
			<div class="top-left">
				<span class="title-tag">{portfolioData.settings.title}</span>
				<div class="social-links">
					{#each portfolioData.social as social}
						{#if social.name.toLowerCase() !== 'email'}
							<a
								href={social.link}
								class="social-link"
								title={social.name}
								target="_blank"
								rel="noopener noreferrer"
							>
								<img src={social.icon} alt={social.name + ' icon'} />
							</a>
						{/if}
					{/each}
				</div>
				<h2>{portfolioData.settings.name}</h2>
			</div>
			<div class="right-content mobile-image">
				<img
					src={portfolioData.settings.potrait_image}
					alt={portfolioData.settings.name}
					class="profile-image"
				/>
			</div>
			<div class="bottom-left">
				<div class="markdown-content">
					{@html marked.parse(portfolioData.settings.bio)}
				</div>
				<div class="expertise-tags">
					{#each portfolioData.settings.expertises as expertise}
						<span class="expertise-tag">{expertise}</span>
					{/each}
				</div>
			</div>
		</div>
		<div class="right-content desktop-image">
			<img
				src={portfolioData.settings.potrait_image}
				alt={portfolioData.settings.name}
				class="profile-image"
			/>
		</div>
	</div>
</section>

<style>
	.intro {
		max-width: 100%;
		padding: 80px 20px;
		font-family: var(--font-system);
		margin-top: 100px;
		background: linear-gradient(
			145deg,
			var(--card-background, white),
			var(--background-color, #f8f9fa)
		);
		transition: background-color 0.3s ease;
	}

	.intro-content {
		display: flex;
		flex-direction: row;
		height: 100%;
	}

	.left-content {
		display: flex;
		flex-direction: column;
		flex: 1 1 0;
		min-width: 0;
		text-align: left;
		padding: 20px;
		animation: slideIn 0.8s ease-out;
	}

	.top-left {
		display: flex;
		flex-direction: row;
		align-items: center;
		flex-wrap: wrap;
		margin-top: 30px;
	}

	.bottom-left {
		display: flex;
		flex-direction: column;
		flex: 1 1 0;
	}

	.right-content {
		flex: 1 1 0;
		display: flex;
		align-items: center;
		justify-content: center;
		animation: fadeIn 1s ease-out;
	}

	.social-links {
		display: flex;
		flex-direction: row;
		gap: 10px;
		margin-left: 6px;
	}

	.social-link img {
		width: 30px;
		height: 30px;
		transition: filter 0.3s ease;
		filter: var(--icon-filter, invert(0%) brightness(1));
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(-30px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.left-content h2 {
		font-size: 4rem;
		background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		margin: 0px 0;
		width: 100%;
		margin-top: 5px;
	}

	.markdown-content {
		margin: 0;
		color: var(--text-secondary-color);
		font-size: 1.2rem;
		margin-top: 0px;
		font-family: var(--font-system);
		line-height: 1.6;
	}

	.title-tag {
		background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
		color: var(--text-on-primary, white);
		box-shadow: 0 4px 15px var(--shadow-primary-medium, rgba(34, 139, 230, 0.2));
		padding: 8px 16px;
		border-radius: 20px;
		font-size: 1.1rem;
		font-weight: 500;
		display: inline-block;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease,
			background 0.3s ease,
			color 0.3s ease;
	}

	.expertise-tags {
		padding: 10px 0;
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
		max-width: 100%;
	}

	.expertise-tag {
		background: var(--tag-background);
		color: var(--tag-color);
		border: var(--tag-border);
		padding: 8px 16px;
		border-radius: 20px;
		font-size: 1rem;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.profile-image {
		width: 100%;
		max-width: 500px;
		min-width: 400px;
		min-height: 300px;
		height: auto;
		border-radius: 20px;

		box-shadow: var(--image-shadow, var(--card-shadow));
		transition: all 0.3s ease;
	}

	/* Hide mobile image by default, show desktop image */
	.mobile-image {
		display: none;
	}
	.desktop-image {
		display: flex;
	}

	.top-left .social-links {
		margin-left: 10px;
		gap: 10px;
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 1400px) {
		.intro {
			padding: 20px 10px;
			margin-top: 80px;
		}
		.intro-content {
			flex-direction: column;
			align-items: center;
		}
		.left-content,
		.right-content {
			max-width: 100%;
			text-align: center;
		}
		.left-content {
			padding: 0px;
		}
		.left-content h2 {
			font-size: 3rem;
		}
		.profile-image {
			width: 80%;
		}

		.title-tag {
			font-size: 14px;
		}

		.expertise-tags {
			max-width: 100%;
			justify-content: center;
		}

		.profile-image {
			width: 90%;
			max-width: 800px;
		}

		.social-links {
			justify-content: center;
		}
    .mobile-image {
			display: flex;
			justify-content: center;
			width: 100%;
			margin: 20px 0;
		}
	}

	@media (max-width: 900px) {
		.intro {
			margin-top: 100px;
		}
		.title-tag {
			font-size: 12px;
			position: relative;
			left: 0;
			align-self: flex-start;
			z-index: 1;
		}
		.left-content {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			text-align: left;
		}
		.profile-image {
			min-width: unset;
			border-radius: 15px;
		}

		.expertise-tag {
			font-size: 0.9rem;
			padding: 6px 12px;
		}
		.intro-content {
			flex-direction: column;
		}
		.mobile-image {
			display: flex;
			justify-content: center;
			width: 100%;
			margin: 20px 0;
		}
		.desktop-image {
			display: none;
		}
	}
</style>
