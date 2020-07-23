import {forceArray} from '/lib/util/data';
import {
	get as getContentByKey,
	getSiteConfig as getSiteConfigByKey
} from '/lib/xp/content';
import {run} from '/lib/xp/context';

export const getConfigFromSite = ({
	repository,
	siteId
}) => run({
	repository,
	branch: 'master', // Always get published siteConfig.
	user: {
		login: 'su',
		idProvider: 'system'
	},
	principals: ['role:system.admin']
}, () => {
	const siteConfig = getSiteConfigByKey({
		applicationKey: app.name,
		key: siteId
	});
	//log.info(`siteConfig:${toStr(siteConfig)}`);
	const {
		archiveOptionSet: {
			_selected: selected = [],
			public: {
				folder: publicFolderId // contentId
			} = {},
			private: {
				clientId,
				clientSecret,
				folder: privateFolderId // contentId
			} = {}
		} = {},
		hostname
	} = siteConfig;
	return run({
		repository,
		branch: 'draft', // Public and private folder may not be published yet.
		user: {
			login: 'su',
			idProvider: 'system'
		},
		principals: ['role:system.admin']
	}, () => ({
		selected: forceArray(selected),
		publicFolderPath: publicFolderId ? getContentByKey({key: publicFolderId})._path : null,
		clientId,
		clientSecret,
		privateFolderPath: privateFolderId ? getContentByKey({key: privateFolderId})._path : null,
		hostname
	}));
});
