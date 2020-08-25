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
	//log.debug(`content:${toStr(content)}`);
	if (metadata[5]) {
		const title = unforceArray(metadata[5].value); // Title
		if (title) {
			content.displayName = title;
			content.data.caption = title;
		}
		delete metadata[5];
	}

	if (metadata[80]) {
		content.data.artist = unforceArray(metadata[80].value); // Author
		delete metadata[80];
	}

	if (metadata[116]) {
		content.data.copyright = unforceArray(metadata[116].value); // Copyright String
		delete metadata[116];
	}

	if (metadata[25]) {
		content.data.tags = unforceArray(forceArray(metadata[25].value).map(v => capitalize(v))); // Keywords
		delete metadata[25];
	}

	if (metadata[120]) {
		content.data.description = unforceArray(metadata[120]) // Description
		delete metadata[120];
	}

	const metadataObj = {};
	Object.keys(metadata).forEach((k) => {
		metadataObj[k] = unforceArray(metadata[k].value);
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
