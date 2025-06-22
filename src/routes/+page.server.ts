import { error } from '@sveltejs/kit';
import { join } from 'path';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import type { PageServerLoad } from './$types';
import type { PageData, PortfolioSection, PortfolioData } from '$lib/types/types';
import { processContentSections } from '$lib/utils/contentUtils';

const portfolioData = yaml.load(readFileSync(join(process.cwd(), 'src', 'content', 'data', 'portfolio-data.yaml'), 'utf-8')) as PortfolioData;

export const prerender = true;

export const load: PageServerLoad = async () => {
    try {
        // Get all sections with paths from portfolio-data.yaml
        const markdownSections = (portfolioData.sections as PortfolioSection[]).filter((section): section is PortfolioSection & { path: string } => Boolean(section.path));

        // Load content for each section
        const contentBySection = processContentSections(markdownSections);

        const result: PageData = {
            content: contentBySection
        };

        return result;

    } catch (e) {
        console.error('Error loading main page content during prerender:', e);
        throw error(500, 'Failed to load portfolio content during prerender');
    }
};