//import {toStr} from '/lib/util';
import {deepen} from '/lib/fotoware/xp/deepen';
//import {deepen} from './deepen';

export function getConfigFromAppCfg() {
	//log.info(`app.config:${toStr(app.config)}`);

	const config = deepen(app.config);
	//log.info(`config:${toStr(config)}`);

	const {
		fotoware: {
			sites = {}
		} = {}
	} = config;
	//log.info(`sites:${toStr(sites)}`);

	const siteConfigs = {};

	Object.keys(sites).forEach((site) => {
		//log.info(`site:${toStr(site)}`);
		const {
			docTypes = {},
			url = `https://${site}.fotoware.cloud`,
			remoteAddresses = {},
			path = 'FotoWare',
			clientSecret,
			clientId,
			project = 'default'
		} = sites[site];
		/*log.info(`${toStr({
			docTypes,
			url,
			remoteAddresses,
			path,
			clientSecret,
			clientId,
			project
		})}`);*/

		siteConfigs[site] = {
			docTypes: {
				document: docTypes.document === 'true',
				graphic: docTypes.graphic !== 'false',
				generic: docTypes.generic === 'true',
				image: docTypes.image !== 'false',
				movie: docTypes.movie === 'true'
			},
			url,
			remoteAddresses,
			path,
			clientSecret,
			clientId,
			project
		};
		//log.info(`siteConfigs:${toStr(siteConfigs)}`);
	}); // foreach

	//log.info(`siteConfigs:${toStr(siteConfigs)}`);
	return siteConfigs;
} // function getConfigFromAppCfg
