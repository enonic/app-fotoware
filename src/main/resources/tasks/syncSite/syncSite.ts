import type {
	Journal,
	Mappings,
	MediaContent,
	TaskNodeData,
	SiteConfigPropertyValue
} from '/lib/fotoware';
import type { Content } from '/lib/xp/portal';


import {toStr} from '@enonic/js-utils';
import is from '@sindresorhus/is';
import {getAccessToken} from '/lib/fotoware/api/getAccessToken';
import {getPrivateFullAPIDescriptor} from '/lib/fotoware/api/getPrivateFullAPIDescriptor';
import {query as doQuery} from '/lib/fotoware/api/query';
//import {getTaxonomies} from '/lib/fotoware/api/taxonomies/get';
//import {getTaxonomyField} from '/lib/fotoware/api/taxonomies/getField';
import {
	/*PROPERTY_ON_CREATE,
	PROPERTY_IF_CHANGED,
	PROPERTY_OVERWRITE,*/
	REPO_BRANCH,
	REPO_ID
} from '/lib/fotoware/xp/constants';
import {queryForFilename} from '/lib/fotoware/xp/queryForFilename';
import {
	create as createContent,
	get as getContentByKey
} from '/lib/xp/content';
import {run as runInContext} from '/lib/xp/context';
import {connect} from '/lib/xp/node';

import {handleExistingMedia} from './handleExistingMedia';
import {handleNewMedia} from './handleNewMedia';
import {Progress} from './Progress';


const CT_COLLECTION = `${app.name}:collection`;

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

export function run(params: {
	archiveName: string
	boolResume?: boolean
	clientId: string
	clientSecret: string
	importName: string
	json: string
	path: string
	project: string
	propertyArtist: SiteConfigPropertyValue
	propertyCopyright: SiteConfigPropertyValue
	propertyDescription: SiteConfigPropertyValue
	propertyDisplayName: SiteConfigPropertyValue
	propertyTags: SiteConfigPropertyValue
	query: string
	rendition: string
	site: string
	taskNodeId: string
	url: string
}) {
	//log.debug(`params:${toStr(params)}`);

	const {
		archiveName,
		boolResume = true,
		clientId,
		clientSecret,
		importName,
		json,
		path,
		project,
		propertyArtist,// = PROPERTY_IF_CHANGED,
		propertyCopyright,// = PROPERTY_OVERWRITE,
		propertyDescription,// = PROPERTY_IF_CHANGED,
		propertyDisplayName,// = PROPERTY_ON_CREATE,
		propertyTags,// = PROPERTY_IF_CHANGED,
		query,
		rendition,
		site,
		taskNodeId,
		url
	} = params;

	let obj: {
		metadata: {
			mappings: Mappings
		}
	};
	try {
		obj = JSON.parse(json);
	} catch(e) {
		log.error(`Failed to parse json:${json}`, e)
		throw new Error('Failed to parse json');
	}

	const {
		metadata: {
			mappings
		}
	} = obj;

	//log.debug(`propertyArtist:${propertyArtist}`);
	//log.debug(`propertyCopyright:${propertyCopyright}`);
	//log.debug(`propertyDescription:${propertyDescription}`);
	//log.debug(`propertyDisplayName:${propertyDisplayName}`);
	//log.debug(`propertyTags:${propertyTags}`);
	const properties = {
		artist: propertyArtist,
		copyright: propertyCopyright,
		description: propertyDescription,
		displayName: propertyDisplayName,
		tags: propertyTags
	};
	//log.debug(`properties:${toStr(properties)}`);

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

		const folderContent = getContentByKey<Content<Record<string,never>>>({key: folderPath});
		if (folderContent && folderContent.type !== CT_COLLECTION) {
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

		const journal: Journal = {
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
						const taskNode = suConnection.get<TaskNodeData>(taskNodeId);
						//log.debug(`taskNode:${toStr(taskNode)}`);
						if (!taskNode) {
							log.error(`Unable to find task node with id:${taskNodeId}`);
							throw new Error('Unable to find task node! See server log for node _id')
						}
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

					if (!filename) {
						throw new Error(`asset missing filename! asset:${toStr(asset)}`);
					}

					if (!metadata) {
						throw new Error(`asset missing metadata! asset:${toStr(asset)}`);
					}

					if (!renditions) {
						throw new Error(`asset missing renditions! asset:${toStr(asset)}`);
					}


					const currentAsset = `${url}${assetHref}`;
					journal.currentAsset = currentAsset;

					progress.setInfo(`Processing path:${path} asset:${currentAsset} `).report();
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
						const contentQueryResult = queryForFilename({
							filename,
							path
						});
						//log.debug(`contentQueryResult:${toStr(contentQueryResult)}`);

						let exisitingMediaContent: MediaContent | -1 | null | undefined;
						if (contentQueryResult.total === 0) {
							// Even though no media has been found tagged with filename, older versions of the integration might have synced the file already...
							exisitingMediaContent = getContentByKey<MediaContent>({key: `/${path}/${filename}`});
						} else if (contentQueryResult.total === 1) {
							exisitingMediaContent = contentQueryResult.hits[0];
						} else if (contentQueryResult.total > 1) {
							log.error(`Found more than one content with FotoWare filename:${filename} ids:${contentQueryResult.hits.map(({_id}) => _id).join(', ')}`);
							exisitingMediaContent = -1;
						}

						const renditionsObj: Record<string,string> = {};
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
						if (!renditionUrl) {
							log.error(`Unable to determine renditionUrl from rendition:${rendition} in renditionsObj${toStr(renditionsObj)}!`);
							throw new Error(`Unable to determine renditionUrl from rendition:${rendition}!`);
						}

						// 1. !exist (resume or not doesn't matter) download and create
						// 2. exist resume check metadata modify if changes
						// 3. exist !resume check binary size and md5, modify attachment if changed, same with metadata
						if (exisitingMediaContent === -1) {
							// no-op
						} else if (!exisitingMediaContent) {
							handleNewMedia({
								accessToken,
								currentAsset,
								filename,
								hostname: url,
								journal,
								mappings,
								metadata,
								path,
								properties,
								renditionRequest,
								renditionUrl
							});
						} else { // Media exist
							handleExistingMedia({
								accessToken,
								boolResume,
								currentAsset,
								exisitingMediaContent,
								filename,
								hostname: url,
								journal,
								mappings,
								metadata,
								project,
								properties,
								renditionRequest,
								renditionUrl
							});
						} // else exisitingMediaContent
					} // valid filename
					progress.finishItem(`Finished processing path:${path} asset:${assetHref}`);//.report();
				}); // forEach asset
			}); // collections.forEach
			//progress.finishItem(`Finished processing collections`);//.report();
			progress.setInfo(`Finished syncing site ${site} ${importName}`).report();
			journal.currentAsset = '';
		} catch (e: unknown) {
			//log.error('e', e);
			//log.error('e.message', e.message);
			//log.error('e.class.name', e.class.name);
			log.error('Something went wrong during sync', e);
			if (
				is.error(e)
			) {
				journal.errors.push(e.message);
			}
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
				suConnection.modify<TaskNodeData>({
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
