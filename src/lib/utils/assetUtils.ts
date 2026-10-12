import { base } from '$app/paths';

/** Resolve a site-relative path (icons/x.svg, CV.pdf) against the base path; absolute paths and URLs pass through. */
export const asset = (path: string): string =>
	!path || /^(\/|[a-z]+:)/i.test(path) ? path : `${base}/${path}`;
