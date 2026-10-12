<script lang="ts">
	import type { Skill } from '$lib/types/types';
	import { asset } from '$lib/utils/assetUtils';

	export let skillsData: Skill[] = [];
	export let sectionTitle: string;
</script>

<section id={sectionTitle.toLowerCase().replace(/\s+/g, '-')} class="section">
	<h2 class="section-title">{sectionTitle}</h2>
	<div class="skills-grid">
		{#each skillsData as skillCategory}
			<div>
				<h3>
					{#if skillCategory.icon}
						<img class="icon" src={asset(skillCategory.icon)} alt="" />
					{/if}
					{skillCategory.name}
				</h3>
				<ul class="tags">
					{#each skillCategory.skills as subskill}
						<li class="tag">{subskill}</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</section>

<style>
	.skills-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 2.25rem 3rem;
	}

	h3 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
	}

	@media (max-width: 600px) {
		.skills-grid {
			grid-template-columns: minmax(0, 1fr);
			gap: 1.75rem;
		}
	}
</style>
