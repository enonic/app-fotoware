import {syncSiteFlat} from '/lib/fotoware/xp/syncSiteFlat';
import {toStr} from '/lib/util';
import {run as runInContext} from '/lib/xp/context';

export function run(params) {
	//log.info(`params:${toStr(params)}`);

	const {
		clientId,
		clientSecret,
		docTypesJson,
		path,
		project,
		remoteAddressesJson,
		url
	} = params;

	if(!clientId) { throw new Error(`Required param clientId missing! params:${toStr(params)}`); }
	if(!clientSecret) { throw new Error(`Required param clientSecret missing! params:${toStr(params)}`); }
	if(!docTypesJson) { throw new Error(`Required param docTypesJson missing! params:${toStr(params)}`); }
	if(!path) { throw new Error(`Required param path missing! params:${toStr(params)}`); }
	if(!project) { throw new Error(`Required param project missing! params:${toStr(params)}`); }
	if(!remoteAddressesJson) { throw new Error(`Required param remoteAddressesJson missing! params:${toStr(params)}`); }
	if(!url) { throw new Error(`Required param url missing! params:${toStr(params)}`); }

	let docTypes;
	try {
		docTypes = JSON.parse(docTypesJson)
	} catch (e) {
		throw new Error(`Something went wrong when trying to parse docTypesJson:${toStr(params)}`);
	}
	//log.info(`docTypes:${toStr(docTypes)}`);

	let remoteAddresses;
	try {
		remoteAddresses = JSON.parse(remoteAddressesJson)
	} catch (e) {
		throw new Error(`Something went wrong when trying to parse remoteAddressesJson:${toStr(params)}`);
	}
	log.info(`remoteAddresses:${toStr(remoteAddresses)}`);
	runInContext({
		repository: `com.enonic.cms.${project}`,
		branch: 'draft',
		user: {
			login: 'su', // So Livetrace Tasks reports correct user
			idProvider: 'system'
		},
		principals: ['role:system.admin']
	}, () => syncSiteFlat({
		clientId,
		clientSecret,
		docTypes,
		path,
		project,
		remoteAddresses,
		url
	}));
} // export function run
