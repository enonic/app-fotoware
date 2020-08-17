import {getAccessToken} from '/lib/fotoware/api/getAccessToken';
import {getPrivateFullAPIDescriptor} from '/lib/fotoware/api/getPrivateFullAPIDescriptor';
import {query} from '/lib/fotoware/api/query';
import {requestRendition} from '/lib/fotoware/api/requestRendition';
import {getConfigFromAppCfg} from '/lib/fotoware/xp/getConfigFromAppCfg';
import {URL} from '/lib/galimatias';
import {toStr} from '/lib/util';
import {sanitize} from '/lib/xp/common';
import {
	createMedia,
	delete as deleteContent,
	get as getContentByKey,
	modify as modifyContent//,
	//query as queryContent
} from '/lib/xp/content';
import {
	//get as getContext,
	run as runInContext
} from '/lib/xp/context';
import {
	//progress,
	submit
} from '/lib/xp/task';

const X_APP_NAME = sanitize(app.name).replace(/\./g, '-');

export const post = (request) => {
	//log.debug(`request:${toStr(request)}`);

	const sitesConfigs = getConfigFromAppCfg();
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
		href, // FQDN
		data: {
			//archiveHREF,
			//doctype,
			filename//,
			//filesize,
			//metadata,
			//renditions
		}
	} = body;
	//log.debug(`href:${toStr(href)}`);
	//log.debug(`archiveHREF:${toStr(archiveHREF)}`);
	//log.debug(`doctype:${toStr(doctype)}`);
	//log.debug(`filename:${toStr(filename)}`);
	//log.debug(`filesize:${toStr(filesize)}`);
	//log.debug(`metadata:${toStr(metadata)}`);
	//log.debug(`renditions:${toStr(renditions)}`);

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

	//log.debug(`sites:${toStr(sites)}`);
	const {
		clientId,
		clientSecret,
		docTypes,
		path,
		project,
		remoteAddresses,
		url: hostname
	} = sitesConfigs[site];
	//log.debug(`clientId:${toStr(clientId)}`);
	//log.debug(`clientSecret:${toStr(clientSecret)}`);
	//log.debug(`remoteAddresses:${toStr(remoteAddresses)}`);
	if (!Object.keys(remoteAddresses).includes(remoteAddress)) {
		log.error(`Illegal remoteaddress in request! ${toStr(request)}`);
		return {status: 404};
	}

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

			const queryResult = query({
				accessToken,
				blacklistedCollections: {}, // NOTE Intentional hardcode
				hostname,
				q: filename,
				searchURL,
				whitelistedCollections: { // NOTE Intentional hardcode
					'5000-Archive': true
				}
			});
			//log.debug(`queryResult:${toStr(queryResult)}`);

			const {
				assetCountTotal,
				collections
			} = queryResult;

			if (assetCountTotal === 0) {
				log.error(`filename:${filename} not found when querying!`);
			} else if (assetCountTotal > 1) {
				log.error(`Querying for filename:${filename} returned more than one asset!`);
			} else {
				const {
					doctype,
					filename: filenameFromQuery, // Should match or query is weird
					//filesize,
					//href,
					metadataObj,
					renditionHref
				} = collections[0].assets[0];
				if (filename !== filenameFromQuery) {
					throw new Error(`filename:${filename} from assetModified does not match filename:${filenameFromQuery} from query result`);
				}
				if (!docTypes[doctype]) {
					log.warning(`Skipping filename:${filename} because it's doctype:${doctype} is not included.`);
				} else {
					const downloadRenditionResponse = requestRendition({
						accessToken,
						hostname: url,
						renditionServiceShortAbsolutePath: renditionRequest,
						renditionUrl: renditionHref
					});
					if (!downloadRenditionResponse) {
						throw new Error(`Something went wrong when downloading rendition for renditionHref:${renditionHref}!`);
					}
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
					}
					try {
						modifyContent({
							key: mediaPath,
							editor: (content) => {
								//log.debug(`content:${toStr(content)}`);
								content.x[X_APP_NAME] = {
									fotoWare: {
										metadata: metadataObj
									}
								}; // eslint-disable-line no-param-reassign
								//log.debug(`modified content:${toStr(content)}`);
								return content;
							}, // editor
							requireValid: false // May contain extra undefined x-data
						}); // modifyContent
					} catch (e) {
						if (e.class.name === 'com.enonic.xp.data.ValueTypeException') {
							// Known problem on psd, svg, ai, jpf, pdf
							log.error(`Unable to modify ${exisitingMedia._name}`);
							deleteContent({ // So it will be retried on next sync
								key: mediaPath
							});
						} else {
							log.error(`Something unkown went wrong when trying to modifyContent exisitingMedia:${toStr(exisitingMedia)}`);
							log.error(`metadataObj:${toStr(metadataObj)}`);
							log.error(e); // com.enonic.xp.data.ValueTypeException: Value of type [com.enonic.xp.data.PropertySet] cannot be converted to [Reference]
							//log.error(e.class.name); // com.enonic.xp.data.ValueTypeException
							//log.error(e.message); // Value of type [com.enonic.xp.data.PropertySet] cannot be converted to [Reference]
							deleteContent({ // So it will be retried on next sync
								key: mediaPath
							});
							throw(e); // NOTE Only known way to get stacktrace
						}
					}
				}
			} // if assetCountTotal
		} // task
	})); // submit
	return {
		body: {},
		contentType: 'application/json;charset=utf-8'
	};
}; // post
