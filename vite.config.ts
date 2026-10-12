import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Only reviewed images in static/ are public. Draft Markdown assets are not copied.
export default defineConfig({ plugins: [sveltekit()] });
