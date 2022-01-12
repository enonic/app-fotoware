import {toStr} from '@enonic/js-utils';
//import '@enonic/nashorn-polyfills'; // Needed by uuid
//import { v4 as uuidv4 } from 'uuid';
import getIn from 'get-value';

// Enonic modules
// @ts-ignore
import {URL} from '/lib/galimatias';
// @ts-ignore
import {validateLicense} from '/lib/license';
// @ts-ignore
import {generatePassword} from '/lib/xp/auth';
// @ts-ignore
import {run as runInContext} from '/lib/xp/context';
// @ts-ignore
import {sanitize} from '/lib/xp/common';
import {
	create as scheduleTask//,
	//delete as deleteTask,
	//get as getTask
	// @ts-ignore
} from '/lib/xp/scheduler';

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


const A_MINUTE_IN_MS = 60 * 1000;


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

	let fileNameNewVar :string, fileNameOldVar :string, hrefFromHookVar :string;
	try {
		fileNameNewVar = getIn(body, 'data.asset.filename');
		fileNameOldVar = getIn(body, 'previous-name');
		hrefFromHookVar = getIn(body, 'href');
		if (!fileNameNewVar) {
			throw new Error(`Unable to get fileNameNew from data.asset.filename in body:${toStr(body)}`);
		}
		if (!fileNameOldVar) {
			log.debug(`Unable to get fileNameOld from previous-name in body:${toStr(body)}`);
			fileNameOldVar = fileNameNewVar; // When previous-name is not present, it's not a rename, just a metadata change.
		}
		if (!hrefFromHookVar) {
			throw new Error(`Unable to get hrefFromHook from href in body:${toStr(body)}`);
		}
	} catch (e) {
		log.error(`Something is wrong with asset modified body:${toStr(body)}`, e);
		return {status: 400};
	}
	const fileNameNew = fileNameNewVar;
	const fileNameOld = fileNameOldVar;
	const hrefFromHook = hrefFromHookVar;
	//log.debug(`fileNameNew:${toStr(fileNameNew)}`);
	//log.debug(`fileNameOld:${toStr(fileNameOld)}`);
	//log.debug(`hrefFromHook:${toStr(hrefFromHook)}`);

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
	runInContext({
		repository: 'system-scheduler',
		branch: 'master',
		user: {
			login: 'su', // So Livetrace Tasks reports correct user
			idProvider: 'system'
		},
		principals: ['role:system.admin']
	}, () => {
		const taskDescriptor = `${app.name}:handleAssetModifiedHook`;
		scheduleTask({
			config: {
				fileNameNew,
				fileNameOld,
				siteName
			} as HandleAssetModifiedParams,
			description: `Handle asset modified webhook for site:${siteName} file:${fileNameNew}`,
			descriptor: taskDescriptor,
			enabled: true,
			//name: `${taskDescriptor}-${uuidv4()}`, // unique job name // ERROR For some reason this fails!!!
			name: `${taskDescriptor}-${sanitize(generatePassword())}`, // unique job name
			schedule: {
				// timeZone is optional for type: 'ONE_TIME'
				type: 'ONE_TIME',
				value: new Date(Date.now() + A_MINUTE_IN_MS).toISOString()
			}//,
			//user: 'user:system:su' // string | optional | principal key of the user that submitted the task
		}); // scheduleTask
	}); // runInContext
	return {
		body: {},
		contentType: 'application/json;charset=utf-8'
	};
}; // assetModified
