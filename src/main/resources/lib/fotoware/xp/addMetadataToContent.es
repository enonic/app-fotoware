import {capitalize} from '/lib/fotoware/xp/capitalize';
import {unforceArray} from '/lib/fotoware/xp/unforceArray';
import {forceArray} from '/lib/util/data'
import {sanitize} from '/lib/xp/common';

const X_APP_NAME = sanitize(app.name).replace(/\./g, '-');

export const addMetadataToContent = ({
	md5sum,
	metadata,
	mediaName,
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

	// TODO remove the field containing the Enonic node._id

	const metadataObj = {};
	Object.keys(dereffedMetadata).forEach((k) => {
		metadataObj[k] = unforceArray(dereffedMetadata[k].value);
	});

	if (!content.x) { content.x = {}; }
	if (!content.x[X_APP_NAME]) { content.x[X_APP_NAME] = {}; }
	if (!content.x[X_APP_NAME].fotoWare) { content.x[X_APP_NAME].fotoWare = {}; }

	// Only add name if missing aka never change it
	if (!content.x[X_APP_NAME].fotoWare.filename) {
		content.x[X_APP_NAME].fotoWare.filename = mediaName;
	} else if (content.x[X_APP_NAME].fotoWare.filename !== mediaName) {
		log.error(`not changing filename from:${content.x[X_APP_NAME].fotoWare.filename} to ${mediaName}!`);
	}

	// Always update md5sum
	if (!content.x[X_APP_NAME].fotoWare.md5sum) {
		content.x[X_APP_NAME].fotoWare.md5sum = md5sum;
	} else if (content.x[X_APP_NAME].fotoWare.md5sum !== md5sum) {
		log.warning(`md5sum changed from:${content.x[X_APP_NAME].fotoWare.md5sum} to ${md5sum} on mediaName:${mediaName}`);
		content.x[X_APP_NAME].fotoWare.md5sum = md5sum;
	}

	// TODO Deepdiff?
	content.x[X_APP_NAME].fotoWare.metadata = metadataObj;

	//log.debug(`modified content:${toStr(content)}`);
	return content;
}
