// import type {SiteConfig} from '/lib/fotoware/xp/AppConfig';
import type { MediaContent } from '/lib/fotoware/xp/MediaContent';
import type { Request } from '/lib/fotoware';
import type { ByteSource } from '/lib/xp/io';
import type { Asset } from '/types';
import type { CollectionObj } from '/lib/fotoware/api/query';


// Node modules
import {
	arrayIncludes,
	toStr
} from '@enonic/js-utils';
import {detailedDiff} from 'deep-object-diff';
import deepEqual from 'fast-deep-equal';


// Enonic modules
//import {schedule, unschedule} from '/lib/cron';
import {SUPPORTED_USERAGENTS} from '/lib/fotoware/constants';
import {updateMedia} from '/lib/fotoware/content';
//@ts-ignore
import {URL} from '/lib/galimatias';
//@ts-ignore
import {validateLicense} from '/lib/license';
//@ts-ignore
import {md5} from '/lib/text-encoding';
import {
	createMedia,
	get as getContentByKey,
	getAttachmentStream,
	publish
} from '/lib/xp/content';
import {run as runInContext} from '/lib/xp/context';
import {getMimeType, readText} from '/lib/xp/io';
import {
	executeFunction//,
	//submitTask
} from '/lib/xp/task';

// FotoWare modules
import {getAccessToken} from '/lib/fotoware/api/getAccessToken';
// import {getArtist} from '/lib/fotoware/asset/metadata/getArtist';
// import {getCopyright} from '/lib/fotoware/asset/metadata/getCopyright';
// import {getTags} from '/lib/fotoware/asset/metadata/getTags';
import {getPrivateFullAPIDescriptor} from '/lib/fotoware/api/getPrivateFullAPIDescriptor';
import {query as doQuery} from '/lib/fotoware/api/query';
import {requestRendition} from '/lib/fotoware/api/requestRendition';
import {updateMetadataOnContent} from '/lib/fotoware/xp/updateMetadataOnContent';
import {getConfigFromAppCfg} from '/lib/fotoware/xp/getConfigFromAppCfg';
import {modifyMediaContent} from '/lib/fotoware/xp/modifyMediaContent';
import {isPublished} from '/lib/fotoware/xp/isPublished';
import {queryForFilename} from '/lib/fotoware/xp/queryForFilename';


//const CRON_DELAY = 1000 * 60; // A minute in milliseconds


