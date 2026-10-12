<script lang="ts">
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/themeStore';
	import type { LayoutData } from './$types';
	import '../styles/themes.css';
	import '../styles/global.css';
	import Navbar from '../lib/components/NavBar.svelte';
	import Footer from '../lib/components/Footer.svelte';
	import ChatBotWidget from '../lib/components/chatbot/ChatBotWidget.svelte';
	export let data: LayoutData;

	onMount(() => {
		// Theme is already applied by blocking script, just sync the store
		theme.init(data.portfolioData.settings?.theme || 'light');

		const handleHashChange = () => {
			const hash = window.location.hash;
			const currentPath = window.location.pathname;

			// Check if we're on a detail page (dynamic [type]/[slug] route)
			// This matches any path that follows the pattern: /content-type/content-slug
			const isDetailPage =
				currentPath !== '/' && currentPath.split('/').filter(Boolean).length === 2;

			if (hash && !isDetailPage) {
				requestAnimationFrame(() => {
					const element = document.querySelector(hash);
					if (element) {
						element.scrollIntoView({ behavior: 'smooth' });
					}
				});
			}
		};

		if (window.location.hash) {
			setTimeout(handleHashChange, 50);
		}

		window.addEventListener('hashchange', handleHashChange);
		return () => window.removeEventListener('hashchange', handleHashChange);
	});
</script>

<Navbar portfolioData={data.portfolioData} />
<main>
	<slot />
</main>
<Footer portfolioData={data.portfolioData} />
<ChatBotWidget portfolioData={data.portfolioData} />
