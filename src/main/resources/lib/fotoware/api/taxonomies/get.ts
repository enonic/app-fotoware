import {toStr} from '@enonic/js-utils';
// @ts-expect-error TS2307: Cannot find module '/lib/http-client' or its corresponding type declarations.
import {request} from '/lib/http-client';
import {DEBUG_REQUESTS} from '../../../../constants';


export function getTaxonomies({
	accessToken,
	hostname
}: {
	accessToken: string
	hostname: string
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
	DEBUG_REQUESTS && log.debug('getTaxonomiesRequest:%s', toStr(getTaxonomiesRequest));

	const getTaxonomiesResponse = request(getTaxonomiesRequest);
	DEBUG_REQUESTS && log.debug('getTaxonomiesResponse:%s', toStr(getTaxonomiesResponse));

	let getTaxonomiesResponseBodyObj;
	try {
		getTaxonomiesResponseBodyObj = JSON.parse(getTaxonomiesResponse.body);
	} catch (e) {
		throw new Error(`Something went wrong when trying to JSON parse the response body! getTaxonomiesResponse:${toStr(getTaxonomiesResponse)}`);
	}
	//log.debug(`getTaxonomiesResponseBodyObj:${toStr(getTaxonomiesResponseBodyObj)}`);
	return getTaxonomiesResponseBodyObj;
}
