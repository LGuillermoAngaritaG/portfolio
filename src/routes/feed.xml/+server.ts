import { loadMarkdownFiles } from '$lib/utils/markdownUtils';
export const prerender = true;
const xml = (value: string) =>
	value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
export function GET() {
	const items = loadMarkdownFiles('src/content/blogs');
	return new Response(
		`<?xml version="1.0"?><rss version="2.0"><channel><title>Guillermo Angarita</title><link>https://lguillermoangaritag.github.io/portfolio/</link><description>Published writing by Guillermo Angarita</description>${items.map((item) => `<item><title>${xml(item.metadata.title)}</title><description>${xml(item.metadata.description)}</description><link>https://lguillermoangaritag.github.io/portfolio/blogs/${item.slug}/</link></item>`).join('')}</channel></rss>`,
		{ headers: { 'Content-Type': 'application/rss+xml' } }
	);
}
