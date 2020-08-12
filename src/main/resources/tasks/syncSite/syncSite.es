import deepEqual from 'fast-deep-equal';
//import getIn from 'get-value';
//import {md5} from '/lib/text-encoding';
import {toStr} from '/lib/util';
//import {forceArray} from '/lib/util/data';
import {sanitize} from '/lib/xp/common';
import {
	create as createContent,
	//createMedia,
	//getAttachmentStream,
	get as getContentByKey//,
	//modify as modifyContent
} from '/lib/xp/content';
import {run as runInContext} from '/lib/xp/context';
//import {readText} from '/lib/xp/io';
import {
	get as getTask,
	//isRunning,
	sleep,
	submitNamed
} from '/lib/xp/task';

import {getAccessToken} from '/lib/fotoware/api/getAccessToken';
import {getPrivateFullAPIDescriptor} from '/lib/fotoware/api/getPrivateFullAPIDescriptor';
import {getAndPaginateCollectionList} from '/lib/fotoware/api/collectionList/getAndPaginate';
import {getMetadataView} from '/lib/fotoware/api/metadata/get';
import {getCollection} from '/lib/fotoware/api/collection/get';
import {paginateCollectionList} from '/lib/fotoware/api/collectionList/paginate';
import {getAndPaginateAssetList} from '/lib/fotoware/api/assetList/getAndPaginate';
//import {requestRendition} from '/lib/fotoware/api/requestRendition';
import {Progress} from './Progress';

const X_APP_NAME = sanitize(app.name).replace(/\./g, '-');

/*class StateClass {
	constructor() {
		this.assetsCount = 0;
		this.assetsSize = 0;

		this.includedCount = 0;
		this.includedSize = 0;

		this.processedCount = 0;
		this.processedSize = 0;
	}

	addToAssetsCount(count) {
		this.assetsCount += count;
		return this; // chainable
	}

	addToAssetsSize(size) {
		this.assetsSize += size;
		return this; // chainable
	}

	incrementIncludedCount() {
		this.includedCount += 1;
		return this; // chainable
	}

	addToIncludedSize(size) {
		this.includedSize += size;
		return this; // chainable
	}

	incrementProcessedCount() {
		this.processedCount += 1;
		return this; // chainable
	}

	addToProcessedSize(size) {
		this.processedSize += size;
		return this; // chainable
	}
} // class StateClass*/

