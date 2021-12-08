import {
	createMedia,
	// @ts-ignore
} from '/lib/xp/content';

// @ts-ignore
import {modifyMediaContent} from '/lib/fotoware/xp/modifyMediaContent';


interface HandleMissingMediaContent {
	readonly downloadRenditionResponse :any
	readonly fileNameNew :string
	readonly metadata :any
	readonly md5sumOfDownload :string
	readonly path :string
	readonly properties :any
}


export function handleMissingMediaContent({
	downloadRenditionResponse,
	fileNameNew,
	metadata,
	md5sumOfDownload,
	path,
	properties
} :HandleMissingMediaContent) {
	const parentPath = `/${path}`;
	const createMediaResult = createMedia({
		parentPath,
		name: fileNameNew,
		data: downloadRenditionResponse.bodyStream
	});
	if (!createMediaResult) {
		const errMsg = `Something went wrong when creating parentPath:${parentPath} fileNameNew:${fileNameNew}!`;
		log.error(errMsg);
		throw new Error(errMsg);
	}
	modifyMediaContent({
		exisitingMediaContent: createMediaResult,
		key: createMediaResult._path,
		md5sum: md5sumOfDownload,
		metadata,
		properties
	});
}
