import {getCollectionList} from './get';
import {toStr} from '/lib/util';

export const getAndPaginateCollectionList = ({
	accessToken,
	hostname,
	shortAbsolutePath,
	fnHandleCollections
}) => {
	//log.info(`shortAbsolutePath:${toStr(shortAbsolutePath)}`);
	let collectionList = getCollectionList({
		accessToken,
		url: `${hostname}${shortAbsolutePath}`
	});
	//log.info(`collectionList:${toStr(collectionList)}`);
	fnHandleCollections(collectionList.collections);
	if (collectionList.paging) {
		log.info(`paging:${toStr(collectionList.paging)}`);
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
