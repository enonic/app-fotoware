import type {
	Mappings,
	MediaContent,
	Metadata,
	SiteConfigProperties
} from '/types';


import {
	deleteIn,
	forceArray,
	getIn,
	isString,
	setIn,
	toStr
} from '@enonic/js-utils';
import deepEqual from 'fast-deep-equal';
import {capitalize} from '/lib/fotoware/xp/capitalize';
import {
	PROPERTY_ON_CREATE,
	PROPERTY_IF_CHANGED,
	PROPERTY_OVERWRITE,
	X_APP_NAME
} from '/lib/fotoware/xp/constants';
import {unforceArray} from '/lib/fotoware/xp/unforceArray';


declare global {
	interface XpXData {
		[key: typeof X_APP_NAME]: {
			fotoWare?: MediaContent['data']['fotoWare']
		}
	}
}


const XP_PATH_TO_PROP: Record<string,string> = {
	'data.artist': 'artist',
	'data.copyright': 'copyright',
	'x.media.imageInfo.description': 'description',
	//'displayName': 'displayName',
	'data.tags': 'tags',
	//'data.altText': 'data.altText'
};


export const updateMetadataOnContent = ({
	content,
	mappings,
	md5sum,
	metadata,
	modify = false, // Create is the default
	properties
}: {
	content: Readonly<Partial<MediaContent>>
	mappings: Readonly<Mappings>,
	md5sum: string
	metadata: Readonly<Metadata>
	modify?: boolean
	properties: Readonly<SiteConfigProperties>
}) => {
	// log.debug(`updateMetadataOnContent content:${toStr(content)}`);
	// log.debug('updateMetadataOnContent metadata:%s', toStr(metadata));
	// log.debug(`updateMetadataOnContent properties:${toStr(properties)}`);

	const dereffedContent = JSON.parse(JSON.stringify(content)) as Partial<MediaContent>;
	// log.debug('dereffedContent:%s', toStr(dereffedContent));

	// BUG: Editing image in xp, removes x-data
	// So we have to store the information elsewhere, lets try normal content properties.
	// https://github.com/enonic/app-fotoware/issues/68
	//
	// {} is considered Truthy
	// https://developer.mozilla.org/en-US/docs/Glossary/Truthy
	if (!dereffedContent.data) { dereffedContent.data = {} as MediaContent['data']; }
	if (!dereffedContent.data.fotoWare) { dereffedContent.data.fotoWare = {}; }
	if (!dereffedContent.data.fotoWare.metadata) { dereffedContent.data.fotoWare.metadata = {}; }

	//──────────────────────────────────────────────────────────────────────────
	// Process metadata mappings against metadata from Fotoware into XP content
	//──────────────────────────────────────────────────────────────────────────
	Object.keys(mappings).forEach((metadataKey) => {
		const xpPaths = forceArray(mappings[metadataKey] as string|string[]);
		const metadataValue = metadata[metadataKey];
		const newValueFromFotoware = metadataValue ? unforceArray( // ['single'] -> 'single' // [''] -> undefined // [] -> undefined
			forceArray(metadataValue.value) // Turns 'single' into ['single'] so map always works
				.map(v => metadataKey === '25' ? capitalize(v) : v) // 25 is the index of the 'tags' key in the mappings
		) : undefined;
		for (let i = 0; i < xpPaths.length; i++) {
			const xpPath = xpPaths[i] as string;

			const policy = (XP_PATH_TO_PROP[xpPath]
				? properties[XP_PATH_TO_PROP[xpPath] as string]
				: properties[xpPath]) || PROPERTY_IF_CHANGED;

			const currentValueInXP = getIn(dereffedContent, xpPath);
			const prevValueInFotoware = getIn(dereffedContent, ['data', 'fotoWare', 'metadata', metadataKey])
			log.debug('metadataKey:%s xpPath:%s metadataValue:%s, newValueFromFotoware:%s policy:%s prevValueInFotoware:%s', metadataKey, xpPath, toStr(metadataValue), newValueFromFotoware, policy, toStr(prevValueInFotoware));

			if (
				(modify && policy === PROPERTY_ON_CREATE) // Don't modify
			) {
				continue;
			}

			if (
				(( isString(newValueFromFotoware) && newValueFromFotoware.length !== 0 )
				|| ( Array.isArray(newValueFromFotoware) && newValueFromFotoware.length > 0 ))
			) {
				// There is a new value
				if (
					policy === PROPERTY_OVERWRITE
					|| (policy === PROPERTY_IF_CHANGED && newValueFromFotoware !== prevValueInFotoware)
				) {
					if (!deepEqual(currentValueInXP, newValueFromFotoware)) {
						log.info('Changing %s from:%s to:%s', xpPath, toStr(getIn(dereffedContent, xpPath)), toStr(newValueFromFotoware));
						setIn(dereffedContent, xpPath, newValueFromFotoware);
					}
				} else if (!modify) { // ASSUMING PROPERTY_ON_CREATE
					setIn(dereffedContent, xpPath, newValueFromFotoware);
				}
			} else {
				// The new value is empty
				if (policy !== PROPERTY_ON_CREATE) {
					log.info('Deleting %s was:%s', xpPath, getIn(dereffedContent, xpPath));
					deleteIn(dereffedContent, xpPath);
				}
			}
		} // for xpPaths
	}); // forEach metadataKey

	//──────────────────────────────────────────────────────────────────────────
	// Update metadata state
	//──────────────────────────────────────────────────────────────────────────
	setIn(dereffedContent, ['data', 'fotoWare', 'metadata'], {}); // This should delete all old metadata
	Object.keys(metadata).forEach((metadataKey) => {
		const metadataValue = metadata[metadataKey];
		const value = metadataValue ? unforceArray(metadataValue.value) : undefined;
		// log.debug('metadataKey:%s value:%s', metadataKey, toStr(value));
		setIn(dereffedContent, ['data', 'fotoWare', 'metadata', metadataKey], value);
		// log.debug('metadata:%s', toStr(getIn(dereffedContent, ['data', 'fotoWare', 'metadata'])));
	});

	//──────────────────────────────────────────────────────────────────────────
	// Always update md5sum
	//──────────────────────────────────────────────────────────────────────────
	const prevMd5sum = getIn(dereffedContent, ['data', 'fotoWare', 'md5sum']);
	if (!prevMd5sum) {
		dereffedContent.data.fotoWare.md5sum = md5sum;
	} else if (dereffedContent.data.fotoWare.md5sum !== md5sum) {
		log.warning(`md5sum changed from:${prevMd5sum} to ${md5sum} on _path:${dereffedContent._path}`);
		dereffedContent.data.fotoWare.md5sum = md5sum;
	}

	//──────────────────────────────────────────────────────────────────────────
	// Cleanup old x-data
	//──────────────────────────────────────────────────────────────────────────
	deleteIn(dereffedContent, ['x', X_APP_NAME, 'fotoWare']);
	deleteIn(dereffedContent, ['x', X_APP_NAME]);

	//──────────────────────────────────────────────────────────────────────────
	// Cleanup empty objects
	//──────────────────────────────────────────────────────────────────────────
	if (getIn(dereffedContent, ['data', 'fotoWare', 'metadata']) && Object.keys(getIn(dereffedContent, ['data', 'fotoWare', 'metadata'])).length === 0) {
		delete dereffedContent.data.fotoWare.metadata;
	}
	if (getIn(dereffedContent, ['x', 'media', 'imageInfo']) && Object.keys(getIn(dereffedContent, ['x', 'media', 'imageInfo'])).length === 0) {
		deleteIn(dereffedContent, 'x', 'media', 'imageInfo');
	}
	if (getIn(dereffedContent, ['x', 'media']) && Object.keys(getIn(dereffedContent, ['x', 'media'])).length === 0) {
		deleteIn(dereffedContent, 'x', 'media');
	}
	if (Object.keys(getIn(dereffedContent, 'x')).length === 0) {
		delete dereffedContent.x;
	}

	log.debug('modified content:%s', toStr(dereffedContent));
	return dereffedContent;
}
