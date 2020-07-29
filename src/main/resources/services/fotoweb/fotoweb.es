import humanFileSize from 'filesize';

import {toStr} from '/lib/util';
import {sanitize} from '/lib/xp/common';
import {
	createMedia,
	exists,
	publish
} from '/lib/xp/content';
import {run} from '/lib/xp/context';
import {
	progress,
	submit
} from '/lib/xp/task';

import {getAccessToken} from '../../lib/fotoweb/getAccessToken';
import {getPrivateFullAPIDescriptor} from '../../lib/fotoweb/getPrivateFullAPIDescriptor';
import {getPublicAPIDescriptor} from '../../lib/fotoweb/getPublicAPIDescriptor';
import {requestRendition} from '../../lib/fotoweb/requestRendition';

import {getAndPaginateAssetList} from '../../lib/fotoweb/assetList/getAndPaginate';

import {getCollection} from '../../lib/fotoweb/collection/get';

import {getAndPaginateCollectionList} from '../../lib/fotoweb/collectionList/getAndPaginate';
import {paginateCollectionList} from '../../lib/fotoweb/collectionList/paginate';

import {getConfigFromSite} from '../../lib/fotoweb/xp/getConfigFromSite';
import {createOrModifyCollection} from '../../lib/fotoweb/xp/createOrModifyCollection';
import {sanitizePath} from '../../lib/fotoweb/xp/sanitizePath';

/*
Archive┐ (Public/Private)
       └CollectionList┐
                      └Collection┐
                                 ├AssetList┐
                                 │         └Asset
						         └CollectionList...

The array of collections in the CollectionList doesn't include information about subcollections.
Thus it's required to fetch more information about each Collection individually.
*/

