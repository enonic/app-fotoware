/*
During a sync I should not encounter the same url twice or the FotoWeb API is broken.
But on second sync I should encounter mostly the same urls as in the first sync, and could skip them.
NOTE To skip an assetHref on second sync an array of assetHrefs is enough, BUT...
WARNING: A fileNameSize should only have a single md5sum or we have a conflict!
NOTE: So we have to check for conflicts.

This should be enough to check for conflicts:
const md5sumForFileNameSize = {
	fileNameSize1: md5sum1,
	fileNameSize2: md5sum2
};

This should be enough to skip assetHref:
const seenAssetHrefs = [assetHref1 ,assetHref2];

To achieve both this stored state is neccessary:
const storedState = {
	fileNameSize: {
		md5sum,
		assetHrefs: [
			assetHref1,
			assetHref2
		]
	}
};

Given I have assetHref, filename and filesize
IF assetHref in storedState
THEN
	Skip (don't even download)
ELSE
	Download Rendition
	Genereate MD5sum
	IF fileNameSize md5sum conflict
	THEN
		log ERROR and skip
	ELSE
		IF Media exist
		THEN
			Perhaps add href to media
			Add all state from media to storedState
		ELSE
			Create media (with href)
			Add fileNameSize, md5sum and href to storedState
*/

import deepEqual from 'fast-deep-equal';
//import getIn from 'get-value';
import {md5} from '/lib/text-encoding';
import {toStr} from '/lib/util';
import {forceArray} from '/lib/util/data';
import {sanitize} from '/lib/xp/common';
import {
	create as createContent,
	createMedia,
	get as getContentByKey,
	modify as modifyContent
} from '/lib/xp/content';
import {run} from '/lib/xp/context';


import {getAccessToken} from '/lib/fotoware/api/getAccessToken';
import {getPrivateFullAPIDescriptor} from '/lib/fotoware/api/getPrivateFullAPIDescriptor';
import {getAndPaginateCollectionList} from '/lib/fotoware/api/collectionList/getAndPaginate';
import {getMetadataView} from '/lib/fotoware/api/metadata/get';
import {getCollection} from '/lib/fotoware/api/collection/get';
import {paginateCollectionList} from '/lib/fotoware/api/collectionList/paginate';
import {getAndPaginateAssetList} from '/lib/fotoware/api/assetList/getAndPaginate';
import {requestRendition} from '/lib/fotoware/api/requestRendition';

const X_APP_NAME = sanitize(app.name).replace(/\./g, '-');

function sinceMediaDoesNotExistCreateIt({
	assetHref,
	downloadRenditionResponse,
	fields,
	metadata,
	mediaName,
	path
}) {
	const createMediaResult = createMedia({
		name: mediaName,
		parentPath: `/${path}`,
		data: downloadRenditionResponse.bodyStream
	});

	if (!createMediaResult) {
		const mediaPath = `/${path}/${mediaName}`;
		log.error(`Something went wrong when creating mediaPath:${mediaPath}!`);
		return;
	}

	const metadataArray = Object.keys(metadata).map((k) => {
		if (!fields[k]) {
			log.error(`Unable to find field:${k} metadata[${k}]:${toStr(metadata[k])} assetHref:${assetHref}`);
			return null;
		}
		return {
			id: k,
			label: fields[k].label,
			/*'multi-instance'
			'max-size'
			multiline
			data-type
			"validation": {
				"regexp": null,
				"max": null,
				"min": null
			},
			taxonomyHref*/
			values: metadata[k].value
		};
	}).filter((x) => x); // remove null entries
	//log.info(`metadataArray:${toStr(metadataArray)}`);

	//const modifiedMedia =
	modifyContent({
		key: createMediaResult._id,
		editor: (node) => {
			let fotoWareXData;
			try {
				//log.info(`node:${toStr(node)}`);
				//log.info(`node.type:${toStr(node.type)}`);
				if (!node.x) {
					node.x = {}; // eslint-disable-line no-param-reassign
				}
				fotoWareXData = {
					fotoWare: {
						hrefs: assetHref, // NOTE Might be multiple
						metadata: metadataArray
					}
				}
				node.x[X_APP_NAME] = fotoWareXData; // eslint-disable-line no-param-reassign
			} catch (e) {
				// Value of type [com.enonic.xp.data.PropertySet] cannot be converted to [Reference]
				log.error(`node:${toStr(node)}`);
				log.error(`fotoWareXData:${toStr(fotoWareXData)}`);
				throw e;
			}
			return node;
		}, // editor
		requireValid: false // Not under site so there is no x-data definitions
	}); // modifyContent
	//log.info(`modifiedMedia:${toStr(modifiedMedia)}`);
} // sinceMediaDoesNotExistCreateIt


