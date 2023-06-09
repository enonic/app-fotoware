import type {OneOrMore} from '@enonic/js-utils/types';
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
export function shouldUpdateCopyright({
	copyright,
	content,
	properties,
	// Optional
	modify = false // Create is the default "mode" of this function,
}: {
	copyright: OneOrMore<string>|undefined
	content: MediaContent
	properties: SiteConfig['properties']
	// Optional
	modify?: boolean
}) {
	if (content.data.copyright === copyright) { // No changes, no point in updating
		return false;
	}

	// In case the media content was just created, we should ALWAYS update copyright.
	// In other words the properties.copyright setting doesn't matter on create.
	if (!modify) {
		return true;
	}

	// Since the media content already existed, lets consult settings on what to do.

	if (properties.copyright === PROPERTY_OVERWRITE) {
		return true;
	}

	if (
		properties.copyright === PROPERTY_IF_CHANGED
		&& content.data.fotoWare.metadata
		&& content.data.fotoWare.metadata[80]
		&& copyright !== content.data.fotoWare.metadata[80]
	) {
		return true;
	}

	// Even though there is a new value for copyright, we're not gonna change it
	// because the properties.copyright setting is set to PROPERTY_ON_CREATE
	return false;
}
