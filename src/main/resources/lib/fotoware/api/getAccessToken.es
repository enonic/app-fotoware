import {request} from '/lib/http-client';
/*import {
	//base64Encode,
	base64UrlDecode
} from '/lib/text-encoding';*/
import {toStr} from '/lib/util';
//import {readText} from '/lib/xp/io';

/*function decodeAccessToken(accessToken) {
	//const a = JWT.AccessToken.verify(accessToken);
	//log.debug(`a:${toStr(a)}`);
	//const b = verify(accessToken);
	//log.debug(`b:${toStr(b)}`);
	const jwtParts = accessToken.split('.').map((base64url) => {
		//log.debug(`base64url:${toStr(base64url)}`);
		const stream = base64UrlDecode(base64url);
		const decoded = readText(stream);
		//log.debug(`decoded:${toStr(decoded)}`);
		return decoded;
	});
	//log.debug(`jwtParts:${toStr(jwtParts)}`);
	const jwt = {
		header: JSON.parse(jwtParts[0]),
		payload: JSON.parse(jwtParts[1]),
		signature: jwtParts[2] // binary :(
	};
	//log.debug(`jwt:${toStr(jwt)}`);
	return jwt;
} // function decodeAccessToken*/

export const getAccessToken = ({
	hostname,
	clientId,
	clientSecret
}) => {
	const tokenRequestParams = {
		body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
		contentType: 'application/x-www-form-urlencoded',
		method: 'POST',
		headers: {
			Accept: 'application/json'
		},
		url: `${hostname}/fotoweb/oauth2/token`
	};
	//log.debug(`tokenRequestParams:${toStr(tokenRequestParams)}`);
	const tokenResponse = request(tokenRequestParams);
	//log.debug(`tokenResponse:${toStr(tokenResponse)}`);
	const {
		//cookies,
		//contentType, // application/json
		//headers
		//message,
		status
	} = tokenResponse;
	//log.debug(`cookies:${toStr(cookies)}`);
	if (status !== 200) {
		throw new Error(`Status !== 200 tokenResponse:${toStr(tokenResponse)}`);
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
	//log.debug(`accessToken:${toStr(accessToken)}`);

	/*const jwt = decodeAccessToken(accessToken);
	log.debug(`jwt:${toStr(jwt)}`);
	const {
		payload: {
			iss//, //Contains the api url
			//jti
		}
	} = jwt;
	log.debug(`iss:${toStr(iss)}`);
	//log.debug(`jti:${toStr(jti)}`);*/

	return {
		accessToken
	};
};
