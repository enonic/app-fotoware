import type {
	AccessToken,
	Cookies,
	Hostname,
	HttpClient,
	RenditionRequest,
	RenditionUrl,
	RenditionServiceResponseBodyParsed,
	Response
} from '/lib/fotoware';


import {toStr} from '@enonic/js-utils';
// @ts-expect-error TS2307: Cannot find module '/lib/http-client' or its corresponding type declarations
import {request} from '/lib/http-client';
import {DEBUG_REQUESTS} from '../../../constants';


export const requestRendition = ({
	hostname,
	renditionServiceShortAbsolutePath,
	renditionUrl,
	// Optional
	accessToken,
	cookies
}: {
	hostname: Hostname
	renditionServiceShortAbsolutePath: RenditionRequest
	renditionUrl: RenditionUrl
	// Optional
	accessToken?: AccessToken
	cookies?: Cookies
}) => {
	//log.info(`renditionUrl:${renditionUrl}`);
	const renditionServiceRequestParams: HttpClient.Request = {
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
		followRedirects: true, // Documentation is on unclear on the default https://developer.enonic.com/docs/http-client-library/master#requestoptions

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
		(renditionServiceRequestParams.headers as Record<string,string>)['Authorization'] = `bearer ${accessToken}`;

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
		(renditionServiceRequestParams.headers as Record<string,string>)['Cookie'] = cookies.map(({name, value}) => `${name}=${value}`).join('; ');
	}
	DEBUG_REQUESTS && log.info('renditionServiceRequestParams:%s', toStr(renditionServiceRequestParams));
	const renditionServiceResponse = request(renditionServiceRequestParams) as Response;
	DEBUG_REQUESTS && log.debug('renditionServiceResponse:%s', toStr(renditionServiceResponse));

	if (renditionServiceResponse.status !== 202) {
		//if (renditionServiceResponse.status !== 415) {
		log.error(`Something went wrong when trying to get rendition url renditionServiceRequestParams:${toStr(renditionServiceRequestParams)} renditionServiceResponse:${toStr(renditionServiceResponse)}`);
		//}
		throw new Error(`Something went wrong when trying to get rendition url renditionUrl:${renditionUrl}`);
	}

	if (!renditionServiceResponse.body) {
		throw new Error(`renditionServiceResponse without body renditionServiceResponse:${toStr(renditionServiceResponse)}`);
	}

	//if (renditionServiceResponse.status === 202) {
	let renditionServiceResponseBodyObj;
	try {
		renditionServiceResponseBodyObj = JSON.parse(renditionServiceResponse.body) as RenditionServiceResponseBodyParsed;
	} catch (e) {
		throw new Error(`Something went wrong when trying to JSON parse the response body! renditionServiceResponse:${toStr(renditionServiceResponse)}`);
	}
	//log.debug(`renditionServiceResponseBodyObj:${toStr(renditionServiceResponseBodyObj)}`);

	const {
		href
	} = renditionServiceResponseBodyObj;
	const renditionRequestUrl = `${hostname}${href}`;
	//log.debug(`renditionRequestUrl:${toStr(renditionRequestUrl)}`);

	const pollAndDownloadRenditionRequestParams: HttpClient.Request = {
		followRedirects: true, // Documentation is on unclear on the default https://developer.enonic.com/docs/http-client-library/master#requestoptions
		method: 'GET',
		url: renditionRequestUrl
	};
	if (accessToken) {
		pollAndDownloadRenditionRequestParams.headers = { Authorization: `bearer ${accessToken}` };
	}
	DEBUG_REQUESTS && log.debug('pollAndDownloadRenditionRequestParams:%s', toStr(pollAndDownloadRenditionRequestParams));

	let pollAndDownloadRenditionResponse: Response = {
		status: 202
	};
	while (pollAndDownloadRenditionResponse.status === 202) {
		pollAndDownloadRenditionResponse = request(pollAndDownloadRenditionRequestParams);
		// DEBUG_REQUESTS && log.debug('pollAndDownloadRenditionResponse:%s', toStr(pollAndDownloadRenditionResponse));
	}
	DEBUG_REQUESTS && log.debug('pollAndDownloadRenditionResponse:%s', toStr(pollAndDownloadRenditionResponse));
	if (pollAndDownloadRenditionResponse.status === 410) {
		log.error(`Rendition no longer available renditionServiceResponse:${toStr(renditionServiceResponse)} pollAndDownloadRenditionResponse:${toStr(pollAndDownloadRenditionResponse)}`);
		throw new Error(`Rendition no longer available renditionUrl:${renditionUrl}`);
	}
	if (pollAndDownloadRenditionResponse.status !== 200) {
		log.error(`Something went wrong while trying to poll and download rendition renditionServiceResponse:${toStr(renditionServiceResponse)} pollAndDownloadRenditionRequestParams:${toStr(pollAndDownloadRenditionRequestParams)} pollAndDownloadRenditionResponse:${toStr(pollAndDownloadRenditionResponse)}`);
		throw new Error(`Something went wrong while trying to poll and download rendition renditionUrl:${renditionUrl}`);
	}
	/*log.debug(`debug rendition service and download:${toStr({
		renditionServiceRequestParams,
		renditionServiceResponse,
		renditionServiceResponseBodyObj,
		pollAndDownloadRenditionRequestParams,
		pollAndDownloadRenditionResponse
	})}`);*/
	return pollAndDownloadRenditionResponse;
	//}
}; // export const requestRendition
