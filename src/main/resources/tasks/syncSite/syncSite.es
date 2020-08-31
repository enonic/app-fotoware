import {diff} from 'deep-object-diff';
import deepEqual from 'fast-deep-equal';
import {getAccessToken} from '/lib/fotoware/api/getAccessToken';
import {getPrivateFullAPIDescriptor} from '/lib/fotoware/api/getPrivateFullAPIDescriptor';
import {query as doQuery} from '/lib/fotoware/api/query';
import {requestRendition} from '/lib/fotoware/api/requestRendition';
import {
	REPO_BRANCH,
	REPO_ID
} from '/lib/fotoware/xp/constants';
import {modifyMediaContent} from '/lib/fotoware/xp/modifyMediaContent';
import {addMetadataToContent} from '/lib/fotoware/xp/addMetadataToContent';
import {isPublished} from '/lib/fotoware/xp/isPublished';
import {md5} from '/lib/text-encoding';
import {toStr} from '/lib/util';
import {sanitize} from '/lib/xp/common';
import {
	addAttachment,
	create as createContent,
	createMedia,
	get as getContentByKey,
	getAttachmentStream,
	publish,
	removeAttachment
} from '/lib/xp/content';
import {run as runInContext} from '/lib/xp/context';
import {readText} from '/lib/xp/io';
import {connect} from '/lib/xp/node';

import {Progress} from './Progress';

const CT_COLLECTION = `${app.name}:collection`;
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

		const res = doQuery({
			accessToken,
			blacklistedCollections: {}, // NOTE Intentional hardcode
			hostname: url,
			q: query,
			searchURL,
			whitelistedCollections: { // NOTE Intentional hardcode
				'5000-Archive': true
			}
		});

		progress.finishItem(/*'Finished querying for assets'*/)//.report();

		const {
			assetCountTotal,
			collections
		} = res;

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
			collections.forEach(({assets}) => {
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
							//log.debug(`renditions:${toStr(renditions)}`);
							let downloadRenditionResponse;
							try {
								downloadRenditionResponse = requestRendition({
									accessToken,
									hostname: url,
									renditionServiceShortAbsolutePath: renditionRequest,
									renditionUrl
								});
							} catch (e) {
								// Errors are already logged, simply skip and continue
							}

							if (downloadRenditionResponse) {
								const createMediaResult = createMedia({
									parentPath: `/${path}`,
									name: mediaName,
									data: downloadRenditionResponse.bodyStream
								});
								if (!createMediaResult) {
									const mediaPath = `/${path}/${mediaName}`;
									journal.errors.push(currentAsset);
									const errMsg = `Something went wrong when creating mediaPath:${mediaPath}!`;
									log.error(errMsg);
									throw new Error(errMsg);
								}
								journal.created.push(currentAsset);
								const md5sum = md5(readText(downloadRenditionResponse.bodyStream));
								modifyMediaContent({
									exisitingMediaContent,
									key: createMediaResult._id,
									md5sum,
									mediaPath,
									metadata
								});
							} // if downloadRenditionResponse
						} else { // Media exist
							const {
								x: {
									[X_APP_NAME]: {
										'fotoWare': {
											'md5sum': md5sumFromXdata
										} = {}
									} = {}
								} = {}
							} = exisitingMediaContent;
							//log.debug(`mediaPath:${mediaPath} md5sumFromXdata:${md5sumFromXdata}`);

							const md5sumOfExisitingMediaContent = md5sumFromXdata || md5(readText(getAttachmentStream({
								key: mediaPath,
								name: mediaName
							})));
							//log.debug(`mediaPath:${mediaPath} md5sumOfExisitingMediaContent:${md5sumOfExisitingMediaContent}`);
							let md5sumToStore = md5sumOfExisitingMediaContent;
							//log.debug(`mediaPath:${mediaPath} md5sumToStore:${md5sumToStore}`);

							if (!boolResume) {
								let downloadRenditionResponse;
								try {
									downloadRenditionResponse = requestRendition({
										accessToken,
										hostname: url,
										renditionServiceShortAbsolutePath: renditionRequest,
										renditionUrl
									});
								} catch (e) {
									// Errors are already logged, simply skip and continue
								}
								if (downloadRenditionResponse) {
									const md5sumOfDownload = md5(readText(downloadRenditionResponse.bodyStream));
									if (md5sumOfDownload !== md5sumOfExisitingMediaContent) {
										log.debug(`mediaPath:${mediaPath} md5sumOfDownload:${md5sumOfDownload} !== md5sumOfExisitingMediaContent:${md5sumOfExisitingMediaContent} :(`);
										// TODO Modify attachment
										try {
											addAttachment({
												key: mediaPath,
												name: mediaName,
												data: downloadRenditionResponse.bodyStream
											});
										} catch (e) {
											// Just to see what happens if you try to add an attachment that already exists
											log.error(e);
											log.error(e.class.name);
											log.error(e.message);
											removeAttachment({
												key: mediaPath,
												name: mediaName
											});
											// NOTE re-add old attachment with old name? nah, that information is in versions
											addAttachment({
												key: mediaPath,
												name: mediaName,
												data: downloadRenditionResponse.bodyStream
											});
										}
										journal.modified.push(currentAsset);
									} else {
										log.debug(`mediaPath:${mediaPath} md5sumOfDownload:${md5sumOfDownload} === md5sumOfExisitingMediaContent:${md5sumOfExisitingMediaContent} :)`);
									}
									md5sumToStore = md5sumOfDownload;
								}
							} // if !boolResume

							// NOTE Could generate md5sum from possibly modified attachment here.

							const maybeModifiedMediaContent = addMetadataToContent({
								md5sum: md5sumToStore,
								metadata,
								content: JSON.parse(JSON.stringify(exisitingMediaContent))
							});

							if (!deepEqual(exisitingMediaContent, maybeModifiedMediaContent)) {
								const differences = diff(exisitingMediaContent, maybeModifiedMediaContent);
								log.debug(`mediaPath:${mediaPath} differences:${toStr(differences)}`);
								modifyMediaContent({
									exisitingMediaContent,
									key: mediaPath,
									md5sum: md5sumToStore,
									mediaPath,
									metadata
								});
								journal.modifiedMetadata.push(currentAsset);
							} else {
								//log.debug(`mediaPath:${mediaPath} no differences :)`);
								journal.unchanged.push(currentAsset);
							}
							if (isPublished({
								key: mediaPath,
								project
							})) {
								const publishParams = {
									includeDependencies: false,
									keys:[mediaPath],
									sourceBranch: 'draft',
									targetBranch: 'master'
								};
								//log.debug(`mediaPath:${mediaPath} publishParams:${toStr(publishParams)}`);
								const publishRes = publish(publishParams);
								log.debug(`mediaPath:${mediaPath} publishRes:${toStr(publishRes)}`);
							}
						} // else exisitingMediaContent
					} // valid filename
					progress.finishItem(`Finished processing asset ${assetHref}`);//.report();
				}); // forEach asset
			}); // collections.forEach
			//progress.finishItem(`Finished processing collections`);//.report();
			progress.setInfo(`Finished syncing site ${site} ${importName}`).report();
			journal.currentAsset = '';
		} catch (e) {
			log.error(`Something went wrong during sync e:${toStr(e)}`);
			journal.error = {
				className: e.class.name,
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
