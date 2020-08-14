import {request} from '/lib/http-client';
import {toStr} from '/lib/util';

export const requestRendition = ({
	accessToken,
	cookies,
	hostname,
	renditionServiceShortAbsolutePath,
	renditionUrl
}) => {
	const renditionServiceRequestParams = {
		/*body: {
			href: renditionUrl
		},*/
		body: JSON.stringify({
			href: renditionUrl
		}), /*
		body: `

{
  "href": "${renditionUrl}"
}`,
		body: `href=${renditionUrl}`,*/

		contentType: 'application/vnd.fotoware.rendition-request+json',
		//contentType: 'application/json',
		//contentType: 'application/x-www-form-urlencoded',
		//contentType: 'multipart/form-data',
		//contentType: 'multipart/mixed',

		//followRedirects: false, // default is ?
		followRedirects: true,

		//method: 'GET', // 404 Not Found
		method: 'POST',
		//method: 'OPTIONS', // "Allow": "POST, OPTIONS"

		/*multipart: [{
			name: 'href',
			value: renditionUrl
		}],*/

		headers: {
			Accept: 'application/vnd.fotoware.rendition-response+json'//,
			//Authentication: `Bearer ${accessToken}` // Still 403 FORBIDDEN with this
			//FWAPIToken: accessToken // Still 403 FORBIDDEN with this
		},
		/*params: { // Form parameters to be sent with the request. Will not be used if queryParams is provided.
			//href: renditionUrl
		},*/
		//queryParams: {},
		url: `${hostname}${renditionServiceShortAbsolutePath}`
	};
	if (accessToken) {
		renditionServiceRequestParams.headers.Authorization = `bearer ${accessToken}`;

		// Becomes 403 FORBIDDEN without this
		/*renditionServiceRequestParams.params = {
			access_token: accessToken//, // 415 UNSUPPORTED MEDIA TYPE
			//FWAPIToken: accessToken // 415 UNSUPPORTED MEDIA TYPE
			//href: renditionUrl // 415 UNSUPPORTED MEDIA TYPE
		};*/
		/*renditionServiceRequestParams.queryParams = {
			//access_token: accessToken // 403 FORBIDDEN
			FWAPIToken: accessToken//, // 403 FORBIDDEN
			//href: renditionUrl // 400 BAD REQUEST The browser (or proxy) sent a request that this server could not understand.
		};*/
	}
	if (cookies) {
		//log.debug(`cookies:${toStr(cookies)}`);
		renditionServiceRequestParams.headers.Cookie = cookies.map(({name, value}) => `${name}=${value}`).join('; ');
	}
	//log.debug(`renditionServiceRequestParams:${toStr(renditionServiceRequestParams)}`);
	const rendtitionServiceResponse = request(renditionServiceRequestParams);
	//log.debug(`rendtitionServiceResponse:${toStr(rendtitionServiceResponse)}`);

	if (rendtitionServiceResponse.status !== 202) {
		//if (rendtitionServiceResponse.status !== 415) {
		log.error(`Something went wrong when trying to get rendition url renditionServiceRequestParams:${toStr(renditionServiceRequestParams)} rendtitionServiceResponse:${toStr(rendtitionServiceResponse)}`);
		//}
		throw new Error(`Something went wrong when trying to get rendition url renditionUrl:${renditionUrl}`);
	}

	//if (rendtitionServiceResponse.status === 202) {
	let rendtitionServiceResponseBodyObj;
	try {
		rendtitionServiceResponseBodyObj = JSON.parse(rendtitionServiceResponse.body);
	} catch (e) {
		throw new Error(`Something went wrong when trying to JSON parse the response body! rendtitionServiceResponse:${toStr(rendtitionServiceResponse)}`);
	}
	//log.debug(`rendtitionServiceResponseBodyObj:${toStr(rendtitionServiceResponseBodyObj)}`);

	const {
		href
	} = rendtitionServiceResponseBodyObj;
	const rendtitionRequestUrl = `${hostname}${href}`;
	//log.debug(`rendtitionRequestUrl:${toStr(rendtitionRequestUrl)}`);

	const pollAndDownloadRenditionRequestParams = {
		method: 'GET',
		url: rendtitionRequestUrl
	};
	if (accessToken) {
		pollAndDownloadRenditionRequestParams.headers = { Authorization: `bearer ${accessToken}` };
	}
	//log.debug(`pollAndDownloadRenditionRequestParams:${toStr(pollAndDownloadRenditionRequestParams)}`);

	let pollAndDownloadRenditionResponse = {
		status: 202
	};
	while (pollAndDownloadRenditionResponse.status === 202) {
		pollAndDownloadRenditionResponse = request(pollAndDownloadRenditionRequestParams);
	}
	if (pollAndDownloadRenditionResponse.status === 410) {
		log.error(`Rendition no longer available rendtitionServiceResponse:${toStr(rendtitionServiceResponse)} pollAndDownloadRenditionResponse:${toStr(pollAndDownloadRenditionResponse)}`);
		throw new Error(`Rendition no longer available renditionUrl:${renditionUrl}`);
	}
	if (pollAndDownloadRenditionResponse.status !== 200) {
		log.error(`Something went wrong while trying to poll and download rendition rendtitionServiceResponse:${toStr(rendtitionServiceResponse)} pollAndDownloadRenditionRequestParams:${toStr(pollAndDownloadRenditionRequestParams)} pollAndDownloadRenditionResponse:${toStr(pollAndDownloadRenditionResponse)}`);
		throw new Error(`Something went wrong while trying to poll and download rendition renditionUrl:${renditionUrl}`);
	}
	/*log.debug(`debug rendition service and download:${toStr({
		renditionServiceRequestParams,
		rendtitionServiceResponse,
		rendtitionServiceResponseBodyObj,
		pollAndDownloadRenditionRequestParams,
		pollAndDownloadRenditionResponse
	})}`);*/
	return pollAndDownloadRenditionResponse;
	//}
}; // export const requestRendition
