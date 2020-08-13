import {getAccessToken} from '/lib/fotoware/api/getAccessToken';
import {getPrivateFullAPIDescriptor} from '/lib/fotoware/api/getPrivateFullAPIDescriptor';
import {query} from '/lib/fotoware/api/query';
import {getConfigFromAppCfg} from '/lib/fotoware/xp/getConfigFromAppCfg';
import {toStr} from '/lib/util';

export function get(request) {
	//log.debug(`request:${toStr(request)}`);

	const {
		params,
		params: {
			q,
			site
		}
	} = request;
	if(!site) {
		return {
			body: {
				message: `Required param site missing! params:${toStr(params)}`
			},
			contentType: 'application/json;charset=utf-8',
			status: 400
		};
	}

	const sitesConfigs = getConfigFromAppCfg();
	//log.debug(`sitesConfigs:${toStr(sitesConfigs)}`);

	const {
		blacklistedCollections,
		clientId,
		clientSecret,
		url,
		whitelistedCollections
	} = sitesConfigs[site];
	//log.debug(`url:${toStr(url)}`);

	const {accessToken} = getAccessToken({
		hostname: url,
		clientId,
		clientSecret
	});
	const {
		searchURL//,
		//renditionRequest
	} = getPrivateFullAPIDescriptor({
		accessToken,
		hostname: url
	});
	//log.debug(`searchURL:${toStr(searchURL)}`);

	return {
		body: query({
			accessToken,
			blacklistedCollections,
			hostname: url,
			q,
			searchURL,
			whitelistedCollections
		}),
		contentType: 'application/json;charset=utf-8'
	};
} // export function get
