/*
In order for task progress to show total number of items to process as soon as possible,
at the cost of some memory, we could iterate all collectionLists and assetLists first.
But then no assets would start appearing before several minutes has passed :(
TODO ¿Can we do both at the same time?

We could have two namedTasks:
1. PopulateQueueTask (write to FolderContent once per assetList page) submitNamed?
2. ProcessQueueTask

Race condition.
Task1 writes state 1
Task2 reades state 1
Task1 writes state 2
Task2 writees modified state1, state2 LOST!
modifyContent can work on two different "objects" in side the same content.

content: {
	fullQueue, (written to from PopulateQ, read by ProcessQ)
	processedQueue (written to by ProcessQ)
}
When ProcessQ has nothing more to do, delete fullQueue and processedQueue?

Another Option would be to:
* Have no state shared between tasks.
* Have a namedTask for downloading a rendition. Which creates or modifies with new assetHrefs.
* While iterating collectionLists and assetLists, submit one downloadTask if none running.
* After iterating wait for downloadTask and submit until queue empty.

During a sync I should not encounter the same url twice or the FotoWeb API is broken.
But on second sync I should encounter mostly the same urls as in the first sync, and could skip them.
NOTE To skip an assetHref on second sync an array of assetHrefs is enough, BUT...
WARNING: A fileNameSize should only have a single md5sum or we have a collision!
NOTE: So we have to check for collisions.

This should be enough to check for collisions:
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

Lets assume storedState is lost for some reason, but loads of media has been synced before.
Given I have assetHref, filename and filesize
IF mediaPathExist
THEN
	DO generate md5 from attachmentStream and store
	OR get md5 from xdata
	WARNING Assuming md5sum of downloaded bodyStream is identical to md5sum of attachmentStream.
	Get assetHrefs from xdata
	Add assetHref if missing
	Update storedState with all data from exisitingMedia

Given I have assetHref, filename and filesize
IF assetHref in storedState
THEN
	Skip (don't even download)
ELSE
	Download Rendition
	Genereate MD5sum
	IF fileNameSize md5sum collision
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
//import {forceArray} from '/lib/util/data';
import {sanitize} from '/lib/xp/common';
import {
	create as createContent,
	createMedia,
	//getAttachmentStream,
	get as getContentByKey,
	modify as modifyContent
} from '/lib/xp/content';
import {run} from '/lib/xp/context';
import {readText} from '/lib/xp/io';
import {
	get as getTask,
	isRunning,
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
import {requestRendition} from '/lib/fotoware/api/requestRendition';

const X_APP_NAME = sanitize(app.name).replace(/\./g, '-');

function sinceMediaDoesNotExistCreateIt({
	assetHref,
	downloadRenditionResponse,
	fields,
	md5sum,
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
				log.info(`node:${toStr(node)}`);
				//log.info(`node.type:${toStr(node.type)}`);
				if (!node.x) {
					node.x = {}; // eslint-disable-line no-param-reassign
				}
				fotoWareXData = {
					fotoWare: {
						hrefs: assetHref, // NOTE Might be multiple
						metadata: metadataArray,
						md5sum
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

	/*const mediaPath = `/${path}/${mediaName}`;
	const md5sumOfAttachment = md5(readText(getAttachmentStream({
		key: mediaPath,
		name: mediaName
	})));
	if (md5sum !== md5sumOfAttachment) {
		log.error(`MD5SUM of download:${md5sum} and attachment:${md5sumOfAttachment} doesn't match!`);
		throw new Error(`MD5SUM of download:${md5sum} and attachment:${md5sumOfAttachment} doesn't match!`);
	} else {
		log.info(`YAY MD5SUM of download:${md5sum} and attachment:${md5sumOfAttachment} does match :)`);
	}*/
} // sinceMediaDoesNotExistCreateIt


