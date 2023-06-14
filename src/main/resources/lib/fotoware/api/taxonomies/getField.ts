import {toStr} from '@enonic/js-utils';
// @ts-expect-error TS2307: Cannot find module '/lib/http-client' or its corresponding type declarations
import {request} from '/lib/http-client';


export function getTaxonomyField({
	accessToken,
	fieldId,
	hostname,
	q
}: {
	accessToken: string
	fieldId: string
	hostname: string
	q: string
}) {
	const getTaxonomiesFieldRequest = {
		contentType: 'application/json',
		followRedirects: true, // Documentation is on unclear on the default https://developer.enonic.com/docs/http-client-library/master#requestoptions
		headers: {
			'Accept': 'application/json'
		},
		method: 'GET',
		params: {
			access_token: accessToken,
			q
		},
		url: `${hostname}/taxonomies/${fieldId}/`
	};
	//log.debug(`getTaxonomiesFieldRequest:${toStr(getTaxonomiesFieldRequest)}`);

	const getTaxonomiesFieldResponse = request(getTaxonomiesFieldRequest);
	//log.debug(`getTaxonomiesFieldResponse:${toStr(getTaxonomiesFieldResponse)}`);

	if (getTaxonomiesFieldResponse.status === 404) {
		return {};
	}

	let getTaxonomiesFieldResponseBodyObj;
	try {
		getTaxonomiesFieldResponseBodyObj = JSON.parse(getTaxonomiesFieldResponse.body);
	} catch (e) {
		throw new Error(`Something went wrong when trying to JSON parse the response body! getTaxonomiesFieldResponse:${toStr(getTaxonomiesFieldResponse)}`);
	}
	//log.debug(`getTaxonomiesFieldResponseBodyObj:${toStr(getTaxonomiesFieldResponseBodyObj)}`);

	return getTaxonomiesFieldResponseBodyObj;
}
