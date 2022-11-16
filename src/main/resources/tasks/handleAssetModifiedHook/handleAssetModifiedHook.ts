import type {SiteConfig} from '/lib/fotoware/xp/AppConfig';


import {toStr} from '@enonic/js-utils';
// @ts-ignore
import {getAccessToken} from '/lib/fotoware/api/getAccessToken';
// @ts-ignore
import {getPrivateFullAPIDescriptor} from '/lib/fotoware/api/getPrivateFullAPIDescriptor';
import {getConfigFromAppCfg} from '/lib/fotoware/xp/getConfigFromAppCfg';
import {modifyInImport} from '/tasks/handleAssetModifiedHook/modifyInImport';


export interface HandleAssetModifiedParams {
	readonly fileNameNew :string
	readonly fileNameOld :string
	readonly siteName :string
}


// I don't like the idea of exposing clientId and clientSecret in the task
// config, so we need to read app.config and extra time inside the task, even if
// it's execution is delayed.
export function run({
	fileNameNew,
	fileNameOld,
	siteName
} :HandleAssetModifiedParams) :void {
	const {
		sitesConfigs
	} = getConfigFromAppCfg();
	//log.debug(`sitesConfigs:${toStr(sitesConfigs)}`);

	const siteConfig :SiteConfig = sitesConfigs[siteName];
	if (!siteConfig) {
		log.debug(`sitesConfigs:${toStr(sitesConfigs)}`);
		log.debug(`Object.keys(sitesConfigs):${toStr(Object.keys(sitesConfigs))}`);
		log.error(`Can't find siteConfig for site:${siteName}!`);
		return;
	}

	const {
		archiveName,
		clientId,
		clientSecret,
		properties,
		url: hostname,
		imports
	} = siteConfig;
	//log.debug(`clientId:${toStr(clientId)}`);
	//log.debug(`clientSecret:${toStr(clientSecret)}`);

	const {accessToken} = getAccessToken({
		hostname,
		clientId,
		clientSecret
	});
	//log.debug(`accessToken:${toStr(accessToken)}`);

	const {
		renditionRequest,
		searchURL
	} = getPrivateFullAPIDescriptor({
		accessToken,
		hostname
	});
	//log.debug(`searchURL:${toStr(searchURL)}`);
	//log.debug(`renditionRequest:${toStr(renditionRequest)}`);

	Object.keys(imports).forEach((importName) => {
		const {
			project,
			path,
			query,
			rendition
		} = imports[importName];
		modifyInImport({
			accessToken,
			archiveName,
			fileNameNew,
			fileNameOld,
			hostname,
			path,
			project,
			properties,
			query,
			rendition,
			renditionRequest,
			searchURL
		});
	}); // forEach import
}
