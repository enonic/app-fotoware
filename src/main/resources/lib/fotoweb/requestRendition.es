import {request} from '/lib/http-client';
import {toStr} from '/lib/util';

export const requestRendition = ({
	accessToken,
	renditionRequestServiceUrl,
	renditionUrl
}) => {
	const renditionServiceRequestParams = {
		body: JSON.stringify({
			href: renditionUrl
		}),
		contentType: 'application/vnd.fotoware.rendition-request+json',
		//contentType: 'application/json',
		method: 'POST',
		headers: {
			Accept: 'application/vnd.fotoware.rendition-response+json'
		},
		/*params: {
			href: renditionUrl
		},*/
		url: renditionRequestServiceUrl
	};
	if (accessToken) {
		//renditionServiceRequestParams.params.access_token = accessToken;
		renditionServiceRequestParams.params = {
			access_token: accessToken
		};
	}
	log.info(`renditionServiceRequestParams:${toStr(renditionServiceRequestParams)}`);
	const rendtitionServiceResponse = request(renditionServiceRequestParams);
	log.info(`rendtitionServiceResponse:${toStr(rendtitionServiceResponse)}`);
}; // export const requestRendition
