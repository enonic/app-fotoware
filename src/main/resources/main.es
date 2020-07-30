import {toStr} from '/lib/util';
import {deepen} from '/lib/fotoweb/xp/deepen';

log.info(`app.config:${toStr(app.config)}`);
log.info(`deepen(app.config):${toStr(deepen(app.config))}`);

/*
import {toStr} from '/lib/util';
import {forceArray} from '/lib/util/data';
import {get as getContent} from '/lib/xp/content';
import {run} from '/lib/xp/context';
import {listener} from '/lib/xp/event';
import {submit} from '/lib/xp/task';

//import {syncPublic} from '/lib/fotoweb/syncPublic';
import {getPublicAPIDescriptor} from '/lib/fotoweb/getPublicAPIDescriptor';
import {getAccessToken} from '/lib/fotoweb/getAccessToken';
import {getprivateFullAPIDescriptor} from '/lib/fotoweb/getprivateFullAPIDescriptor';

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
			nodes.forEach((node/*, i) => {
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
					const context = {
						repository: repo,
						branch: 'master', // Always syncing to master
						user: {
							login: 'su',
							idProvider: 'system'
						},
						principals: ['role:system.admin']
					};
					//log.info(`context:${toStr(context)}`);
					run(context, () => {
						const content = getContent({key: id});
						//log.info(`content:${toStr(content)}`);
						const {
							data: {
								siteConfig = []
							} = {}
						} = content;
						const siteConfigs = forceArray(siteConfig);
						//log.info(`siteConfigs:${toStr(siteConfigs)}`);
						siteConfigs.forEach(({
							applicationKey,
							config
						}/*, i) => {
							if (applicationKey === 'com.enonic.app.fotoware') {
								const {
									archiveOptionSet: {
										_selected: selected = [],
										public: {
											folder: publicFolder // contentId
										} = {},
										private: {
											clientId,
											clientSecret,
											folder: privateFolder // contentId
										} = {}
									} = {},
									hostname
								} = config;
								//log.info(`selected:${toStr(selected)}`);
								//log.info(`publicFolder:${toStr(publicFolder)}`); // contentId
								//log.info(`clientId:${toStr(clientId)}`);
								//log.info(`clientSecret:${toStr(clientSecret)}`);
								//log.info(`privateFolder:${toStr(privateFolder)}`); // contentId
								//log.info(`hostname:${toStr(hostname)}`);
								const selectedArr = forceArray(selected);
								if (hostname) {
									submit({
										description: '',
										task: () => {
											if (
												selectedArr.includes('public')
												&& publicFolder
											) {
												const {
													archives,
													renditionRequest
												} = getPublicAPIDescriptor({hostname});
												log.info(`archives:${toStr(archives)}`);
												log.info(`renditionRequest:${toStr(renditionRequest)}`);
												/*syncPublic({
													hostname,
													folder: publicFolder // contentId
												});
											} // if public

											if (
												selectedArr.includes('private')
												&& clientId
												&& clientSecret
												&& privateFolder
											) {
												const {accessToken} = getAccessToken({
													hostname,
													clientId,
													clientSecret
												});
												log.info(`accessToken:${toStr(accessToken)}`);
												const {
													archives,
													renditionRequest
												} = getprivateFullAPIDescriptor({
													accessToken,
													hostname
												});
												log.info(`archives:${toStr(archives)}`);
												log.info(`renditionRequest:${toStr(renditionRequest)}`);
											} // if private
										} // task
									}); // submit
								} // if hostname
							} // if fotoware app
						}); // siteConfigs.forEach
					}); // context.run
				} // if branch
			}); // nodes.forEach
		} // if type
	} // callback
});
*/
