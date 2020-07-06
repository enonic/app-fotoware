//import {JWT} from 'jose';
//import {verify} from 'jsonwebtoken';

import {toStr} from '/lib/util';
import {submit} from '/lib/xp/task';
import {request} from '/lib/http-client';
import {
	//base64Encode,
	base64UrlDecode
} from '/lib/text-encoding';
import {readText} from '/lib/xp/io';

//log.info(`app.config:${toStr(app.config)}`);
const {
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
		//log.info(`tokenRequestParams:${toStr(tokenRequestParams)}`);
		const tokenResponse = request(tokenRequestParams);
		//log.info(`tokenResponse:${toStr(tokenResponse)}`);
		const {
			body,
			cookies,
			//contentType, // application/json
			//headers
			//message,
			status
		} = tokenResponse;
		log.info(`cookies:${toStr(cookies)}`);
		if (status !== 200) {
			throw new Error(`Status !== 200 response:${toStr(tokenResponse)}`);
		}
		let obj;
		try {
			obj = JSON.parse(body);
		} catch (e) {
			throw new Error(`Something went wrong when trying to JSON parse the response body! response:${toStr(tokenResponse)}`);
		}
		const {
			access_token: accessToken//,
			//expires_in, // Number of seconds after which the token is expected to expire.
			//refresh_token//,
			//token_type: tokenType // bearer
		} = obj;

		const jwt = decodeAccessToken(accessToken);
		log.info(`jwt:${toStr(jwt)}`);
		const {
			payload: {
				iss//, //Contains the api url
				//jti
			}
		} = jwt;
		//log.info(`jti:${toStr(jti)}`);

		const archiveRequestParams = {
			contentType: 'application/json',
			method: 'GET',
			headers: {
				Accept: 'application/vnd.fotoware.assetlist+json',
				Authentication: `Bearer ${accessToken}` // 401
				//Authentication: `${tokenType} ${accessToken}` // 401
				//Authentication: `Bearer ${jti}` // 401?
				//Authentication: `${tokenType} ${jti}` // 401?
				//FWAPIToken: accessToken // 500 Internal Server Error
			},
			params: {
				//access_token: accessToken // 401
				//access_token: jti // 401
			},
			url: `${iss}archives/5000/`
		};
		log.info(`archiveRequestParams:${toStr(archiveRequestParams)}`);
		const archiveResponse = request(archiveRequestParams);
		log.info(`archiveResponse:${toStr(archiveResponse)}`);
	} // task
}); // submit
