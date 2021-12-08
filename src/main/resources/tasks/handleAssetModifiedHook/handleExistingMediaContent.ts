// Node modules
import {toStr} from '@enonic/js-utils';
import {detailedDiff} from 'deep-object-diff';

//import * as deepEqual from 'fast-deep-equal';
// @ts-ignore
import deepEqual from 'fast-deep-equal';

// @ts-ignore
import {md5} from '/lib/text-encoding';


import {
	addAttachment,
	get as getContentByKey,
	getAttachmentStream,
	modify as modifyContent,
	move as moveContent,
	publish,
	removeAttachment
	// @ts-ignore
} from '/lib/xp/content';

// @ts-ignore
import {getMimeType, readText} from '/lib/xp/io';

// @ts-ignore
import {isPublished} from '/lib/fotoware/xp/isPublished';

// @ts-ignore
import {modifyMediaContent} from '/lib/fotoware/xp/modifyMediaContent';

// @ts-ignore
import {updateMetadataOnContent} from '/lib/fotoware/xp/updateMetadataOnContent';


import {MediaContent} from '/lib/fotoware/xp/MediaContent';


interface HandleExistingMediaContent {
	exisitingMediaContent :MediaContent
	downloadRenditionResponse :any
	fileNameNew :string
	fileNameOld :string
	md5sumOfDownload :string
	metadata :any
	project :string
	properties :any
}


export function handleExistingMediaContent({
	exisitingMediaContent,
	downloadRenditionResponse,
	fileNameNew,
	fileNameOld,
	md5sumOfDownload,
	metadata,
	project,
	properties
} :HandleExistingMediaContent) {
	log.debug(`exisitingMediaContent:${toStr(exisitingMediaContent)}`);
	const {
		_id: exisitingMediaContentId,
		data: {
			'fotoWare': {
				'md5sum': md5sumFromContent
			} = {},
			media: {
				attachment: existingAttachmentName
			} = {}
		} = {}
	} = exisitingMediaContent;
	const md5sumOfExisitingMediaContent = md5sumFromContent || md5(readText(getAttachmentStream({
		key: exisitingMediaContentId,
		name: fileNameOld
	})));
	//log.info(`md5sumOfExisitingMediaContent:${toStr(md5sumOfExisitingMediaContent)}`);
	if (
		md5sumOfDownload !== md5sumOfExisitingMediaContent
		|| fileNameNew !== fileNameOld
	) {
		log.debug(`_path:${exisitingMediaContent._path} md5sumOfDownload:${md5sumOfDownload} !== md5sumOfExisitingMediaContent:${md5sumOfExisitingMediaContent} :(`);
		// TODO Modify attachment
		/*try {
			addAttachment({
				key: exisitingMediaContent._path,
				//mimeType: doctype, // 'image' is a invalid mimetype
				mimeType: getMimeType(fileNameNew),
				name: fileNameNew,
				data: downloadRenditionResponse.bodyStream
			});
		} catch (e) {
			// Just to see what happens if you try to add an attachment that already exists
		log.error(e);
		log.error(e.class.name);
		log.error(e.message);*/
		removeAttachment({
			key: exisitingMediaContentId, // Path or id to the content
			name: fileNameOld // Attachment name, or array of names
		});
		const contentAfterRemoveAttachment = getContentByKey({key: exisitingMediaContentId});
		log.debug(`contentAfterRemoveAttachment:${toStr(contentAfterRemoveAttachment)}`);

		// NOTE re-add old attachment with old name? nah, that information is in versions
		addAttachment({
			key: exisitingMediaContentId, // Path or id to the content
			//mimeType: doctype, // 'image' is a invalid mimetype
			mimeType: getMimeType(fileNameNew), // Attachment content type
			name: fileNameNew, // Attachment name
			data: downloadRenditionResponse.bodyStream // Stream with the binary data for the attachment
		});
		const contentAfterAddAttachment = getContentByKey({key: exisitingMediaContentId});
		log.debug(`contentAfterAddAttachment:${toStr(contentAfterAddAttachment)}`);

		modifyContent({
			key: exisitingMediaContentId,
			editor: (mediaContent: MediaContent) => {
				log.debug(`soon to be modified mediaContent:${toStr(mediaContent)}`);
				mediaContent.data.media.attachment = fileNameNew;
				log.debug(`modified mediaContent:${toStr(mediaContent)}`);
				return mediaContent;
			},
			requireValid: false // No mapping defined for property md5sum with value
		});
		const contentAfterModifyMediaName = getContentByKey({key: exisitingMediaContentId});
		log.debug(`contentAfterModifyMediaName:${toStr(contentAfterModifyMediaName)}`);
		//}
	} else {
		log.debug(`_path:${exisitingMediaContent._path} md5sumOfDownload:${md5sumOfDownload} === md5sumOfExisitingMediaContent:${md5sumOfExisitingMediaContent} :)`);
	}

	const maybeModifiedMediaContent = updateMetadataOnContent({
		content: JSON.parse(JSON.stringify(exisitingMediaContent)), // deref so exisitingMediaContent can't be modified
		md5sum: md5sumOfDownload,
		metadata,
		modify: true,
		properties
	});
	//log.info(`maybeModifiedMediaContent:${toStr(maybeModifiedMediaContent)}`);

	if (!deepEqual(exisitingMediaContent, maybeModifiedMediaContent)) {
		const differences = detailedDiff(exisitingMediaContent, maybeModifiedMediaContent);
		log.debug(`_path:${exisitingMediaContent._path} differences:${toStr(differences)}`);
		modifyMediaContent({
			exisitingMediaContent,
			key: exisitingMediaContent._path,
			md5sum: md5sumOfDownload,
			metadata,
			properties
		});
	} /*else {
		log.debug(`_path:${exisitingMediaContent._path} no differences :)`);
	}*/
	if (
		fileNameNew !== fileNameOld // Renamed in FotoWare
		&& fileNameOld === existingAttachmentName // Name not overridden in Enonic
	) {
		log.debug(`Moving content _path:${exisitingMediaContent._path} to fileNameNew:${fileNameNew}...`);
		try {
			const movedContent = moveContent({ // NOTE: This doesn't update DisplayName!
				source: exisitingMediaContentId, // Path or id of the content to be moved or renamed
				target: fileNameNew // New path or name for the content. If the target ends in slash '/', it specifies the parent path where to be moved. Otherwise it means the new desired path or name for the content
			});
			log.debug(`movedContent:${toStr(movedContent)}`);
			log.debug(`Moved content ${exisitingMediaContent._path} to ${movedContent._path}.`);
		} catch (e) {
			if (e.code == 'contentAlreadyExists') {
        		log.error(`Error when moving ${exisitingMediaContent._path} to ${fileNameNew}: There is already a content in the target specified!`);
    		} else {
        		log.error(`Unexpected error when moving ${exisitingMediaContent._path} to ${fileNameNew}: ${e.message}`, e);
    		}
			// Will do publishing even if move failed...
		}
	}
	if (isPublished({
		key: exisitingMediaContentId,
		project
	})) {
		const publishParams = {
			includeDependencies: false,
			keys:[exisitingMediaContentId],
			sourceBranch: 'draft',
			targetBranch: 'master'
		};
		//log.debug(`_path:${exisitingMediaContent._path} publishParams:${toStr(publishParams)}`);
		const publishRes = publish(publishParams);
		log.debug(`_path:${exisitingMediaContent._path} publishRes:${toStr(publishRes)}`);
	}
}
