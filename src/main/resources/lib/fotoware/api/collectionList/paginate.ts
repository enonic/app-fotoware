// NOTE: This file is not references by any other file in this project. Probably some cool feature I removed or never finished.

import type {
	Collection,
	CollectionList
} from '/lib/fotoware';

import {toStr} from '@enonic/js-utils';
//import {getCollectionList} from './get';
import {getCollectionList} from '/lib/fotoware/api/collectionList/get';


export const paginateCollectionList = ({
	accessToken,
	hostname,
	collectionList,
	fnHandleCollections
}: {
	accessToken: string
	hostname: string
	collectionList: CollectionList
	fnHandleCollections: (_collections: Collection[]) => void
}) => {
	log.debug('collectionList:%s', toStr(collectionList));

	// was .collections but documentation says it should be .data, so I'm going with the doc.
	// https://learn.fotoware.com/Integrations_and_APIs/001_The_FotoWare_API/FotoWare_API_Overview/Collection_List_representation
	fnHandleCollections(collectionList.data);

	if (collectionList.paging) {
		//log.debug(`paging:${toStr(collectionList.paging)}`);
		//prev, // URL of previous page. If null, then there is no previous page, and the current representation is the first page.
		//next, // URL of next page. If null, then there is no next page, and the current representation is the last page.
		//first, // URL of first page. This attribute is never null and can be used for restarting navigation at the beginning of the list.
		//last // URL of last page. If null, then the last page is not known, because it is not known how many pages there are. The last page (if the list has finite length) can be “discovered” by following paging.next repeatedly
		let {next} = collectionList.paging;
		while (next) {
			const collectionListPage = getCollectionList({
				accessToken,
				url: `${hostname}${next}`
			});
			next = collectionListPage.paging.next;
			fnHandleCollections(collectionListPage.collections);
		} // while next
	} // if paging
}; // export const paginateCollectionList
