import type {AssetModified} from '/lib/fotoware';
import type {Request} from '/lib/xp/Request';
import type {HandleAssetModifiedParams} from '/tasks/handleAssetModifiedHook/handleAssetModifiedHook';



import {
	arrayIncludes,
	startsWith,
	toStr
} from '@enonic/js-utils';
//import '@enonic/nashorn-polyfills'; // Needed by uuid
//import { v4 as uuidv4 } from 'uuid';
import getIn from 'get-value';

// Enonic modules
// @ts-ignore
import {URL} from '/lib/galimatias';
// @ts-ignore
import {validateLicense} from '/lib/license';
import {generatePassword} from '/lib/xp/auth';
import {run as runInContext} from '/lib/xp/context';
import {sanitize} from '/lib/xp/common';
import {
	create as scheduleTask//,
	//delete as deleteTask,
	//get as getTask
} from '/lib/xp/scheduler';

import {SUPPORTED_USERAGENTS} from '/lib/fotoware/constants';
// FotoWare modules
import {getConfigFromAppCfg} from '/lib/fotoware/xp/getConfigFromAppCfg';
import {buildLicensedTo} from '/lib/fotoware/xp/buildLicensedTo';
import {isLicenseValid} from '/lib/fotoware/xp/isLicenseValid';
import {
	CHECK_REMOTE_ADDRESS,
	DEBUG_INCOMING_REQUESTS
} from '/constants';


const A_MINUTE_IN_MS = 60 * 1000;


export const assetModified = (request: Request) => {
	DEBUG_INCOMING_REQUESTS && log.debug('assetModified request:%s', toStr(request));

	const licenseDetails = validateLicense({appKey: app.name});
	//log.info(`licenseDetails:${toStr(licenseDetails)}`);

	if (!isLicenseValid(licenseDetails)) {
		log.error(buildLicensedTo(licenseDetails));
		return {status: 404};
	}

	const {
		headers: {
			'User-Agent': userAgent
		} = {},
		remoteAddress
	} = request;
	//log.debug(`remoteAddress:${toStr(remoteAddress)}`);
	//log.debug(`userAgent:${toStr(userAgent)}`);

	if (!request.body) {
		log.error(`Request without body ${toStr(request)}`);
		return {status: 404};
	}

	if (!remoteAddress) {
		log.error(`Request without remoteAddress ${toStr(request)}`);
		return {status: 404};
	}

	if (!userAgent) {
		log.error(`Missing userAgent in request! ${toStr(request)}`);
		return {status: 404};
	}

	if (!arrayIncludes(SUPPORTED_USERAGENTS, userAgent)) {
		log.error(`Illegal userAgent in request! ${toStr(request)}`);
		return {status: 404};
	}

	let body;
	try {
		body = JSON.parse(request.body) as AssetModified;
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

	if (startsWith(fileNameOld, '.') || startsWith(fileNameNew, '.')) {
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

	const siteConfig = sitesConfigs[siteName];
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
	if (CHECK_REMOTE_ADDRESS && !arrayIncludes(Object.keys(remoteAddresses), remoteAddress)) {
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
		scheduleTask<HandleAssetModifiedParams>({
			config: {
				fileNameNew,
				fileNameOld,
				siteName
			},
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
