//import deepEqual from 'fast-deep-equal';
import {getMetadataView} from '/lib/fotoware/api/metadata/get';
import {paginate} from '/lib/fotoware/api/paginate';
import {request} from '/lib/http-client';
import {toStr} from '/lib/util';

export function query(params) {
	const {
		accessToken,
		blacklistedCollections,
		hostname,
		q,
		searchURL,
		whitelistedCollections
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

	const {paging} = collectionList;
	if (paging) {
		const errMsg = `Unhandeled paging:${toStr(paging)}`
		log.error(errMsg);
		throw new Error(errMsg);
	}

	let assetCountTotal = 0;
	const collections = collectionList.data.map(({
		//name,
		originalURL, // "/fotoweb/archives/5000-Archive/"
		//_searchString,
		assetCount,
		href/*,
		metadataEditor,
		searchURL,
		searchString,
		searchQuery*/
	}) => ({
		assetCount,
		collectionId: originalURL.replace(/\/$/, '').replace(/^.*\//, ''),
		href
	})).filter(({
		assetCount,
		collectionId
	}) => { // False gets removed
		if (!assetCount) {
			//log.debug(`No hits collectionId:${toStr(collectionId)}`);
			return false;
		}
		if (Object.keys(whitelistedCollections).length && !whitelistedCollections[collectionId]) {
			//log.debug(`Not whitelisted collectionId:${toStr(collectionId)}`);
			return false;
		}
		if (Object.keys(blacklistedCollections).length && blacklistedCollections[collectionId]) {
			//log.debug(`Blacklisted collectionId:${toStr(collectionId)}`);
			return false;
		}
		assetCountTotal += assetCount;
		return true;
	}).map(({
		assetCount,
		collectionId,
		href
	}) => {
		// NOTE 17.7 seconds when processing metadata, 1.6 seconds when not
		// Skipping the deepEqual wasn't good enough, still 17.6 seconds
		// Skipping filter 17.3
		// Skipping previous metadataHrefs 2.74 // I'm happy with this result
		const fields = {};
		const metadataHrefs = {};
		//const metaDataViews = {};
		const collectionObj = {
			collectionId,
			assetCount,
			assets: []
		};
		paginate({
			//doPaginate: false, // DEBUG
			fnHandlePage: (page) => {
				//log.debug(`page:${toStr(page)}`);
				const {
					data
				} = page;

				data.forEach(({
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
						/* else {
							//log.error(`Unable to find field:${k} metadata[${k}]:${toStr(metadata[k])}`); // Too many
						} */
					});
					//log.debug(`metadataArray:${toStr(metadataArray)}`);
					collectionObj.assets.push({
						doctype,
						filename,
						filesize,
						href,
						//metadata,
						metadataArray,
						renditionHref: renditions
							.filter(({original}) => original === true)[0].href
					});
				}); // assets forEach
			}, // fnHandlePage
			hostname,
			request: {
				contentType: 'application/json',
				method: 'GET',
				headers: {
					Accept: 'application/vnd.fotoware.assetlist+json',
					Authorization: `bearer ${accessToken}`
				},
				url: `${hostname}${href}`
			}
		}); // paginate
		return collectionObj;
	}); // collectionList.data.map

	return {
		assetCountTotal,
		collections
	};
} // export function query
