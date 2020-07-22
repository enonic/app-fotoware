import {toStr} from '/lib/util';
import {forceArray} from '/lib/util/data';
import {sanitize} from '/lib/xp/common';
import {
	createMedia,
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
import {getCollectionList} from '../../lib/fotoweb/getCollectionList';
import {createOrModifyArchive} from '../../lib/fotoweb/createOrModifyArchive';
//import {getCollection} from '../../lib/fotoweb/getCollection';
import {getAssetList} from '../../lib/fotoweb/getAssetList';
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
						const {collections: publicCollections} = getCollectionList({
							url: `${hostname}${archivesPath}`
						});
						//log.info(`publicCollections:${toStr(publicCollections)}`);
						total += publicCollections.length;
						current += 1; // Finished initializing
						/*progress({
							current,
							info: 'Syncing public assets',
							total
						});*/

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
									info: `Syncing collection ${collectionName}`,
									total
								});
								const archiveContentName = sanitize(collectionHref.replace('/fotoweb/archives/', '').replace(/\/$/, ''));
								const {createdOrModifiedArchiveContent} = createOrModifyArchive({
									parentPath,
									name: archiveContentName,
									displayName: collectionName
								});
								log.info(`createdOrModifiedArchiveContent:${toStr(createdOrModifiedArchiveContent)}`);
								const archiveContentPath = `${parentPath}/${archiveContentName}`;

								const {
									assets//,
									//cookies
								} = getAssetList({
									url: `${hostname}${aPublicCollection.href}`
								});

								total += assets.length;

								assets.forEach((asset/*, i*/) => {
									//log.info(`asset:${toStr(asset}`);
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
										//renditionUrl: `${hostname}${renditionHref}`
										renditionUrl: renditionHref
									});
									//log.info(`downloadRenditionResponse:${toStr(downloadRenditionResponse)}`);
									log.info(`parentPath:${toStr(parentPath)}`);
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
									log.info(`publishResult:${toStr(publishResult)}`);
									current += 1; // per asset synced
								}); // assets.forEach
								current += 1; // per publicCollection synced
							}); // publicCollections.forEach
						}); // draftContext.run
						const progressParams = {
							current,
							info: 'Finished syncing public collections :)',
							total
						};
						log.info(`progressParams:${toStr(progressParams)}`);
						progress(progressParams);
					} // if public

					/*if (
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
						const {collections} = getCollectionList({
							accessToken,
							url: `${hostname}${archivesPath}`
						});
						//log.info(`collections:${toStr(collections)}`);
						//log.info(`collections[0]:${toStr(collections[0])}`);

						const draftContext = getContext();
						draftContext.branch = 'draft'; // create/modify in draft then publish
						//log.info(`draftContext:${toStr(draftContext)}`);

						run(draftContext, () => {
							const folderContent = getContentByKey({key: privateFolder});
							//log.info(`folderContent:${toStr(folderContent)}`);
							const parentPath = folderContent._path;
							const {
								name: collectionName,
								href: collectionHref
							} = collections[0];
							//log.info(`collectionName:${toStr(collectionName)}`);
							//log.info(`collectionHref:${toStr(collectionHref)}`);
							const {createdOrModifiedArchiveContent} = createOrModifyArchive({
								parentPath,
								//name: sanitize(href.replace(archivesPath, '').replace(/\/$/, '')), // NOPE private archives has public href :(
								name: sanitize(collectionHref.replace('/fotoweb/archives/', '').replace(/\/$/, '')),
								displayName: collectionName
							});
							log.info(`createdOrModifiedArchiveContent:${toStr(createdOrModifiedArchiveContent)}`);

							/* TODO Only needed when a collection has children
							const {
								/*name,
								href,
								assets
							} = getCollection({
								accessToken,
								url: `${hostname}${archives[0].href}`
							});
							log.info(`assets[0]:${toStr(assets[0])}`);

							const {
								assets//,
								//cookies
							} = getAssetList({
								accessToken,
								url: `${hostname}${collections[0].href}`
							});
							//log.info(`assets[0]:${toStr(assets[0])}`);
							const {renditions} = assets[0];
							log.info(`renditions:${toStr(renditions)}`);
							const {
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
								//.filter(({original}) => original === true)[0];
								//.filter(({display_name: displayName}) => displayName === 'Original File')[0];
								//.filter(({default: isDefault}) => isDefault === true)[0];
								//.sort((a, b) => a.size - b.size)[0]; // Smallest images
								//.sort((a, b) => b.size - a.size)[0]; // Largest images
								//.filter(({display_name: displayName}) => displayName === 'JPG CMYK')[0];
								.filter(({display_name: displayName}) => displayName === 'JPG sRGB')[0];
								//.filter(({display_name: displayName}) => displayName === 'TIFF JPG CMYK')[0]; // size = 0 ???

							requestRendition({
								accessToken,
								//cookies,
								renditionRequestServiceUrl: `${hostname}${renditionRequest}`,
								//renditionUrl: `${hostname}${renditionHref}`
								renditionUrl: renditionHref
							});
						}); // draftContext.run
					} // if private*/
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
