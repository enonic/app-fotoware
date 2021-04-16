import {diff} from 'deep-object-diff';
import deepEqual from 'fast-deep-equal';

//import {assetUpdate} from '/lib/fotoware/api/asset/update';
import {requestRendition} from '/lib/fotoware/api/requestRendition';
import {updateMetadataOnContent} from '/lib/fotoware/xp/updateMetadataOnContent';
import {modifyMediaContent} from '/lib/fotoware/xp/modifyMediaContent';
import {isPublished} from '/lib/fotoware/xp/isPublished';

import {md5} from '/lib/text-encoding';
import {toStr} from '/lib/util';
//import {sanitize} from '/lib/xp/common';
import {
	addAttachment,
	getAttachmentStream,
	publish,
	removeAttachment
} from '/lib/xp/content';
import {
	getMimeType,
	readText
} from '/lib/xp/io';


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

	const md5sumOfExisitingMediaContent = md5sumFromXdata || md5(readText(getAttachmentStream({
		key: exisitingMediaContent._path,
		name: filename
	})));
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
				try {
					addAttachment({
						key: exisitingMediaContent._path,
						mimeType: getMimeType(filename),
						name: filename,
						data: downloadRenditionResponse.bodyStream
					});
				} catch (e) {
					// Just to see what happens if you try to add an attachment that already exists
					log.error(e);
					log.error(e.class.name);
					log.error(e.message);
					removeAttachment({
						key: exisitingMediaContent._path,
						name: filename
					});
					// NOTE re-add old attachment with old name? nah, that information is in versions
					addAttachment({
						key: exisitingMediaContent._path,
						mimeType: getMimeType(filename),
						name: filename,
						data: downloadRenditionResponse.bodyStream
					});
				}
				journal.modified.push(currentAsset);
			} else {
				log.debug(`_path:${exisitingMediaContent._path} md5sumOfDownload:${md5sumOfDownload} === md5sumOfExisitingMediaContent:${md5sumOfExisitingMediaContent} :)`);
			}
			md5sumToStore = md5sumOfDownload;
		}
	} // if !boolResume

	// NOTE Could generate md5sum from possibly modified attachment here.

	const maybeModifiedMediaContent = updateMetadataOnContent({
		content: JSON.parse(JSON.stringify(exisitingMediaContent)),
		md5sum: md5sumToStore,
		metadata,
		modify: true,
		properties
	});

	if (!deepEqual(exisitingMediaContent, maybeModifiedMediaContent)) {
		const differences = diff(exisitingMediaContent, maybeModifiedMediaContent);
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
