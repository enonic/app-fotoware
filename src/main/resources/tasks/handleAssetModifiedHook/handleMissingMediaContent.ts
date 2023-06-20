import type {
	Mappings,
	MediaContent,
	Metadata,
	Response,
	SiteConfigProperties
} from '/lib/fotoware';
import type { ByteSource } from '/lib/xp/io';


import {createMedia} from '/lib/xp/content';
import {modifyMediaContent} from '/lib/fotoware/xp/modifyMediaContent';


interface HandleMissingMediaContent {
	readonly downloadRenditionResponse: Response
	readonly fileNameNew: string
	mappings: Mappings
	readonly metadata: Metadata
	readonly md5sumOfDownload: string
	readonly path: string
	readonly properties: SiteConfigProperties
}


export function handleMissingMediaContent({
	downloadRenditionResponse,
	fileNameNew,
	mappings,
	metadata,
	md5sumOfDownload,
	path,
	properties
}: HandleMissingMediaContent) {
	const parentPath = `/${path}`;
	const createMediaResult = createMedia({
		parentPath,
		name: fileNameNew,
		data: downloadRenditionResponse.bodyStream as ByteSource
	}) as MediaContent;
	if (!createMediaResult) {
		const errMsg = `Something went wrong when creating parentPath:${parentPath} fileNameNew:${fileNameNew}!`;
		log.error(errMsg);
		throw new Error(errMsg);
	}
	modifyMediaContent({
		exisitingMediaContent: createMediaResult,
		key: createMediaResult._path,
		mappings,
		md5sum: md5sumOfDownload,
		metadata,
		properties
	});
}
