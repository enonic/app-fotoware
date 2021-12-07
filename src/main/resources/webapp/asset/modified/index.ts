// Enonic modules
// @ts-ignore
import {URL} from '/lib/galimatias';
// @ts-ignore
import {validateLicense} from '/lib/license';
// @ts-ignore
import {toStr} from '/lib/util';
// @ts-ignore
import {executeFunction} from '/lib/xp/task';

// FotoWare modules
// @ts-ignore
import {getAccessToken} from '/lib/fotoware/api/getAccessToken';
// @ts-ignore
import {getPrivateFullAPIDescriptor} from '/lib/fotoware/api/getPrivateFullAPIDescriptor';
// @ts-ignore
import {getConfigFromAppCfg} from '/lib/fotoware/xp/getConfigFromAppCfg';
// @ts-ignore
import {buildLicensedTo} from '/lib/fotoware/xp/buildLicensedTo';
// @ts-ignore
import {isLicenseValid} from '/lib/fotoware/xp/isLicenseValid'

import {modifyInImport} from './modifyInImport';


import {AssetModified} from '../../../lib/fotoware/Fotoware';
import {SiteConfig/*, SitesConfig*/} from '../../../lib/fotoware/xp/AppConfig';
import {app, log} from '../../../lib/xp/globals';
import {Request} from '../../../lib/xp/Request';


export const assetModified = (request :Request) => {
	//log.debug(`request:${toStr(request)}`);

	const licenseDetails = validateLicense({appKey: app.name});
	//log.info(`licenseDetails:${toStr(licenseDetails)}`);

	if (!isLicenseValid(licenseDetails)) {
		log.error(buildLicensedTo(licenseDetails));
		return {status: 404};
	}

	const {
		sitesConfig// :SitesConfig
	} = getConfigFromAppCfg();
	//log.debug(`sitesConfigs:${toStr(sitesConfigs)}`);

	const {
		headers: {
			'User-Agent': userAgent
		},
		remoteAddress
	} = request;
	//log.debug(`remoteAddress:${toStr(remoteAddress)}`);
	//log.debug(`userAgent:${toStr(userAgent)}`);

	if (userAgent !== 'FotoWeb/8.0') {
		log.error(`Illegal userAgent in request! ${toStr(request)}`);
		return {status: 404};
	}

	let body :AssetModified;
	try {
		body = JSON.parse(request.body);
		log.debug(`body:${toStr(body)}`);
	} catch (e) {
		log.error(`Something went wrong when trying to parse request body ${toStr(request)}`);
		return {status: 404};
	}

	const {
		data: {
			//filename // Old format

			// New format
			//metadataDiff
			/*assetBefore: { // This format only existed for a short while?
				filename: fileNameOld
			} = {},*/
			asset: {
				filename: fileNameNew
			} = {}
		} = {},
		href: hrefFromHook, // FQDN
		'previous-name': fileNameOld
	} = body;
	//log.debug(`fileNameNew:${toStr(fileNameNew)}`);
	//log.debug(`fileNameOld:${toStr(fileNameOld)}`);
	//log.debug(`hrefFromHook:${toStr(hrefFromHook)}`);
	//log.debug(`filename:${toStr(filename)}`);

	if (fileNameOld.startsWith('.') || fileNameNew.startsWith('.')) {
		log.warning(`Skipping fileNameOld:${fileNameOld} fileNameNew:${fileNameNew} because it starts with a dot, so probabbly a hidden file.`);
		return {
			body: {},
			contentType: 'application/json;charset=utf-8'
		};
	}

	const url = new URL(hrefFromHook);
	const site = url.getHost().replace('.fotoware.cloud', '');
	//log.debug(`site:${toStr(site)}`);

	const siteConfig :SiteConfig = sitesConfig[site];
	if (!siteConfig) {
		log.debug(`sitesConfigs:${toStr(sitesConfig)}`);
		log.debug(`Object.keys(sitesConfigs):${toStr(Object.keys(sitesConfig))}`);
		log.error(`Can't find siteConfig for site:${site}!`);
		return {
			status: 500
		};
	}

	//log.debug(`sites:${toStr(sites)}`);
	const {
		archiveName,
		clientId,
		clientSecret,
		properties,
		remoteAddresses,
		url: hostname,
		imports
	} = siteConfig;
	//log.debug(`clientId:${toStr(clientId)}`);
	//log.debug(`clientSecret:${toStr(clientSecret)}`);
	//log.debug(`remoteAddresses:${toStr(remoteAddresses)}`);
	if (!Object.keys(remoteAddresses).includes(remoteAddress)) {
		log.error(`Illegal remoteaddress in request! ${toStr(request)}`);
		return {status: 404};
	}

	executeFunction({
		description: '',
		func: () => {
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
				modifyInImport({
					accessToken,
					archiveName,
					fileNameNew,
					fileNameOld,
					hostname,
					importName,
					imports,
					properties,
					renditionRequest,
					searchURL
				});
			}); // forEach import
		} // func
	}); // executeFunction
	return {
		body: {},
		contentType: 'application/json;charset=utf-8'
	};
}; // assetModified
