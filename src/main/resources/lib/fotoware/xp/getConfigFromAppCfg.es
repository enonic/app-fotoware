//import {toStr} from '/lib/util';
import {deepen} from '/lib/fotoware/xp/deepen';

export function getConfigFromAppCfg() {
	//log.debug(`app.config:${toStr(app.config)}`);

	const config = deepen(app.config);
	//log.debug(`config:${toStr(config)}`);

	const {
		fotoware: {
			sites = {}
		} = {}
	} = config;
	//log.debug(`sites:${toStr(sites)}`);

	const siteConfigs = {};

	Object.keys(sites).forEach((site) => {
		//log.debug(`site:${toStr(site)}`);
		const {
			collections: {
				blacklist = {},
				whitelist = {}
			} = {},
			docTypes = {},
			url = `https://${site}.fotoware.cloud`,
			remoteAddresses = {},
			path = 'FotoWare',
			clientSecret,
			clientId,
			project = 'default'
		} = sites[site];
		/*log.debug(`${toStr({
			docTypes,
			url,
			remoteAddresses,
			path,
			clientSecret,
			clientId,
			project
		})}`);*/

		const blacklistedCollections = {};
		Object.keys(blacklist).forEach((collectionName) => {
			blacklistedCollections[collectionName] = true;
		});

		const whitelistedCollections = {};
		Object.keys(whitelist).forEach((collectionName) => {
			whitelistedCollections[collectionName] = true;
		});

		siteConfigs[site] = {
			blacklistedCollections,
			whitelistedCollections,
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
	}); // foreach

	//log.debug(`siteConfigs:${toStr(siteConfigs)}`);
	return siteConfigs;
} // function getConfigFromAppCfg
