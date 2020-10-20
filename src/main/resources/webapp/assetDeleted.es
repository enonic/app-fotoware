// Node modules
//import {diff} from 'deep-object-diff';
//import deepEqual from 'fast-deep-equal';
import setIn from 'set-value';
import traverse from 'traverse';

// Enonic modules
import {URL} from '/lib/galimatias';
import {validateLicense} from '/lib/license';
//import {md5} from '/lib/text-encoding';
import {toStr} from '/lib/util';
import {isString} from '/lib/util/value';
import {
	//addAttachment,
	//createMedia,
	delete as deleteContent,
	get as getContentByKey,
	//getAttachmentStream,
	publish,
	query as queryContent
	//removeAttachment
} from '/lib/xp/content';
import {run as runInContext} from '/lib/xp/context';
//import {readText} from '/lib/xp/io';
import {submit} from '/lib/xp/task';

// FotoWare modules
import {getAccessToken} from '/lib/fotoware/api/getAccessToken';
import {getPrivateFullAPIDescriptor} from '/lib/fotoware/api/getPrivateFullAPIDescriptor';
import {query as doQuery} from '/lib/fotoware/api/query';
//import {requestRendition} from '/lib/fotoware/api/requestRendition';
//import {addMetadataToContent} from '/lib/fotoware/xp/addMetadataToContent';
//import {X_APP_NAME} from '/lib/fotoware/xp/constants';
import {getConfigFromAppCfg} from '/lib/fotoware/xp/getConfigFromAppCfg';
//import {modifyMediaContent} from '/lib/fotoware/xp/modifyMediaContent';
import {isPublished} from '/lib/fotoware/xp/isPublished';

export const assetDeleted = (request) => {
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

	const {
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
		searchURL//,
		//renditionRequest
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
			query//,
			//rendition
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
					const exisitingMedia = getContentByKey({key: mediaPath});
					if (!exisitingMedia) {
						log.error(`mediaPath:${mediaPath} not found! Perhaps deleted manually.`);
					} else {
						const queryResult = doQuery({
							accessToken,
							blacklistedCollections: {}, // NOTE Intentional hardcode
							hostname,
							q: `(${query})AND(fn:${filename})`,
							searchURL,
							whitelistedCollections: { // NOTE Intentional hardcode
								'5000-Archive': true
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
								query: `_references = '${exisitingMedia._id}'`
							};
							//log.debug(`queryContentParams:${toStr(queryContentParams)}`);

							const queryContentRes = queryContent(queryContentParams);
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
								traverse(rest).forEach(function(value) { // Fat arrow destroys this
									//const key = this.key;
									const path = this.path;//.join('.');
									//log.debug(`path:${toStr(path)} value:${toStr(value)}`);
									if (Array.isArray(value) || isString(value)) {
										if (value.includes(exisitingMedia._id)) {
											setIn(obj, path, value);
										}
									}
								});
								return obj;
							});
							log.debug(`queryContentRes:${toStr(queryContentRes)}`);

							if (queryContentRes.total === 0) {
								log.info(`No reference to exisitingMedia._id:${exisitingMedia._id} found. Going ahead with delete :)`);
								const deleteContentRes = deleteContent({key: exisitingMedia._id});
								if (deleteContentRes) {
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
								} else {
									log.error(`Something went wrong while trying to delete ${exisitingMedia._id}`);
								}
							} else {
								log.warning(`${queryContentRes.total} reference(s) to exisitingMedia._id:${exisitingMedia._id} found! Skipping delete.`);
							}

						} else if (assetCountTotal > 1) {
							log.error(`Querying for filename:${filename} returned more than one asset! Skipping delete!`);
						} else {
							log.warning(`filename:${filename} found when querying! Skipping delete!`);
						}
					} // else exisitingMedia
				} // task
			}) // submit
		); // runInContext
	}); // forEach

	return {
		body: {},
		contentType: 'application/json;charset=utf-8'
	};
};
