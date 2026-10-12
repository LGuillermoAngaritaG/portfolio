<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import type { PortfolioData } from '../types/types';
	import ThemeSwitcher from './common/ThemeSwitcher.svelte';
	export let portfolioData: PortfolioData;

	let isOpen: boolean = false;
	let navElement: HTMLElement | undefined;

	const closeMenu = async (e?: MouseEvent): Promise<void> => {
		if (e && (e.target as Element).closest('.theme-switcher-wrapper')) {
			return;
		}

		isOpen = false;

		if (e) {
			const targetElement = e.currentTarget as HTMLAnchorElement;
			const href = targetElement.getAttribute('href');

			// Only prevent default and scroll if it's an internal hash link
			if (href && href.startsWith('#')) {
				e.preventDefault();
				// Check if we are already on the base path (home page)
				const isHomePage = window.location.pathname === base + '/';
				const isHomePageRoot = window.location.pathname === base;

				if (!isHomePage && !isHomePageRoot) {
					// Navigate to the base path (home page) plus the hash
					window.location.href = base + '/' + href;
				} else {
					// Already on the home page, just scroll
					const element = document.querySelector(href);
					if (element) {
						requestAnimationFrame(() => {
							element.scrollIntoView({ behavior: 'smooth' });
						});
					}
				}
			}
		}
	};

	// Function to convert section title to anchor link
	const titleToAnchor = (title: string): string => {
		return title.toLowerCase().replace(/\s+/g, '-');
	};

	// Generate dynamic navigation links
	$: navLinks = [
		{ title: 'About', href: `${base}/#about` },
		...portfolioData.sections.map((section) => ({
			title: section.title,
			href: `${base}/#${titleToAnchor(section.title)}`
		}))
	];

	onMount(() => {
		const handleClickOutside = (event: MouseEvent): void => {
			if (
				navElement &&
				!navElement.contains(event.target as Node) &&
				!(event.target as Element).closest('.theme-switcher-wrapper') &&
				isOpen
			) {
				closeMenu();
			}
		};

		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<header class="navigation" bind:this={navElement}>
	<nav class="container">
		<a href="{base}/" class="home-link" on:click={closeMenu}>{portfolioData.settings.name}</a>

		<div class="nav-right" class:open={isOpen}>
			<ul class="nav-links">
				{#each navLinks as link}
					<li><a href={link.href} on:click={closeMenu}>{link.title}</a></li>
				{/each}
			</ul>
		</div>

		<ThemeSwitcher />

		<button
			class="burger"
			on:click={() => (isOpen = !isOpen)}
			aria-label="Toggle navigation menu"
			aria-expanded={isOpen}
		>
			<span></span>
			<span></span>
		</button>
	</nav>
</header>

<style>
	.navigation {
		position: fixed;
		inset: 0 0 auto;
		z-index: 1000;
		border-bottom: 1px solid var(--border-color);
		background: var(--navbar-background);
		-webkit-backdrop-filter: blur(12px) saturate(1.6);
		backdrop-filter: blur(12px) saturate(1.6);
	}

	nav {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		height: var(--nav-height);
	}

	.home-link {
		margin-right: auto;
		color: var(--text-color);
		font-weight: 650;
		letter-spacing: -0.01em;
	}

	.home-link:hover {
		text-decoration: none;
	}

	.nav-links {
		display: flex;
		gap: 0.125rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.nav-links a {
		display: block;
		padding: 0.375rem 0.625rem;
		border-radius: 0.5rem;
		color: var(--text-secondary-color);
		font-size: 0.875rem;
		font-weight: 500;
		transition:
			color 0.15s ease,
			background-color 0.15s ease;
	}

	.nav-links a:hover {
		background: var(--hover-background-subtle);
		color: var(--text-color);
		text-decoration: none;
	}

	.burger {
		display: none;
		place-content: center;
		gap: 0.375rem;
		width: 2.25rem;
		height: 2.25rem;
		padding: 0;
		border: 0;
		border-radius: 0.5rem;
		background: none;
		cursor: pointer;
	}

	.burger span {
		width: 1.125rem;
		height: 1.5px;
		border-radius: 1px;
		background: var(--text-color);
		transition: transform 0.25s var(--ease-out);
	}

	.burger[aria-expanded='true'] span:first-child {
		transform: translateY(0.234rem) rotate(45deg);
	}

	.burger[aria-expanded='true'] span:last-child {
		transform: translateY(-0.234rem) rotate(-45deg);
	}

	@media (max-width: 960px) {
		.burger {
			display: grid;
		}

		.nav-right {
			position: absolute;
			top: 100%;
			right: 0;
			left: 0;
			padding: 0.5rem var(--gutter) 1rem;
			border-bottom: 1px solid var(--border-color);
			background: var(--background-color);
			visibility: hidden;
			opacity: 0;
			transform: translateY(-0.5rem);
			transition:
				opacity 0.2s ease,
				transform 0.25s var(--ease-out),
				visibility 0s 0.25s;
		}

		.nav-right.open {
			visibility: visible;
			opacity: 1;
			transform: none;
			transition-delay: 0s;
		}

		.nav-links {
			flex-direction: column;
			gap: 0;
		}

		.nav-links a {
			padding: 0.75rem 0;
			border-radius: 0;
			color: var(--text-color);
			font-size: 1.0625rem;
		}

		.nav-links a:hover {
			background: none;
			color: var(--secondary-color);
		}
	}
</style>
