import {getConfigFromAppCfg} from '/lib/fotoware/xp/getConfigFromAppCfg';
//import {toStr} from '/lib/util';
import {syncSiteFlat} from '/lib/fotoware/xp/syncSiteFlat';

export function run() {
	const sitesConfigs = getConfigFromAppCfg();
	//log.info(`sitesConfigs:${toStr(sitesConfigs)}`);
	Object.keys(sitesConfigs).forEach((site) => {
		syncSiteFlat({siteConfig: sitesConfigs[site]})
	}); // forEach site
} // export function run
