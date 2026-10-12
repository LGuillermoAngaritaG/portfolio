<script lang="ts">
	import { theme, getThemeToggle } from '$lib/stores/themeStore';

	function toggleTheme() {
		const newTheme = getThemeToggle($theme);
		theme.set(newTheme);
	}

	// Helper function to determine if current theme is dark
	$: isDark = $theme === 'dark' || $theme.endsWith('-dark');
</script>

<button
	class="theme-switcher"
	on:click={toggleTheme}
	title="Switch to {isDark ? 'light' : 'dark'} mode"
	aria-label="Switch to {isDark ? 'light' : 'dark'} mode"
>
	<svg class="sun" viewBox="0 0 24 24" aria-hidden="true">
		<circle cx="12" cy="12" r="4" />
		<path
			d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
		/>
	</svg>
	<svg class="moon" viewBox="0 0 24 24" aria-hidden="true">
		<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" />
	</svg>
</button>

<style>
	.theme-switcher {
		display: grid;
		place-items: center;
		width: 2.25rem;
		height: 2.25rem;
		padding: 0;
		border: 0;
		border-radius: 0.5rem;
		background: none;
		color: var(--text-secondary-color);
		cursor: pointer;
		transition:
			color 0.15s ease,
			background-color 0.15s ease;
	}

	.theme-switcher:hover {
		background: var(--hover-background-subtle);
		color: var(--text-color);
	}

	svg {
		width: 1.125rem;
		height: 1.125rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.75;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	/* The icon follows the theme class set before first paint, so it never flickers on load. */
	.sun,
	:global(html[class*='dark']) .moon {
		display: none;
	}

	:global(html[class*='dark']) .sun {
		display: block;
	}
</style>
