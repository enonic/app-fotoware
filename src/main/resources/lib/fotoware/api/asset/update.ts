// Note this file was used in handleNewMedia, but that code is commented out now.

import type { Metadata } from '/lib/fotoware';


import { toStr } from '@enonic/js-utils';
// @ts-expect-error TS2307: Cannot find module '/lib/http-client' or its corresponding type declarations
import { request } from '/lib/http-client';
import {DEBUG_REQUESTS} from '/constants';

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
	metadata
}: {
	accessToken: string
	fullAssetUrl: string
	metadata: Record<string, string | string[]> // TODO: Uncertain on this type.
}) {
	log.debug('assetUpdate() metadata:%s', toStr(metadata));
	// Enonic:   { 5:          'The Beatles'  , 90:          'London' }
	// FotoWare: { 5: { value: 'The Beatles' }, 90: { value: 'London' } }
	const metadataWithValue: Metadata = {}
	Object.keys(metadata).forEach((k) => {
		const value = metadata[k] as string | string[];
		metadataWithValue[k] = { value };
	});

	const assetUpdateRequestParams = {
		body: {
			metadata: metadataWithValue
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
	DEBUG_REQUESTS && log.debug('assetUpdateRequestParams:%s', toStr(assetUpdateRequestParams));

	const assetUpdateResponse = request(assetUpdateRequestParams);
	DEBUG_REQUESTS && log.debug('assetUpdateResponse:%s', toStr(assetUpdateResponse));

	// 405 Method Not Allowed

	let assetUpdateResponseBodyObj;
	try {
		assetUpdateResponseBodyObj = JSON.parse(assetUpdateResponse.body);
	} catch (e) {
		throw new Error(`Something went wrong when trying to JSON parse the response body! assetUpdateResponse:${toStr(assetUpdateResponse)}`);
	}
	log.debug(`assetUpdateResponseBodyObj:${toStr(assetUpdateResponseBodyObj)}`);
}
