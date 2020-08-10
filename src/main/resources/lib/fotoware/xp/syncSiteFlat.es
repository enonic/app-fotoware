import deepEqual from 'fast-deep-equal';
//import getIn from 'get-value';
import {md5} from '/lib/text-encoding';
import {toStr} from '/lib/util';
//import {forceArray} from '/lib/util/data';
import {sanitize} from '/lib/xp/common';
import {
	create as createContent,
	createMedia,
	getAttachmentStream,
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
	accessToken,
	assetHref,
	fields,
	//filename,
	//filesize,
	metadata,
	mediaName,
	path,
	renditionRequest,
	renditions,
	//seenFilenames,
	url
}) {
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
	log.info(`new mediaName:${mediaName} md5sum:${md5sum}`);
	if (downloadRenditionResponse) {
		const createMediaResult = createMedia({
			name: mediaName,
			parentPath: `/${path}`,
			data: downloadRenditionResponse.bodyStream
		});
		if (createMediaResult) {
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
								//filesize,
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

			// Update seenFilenames
			//if (!seenFilenames[filename][filesize]) {seenFilenames[filename][filesize] = {};}
			//if (!seenFilenames[filename][filesize].hrefs) {seenFilenames[filename][filesize].hrefs = [];}
			//seenFilenames[filename][filesize].hrefs.push(assetHref);
			//const mediaPath = `/${path}/${filename}`;
			//seenFilenames[filename][filesize].mediaPath = mediaPath;
			//log.info(`seenFilenames:${toStr(seenFilenames)}`);
			throw 'STOPPED ON PURPOSE AFTER CREATING SINGLE MEDIA'; // DEBUG
		} // if createMediaResult
	} // if downloadRenditionResponse
} // sinceMediaDoesNotExistCreateIt

/*function sinceMediaExistWithFileSizeAndHrefJustRememberIt({
	assetHref,
	filename,
	filesize,
	mediaPath,
	seenFilenames
}) {
	if (!seenFilenames[filename][filesize]) {seenFilenames[filename][filesize] = {};}
	if (!seenFilenames[filename][filesize].hrefs) {seenFilenames[filename][filesize].hrefs = [];}
	seenFilenames[filename][filesize].hrefs.push(assetHref);
	seenFilenames[filename][filesize].mediaPath = mediaPath;
	log.info(`seenFilenames:${toStr(seenFilenames)}`);
	throw 'STOPPED ON PURPOSE AFTER MEDIA EXIST WITH SAME FILESIZE AND ASSETHREF'; // DEBUG
} // sinceMediaExistWithFileSizeAndHrefJustRememberIt*/

