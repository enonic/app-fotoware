import {toStr} from '@enonic/js-utils';

import {request} from '/lib/http-client';


export function getTaxonomies({
	accessToken,
	hostname
}) {
	const getTaxonomiesRequest = {
		contentType: 'application/json',
		followRedirects: true, // Documentation is on unclear on the default https://developer.enonic.com/docs/http-client-library/master#requestoptions
		headers: {
			'Accept': 'application/json'
		},
		method: 'GET',
		params: {
			access_token: accessToken
		},
		url: `${hostname}/taxonomies`
	};
	//log.debug(`getTaxonomiesRequest:${toStr(getTaxonomiesRequest)}`);

	const getTaxonomiesResponse = request(getTaxonomiesRequest);
	//log.debug(`getTaxonomiesResponse:${toStr(getTaxonomiesResponse)}`);

	let getTaxonomiesResponseBodyObj;
	try {
		getTaxonomiesResponseBodyObj = JSON.parse(getTaxonomiesResponse.body);
	} catch (e) {
		throw new Error(`Something went wrong when trying to JSON parse the response body! getTaxonomiesResponse:${toStr(getTaxonomiesResponse)}`);
	}
	//log.debug(`getTaxonomiesResponseBodyObj:${toStr(getTaxonomiesResponseBodyObj)}`);
	return getTaxonomiesResponseBodyObj;
}
