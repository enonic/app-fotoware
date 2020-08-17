import {toStr} from '/lib/util';
import {sanitize} from '/lib/xp/common';
import {
	create as createContent,
	createMedia,
	delete as deleteContent,
	get as getContentByKey,
	modify as modifyContent
} from '/lib/xp/content';
import {run as runInContext} from '/lib/xp/context';

import {getAccessToken} from '/lib/fotoware/api/getAccessToken';
import {getPrivateFullAPIDescriptor} from '/lib/fotoware/api/getPrivateFullAPIDescriptor';
import {query as doQuery} from '/lib/fotoware/api/query';
import {requestRendition} from '/lib/fotoware/api/requestRendition';
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
		//blacklistedCollectionsJson,
		clientId,
		clientSecret,
		path,
		project,
		query,
		//remoteAddressesJson,
		site,
		url//,
		//whitelistedCollectionsJson
	} = params;

	if(!site) { throw new Error(`Required param site missing! params:${toStr(params)}`); }

	const progress = new Progress({
		info: `Initializing Sync FotoWare site ${site}`,
		total: 5 // Init, CreateFolder, getAccessToken, apiDescriptor, gettingCollectionList
	}).report();
	// Progress should be [0/5] Initializing Sync FotoWare site collicare

	//const state = new StateClass();

	/*if(!blacklistedCollectionsJson) { throw new Error(`Required param blacklistedCollectionsJson missing! params:${toStr(params)}`); }
	let blacklistedCollections;
	try {
		blacklistedCollections = JSON.parse(blacklistedCollectionsJson)
	} catch (e) {
		throw new Error(`Something went wrong when trying to parse blacklistedCollectionsJson:${toStr(params)}`);
	}*/
	/*if(!whitelistedCollectionsJson) { throw new Error(`Required param whitelistedCollectionsJson missing! params:${toStr(params)}`); }
	let whitelistedCollections;
	try {
		whitelistedCollections = JSON.parse(whitelistedCollectionsJson)
	} catch (e) {
		throw new Error(`Something went wrong when trying to parse blacklistedCollectionsJson:${toStr(params)}`);
	}*/

	if(!clientId) { throw new Error(`Required param clientId missing! params:${toStr(params)}`); }
	if(!clientSecret) { throw new Error(`Required param clientSecret missing! params:${toStr(params)}`); }
	if(!path) { throw new Error(`Required param path missing! params:${toStr(params)}`); }
	if(!project) { throw new Error(`Required param project missing! params:${toStr(params)}`); }
	//if(!remoteAddressesJson) { throw new Error(`Required param remoteAddressesJson missing! params:${toStr(params)}`); }
	if(!url) { throw new Error(`Required param url missing! params:${toStr(params)}`); }

	/*let remoteAddresses;
	try {
		remoteAddresses = JSON.parse(remoteAddressesJson)
	} catch (e) {
		throw new Error(`Something went wrong when trying to parse remoteAddressesJson:${toStr(params)}`);
	}
	//log.debug(`remoteAddresses:${toStr(remoteAddresses)}`);*/

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

		try {
			collections.forEach(({assets}) => {
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
					//log.debug(`shouldStop:${toStr(shouldStop)}`);
					if (shouldStop) {
						throw new Error(`shouldStop:true`);
					}
					//log.debug(`asset:${toStr(asset)}`);
					const {
						filename,
						//filesize,
						href: assetHref,
						metadataObj,
						renditionHref
					} = asset;

					progress.setInfo(`Processing asset ${assetHref}`).report();
					//state.addToAssetsSize(filesize);
					//state.incrementIncludedCount().addToIncludedSize(filesize);
					//state.incrementProcessedCount().addToProcessedSize(filesize);
					if (filename.startsWith('.')) {
						log.warning(`Skipping filename:${filename} because it starts with a dot, so probabbly a hidden file.`);
					} else if (filename.split('.').length < 2) {
						log.warning(`Skipping filename:${filename} because it has no extention.`);
					} else {
						const mediaName = filename; // Can't use sanitize "1 (2).jpg" collision "1-2.jpg"
						const mediaPath = `/${path}/${mediaName}`;
						const exisitingMedia = getContentByKey({key: mediaPath});
						/*if (exisitingMedia) { // Only useful on first sync
							log.warning(`mediaPath:${mediaPath} already exist, collision?`);
						}*/
						if (!exisitingMedia) {
							const downloadRenditionResponse = requestRendition({
								accessToken,
								hostname: url,
								renditionServiceShortAbsolutePath: renditionRequest,
								renditionUrl: renditionHref
							});
							if (!downloadRenditionResponse) {
								throw new Error(`Something went wrong when downloading rendition for renditionHref:${renditionHref}!`);
							}
							const createMediaResult = createMedia({
								parentPath: `/${path}`,
								name: mediaName,
								data: downloadRenditionResponse.bodyStream
							});
							if (!createMediaResult) {
								const mediaPath = `/${path}/${mediaName}`;
								const errMsg = `Something went wrong when creating mediaPath:${mediaPath}!`;
								log.error(errMsg);
								throw new Error(errMsg);
							}
							try {
								modifyContent({
									key: createMediaResult._id,
									editor: (content) => {
										//log.debug(`content:${toStr(content)}`);
										content.x[X_APP_NAME] = {
											fotoWare: {
												metadata: metadataObj
											}
										}; // eslint-disable-line no-param-reassign
										//log.debug(`modified content:${toStr(content)}`);
										return content;
									}, // editor
									requireValid: false // May contain extra undefined x-data
								}); // modifyContent
							} catch (e) {
								if (e.class.name === 'com.enonic.xp.data.ValueTypeException') {
									// Known problem on psd, svg, ai, jpf, pdf
									log.error(`Unable to modify ${createMediaResult._name}`);
									deleteContent({ // So it will be retried on next sync
										key: createMediaResult._id
									});
								} else {
									log.error(`Something unkown went wrong when trying to modifyContent createMediaResult:${toStr(createMediaResult)}`);
									log.error(`metadataObj:${toStr(metadataObj)}`);
									log.error(e); // com.enonic.xp.data.ValueTypeException: Value of type [com.enonic.xp.data.PropertySet] cannot be converted to [Reference]
									//log.error(e.class.name); // com.enonic.xp.data.ValueTypeException
									//log.error(e.message); // Value of type [com.enonic.xp.data.PropertySet] cannot be converted to [Reference]
									deleteContent({ // So it will be retried on next sync
										key: createMediaResult._id
									});
									throw(e); // NOTE Only known way to get stacktrace
								}
							}
						} // if !exisitingMedia
					} // valid filename
					progress.finishItem(`Finished processing asset ${assetHref}`);//.report();
				}); // forEach asset
			}); // collections.forEach
			//progress.finishItem(`Finished processing collections`);//.report();
			progress.setInfo(`Finished syncing site ${site}`).report();
		} catch (e) {
			log.error(`Something went wrong during sync e:${toStr(e)}`);
			throw e; // Finally should run before this re-throw ends the task.
		}
	}); // runInContext
} // export function run