export const assetIngested = (request: Request) => {
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

	if (!request.body) {
		log.error(`No body in request! ${toStr(request)}`);
		return {status: 404};
	}

	const {
		headers: {
			'User-Agent': userAgent
		} = {},
		remoteAddress
	} = request;
	//log.debug(`remoteAddress:${toStr(remoteAddress)}`);
	//log.debug(`userAgent:${toStr(userAgent)}`);

	if (!remoteAddress) {
		log.error(`No remoteAddress in request! ${toStr(request)}`);
		return {status: 404};
	}

	if (!userAgent) {
		log.error(`No userAgent in request! ${toStr(request)}`);
		return {status: 404};
	}

	if (!arrayIncludes(SUPPORTED_USERAGENTS, userAgent)) {
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
	const site = url.getHost().replace('.fotoware.cloud', '') as string;
	//log.debug(`site:${toStr(site)}`);

	const {sitesConfigs} = getConfigFromAppCfg();
	//log.debug(`sitesConfigs:${toStr(sitesConfigs)}`);

	const siteConfig = sitesConfigs[site];
	if (!siteConfig) {
		throw new Error(`Unable to find site configuration for site:${site}`);
	}

	const {
		archiveName,
		clientId,
		clientSecret,
		properties,
		remoteAddresses,
		url: hostname,
		imports
	} = siteConfig;
	//log.debug(`clientId:${toStr(clientId)}`);
	//log.debug(`clientSecret:${toStr(clientSecret)}`);
	//log.debug(`remoteAddresses:${toStr(remoteAddresses)}`);
	if (!arrayIncludes(Object.keys(remoteAddresses), remoteAddress)) {
		log.error(`Illegal remoteaddress in request! ${toStr(request)}`);
		return {status: 404};
	}

	/*submitTask({
		descriptor: 'assetIngested',
		config: {
			archiveName,
			clientId,
			clientSecret,
			filename,
			hostname,
			imports,
			url
		} // config
	}); // submitTask*/

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
		const anImport = imports[importName];
		if (!anImport) {
			throw new Error(`No import with the name ${importName}!`);
		}
		const {
			project,
			path,
			query,
			rendition
		} = anImport;
		runInContext(
			{
				repository: `com.enonic.cms.${project}`,
				branch: 'draft',
				user: {
					login: 'su', // So Livetrace Tasks reports correct user
					idProvider: 'system'
				},
				principals: ['role:system.admin']
			}, () => executeFunction({
				description: '',
				func: () => {
					const contentQueryResult = queryForFilename({
						filename,
						path
					});
					let exisitingMediaContent: MediaContent|null|undefined|-1;
					if (contentQueryResult.total === 0) {
						// Even though no media has been found tagged with filename, older versions of the integration might have synced the file already...
						exisitingMediaContent = getContentByKey<MediaContent>({key: `/${path}/${filename}`});
					} else if (contentQueryResult.total === 1) {
						exisitingMediaContent = contentQueryResult.hits[0];
					} else if (contentQueryResult.total > 1) {
						log.error(
							'Found more than one content with FotoWare filename:%s ids:%s',
							filename,
							contentQueryResult.hits.map(({_id}) => _id).join(', ')
						);
						exisitingMediaContent = -1;
					}

					if (exisitingMediaContent) {
						log.error(
							'_path:%s found! Perhaps missed assetDeleted?',
							(exisitingMediaContent as MediaContent)._path
						);
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
						if (!collections.length) {
							throw new Error(`No collections found when querying for filename:${filename}!`);
						}
						const {
							filename: filenameFromQuery, // Should match or query is weird
							//filesize,
							//href,
							metadata,
							//metadataObj,
							//renditionHref
							renditions
						} = (collections[0] as CollectionObj).assets[0] as Asset;
						if (filename !== filenameFromQuery) {
							throw new Error(`filename:${filename} from assetIngested does not match filename:${filenameFromQuery} from query result`);
						}
						const renditionsObj: Record<string,string> = {};
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

						const renditionUrl = renditionsObj[rendition] || renditionsObj['Original File'] as string;

						const downloadRenditionResponse = requestRendition({
							accessToken,
							hostname,
							renditionServiceShortAbsolutePath: renditionRequest,
							renditionUrl
						});
						if (!downloadRenditionResponse) {
							throw new Error(`Something went wrong when downloading rendition for renditionUrl:${renditionUrl}!`);
						}
						const md5sumOfDownload = md5(readText(downloadRenditionResponse.bodyStream as ByteSource));
						if (exisitingMediaContent === -1) {
							// no-op
						} else if (!exisitingMediaContent) {
							const parentPath = `/${path}`;
							const createMediaResult = createMedia({
								parentPath,
								name: filename,
								data: downloadRenditionResponse.bodyStream as ByteSource
							});
							if (!createMediaResult) {
								const errMsg = `Something went wrong when creating parentPath:${parentPath} name:${filename}!`;
								log.error(errMsg);
								throw new Error(errMsg);
							}
							modifyMediaContent({
								//exisitingMediaContent: createMediaResult, // No, keep in create mode
								key: createMediaResult._path,
								md5sum: md5sumOfDownload,
								metadata,
								properties
							});
						} else { // Media already exist
							// Perhaps the image was deleted and reuploaded in FotoWare and we missed the assetDeleted hook
							const {
								data: {
									'fotoWare': {
										'md5sum': md5sumFromContent
									} = {}
								} = {}
							} = exisitingMediaContent;

							let md5sumOfExisitingMediaContent = md5sumFromContent;
							if (!md5sumOfExisitingMediaContent) {
								const exisitingMediaContentAttachmentStream = getAttachmentStream({
									key: exisitingMediaContent._path,
									name: filename
								});

								if (exisitingMediaContentAttachmentStream == null) {
									log.error('Unable to getAttachmentStream({key:%s, name:%s})!', exisitingMediaContent._path, filename);
									throw new Error(`Unable to getAttachmentStream for ${filename}!`);
								}

								md5sumOfExisitingMediaContent = md5(readText(exisitingMediaContentAttachmentStream));
							}

							if (md5sumOfDownload === md5sumOfExisitingMediaContent) {
								log.debug(`_path:${exisitingMediaContent._path} md5sumOfDownload:${md5sumOfDownload} === md5sumOfExisitingMediaContent:${md5sumOfExisitingMediaContent} :)`);
							} else {
								log.debug(`_path:${exisitingMediaContent._path} md5sumOfDownload:${md5sumOfDownload} !== md5sumOfExisitingMediaContent:${md5sumOfExisitingMediaContent} :(`);
								updateMedia({
									// artist: getArtist(metadata) // TODO updateMedia doesn't handle when artist is an array
									// caption
									// copyright: getCopyright(metadata)
									data: downloadRenditionResponse.bodyStream, // Stream with the binary data for the attachment,
									// focalX
									// focalY
									key: exisitingMediaContent._path,
									mimeType: getMimeType(filename),
									name: filename//,
									// tags: getTags(metadata) // TODO updateMedia doesn't handle when tags is an array
								});
							}

							const maybeModifiedMediaContent = updateMetadataOnContent({
								content: JSON.parse(JSON.stringify(exisitingMediaContent)), // deref so exisitingMediaContent can't be modified
								md5sum: md5sumOfDownload,
								metadata,
								modify: true, // TODO shouldn't this be false, since ingest is create and not modify???
								properties
							});

							if (!deepEqual(exisitingMediaContent, maybeModifiedMediaContent)) {
								const differences = detailedDiff(exisitingMediaContent, maybeModifiedMediaContent);
								log.debug(`_path:${exisitingMediaContent._path} differences:${toStr(differences)}`);
								modifyMediaContent({
									exisitingMediaContent,
									key: exisitingMediaContent._path,
									md5sum: md5sumOfDownload,
									metadata,
									properties
								});
							} /*else {
								log.debug(`_path:${exisitingMediaContent._path} no differences :)`);
							}*/

							if (isPublished({
								key: exisitingMediaContent._path,
								project
							})) {
								const publishParams = {
									includeDependencies: false,
									keys:[exisitingMediaContent._path],
									sourceBranch: 'draft',
									targetBranch: 'master'
								};
								//log.debug(`_path:${exisitingMediaContent._path} publishParams:${toStr(publishParams)}`);
								const publishRes = publish(publishParams);
								log.debug(`_path:${exisitingMediaContent._path} publishRes:${toStr(publishRes)}`);
							}
						}
					}
				} // task
			}) // executeFunction
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
