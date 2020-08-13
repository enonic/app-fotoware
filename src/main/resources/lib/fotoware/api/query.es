import {request} from '/lib/http-client';
//import {toStr} from '/lib/util';

export function query(params) {
	const {
		accessToken,
		hostname,
		q,
		searchURL
	} = params;
	const queryRequestParams = {
		contentType: 'application/json',
		method: 'GET',
		//method: 'POST', // Method Not Allowed
		headers: {
			//Accept: 'application/vnd.fotoware.assetlist+json', // 406 Not Acceptable
			Accept: 'application/vnd.fotoware.collectionlist+json', // 200 OK
			Authorization: `bearer ${accessToken}`
		},
		/*params: {
			access_token: accessToken//,
			//q
		},*/
		url: `${hostname}${searchURL.replace('{?q}', `?q=${q}`)}`
		// NOTE Removing the ending slash gives 404
	}
	//log.debug(`queryRequestParams:${toStr(queryRequestParams)}`);

	const queryRequestResponse = request(queryRequestParams);
	//log.debug(`queryRequestResponse:${toStr(queryRequestResponse)}`);

	const collectionList = JSON.parse(queryRequestResponse.body);
	//log.debug(`collectionList:${toStr(collectionList)}`);

	const rv = collectionList.data.map(({
		//_searchString,
		assetCount,
		href/*,
		metadataEditor,
		searchURL,
		searchString,
		searchQuery*/
	}) => ({
		assetCount,
		href
	})).filter(({assetCount}) => assetCount);

	return rv;
} // export function query
