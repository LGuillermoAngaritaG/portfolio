export interface PublicationMetadata {
	publication?: unknown;
	draft?: unknown;
	published_at?: unknown;
}

// Publication is opt-in. Section visibility and `skip` never authorize a route.
export function isPublished(metadata: PublicationMetadata, now = new Date()): boolean {
	if (metadata.publication !== 'published' || metadata.draft === true) return false;
	if (metadata.published_at !== undefined) {
		const date = new Date(String(metadata.published_at));
		return Number.isFinite(date.getTime()) && date <= now;
	}
	return true;
}
