import type { LayoutServerLoad } from './$types';
import type { PortfolioData } from '$lib/types/types';
import { join } from 'path';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';

export const load: LayoutServerLoad = async () => {
    const portfolioData = yaml.load(readFileSync(join(process.cwd(), 'src', 'content', 'data', 'portfolio-data.yaml'), 'utf-8')) as PortfolioData;
    
    return {
        portfolioData
    };
};