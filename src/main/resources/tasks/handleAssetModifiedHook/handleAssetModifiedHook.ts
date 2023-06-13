import {toStr} from '@enonic/js-utils';
import {getAccessToken} from '/lib/fotoware/api/getAccessToken';
import {getPrivateFullAPIDescriptor} from '/lib/fotoware/api/getPrivateFullAPIDescriptor';
import {getConfigFromAppCfg} from '/lib/fotoware/xp/getConfigFromAppCfg';
import {modifyInImport} from '/tasks/handleAssetModifiedHook/modifyInImport';


export interface HandleAssetModifiedParams
	extends Record<string, unknown>
{
	fileNameNew: string
	fileNameOld: string
	siteName: string
}


// I don't like the idea of exposing clientId and clientSecret in the task
// config, so we need to read app.config and extra time inside the task, even if
// it's execution is delayed.
export function run({
	fileNameNew,
	fileNameOld,
	siteName
}: HandleAssetModifiedParams): void {
	const {
		sitesConfigs
	} = getConfigFromAppCfg();
	//log.debug(`sitesConfigs:${toStr(sitesConfigs)}`);

	const siteConfig = sitesConfigs[siteName];
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
		const importItem = imports[importName];
		if (!importItem) {
			throw new Error(`Unable to find import with name:${importName}!`);
		}
		const {
			project,
			path,
			query,
			rendition
		} = importItem;
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
