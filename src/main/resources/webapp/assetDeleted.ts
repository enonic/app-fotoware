import type {
	MediaContent,
	Request
} from '/lib/fotoware';


// Polyfills
//import '@enonic/global-polyfill'; // Required by reflect-metadata

// The reflect-metadata polyfill should be imported only once in your entire application because the Reflect object is meant to be a global singleton.
// More details about this can be found here. (https://github.com/inversify/InversifyJS/issues/262#issuecomment-227593844)
//import 'reflect-metadata'; // Required by set-value

// Node modules
import {
	arrayIncludes,
	isString,
	toStr
} from '@enonic/js-utils';
//import {diff} from 'deep-object-diff';

//import * as deepEqual from 'fast-deep-equal';
//import deepEqual from 'fast-deep-equal';

//import * as setIn from 'set-value'; // Requires reflect-metadata

// @ts-expect-error TS7016: Could not find a declaration file for module 'dot2val'
import {set as setIn} from 'dot2val';

// Type originates at this import. A namespace-style import cannot be called or constructed, and will cause a failure at runtime. Consider using a default import or import require here instead.
//import * as traverse from 'traverse';
import traverse from 'traverse';

// Enonic modules
// @ts-expect-error TS2307: Cannot find module '/lib/galimatias' or its corresponding type declarations
import {URL} from '/lib/galimatias';
// @ts-expect-error TS2307: Cannot find module '/lib/license' or its corresponding type declarations
import {validateLicense} from '/lib/license';
//import {md5} from '/lib/text-encoding';
import {
	delete as deleteContent,
	get as getContentByKey,
	publish,
	query as queryContent
} from '/lib/xp/content';
import {run as runInContext} from '/lib/xp/context';
//import {readText} from '/lib/xp/io';
import {executeFunction} from '/lib/xp/task';

// FotoWare modules
import {getAccessToken} from '/lib/fotoware/api/getAccessToken';
import {getPrivateFullAPIDescriptor} from '/lib/fotoware/api/getPrivateFullAPIDescriptor';
import {query as doQuery} from '/lib/fotoware/api/query';
import {SUPPORTED_USERAGENTS} from '/lib/fotoware/constants';
import {getConfigFromAppCfg} from '/lib/fotoware/xp/getConfigFromAppCfg';
import {isPublished} from '/lib/fotoware/xp/isPublished';
import {queryForFilename} from '/lib/fotoware/xp/queryForFilename';


export const assetDeleted = (request: Request) => {
	//log.info(`request:${toStr(request)}`);

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
		href, // FQDN
		data: {
			filename
		}
	} = body;
	//log.debug(`href:${toStr(href)}`);
	//log.debug(`filename:${toStr(filename)}`);

	if (filename.startsWith('.')) {
		log.warning(`Skipping filename:${filename} because it starts with a dot, so probabbly a hidden file.`);
		return {
			body: {},
			contentType: 'application/json;charset=utf-8'
		};
	}

	const url = new URL(href);
	const site = url.getHost().replace('.fotoware.cloud', '');
	//log.debug(`site:${toStr(site)}`);

	const {sitesConfigs} = getConfigFromAppCfg();
	//log.debug(`sitesConfigs:${toStr(sitesConfigs)}`);

	const siteConfig = sitesConfigs[site];

	if (!siteConfig) {
		log.error(`No siteConfig for site:${site}!`);
		return {status: 404};
	}

	const {
		archiveName,
		clientId,
		clientSecret,
		remoteAddresses,
		url: hostname,
		imports
	} = siteConfig;
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
		searchURL//,
		//renditionRequest
	} = getPrivateFullAPIDescriptor({
		accessToken,
		hostname
	});
	//log.debug(`searchURL:${toStr(searchURL)}`);
	//log.debug(`renditionRequest:${toStr(renditionRequest)}`);

	Object.keys(imports).forEach((importName) => {
		const anImport = imports[importName];
		if (!anImport) {
			log.error(`No import for importName:${importName} site:${site}!`);
			return {status: 404};
		}
		const {
			project,
			path,
			query//,
			//rendition
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
					let exisitingMediaContent: MediaContent | -1 | null | undefined;
					if (contentQueryResult.total === 0) {
						// Even though no media has been found tagged with filename, older versions of the integration might have synced the file already...
						exisitingMediaContent = getContentByKey<MediaContent>({key: `/${path}/${filename}`});
					} else if (contentQueryResult.total === 1) {
						exisitingMediaContent = contentQueryResult.hits[0];
					} else if (contentQueryResult.total > 1) {
						log.error(`Found more than one content with FotoWare filename:${filename} ids:${contentQueryResult.hits.map(({_id}) => _id).join(', ')}`);
						exisitingMediaContent = -1;
					}


					if (exisitingMediaContent === -1) {
						// no-op
					} else if (!exisitingMediaContent) {
						log.error(`path:${path} name:${filename} not found! Perhaps deleted manually.`);
					} else {
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
							assetCountTotal//,
							//collections
						} = queryResult;

						if (assetCountTotal === 0) {
							log.info(`filename:${filename} not found when querying :) Maybe delete.`);
							//log.debug(`exisitingMedia._id:${toStr(exisitingMedia._id)}`);

							const queryContentParams = {
								//count: 1, // DEBUG
								count: -1,
								query: `_references = '${exisitingMediaContent._id}'`
							};
							//log.debug(`queryContentParams:${toStr(queryContentParams)}`);

							const queryContentRes = queryContent<MediaContent>(queryContentParams);
							//log.debug(`queryContentRes:${toStr(queryContentRes)}`);

							queryContentRes.hits = queryContentRes.hits.map(({
								_id,
								_path,
								type,
								...rest
							}) => {
								const obj = {
									_id,
									_path,
									type
								};
								traverse(rest).forEach(function(value: unknown) { // Fat arrow destroys this
									//const key = this.key;
									const path = this.path;//.join('.');
									//log.debug(`path:${toStr(path)} value:${toStr(value)}`);
									if (Array.isArray(value) || isString(value)) {
										if (value.includes((exisitingMediaContent as MediaContent)._id)) {
											setIn(obj, path, value);
										}
									}
								});
								return obj as MediaContent;
							});
							log.debug(`queryContentRes:${toStr(queryContentRes)}`);

							if (queryContentRes.total === 0) {
								log.info(`No reference to exisitingMedia._id:${exisitingMediaContent._id} found. Going ahead with delete :)`);
								const deleteContentRes = deleteContent({key: exisitingMediaContent._id});
								if (deleteContentRes) {
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
								} else {
									log.error(`Something went wrong while trying to delete ${exisitingMediaContent._id}`);
								}
							} else {
								log.warning(`${queryContentRes.total} reference(s) to exisitingMedia._id:${exisitingMediaContent._id} found! Skipping delete.`);
							}

						} else if (assetCountTotal > 1) {
							log.error(`Querying for filename:${filename} returned more than one asset! Skipping delete!`);
						} else {
							log.warning(`filename:${filename} found when querying! Skipping delete!`);
						}
					} // else exisitingMedia
				} // task
			}) // executeFunction
		); // runInContext
	}); // forEach

	return {
		body: {},
		contentType: 'application/json;charset=utf-8'
	};
};
