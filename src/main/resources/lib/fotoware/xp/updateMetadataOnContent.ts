import type {SiteConfigProperties} from '/lib/fotoware/xp/AppConfig.d';
import type {Metadata} from '/types/Asset.d';
import type {MediaContent} from '/lib/fotoware/xp/MediaContent.d';



import 'core-js/stable/object/entries';
import {
	deleteIn,
	forceArray,
	isString,
	toStr
} from '@enonic/js-utils';
import {detailedDiff} from 'deep-object-diff';
//import HumanDiff from 'human-object-diff';
import deepEqual from 'fast-deep-equal';

import {capitalize} from '/lib/fotoware/xp/capitalize';
import {
	//PROPERTY_ON_CREATE,
	PROPERTY_IF_CHANGED,
	PROPERTY_OVERWRITE,
	X_APP_NAME
} from '/lib/fotoware/xp/constants';
import {unforceArray} from '/lib/fotoware/xp/unforceArray';


// const { diff: diffTags } = new HumanDiff({
// 	objectName: 'tags'
// });

declare global {
	interface XpXData {
		[key: typeof X_APP_NAME]: {
			fotoWare?: MediaContent['data']['fotoWare']
		}
	}
}

export const updateMetadataOnContent = ({
	content,
	md5sum,
	metadata,
	modify = false, // Create is the default
	properties
}: {
	content: Partial<MediaContent>
	md5sum: string
	metadata: Metadata
	modify?: boolean
	properties: SiteConfigProperties
}) => {
	// log.debug(`updateMetadataOnContent content:${toStr(content)}`);
	// log.debug('updateMetadataOnContent metadata:%s', toStr(metadata));
	// log.debug(`updateMetadataOnContent properties:${toStr(properties)}`);

	// BUG: Editing image in xp, removes x-data
	// So we have to store the information elsewhere, lets try normal content properties.
	// https://github.com/enonic/app-fotoware/issues/68
	//
	// {} is considered Truthy
	// https://developer.mozilla.org/en-US/docs/Glossary/Truthy
	if (!content.data) { content.data = {} as MediaContent['data']; }
	if (!content.data.fotoWare) { content.data.fotoWare = {}; }
	if (!content.data.fotoWare.metadata) { content.data.fotoWare.metadata = {}; }
	// log.debug('updateMetadataOnContent content.data.fotoWare.metadata:%s', toStr(content.data.fotoWare.metadata));

	const dereffedMetadata = JSON.parse(JSON.stringify(metadata)) as typeof metadata;
	// log.debug(`dereffedMetadata:${toStr(dereffedMetadata)}`);

	//──────────────────────────────────────────────────────────────────────────
	// Title -> DisplayName
	// When you create an image in Enonic XP, the displayName is copied from the _name.
	// An empty displayName is not allowed on Enonic XP content.
	// The metadata field title can actually be empty in FotoWare.
	//──────────────────────────────────────────────────────────────────────────
	const title = dereffedMetadata[5] ? unforceArray(dereffedMetadata[5].value) : undefined;
	//log.debug(`properties.displayName:${properties.displayName}`);
	//log.debug(`title:${title}`);
	//log.debug(`content.data.fotoWare.metadata[5]:${content.data.fotoWare.metadata[5]}`);
	//log.debug(`modify:${modify}`);
	if (
		isString(title)
		&& title.length !== 0
		&& content.displayName !== title
		&& (
			properties.displayName === PROPERTY_OVERWRITE
			|| (properties.displayName === PROPERTY_IF_CHANGED && title !== content.data.fotoWare.metadata[5])
			|| !modify // ASSUMING PROPERTY_ON_CREATE
		)
	) {
		log.debug(`Changing displayName from:${content.displayName} to:${title}`);
		content.displayName = title;
	}

	// Enonic doesn't store empty string "", but of course JavaScript does.
	// The diff tools therefore sees a difference...
	if (content.data.fotoWare.metadata[5] !== title) {
		if (isString(title) && title.length !== 0) {
			content.data.fotoWare.metadata[5] = title;
		} else {
			delete content.data.fotoWare.metadata[5];
		}
	}

	delete dereffedMetadata[5];

	//──────────────────────────────────────────────────────────────────────────
	// Author
	//──────────────────────────────────────────────────────────────────────────
	const artist = dereffedMetadata[80] ? unforceArray(dereffedMetadata[80].value) : undefined;
	if (
		!deepEqual(content.data.artist, artist) && (
			properties.artist === PROPERTY_OVERWRITE
			|| (properties.artist === PROPERTY_IF_CHANGED && !deepEqual(artist, content.data.fotoWare.metadata[80]))
			|| !modify // ASSUMING PROPERTY_ON_CREATE
		)
	) {
		log.debug(`Artist diff:${toStr(detailedDiff(
			content.data.artist as object,
			artist as object
		))}`);
		content.data.artist = artist;
	}

	// Enonic doesn't store empty string "", but of course JavaScript does.
	// The diff tools therefore sees a difference...
	if (
		(Array.isArray(artist) && artist.length > 0)
		||
		(isString(artist) && artist.length > 0)
	) {
		content.data.fotoWare.metadata[80] = artist;
	} else {
		delete content.data.fotoWare.metadata[80];
	}

	delete dereffedMetadata[80];

	//──────────────────────────────────────────────────────────────────────────
	// Copyright String
	//──────────────────────────────────────────────────────────────────────────
	const copyright = dereffedMetadata[116] ? unforceArray(dereffedMetadata[116].value) : undefined;
	if (
		content.data.copyright !== copyright && (
			properties.copyright === PROPERTY_OVERWRITE
			|| (properties.copyright === PROPERTY_IF_CHANGED && copyright !== content.data.fotoWare.metadata[116])
			|| !modify // ASSUMING PROPERTY_ON_CREATE
		)
	) {
		log.debug(`Changing copyright from:${content.data.copyright} to:${copyright}`);
		content.data.copyright = forceArray(copyright).join(' ');
	}

	// Enonic doesn't store empty string "", but of course JavaScript does.
	// The diff tools therefore sees a difference...
	if (content.data.fotoWare.metadata[116] !== copyright) {
		if (isString(copyright) && copyright.length !== 0) {
			content.data.fotoWare.metadata[116] = copyright;
		} else {
			delete content.data.fotoWare.metadata[116];
		}
	}

	delete dereffedMetadata[116];

	//──────────────────────────────────────────────────────────────────────────
	// Keywords
	//──────────────────────────────────────────────────────────────────────────
	const tags = dereffedMetadata[25]
		? unforceArray( // ['single'] -> 'single' // [''] -> undefined // [] -> undefined
			forceArray(dereffedMetadata[25].value) // Turns 'single' into ['single'] so map always works
				.map(v => capitalize(v))
		)
		: undefined;
	// Can be undefined, 'single entry', ['one','two','or more entries']
	// Not '' and []
	if (
		!deepEqual(content.data.tags, tags) && (
			properties.tags === PROPERTY_OVERWRITE
			|| (properties.tags === PROPERTY_IF_CHANGED && !deepEqual(tags, content.data.fotoWare.metadata[25]))
			|| !modify // ASSUMING PROPERTY_ON_CREATE
		)
	) {
		log.debug(`Tags diff:${toStr(detailedDiff(
			content.data.tags as object,
			tags as object
		))}`);
		content.data.tags = tags;
	}

	if (
		(Array.isArray(tags) && tags.length > 0)
		||
		(isString(tags) && tags.length > 0)
	) {
		content.data.fotoWare.metadata[25] = tags;
	} else {
		delete content.data.fotoWare.metadata[25];
	}

	delete dereffedMetadata[25];

	//──────────────────────────────────────────────────────────────────────────
	// Description
	//──────────────────────────────────────────────────────────────────────────
	const description = dereffedMetadata[120] ? unforceArray(dereffedMetadata[120].value) : undefined;
	if (!content.x) {
		content.x = {}
	}
	if (!content.x['media']) {
		content.x['media'] = {}
	}
	if (!content.x['media']['imageInfo']) {
		content.x['media']['imageInfo'] = {}
	}
	if (
		content.x['media']['imageInfo']['description'] !== description && (
			properties.description === PROPERTY_OVERWRITE
			|| (properties.description === PROPERTY_IF_CHANGED && description !== content.data.fotoWare.metadata[120])
			|| !modify // ASSUMING PROPERTY_ON_CREATE
		)
	) {
		log.debug(`Changing description from:${content.x['media']['imageInfo']['description']} to:${description}`);
		content.x['media']['imageInfo']['description'] = description ? forceArray(description).join(' ') : undefined;
	}

	// Enonic doesn't store empty string "", but of course JavaScript does.
	// The diff tools therefore sees a difference...
	if (content.data.fotoWare.metadata[120] !== description) {
		if (isString(description) && description.length !== 0) {
			content.data.fotoWare.metadata[120] = description;
		} else {
			delete content.data.fotoWare.metadata[120];
		}
	}

	delete dereffedMetadata[120];

	// TODO remove the field containing the Enonic node._id ?

	//──────────────────────────────────────────────────────────────────────────
	// Always update md5sum
	//──────────────────────────────────────────────────────────────────────────
	if (!content.data.fotoWare.md5sum) {
		content.data.fotoWare.md5sum = md5sum;
	} else if (content.data.fotoWare.md5sum !== md5sum) {
		log.warning(`md5sum changed from:${content.data.fotoWare.md5sum} to ${md5sum} on _path:${content._path}`);
		content.data.fotoWare.md5sum = md5sum;
	}

	//──────────────────────────────────────────────────────────────────────────
	// The rest (Has no settings for PROPERTY_OVERWRITE, PROPERTY_IF_CHANGED, PROPERTY_ON_CREATE)
	//─────────────────────────────────────────────────────────────────────────
	// for (const k in dereffedMetadata) {
	for (const [k, v] of Object.entries(dereffedMetadata)) {
	// Object.keys(dereffedMetadata).forEach((k) => {
		// log.debug('typeof k:%s prototype:%s', typeof k, Object.prototype.toString.call(k).slice(8,-1)); // string String
		const value = unforceArray(v.value);
		// log.debug('Setting metadata key:%s to:%s prev:%s', k, toStr(value), toStr(content.data.fotoWare.metadata[k]));
		// Enonic doesn't store empty string "", but of course JavaScript does.
		// The diff tools therefore sees a difference...
		if (content.data.fotoWare.metadata[k] !== value) {
			if (isString(value) && value.length !== 0) {
				content.data.fotoWare.metadata[k] = value;
			}
		}
	}

	// Delete metadata keys that are not in FotoWare anymore
	Object.keys(content.data.fotoWare.metadata).forEach((key) => {
		if (!metadata[key]) {
			log.debug('Deleting metadata key:%s value:%s', key, toStr(content!.data!.fotoWare!.metadata![key]), ); // eslint-disable-line @typescript-eslint/no-non-null-assertion
			delete content!.data!.fotoWare!.metadata![key]; // eslint-disable-line @typescript-eslint/no-non-null-assertion
		}
	});

	// Cleanup for diff
	if (Object.keys(content.data.fotoWare.metadata).length === 0) {
		delete content.data.fotoWare.metadata;
	}
	if (Object.keys(content.x['media']['imageInfo']).length === 0) {
		delete content.x['media']['imageInfo'];
	}
	if (Object.keys(content.x['media']).length === 0) {
		delete content.x['media'];
	}

	// Cleanup old x-data
	// if (checkNested(content, 'x', X_APP_NAME, 'fotoWare')) {
	deleteIn(content, ['x', X_APP_NAME, 'fotoWare']);
	deleteIn(content, ['x', X_APP_NAME]);
	// if (content.x[X_APP_NAME] && (content.x[X_APP_NAME] as unknown as MediaContent['data'])['fotoWare']) {
	// 	delete (content.x[X_APP_NAME] as unknown as MediaContent['data'])['fotoWare'];
	// 	if (Object.keys(content.x[X_APP_NAME] as unknown as MediaContent['data']).length === 0) {
	// 		delete (content.x[X_APP_NAME]); // eslint-disable-line @typescript-eslint/no-non-null-assertion
	// 	}
	// }

	if (Object.keys(content.x).length === 0) {
		delete content.x;
	}

	//log.debug(`modified content:${toStr(content)}`);
	return content;
}
