import {createMedia} from '/lib/xp/content';
import {modifyMediaContent} from '/lib/fotoware/xp/modifyMediaContent';


interface HandleMissingMediaContent {
	readonly downloadRenditionResponse :unknown
	readonly fileNameNew :string
	readonly metadata :unknown
	readonly md5sumOfDownload :string
	readonly path :string
	readonly properties :unknown
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
