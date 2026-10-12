import { base } from '$app/paths';
import type { LayoutServerLoad } from './$types';
import type { PortfolioData } from '$lib/types/types';
import { join } from 'path';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';

export const load: LayoutServerLoad = async () => {
	const portfolioData = yaml.load(
		readFileSync(join(process.cwd(), 'src', 'content', 'data', 'portfolio-data.yaml'), 'utf-8')
	) as PortfolioData;

	const localUrl = (value: string) =>
		/^(?:[a-z][a-z0-9+.-]*:|[/#])/i.test(value) ? value : `${base}/${value}`;
	return {
		portfolioData: {
			...portfolioData,
			settings: {
				...portfolioData.settings,
				potrait_image: localUrl(portfolioData.settings.potrait_image)
			},
			social: portfolioData.social.map((social) => ({
				...social,
				icon: localUrl(social.icon),
				link: social.name.toLowerCase() === 'email' ? social.link : localUrl(social.link)
			}))
		}
	};
};
