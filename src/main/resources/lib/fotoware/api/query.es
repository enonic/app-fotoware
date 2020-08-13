//import deepEqual from 'fast-deep-equal';
import {getMetadataView} from '/lib/fotoware/api/metadata/get';
import {request} from '/lib/http-client';
//import {toStr} from '/lib/util';

export function query(params) {
	const {
		accessToken,
		hostname,
		q,
		searchURL
	} = params;
	const queryRequest = {
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
	//log.debug(`queryRequest:${toStr(queryRequest)}`);

	const queryRequestResponse = request(queryRequest);
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
	})).filter(({assetCount}) => assetCount).map(({
		assetCount,
		href
	}) => {
		const collectionQueryRequest = {
			contentType: 'application/json',
			method: 'GET',
			headers: {
				Accept: 'application/vnd.fotoware.assetlist+json',
				Authorization: `bearer ${accessToken}`
			},
			url: `${hostname}${href}`
		};
		//log.debug(`collectionQueryRequest:${toStr(collectionQueryRequest)}`);

		const collectionQueryResponse = request(collectionQueryRequest);
		//log.debug(`collectionQueryResponse:${toStr(collectionQueryResponse)}`);

		const assetList = JSON.parse(collectionQueryResponse.body);
		//log.debug(`assetList:${toStr(assetList)}`);

		const {
			data,
			paging // TODO Paginate
		} = assetList;
		//log.debug(`paging:${toStr(paging)}`);

		// NOTE 17.7 seconds when processing metadata, 1.6 seconds when not
		// Skipping the deepEqual wasn't good enough, still 17.6 seconds
		// Skipping filter 17.3
		// Skipping previous metadataHrefs 2.74 // I'm happy with this result

		const fields = {};
		const metadataHrefs = {};
		//const metaDataViews = {};

		return {
			assetCount,
			assets: data.map(({
				doctype,
				filename,
				filesize,
				href,
				metadata,
				metadataEditor: {
					href: metadataHref
				},
				renditions
			}) => {
				if (!metadataHrefs[metadataHref]) {
					metadataHrefs[metadataHref] = true;
					/*const {
					fields: metaDataViewFields,
					id: metaDataViewId
					} =*/
					getMetadataView({
						accessToken,
						fields,
						hostname,
						shortAbsolutePath: metadataHref
					});
					/*if (metaDataViews[metaDataViewId]) {
						if (!deepEqual(metaDataViews[metaDataViewId], {metaDataViewFields})) {
							throw new Error(`metaDataViews:${toStr(metaDataViews)} metaDataViewFields:${toStr(metaDataViewFields)} metaDataViewId:${metaDataViewId} already exist!`);
						}
					}*/
				}
				const metadataArray = [];
				Object.keys(metadata).forEach((k) => {
					if (fields[k]) {
						metadataArray.push({
							id: k,
							label: fields[k].label,
							values: metadata[k].value
						});
					}
					/*if (!fields[k]) {
						//log.error(`Unable to find field:${k} metadata[${k}]:${toStr(metadata[k])}`); // Too many
						return null;
					}
					return {
						id: k,
						label: fields[k].label,
						values: metadata[k].value
					};*/
				});//.filter((x) => x); // remove null entries
				//log.debug(`metadataArray:${toStr(metadataArray)}`);*/

				return {
					doctype,
					filename,
					filesize,
					href,
					//metadata,
					metadataArray,
					renditionHref: renditions
						.filter(({original}) => original === true)[0].href
				};
			}),
			paging
		};
	});

	return rv;
} // export function query