export const get = ({
	params: {
		repository,
		siteId
	}
}) => {
	if (!repository) {
		return {
			body: {
				error: 'Missing required parameter repository!'
			},
			contentType: 'application/json;charset=utf-8',
			status: 400
		};
	}
	if (!siteId) {
		return {
			body: {
				error: 'Missing required parameter siteId!'
			},
			contentType: 'application/json;charset=utf-8',
			status: 400
		};
	}
	const {
		selected,
		publicFolderPath,
		clientId,
		clientSecret,
		privateFolderPath,
		hostname,
		selectedDocTypes,
		selectedExtensions
	} = getConfigFromSite({
		repository,
		siteId
	});
	//log.info(`selected:${toStr(selected)}`);
	//log.info(`publicFolderPath:${toStr(publicFolderPath)}`); // contentId
	//log.info(`clientId:${toStr(clientId)}`);
	//log.info(`clientSecret:${toStr(clientSecret)}`);
	//log.info(`privateFolderPath:${toStr(privateFolderPath)}`); // contentId
	log.info(`hostname:${toStr(hostname)}`);
	const boolSyncPublic = !!(selected.includes('public') && publicFolderPath);
	const boolSyncPrivate = !!(selected.includes('private') && clientId && clientSecret && privateFolderPath);
	if (!(hostname && (boolSyncPublic || boolSyncPrivate))) {
		return {
			status: 500,
			body: {
				repository,
				siteId,
				message: 'FotoWeb Intergration Site Configuration not completed!'
			},
			contentType: 'application/json;charset=utf-8'
		};
	}
	submit({
		description: '',
		task: () => {
			//const foundDocTypes = [];
			//const foundDocTypesAndExtentions = {};
			//const foundExtentions = [];
			const stateObj = {
				allFilesCount: 0,
				includedFilesCount: 0,
				syncedThisTimeFilesCount: 0,
				allFilesSize: 0,
				includedFilesSize: 0,
				syncedThisTimeFilesSize: 0
			};
			const progressObj = {
				current: 0, // No items has been processed yet
				info: 'Initializing FotoWeb Intergration Task',
				total: 1 // So it looks like there is something to do.
			};
			progress(progressObj);
			progressObj.current += 1; // Finished initializing
			run({
				repository,
				branch: 'draft', // Always sync to draft and publish to master
				user: {
					login: 'su',
					idProvider: 'system'
				},
				principals: ['role:system.admin']
			}, () => {
				if (boolSyncPublic) {
					const {
						archivesPath,
						renditionRequest
					} = getPublicAPIDescriptor({hostname});
					//log.info(`archivesPath:${toStr(archivesPath)}`);
					//log.info(`renditionRequest:${toStr(renditionRequest)}`);

					const fnHandlePublicCollections = (publicCollections) => {
						//log.info(`publicCollections:${toStr(publicCollections)}`);
						progressObj.total += publicCollections.length; // Found public collections to process

						publicCollections.forEach((aPublicCollection/*, i*/) => {
							//log.info(`aPublicCollection:${toStr(aPublicCollection)}`);
							const {
								name: collectionName,
								href: collectionHref
							} = aPublicCollection;
							//log.info(`collectionName:${toStr(collectionName)}`);
							//log.info(`collectionHref:${toStr(collectionHref)}`);
							progressObj.info = `Syncing public collection ${collectionName}`;
							progress(progressObj);

							const collectionContentPath = sanitizePath(decodeURIComponent(collectionHref).replace('/fotoweb/archives', publicFolderPath).replace(/\/$/, ''));
							//log.info(`collectionContentPath:${toStr(collectionContentPath)}`);
							const collectionContentParentPath = collectionContentPath.replace(/\/[^/]+$/, '');
							//log.info(`collectionContentParentPath:${toStr(collectionContentParentPath)}`);
							const collectionContentName = sanitize(collectionContentPath.replace(/^.*\//, ''));
							//log.info(`collectionContentName:${toStr(collectionContentName)}`);
							//const {createdOrModifiedCollectionContent} =
							createOrModifyCollection({
								parentPath: collectionContentParentPath,
								name: collectionContentName,
								displayName: collectionName
							});
							//log.info(`createdOrModifiedCollectionContent:${toStr(createdOrModifiedCollectionContent)}`);

							const {
								childCount,
								children // collection list (object)
							} = getCollection({
								hostname,
								shortAbsolutePath: collectionHref
							});
							if (childCount) {
								//log.info(`childCount:${toStr(childCount)}`);
								//log.info(`children:${toStr(children)}`);
								paginateCollectionList({
									hostname,
									collectionList: {
										collections: children.data,
										paging: children.paging
									},
									//parentCollectionPath: collectionContentPath,
									fnHandleCollections: fnHandlePublicCollections // NOTE selfreference
								});
							} // childCount

							getAndPaginateAssetList({
								hostname,
								shortAbsolutePath: aPublicCollection.href,
								doPaginate: false, // DEBUG
								fnHandleAssets: (assets) => {
									progressObj.total += assets.length; // Found public assets to process
									stateObj.allFilesCount += assets.length;
									assets.forEach((asset) => {
										//log.info(`asset:${toStr(asset)}`);
										const {
											/*attributes: {
												imageattributes: {
													pixelwidth, // 1191
													pixelheight, // 1684
													resolution , // 72
													flipmirror, // 0
													rotation, // 0
													colorspace // 'rgb'
												},
												photoAttributes: {
													flash: {
														fired, // false
													}
												}
											},*/
											doctype, // graphic image
											filename,
											filesize,
											//metadata,
											//props,
											renditions
										} = asset;

										stateObj.allFilesSize += filesize;

										/*const extention = filename.replace(/[^.]+\./, '');
										if (!foundDocTypes.includes(doctype)) {
											foundDocTypes.push(doctype);
											log.info(`Found new doctype:${doctype} foundDocTypes:${toStr(foundDocTypes)}`);
										}
										if (!foundExtentions.includes(extention)) {
											foundExtentions.push(extention);
											log.info(`Found new extention:${extention} foundExtentions:${toStr(foundExtentions)}`);
										}
										if (!foundDocTypesAndExtentions[doctype]) {
											foundDocTypesAndExtentions[doctype] = [];
										}
										if (!foundDocTypesAndExtentions[doctype].includes(extention)) {
											foundDocTypesAndExtentions[doctype].push(extention);
											log.info(`Found new extention:${extention} in doctype:${doctype} foundDocTypesAndExtentions:${toStr(foundDocTypesAndExtentions)}`);
										}*/

										const extention = filename.replace(/.+\./, '').toLowerCase();
										if (selectedDocTypes.includes(doctype) && selectedExtensions.includes(extention)) {
											stateObj.includedFilesCount += 1;
											stateObj.includedFilesSize += filesize;
											progressObj.info = `Syncing asset ${filename} in collection ${collectionName}`;
											progress(progressObj);
											const existsKey = `${collectionContentPath}/${filename}`;
											//log.info(`existsKey:${toStr(existsKey)}`);
											if (exists({key: existsKey})) {
												log.info(`Skipping ${existsKey}, already exists.`);
											} else {
												stateObj.syncedThisTimeFilesCount += 1;
												stateObj.syncedThisTimeFilesSize += filesize;
												//log.info(`imageattributes:${toStr(imageattributes)}`);
												//log.info(`photoAttributes:${toStr(photoAttributes)}`);
												//log.info(`metadata:${toStr(metadata)}`);
												//log.info(`props:${toStr(props)}`);
												//log.info(`renditions:${toStr(renditions)}`);
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
													//.filter(({display_name: displayName}) => displayName === 'Original File')[0];
													//.filter(({default: isDefault}) => isDefault === true)[0];
													//.sort((a, b) => a.size - b.size)[0]; // Smallest images
													//.sort((a, b) => b.size - a.size)[0]; // Largest images
													//.filter(({display_name: displayName}) => displayName === 'JPG CMYK')[0];
													//.filter(({display_name: displayName}) => displayName === 'JPG sRGB')[0];
													//.filter(({display_name: displayName}) => displayName === 'TIFF JPG CMYK')[0]; // size = 0 ???

												const downloadRenditionResponse = requestRendition({
													//cookies,
													hostname,
													renditionServiceShortAbsolutePath: renditionRequest,
													renditionUrl: renditionHref
												});
												//log.info(`downloadRenditionResponse:${toStr(downloadRenditionResponse)}`);
												//log.info(`parentPath:${toStr(parentPath)}`);
												const createMediaResult = createMedia({
													name: filename,
													parentPath: collectionContentPath,
													//mimeType: downloadRenditionResponse.contentType,
													data: downloadRenditionResponse.bodyStream
												});
												//log.info(`createMediaResult:${toStr(createMediaResult)}`);
												//const publishResult =
												publish({
													keys: [createMediaResult._id],
													sourceBranch: 'draft',
													targetBranch: 'master',
													includeDependencies: false // default is true
												});
												//log.info(`publishResult:${toStr(publishResult)}`);
												log.info(`state:${toStr({
													allFilesCount: stateObj.allFilesCount,
													includedFilesCount: stateObj.includedFilesCount,
													excludedFilesCount: stateObj.allFilesCount - stateObj.includedFilesCount,
													syncedThisTimeFilesCount: stateObj.syncedThisTimeFilesCount,
													exsistingFilesCount: stateObj.includedFilesCount - stateObj.syncedThisTimeFilesCount,
													allFilesSize: `${humanFileSize(stateObj.allFilesSize)} (${stateObj.allFilesSize})`,
													includedFilesSize: `${humanFileSize(stateObj.includedFilesSize)} (${stateObj.includedFilesSize})`,
													syncedThisTimeFilesSize: `${humanFileSize(stateObj.syncedThisTimeFilesSize)} (${stateObj.syncedThisTimeFilesSize})`
												})}`);
											} // if !media exists
										} else {
											log.info(`Skipping filename:${filename}, not included.`);
										} // if doctype && extension
										progressObj.current += 1; // Finished syncing a public asset
									}); // assets.forEach
								} // fnHandleAssets
							}); // getAndPaginateAssetList
							progressObj.current += 1; // Finished syncing a public collection
						}); // publicCollections.forEach
					}; // fnHandlePublicCollections

					getAndPaginateCollectionList({
						hostname,
						shortAbsolutePath: archivesPath,
						fnHandleCollections: fnHandlePublicCollections
					}); // getAndPaginateCollectionList
					log.info(`state:${toStr({
						allFilesCount: stateObj.allFilesCount,
						includedFilesCount: stateObj.includedFilesCount,
						excludedFilesCount: stateObj.allFilesCount - stateObj.includedFilesCount,
						syncedThisTimeFilesCount: stateObj.syncedThisTimeFilesCount,
						exsistingFilesCount: stateObj.includedFilesCount - stateObj.syncedThisTimeFilesCount,
						allFilesSize: `${humanFileSize(stateObj.allFilesSize)} (${stateObj.allFilesSize})`,
						includedFilesSize: `${humanFileSize(stateObj.includedFilesSize)} (${stateObj.includedFilesSize})`,
						syncedThisTimeFilesSize: `${humanFileSize(stateObj.syncedThisTimeFilesSize)} (${stateObj.syncedThisTimeFilesSize})`
					})}`);
					progressObj.info = 'Finished syncing public collections :)';
					log.info(`progressObj:${toStr(progressObj)}`);
					progress(progressObj);
				} // if boolSyncPublic

				if (boolSyncPrivate) {
					const {accessToken} = getAccessToken({
						hostname,
						clientId,
						clientSecret
					});
					//log.info(`accessToken:${toStr(accessToken)}`);
					const {
						archivesPath,
						renditionRequest
					} = getPrivateFullAPIDescriptor({
						accessToken,
						hostname
					});
					//log.info(`archivesPath:${toStr(archivesPath)}`);
					//log.info(`renditionRequest:${toStr(renditionRequest)}`);

					const fnHandlePrivateCollections = (collections) => {
						//log.info(`collections:${toStr(collections)}`);
						progressObj.total += collections.length; // Found private collections to process

						collections.forEach((aPrivateCollection) => {
							//log.info(`aPrivateCollection:${toStr(aPrivateCollection)}`);
							const {
								name: collectionName,
								href: collectionHref
							} = aPrivateCollection;
							//log.info(`collectionName:${toStr(collectionName)}`);
							//log.info(`collectionHref:${toStr(collectionHref)}`);
							progressObj.info = `Syncing private collection ${collectionName}`;
							progress(progressObj);

							//name: sanitize(href.replace(archivesPath, '').replace(/\/$/, '')), // NOPE private archives has "public" href :(
							const collectionContentPath = sanitizePath(decodeURIComponent(collectionHref).replace('/fotoweb/archives', privateFolderPath).replace(/\/$/, ''));
							//log.info(`collectionContentPath:${toStr(collectionContentPath)}`);
							const collectionContentParentPath = collectionContentPath.replace(/\/[^/]+$/, '');
							//log.info(`collectionContentParentPath:${toStr(collectionContentParentPath)}`);
							const collectionContentName = sanitize(collectionContentPath.replace(/^.*\//, ''));
							//log.info(`collectionContentName:${toStr(collectionContentName)}`);

							//const {createdOrModifiedCollectionContent} =
							createOrModifyCollection({
								parentPath: collectionContentParentPath,
								name: collectionContentName,
								displayName: collectionName
							});
							//log.info(`createdOrModifiedCollectionContent:${toStr(createdOrModifiedCollectionContent)}`);

							const {
								childCount,
								children // collection list (object)
							} = getCollection({
								accessToken,
								hostname,
								shortAbsolutePath: collectionHref
							});
							if (childCount) {
								//log.info(`childCount:${toStr(childCount)}`);
								//log.info(`children:${toStr(children)}`);
								paginateCollectionList({
									accessToken,
									hostname,
									collectionList: {
										collections: children.data,
										paging: children.paging
									},
									//parentCollectionPath: collectionContentPath,
									fnHandleCollections: fnHandlePrivateCollections // NOTE selfreference
								});
							} // childCount

							getAndPaginateAssetList({
								accessToken,
								hostname,
								shortAbsolutePath: aPrivateCollection.href,
								doPaginate: false, // DEBUG
								fnHandleAssets: (assets) => {
									progressObj.total += assets.length; // Found private assets to process
									stateObj.allFilesCount += assets.length;
									assets.forEach((asset) => {
										//log.info(`asset:${toStr(asset)}`);
										const {
											doctype,
											filename,
											filesize,
											renditions
										} = asset;
										stateObj.allFilesSize += filesize;
										/*const extention = filename.replace(/[^.]+\./, '');
										if (!foundDocTypes.includes(doctype)) {
											foundDocTypes.push(doctype);
											log.info(`Found new doctype:${doctype} foundDocTypes:${toStr(foundDocTypes)}`);
										}
										if (!foundExtentions.includes(extention)) {
											foundExtentions.push(extention);
											log.info(`Found new extention:${extention} foundExtentions:${toStr(foundExtentions)}`);
										}
										if (!foundDocTypesAndExtentions[doctype]) {
											foundDocTypesAndExtentions[doctype] = [];
										}
										if (!foundDocTypesAndExtentions[doctype].includes(extention)) {
											foundDocTypesAndExtentions[doctype].push(extention);
											log.info(`Found new extention:${extention} in doctype:${doctype} foundDocTypesAndExtentions:${toStr(foundDocTypesAndExtentions)}`);
										}*/
										//log.info(`renditions:${toStr(renditions)}`);

										const extention = filename.replace(/.+\./, '').toLowerCase();
										if (selectedDocTypes.includes(doctype) && selectedExtensions.includes(extention)) {
											stateObj.includedFilesCount += 1;
											stateObj.includedFilesSize += filesize;
											progressObj.info = `Syncing asset ${filename} in private collection ${collectionName}`;
											progress(progressObj);
											const existsKey = `${collectionContentPath}/${filename}`;
											//log.info(`existsKey:${toStr(existsKey)}`);
											if (exists({key: existsKey})) {
												log.info(`Skipping ${existsKey}, already exists.`);
											} else {
												stateObj.syncedThisTimeFilesCount += 1;
												stateObj.syncedThisTimeFilesSize += filesize;
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
													//.filter(({display_name: displayName}) => displayName === 'Original File')[0];
													//.filter(({default: isDefault}) => isDefault === true)[0];
													//.sort((a, b) => a.size - b.size)[0]; // Smallest images
													//.sort((a, b) => b.size - a.size)[0]; // Largest images

												// WARNING These renditions might not exist!
												//.filter(({display_name: displayName}) => displayName === 'JPG CMYK')[0];
												//.filter(({display_name: displayName}) => displayName === 'JPG sRGB')[0];
												//.filter(({display_name: displayName}) => displayName === 'TIFF JPG CMYK')[0]; // size = 0 ???

												const downloadRenditionResponse = requestRendition({
													accessToken,
													//cookies,
													hostname,
													renditionServiceShortAbsolutePath: renditionRequest,
													renditionUrl: renditionHref
												});
												if (downloadRenditionResponse) {
													//log.info(`downloadRenditionResponse:${toStr(downloadRenditionResponse)}`);
													//log.info(`parentPath:${toStr(parentPath)}`);
													const createMediaResult = createMedia({
														name: filename,
														parentPath: collectionContentPath,
														//mimeType: downloadRenditionResponse.contentType,
														data: downloadRenditionResponse.bodyStream
													});
													//log.info(`createMediaResult:${toStr(createMediaResult)}`);
													//const publishResult =
													publish({
														keys: [createMediaResult._id],
														sourceBranch: 'draft',
														targetBranch: 'master',
														includeDependencies: false // default is true
													});
													//log.info(`publishResult:${toStr(publishResult)}`);
												}
												log.info(`state:${toStr({
													allFilesCount: stateObj.allFilesCount,
													includedFilesCount: stateObj.includedFilesCount,
													excludedFilesCount: stateObj.allFilesCount - stateObj.includedFilesCount,
													syncedThisTimeFilesCount: stateObj.syncedThisTimeFilesCount,
													exsistingFilesCount: stateObj.includedFilesCount - stateObj.syncedThisTimeFilesCount,
													allFilesSize: `${humanFileSize(stateObj.allFilesSize)} (${stateObj.allFilesSize})`,
													includedFilesSize: `${humanFileSize(stateObj.includedFilesSize)} (${stateObj.includedFilesSize})`,
													syncedThisTimeFilesSize: `${humanFileSize(stateObj.syncedThisTimeFilesSize)} (${stateObj.syncedThisTimeFilesSize})`
												})}`);
											} // if !exist media content
										} else {
											log.info(`Skipping filename:${filename}, not included.`);
										} // if doctype && extension
										progressObj.current += 1; // Finished syncing a private asset
									}); // assets.forEach
								} // fnHandleAssets
							}); // getAndPaginateAssetList
							progressObj.current += 1; // Finished syncing a private collection
						}); // collections.forEach
					}; // fnHandlePrivateCollections

					getAndPaginateCollectionList({
						accessToken,
						hostname,
						shortAbsolutePath: archivesPath,
						fnHandleCollections: fnHandlePrivateCollections
					}); // getAndPaginateCollectionList

					progressObj.info = 'Finished syncing private collections :)';
					log.info(`progressObj:${toStr(progressObj)}`);
					progress(progressObj);
				} // if boolSyncPrivate
				log.info(`state:${toStr({
					allFilesCount: stateObj.allFilesCount,
					includedFilesCount: stateObj.includedFilesCount,
					excludedFilesCount: stateObj.allFilesCount - stateObj.includedFilesCount,
					syncedThisTimeFilesCount: stateObj.syncedThisTimeFilesCount,
					exsistingFilesCount: stateObj.includedFilesCount - stateObj.syncedThisTimeFilesCount,
					allFilesSize: `${humanFileSize(stateObj.allFilesSize)} (${stateObj.allFilesSize})`,
					includedFilesSize: `${humanFileSize(stateObj.includedFilesSize)} (${stateObj.includedFilesSize})`,
					syncedThisTimeFilesSize: `${humanFileSize(stateObj.syncedThisTimeFilesSize)} (${stateObj.syncedThisTimeFilesSize})`
				})}`);
			}); // run
			//log.info(`foundDocTypes:${toStr(foundDocTypes)}`);
			//log.info(`foundExtentions:${toStr(foundExtentions)}`);
			//log.info(`foundDocTypesAndExtentions:${toStr(foundDocTypesAndExtentions)}`);
		} // task
	}); // submit

	return {
		body: {
			repository,
			siteId
		},
		contentType: 'application/json;charset=utf-8'
	};
};
