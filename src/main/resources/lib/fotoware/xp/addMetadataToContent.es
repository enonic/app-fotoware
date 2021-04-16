import {capitalize} from '/lib/fotoware/xp/capitalize';
import {X_APP_NAME} from '/lib/fotoware/xp/constants';
import {unforceArray} from '/lib/fotoware/xp/unforceArray';
import {forceArray} from '/lib/util/data'


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
			const prevTitle = content.data.caption; // NOTE: Assuming not changed in Enonic.
			content.data.caption = title; // Always overwrite with what is in FotoWare.
			if (!content.displayName) {
				content.displayName = title;
			} else if (content.displayName === prevTitle) { // NOTE: Assuming displayName not changed in Enonic, only in FotoWare.
				content.displayName = title;
			}
		}
		//delete dereffedMetadata[5];
	}

	if (dereffedMetadata[80]) {
		content.data.artist = unforceArray(dereffedMetadata[80].value); // Author
		//delete dereffedMetadata[80];
	}

	if (dereffedMetadata[116]) {
		content.data.copyright = unforceArray(dereffedMetadata[116].value); // Copyright String
		//delete dereffedMetadata[116];
	}

	if (dereffedMetadata[25]) {
		content.data.tags = unforceArray(forceArray(dereffedMetadata[25].value).map(v => capitalize(v))); // Keywords
		//delete dereffedMetadata[25];
	}

	if (dereffedMetadata[120]) {
		content.data.description = unforceArray(dereffedMetadata[120]) // Description
		//delete dereffedMetadata[120];
	}

	// TODO remove the field containing the Enonic node._id ?

	// BUG: Editing image in xp, removes x-data
	// So we have to store the information elsewhere, lets try normal content properties.
	// https://github.com/enonic/app-fotoware/issues/68

	if (!content.data) { content.data = {}; }
	if (!content.data.fotoWare) { content.data.fotoWare = {}; }

	// Always update md5sum
	if (!content.data.fotoWare.md5sum) {
		content.data.fotoWare.md5sum = md5sum;
	} else if (content.data.fotoWare.md5sum !== md5sum) {
		log.warning(`md5sum changed from:${content.data.fotoWare.md5sum} to ${md5sum} on _path:${content._path}`);
		content.data.fotoWare.md5sum = md5sum;
	}

	const metadataObj = {};
	Object.keys(dereffedMetadata).forEach((k) => {
		metadataObj[k] = unforceArray(dereffedMetadata[k].value);
	});

	// TODO Deepdiff?
	content.data.fotoWare.metadata = metadataObj;

	// Cleanup old metadata
	if (content.x && content.x[X_APP_NAME] && content.x[X_APP_NAME].fotoWare) {
		delete content.x[X_APP_NAME].fotoWare;
	}

	//log.debug(`modified content:${toStr(content)}`);
	return content;
}
