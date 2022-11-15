import type {MediaContent} from '/lib/fotoware/xp/MediaContent';


// Node modules
import {
	isString,
	toStr,
	trimExt
} from '@enonic/js-utils';
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
} from '/lib/xp/content';

// import {updateMedia} from '/lib/fotoware/content'; // TODO Use this instead of removeAttachment and addAttachment

import {getMimeType, readText} from '/lib/xp/io';

// @ts-ignore
import {isPublished} from '/lib/fotoware/xp/isPublished';

// @ts-ignore
import {modifyMediaContent} from '/lib/fotoware/xp/modifyMediaContent';

// @ts-ignore
import {updateMetadataOnContent} from '/lib/fotoware/xp/updateMetadataOnContent';


interface HandleExistingMediaContent {
	exisitingMediaContent :MediaContent
	downloadRenditionResponse :{
		bodyStream: object|null
	}
	fileNameNew :string
	fileNameOld :string
	md5sumOfDownload :string
	metadata :unknown
	project :string
	properties :unknown
}

type Branch = string | null
type ContentPath = string
type RepositoryId = string | null

class ContentAlreadyExistsException extends /*NotFoundException*/ Error {

	private static buildMessage(path: ContentPath, repositoryId: RepositoryId, branch: Branch): string {
		// Source Java Implementation
		// return Stream.of(
		// 	MessageFormat.format(
		// 		"Content at path [{0}]", path
		// 	),
		// 	repositoryId != null ? MessageFormat.format( "in repository [{0}]", repositoryId ) : "",
		// 	branch != null ? MessageFormat.format( "in branch [{0}]", branch ) : "",
		// 	"already exists"
		// )
		// 	.filter( Predicate.not( String::isEmpty ) )
		// 	.collect( Collectors.joining( " " ) );

		// Implementation using array, filter out empty, join on single space
		return [
			`Content at path [${path}]`,
			repositoryId != null
				? `in repository [${repositoryId}] `
				: undefined,
			branch != null
				? `in branch [${branch}] `
				: undefined,
			'already exists'
		].filter(x=>x).join(' ');

		// Implementation using string concat and making sure whitespace is correct
		// return `Content at path [${path}] ${
		// 	repositoryId != null ? `in repository [${repositoryId}] `: ''
		// }${
		// 	branch != null ? `in branch [${branch}] `: ''
		// }already exists`;
	}

	// Defined in Error (super)
	// cause: unknown
	// columnNumber: number // Non-standard
	// fileName: string // Non-standard
	// lineNumber: number // Non-standard
	// message: string
	// name: string
	// stack: any // Non-standard

	// Static property 'name' conflicts with built-in property 'Function.name' of constructor function 'ContentAlreadyExistsException'.
	// static name = 'com.enonic.xp.content.ContentAlreadyExistsException';

	readonly branch: Branch
	public readonly code: string // Perhaps defined in NotFoundException
	readonly path: ContentPath
	readonly repositoryId: RepositoryId

	constructor(
		path: ContentPath,
		repositoryId: RepositoryId = null, // NOTE: The null fallback is deprecated
		branch: Branch = null, // NOTE: The null fallback is deprecated
		// ...params: unknown[]
	) {
		super(
			ContentAlreadyExistsException.buildMessage(
				path, repositoryId, branch
			),
			// ...params
		);
		this.path = path;
		this.repositoryId = repositoryId;
		this.branch = branch;
		this.code = 'contentAlreadyExists';
		this.name = 'com.enonic.xp.content.ContentAlreadyExistsException';
	}

	public getBranch() {
		return this.branch;
	}

	// Doesn't exist on Error, perhaps it exists on NotFoundException
	public getCode() {
		return this.code;
	}

	public getContentPath() {
		return this.path;
	}

	public getRepositoryId() {
		return this.repositoryId;
	}

	// Defined in Error (super)
	//public toString()
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
		displayName: existingDisplayName,
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

		if (downloadRenditionResponse.bodyStream == null) {
			log.error('downloadRenditionResponse.bodyStream is null! fileNameOld:%s', fileNameOld);
			throw new Error(`downloadRenditionResponse.bodyStream is null! fileNameOld:${fileNameOld}`);
		}

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
				//log.debug(`soon to be modified mediaContent:${toStr(mediaContent)}`);
				if (existingDisplayName === trimExt(existingAttachmentName)) {
					mediaContent.displayName = trimExt(fileNameNew);
				}
				mediaContent.data.media.attachment = fileNameNew;
				//log.debug(`modified mediaContent:${toStr(mediaContent)}`);
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
			if (
				e instanceof ContentAlreadyExistsException
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
