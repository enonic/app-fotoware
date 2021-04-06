import {diff} from 'deep-object-diff';
import deepEqual from 'fast-deep-equal';

//import {assetUpdate} from '/lib/fotoware/api/asset/update';
import {requestRendition} from '/lib/fotoware/api/requestRendition';
import {addMetadataToContent} from '/lib/fotoware/xp/addMetadataToContent';
import {modifyMediaContent} from '/lib/fotoware/xp/modifyMediaContent';
import {isPublished} from '/lib/fotoware/xp/isPublished';

import {md5} from '/lib/text-encoding';
import {toStr} from '/lib/util';
import {sanitize} from '/lib/xp/common';
import {
	addAttachment,
	getAttachmentStream,
	publish,
	removeAttachment
} from '/lib/xp/content';
import {readText} from '/lib/xp/io';


const X_APP_NAME = sanitize(app.name).replace(/\./g, '-');


export function handleExistingMedia({
	accessToken,
	boolResume,
	currentAsset,
	exisitingMediaContent,
	hostname,
	journal,
	mediaName,
	mediaPath,
	metadata,
	project,
	renditionRequest,
	renditionUrl
}) {
	const {
		x: {
			[X_APP_NAME]: {
				'fotoWare': {
					'md5sum': md5sumFromXdata
				} = {}
			} = {}
		} = {}
	} = exisitingMediaContent;
	//log.debug(`mediaPath:${mediaPath} md5sumFromXdata:${md5sumFromXdata}`);

	const md5sumOfExisitingMediaContent = md5sumFromXdata || md5(readText(getAttachmentStream({
		key: mediaPath,
		name: mediaName
	})));
	//log.debug(`mediaPath:${mediaPath} md5sumOfExisitingMediaContent:${md5sumOfExisitingMediaContent}`);
	let md5sumToStore = md5sumOfExisitingMediaContent;
	//log.debug(`mediaPath:${mediaPath} md5sumToStore:${md5sumToStore}`);

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
				log.debug(`mediaPath:${mediaPath} md5sumOfDownload:${md5sumOfDownload} !== md5sumOfExisitingMediaContent:${md5sumOfExisitingMediaContent} :(`);
				// TODO Modify attachment
				try {
					addAttachment({
						key: mediaPath,
						name: mediaName,
						data: downloadRenditionResponse.bodyStream
					});
				} catch (e) {
					// Just to see what happens if you try to add an attachment that already exists
					log.error(e);
					log.error(e.class.name);
					log.error(e.message);
					removeAttachment({
						key: mediaPath,
						name: mediaName
					});
					// NOTE re-add old attachment with old name? nah, that information is in versions
					addAttachment({
						key: mediaPath,
						name: mediaName,
						data: downloadRenditionResponse.bodyStream
					});
				}
				journal.modified.push(currentAsset);
			} else {
				log.debug(`mediaPath:${mediaPath} md5sumOfDownload:${md5sumOfDownload} === md5sumOfExisitingMediaContent:${md5sumOfExisitingMediaContent} :)`);
			}
			md5sumToStore = md5sumOfDownload;
		}
	} // if !boolResume

	// NOTE Could generate md5sum from possibly modified attachment here.

	const maybeModifiedMediaContent = addMetadataToContent({
		md5sum: md5sumToStore,
		metadata,
		mediaName,
		content: JSON.parse(JSON.stringify(exisitingMediaContent))
	});

	if (!deepEqual(exisitingMediaContent, maybeModifiedMediaContent)) {
		const differences = diff(exisitingMediaContent, maybeModifiedMediaContent);
		log.debug(`mediaPath:${mediaPath} differences:${toStr(differences)}`);
		modifyMediaContent({
			exisitingMediaContent,
			key: mediaPath,
			md5sum: md5sumToStore,
			mediaName,
			mediaPath,
			metadata
		});
		journal.modifiedMetadata.push(currentAsset);
	} else {
		//log.debug(`mediaPath:${mediaPath} no differences :)`);
		journal.unchanged.push(currentAsset);
	}
	if (isPublished({
		key: mediaPath,
		project
	})) {
		const publishParams = {
			includeDependencies: false,
			keys:[mediaPath],
			sourceBranch: 'draft',
			targetBranch: 'master'
		};
		//log.debug(`mediaPath:${mediaPath} publishParams:${toStr(publishParams)}`);
		const publishRes = publish(publishParams);
		log.debug(`mediaPath:${mediaPath} publishRes:${toStr(publishRes)}`);
	}
}
