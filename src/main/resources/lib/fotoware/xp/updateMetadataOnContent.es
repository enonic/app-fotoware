import {capitalize} from '/lib/fotoware/xp/capitalize';
import {
	//PROPERTY_ON_CREATE,
	PROPERTY_IF_CHANGED,
	PROPERTY_OVERWRITE,
	X_APP_NAME
} from '/lib/fotoware/xp/constants';
import {unforceArray} from '/lib/fotoware/xp/unforceArray';
//import {toStr} from '/lib/util';
import {forceArray} from '/lib/util/data'


export const updateMetadataOnContent = ({
	content,
	md5sum,
	metadata,
	modify = false, // Create is the default
	properties
}) => {
	//log.debug(`content:${toStr(content)}`);
	//log.debug(`updateMetadataOnContent properties:${toStr(properties)}`);

	// BUG: Editing image in xp, removes x-data
	// So we have to store the information elsewhere, lets try normal content properties.
	// https://github.com/enonic/app-fotoware/issues/68
	if (!content.data) { content.data = {}; }
	if (!content.data.fotoWare) { content.data.fotoWare = {}; }
	content.data.fotoWare.metadata = {}; // Always start from scratch

	const dereffedMetadata = JSON.parse(JSON.stringify(metadata));

	//──────────────────────────────────────────────────────────────────────────
	// Title
	//──────────────────────────────────────────────────────────────────────────
	const title = dereffedMetadata[5] ? unforceArray(dereffedMetadata[5].value) : undefined;
	delete dereffedMetadata[5];
	//──────────────────────────────────────────────────────────────────────────
	// Title -> DisplayName
	//──────────────────────────────────────────────────────────────────────────
	if (
		properties.displayName === PROPERTY_OVERWRITE
		|| (properties.displayName === PROPERTY_IF_CHANGED && title !== content.data.fotoWare.metadata[5])
		|| !modify // ASSUMING PROPERTY_ON_CREATE
	) {
		content.displayName = title;
	}
	content.data.fotoWare.metadata[5] = title;

	//──────────────────────────────────────────────────────────────────────────
	// Author
	//──────────────────────────────────────────────────────────────────────────
	const artist = dereffedMetadata[80] ? unforceArray(dereffedMetadata[80].value) : undefined;
	delete dereffedMetadata[80];
	if (
		properties.artist === PROPERTY_OVERWRITE
		|| (properties.artist === PROPERTY_IF_CHANGED && artist !== content.data.fotoWare.metadata[80])
		|| !modify // ASSUMING PROPERTY_ON_CREATE
	) {
		content.data.artist = artist;
	}
	content.data.fotoWare.metadata[80] = artist;

	//──────────────────────────────────────────────────────────────────────────
	// Copyright String
	//──────────────────────────────────────────────────────────────────────────
	const copyright = dereffedMetadata[116] ? unforceArray(dereffedMetadata[116].value) : undefined;
	delete dereffedMetadata[116];
	if (
		properties.copyright === PROPERTY_OVERWRITE
		|| (properties.copyright === PROPERTY_IF_CHANGED && copyright !== content.data.fotoWare.metadata[116])
		|| !modify // ASSUMING PROPERTY_ON_CREATE
	) {
		content.data.copyright = copyright;
	}
	content.data.fotoWare.metadata[116] = copyright;

	//──────────────────────────────────────────────────────────────────────────
	// Keywords
	//──────────────────────────────────────────────────────────────────────────
	const tags = dereffedMetadata[25] ? unforceArray(forceArray(dereffedMetadata[25].value).map(v => capitalize(v))) : undefined;
	delete dereffedMetadata[25];
	if (
		properties.tags === PROPERTY_OVERWRITE
		|| (properties.tags === PROPERTY_IF_CHANGED && tags !== content.data.fotoWare.metadata[25])
		|| !modify // ASSUMING PROPERTY_ON_CREATE
	) {
		content.data.tags = tags;
	}
	content.data.fotoWare.metadata[25] = tags;

	//──────────────────────────────────────────────────────────────────────────
	// Description
	//──────────────────────────────────────────────────────────────────────────
	const description = dereffedMetadata[120] ? unforceArray(dereffedMetadata[120].value) : undefined;
	delete dereffedMetadata[120];
	if (
		properties.description === PROPERTY_OVERWRITE
		|| (properties.description === PROPERTY_IF_CHANGED && description !== content.data.fotoWare.metadata[120])
		|| !modify // ASSUMING PROPERTY_ON_CREATE
	) {
		content.data.description = description;
	}
	content.data.fotoWare.metadata[120] = description;

	// TODO remove the field containing the Enonic node._id ?

	// Always update md5sum
	if (!content.data.fotoWare.md5sum) {
		content.data.fotoWare.md5sum = md5sum;
	} else if (content.data.fotoWare.md5sum !== md5sum) {
		log.warning(`md5sum changed from:${content.data.fotoWare.md5sum} to ${md5sum} on _path:${content._path}`);
		content.data.fotoWare.md5sum = md5sum;
	}

	// The rest (Has no settings for PROPERTY_OVERWRITE, PROPERTY_IF_CHANGED, PROPERTY_ON_CREATE)
	Object.keys(dereffedMetadata).forEach((k) => {
		content.data.fotoWare.metadata[k] = unforceArray(dereffedMetadata[k].value);
	});

	// Cleanup old metadata
	if (content.x && content.x[X_APP_NAME] && content.x[X_APP_NAME].fotoWare) {
		delete content.x[X_APP_NAME].fotoWare;
	}

	//log.debug(`modified content:${toStr(content)}`);
	return content;
}