function sinceMediaExistWithFilesizeButMissingHrefAddHref({
	assetHref,
	exisitingMediaHrefs,
	//filename,
	//filesize,
	mediaPath//,
	//seenFilenames
}) {
	modifyContent({
		key: mediaPath,
		editor: (node) => {
			try {
				//log.info(`node:${toStr(node)}`);
				exisitingMediaHrefs.push(assetHref);
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
	//if (!seenFilenames[filename][filesize]) {seenFilenames[filename][filesize] = {};}
	//if (!seenFilenames[filename][filesize].hrefs) {seenFilenames[filename][filesize].hrefs = [];}
	//seenFilenames[filename][filesize].hrefs.push(assetHref);
	//seenFilenames[filename][filesize].mediaPath = mediaPath;
	//log.info(`seenFilenames:${toStr(seenFilenames)}`);
	throw 'STOPPED ON PURPOSE AFTER MEDIA EXIST WITH SAME FILESIZE ADDED ASSETHREF'; // DEBUG
} // sinceMediaExistWithFilesizeButMissingHrefAddHref

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
		const content = getContentByKey({key: `/${path}`});
		if (content && !content.type === 'base:folder') {
			throw new Error(`Content path:${path} not a folder!`);
		}
		if (!content) {
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
							shouldStop: false
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

		// On first sync lets assume there are no media contents
		// On first asset create media content storing assetHref and filesize

		// On second asset which is same filename and filesize add assetHref
		// To compare currently we open the filename, that wont work when multiple different assets have the same filename
		// Too avoid opening or quering for content we can keep a cache, but that will only remember assets this sync.

		// On third asset which is same filename, but different filesize create new media content with assetHref and filesize

		/*const seenFilenames = {/*
			'filename.jpg.filesize': {
				hrefs: [
					'href1',
					'href2'
				]
			},
		/}; // seenFilenames*/

		getAndPaginateCollectionList({
			accessToken,
			hostname: url,
			shortAbsolutePath: archivesPath,
			fnHandleCollections
		});

		function fnHandleCollections(collections) {
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

							const mediaName = sanitize(`${filename}.${filesize}`); // This should be unique most of the time
							const mediaPath = `/${path}/${mediaName}`;
							const exisitingMedia = getContentByKey({key: mediaPath});

							// Try to program in chronolicial order of what will happen from first sync and onwards.

							// 1. No media with same name and size has been synced before.
							if (!exisitingMedia) {
								return sinceMediaDoesNotExistCreateIt({
									accessToken,
									assetHref,
									fields,
									//filename,
									//filesize,
									mediaName,
									metadata,
									path,
									renditionRequest,
									renditions,
									//seenFilenames,
									url
								});
							}

							const attachmentStream = getAttachmentStream({
								key: mediaPath,
								name: mediaName
							});

							const md5sum = md5(attachmentStream.readText);
							log.info(`existing mediaName:${mediaName} md5sum:${md5sum}`);

							// Check if assetHref matches
							let {
								x: {
									[X_APP_NAME]: {
										fotoWare: {
											//filesize: exisitingMediaFilesize,
											hrefs: exisitingMediaHrefs
										} = {}
									} = {}
								} = {}
							} = exisitingMedia;
							if (!exisitingMediaHrefs) {
								log.warning(`A media was created without reference to it's assetUrl mediaPath:${mediaPath}`);
								exisitingMediaHrefs = [];
								//return;
							} else if (!Array.isArray(exisitingMediaHrefs)) {
								exisitingMediaHrefs = [exisitingMediaHrefs];
							}
							if (!exisitingMediaHrefs.includes(assetHref)) {
								// 2. A media with same name and size has been synced before add missing href
								return sinceMediaExistWithFilesizeButMissingHrefAddHref({
									assetHref,
									exisitingMediaHrefs,
									mediaPath
								});
							}

							// 3. A media with same name and size has been synced before and already contains the assetHref
							// So do nothing :)

							/*if (seenFilenames[filename]) {
								// filename seen before this sync, check if filesize matches
								if (seenFilenames[filename][filesize]) {
									// Yup that filename with same filesize has been seen before this sync
									// Thus we should already have an unique mediaPath
									// TODO Open that unique mediaPath and add assetHref
									throw `STOPPED ON PURPOSE AFTER SEEN FILENAME ${filename} AND FILESIZE ${filesize} THIS SYNC`; // DEBUG
								} else {
									// We have seen the filename, but not that filesize this sync
									// TODO Check if media content exists from previous sync?
									// TODO Create new media content
									// TODO Update seenFilenames with mediaPath
									throw `STOPPED ON PURPOSE AFTER SEEN FILENAME ${filename} BUT NOT FILESIZE ${filesize} THIS SYNC`; // DEBUG
								}
							} else { // Not seen filename this sync
								seenFilenames[filename] = {};

								// Check if media content with filename exists from previous sync
								const mediaPath = `/${path}/${filename}`;
								const exisitingMedia = getContentByKey({key: mediaPath});
								if (exisitingMedia) {
									// Check if assetHref matches
									const {
										x: {
											[X_APP_NAME]: {
												fotoWare: {
													//filesize: exisitingMediaFilesize,
													hrefs: exisitingMediaHrefs
												} = {}
											} = {}
										} = {}
									} = exisitingMedia;
									if (filesize === exisitingMediaFilesize) {
										const exisitingMediaHrefs = forceArray(exisitingMediaHrefs);
										if (exisitingMediaHrefs && exisitingMediaHrefs.includes(assetHref)) {
											sinceMediaExistWithFileSizeAndHrefJustRememberIt({
												assetHref,
												filename,
												filesize,
												mediaPath,
												seenFilenames
											});
										} else {
											sinceMediaExistWithFilesizeButMissingHrefAddHref({
												assetHref,
												exisitingMediaHrefs,
												mediaPath
											});
										}
									} else { // Media does not match filesize
										// TODO Does media reference other media with generated names?
										sinceMediaExistButNotFilesizeCreateMediaAndAddReferenceInFirstMedia({});
									}

									const exisitingMediaHrefs = forceArray(exisitingMediaHrefs);
									if ( exisitingMediaHrefs && exisitingMediaHrefs.includes(assetHref)) {
																				} else { // Filename not seen this sync, but filename media exist (from previous sync), but media is missing this assetHref
										throw 'DO WE GET HERE?'; // DEBUG
										//log.warning(`filename:${filename} exists, but hrefs:${toStr(exisitingMediaHrefs)} doesn't include assetHref:${assetHref}!`);
										if(filesize === exisitingMediaFilesize) {
											// Probably same image, add new href
										} else {
											// Not the same image!
											log.error(`filename:${filename} exists, but hrefs:${toStr(exisitingMediaHrefs)} doesn't include assetHref:${assetHref}! and filesize:${filesize} !== exisitingMediaFilesize:${exisitingMediaFilesize}`);
										}
									}
								} else {
									sinceMediaDoesNotExistCreateIt({
										accessToken,
										assetHref,
										fields,
										filename,
										filesize,
										metadata,
										path,
										renditionRequest,
										renditions,
										seenFilenames,
										url
									});
								}
							} */
						}); // forEach asset
					} // fnHandleAssets
				}); // getAndPaginateAssetList
			}); // forEach collection
		} // function fnHandleCollections
	}); // run in project
} // export function syncSiteFlat
