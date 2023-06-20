import type { HttpClient } from '/lib/fotoware';


import {toStr} from '@enonic/js-utils';
// @ts-expect-error TS2307: Cannot find module '/lib/http-client' or its corresponding type declarations.
import {request} from '/lib/http-client';
import {DEBUG_REQUESTS} from '/constants';


export const getCollectionList = ({
	accessToken,
	url
}: {
	accessToken: string
	url: string
}) => {
	const collectionListRequestParams: HttpClient.Request = {
		contentType: 'application/json',
		followRedirects: true, // Documentation is on unclear on the default https://developer.enonic.com/docs/http-client-library/master#requestoptions
		method: 'GET',
		headers: {
			Accept: 'application/vnd.fotoware.collectionlist+json'
		},
		url
	};
	if (accessToken) {
		collectionListRequestParams.params = {
			access_token: accessToken
		};
	}
	DEBUG_REQUESTS && log.debug('collectionListRequestParams:%s', toStr(collectionListRequestParams));
	const collectionListResponse = request(collectionListRequestParams);
	DEBUG_REQUESTS && log.debug('collectionListResponse:%s', toStr(collectionListResponse));

	if (collectionListResponse.status !== 200) {
		throw new Error(`Something went wrong when trying to get assetList collectionListRequestParams:${toStr(collectionListRequestParams)} collectionListResponse:${toStr(collectionListResponse)}`);
	}

	let collectionListResponseBodyObj;
	try {
		collectionListResponseBodyObj = JSON.parse(collectionListResponse.body);
	} catch (e) {
		throw new Error(`Something went wrong when trying to JSON parse the response body! collectionListResponse:${toStr(collectionListResponse)}`);
	}
	//log.debug(`collectionListResponseBodyObj:${toStr(collectionListResponseBodyObj)}`);

	const {
		//add,
		data: collections,
		paging//,
		//reorder,
		//searchURL
	} = collectionListResponseBodyObj;
	//log.debug(`collections:${toStr(collections)}`);
	//log.debug(`paging:${toStr(paging)}`);
	return {
		collections,
		paging
	};
}; // export const getCollectionList
