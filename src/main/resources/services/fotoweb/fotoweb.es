import {toStr} from '/lib/util';
import {forceArray} from '/lib/util/data';
import {sanitize} from '/lib/xp/common';
import {
	get as getContentByKey,
	getSiteConfig as getSiteConfigByKey
} from '/lib/xp/content';
import {
	get as getContext,
	run
} from '/lib/xp/context';
import {submit} from '/lib/xp/task';

//import {getPublicAPIDescriptor} from '../../lib/fotoweb/getPublicAPIDescriptor';
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
				/*public: {
					folder: publicFolder // contentId
				} = {},*/
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
					/*if (
						selectedArr.includes('public')
						&& publicFolder
					) {
						const {
							archivesPath,
							renditionRequest
						} = getPublicAPIDescriptor({hostname});
						//log.info(`archivesPath:${toStr(archivesPath)}`);
						//log.info(`renditionRequest:${toStr(renditionRequest)}`);
						/*syncPublic({
							hostname,
							folder: publicFolder // contentId
						});
					} // if public*/

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
							//log.info(`href:${toStr(href)}`);
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
							log.info(`assets[0]:${toStr(assets[0])}`);*/

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
								profile*/
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
