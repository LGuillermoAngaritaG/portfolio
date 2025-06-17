<script lang="ts">
	import { fadeIn } from '$lib/utils/fadeInUtils';
	import type { Skill } from '$lib/types/types';
	export let skillsData: Skill[] = [];
	export let sectionTitle: string;

	import '/src/styles/cards-with-icons.css';

	import { onMount } from 'svelte';

	let resizeObserver: ResizeObserver;

	// Match height of all .skill-card elements
	function matchHeights(): void {
		const cards = document.querySelectorAll<HTMLElement>('.skill-card');
		let maxHeight = 0;

		// Reset heights
		cards.forEach(card => (card.style.height = 'auto'));

		// Find tallest card
		cards.forEach(card => {
			maxHeight = Math.max(maxHeight, card.offsetHeight);
		});

		// Apply height to all cards
		cards.forEach(card => {
			card.style.height = `${maxHeight}px`;
		});
	}

	onMount(() => {
		matchHeights();

		const handleResize = () => matchHeights();
		window.addEventListener('resize', handleResize);

		// Optional: observe changes inside cards (e.g. if content loads dynamically)
		const cards = document.querySelectorAll('.skill-card');
		resizeObserver = new ResizeObserver(() => matchHeights());
		cards.forEach(card => resizeObserver.observe(card));

		return () => {
			window.removeEventListener('resize', handleResize);
			resizeObserver.disconnect();
		};
	});
</script>

<section id={sectionTitle.toLowerCase().replace(/\s+/g, '-')} class="skills section" use:fadeIn>
	<h2 class="section-title">{sectionTitle}</h2>
	<div class="skills-grid">
		{#each skillsData as skillCategory}
			<div class="skill-card">
				<div class="skill-header">
					{#if skillCategory.icon}
						<div class="skill-icon">
							<img src={skillCategory.icon} alt={`${skillCategory.name} logo`} />
						</div>
					{/if}
					<h3>{skillCategory.name}</h3>
				</div>
				<div class="skill-tags">
					{#each skillCategory.skills as subskill}
						<span class="tag">{subskill}</span>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</section>

