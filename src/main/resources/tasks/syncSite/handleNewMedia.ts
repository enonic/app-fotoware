import type {
	Mappings,
	Journal,
	Metadata,
	SiteConfig
} from '/lib/fotoware';

//import {toStr} from '@enonic/js-utils';

//import {assetUpdate} from '/lib/fotoware/api/asset/update';
import {requestRendition} from '/lib/fotoware/api/requestRendition';
import {modifyMediaContent} from '/lib/fotoware/xp/modifyMediaContent';
// @ts-expect-error TS2307: Cannot find module '/lib/text-encoding' or its corresponding type declarations.
import {md5} from '/lib/text-encoding';
import {createMedia} from '/lib/xp/content';
import {readText} from '/lib/xp/io';


export function handleNewMedia({
	accessToken,
	currentAsset,
	filename,
	hostname,
	journal,
	mappings,
	metadata,
	path,
	properties,
	renditionRequest,
	renditionUrl
}: {
	accessToken: string
	currentAsset: string
	filename: string
	hostname: string
	journal: Journal
	mappings: Mappings
	metadata: Metadata
	path: string
	properties: SiteConfig['properties']
	renditionRequest: string
	renditionUrl: string
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
		if (downloadRenditionResponse.bodyStream == null) {
			log.error('downloadRenditionResponse.bodyStream is null! filename:%s', filename);
			throw new Error(`downloadRenditionResponse.bodyStream is null! filename:${filename}`);
		}
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
			mappings,
			md5sum,
			metadata,
			properties
		});
	} // if downloadRenditionResponse
}
