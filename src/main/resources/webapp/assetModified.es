// Node modules
import {diff} from 'deep-object-diff';

//import * as deepEqual from 'fast-deep-equal';
import deepEqual from 'fast-deep-equal';

// Enonic modules
import {URL} from '/lib/galimatias';
import {validateLicense} from '/lib/license';
import {md5} from '/lib/text-encoding';
import {toStr} from '/lib/util';
import {
	addAttachment,
	createMedia,
	get as getContentByKey,
	getAttachmentStream,
	publish,
	removeAttachment
} from '/lib/xp/content';
import {run as runInContext} from '/lib/xp/context';
import {readText} from '/lib/xp/io';
import {submit} from '/lib/xp/task';

// FotoWare modules
import {getAccessToken} from '/lib/fotoware/api/getAccessToken';
import {getPrivateFullAPIDescriptor} from '/lib/fotoware/api/getPrivateFullAPIDescriptor';
import {query as doQuery} from '/lib/fotoware/api/query';
import {requestRendition} from '/lib/fotoware/api/requestRendition';
import {addMetadataToContent} from '/lib/fotoware/xp/addMetadataToContent';
import {X_APP_NAME} from '/lib/fotoware/xp/constants';
import {getConfigFromAppCfg} from '/lib/fotoware/xp/getConfigFromAppCfg';
import {modifyMediaContent} from '/lib/fotoware/xp/modifyMediaContent';
import {isPublished} from '/lib/fotoware/xp/isPublished';

