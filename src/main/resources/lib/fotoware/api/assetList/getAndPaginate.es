//import {getAssetList} from './get';
import {getAssetList} from '/lib/fotoware/api/assetList/get';
//import {toStr} from '/lib/util';

export const getAndPaginateAssetList = ({
	accessToken,
	hostname,
	shortAbsolutePath,
	fnHandleAssets,
	doPaginate = true
}) => {
	let assetList = getAssetList({
		accessToken,
		url: `${hostname}${shortAbsolutePath}`
	});
	//log.info(`assetList:${toStr(assetList)}`);
	fnHandleAssets(assetList.assets);
	if (doPaginate && assetList.paging) {
		//log.info(`paging:${toStr(assetList.paging)}`);
		//prev, // URL of previous page. If null, then there is no previous page, and the current representation is the first page.
		//next, // URL of next page. If null, then there is no next page, and the current representation is the last page.
		//first, // URL of first page. This attribute is never null and can be used for restarting navigation at the beginning of the list.
		//last // URL of last page. If null, then the last page is not known, because it is not known how many pages there are. The last page (if the list has finite length) can be “discovered” by following paging.next repeatedly
		while (assetList.paging.next) {
			assetList = getAssetList({
				accessToken,
				url: `${hostname}${assetList.paging.next}`
			});
			fnHandleAssets(assetList.assets);
		} // while next
	} // if paging
}; // export const getAndPaginateAssetList

/*
assets.forEach(({
	href: assetHref,
	archiveHREF,
	linkstance,
	created,
	createdBy,
	modified,
	modifiedBy,
	filename,
	filesize,
	uniqueid,
	permissions,
	pincount,
	previewcount,
	downloadcount,
	workflowcount,
	metadataeditcount,
	revisioncount,
	doctype,
	capabilities,
	previews,
	quickRenditions,
	metadataEditor,
	renditions,
	previewToken,
	attributes,
	metadata,
	thumbnailFields,
	builtinFields,
	props,
	...assetRest
}) => {
	log.info(`assetRest:${toStr(assetRest)}`);
	log.info(`assetHref:${toStr(assetHref)}`);
}); // assets.forEach
*/
