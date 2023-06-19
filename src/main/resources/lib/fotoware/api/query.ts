import type {
	AllowOrDenyCollectionsRecord,
	Asset,
	AssetList,
	CollectionList,
	FieldDescriptionField,
	MetadataItemWithValue
} from '/lib/fotoware';


import {toStr} from '@enonic/js-utils';

// import urlencode from 'urlencode'; // requires 'stream' Node.js module
// @ts-expect-error TS7016: Could not find a declaration file for module 'encodeuricomponent-tag'
import uri from 'encodeuricomponent-tag';

//import * as deepEqual from 'fast-deep-equal';
//import deepEqual from 'fast-deep-equal';
import {getMetadataView} from '/lib/fotoware/api/metadata/get';
import {paginate} from '/lib/fotoware/api/paginate';
import {camelize} from '/lib/fotoware/xp/camelize';
// @ts-expect-error TS2307: Cannot find module '/lib/http-client' or its corresponding type declarations.
import {request} from '/lib/http-client';


export interface CollectionObj {
	assetCount: number
	assets: Partial<Asset>[]
	collectionId: string
}


export function query(params: {
	accessToken: string
	blacklistedCollections: AllowOrDenyCollectionsRecord
	hostname: string
	q: string
	searchURL: string
	whitelistedCollections: AllowOrDenyCollectionsRecord
}) {
	const {
		accessToken,
		blacklistedCollections,
		hostname,
		q,
		searchURL,
		whitelistedCollections
	} = params;
	// log.debug('hostname:%s', hostname);
	// log.debug('searchURL:%s', searchURL);
	// log.debug('q:%s', q);

	const url = `${hostname}${
		searchURL
			.replace(
				'{?q}',
				// `?q=${urlencode(q)}`
				uri`?q=${q}`
			)
	}`;
	// log.debug('url:%s', url);

	// NOTE Removing the ending slash gives 404
	const queryRequest = {
		contentType: 'application/json',
		followRedirects: true, // Documentation is on unclear on the default https://developer.enonic.com/docs/http-client-library/master#requestoptions
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
		url
	}
	//log.debug(`queryRequest:${toStr(queryRequest)}`);

	const queryRequestResponse = request(queryRequest);
	//log.debug(`queryRequestResponse:${toStr(queryRequestResponse)}`);

	if (queryRequestResponse.status !== 200) {
		log.error(`Something went wrong when querying:${q} response:${toStr(queryRequestResponse)}`);
		throw new Error(`Something went wrong when querying:${q} HTTP Status:${queryRequestResponse.status}!`);
	}

	//log.debug(`body:${toStr(queryRequestResponse.body)}`);

	const collectionList = JSON.parse(queryRequestResponse.body) as CollectionList;
	//log.debug(`collectionList:${toStr(collectionList)}`);

	const {paging} = collectionList;
	if (paging) {
		const errMsg = `Unhandeled paging:${toStr(paging)}`
		log.error(errMsg);
		throw new Error(errMsg);
	}

	let assetCountTotal = 0;
	const fields: Record<string, Omit<FieldDescriptionField, 'id'>> = {};
	const unknownFields: Record<string, boolean> = {};
	const metadataHrefs: Record<string, boolean> = {};

	const collections = collectionList.data.map(({
		assetCount,
		href,
		metadataEditor: {
			href: collectionMetadataHref
		},
		originalURL//,
		//...rest
	}) => ({
		assetCount,
		collectionId: originalURL.replace(/\/$/, '').replace(/^.*\//, ''),
		collectionMetadataHref,
		href//,
		//rest
	})).filter(({
		assetCount,
		collectionId//,
		//rest
	}) => { // False gets removed
		//log.debug(`rest:${toStr(rest)}`);
		// log.debug('assetCount:%s', toStr(assetCount));
		if (!assetCount) {
			//log.debug(`No hits collectionId:${toStr(collectionId)}`);
			return false;
		}
		// log.debug('whitelistedCollections:%s', toStr(whitelistedCollections));
		if (Object.keys(whitelistedCollections).length) {
			const whiteListed = whitelistedCollections[collectionId];
			//log.debug(`collectionId:${toStr(collectionId)} whiteListed:${toStr(whiteListed)}`);
			return whiteListed;
		}
		// log.debug('blacklistedCollections:%s', toStr(blacklistedCollections));
		if (Object.keys(blacklistedCollections).length && blacklistedCollections[collectionId]) {
			//log.debug(`Blacklisted collectionId:${toStr(collectionId)}`);
			return false;
		}
		return true;
	}).map(({
		assetCount,
		collectionId,
		collectionMetadataHref,
		href
	}) => {
		//log.debug(`href:${toStr(href)}`); // /fotoweb/archives/5000-Archive/?q=
		assetCountTotal += assetCount;
		// log.debug('metadataHrefs:%s', toStr(metadataHrefs));
		if (!metadataHrefs[collectionMetadataHref]) {
			//log.debug(`New metadataEditor in collection ${collectionId} href:${collectionMetadataHref}`);
			metadataHrefs[collectionMetadataHref] = true;
			getMetadataView({
				accessToken,
				fields,
				hostname,
				shortAbsolutePath: collectionMetadataHref
			});
		}
		// NOTE 17.7 seconds when processing metadata, 1.6 seconds when not
		// Skipping the deepEqual wasn't good enough, still 17.6 seconds
		// Skipping filter 17.3
		// Skipping previous metadataHrefs 2.74 // I'm happy with this result
		//const metaDataViews = {};
		const collectionObj: CollectionObj = {
			collectionId,
			assetCount,
			assets: []
		};
		paginate<AssetList>({
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
						href: assetMetadataHref
					},
					renditions//,
					//...pageRest
				}) => {
					//log.debug(`pageRest:${toStr(pageRest)}`);
					if (!metadataHrefs[assetMetadataHref]) {
						log.debug(`New metadataEditor in asset ${href} href:${assetMetadataHref}`); // Haven's seen this happen yet.
						metadataHrefs[assetMetadataHref] = true;
						getMetadataView({
							accessToken,
							fields,
							hostname,
							shortAbsolutePath: assetMetadataHref
						});
					}
					const metadataObj: Record<string, MetadataItemWithValue['value']> = {};
					Object.keys(metadata).forEach((k) => {
						if(!metadata[k]) {
							throw new Error(`Malformed metadata key:${k} metadata:${toStr(metadata)}`);
						}
						if (fields[k]) {
							metadataObj[camelize((fields[k] as Omit<FieldDescriptionField, 'id'>).label.toLowerCase())] = (metadata[k] as MetadataItemWithValue).value;
						} else {
							if (!unknownFields[k]) {
								unknownFields[k] = true;
								log.error(`Unable to find field:${k} metadata[${k}]:${toStr(metadata[k])} assetHref:${href} editorHref:${assetMetadataHref}`);
							}
						}
					});
					//log.debug(`metadataArray:${toStr(metadataArray)}`);
					collectionObj.assets.push({
						doctype,
						filename,
						filesize,
						href,
						metadata,
						//metadataObj,
						renditions
						/*renditionHref: renditions
							.filter(({original}) => original === true)[0].href*/
					});
				}); // assets forEach
			}, // fnHandlePage
			hostname,
			request: {
				contentType: 'application/json',
				followRedirects: true, // Documentation is on unclear on the default https://developer.enonic.com/docs/http-client-library/master#requestoptions
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
