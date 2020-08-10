import {request} from '/lib/http-client';
import {toStr} from '/lib/util';

export const getPublicAPIDescriptor = ({
	hostname
}) => {
	const publicAPIDescriptorRequestParams = {
		contentType: 'application/json',
		method: 'GET',
		headers: {
			Accept: 'application/vnd.fotoware.api-descriptor+json'
			//Accept: 'application/vnd.fotoware.full-api-descriptor+json' // NotAcceptable: The requested representation is not available
		},
		url: `${hostname}/fotoweb/`
	};
	//log.info(`publicAPIDescriptorRequestParams:${toStr(publicAPIDescriptorRequestParams)}`);

	const publicAPIDescriptorResponse = request(publicAPIDescriptorRequestParams);
	//log.info(`publicAPIDescriptorResponse:${toStr(publicAPIDescriptorResponse)}`);

	let publicAPIDescriptorResponseBodyObj;
	try {
		publicAPIDescriptorResponseBodyObj = JSON.parse(publicAPIDescriptorResponse.body);
	} catch (e) {
		throw new Error(`Something went wrong when trying to JSON parse the response body! publicAPIDescriptorResponse:${toStr(publicAPIDescriptorResponse)}`);
	}
	//log.info(`publicAPIDescriptorResponseBodyObj:${toStr(publicAPIDescriptorResponseBodyObj)}`);

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
	//log.info(`rest:${toStr(rest)}`);
	//log.info(`archivesPath:${toStr(archivesPath)}`);
	//log.info(`renditionRequest:${toStr(renditionRequest)}`);
	return {
		archivesPath,
		renditionRequest
	};
}; // export const getPublicAPIDescriptor