export function syncSiteFlat(siteConfig) {
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
		log.debug(`Loaded storedState:${toStr(storedState)}`);

		function fnHandleCollections(collections) {
			collections = [collections[0]]; // DEBUG
			//log.info(`collections:${toStr(collections)}`);
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
					doPaginate: false, // DEBUG
					fnHandleAssets: (assets) => {
						assets = [assets[1]]; // DEBUG
						//log.info(`assets:${toStr(assets)}`);
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
							if (!docTypes[doctype]) {
								log.debug(`Skipping assetHref:${assetHref} doctype:${doctype} not included.`);
								return;
							}

							const mediaName = sanitize(`${filename}.${filesize}`).replace(/\./g, '-'); // This should be unique most of the time
							/*if (storedState[mediaName] && forceArray(storedState[mediaName].assetHrefs).includes(assetHref)) {
								log.info(`Skipping assetHref:${assetHref}, synced before`);
								return;
							}*/

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
							log.info(`taskId:${taskId}`);

							// WARNING These only works if task context!
							while(isRunning(taskId)) { // WAITING | RUNNING | FINISHED | FAILED
								sleep(100);
							}

							const notRunningTask = getTask(taskId);
							log.info(`notRunningTasxk:${toStr(notRunningTask)}`);

							throw new Error('DEBUG'); // DEBUG

							// TODO Get md5sum from exisiting media attachmentStream if has assetHref? Only required to resume if storedState is broken.
							const mediaPath = `/${path}/${mediaName}`;
							const exisitingMedia = getContentByKey({key: mediaPath});
							/*if (exisitingMedia) {
								// Check if assetHref matches
								let {
									x: {
										[X_APP_NAME]: {
											fotoWare: {
												hrefs: exisitingMediaHrefs,
												md5sum: exisitingMediaMd5sum
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
								if(exisitingMediaHrefs.includes(assetHref)) {
									if (!exisitingMediaMd5sum) {
										const attachmentStream = getAttachmentStream({
											key: mediaPath,
											name: mediaName
										});
										exisitingMediaMd5sum = md5(readText(attachmentStream));
										modifyContent({
											key: mediaPath,
											editor: (node) => {
												node.x[X_APP_NAME].fotoWare.md5sum = exisitingMediaMd5sum;
												return node;
											},
											requireValid: false // Not under site so there is no x-data definitions
										}); // modifyContent
									}
									// At this point assetHref is not it storedState
									// The mediaName might still be in storedState
									// If so you can check for collision
									if (storedState[mediaName]) {
										if (storedState[mediaName].md5sum !== exisitingMediaMd5sum) {
											log.error(`Hash collision for mediaName:${mediaName} storedState:${toStr(storedState[mediaName])} md5sum:${exisitingMediaMd5sum}!`);
											return;
										}
										if (!storedState[mediaName].assetHrefs) {storedState[mediaName].assetHrefs = [];}
										if (!Array.isArray(storedState[mediaName].assetHrefs)) {storedState[mediaName].assetHrefs = [storedState[mediaName].assetHrefs];}
										storedState[mediaName].assetHrefs.push(assetHref);
										return;
									} else {
										// If mediaName is not in storedState add it
										storedState[mediaName] = {
											assetHrefs: [assetHref],
											md5sum: exisitingMediaMd5sum
										}
										return;
									}
								} // exisitingMediaHrefs includes assetHref
							} // if exisitingMedia*/

							/*const {
								href: renditionHref/*,
								display_name: displayName,
								description,
								width,
								height,
								default: isDefault,
								original,
								sizeFixed,
								profile
							} = renditions
								.filter(({original}) => original === true)[0];*/

							const downloadRenditionResponse = requestRendition({
								accessToken,
								hostname: url,
								renditionServiceShortAbsolutePath: renditionRequest,
								renditionUrl: renditionHref
							});
							const md5sumOfDownload = md5(readText(downloadRenditionResponse.bodyStream));
							//log.info(`new mediaName:${mediaName} md5sumOfDownload:${md5sumOfDownload}`);

							if (storedState[mediaName] && md5sumOfDownload !== storedState[mediaName].md5sum) {
								log.error(`Hash collision for mediaName:${mediaName} storedState:${toStr(storedState[mediaName])} md5sumOfDownload:${md5sumOfDownload}!`);
								return;
							}

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
										md5sum: md5sumOfDownload,
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
								md5sum: md5sumOfDownload,
								mediaName,
								metadata,
								path
							});
							storedState[mediaName] = {
								md5sum: md5sumOfDownload,
								assetHrefs: [assetHref]
							};
							//log.info(`added mediaName:${mediaName} to storedState:${toStr(storedState)}`);
							//throw 'STOPPED ON PURPOSE AFTER CREATING SINGLE MEDIA'; // DEBUG
						}); // forEach asset
					} // fnHandleAssets
				}); // getAndPaginateAssetList
			}); // forEach collection
		} // function fnHandleCollections

		try {
			getAndPaginateCollectionList({
				accessToken,
				hostname: url,
				shortAbsolutePath: archivesPath,
				fnHandleCollections
			});
		} catch (e) {
			log.error(`Something went wrong during sync e:${toStr(e)}`);
			throw e; // Finally should run before this re-throw ends the task.
		} finally {
			log.debug(`Storing storedState:${toStr(storedState)}`);
			modifyContent({
				key: folderContent._id,
				editor: (node) => {
					node.x[X_APP_NAME].fotoWare.storedState = storedState; // NOTE Property name cannot contain .
					return node;
				},
				requireValid: false // Not under site so there is no x-data definitions
			});
		}
	}); // run in project
} // export function syncSiteFlat
