import {request} from '/lib/http-client';
import {toStr} from '/lib/util';

/*

 https://learn.fotoware.com/Integrations_and_APIs/001_The_FotoWare_API/FotoWare_API_Overview/Updating_metadata_on_an_asset

 PATCH asset URL
 Content-Type: application/vnd.fotoware.assetupdate+json
 Accept: application/vnd.fotoware.asset+json

 Requires authentication: Yes

 Required permissions: Edit Metadata on the archive containing the asset

*/

export function assetUpdate({
	accessToken,
	fullAssetUrl,
	metadata // { 5: { value: 'The Beatles' }, 90: { value: 'London' } }
}) {
	const assetUpdateRequestParams = {
		body: {
			metadata
		},
		contentType: 'application/vnd.fotoware.assetupdate+json',
		followRedirects: true, // Documentation is on unclear on the default https://developer.enonic.com/docs/http-client-library/master#requestoptions
		headers: {
			'Accept': 'application/vnd.fotoware.asset+json'
		},
		method: 'PATCH', // 405 Method Not Allowed
		//method: 'GET',
		params: {
			access_token: accessToken
		},
		url: fullAssetUrl
		//url: fullAssetUrl.replace('.info', '') // 404 FolderNotFound
		//url: fullAssetUrl.replace('.info', '.metadata') // 404 FolderNotFound
		//url: `${fullAssetUrl}.metadata` // 404 FolderNotFound
		//url: `${fullAssetUrl}.meta`
	};
	log.debug(`assetUpdateRequestParams:${toStr(assetUpdateRequestParams)}`);

	const assetUpdateResponse = request(assetUpdateRequestParams);
	log.debug(`assetUpdateResponse:${toStr(assetUpdateResponse)}`);

	// 405 Method Not Allowed

	let assetUpdateResponseBodyObj;
	try {
		assetUpdateResponseBodyObj = JSON.parse(assetUpdateResponse.body);
	} catch (e) {
		throw new Error(`Something went wrong when trying to JSON parse the response body! assetUpdateResponse:${toStr(assetUpdateResponse)}`);
	}
	log.debug(`assetUpdateResponseBodyObj:${toStr(assetUpdateResponseBodyObj)}`);
}
