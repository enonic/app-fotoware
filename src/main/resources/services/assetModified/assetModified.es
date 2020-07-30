import getIn from 'get-value';

import {deepen} from '/lib/fotoweb/xp/deepen';
import {URL} from '/lib/galimatias';
import {toStr} from '/lib/util';

export const post = (request) => {
	//log.info(`request:${toStr(request)}`);

	const {
		headers: {
			'User-Agent': userAgent
		},
		remoteAddress
	} = request;
	//log.info(`remoteAddress:${toStr(remoteAddress)}`);
	//log.info(`userAgent:${toStr(userAgent)}`);

	if (userAgent !== 'FotoWeb/8.0') {
		log.error(`Illegal userAgent in request! ${toStr(request)}`);
		return {status: 404};
	}

	try {
		const body = JSON.parse(request.body);
		//log.info(`body:${toStr(body)}`);

		const {href} = body;
		//log.info(`href:${toStr(href)}`);

		const url = new URL(href);
		const base = `${url.getScheme()}://${url.getHost()}`;
		//log.info(`base:${toStr(base)}`);

		const config = deepen(app.config);
		const sites = getIn(config, 'fotoware.sites', {});
		//log.info(`sites:${toStr(sites)}`);
		const {
			//clientId,
			//clientSecret,
			remoteAddresses
		} = sites[base];
		//log.info(`clientId:${toStr(clientId)}`);
		//log.info(`clientSecret:${toStr(clientSecret)}`);
		//log.info(`remoteAddresses:${toStr(remoteAddresses)}`);
		if (!Object.keys(remoteAddresses).includes(remoteAddress)) {
			log.error(`Illegal remoteaddress in request! ${toStr(request)}`);
			return {status: 404};
		}
	} catch (e) {
		log.error(`Something went wrong when trying to parse request body ${toStr(request)}`);
		return {status: 404};
	}

	return {
		body: {},
		contentType: 'application/json;charset=utf-8'
	};
};
