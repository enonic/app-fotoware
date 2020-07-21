import {toStr} from '/lib/util';
import {forceArray} from '/lib/util/data';
import {getSiteConfig as getSiteConfigByKey} from '/lib/xp/content';
import {run} from '/lib/xp/context';
import {submit} from '/lib/xp/task';

import {getPublicAPIDescriptor} from '../../lib/fotoweb/getPublicAPIDescriptor';
import {getAccessToken} from '../../lib/fotoweb/getAccessToken';
import {getprivateFullAPIDescriptor} from '../../lib/fotoweb/getprivateFullAPIDescriptor';

export const get = ({
	params: {
		repository,
		siteId
	}
}) => {
	if (!repository) {
		return {
			body: {
				error: 'Missing required parameter repository!'
			},
			contentType: 'application/json;charset=utf-8',
			status: 400
		};
	}
	if (!siteId) {
		return {
			body: {
				error: 'Missing required parameter siteId!'
			},
			contentType: 'application/json;charset=utf-8',
			status: 400
		};
	}
	const context = {
		repository,
		branch: 'master', // Always syncing to master
		user: {
			login: 'su',
			idProvider: 'system'
		},
		principals: ['role:system.admin']
	};
	run(context, () => {
		const siteConfig = getSiteConfigByKey({
			applicationKey: app.name,
			key: siteId
		});
		log.info(`siteConfig:${toStr(siteConfig)}`);
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
		} = siteConfig;
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
						//log.info(`archives:${toStr(archives)}`);
						//log.info(`renditionRequest:${toStr(renditionRequest)}`);
						/*syncPublic({
							hostname,
							folder: publicFolder // contentId
						});*/
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
						//log.info(`accessToken:${toStr(accessToken)}`);
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
	}); // context.run
	return {
		body: {
			repository,
			siteId
		},
		contentType: 'application/json;charset=utf-8'
	};
};
