import {request} from '/lib/http-client';
import {toStr} from '/lib/util';

export const getPrivateFullAPIDescriptor = ({
	hostname,
	accessToken
}) => {
	const privateFullAPIDescriptorRequestParams = {
		contentType: 'application/json',
		followRedirects: true, // Documentation is on unclear on the default https://developer.enonic.com/docs/http-client-library/master#requestoptions
		method: 'GET',
		headers: {
			Accept: 'application/vnd.fotoware.full-api-descriptor+json'//,
			//Authentication: `bearer ${accessToken}` // 401 Unauthorized: You are not authorized to access this resource
			//FWAPIToken: accessToken // 500 Internal server error!
		},
		params: {
			access_token: accessToken // FINALLY THIS WORKS!
		},
		url: `${hostname}/fotoweb/me/`
	};
	//log.debug(`privateFullAPIDescriptorRequestParams:${toStr(privateFullAPIDescriptorRequestParams)}`);

	const privateFullAPIDescriptorResponse = request(privateFullAPIDescriptorRequestParams);
	//log.debug(`privateFullAPIDescriptorResponse:${toStr(privateFullAPIDescriptorResponse)}`);

	let privateFullAPIDescriptorResponseBodyObj;
	try {
		privateFullAPIDescriptorResponseBodyObj = JSON.parse(privateFullAPIDescriptorResponse.body);
	} catch (e) {
		throw new Error(`Something went wrong when trying to JSON parse the response body! privateFullAPIDescriptorResponse:${toStr(privateFullAPIDescriptorResponse)}`);
	}
	//log.debug(`privateFullAPIDescriptorResponseBodyObj:${toStr(privateFullAPIDescriptorResponseBodyObj)}`);

	const {
		archives: archivesPath,
		searchURL,
		services: {
			//login,
			//search,
			rendition_request: renditionRequest
		}/*,
		server,
		href,
		background_tasks: backgroundTasks,
		albums,
		taxonomies,
		screens,
		utc_offset: utcOffset,

		// Full API Descriptor
		user_preferences: userPreferences,
		users,
		users_search: usersSearch,
		groups,
		groups_search: groupsSearch,
		people_search: peopleSearch,
		albums_own: albumsOwn,
		albums_shared: albumsShared,
		albums_archived: albumsArchived,
		albums_deleted: albumsDeleted,
		albums_contribute: albumsContribute,
		destinations,
		actions,
		markers,
		copy_to: copyTo,
		move_to: moveTo,
		upload_to: uploadTo,
		tokens,
		upload_tokens: uploadTokens,
		pins,
		alerts,
		bookmarks,
		signups,
		appearance,
		userManagement,
		order,
		cropDownloadPresets,
		actionCropPresets,
		customizations,
		views,
		upload,
		widgets,
		security,
		fwdt,
		user,
		permissions,
		siteConfigurationHref,

		...rest*/
	} = privateFullAPIDescriptorResponseBodyObj;
	//log.debug(`rest:${toStr(rest)}`);
	//log.debug(`archives:${toStr(archives)}`);
	//log.debug(`renditionRequest:${toStr(renditionRequest)}`);
	return {
		archivesPath,
		searchURL,
		renditionRequest
	};
}; // export const getPrivateFullAPIDescriptor
