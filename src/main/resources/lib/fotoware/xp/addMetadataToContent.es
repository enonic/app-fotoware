import {capitalize} from '/lib/fotoware/xp/capitalize';
import {unforceArray} from '/lib/fotoware/xp/unforceArray';
import {forceArray} from '/lib/util/data'
import {sanitize} from '/lib/xp/common';

const X_APP_NAME = sanitize(app.name).replace(/\./g, '-');

export const addMetadataToContent = ({
	md5sum,
	metadata,
	content
}) => {
	const dereffedMetadata = JSON.parse(JSON.stringify(metadata));
	//log.debug(`content:${toStr(content)}`);
	if (dereffedMetadata[5]) {
		const title = unforceArray(dereffedMetadata[5].value); // Title
		if (title) {
			content.displayName = title;
			content.data.caption = title;
		}
		delete dereffedMetadata[5];
	}

	if (dereffedMetadata[80]) {
		content.data.artist = unforceArray(dereffedMetadata[80].value); // Author
		delete dereffedMetadata[80];
	}

	if (dereffedMetadata[116]) {
		content.data.copyright = unforceArray(dereffedMetadata[116].value); // Copyright String
		delete dereffedMetadata[116];
	}

	if (dereffedMetadata[25]) {
		content.data.tags = unforceArray(forceArray(dereffedMetadata[25].value).map(v => capitalize(v))); // Keywords
		delete dereffedMetadata[25];
	}

	if (dereffedMetadata[120]) {
		content.data.description = unforceArray(dereffedMetadata[120]) // Description
		delete dereffedMetadata[120];
	}

	const metadataObj = {};
	Object.keys(dereffedMetadata).forEach((k) => {
		metadataObj[k] = unforceArray(dereffedMetadata[k].value);
	});

	content.x[X_APP_NAME] = {
		'fotoWare': {
			'md5sum': md5sum, // https://github.com/enonic/xp/issues/8281#issuecomment-678994176
			'metadata': metadataObj
		}
	}; // eslint-disable-line no-param-reassign
	//log.debug(`modified content:${toStr(content)}`);
	return content;
}
