import type {SiteConfig} from '/lib/fotoware/xp/AppConfig';
import type {MediaContent} from '/lib/fotoware/xp/MediaContent';


import {toStr} from '@enonic/js-utils';
import {detailedDiff} from 'deep-object-diff';
//import HumanDiff from 'human-object-diff';
import deepEqual from 'fast-deep-equal';

//import {assetUpdate} from '/lib/fotoware/api/asset/update';
//@ts-ignore
import {requestRendition} from '/lib/fotoware/api/requestRendition';
// import {getArtist} from '/lib/fotoware/asset/metadata/getArtist';
// import {getCopyright} from '/lib/fotoware/asset/metadata/getCopyright';
// import {getTags} from '/lib/fotoware/asset/metadata/getTags';
import {updateMedia} from '/lib/fotoware/content';
//@ts-ignore
import {updateMetadataOnContent} from '/lib/fotoware/xp/updateMetadataOnContent';
//@ts-ignore
import {modifyMediaContent} from '/lib/fotoware/xp/modifyMediaContent';
//@ts-ignore
import {isPublished} from '/lib/fotoware/xp/isPublished';
//@ts-ignore
import {md5} from '/lib/text-encoding';
//import {sanitize} from '/lib/xp/common';
import {
	// addAttachment,
	getAttachmentStream,
	publish//,
	// removeAttachment
} from '/lib/xp/content';
import {
	getMimeType,
	readText
} from '/lib/xp/io';

/*const { diff } = new HumanDiff({
	objectName: 'content'
});*/


export function handleExistingMedia({
	accessToken,
	boolResume,
	currentAsset,
	exisitingMediaContent,
	filename,
	hostname,
	journal,
	metadata,
	project,
	properties,
	renditionRequest,
	renditionUrl
}: {
	boolResume: boolean
	exisitingMediaContent: MediaContent
	filename: string
	project: string
	properties: SiteConfig['properties']
}) {
	//log.debug(`handleExistingMedia properties:${toStr(properties)}`);
	const {
		data: {
			'fotoWare': {
				'md5sum': md5sumFromXdata
			} = {}
		} = {}
	} = exisitingMediaContent;
	//log.debug(`_path:${exisitingMediaContent._path} md5sumFromXdata:${md5sumFromXdata}`);

	const exisitingMediaContentAttachmentStream = getAttachmentStream({
		key: exisitingMediaContent._path,
		name: filename
	});

	if (exisitingMediaContentAttachmentStream == null) {
		log.error('Unable to getAttachmentStream({key:%s, name:%s})!', exisitingMediaContent._path, filename);
		throw new Error(`Unable to getAttachmentStream for ${filename}!`);
	}

	const md5sumOfExisitingMediaContent = md5sumFromXdata || md5(readText(exisitingMediaContentAttachmentStream));
	//log.debug(`_path:${exisitingMediaContent._path} md5sumOfExisitingMediaContent:${md5sumOfExisitingMediaContent}`);
	let md5sumToStore = md5sumOfExisitingMediaContent;
	//log.debug(`_path:${exisitingMediaContent._path} md5sumToStore:${md5sumToStore}`);

	if (!boolResume) {
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
			const md5sumOfDownload = md5(readText(downloadRenditionResponse.bodyStream));
			if (md5sumOfDownload !== md5sumOfExisitingMediaContent) {
				log.debug(`_path:${exisitingMediaContent._path} md5sumOfDownload:${md5sumOfDownload} !== md5sumOfExisitingMediaContent:${md5sumOfExisitingMediaContent} :(`);
				// TODO Modify attachment
				updateMedia({
					// artist: getArtist(metadata) // TODO updateMedia doesn't handle when artist is an array
					// caption
					// copyright: getCopyright(metadata)
					data: downloadRenditionResponse.bodyStream, // Stream with the binary data for the attachment,
					// focalX
					// focalY
					key: exisitingMediaContent._path,
					mimeType: getMimeType(filename),
					name: filename//,
					// tags: getTags(metadata) // TODO updateMedia doesn't handle when tags is an array
				});
				journal.modified.push(currentAsset);
			} else {
				log.debug(`_path:${exisitingMediaContent._path} md5sumOfDownload:${md5sumOfDownload} === md5sumOfExisitingMediaContent:${md5sumOfExisitingMediaContent} :)`);
			}
			md5sumToStore = md5sumOfDownload;
		}
	} // if !boolResume

	// NOTE Could generate md5sum from possibly modified attachment here.

	// Is used to detect if it is neccesary to modiy the content
	// and to produce a nice diff of which changes will be written.
	const maybeModifiedMediaContent = updateMetadataOnContent({
		content: JSON.parse(JSON.stringify(exisitingMediaContent)), // deref so exisitingMediaContent can't be modified
		md5sum: md5sumToStore,
		metadata,
		modify: true,
		properties
	});

	if (!deepEqual(exisitingMediaContent, maybeModifiedMediaContent)) {
		//log.debug(`exisitingMediaContent.data.fotoWare.metadata:${toStr(exisitingMediaContent.data.fotoWare.metadata)}`);
		//log.debug(`maybeModifiedMediaContent.data.fotoWare.metadata:${toStr(maybeModifiedMediaContent.data.fotoWare.metadata)}`);
		const differences = detailedDiff(exisitingMediaContent, maybeModifiedMediaContent);
		log.debug(`_path:${exisitingMediaContent._path} differences:${toStr(differences)}`);
		modifyMediaContent({
			exisitingMediaContent,
			key: exisitingMediaContent._path,
			md5sum: md5sumToStore,
			metadata,
			properties
		});
		journal.modifiedMetadata.push(currentAsset);
	} else {
		//log.debug(`_path:${exisitingMediaContent._path} no differences :)`);
		journal.unchanged.push(currentAsset);
	}
	if (isPublished({
		key: exisitingMediaContent._path,
		project
	})) {
		const publishParams = {
			includeDependencies: false,
			keys:[exisitingMediaContent._path],
			sourceBranch: 'draft',
			targetBranch: 'master'
		};
		//log.debug(`_path:${exisitingMediaContent._path} publishParams:${toStr(publishParams)}`);
		const publishRes = publish(publishParams);
		log.debug(`_path:${exisitingMediaContent._path} publishRes:${toStr(publishRes)}`);
	}
}
