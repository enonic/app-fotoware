import {request} from '/lib/http-client';
import {toStr} from '/lib/util';

export const getprivateFullAPIDescriptor = ({
	hostname,
	accessToken
}) => {
	const privateFullAPIDescriptorRequestParams = {
		contentType: 'application/json',
		method: 'GET',
		headers: {
			Accept: 'application/vnd.fotoware.full-api-descriptor+json'//,
			//Authentication: `Bearer ${accessToken}` // 401 Unauthorized: You are not authorized to access this resource
			//FWAPIToken: accessToken // 500 Internal server error!
		},
		params: {
			access_token: accessToken // FINALLY THIS WORKS!
		},
		url: `${hostname}/fotoweb/me/`
	};
	//log.info(`privateFullAPIDescriptorRequestParams:${toStr(privateFullAPIDescriptorRequestParams)}`);

	const privateFullAPIDescriptorResponse = request(privateFullAPIDescriptorRequestParams);
	//log.info(`privateFullAPIDescriptorResponse:${toStr(privateFullAPIDescriptorResponse)}`);

	let privateFullAPIDescriptorResponseBodyObj;
	try {
		privateFullAPIDescriptorResponseBodyObj = JSON.parse(privateFullAPIDescriptorResponse.body);
	} catch (e) {
		throw new Error(`Something went wrong when trying to JSON parse the response body! privateFullAPIDescriptorResponse:${toStr(privateFullAPIDescriptorResponse)}`);
	}
	//log.info(`privateFullAPIDescriptorResponseBodyObj:${toStr(privateFullAPIDescriptorResponseBodyObj)}`);

	const {
		archives,
		services: {
			//login,
			//search,
			rendition_request: renditionRequest
		}/*,
		server,
		href,
		background_tasks: backgroundTasks,
		searchURL,
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
	//log.info(`rest:${toStr(rest)}`);
	//log.info(`archives:${toStr(archives)}`);
	//log.info(`renditionRequest:${toStr(renditionRequest)}`);
	return {
		archives,
		renditionRequest
	};
}; // export const getprivateFullAPIDescriptor
