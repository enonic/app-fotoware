import type {SiteConfig} from '/lib/fotoware/xp/AppConfig';
import type {MediaContent} from '/lib/fotoware/xp/MediaContent';
import type {Metadata} from '/types';


// Node modules
import {
	// forceArray,
	isString,
	toStr//,
	// trimExt
} from '@enonic/js-utils';
import {detailedDiff} from 'deep-object-diff';
//import * as deepEqual from 'fast-deep-equal';
// @ts-ignore
import deepEqual from 'fast-deep-equal';

// @ts-ignore
import {md5} from '/lib/text-encoding';


import {
	get as getContentByKey,
	getAttachmentStream,
	// modify as modifyContent,
	move as moveContent,
	publish
} from '/lib/xp/content';

// import {getArtist} from '/lib/fotoware/asset/metadata/getArtist';
// import {getCopyright} from '/lib/fotoware/asset/metadata/getCopyright';
// import {getTags} from '/lib/fotoware/asset/metadata/getTags';
import {updateMedia} from '/lib/fotoware/content';
import {ContentAlreadyExistsException} from '/lib/xp/ContentAlreadyExistsException';
import {getMimeType, readText} from '/lib/xp/io';
// @ts-ignore
import {isPublished} from '/lib/fotoware/xp/isPublished';
// @ts-ignore
import {modifyMediaContent} from '/lib/fotoware/xp/modifyMediaContent';
// import {shouldUpdateArtist} from '/lib/fotoware/xp/shouldUpdateArtist';
// import {shouldUpdateCopyright} from '/lib/fotoware/xp/shouldUpdateCopyright';
// import {shouldUpdateTags} from '/lib/fotoware/xp/shouldUpdateTags';
// @ts-ignore
import {updateMetadataOnContent} from '/lib/fotoware/xp/updateMetadataOnContent'; // TODO should use updateMedia instead!


interface HandleExistingMediaContent {
	exisitingMediaContent: MediaContent
	downloadRenditionResponse: {
		bodyStream: object|null
	}
	fileNameNew: string
	fileNameOld: string
	md5sumOfDownload: string
	metadata: Metadata
	project: string
	properties: SiteConfig['properties']
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
		// displayName: existingDisplayName,
		data: {
			'fotoWare': {
				'md5sum': md5sumFromContent
			} = {},
			media: {
				attachment: existingAttachmentName
			} = {}
		} = {}
	} = exisitingMediaContent;

	if (!isString(existingAttachmentName)) {
		log.error('exisitingMediaContent.data.media.attachment is not a string! exisitingMediaContentId:%s', exisitingMediaContentId);
		throw new Error(`exisitingMediaContent.data.media.attachment is not a string!`);
	}

	const exisitingMediaContentAttachmentStream = getAttachmentStream({
		key: exisitingMediaContentId,
		name: fileNameOld
	});

	if (exisitingMediaContentAttachmentStream == null) {
		log.error('Unable to getAttachmentStream({key:%s, name:%s})!', exisitingMediaContentId, fileNameOld);
		throw new Error(`Unable to getAttachmentStream for ${fileNameOld}!`);
	}

	const md5sumOfExisitingMediaContent = md5sumFromContent || md5(readText(exisitingMediaContentAttachmentStream));
	//log.info(`md5sumOfExisitingMediaContent:${toStr(md5sumOfExisitingMediaContent)}`);

	if (
		md5sumOfDownload !== md5sumOfExisitingMediaContent
		|| fileNameNew !== fileNameOld
	) {
		log.debug(`_path:${exisitingMediaContent._path} md5sumOfDownload:${md5sumOfDownload} !== md5sumOfExisitingMediaContent:${md5sumOfExisitingMediaContent} :(`);

		if (downloadRenditionResponse.bodyStream == null) {
			log.error('downloadRenditionResponse.bodyStream is null! fileNameOld:%s', fileNameOld);
			throw new Error(`downloadRenditionResponse.bodyStream is null! fileNameOld:${fileNameOld}`);
		}

		// const potentialNewArtist = getArtist(metadata);
		// const potentialNewCopyright = getCopyright(metadata);
		// const potentialNewTags = getTags(metadata);
		updateMedia({
			/*artist: shouldUpdateArtist({ // TODO updateMedia doesn't handle when artist is an array
				artist: potentialNewArtist,
				content: exisitingMediaContent,
				modify: true, // We know the mediacontent already existed (wasn't just created)
				properties
			})
				? potentialNewArtist
				: exisitingMediaContent.data.artist,*/
			// caption
			/*copyright: shouldUpdateCopyright({
				copyright: potentialNewCopyright,
				content: exisitingMediaContent,
				modify: true, // We know the mediacontent already existed (wasn't just created)
				properties
			})
				? potentialNewCopyright
					? forceArray(potentialNewCopyright).join(', ')
					: undefined
				: exisitingMediaContent.data.copyright,*/
			data: downloadRenditionResponse.bodyStream, // Stream with the binary data for the attachment,
			// focalX
			// focalY
			key: exisitingMediaContentId,
			mimeType: getMimeType(fileNameNew),
			name: fileNameNew//,
			/*tags: shouldUpdateTags({ // TODO updateMedia doesn't handle when tags is an array
				tags: potentialNewTags,
				content: exisitingMediaContent,
				modify: true, // We know the mediacontent already existed (wasn't just created)
				properties
			})
				? potentialNewTags
				: exisitingMediaContent.data.tags*/
		});
		const contentUpdateMedia = getContentByKey({key: exisitingMediaContentId});
		log.debug(`contentUpdateMedia:${toStr(contentUpdateMedia)}`);
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
			if (
				e instanceof ContentAlreadyExistsException // TODO The java e is probably not an instance of the js class!
				&& e.code == 'contentAlreadyExists'
				// && e.getCode() == 'contentAlreadyExists'
			) {
				log.error(`Error when moving ${exisitingMediaContent._path} to ${fileNameNew}: There is already a content in the target specified!`);
			} else if (e instanceof Error) {
				log.error(`Unexpected error when moving ${exisitingMediaContent._path} to ${fileNameNew}: ${e.message}`, e);
			} else {
				log.error(`Should never happen: ${e}`, e); // TODO is this correct?
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
