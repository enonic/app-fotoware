import deepEqual from 'fast-deep-equal';
import getIn from 'get-value';
import {toStr} from '/lib/util';
import {forceArray} from '/lib/util/data';
import {sanitize} from '/lib/xp/common';
import {
	create as createContent,
	createMedia,
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
				data: {}
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
							//log.info(`asset:${toStr(asset)}`);
							const {
								doctype,
								filename,
								filesize,
								href: assetHref,
								metadata,
								renditions
							} = asset;
							if (docTypes[doctype]) {
								const mediaId = `/${path}/${filename}`;
								//log.info(`mediaId:${toStr(mediaId)}`);
								const exisitingMedia = getContentByKey({key: mediaId});
								if(exisitingMedia) {
									//log.info(`exisitingMedia:${toStr(exisitingMedia)}`);
									// TODO How can we check if same image?
									const {
										x: {
											[X_APP_NAME]: {
												fotoWare: {
													filesize: exisitingMediaFilesize,
													hrefs: exisitingMediaHrefs
												} = {}
											} = {}/*,
											media: {
												imageInfo: {
													byteSize: exisitingMediaByteSize
												} = {}
											} = {}*/
										} = {}
									} = exisitingMedia;
									const exisitingMediaHrefsArray = forceArray(exisitingMediaHrefs);
									if ( exisitingMediaHrefs && exisitingMediaHrefsArray.includes(assetHref)) {
										//log.info(`Skipping assetHref:${assetHref} already exists as mediaId:${mediaId}`);
									} else {
										//log.warning(`filename:${filename} exists, but hrefs:${toStr(exisitingMediaHrefs)} doesn't include assetHref:${assetHref}!`);
										if(filesize === exisitingMediaFilesize) {
											// Probably same image, add new href
											modifyContent({
												key: mediaId,
												editor: (node) => {
													try {
														//log.info(`node:${toStr(node)}`);
														exisitingMediaHrefsArray.push(assetHref);
														node.x[X_APP_NAME].fotoWare.hrefs = exisitingMediaHrefsArray;
													} catch (e) {
														// Value of type [com.enonic.xp.data.PropertySet] cannot be converted to [Reference]
														log.error(`Unable to add assetHref:${assetHref} in node:${toStr(node)}`);
														throw e;
													}
													return node;
												}, // editor
												requireValid: false // Not under site so there is no x-data definitions
											}); // modifyContent
										} else {
											// Not the same image!
											log.error(`filename:${filename} exists, but hrefs:${toStr(exisitingMediaHrefs)} doesn't include assetHref:${assetHref}! and filesize:${filesize} !== exisitingMediaFilesize:${exisitingMediaFilesize}`);
										}
									}
								} else {
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
									if (downloadRenditionResponse) {
										const createMediaResult = createMedia({
											name: filename,
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
																filesize,
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
											//throw ''; // DEBUG
										} // if createMediaResult
									} // if downloadRenditionResponse
								} // if exists
							} // if doctype
						}); // forEach asset
					} // fnHandleAssets
				}); // getAndPaginateAssetList
			}); // forEach collection
		} // function fnHandleCollections
	}); // run in project
} // export function syncSiteFlat
