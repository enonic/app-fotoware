import type {OneOrMore} from '@enonic/js-utils/src/types';
import type {SiteConfig} from '/lib/fotoware/xp/AppConfig';
import type {MediaContent} from '/lib/fotoware/xp/MediaContent';


import {
	PROPERTY_IF_CHANGED,
	PROPERTY_OVERWRITE
} from '/lib/fotoware/xp/constants';


// I think the idea for the modify parameter was that there are two
// instances when metadata potentially needs to be updated on the media content:
//  1. When the media content has just been created
//  2. When the media content already exist, but may need an update
export function shouldUpdateTags({
	tags,
	content,
	properties,
	// Optional
	modify = false // Create is the default "mode" of this function,
}: {
	tags: OneOrMore<string>|undefined
	content: MediaContent
	properties: SiteConfig['properties']
	// Optional
	modify?: boolean
}) {
	if (content.data.tags === tags) { // No changes, no point in updating
		return false;
	}

	// In case the media content was just created, we should ALWAYS update tags.
	// In other words the properties.tags setting doesn't matter on create.
	if (!modify) {
		return true;
	}

	// Since the media content already existed, lets consult settings on what to do.

	if (properties.tags === PROPERTY_OVERWRITE) {
		return true;
	}

	if (
		properties.tags === PROPERTY_IF_CHANGED
		&& content.data.fotoWare.metadata
		&& content.data.fotoWare.metadata[80]
		&& tags !== content.data.fotoWare.metadata[80]
	) {
		return true;
	}

	// Even though there is a new value for tags, we're not gonna change it
	// because the properties.tags setting is set to PROPERTY_ON_CREATE
	return false;
}