export function run(params) {
	//log.debug(`params:${toStr(params)}`);

	const {
		clientId,
		clientSecret,
		docTypesJson,
		path,
		project,
		//remoteAddressesJson,
		site,
		url
	} = params;

	if(!site) { throw new Error(`Required param site missing! params:${toStr(params)}`); }

	const progress = new Progress({
		info: `Initializing Sync FotoWare site ${site}`,
		total: 5 // Init, CreateFolder, getAccessToken, apiDescriptor, gettingCollectionList
	}).report();
	// Progress should be [0/5] Initializing Sync FotoWare site collicare

	//const state = new StateClass();

	if(!clientId) { throw new Error(`Required param clientId missing! params:${toStr(params)}`); }
	if(!clientSecret) { throw new Error(`Required param clientSecret missing! params:${toStr(params)}`); }
	if(!docTypesJson) { throw new Error(`Required param docTypesJson missing! params:${toStr(params)}`); }
	if(!path) { throw new Error(`Required param path missing! params:${toStr(params)}`); }
	if(!project) { throw new Error(`Required param project missing! params:${toStr(params)}`); }
	//if(!remoteAddressesJson) { throw new Error(`Required param remoteAddressesJson missing! params:${toStr(params)}`); }
	if(!url) { throw new Error(`Required param url missing! params:${toStr(params)}`); }

	let docTypes;
	try {
		docTypes = JSON.parse(docTypesJson)
	} catch (e) {
		throw new Error(`Something went wrong when trying to parse docTypesJson:${toStr(params)}`);
	}
	//log.info(`docTypes:${toStr(docTypes)}`);

	/*let remoteAddresses;
	try {
		remoteAddresses = JSON.parse(remoteAddressesJson)
	} catch (e) {
		throw new Error(`Something went wrong when trying to parse remoteAddressesJson:${toStr(params)}`);
	}
	//log.info(`remoteAddresses:${toStr(remoteAddresses)}`);*/

	runInContext({
		repository: `com.enonic.cms.${project}`,
		branch: 'draft',
		user: {
			login: 'su', // So Livetrace Tasks reports correct user
			idProvider: 'system'
		},
		principals: ['role:system.admin']
	}, () => {
		const folderPath =`/${path}`;

		progress.finishItem(/*'Initializing'*/).setInfo(`Creating target folder ${folderPath} (if needed)`).report();
		// Progress should be [1/5] Creating target folder /FotoWare (if needed)

		const folderContent = getContentByKey({key: folderPath});
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
							shouldStop: false//,
							//storedState: {}
						}
					}
				}
			});
		} // !folderContent

		progress.finishItem(/*'Creating folder'*/).setInfo('Getting accessToken').report();
		// Progress should be [2/5] Getting accessToken

		const {accessToken} = getAccessToken({
			hostname: url,
			clientId,
			clientSecret
		});

		progress.finishItem(/*'Getting accessToken'*/).setInfo('Getting API Descriptor').report();
		// Progress should be [3/5] Getting API Descriptor

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
		/*const {
			x: {
				[X_APP_NAME]: {
					fotoWare: {
						storedState = {}
					} = {}
				} = {}
			} = {}
		} = folderContent;
		log.debug(`Loaded storedState:${toStr(storedState)}`);*/

		const queue = [/*{
			assetHref,
			doctype,
			filename,
			filesize,
			metadata,
			renditionHref
		}*/];

		function fnHandleCollections(collections) {
			//collections = [collections[0]]; // DEBUG
			//log.info(`collections:${toStr(collections)}`);
			//log.info(`collections.length:${toStr(collections.length)}`);
			progress.addItems(collections.length); // Found collections to process
			// Lets say 10 collections are added then progress should be [4/15] Current: ProcessCollectionLists

			collections.forEach((collection) => {
				const {
					href: collectionHref,
					metadataEditor: {
						href: metadataHref
					}
				} = collection;

				progress.setInfo(`Processing collection ${collectionHref}`).report();
				// Progress should still be [4/15] Current: ProcessCollectionLists

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

				//const boolProcessSubCollections = true;
				const boolProcessSubCollections = false; // DEBUG
				if (boolProcessSubCollections) {
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
				} // boolProcessSubCollections

				getAndPaginateAssetList({
					accessToken,
					hostname: url,
					shortAbsolutePath: collectionHref,
					doPaginate: false, // DEBUG
					fnHandleAssets: (assets) => {
						//assets = [assets[0]]; // DEBUG
						//log.info(`assets:${toStr(assets)}`);

						//log.info(`assets.length:${toStr(assets.length)}`);
						progress.addItems(assets.length); // Found assets to process
						// Lets say 100 assets gets added, progress should be [4/115] 4/5 global 0/10 collections 0/100 assets

						//state.addToAssetsCount(assets.length);
						assets.forEach((asset) => {
							const innerFolderContent = getContentByKey({key: `/${path}`});
							const {
								x: {
									[X_APP_NAME]: {
										fotoWare: {
											shouldStop = false
										} = {}
									} = {}
								} = {}
							} = innerFolderContent;
							//log.info(`shouldStop:${toStr(shouldStop)}`);
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
							queue.push({
								assetHref,
								doctype,
								filename,
								filesize,
								metadata,
								renditionHref: renditions
									.filter(({original}) => original === true)[0].href
							});
							// Not finishing an asset item here
						}); // forEach asset
					} // fnHandleAssets
				}); // getAndPaginateAssetList
				progress.finishItem(`Finished processing collection ${collectionHref}`);//.report();
				// Progress should be [5/115] (4/5 global 1/10 collections 0/100 assets) Current Global: ProcessCollectionLists
				// Progress should be [14/115] (4/5 global 10/10 collections 0/100 assets) Current Global: ProcessCollectionLists
			}); // forEach collection
		} // function fnHandleCollections

		try {
			progress.finishItem(/*'apiDescriptor'*/).setInfo(`Getting collection lists`).report();
			// Progress should be [4/5] Getting collection lists

			getAndPaginateCollectionList({
				accessToken,
				hostname: url,
				shortAbsolutePath: archivesPath,
				fnHandleCollections
			});
			progress.finishItem(`Finished processing collections`);//.report();
			// Progress should be [15/115] (5/5 global 10/10 collections 0/100 assets) Current: Start processing assets

			const skipped = [/*
				assetHref,
				reason: '...'
			*/];
			while (queue.length) {
				const {
					assetHref,
					doctype,
					filename,
					filesize,
					metadata,
					renditionHref
				} = queue.shift();
				progress.setInfo(`Processing asset ${assetHref}`).report();
				// Progress should still be [15/115] (5/5 global 10/10 collections 0/100 assets)

				//state.addToAssetsSize(filesize);
				//state.incrementIncludedCount().addToIncludedSize(filesize);
				//state.incrementProcessedCount().addToProcessedSize(filesize);
				if (docTypes[doctype]) {
					const mediaName = sanitize(`${filename}.${filesize}`).replace(/\./g, '-'); // This should be unique most of the time
					const submitNamedParams = {
						name: 'downloadAndPersistRendition',
						//name: `${app.name}:downloadAndPersistRendition`,
						config: {
							hostname: url,
							path,
							accessToken,
							fields: JSON.stringify(fields),
							renditionServiceShortAbsolutePath: renditionRequest,
							assetHref,
							mediaName,
							metadata: JSON.stringify(metadata),
							renditionUrl: renditionHref
						}
					};
					//log.debug(`submitNamedParams:${toStr(submitNamedParams)}`);

					const taskId = submitNamed(submitNamedParams);
					//log.info(`taskId:${taskId}`);

					// WARNING isRunning can't be used here because it can temporarily become false when state is WAITING
					let taskState = getTask(taskId).state;
					while(['WAITING', 'RUNNING'].includes(taskState)) { // WAITING | RUNNING | FINISHED | FAILED
						sleep(250); // Check if task is FINISHED or FAILED every 250 ms.
						taskState = getTask(taskId).state;
					}

					const notRunningTask = getTask(taskId);
					if (notRunningTask.state !== 'FINISHED') {
						log.debug(`notRunningTask:${toStr(notRunningTask)}`);
					}
				} else {
					log.debug(`Skipping assetHref:${assetHref} doctype:${doctype} not included.`);
					skipped.push({
						assetHref,
						reason: `doctype:${doctype} not included`
					});
				}
				progress.finishItem(`Finished processing asset ${assetHref}`);//.report();
				// Progress should be [16/115] (5/5 global 10/10 collections 1/100 assets)
				// Progress should be [115/115] (5/5 global 10/10 collections 100/100 assets)
			} // while queue.length
			progress.setInfo(`Finished syncing site ${site}`).report();
			// Progress should still be [115/115] (5/5 global 10/10 collections 100/100 assets)
		} catch (e) {
			log.error(`Something went wrong during sync e:${toStr(e)}`);
			throw e; // Finally should run before this re-throw ends the task.
		} finally {
			/*log.debug(`Storing storedState:${toStr(storedState)}`);
			modifyContent({
				key: folderContent._id,
				editor: (node) => {
					node.x[X_APP_NAME].fotoWare.storedState = storedState; // NOTE Property name cannot contain .
					return node;
				},
				requireValid: false // Not under site so there is no x-data definitions
			});*/
		}

	}); // runInContext
} // export function run
