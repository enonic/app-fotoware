import {submitNamed} from '/lib/xp/task';
submitNamed({
	name: 'sync',
	config: {}
});
/*

import {getConfigFromAppCfg} from '/lib/fotoware/xp/getConfigFromAppCfg';
//import {toStr} from '/lib/util';
import {submit} from '/lib/xp/task';
import {syncSiteFlat} from '/lib/fotoware/xp/syncSiteFlat';

const sitesConfigs = getConfigFromAppCfg();
//log.info(`sitesConfigs:${toStr(sitesConfigs)}`);

Object.keys(sitesConfigs).forEach((site) => {
	submit({
		description: '',
		task: () => {
			syncSiteFlat({siteConfig: sitesConfigs[site]})
		}
	}); // submit
}); // forEach site



/*
import {listener} from '/lib/xp/event';

listener({
	type: 'node.*',
	localOnly: true,
	callback: (event) => {
		const {
			data: {
				nodes
			},
			//distributed,
			//localOrigin,
			//timestamp,
			type
		} = event;
		if ([
			//'node.created',
			'node.pushed'//, // Only when a site is published
			//'node.updated',
			//'node.deleted'
		].includes(type)) {
			nodes.forEach((node) => {
				const {
					id,
					//path,
					branch,
					repo
				} = node;
				if (
					branch === 'master' // Have to publish site before sync updates
					&& repo.startsWith('com.enonic.cms.')
				) {
					log.info(`event:${toStr(event)}`);
					//log.info(`node:${toStr(node)}`);
				} // if branch
			}); // nodes.forEach
		} // if type
	} // callback
});
*/
