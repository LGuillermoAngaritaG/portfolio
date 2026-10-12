import { describe, expect, it, vi } from 'vitest';
import { isPublished } from '../utils/publication';
import { generateRoutes } from '../utils/routeUtils';
import { loadMarkdownFiles } from '../utils/markdownUtils';
import { loadNavigationItems } from '../utils/navigationUtils';
import { join } from 'node:path';
import { projects } from '../projectCatalog';

vi.mock('../utils/imageUtils', () => ({ processImagePath: (path: string) => path }));

describe('publication is opt-in at every content boundary', () => {
	it('rejects missing metadata, templates, drafts and future publication dates', () => {
		for (const metadata of [
			{},
			{ publication: 'draft' },
			{ publication: 'template' },
			{ publication: 'published', draft: true },
			{ publication: 'published', published_at: '2099-01-01' },
			{ publication: 'published', published_at: 'invalid' }
		])
			expect(isPublished(metadata)).toBe(false);
		expect(isPublished({ publication: 'published' })).toBe(true);
	});
	it('indexes, route entries and next-item navigation include only approved stories', () => {
		const path = 'src/content/projects';
		const expected = projects
			.filter((p) => p.category !== 'game')
			.map((p) => p.id)
			.sort();
		expect(
			loadMarkdownFiles(path)
				.map((p) => p.slug)
				.sort()
		).toEqual(expected);
		expect(
			generateRoutes({ sections: [{ title: 'Projects', type: 'cards_outside', path }] })
				.map((p) => p.slug)
				.sort()
		).toEqual(expected);
		expect(
			loadNavigationItems(join(process.cwd(), path))
				.map((p) => p.slug)
				.sort()
		).toEqual(expected);
	});
	it('all projects link internally and have distinct topic tags', () => {
		const items = loadMarkdownFiles('src/content/projects');
		expect(items).toHaveLength(projects.filter((p) => p.category !== 'game').length);
		for (const item of items) {
			expect(item.metadata.skip).toBe(false);
			expect(new Set(item.metadata.tags).size).toBeGreaterThanOrEqual(2);
			expect(item.metadata.link).toMatch(/^https:\/\//);
		}
		expect(new Set(items.map((item) => JSON.stringify(item.metadata.tags))).size).toBeGreaterThan(
			12
		);
	});
	it('sample blog posts are never listed', () =>
		expect(loadMarkdownFiles('src/content/blogs')).toEqual([]));
	it('the generated directory exposes only explicitly published projects', () => {
		expect(projects).toHaveLength(20);
		expect(projects.every((project) => isPublished(project))).toBe(true);
	});
	it('Games has its own routes and technical tags stay separate from metadata', () => {
		const games = loadMarkdownFiles('src/content/games');
		expect(games.map((p) => p.slug)).toEqual(['jetbreak']);
		const sections = [
			{ title: 'Projects', type: 'cards_outside', path: 'src/content/projects' },
			{ title: 'Games', type: 'cards_outside', path: 'src/content/games' }
		];
		expect(generateRoutes({ sections })).toContainEqual({ type: 'games', slug: 'jetbreak' });
		expect(generateRoutes({ sections })).not.toContainEqual({ type: 'projects', slug: 'jetbreak' });
		for (const project of projects) {
			expect(project.tags).not.toContain(project.typeLabel);
			expect(project.tags).not.toContain('Private Source');
			expect(project.tags).not.toContain('Public Source');
			if (project.source.license) expect(project.tags).not.toContain(project.source.license);
		}
	});
});
