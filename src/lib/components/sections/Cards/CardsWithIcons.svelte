<script lang="ts">
	import { fadeIn } from '$lib/utils/fadeInUtils';
	import type { Skill } from '$lib/types/types';
	import { onMount, afterUpdate } from 'svelte';

	export let skillsData: Skill[] = [];
	export let sectionTitle: string;

	import '/src/styles/cards-with-icons.css';

	let skillsGridElement: HTMLElement;

	function equalizeCardHeights() {
		if (!skillsGridElement) return;

		const skillWrappers = skillsGridElement.querySelectorAll(
			'.skill-wrapper'
		) as NodeListOf<HTMLElement>;

		if (skillWrappers.length === 0) return;

		// Reset heights first to get natural heights
		skillWrappers.forEach((wrapper) => {
			wrapper.style.height = 'auto';
		});

		// Find the maximum height
		let maxHeight = 0;
		skillWrappers.forEach((wrapper) => {
			const height = wrapper.offsetHeight;
			if (height > maxHeight) {
				maxHeight = height;
			}
		});

		// Apply the maximum height to all wrappers
		skillWrappers.forEach((wrapper) => {
			wrapper.style.height = `${maxHeight}px`;
		});
	}

	// Equalize heights after component mounts
	onMount(() => {
		equalizeCardHeights();
	});

	// Re-equalize heights after updates (e.g., when data changes)
	afterUpdate(() => {
		equalizeCardHeights();
	});
</script>

<section id={sectionTitle.toLowerCase().replace(/\s+/g, '-')} class="skills section" use:fadeIn>
	<h2 class="section-title">{sectionTitle}</h2>
	<div class="skills-grid" bind:this={skillsGridElement}>
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
				<div class="skill-wrapper">
					<div class="skill-tags">
						{#each skillCategory.skills as subskill}
							<span class="tag">{subskill}</span>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>
