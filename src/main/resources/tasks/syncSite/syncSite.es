//import {diff} from 'deep-object-diff';

//import deepEqual from 'fast-deep-equal';

//import {assetUpdate} from '/lib/fotoware/api/asset/update';
import {getAccessToken} from '/lib/fotoware/api/getAccessToken';
import {getPrivateFullAPIDescriptor} from '/lib/fotoware/api/getPrivateFullAPIDescriptor';
import {query as doQuery} from '/lib/fotoware/api/query';
//import {getTaxonomies} from '/lib/fotoware/api/taxonomies/get';
//import {getTaxonomyField} from '/lib/fotoware/api/taxonomies/getField';
//import {requestRendition} from '/lib/fotoware/api/requestRendition';
import {
	REPO_BRANCH,
	REPO_ID
} from '/lib/fotoware/xp/constants';
//import {modifyMediaContent} from '/lib/fotoware/xp/modifyMediaContent';
//import {addMetadataToContent} from '/lib/fotoware/xp/addMetadataToContent';
//import {isPublished} from '/lib/fotoware/xp/isPublished';
//import {md5} from '/lib/text-encoding';
import {toStr} from '/lib/util';
//import {sanitize} from '/lib/xp/common';
import {
	//addAttachment,
	create as createContent,
	//createMedia,
	get as getContentByKey//,
	//getAttachmentStream,
	//publish,
	//removeAttachment
} from '/lib/xp/content';
import {run as runInContext} from '/lib/xp/context';
//import {readText} from '/lib/xp/io';
import {connect} from '/lib/xp/node';

import {handleExistingMedia} from './handleExistingMedia';
import {handleNewMedia} from './handleNewMedia';
import {Progress} from './Progress';

