import data from '../content/data/canonical-projects.json';
import { isPublished } from './utils/publication';

export interface Project {
	id: string;
	publication: 'published' | 'draft' | 'template';
	name: string;
	category: string;
	tags: string[];
	featured: boolean;
	parent?: string;
	typeLabel: string;
	statusLabel: string;
	sourceLabel: string;
	source: { visibility: string; license: string | null };
	urls: { canonical: string; source?: string; downloads?: string; page?: string };
	action: { label: string; url: string };
	en: { description: string; limitation: string };
	platforms: { en: string; es: string }[];
	visual?: { path: string; en: string; es: string; width: number; height: number };
	attribution?: { en: string; es: string; url: string };
}

export const projects = (data.projects as Project[]).filter((project) => isPublished(project));
