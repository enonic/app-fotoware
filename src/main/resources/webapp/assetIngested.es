// Node modules
import {diff} from 'deep-object-diff';

import deepEqual from 'fast-deep-equal';


// Enonic modules
//import {schedule, unschedule} from '/lib/cron';
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
import {
	submit//,
	//submitNamed
} from '/lib/xp/task';

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
import {queryForFilename} from '/lib/fotoware/xp/queryForFilename';


//const CRON_DELAY = 1000 * 60; // A minute in milliseconds


export const assetIngested = (request) => {
	log.info(`request:${toStr(request)}`);

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

	const {sitesConfigs} = getConfigFromAppCfg();
	//log.debug(`sitesConfigs:${toStr(sitesConfigs)}`);

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

	/*submitNamed({
		name: 'assetIngested',
		config: {
			archiveName,
			clientId,
			clientSecret,
			filename,
			hostname,
			imports,
			url
		} // config
	}); // submitNamed*/

	/*
	// This probably need to be totally unique, so that only once can run at a time.
	const CRON_TASK_NAME = `assetIngested_${filename}`;

	schedule({
		name: CRON_TASK_NAME,
		delay: CRON_DELAY,

		// Even though we only run once this parameter is required, or you get
		// ERROR c.e.x.p.i.e.ExceptionRendererImpl - Job cron or fixedDelay bigger then `0` must be set, but not both.
		fixedDelay: 1000 * 60, // A minute in milliseconds.

		times: 1, // Run once
		callback: () => {*/

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
		runInContext(
			{
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

					const contentQueryResult = queryForFilename({filename});
					let exisitingMediaContent;
					if (contentQueryResult.total === 0) {
						// Even though no media has been found tagged with filename, older versions of the integration might have synced the file already...
						exisitingMediaContent = getContentByKey({key: mediaPath});
					} else if (contentQueryResult.total === 1) {
						exisitingMediaContent = contentQueryResult.hits[0];
					} else if (contentQueryResult.total > 1) {
						log.error(`Found more than one content with FotoWare filename:${filename} ids:${contentQueryResult.hits.map(({_id}) => _id).join(', ')}`);
						exisitingMediaContent = -1;
					}

					if (exisitingMediaContent) {
						log.error(`mediaPath:${mediaPath} found! Perhaps missed assetDeleted.`);
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
					//log.debug(`queryResult:${toStr(queryResult)}`);
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
							filename: filenameFromQuery, // Should match or query is weird
							//filesize,
							//href,
							metadata,
							//metadataObj,
							//renditionHref
							renditions
						} = collections[0].assets[0];
						if (filename !== filenameFromQuery) {
							throw new Error(`filename:${filename} from assetIngested does not match filename:${filenameFromQuery} from query result`);
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
							//log.debug(`display_name:${display_name} aRenditionHref:${aRenditionHref} height:${height} width:${width}`);
							renditionsObj[display_name] = aRenditionHref;
						});
						//log.debug(`renditionsObj:${toStr(renditionsObj)}`);

						const renditionUrl = renditionsObj[rendition] || renditionsObj['Original File'];

						const downloadRenditionResponse = requestRendition({
							accessToken,
							hostname,
							renditionServiceShortAbsolutePath: renditionRequest,
							renditionUrl
						});
						if (!downloadRenditionResponse) {
							throw new Error(`Something went wrong when downloading rendition for renditionUrl:${renditionUrl}!`);
						}
						const md5sumOfDownload = md5(readText(downloadRenditionResponse.bodyStream));
						if (exisitingMediaContent === -1) {
							// no-op
						} else if (!exisitingMediaContent) {
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
								mediaName: filename,
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
							} = exisitingMediaContent;
							const md5sumOfExisitingMediaContent = md5sumFromXdata || md5(readText(getAttachmentStream({
								key: mediaPath,
								name: filename
							})));
							if (md5sumOfDownload !== md5sumOfExisitingMediaContent) {
								log.debug(`mediaPath:${mediaPath} md5sumOfDownload:${md5sumOfDownload} !== md5sumOfExisitingMediaContent:${md5sumOfExisitingMediaContent} :(`);
								// TODO Modify attachment
								try {
									addAttachment({
										key: mediaPath,
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
								content: JSON.parse(JSON.stringify(exisitingMediaContent))
							});
							if (!deepEqual(exisitingMediaContent, maybeModifiedMediaContent)) {
								const differences = diff(exisitingMediaContent, maybeModifiedMediaContent);
								log.debug(`mediaPath:${mediaPath} differences:${toStr(differences)}`);
								modifyMediaContent({
									exisitingMediaContent,
									key: mediaPath,
									md5sum: md5sumOfDownload,
									mediaName: filename,
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
					}
				} // task
			}) // submit
		); // runInContext
	}); // forEach
	//unschedule({name: CRON_TASK_NAME});
	//} // callback
	//context: // I set this inside the callback
	//}); // schedule

	return {
		body: {},
		contentType: 'application/json;charset=utf-8'
	};
};