export function syncSiteFlat({siteConfig}) {
	const {
		/*
		remoteAddresses,
		*/
		clientId,
		clientSecret,
		docTypes,
		path,
		project,
		url
	} = siteConfig;
	run({
		repository: `com.enonic.cms.${project}`,
		branch: 'draft',
		user: {
			login: 'su',
			idProvider: 'system'
		},
		principals: ['role:system.admin']
	}, () => {
		const folderContent = getContentByKey({key: `/${path}`});
		if (folderContent && !folderContent.type === 'base:folder') {
			throw new Error(`Content path:${path} not a folder!`);
		}
		if (!folderContent) {
			createContent({
				parentPath: '/',
				name: path,
				displayName: path,
				contentType: 'base:folder',
				data: {},
				requireValid: false,
				x: {
					[X_APP_NAME]: {
						fotoWare: {
							shouldStop: false,
							storedState: {}
						}
					}
				}
			});
		}
		const {accessToken} = getAccessToken({
			hostname: url,
			clientId,
			clientSecret
		})
		const {
			archivesPath,
			renditionRequest
		} = getPrivateFullAPIDescriptor({
			accessToken,
			hostname: url
		});

		// These will become undefined if moved below getAndPaginateCollectionList
		const fields = {};
		const metaDataViews = {};

		// TODO Load storedState from previous sync
		const {
			x: {
				[X_APP_NAME]: {
					fotoWare: {
						storedState = {}
					} = {}
				} = {}
			} = {}
		} = folderContent;
		log.info(`Loaded storedState:${toStr(storedState)}`);

		getAndPaginateCollectionList({
			accessToken,
			hostname: url,
			shortAbsolutePath: archivesPath,
			fnHandleCollections
		});

		function fnHandleCollections(collections) {
			//collections = [collections[0]]; // DEBUG
			collections.forEach((collection) => {
				const {
					href: collectionHref,
					metadataEditor: {
						href: metadataHref
					}
				} = collection;

				const {
					fields: metaDataViewFields,
					id: metaDataViewId
				} = getMetadataView({
					accessToken,
					fields,
					hostname: url,
					shortAbsolutePath: metadataHref
				});
				if (metaDataViews[metaDataViewId]) {
					if (!deepEqual(metaDataViews[metaDataViewId], {metaDataViewFields})) {
						throw new Error(`metaDataViews:${toStr(metaDataViews)} metaDataViewFields:${toStr(metaDataViewFields)} metaDataViewId:${metaDataViewId} already exist!`);
					}
				}

				const {
					childCount,
					children // collection list (object)
				} = getCollection({
					accessToken,
					hostname: url,
					shortAbsolutePath: collectionHref
				});
				if (childCount) {
					//log.info(`childCount:${toStr(childCount)}`);
					//log.info(`children:${toStr(children)}`);
					paginateCollectionList({
						accessToken,
						hostname: url,
						collectionList: {
							collections: children.data,
							paging: children.paging
						},
						fnHandleCollections // NOTE selfreference
					});
				} // childCount

				getAndPaginateAssetList({
					accessToken,
					hostname: url,
					shortAbsolutePath: collectionHref,
					//doPaginate: false, // DEBUG
					fnHandleAssets: (assets) => {
						//assets = [assets[0]]; // DEBUG
						assets.forEach((asset) => {
							const folderContent = getContentByKey({key: `/${path}`});
							const {
								x: {
									[X_APP_NAME]: {
										fotoWare: {
											shouldStop = true
										} = {}
									} = {}
								} = {}
							} = folderContent;
							if (shouldStop) {
								throw new Error(`shouldStop:true`);
							}
							//log.info(`asset:${toStr(asset)}`);
							const {
								doctype,
								filename,
								filesize,
								href: assetHref,
								metadata,
								renditions
							} = asset;
							if (!docTypes[doctype]) {return;}

							const mediaName = sanitize(`${filename}.${filesize}`).replace(/\./g, '-'); // This should be unique most of the time
							if (storedState[mediaName] && forceArray(storedState[mediaName].assetHrefs).includes(assetHref)) {
								log.info(`Skipping assetHref:${assetHref}, synced before`);
								return;
							}

							const {
								href: renditionHref/*,
								display_name: displayName,
								description,
								width,
								height,
								default: isDefault,
								original,
								sizeFixed,
								profile*/
							} = renditions
								.filter(({original}) => original === true)[0];

							const downloadRenditionResponse = requestRendition({
								accessToken,
								hostname: url,
								renditionServiceShortAbsolutePath: renditionRequest,
								renditionUrl: renditionHref
							});
							const md5sum = md5(downloadRenditionResponse.bodyStream.readText);
							//log.info(`new mediaName:${mediaName} md5sum:${md5sum}`);

							if (storedState[mediaName] && md5sum !== storedState[mediaName].md5sum) {
								log.error(`Hash collision for mediaName:${mediaName} storedState:${toStr(storedState[mediaName])} md5sum:${md5sum}!`);
								return;
							}

							const mediaPath = `/${path}/${mediaName}`;
							const exisitingMedia = getContentByKey({key: mediaPath});
							if (exisitingMedia) {
								// Check if assetHref matches
								let {
									x: {
										[X_APP_NAME]: {
											fotoWare: {
												hrefs: exisitingMediaHrefs
											} = {}
										} = {}
									} = {}
								} = exisitingMedia;
								if (!exisitingMediaHrefs) {
									log.warning(`A media was created without reference to it's assetUrl mediaPath:${mediaPath}`);
									exisitingMediaHrefs = [];
								} else if (!Array.isArray(exisitingMediaHrefs)) {
									exisitingMediaHrefs = [exisitingMediaHrefs];
								}
								if (!exisitingMediaHrefs.includes(assetHref)) {
									exisitingMediaHrefs.push(assetHref);
									modifyContent({
										key: mediaPath,
										editor: (node) => {
											try {
												//log.info(`node:${toStr(node)}`);
												node.x[X_APP_NAME].fotoWare.hrefs = exisitingMediaHrefs;
											} catch (e) {
												// Value of type [com.enonic.xp.data.PropertySet] cannot be converted to [Reference]
												log.error(`Unable to add assetHref:${assetHref} in node:${toStr(node)}`);
												throw e;
											}
											return node;
										}, // editor
										requireValid: false // Not under site so there is no x-data definitions
									}); // modifyContent
								}
								if (!storedState[mediaName]) { // This should not happen when storedState is loaded from previous sync (and is consistent)
									storedState[mediaName] = {
										md5sum,
										assetHrefs: [assetHref]
									};
								} else {
									exisitingMediaHrefs.forEach((anHref) => {
										if(!storedState[mediaName].assetHrefs.includes(anHref)) {
											storedState[mediaName].assetHrefs.push(anHref);
										}
									});
								}
								//log.info(`updated mediaName:${mediaName} in storedState:${toStr(storedState)}`);
								//throw 'STOPPED ON PURPOSE AFTER MEDIA EXIST WITH SAME FILESIZE ADDED ASSETHREF'; // DEBUG
								return;
							} // exisitingMedia

							// No media with same name and size has been synced before.
							if (!downloadRenditionResponse) {
								log.error(`Something went wrong when downloading rendition for assetHref:${assetHref}!`);
								return;
							}

							sinceMediaDoesNotExistCreateIt({
								assetHref,
								downloadRenditionResponse,
								fields,
								mediaName,
								metadata,
								path
							});
							storedState[mediaName] = {
								md5sum,
								assetHrefs: [assetHref]
							};
							//log.info(`added mediaName:${mediaName} to storedState:${toStr(storedState)}`);
							//throw 'STOPPED ON PURPOSE AFTER CREATING SINGLE MEDIA'; // DEBUG
						}); // forEach asset
					} // fnHandleAssets
				}); // getAndPaginateAssetList
			}); // forEach collection
		} // function fnHandleCollections

		log.info(`Storing storedState:${toStr(storedState)}`);
		modifyContent({
			key: folderContent._id,
			editor: (node) => {
				node.x[X_APP_NAME].fotoWare.storedState = storedState; // NOTE Property name cannot contain .
				return node;
			},
			requireValid: false // Not under site so there is no x-data definitions
		});
	}); // run in project
} // export function syncSiteFlat
