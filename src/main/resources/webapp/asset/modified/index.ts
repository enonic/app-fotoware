// Enonic modules
// @ts-ignore
import {URL} from '/lib/galimatias';
// @ts-ignore
import {validateLicense} from '/lib/license';
import {toStr} from '@enonic/js-utils';
// @ts-ignore
import {submitTask} from '/lib/xp/task';

// FotoWare modules
import {getConfigFromAppCfg} from '/lib/fotoware/xp/getConfigFromAppCfg';

// @ts-ignore
import {buildLicensedTo} from '/lib/fotoware/xp/buildLicensedTo';
// @ts-ignore
import {isLicenseValid} from '/lib/fotoware/xp/isLicenseValid'


import {AssetModified} from '/lib/fotoware/Fotoware';
import {SiteConfig} from '/lib/fotoware/xp/AppConfig';
import {Request} from '/lib/xp/Request';
import {HandleAssetModifiedParams} from '/tasks/handleAssetModifiedHook/handleAssetModifiedHook';


export const assetModified = (request :Request) => {
	//log.debug(`request:${toStr(request)}`);

	const licenseDetails = validateLicense({appKey: app.name});
	//log.info(`licenseDetails:${toStr(licenseDetails)}`);

	if (!isLicenseValid(licenseDetails)) {
		log.error(buildLicensedTo(licenseDetails));
		return {status: 404};
	}

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
			status: 200
		};
	}

	const url = new URL(hrefFromHook);
	const siteName :string = url.getHost().replace('.fotoware.cloud', '');
	//log.debug(`site:${toStr(site)}`);

	const {
		sitesConfigs
	} = getConfigFromAppCfg();
	//log.debug(`sitesConfigs:${toStr(sitesConfigs)}`);

	const siteConfig :SiteConfig = sitesConfigs[siteName];
	if (!siteConfig) {
		log.debug(`sitesConfigs:${toStr(sitesConfigs)}`);
		log.debug(`Object.keys(sitesConfigs):${toStr(Object.keys(sitesConfigs))}`);
		log.error(`Can't find siteConfig for site:${siteName}!`);
		return {
			status: 500
		};
	}

	const {
		remoteAddresses
	} = siteConfig;
	//log.debug(`remoteAddresses:${toStr(remoteAddresses)}`);
	if (!Object.keys(remoteAddresses).includes(remoteAddress)) {
		log.error(`Illegal remoteaddress in request! ${toStr(request)}`);
		return {status: 404};
	}
	submitTask({
		descriptor: 'handleAssetModifiedHook',
		config: {
			fileNameNew,
			fileNameOld,
			siteName
		} as HandleAssetModifiedParams
	});
	return {
		body: {},
		contentType: 'application/json;charset=utf-8'
	};
}; // assetModified
