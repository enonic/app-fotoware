import {request} from '/lib/http-client';
import {toStr} from '/lib/util';

export const getAssetList = ({
	accessToken,
	url
}) => {
	const assetListRequestParams = {
		contentType: 'application/json',
		method: 'GET',
		headers: {
			Accept: 'application/vnd.fotoware.assetlist+json'
		},
		url
	};
	if (accessToken) {
		assetListRequestParams.params = {
			access_token: accessToken
		};
	}
	//log.info(`assetListRequestParams:${toStr(assetListRequestParams)}`);
	const assetListResponse = request(assetListRequestParams);
	//log.info(`assetListResponse:${toStr(assetListResponse)}`);

	const {cookies} = assetListResponse;
	//log.info(`cookies:${toStr(cookies)}`);

	let assetListResponseBodyObj;
	try {
		assetListResponseBodyObj = JSON.parse(assetListResponse.body);
	} catch (e) {
		throw new Error(`Something went wrong when trying to JSON parse the response body! assetListListResponse:${toStr(assetListResponse)}`);
	}
	//log.info(`assetListResponseBodyObj:${toStr(assetListResponseBodyObj)}`);

	const {
		data: assets,
		paging
	} = assetListResponseBodyObj;
	//log.info(`assets:${toStr(assets)}`);
	log.info(`paging:${toStr(paging)}`);
	return {
		assets,
		cookies
	};
}; // export const getAssetList
