//import {toStr} from '/lib/util';
import {deepen} from '/lib/fotoware/xp/deepen';

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
		/*log.info(`${toStr({
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

	//log.info(`siteConfigs:${toStr(siteConfigs)}`);
	return siteConfigs;
} // function getConfigFromAppCfg
