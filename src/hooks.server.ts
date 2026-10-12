import type { Handle } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';

// Load portfolio data
let portfolioData: any;
try {
	portfolioData = yaml.load(readFileSync(join(process.cwd(), 'src', 'content', 'data', 'portfolio-data.yaml'), 'utf-8'));
} catch (error) {
	console.error('Error loading portfolio data in hooks:', error);
	portfolioData = { settings: { favicon: 'favicon.png', basePath: '' } };
}

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/.well-known/')) {
		// You can return a 404 response or handle it however you want
		return new Response('Not found', { status: 404 });
	}
	
	return resolve(event, {
		transformPageChunk: ({ html }) => {
			// Replace the hardcoded favicon with the one from portfolio data
			const faviconUrl = portfolioData.settings?.favicon || 'favicon.png';
			
			// Get the site name from portfolio data
			const siteName = portfolioData.settings?.name || 'Close Portfolio';
			
			// Use the same logic as svelte.config.js for base path
			// Only use basePath in production, empty string in development
			const basePath = process.env.NODE_ENV === 'production' 
				? (portfolioData.settings?.basePath || '') 
				: '';
			
			// Construct the favicon URL
			let absoluteFaviconUrl;
			
			if (faviconUrl.startsWith('/')) {
				// Already absolute path
				absoluteFaviconUrl = faviconUrl;
			} else {
				// For relative paths, add basePath if it exists
				if (basePath && basePath !== '') {
					// Ensure basePath starts with / and doesn't end with /
					const normalizedBasePath = basePath.startsWith('/') ? basePath : '/' + basePath;
					const cleanBasePath = normalizedBasePath.endsWith('/') ? normalizedBasePath.slice(0, -1) : normalizedBasePath;
					absoluteFaviconUrl = `${cleanBasePath}/${faviconUrl}`;
				} else {
					absoluteFaviconUrl = `/${faviconUrl}`;
				}
			}
			
			return html
				.replaceAll('%portfolio.theme%', portfolioData.settings?.theme || 'light')
				.replace(
					'<link rel="icon" href="favicon.png" />',
					`<link rel="icon" href="${absoluteFaviconUrl}" />`
				)
				.replace(
					'<title>Close Portfolio</title>',
					`<title>${siteName}</title>`
				);
		}
	});
};