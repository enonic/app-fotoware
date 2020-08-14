import getIn from 'get-value';

import {URL} from '/lib/galimatias';
import {toStr} from '/lib/util';
//import {query as queryContent} from '/lib/xp/content';
/*import {
	//get as getContext,
	run as runInContext
} from '/lib/xp/context';*/
import {getSite as getCurrentSite} from '/lib/xp/portal';
import {
	//progress,
	submit
} from '/lib/xp/task';

//import {getAccessToken} from '/lib/fotoware/api/getAccessToken';
//import {getPrivateFullAPIDescriptor} from '/lib/fotoware/api/getPrivateFullAPIDescriptor';

import {deepen} from '/lib/fotoware/xp/deepen';

export const post = (request) => {
	//log.debug(`request:${toStr(request)}`);
	const {repositoryId: repository} = request;

	/*const context = getContext();
	log.debug(`context:${toStr(context)}`);
	const {repository} = context;*/
	log.debug(`repository:${toStr(repository)}`);

	const currentSite = getCurrentSite();
	log.debug(`currentSite:${toStr(currentSite)}`);

	const {
		headers: {
			'User-Agent': userAgent
		},
		remoteAddress
	} = request;
	//log.debug(`remoteAddress:${toStr(remoteAddress)}`);
	//log.debug(`userAgent:${toStr(userAgent)}`);

	if (userAgent !== 'FotoWeb/8.0') {
		log.error(`Illegal userAgent in request! ${toStr(request)}`);
		return {status: 404};
	}

	let body;
	try {
		body = JSON.parse(request.body);
		//log.debug(`body:${toStr(body)}`);
	} catch (e) {
		log.error(`Something went wrong when trying to parse request body ${toStr(request)}`);
		return {status: 404};
	}

	const {
		href, // FQDN
		data: {
			archiveHREF,
			doctype,
			filename,
			filesize,
			metadata,
			renditions
		}
	} = body;
	//log.debug(`href:${toStr(href)}`);
	log.debug(`archiveHREF:${toStr(archiveHREF)}`);
	log.debug(`doctype:${toStr(doctype)}`);
	log.debug(`filename:${toStr(filename)}`);
	log.debug(`filesize:${toStr(filesize)}`);
	log.debug(`metadata:${toStr(metadata)}`);
	log.debug(`renditions:${toStr(renditions)}`);

	const url = new URL(href);
	const base = `${url.getScheme()}://${url.getHost()}`;
	//log.debug(`base:${toStr(base)}`);

	const config = deepen(app.config);
	const sites = getIn(config, 'fotoware.sites', {});
	//log.debug(`sites:${toStr(sites)}`);
	const {
		clientId,
		clientSecret,
		remoteAddresses
	} = sites[base];
	log.debug(`clientId:${toStr(clientId)}`);
	log.debug(`clientSecret:${toStr(clientSecret)}`);
	//log.debug(`remoteAddresses:${toStr(remoteAddresses)}`);
	if (!Object.keys(remoteAddresses).includes(remoteAddress)) {
		log.error(`Illegal remoteaddress in request! ${toStr(request)}`);
		return {status: 404};
	}

	submit({
		description: '',
		task: () => {
			// TODO
		} // task
	}); // submit
	return {
		body: {},
		contentType: 'application/json;charset=utf-8'
	};
}; // post
