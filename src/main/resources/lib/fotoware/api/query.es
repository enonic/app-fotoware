//import deepEqual from 'fast-deep-equal';
//import {getMetadataView} from '/lib/fotoware/api/metadata/get';
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
	//const fields = {};
	//const unknownFields = {};
	//const metadataHrefs = {};

	const collections = collectionList.data.map(({
		assetCount,
		href,
		/*metadataEditor: {
			href: collectionMetadataHref
		},*/
		originalURL
	}) => ({
		assetCount,
		collectionId: originalURL.replace(/\/$/, '').replace(/^.*\//, ''),
		//collectionMetadataHref,
		href
	})).filter(({
		assetCount,
		collectionId
	}) => { // False gets removed
		if (!assetCount) {
			//log.debug(`No hits collectionId:${toStr(collectionId)}`);
			return false;
		}
		if (Object.keys(whitelistedCollections).length) {
			const whiteListed = whitelistedCollections[collectionId];
			//log.debug(`collectionId:${toStr(collectionId)} whiteListed:${toStr(whiteListed)}`);
			return whiteListed;
		}
		if (Object.keys(blacklistedCollections).length && blacklistedCollections[collectionId]) {
			//log.debug(`Blacklisted collectionId:${toStr(collectionId)}`);
			return false;
		}
		return true;
	}).map(({
		assetCount,
		collectionId,
		//collectionMetadataHref,
		href
	}) => {
		//log.debug(`href:${toStr(href)}`); // /fotoweb/archives/5000-Archive/?q=
		assetCountTotal += assetCount;
		/*if (!metadataHrefs[collectionMetadataHref]) {
			//log.debug(`New metadataEditor in collection ${collectionId} href:${collectionMetadataHref}`);
			metadataHrefs[collectionMetadataHref] = true;
			getMetadataView({
				accessToken,
				fields,
				hostname,
				shortAbsolutePath: collectionMetadataHref
			});
		}*/
		// NOTE 17.7 seconds when processing metadata, 1.6 seconds when not
		// Skipping the deepEqual wasn't good enough, still 17.6 seconds
		// Skipping filter 17.3
		// Skipping previous metadataHrefs 2.74 // I'm happy with this result
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
					/*metadataEditor: {
						href: assetMetadataHref
					},*/
					renditions
				}) => {
					/*if (!metadataHrefs[assetMetadataHref]) {
						log.debug(`New metadataEditor in asset ${href} href:${assetMetadataHref}`); // Haven's seen this happen yet.
						metadataHrefs[assetMetadataHref] = true;
						getMetadataView({
							accessToken,
							fields,
							hostname,
							shortAbsolutePath: assetMetadataHref
						});
					}
					const metadataObj = {};
					Object.keys(metadata).forEach((k) => {
						if (fields[k]) {
							metadataObj[camelize(fields[k].label.toLowerCase())] = metadata[k].value;
						} else {
							if (!unknownFields[k]) {
								unknownFields[k] = true;
								//log.error(`Unable to find field:${k} metadata[${k}]:${toStr(metadata[k])} assetHref:${href} editorHref:${assetMetadataHref}`);
							}
						}
					});*/
					//log.debug(`metadataArray:${toStr(metadataArray)}`);
					collectionObj.assets.push({
						doctype,
						filename,
						filesize,
						href,
						metadata,
						//metadataObj,
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

	/*if (Object.keys(unknownFields).length) {
		log.warning(`unknownFields:${toStr(Object.keys(unknownFields))}`);
	}

	log.debug(`fields:${toStr(fields)}`);*/

	return {
		assetCountTotal,
		collections
	};
} // export function query