const CT_COLLECTION = `${app.name}:collection`;
//const X_APP_NAME = sanitize(app.name).replace(/\./g, '-');

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
		archiveName,
		boolResume = true,
		clientId,
		clientSecret,
		importName,
		path,
		project,
		query,
		rendition,
		site,
		taskNodeId,
		url
	} = params;

	if(!site) { throw new Error(`Required param site missing! params:${toStr(params)}`); }

	const progress = new Progress({
		info: `Initializing Sync FotoWare site ${site} ${importName}`,
		total: 5 // Init, CreateFolder, getAccessToken, apiDescriptor, gettingCollectionList
	}).report();
	// Progress should be [0/5] Initializing Sync FotoWare site collicare

	//const state = new StateClass();

	if(!archiveName) { throw new Error(`Required param archiveName missing! params:${toStr(params)}`); }
	if(!clientId) { throw new Error(`Required param clientId missing! params:${toStr(params)}`); }
	if(!clientSecret) { throw new Error(`Required param clientSecret missing! params:${toStr(params)}`); }
	if(!path) { throw new Error(`Required param path missing! params:${toStr(params)}`); }
	if(!project) { throw new Error(`Required param project missing! params:${toStr(params)}`); }
	if(!rendition) { throw new Error(`Required param rendition missing! params:${toStr(params)}`); }
	if(!site) { throw new Error(`Required param site missing! params:${toStr(params)}`); }
	if(!taskNodeId) { throw new Error(`Required param taskNodeId missing! params:${toStr(params)}`); }
	//if(!remoteAddressesJson) { throw new Error(`Required param remoteAddressesJson missing! params:${toStr(params)}`); }
	if(!url) { throw new Error(`Required param url missing! params:${toStr(params)}`); }

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
		if (folderContent && !folderContent.type === CT_COLLECTION) {
			throw new Error(`Content path:${path} not a ${CT_COLLECTION}!`);
		}
		if (!folderContent) {
			createContent({
				parentPath: '/',
				name: path,
				displayName: path,
				contentType: CT_COLLECTION,
				data: {}
			});
		} // !folderContent

		progress.finishItem(/*'Creating folder'*/).setInfo('Getting accessToken').report();
		// Progress should be [2/5] Getting accessToken

		const {accessToken} = getAccessToken({
			hostname: url,
			clientId,
			clientSecret
		});


		//──────────────────────────────────────────────────────────────────────
		// Testing taxonomies
		//──────────────────────────────────────────────────────────────────────
		/*const taxonomies = getTaxonomies({
			accessToken,
			hostname: url
		});
		log.debug(`taxonomies:${toStr(taxonomies)}`);

		taxonomies.forEach(({field: fieldId}) => {
			const taxonomyField = getTaxonomyField({
				accessToken,
				fieldId,
				hostname: url
			});
			log.debug(`taxonomyField:${toStr(taxonomyField)}`);
		});*/
		//──────────────────────────────────────────────────────────────────────


		progress.finishItem(/*'Getting accessToken'*/).setInfo('Getting API Descriptor').report();
		// Progress should be [3/5] Getting API Descriptor

		const {
			//archivesPath,
			searchURL,
			renditionRequest
		} = getPrivateFullAPIDescriptor({
			accessToken,
			hostname: url
		});

		progress.finishItem(/*'apiDescriptor'*/).setInfo(`Querying for assets`).report();

		const queryRes = doQuery({
			accessToken,
			blacklistedCollections: {}, // NOTE Intentional hardcode
			hostname: url,
			q: query,
			searchURL,
			whitelistedCollections: { // NOTE Intentional hardcode
				[archiveName]: true
			}
		});
		//log.debug(`queryRes:${toStr(queryRes)}`);

		progress.finishItem(/*'Finished querying for assets'*/)//.report();

		const {
			assetCountTotal,
			collections
		} = queryRes;
		//log.debug(`collections:${toStr(collections)}`);

		progress.addItems(assetCountTotal); // Found assets to process

		const journal = {
			currentAsset: '',
			errors: [],
			skipped: [],
			created: [],
			modified: [],
			modifiedMetadata: [],
			unchanged: []
		};

		try {
			collections.forEach(({
				//assetCount,
				assets//,
				//collectionId,
				//...rest
			}) => {
				//log.debug(`rest:${toStr(rest)}`);
				//assets = [assets[0]]; // DEBUG
				assets.forEach((asset) => {
					runInContext({
						repository: REPO_ID,
						branch: REPO_BRANCH,
						user: {
							login: 'su',
							idProvider: 'system'
						},
						principals: ['role:system.admin']
					}, () => {
						const suConnection = connect({
							repoId: REPO_ID,
							branch: REPO_BRANCH
						});
						const taskNode = suConnection.get(taskNodeId);
						//log.debug(`taskNode:${toStr(taskNode)}`);
						const {
							data: {
								shouldStop
							}
						} = taskNode;
						//log.debug(`shouldStop:${toStr(shouldStop)}`);
						if (shouldStop) {
							throw new Error(`shouldStop:true`);
						}
					}); // runInFotoWareRepoContext
					//log.debug(`asset:${toStr(asset)}`);
					const {
						filename,
						//filesize,
						href: assetHref,
						metadata,
						//metadataObj,
						renditions
						//renditionHref
					} = asset;
					//log.debug(`metadata:${toStr(metadata)}`);
					//log.debug(`metadataObj:${toStr(metadataObj)}`); // Undefined on Enonic Test Server

					const currentAsset = `${url}${assetHref}`;
					journal.currentAsset = currentAsset;

					progress.setInfo(`Processing asset ${currentAsset}`).report();
					//state.addToAssetsSize(filesize);
					//state.incrementIncludedCount().addToIncludedSize(filesize);
					//state.incrementProcessedCount().addToProcessedSize(filesize);
					if (filename.startsWith('.')) {
						log.warning(`Skipping filename:${filename} because it starts with a dot, so probabbly a hidden file.`);
						journal.skipped.push(currentAsset);
					} else if (filename.split('.').length < 2) {
						log.warning(`Skipping filename:${filename} because it has no extention.`);
						journal.skipped.push(currentAsset);
					} else {
						const mediaName = filename; // Can't use sanitize "1 (2).jpg" collision "1-2.jpg"
						const mediaPath = `/${path}/${mediaName}`;
						const exisitingMediaContent = getContentByKey({key: mediaPath});

						const renditionsObj = {};
						renditions.forEach(({
							//default,
							//description,
							display_name,
							//height,
							href//,
							//original,
							//profile,
							//sizeFixed,
							//width
						}) => {
							//log.debug(`display_name:${display_name} href:${href} height:${height} width:${width}`);
							renditionsObj[display_name] = href;
						});
						//log.debug(`renditionsObj:${toStr(renditionsObj)}`);

						const renditionUrl = renditionsObj[rendition] || renditionsObj['Original File'];

						// 1. !exist (resume or not doesn't matter) download and create
						// 2. exist resume check metadata modify if changes
						// 3. exist !resume check binary size and md5, modify attachment if changed, same with metadata

						if (!exisitingMediaContent) {
							handleNewMedia({
								accessToken,
								currentAsset,
								journal,
								hostname: url,
								mediaName,
								mediaPath,
								metadata,
								path,
								renditionRequest,
								renditionUrl
							});
						} else { // Media exist
							handleExistingMedia({
								accessToken,
								boolResume,
								currentAsset,
								exisitingMediaContent,
								hostname: url,
								journal,
								mediaName,
								mediaPath,
								metadata,
								project,
								renditionRequest,
								renditionUrl
							});
						} // else exisitingMediaContent
					} // valid filename
					progress.finishItem(`Finished processing asset ${assetHref}`);//.report();
				}); // forEach asset
			}); // collections.forEach
			//progress.finishItem(`Finished processing collections`);//.report();
			progress.setInfo(`Finished syncing site ${site} ${importName}`).report();
			journal.currentAsset = '';
		} catch (e) {
			//log.error('e', e);
			//log.error('e.message', e.message);
			//log.error('e.class.name', e.class.name);
			log.error(`Something went wrong during sync`, e);
			journal.error = {
				//className: e.class.name,
				message: e.message
			};
			throw e; // Finally should run before this re-throw ends the task.
		} finally {
			runInContext({
				repository: REPO_ID,
				branch: REPO_BRANCH,
				user: {
					login: 'su',
					idProvider: 'system'
				},
				principals: ['role:system.admin']
			}, () => {
				const suConnection = connect({
					repoId: REPO_ID,
					branch: REPO_BRANCH
				});
				//const modifyTaskNodeRes =
				suConnection.modify({
					key: taskNodeId,
					editor: (node) => {
						//log.debug(`journal:${toStr(journal)}`);
						node.data.journal = journal;
						node.data.shouldStop = true;
						return node;
					}
				});
				//log.debug(`modifyTaskNodeRes:${modifyTaskNodeRes}`);
			}); // runInFotoWareRepoContext
		} // finally
	}); // runInContext
} // export function run
