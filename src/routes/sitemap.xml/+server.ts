import { generateRoutes } from '$lib/utils/routeUtils';
import { readFileSync } from 'node:fs';
import * as yaml from 'js-yaml';
import type { PortfolioData } from '$lib/types/types';
export const prerender = true;
export function GET() {
	const data = yaml.load(
		readFileSync('src/content/data/portfolio-data.yaml', 'utf8')
	) as PortfolioData;
	const paths = ['', ...generateRoutes(data).map((p) => `${p.type}/${p.slug}/`)];
	return new Response(
		`<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>https://lguillermoangaritag.github.io/portfolio/${path}</loc></url>`).join('')}</urlset>`,
		{ headers: { 'Content-Type': 'application/xml' } }
	);
}
