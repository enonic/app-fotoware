import type { HttpClient } from '/lib/fotoware';


import {toStr} from '@enonic/js-utils';
// @ts-expect-error TS2307: Cannot find module '/lib/http-client' or its corresponding type declarations.
import {request} from '/lib/http-client';


export const getAssetList = ({
	accessToken,
	url
}: {
	accessToken: string,
	url: string
}) => {
	const assetListRequestParams: HttpClient.Request = {
		contentType: 'application/json',
		followRedirects: true, // Documentation is on unclear on the default https://developer.enonic.com/docs/http-client-library/master#requestoptions
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
