//import {toStr} from '/lib/util';
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
		docTypesOptionSet: {
			_selected: selectedDocTypes = ['graphic', 'image'],
			document: {
				pdf = false
			} = {},
			generic: {
				cof = false,
				cop = false,
				cos = false,
				cot = false,
				zip = false
			} = {},
			graphic: {
				ai = false,
				svg = true
			} = {},
			image: {
				cr2 = false,
				jpg = true,
				png = true,
				psd = false,
				tif = false
			} = {},
			movie: {
				mp4 = false
			} = {}
		} = {},
		hostname
	} = siteConfig;
	/*log.info(`selectedDocTypes:${toStr(selectedDocTypes)}`);
	log.info(`pdf:${toStr(pdf)}`);
	log.info(`cof:${toStr(cof)}`);
	log.info(`cop:${toStr(cop)}`);
	log.info(`cos:${toStr(cos)}`);
	log.info(`cot:${toStr(cot)}`);
	log.info(`zip:${toStr(zip)}`);
	log.info(`ai:${toStr(ai)}`);
	log.info(`svg:${toStr(svg)}`);
	log.info(`cr2:${toStr(cr2)}`);
	log.info(`jpg:${toStr(jpg)}`);
	log.info(`png:${toStr(png)}`);
	log.info(`psd:${toStr(psd)}`);
	log.info(`tif:${toStr(tif)}`);
	log.info(`mp4:${toStr(mp4)}`);*/
	const selectedExtensions = [];
	if (pdf) { selectedExtensions.push('pdf'); }
	if (cof) { selectedExtensions.push('cof'); }
	if (cop) { selectedExtensions.push('cop'); }
	if (cos) { selectedExtensions.push('cos'); }
	if (cot) { selectedExtensions.push('cot'); }
	if (zip) { selectedExtensions.push('zip'); }
	if (ai) { selectedExtensions.push('ai'); }
	if (svg) { selectedExtensions.push('svg'); }
	if (cr2) { selectedExtensions.push('cr2'); }
	if (jpg) { selectedExtensions.push('jpg'); }
	if (png) { selectedExtensions.push('png'); }
	if (psd) { selectedExtensions.push('psd'); }
	if (tif) { selectedExtensions.push('tif'); }
	if (mp4) { selectedExtensions.push('mp4'); }
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
		publicFolderPath: publicFolderId ? getContentByKey({key: publicFolderId}) && getContentByKey({key: publicFolderId})._path : null,
		clientId,
		clientSecret,
		privateFolderPath: privateFolderId ? getContentByKey({key: privateFolderId}) && getContentByKey({key: privateFolderId})._path : null,
		hostname,
		selectedDocTypes,
		selectedExtensions
	}));
});
