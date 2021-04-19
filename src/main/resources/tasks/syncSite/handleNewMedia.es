//import {assetUpdate} from '/lib/fotoware/api/asset/update';
import {requestRendition} from '/lib/fotoware/api/requestRendition';
import {modifyMediaContent} from '/lib/fotoware/xp/modifyMediaContent';

import {md5} from '/lib/text-encoding';
//import {toStr} from '/lib/util';
import {createMedia} from '/lib/xp/content';
import {readText} from '/lib/xp/io';


export function handleNewMedia({
	accessToken,
	currentAsset,
	filename,
	hostname,
	journal,
	metadata,
	path,
	properties,
	renditionRequest,
	renditionUrl
}) {
	//log.debug(`handleNewMedia properties:${toStr(properties)}`);
	//log.debug(`renditions:${toStr(renditions)}`);
	let downloadRenditionResponse;
	try {
		downloadRenditionResponse = requestRendition({
			accessToken,
			hostname,
			renditionServiceShortAbsolutePath: renditionRequest,
			renditionUrl
		});
	} catch (e) {
		// Errors are already logged, simply skip and continue
	}

	if (downloadRenditionResponse) {
		const createMediaResult = createMedia({
			parentPath: `/${path}`,
			name: filename,
			data: downloadRenditionResponse.bodyStream
		});
		//log.debug(`createMediaResult:${toStr(createMediaResult)}`);

		/*assetUpdate({
			accessToken,
			fullAssetUrl: currentAsset,
			metadata: {
				255: createMediaResult._id
			}
		});*/ // TODO This data won't be in Enonic before second sync?

		if (!createMediaResult) {
			journal.errors.push(currentAsset);
			const errMsg = `Something went wrong when creating path:${path} filename:${filename}!`;
			log.error(errMsg);
			throw new Error(errMsg);
		}
		journal.created.push(currentAsset);
		const md5sum = md5(readText(downloadRenditionResponse.bodyStream));
		modifyMediaContent({
			key: createMediaResult._id,
			md5sum,
			metadata,
			properties
		});
	} // if downloadRenditionResponse
}
