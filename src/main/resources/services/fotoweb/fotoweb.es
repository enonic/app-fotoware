import {toStr} from '/lib/util';
import {forceArray} from '/lib/util/data';
import {sanitize} from '/lib/xp/common';
import {
	createMedia,
	exists,
	get as getContentByKey,
	getSiteConfig as getSiteConfigByKey,
	publish
} from '/lib/xp/content';
import {
	get as getContext,
	run
} from '/lib/xp/context';
import {
	progress,
	submit
} from '/lib/xp/task';

import {getPublicAPIDescriptor} from '../../lib/fotoweb/getPublicAPIDescriptor';
import {getAccessToken} from '../../lib/fotoweb/getAccessToken';
import {getprivateFullAPIDescriptor} from '../../lib/fotoweb/getprivateFullAPIDescriptor';
import {getAndPaginateCollectionList} from '../../lib/fotoweb/getAndPaginateCollectionList';
import {createOrModifyArchive} from '../../lib/fotoweb/createOrModifyArchive';
//import {getCollection} from '../../lib/fotoweb/getCollection';
import {getAndPaginateAssetList} from '../../lib/fotoweb/getAndPaginateAssetList';
import {requestRendition} from '../../lib/fotoweb/requestRendition';

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
	const context = {
		repository,
		branch: 'master', // Always syncing to master
		user: {
			login: 'su',
			idProvider: 'system'
		},
		principals: ['role:system.admin']
	};
	run(context, () => {
		const siteConfig = getSiteConfigByKey({
			applicationKey: app.name,
			key: siteId
		});
		//log.info(`siteConfig:${toStr(siteConfig)}`);
		const {
			archiveOptionSet: {
				_selected: selected = [],
				public: {
					folder: publicFolder // contentId
				} = {},
				private: {
					clientId,
					clientSecret,
					folder: privateFolder // contentId
				} = {}
			} = {},
			hostname
		} = siteConfig;
		//log.info(`selected:${toStr(selected)}`);
		//log.info(`publicFolder:${toStr(publicFolder)}`); // contentId
		//log.info(`clientId:${toStr(clientId)}`);
		//log.info(`clientSecret:${toStr(clientSecret)}`);
		//log.info(`privateFolder:${toStr(privateFolder)}`); // contentId
		//log.info(`hostname:${toStr(hostname)}`);
		const selectedArr = forceArray(selected);
		if (hostname) {
			submit({
				description: '',
				task: () => {
					let current = 0; // No items has been processed yet
					let total = 1; // So it looks like there is something to do.
					progress({
						current,
						info: 'Initializing FotoWeb Intergration Task',
						total
					});
					if (
						selectedArr.includes('public')
						&& publicFolder
					) {
						const {
							archivesPath,
							renditionRequest
						} = getPublicAPIDescriptor({hostname});
						//log.info(`archivesPath:${toStr(archivesPath)}`);
						//log.info(`renditionRequest:${toStr(renditionRequest)}`);

						getAndPaginateCollectionList({
							hostname,
							shortAbsolutePath: archivesPath,
							fnHandleCollections: (publicCollections) => {
								//log.info(`publicCollections:${toStr(publicCollections)}`);
								total += publicCollections.length;
								current += 1; // Finished initializing

								const draftContext = getContext();
								draftContext.branch = 'draft'; // create/modify in draft then publish
								//log.info(`draftContext:${toStr(draftContext)}`);

								run(draftContext, () => {
									const folderContent = getContentByKey({key: publicFolder});
									//log.info(`folderContent:${toStr(folderContent)}`);
									const parentPath = folderContent._path;
									publicCollections.forEach((aPublicCollection/*, i*/) => {
										//log.info(`aPublicCollection:${toStr(aPublicCollection)}`);
										const {
											name: collectionName,
											href: collectionHref
										} = aPublicCollection;
										//log.info(`collectionName:${toStr(collectionName)}`);
										//log.info(`collectionHref:${toStr(collectionHref)}`);
										progress({
											current,
											info: `Syncing public collection ${collectionName}`,
											total
										});
										const archiveContentName = sanitize(collectionHref.replace('/fotoweb/archives/', '').replace(/\/$/, ''));
										//const {createdOrModifiedArchiveContent} =
										createOrModifyArchive({
											parentPath,
											name: archiveContentName,
											displayName: collectionName
										});
										//log.info(`createdOrModifiedArchiveContent:${toStr(createdOrModifiedArchiveContent)}`);
										const archiveContentPath = `${parentPath}/${archiveContentName}`;

										getAndPaginateAssetList({
											hostname,
											shortAbsolutePath: aPublicCollection.href,
											doPaginate: false, // DEBUG
											fnHandleAssets: (assets) => {
												total += assets.length;
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
														//doctype // graphic image
														filename,
														//metadata,
														//props,
														renditions
													} = asset;
													progress({
														current,
														info: `Syncing asset ${filename} in collection ${collectionName}`,
														total
													});
													const existsKey = `${archiveContentPath}/${filename}`;
													//log.info(`existsKey:${toStr(existsKey)}`);
													if (!exists({key: existsKey})) {
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
															renditionRequestServiceUrl: `${hostname}${renditionRequest}`,
															renditionUrl: renditionHref
														});
														//log.info(`downloadRenditionResponse:${toStr(downloadRenditionResponse)}`);
														//log.info(`parentPath:${toStr(parentPath)}`);
														const createMediaResult = createMedia({
															name: filename,
															parentPath: archiveContentPath,
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
													} // if !media exists
													current += 1; // per asset synced
												}); // assets.forEach
											} // fnHandleAssets
										}); // getAndPaginateAssetList
										current += 1; // per publicCollection synced
									}); // publicCollections.forEach
								}); // draftContext.run
							} // fnHandleCollections
						}); // getAndPaginateCollectionList
						const progressParams = {
							current,
							info: 'Finished syncing public collections :)',
							total
						};
						//log.info(`progressParams:${toStr(progressParams)}`);
						progress(progressParams);
					} // if public

					if (
						selectedArr.includes('private')
						&& clientId
						&& clientSecret
						&& privateFolder
					) {
						const {accessToken} = getAccessToken({
							hostname,
							clientId,
							clientSecret
						});
						//log.info(`accessToken:${toStr(accessToken)}`);
						const {
							archivesPath,
							renditionRequest
						} = getprivateFullAPIDescriptor({
							accessToken,
							hostname
						});
						//log.info(`archivesPath:${toStr(archivesPath)}`);
						//log.info(`renditionRequest:${toStr(renditionRequest)}`);
						getAndPaginateCollectionList({
							accessToken,
							hostname,
							shortAbsolutePath: archivesPath,
							fnHandleCollections: (collections) => {
								//log.info(`collections:${toStr(collections)}`);
								total += collections.length;

								const draftContext = getContext();
								draftContext.branch = 'draft'; // create/modify in draft then publish
								//log.info(`draftContext:${toStr(draftContext)}`);

								run(draftContext, () => {
									const folderContent = getContentByKey({key: privateFolder});
									//log.info(`folderContent:${toStr(folderContent)}`);
									const parentPath = folderContent._path;
									collections.forEach((aPrivateCollection) => {
										//log.info(`aPrivateCollection:${toStr(aPrivateCollection)}`);
										const {
											name: collectionName,
											href: collectionHref
										} = aPrivateCollection;
										//log.info(`collectionName:${toStr(collectionName)}`);
										//log.info(`collectionHref:${toStr(collectionHref)}`);
										progress({
											current,
											info: `Syncing private collection ${collectionName}`,
											total
										});
										//name: sanitize(href.replace(archivesPath, '').replace(/\/$/, '')), // NOPE private archives has public href :(
										const archiveContentName = sanitize(collectionHref.replace('/fotoweb/archives/', '').replace(/\/$/, ''));
										//const {createdOrModifiedArchiveContent} =
										createOrModifyArchive({
											parentPath,
											name: archiveContentName,
											displayName: collectionName
										});
										//log.info(`createdOrModifiedArchiveContent:${toStr(createdOrModifiedArchiveContent)}`);
										const archiveContentPath = `${parentPath}/${archiveContentName}`;

										/* TODO Only needed when a collection has children
										const {
											/*name,
											href,
											assets
										} = getCollection({
											accessToken,
											url: `${hostname}${archives[0].href}`
										});
										log.info(`assets[0]:${toStr(assets[0])}`);*/

										getAndPaginateAssetList({
											accessToken,
											hostname,
											shortAbsolutePath: aPrivateCollection.href,
											doPaginate: false, // DEBUG
											fnHandleAssets: (assets) => {
												total += assets.length;
												assets.forEach((asset) => {
													//log.info(`asset:${toStr(asset)}`);
													const {
														filename,
														renditions
													} = asset;
													//log.info(`renditions:${toStr(renditions)}`);

													progress({
														current,
														info: `Syncing asset ${filename} in private collection ${collectionName}`,
														total
													});
													const existsKey = `${archiveContentPath}/${filename}`;
													//log.info(`existsKey:${toStr(existsKey)}`);
													if (!exists({key: existsKey})) {
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

														/*const downloadRenditionResponse = requestRendition({
															accessToken,
															//cookies,
															renditionRequestServiceUrl: `${hostname}${renditionRequest}`,
															renditionUrl: renditionHref
														});
														log.info(`downloadRenditionResponse:${toStr(downloadRenditionResponse)}`);
														//log.info(`parentPath:${toStr(parentPath)}`);
														const createMediaResult = createMedia({
															name: filename,
															parentPath: archiveContentPath,
															//mimeType: downloadRenditionResponse.contentType,
															data: downloadRenditionResponse.bodyStream
														});
														log.info(`createMediaResult:${toStr(createMediaResult)}`);
														const publishResult = publish({
															keys: [createMediaResult._id],
															sourceBranch: 'draft',
															targetBranch: 'master',
															includeDependencies: false // default is true
														});
														log.info(`publishResult:${toStr(publishResult)}`);*/
													} // if !exist media content
													current += 1; // per private asset synced
												}); // assets.forEach
											} // fnHandleAssets
										}); // getAndPaginateAssetList
										current += 1; // per private collection synced
									}); // collections.forEach
								}); // draftContext.run
							} // fnHandleCollections
						}); // getAndPaginateCollectionList
						const progressParams = {
							current,
							info: 'Finished syncing private collections :)',
							total
						};
						log.info(`progressParams:${toStr(progressParams)}`);
						progress(progressParams);
					} // if private
				} // task
			}); // submit
		} // if hostname
	}); // context.run
	return {
		body: {
			repository,
			siteId
		},
		contentType: 'application/json;charset=utf-8'
	};
};
