import type {
	RemoteAddresses,
	SiteConfig,
	SitesConfigs
} from './AppConfig.d';


// import {toStr} from '@enonic/js-utils';
import {deepen} from '/lib/fotoware/xp/deepen';
//import {deepen} from './deepen';
//import {capitalize} from '/lib/fotoware/xp/capitalize';
import {
	PROPERTY_ON_CREATE,
	PROPERTY_IF_CHANGED,
	PROPERTY_OVERWRITE
} from '/lib/fotoware/xp/constants';


interface GetConfigFromAppCfgReturnType {
	sitesConfigs: SitesConfigs
}


export function getConfigFromAppCfg(): GetConfigFromAppCfgReturnType {
	// log.debug(`app.config:${toStr(app.config)}`);

	const config = deepen(app.config);
	//log.debug(`config:${toStr(config)}`);

	const {
		sites = {},
		imports = {}
	} = config;
	// log.debug('sites:%s', toStr(sites));
	// log.debug(`imports:${toStr(imports)}`);

	const sitesConfigs: SitesConfigs = {};

	Object.keys(sites).forEach((siteName) => {
		// log.debug('siteName:%s', siteName);

		const siteConfig = sites[siteName];
		// log.debug('siteConfig:%s', toStr(siteConfig));

		if (!siteConfig) {
			throw new Error(`Unable to find site with name:${siteName}!`);
		}
		//log.debug(`site:${toStr(site)}`);

		const {
			//archiveName = '5000-Archive',
			archiveName = '5000-All-files',
			url = '', // `https://${site}.fotoware.cloud`,
			allowWebhookFromIp = 'localhost',
			clientSecret,
			clientId,
			properties: {
				artist = PROPERTY_IF_CHANGED,
				copyright = PROPERTY_OVERWRITE,
				description = PROPERTY_IF_CHANGED,
				displayName = PROPERTY_ON_CREATE,
				tags = PROPERTY_IF_CHANGED
			} = {}
		} = siteConfig;
		//log.info(`allowWebhookFromIp:${toStr(allowWebhookFromIp)}`);
		/*log.debug(`${toStr({
			clientId,
			clientSecret,
			url
		})}`);*/
		if (!clientId) {
			log.error(`Site ${siteName} is missing clientId!`);
		} else if(!clientSecret) {
			log.error(`Site ${siteName} is missing clientSecret!`);
		} else if(!url) {
			log.error(`Site ${siteName} is missing url!`);
		} else {
			const remoteAddresses: RemoteAddresses = {};
			allowWebhookFromIp.split(/\s*,\s*/).forEach((ip) => {
				remoteAddresses[ip] = true;
			});
			//log.info(`remoteAddresses:${toStr(remoteAddresses)}`);
			sitesConfigs[siteName] = {
				archiveName,
				url,
				remoteAddresses,
				clientSecret,
				clientId,
				imports: {},
				properties: {
					artist,
					copyright,
					description,
					displayName,
					tags
				}
			};
		}

	}); // foreach
	//log.info(`sitesConfigs:${toStr(sitesConfigs)}`);

	const projectPaths: Record<string,string> = {};
	Object.keys(imports).forEach((importName) => {
		const importObj = imports[importName];
		if (!importObj) {
			throw new Error(`Unable to find import with name:${importName}!`);
		}
		const {
			project,
			path = 'fotoware',
			query = 'fn:*.gif|fn:*.jpg|fn:*.jpeg|fn:*.png|fn:*.svg',
			rendition = 'Original File',
			site
		} = importObj;
		//log.info(`project:${toStr(project)}`);
		//log.info(`path:${toStr(path)}`);
		//log.info(`query:${toStr(query)}`);
		//log.info(`rendition:${toStr(rendition)}`);
		//log.info(`site:${toStr(site)}`);
		if (!site) {
			log.error(`Import ${importName} is missing site!`);
		} else if (!project) {
			log.error(`Import ${importName} is missing project!`);
		} else if (!sitesConfigs[site]) {
			log.error(`Unconfigured site ${site}!`);
		} else if (projectPaths[project] && projectPaths[project] === path) {
			log.error(`Two imports cannot have the same project:${project} and path:${path}!`);
		} else {
			projectPaths[project] = path;
			(sitesConfigs[site] as SiteConfig).imports[importName] = {
				path,
				project,
				query,
				rendition
			};
		}
	});
	//log.info(`sitesConfigs:${toStr(sitesConfigs)}`);

	return {
		sitesConfigs
	};
} // function getConfigFromAppCfg
