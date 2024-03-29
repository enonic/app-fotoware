// NOTE: I don't think this file is in use?

import type {Collection} from '/lib/fotoware'

//import {toStr} from '@enonic/js-utils';
//import {getCollectionList} from './get';
import {getCollectionList} from '/lib/fotoware/api/collectionList/get';


export const getAndPaginateCollectionList = ({
	accessToken,
	hostname,
	shortAbsolutePath,
	fnHandleCollections
}: {
	accessToken: string
	hostname: string
	shortAbsolutePath: string
	fnHandleCollections: (_collections: Collection[]) => void
}) => {
	//log.debug(`shortAbsolutePath:${toStr(shortAbsolutePath)}`);
	let collectionList = getCollectionList({
		accessToken,
		url: `${hostname}${shortAbsolutePath}`
	});
	//log.debug(`collectionList:${toStr(collectionList)}`);
	fnHandleCollections(collectionList.collections);
	if (collectionList.paging) {
		//log.debug(`paging:${toStr(collectionList.paging)}`);
		//prev, // URL of previous page. If null, then there is no previous page, and the current representation is the first page.
		//next, // URL of next page. If null, then there is no next page, and the current representation is the last page.
		//first, // URL of first page. This attribute is never null and can be used for restarting navigation at the beginning of the list.
		//last // URL of last page. If null, then the last page is not known, because it is not known how many pages there are. The last page (if the list has finite length) can be “discovered” by following paging.next repeatedly
		while (collectionList.paging.next) {
			collectionList = getCollectionList({
				accessToken,
				url: `${hostname}${collectionList.paging.next}`
			});
			fnHandleCollections(collectionList.collections);
		} // while next
	} // if paging
}; // export const getAndPaginateCollectionList
