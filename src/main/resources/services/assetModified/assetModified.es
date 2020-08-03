import getIn from 'get-value';

import {URL} from '/lib/galimatias';
import {toStr} from '/lib/util';
import {sanitize} from '/lib/xp/common';
import {query as queryContent} from '/lib/xp/content';
import {
	//get as getContext,
	run as runInContext
} from '/lib/xp/context';
import {getSite as getCurrentSite} from '/lib/xp/portal';
import {
	progress,
	submit
} from '/lib/xp/task';

import {getAccessToken} from '/lib/fotoweb/getAccessToken';
import {getPrivateFullAPIDescriptor} from '/lib/fotoweb/getPrivateFullAPIDescriptor';

import {handleAsset} from '/lib/fotoweb/asset/handle';

import {getCollection} from '/lib/fotoweb/collection/get';

import {getMetadataView} from '/lib/fotoweb/metadata/get';

import {createOrModifyCollection} from '/lib/fotoweb/xp/createOrModifyCollection';
import {deepen} from '/lib/fotoweb/xp/deepen';
import {getConfigFromArchiveContent} from '/lib/fotoweb/xp/getConfigFromArchiveContent';
import {sanitizePath} from '/lib/fotoweb/xp/sanitizePath';

export const post = (request) => {
	//log.info(`request:${toStr(request)}`);
	const {repositoryId: repository} = request;

	/*const context = getContext();
	log.info(`context:${toStr(context)}`);
	const {repository} = context;*/
	//log.info(`repository:${toStr(repository)}`);

	const currentSite = getCurrentSite();
	//log.info(`currentSite:${toStr(currentSite)}`);

	const {
		headers: {
			'User-Agent': userAgent
		},
		remoteAddress
	} = request;
	//log.info(`remoteAddress:${toStr(remoteAddress)}`);
	//log.info(`userAgent:${toStr(userAgent)}`);

	if (userAgent !== 'FotoWeb/8.0') {
		log.error(`Illegal userAgent in request! ${toStr(request)}`);
		return {status: 404};
	}

	let body;
	try {
		body = JSON.parse(request.body);
		//log.info(`body:${toStr(body)}`);
	} catch (e) {
		log.error(`Something went wrong when trying to parse request body ${toStr(request)}`);
		return {status: 404};
	}

	const {
		href, // FQDN
		data: {
			archiveHREF,
			doctype,
			filename,
			filesize,
			metadata,
			renditions
		}
	} = body;
	//log.info(`href:${toStr(href)}`);

	const url = new URL(href);
	const base = `${url.getScheme()}://${url.getHost()}`;
	//log.info(`base:${toStr(base)}`);

	const config = deepen(app.config);
	const sites = getIn(config, 'fotoware.sites', {});
	//log.info(`sites:${toStr(sites)}`);
	const {
		clientId,
		clientSecret,
		remoteAddresses
	} = sites[base];
	//log.info(`clientId:${toStr(clientId)}`);
	//log.info(`clientSecret:${toStr(clientSecret)}`);
	//log.info(`remoteAddresses:${toStr(remoteAddresses)}`);
	if (!Object.keys(remoteAddresses).includes(remoteAddress)) {
		log.error(`Illegal remoteaddress in request! ${toStr(request)}`);
		return {status: 404};
	}

	submit({
		description: '',
		task: () => {
			const stateObj = {
				allFilesCount: 0,
				includedFilesCount: 0,
				syncedThisTimeFilesCount: 0,
				allFilesSize: 0,
				includedFilesSize: 0,
				syncedThisTimeFilesSize: 0
			};
			const progressObj = {
				current: 0, // No items has been processed yet
				info: 'Initializing FotoWeb Intergration Task',
				total: 1 // So it looks like there is something to do.
			};
			progress(progressObj);
			progressObj.current += 1; // Finished initializing
			progressObj.total += 1;

			runInContext({
				repository,
				branch: 'master',
				user: {
					login: 'su',
					idProvider: 'system'
				},
				principals: ['role:system.admin']
			}, () => {
				const queryContentParams = {
					contentTypes: ['com.enonic.app.fotoware:archive'],
					count: 1,
					query: `_path LIKE '/content${currentSite._path}/*' AND data.hostname = '${base}'`
					//query: `(_path LIKE '${currentSite._path}/*') AND (data.hostname = '${base}')`
				};
				//log.info(`queryContentParams:${toStr(queryContentParams)}`);
				const queryContentRes = queryContent(queryContentParams);
				//log.info(`queryContentRes:${toStr(queryContentRes)}`);

				if (queryContentRes.total !== 1) {
					throw new Error(`Unable to determine archive queryContentParams:${toStr(queryContentParams)}`);
				}
				const privateFolderPath = queryContentRes.hits[0]._path;
				//log.info(`privateFolderPath:${toStr(privateFolderPath)}`);

				const {
					selectedDocTypes,
					selectedExtensions
				} = getConfigFromArchiveContent({
					archiveContentId: queryContentRes.hits[0]._id
				});

				const {accessToken} = getAccessToken({
					hostname: base,
					clientId,
					clientSecret
				});

				const {
					renditionRequest
				} = getPrivateFullAPIDescriptor({
					accessToken,
					hostname: base
				});

				const {
					name: collectionName,
					metadataEditor: {
						href: metadataHref
					}
				} =	getCollection({
					accessToken,
					hostname: base,
					shortAbsolutePath: archiveHREF
				});

				const fields = {};
				getMetadataView({
					accessToken,
					fields,
					hostname: base,
					shortAbsolutePath: metadataHref
				});

				const collectionContentPath = sanitizePath(decodeURIComponent(archiveHREF).replace('/fotoweb/archives', privateFolderPath).replace(/\/$/, ''));
				const collectionContentParentPath = collectionContentPath.replace(/\/[^/]+$/, '');
				const collectionContentName = sanitize(collectionContentPath.replace(/^.*\//, ''));
				runInContext({
					repository,
					branch: 'draft',
					user: {
						login: 'su',
						idProvider: 'system'
					},
					principals: ['role:system.admin']
				}, () => {
					createOrModifyCollection({
						parentPath: collectionContentParentPath,
						name: collectionContentName,
						displayName: collectionName
					});

					handleAsset({
						accessToken,
						asset: {
							doctype,
							filename,
							filesize,
							metadata,
							renditions
						},
						collectionContentPath,
						collectionName,
						fields,
						hostname: base,
						progressObj,
						renditionRequest,
						selectedDocTypes,
						selectedExtensions,
						stateObj
					});
				}); // run in draft master as system.admin
			}); // run in branch master as system.admin

			progressObj.info = 'Finished modifying asset :)';
			progress(progressObj);
		} // task
	}); // submit
	return {
		body: {},
		contentType: 'application/json;charset=utf-8'
	};
}; // post
