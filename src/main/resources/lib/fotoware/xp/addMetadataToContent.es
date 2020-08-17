import {capitalize} from '/lib/fotoware/xp/capitalize';
import {forceArray} from '/lib/util/data'
import {sanitize} from '/lib/xp/common';

const X_APP_NAME = sanitize(app.name).replace(/\./g, '-');

export const addMetadataToContent = ({
	metadata,
	content
}) => {
	//log.debug(`content:${toStr(content)}`);
	if (metadata[5]) {
		content.data.caption = metadata[5].value; // Title
		delete metadata[5];
	}

	if (metadata[80]) {
		content.data.artist = metadata[80].value; // Author
		delete metadata[80];
	}

	if (metadata[116]) {
		content.data.copyright = metadata[116].value; // Copyright String
		delete metadata[116];
	}

	if (metadata[25]) {
		content.data.tags = forceArray(metadata[25].value).map(v => capitalize(v)); // Keywords
		delete metadata[25];
	}

	if (metadata[120]) {
		content.data.description = metadata[120] // Description
		delete metadata[120];
	}

	const metadataObj = {};
	Object.keys(metadata).forEach((k) => {
		metadataObj[k] = metadata[k].value;
	});

	content.x[X_APP_NAME] = {
		fotoWare: {
			metadata: metadataObj
		}
	}; // eslint-disable-line no-param-reassign
	//log.debug(`modified content:${toStr(content)}`);
	return content;
}