export const assetModified = (request) => {
	//log.debug(`request:${toStr(request)}`);

	const licenseDetails = validateLicense({appKey: app.name});
	//log.info(`licenseDetails:${toStr(licenseDetails)}`);
	const licenseValid = !!(licenseDetails && !licenseDetails.expired);
	const licensedTo = licenseDetails
		? (
			licenseDetails.expired
				? 'License expired!'
				: `Licensed to ${licenseDetails.issuedTo}`
		)
		: 'Unlicensed!';

	if (!licenseValid) {
		log.error(licensedTo);
		return {status: 404};
	}

	const {sitesConfigs} = getConfigFromAppCfg();
	//log.debug(`sitesConfigs:${toStr(sitesConfigs)}`);

	const {
		headers: {
			'User-Agent': userAgent
		},
		remoteAddress
	} = request;
	//log.debug(`remoteAddress:${toStr(remoteAddress)}`);
	//log.debug(`userAgent:${toStr(userAgent)}`);

	if (userAgent !== 'FotoWeb/8.0') {
		log.error(`Illegal userAgent in request! ${toStr(request)}`);
		return {status: 404};
	}

	let body;
	try {
		body = JSON.parse(request.body);
		//log.debug(`body:${toStr(body)}`);
	} catch (e) {
		log.error(`Something went wrong when trying to parse request body ${toStr(request)}`);
		return {status: 404};
	}

	const {
		href: hrefFromHook, // FQDN
		data: {
			filename
		}
	} = body;
	//log.debug(`hrefFromHook:${toStr(hrefFromHook)}`);
	//log.debug(`filename:${toStr(filename)}`);

	if (filename.startsWith('.')) {
		log.warning(`Skipping filename:${filename} because it starts with a dot, so probabbly a hidden file.`);
		return {
			body: {},
			contentType: 'application/json;charset=utf-8'
		};
	}

	const url = new URL(hrefFromHook);
	const site = url.getHost().replace('.fotoware.cloud', '');
	//log.debug(`site:${toStr(site)}`);

	//log.debug(`sites:${toStr(sites)}`);
	const {
		archiveName,
		clientId,
		clientSecret,
		remoteAddresses,
		url: hostname,
		imports
	} = sitesConfigs[site];
	//log.debug(`clientId:${toStr(clientId)}`);
	//log.debug(`clientSecret:${toStr(clientSecret)}`);
	//log.debug(`remoteAddresses:${toStr(remoteAddresses)}`);
	if (!Object.keys(remoteAddresses).includes(remoteAddress)) {
		log.error(`Illegal remoteaddress in request! ${toStr(request)}`);
		return {status: 404};
	}

	const {accessToken} = getAccessToken({
		hostname,
		clientId,
		clientSecret
	});
	//log.debug(`accessToken:${toStr(accessToken)}`);

	const {
		searchURL,
		renditionRequest
	} = getPrivateFullAPIDescriptor({
		accessToken,
		hostname
	});
	//log.debug(`searchURL:${toStr(searchURL)}`);
	//log.debug(`renditionRequest:${toStr(renditionRequest)}`);

	Object.keys(imports).forEach((importName) => {
		const {
			project,
			path,
			query,
			rendition
		} = imports[importName];
		runInContext({
			repository: `com.enonic.cms.${project}`,
			branch: 'draft',
			user: {
				login: 'su', // So Livetrace Tasks reports correct user
				idProvider: 'system'
			},
			principals: ['role:system.admin']
		}, () => submit({
			description: '',
			task: () => {
				const mediaPath = `/${path}/${filename}`;
				const exisitingMedia = getContentByKey({key: mediaPath});
				if (!exisitingMedia) {
					log.error(`mediaPath:${mediaPath} not found! Perhaps missed assetIngested, or assetDeleted arrived before assetModified.`);
				}

				const queryResult = doQuery({
					accessToken,
					blacklistedCollections: {}, // NOTE Intentional hardcode
					hostname,
					q: `(${query})AND(fn:${filename})`,
					searchURL,
					whitelistedCollections: { // NOTE Intentional hardcode
						[archiveName]: true
					}
				});
				//log.info(`queryResult:${toStr(queryResult)}`);

				const {
					assetCountTotal,
					collections
				} = queryResult;

				if (assetCountTotal === 0) {
					log.warning(`filename:${filename} not found when querying!`);
				} else if (assetCountTotal > 1) {
					log.error(`Querying for filename:${filename} returned more than one asset!`);
				} else {
					const {
						//doctype,
						filename: filenameFromQuery, // Should match or query is weird
						//filesize,
						//href,
						metadata,
						//metadataObj,
						//renditionHref
						renditions
					} = collections[0].assets[0];
					//log.info(`filenameFromQuery:${toStr(filenameFromQuery)}`);
					//log.info(`metadata:${toStr(metadata)}`);
					if (filename !== filenameFromQuery) {
						throw new Error(`filename:${filename} from assetModified does not match filename:${filenameFromQuery} from query result`);
					}
					const renditionsObj = {};
					renditions.forEach(({
						//default,
						//description,
						display_name,
						//height,
						href: aRenditionHref//,
						//original,
						//profile,
						//sizeFixed,
						//width
					}) => {
						//log.debug(`display_name:${display_name} href:${href} height:${height} width:${width}`);
						renditionsObj[display_name] = aRenditionHref;
					});
					//log.debug(`renditionsObj:${toStr(renditionsObj)}`);

					const renditionUrl = renditionsObj[rendition] || renditionsObj['Original File'];

					const downloadRenditionResponse = requestRendition({
						accessToken,
						hostname: url,
						renditionServiceShortAbsolutePath: renditionRequest,
						renditionUrl
					});
					if (!downloadRenditionResponse) {
						throw new Error(`Something went wrong when downloading rendition for renditionUrl:${renditionUrl}!`);
					}
					const md5sumOfDownload = md5(readText(downloadRenditionResponse.bodyStream));
					//log.info(`md5sumOfDownload:${toStr(md5sumOfDownload)}`);

					if (!exisitingMedia) {
						const createMediaResult = createMedia({
							parentPath: `/${path}`,
							name: filename,
							data: downloadRenditionResponse.bodyStream
						});
						if (!createMediaResult) {
							const errMsg = `Something went wrong when creating mediaPath:${mediaPath}!`;
							log.error(errMsg);
							throw new Error(errMsg);
						}
						modifyMediaContent({
							exisitingMediaContent: createMediaResult,
							key: mediaPath,
							md5sum: md5sumOfDownload,
							mediaPath,
							metadata
						});
					} else { // Media already exist
						const {
							x: {
								[X_APP_NAME]: {
									'fotoWare': {
										'md5sum': md5sumFromXdata
									} = {}
								} = {}
							} = {}
						} = exisitingMedia;
						const md5sumOfExisitingMediaContent = md5sumFromXdata || md5(readText(getAttachmentStream({
							key: mediaPath,
							name: filename
						})));
						//log.info(`md5sumOfExisitingMediaContent:${toStr(md5sumOfExisitingMediaContent)}`);
						if (md5sumOfDownload !== md5sumOfExisitingMediaContent) {
							log.debug(`mediaPath:${mediaPath} md5sumOfDownload:${md5sumOfDownload} !== md5sumOfExisitingMediaContent:${md5sumOfExisitingMediaContent} :(`);
							// TODO Modify attachment
							try {
								addAttachment({
									key: mediaPath,
									//mimeType: doctype, // 'image' is a invalid mimetype
									name: filename,
									data: downloadRenditionResponse.bodyStream
								});
							} catch (e) {
								// Just to see what happens if you try to add an attachment that already exists
								log.error(e);
								log.error(e.class.name);
								log.error(e.message);
								removeAttachment({
									key: mediaPath,
									name: filename
								});
								// NOTE re-add old attachment with old name? nah, that information is in versions
								addAttachment({
									key: mediaPath,
									//mimeType: doctype, // 'image' is a invalid mimetype
									name: filename,
									data: downloadRenditionResponse.bodyStream
								});
							}
						} else {
							log.debug(`mediaPath:${mediaPath} md5sumOfDownload:${md5sumOfDownload} === md5sumOfExisitingMediaContent:${md5sumOfExisitingMediaContent} :)`);
						}

						const maybeModifiedMediaContent = addMetadataToContent({
							md5sum: md5sumOfDownload,
							metadata,
							content: JSON.parse(JSON.stringify(exisitingMedia))
						});
						//log.info(`maybeModifiedMediaContent:${toStr(maybeModifiedMediaContent)}`);

						if (!deepEqual(exisitingMedia, maybeModifiedMediaContent)) {
							const differences = diff(exisitingMedia, maybeModifiedMediaContent);
							log.debug(`mediaPath:${mediaPath} differences:${toStr(differences)}`);
							modifyMediaContent({
								exisitingMediaContent: exisitingMedia,
								key: mediaPath,
								md5sum: md5sumOfDownload,
								mediaPath,
								metadata
							});
						} /*else {
							log.debug(`mediaPath:${mediaPath} no differences :)`);
						}*/
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
					}
				} // if assetCountTotal
			} // task
		})); // runInContext
	}); // forEach import
	return {
		body: {},
		contentType: 'application/json;charset=utf-8'
	};
}; // post
