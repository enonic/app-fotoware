//import {toStr} from '/lib/util';
import {deepen} from '/lib/fotoware/xp/deepen';
import {capitalize} from '/lib/fotoware/xp/capitalize';

export function getConfigFromAppCfg() {
	//log.debug(`app.config:${toStr(app.config)}`);

	const config = deepen(app.config);
	//log.debug(`config:${toStr(config)}`);

	const {
		sites = {},
		imports = {}
	} = config;
	//log.debug(`sites:${toStr(sites)}`);
	//log.debug(`imports:${toStr(imports)}`);

	const sitesConfigs = {};

	Object.keys(sites).forEach((site) => {
		//log.debug(`site:${toStr(site)}`);
		const {
			url = `https://${site}.fotoware.cloud`,
			remoteAddresses = {},
			clientSecret,
			clientId
		} = sites[site];
		/*log.debug(`${toStr({
			clientId,
			clientSecret,
			url,
			remoteAddresses
		})}`);*/
		if (!clientId) {
			log.error(`Site ${site} is missing clientId!`);
		} else if(!clientSecret) {
			log.error(`Site ${site} is missing clientSecret!`);
		} else {
			sitesConfigs[site] = {
				url,
				remoteAddresses,
				clientSecret,
				clientId,
				imports: {}
			};
		}

	}); // foreach
	//log.debug(`sitesConfigs:${toStr(sitesConfigs)}`);

	const projectPaths = {};
	Object.keys(imports).forEach((site) => {
		//log.debug(`site:${toStr(site)}`);
		if (!sitesConfigs[site]) {
			log.error(`Unconfigured site ${site}!`);
		} else {
			Object.keys(imports[site]).forEach((importName) => {
				//log.debug(`importName:${toStr(importName)}`);
				const {
					rendition = 'Original File',
					query = 'fn:*.gif|fn:*.jpg|fn:*.jpeg|fn:*.png|fn:*.svg',
					project = 'default',
					path = capitalize(importName)
				} = imports[site][importName];
				if (projectPaths[project] && projectPaths[project] === path) {
					log.error(`Two imports cannot have the same project:${project} and path:${path}!`);
				} else {
					projectPaths[project] = path;
					sitesConfigs[site].imports.[importName] = {
						rendition,
						query,
						project,
						path
					}
				}
			});
		}
	});
	//log.debug(`sitesConfigs:${toStr(sitesConfigs)}`);

	return {
		sitesConfigs
	};
} // function getConfigFromAppCfg
