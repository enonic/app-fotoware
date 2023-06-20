import {toStr} from '@enonic/js-utils';
// @ts-expect-error TS2307: Cannot find module '/lib/http-client' or its corresponding type declarations.
import {request} from '/lib/http-client';
import {DEBUG_REQUESTS} from '/constants';


export const getPublicAPIDescriptor = ({
	hostname
}: {
	hostname: string
}) => {
	const publicAPIDescriptorRequestParams = {
		contentType: 'application/json',
		followRedirects: true, // Documentation is on unclear on the default https://developer.enonic.com/docs/http-client-library/master#requestoptions
		method: 'GET',
		headers: {
			Accept: 'application/vnd.fotoware.api-descriptor+json'
			//Accept: 'application/vnd.fotoware.full-api-descriptor+json' // NotAcceptable: The requested representation is not available
		},
		url: `${hostname}/fotoweb/`
	};
	DEBUG_REQUESTS && log.debug('publicAPIDescriptorRequestParams:%s', toStr(publicAPIDescriptorRequestParams));

	const publicAPIDescriptorResponse = request(publicAPIDescriptorRequestParams);
	DEBUG_REQUESTS && log.debug('publicAPIDescriptorResponse:%s', toStr(publicAPIDescriptorResponse));

	let publicAPIDescriptorResponseBodyObj;
	try {
		publicAPIDescriptorResponseBodyObj = JSON.parse(publicAPIDescriptorResponse.body);
	} catch (e) {
		throw new Error(`Something went wrong when trying to JSON parse the response body! publicAPIDescriptorResponse:${toStr(publicAPIDescriptorResponse)}`);
	}
	//log.debug(`publicAPIDescriptorResponseBodyObj:${toStr(publicAPIDescriptorResponseBodyObj)}`);

	const {
		archives: archivesPath, //"/fotoweb/archives/",
		services: {
			//login, //"/fotoweb/login",
			//search, //"/fotoweb/search/",
			rendition_request: renditionRequest //"/fotoweb/services/renditions"
		}/*,
		server, //"FotoWeb Core"
		href, //"/fotoweb/"
		background_tasks: backgroundTasks, //"/fotoweb/me/background-tasks/",
		searchURL, //"/fotoweb/archives/{?q}",
		albums, //"/fotoweb/albums/",
		taxonomies, //"/fotoweb/taxonomies/",
		screens, //"/fotoweb/screens/",
		utc_offset: utcOffset, //0
		...rest*/
	} = publicAPIDescriptorResponseBodyObj;
	//log.debug(`rest:${toStr(rest)}`);
	//log.debug(`archivesPath:${toStr(archivesPath)}`);
	//log.debug(`renditionRequest:${toStr(renditionRequest)}`);
	return {
		archivesPath,
		renditionRequest
	};
}; // export const getPublicAPIDescriptor
