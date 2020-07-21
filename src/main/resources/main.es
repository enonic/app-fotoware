import {toStr} from '/lib/util';
import {forceArray} from '/lib/util/data';
import {get as getContent} from '/lib/xp/content';
import {run} from '/lib/xp/context';
import {listener} from '/lib/xp/event';
import {submit} from '/lib/xp/task';

import {syncPublic} from '/lib/fotoweb/syncPublic';

listener({
	type: 'node.*',
	localOnly: true,
	callback: (event) => {
		const {
			data: {
				nodes
			},
			//distributed,
			//localOrigin,
			//timestamp,
			type
		} = event;
		if ([
			//'node.created',
			'node.pushed'//, // Only when a site is published
			//'node.updated',
			//'node.deleted'
		].includes(type)) {
			nodes.forEach((node/*, i*/) => {
				const {
					id,
					//path,
					branch,
					repo
				} = node;
				if (
					branch === 'master' // Have to publish site before sync updates
					&& repo.startsWith('com.enonic.cms.')
				) {
					//log.info(`event:${toStr(event)}`);
					//log.info(`node:${toStr(node)}`);
					const context = {
						repository: repo,
						branch: 'master', // Always syncing to master
						user: {
							login: 'su',
							idProvider: 'system'
						},
						principals: ['role:system.admin']
					};
					//log.info(`context:${toStr(context)}`);
					run(context, () => {
						const content = getContent({key: id});
						//log.info(`content:${toStr(content)}`);
						const {
							data: {
								siteConfig = []
							} = {}
						} = content;
						const siteConfigs = forceArray(siteConfig);
						//log.info(`siteConfigs:${toStr(siteConfigs)}`);
						siteConfigs.forEach(({
							applicationKey,
							config
						}/*, i*/) => {
							if (applicationKey === 'com.enonic.app.fotoware') {
								const {
									archiveOptionSet: {
										_selected: selected = [],
										public: {
											folder: publicFolder // contentId
										} = {},
										private: {
											clientId,
											clientSecret,
											folder: privateFolder // contentId
										} = {}
									} = {},
									baseUrl
								} = config;
								//log.info(`selected:${toStr(selected)}`);
								log.info(`publicFolder:${toStr(publicFolder)}`); // contentId
								log.info(`clientId:${toStr(clientId)}`);
								log.info(`clientSecret:${toStr(clientSecret)}`);
								log.info(`privateFolder:${toStr(privateFolder)}`); // contentId
								//log.info(`baseUrl:${toStr(baseUrl)}`);
								const selectedArr = forceArray(selected);
								if (selectedArr.includes('public') && baseUrl && publicFolder) {
									submit({
										description: '',
										task: () => syncPublic({
											baseUrl,
											folder: publicFolder // contentId
										})
									});
								}
							} // if fotoware app
						}); // siteConfigs.forEach
					}); // context.run
				} // if branch
			}); // nodes.forEach
		} // if type
	} // callback
});

/*
//import {JWT} from 'jose';
//import {verify} from 'jsonwebtoken';

import {request} from '/lib/http-client';
import {
	//base64Encode,
	base64UrlDecode
} from '/lib/text-encoding';
import {readText} from '/lib/xp/io';
import {createMedia} from '/lib/xp/content';

//log.info(`app.config:${toStr(app.config)}`);
const {
	ARCHIVE_URL,
	BASE_URL,
	CLIENT_ID,
	CLIENT_SECRET,
	TOKEN_URL
} = app.config;

function decodeAccessToken(accessToken) {
	//const a = JWT.AccessToken.verify(accessToken);
	//log.info(`a:${toStr(a)}`);
	//const b = verify(accessToken);
	//log.info(`b:${toStr(b)}`);
	const jwtParts = accessToken.split('.').map((base64url) => {
		//log.info(`base64url:${toStr(base64url)}`);
		const stream = base64UrlDecode(base64url);
		const decoded = readText(stream);
		//log.info(`decoded:${toStr(decoded)}`);
		return decoded;
	});
	//log.info(`jwtParts:${toStr(jwtParts)}`);
	const jwt = {
		header: JSON.parse(jwtParts[0]),
		payload: JSON.parse(jwtParts[1]),
		signature: jwtParts[2] // binary :(
	};
	//log.info(`jwt:${toStr(jwt)}`);
	return jwt;
} // function decodeAccessToken

submit({
	description: '',
	task: () => {
		const tokenRequestParams = {
			body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
			contentType: 'application/x-www-form-urlencoded',
			method: 'POST',
			headers: {
				Accept: 'application/json'
			},
			url: TOKEN_URL
		};
		log.info(`tokenRequestParams:${toStr(tokenRequestParams)}`);
		const tokenResponse = request(tokenRequestParams);
		log.info(`tokenResponse:${toStr(tokenResponse)}`);
		const {
			cookies,
			//contentType, // application/json
			//headers
			//message,
			status
		} = tokenResponse;
		//log.info(`cookies:${toStr(cookies)}`);
		if (status !== 200) {
			throw new Error(`Status !== 200 response:${toStr(tokenResponse)}`);
		}
		let tokenResponseObj;
		try {
			tokenResponseObj = JSON.parse(tokenResponse.body);
		} catch (e) {
			throw new Error(`Something went wrong when trying to JSON parse the response body! response:${toStr(tokenResponse)}`);
		}
		const {
			access_token: accessToken//,
			//expires_in, // Number of seconds after which the token is expected to expire.
			//refresh_token//,
			//token_type: tokenType // bearer
		} = tokenResponseObj;

		const jwt = decodeAccessToken(accessToken);
		log.info(`jwt:${toStr(jwt)}`);
		const {
			payload: {
				iss//, //Contains the api url
				//jti
			}
		} = jwt;
		log.info(`iss:${toStr(iss)}`);
		//log.info(`jti:${toStr(jti)}`);

		const archiveRequestParams = {
			contentType: 'application/json',
			method: 'GET',
			headers: {
				//Accept: 'application/vnd.fotoware.assetlist+json', // Part of collection
				//Accept: 'application/vnd.fotoware.collection+json', // Part of collection list
				//Accept: 'application/vnd.fotoware.collectioninfo+json', // Part of collection list
				Accept: 'application/vnd.fotoware.collectionlist+json', // fotoweb/archives and fotoweb/me/archives
				Authentication: `Bearer ${accessToken}`, //
				Cookie: cookies.map(({name, value}) => `${name}=${value}`).join('; ')
				//Authentication: `${tokenType} ${accessToken}` // 401
				//Authentication: `Bearer ${jti}` // 401?
				//Authentication: `${tokenType} ${jti}` // 401?
				//FWAPIToken: accessToken // 500 Internal Server Error
			},
			params: {
				//access_token: accessToken // 401
				//access_token: jti // 401
			},
			url: ARCHIVE_URL
			//url: `${iss}archives/5000/`
		};
		log.info(`archiveRequestParams:${toStr(archiveRequestParams)}`);
		const archiveResponse = request(archiveRequestParams);
		log.info(`archiveResponse:${toStr(archiveResponse)}`);
	} // task
}); // submit
*/
