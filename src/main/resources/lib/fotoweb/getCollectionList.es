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
	log.info(`collectionListRequestParams:${toStr(collectionListRequestParams)}`);
	const collectionListResponse = request(collectionListRequestParams);
	log.info(`collectionListResponse:${toStr(collectionListResponse)}`);

	let collectionListResponseBodyObj;
	try {
		collectionListResponseBodyObj = JSON.parse(collectionListResponse.body);
	} catch (e) {
		throw new Error(`Something went wrong when trying to JSON parse the response body! collectionListResponse:${toStr(collectionListResponse)}`);
	}
	log.info(`collectionListResponseBodyObj:${toStr(collectionListResponseBodyObj)}`);

	const {
		//add,
		data: archives//,
		//paging,
		//reorder,
		//searchURL
	} = collectionListResponseBodyObj;
	return {
		archives
	};
}; // export const getCollectionList
