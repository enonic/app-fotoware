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
	//log.debug(`assetListRequestParams:${toStr(assetListRequestParams)}`);
	const assetListResponse = request(assetListRequestParams);
	//log.debug(`assetListResponse:${toStr(assetListResponse)}`);

	if (assetListResponse.status !== 200) {
		throw new Error(`Something went wrong when trying to get assetList assetListRequestParams:${toStr(assetListRequestParams)} assetListListResponse:${toStr(assetListResponse)}`);
	}

	const {cookies} = assetListResponse;
	//log.debug(`cookies:${toStr(cookies)}`);

	let assetListResponseBodyObj;
	try {
		assetListResponseBodyObj = JSON.parse(assetListResponse.body);
	} catch (e) {
		throw new Error(`Something went wrong when trying to JSON parse the response body! assetListListResponse:${toStr(assetListResponse)}`);
	}
	//log.debug(`assetListResponseBodyObj:${toStr(assetListResponseBodyObj)}`);

	const {
		data: assets,
		paging
	} = assetListResponseBodyObj;
	//log.debug(`assets:${toStr(assets)}`);
	return {
		assets,
		cookies,
		paging
	};
}; // export const getAssetList
