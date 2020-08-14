import {request} from '/lib/http-client';
import {toStr} from '/lib/util';

export const getCollectionList = ({
	accessToken,
	url
}) => {
	const collectionListRequestParams = {
		contentType: 'application/json',
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
	//log.debug(`collectionListRequestParams:${toStr(collectionListRequestParams)}`);
	const collectionListResponse = request(collectionListRequestParams);
	//log.debug(`collectionListResponse:${toStr(collectionListResponse)}`);

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
