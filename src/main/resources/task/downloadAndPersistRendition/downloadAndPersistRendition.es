import {md5} from '/lib/text-encoding';
import {toStr} from '/lib/util';
import {sanitize} from '/lib/xp/common';
import {
	//create as createContent,
	createMedia,
	//getAttachmentStream,
	get as getContentByKey,
	modify as modifyContent
} from '/lib/xp/content';
import {readText} from '/lib/xp/io';
//import {progress} from '/lib/xp/task';
import {requestRendition} from '/lib/fotoware/api/requestRendition';

const X_APP_NAME = sanitize(app.name).replace(/\./g, '-');

export function run(params) {
	const {
		// From config
		hostname,
		path,
		// From API
		accessToken,
		renditionServiceShortAbsolutePath,
		// From asset
		assetHref,
		mediaName,
		renditionUrl
	} = params;
	let {
		fields, // Json
		metadata // Json
	} = params;
	if(!hostname) { throw new Error(`Required param hostname missing! params:${toStr(params)}`); }
	if(!path) { throw new Error(`Required param path missing! params:${toStr(params)}`); }

	if(!accessToken) { throw new Error(`Required param accessToken missing! params:${toStr(params)}`); }
	if(!fields) { throw new Error(`Required param fields missing! params:${toStr(params)}`); }
	try {
		fields = JSON.parse(fields)
	} catch (e) {
		throw new Error(`Something went wrong when trying to parse fields:${toStr(params)}`);
	}
	if(!renditionServiceShortAbsolutePath) { throw new Error(`Required param renditionServiceShortAbsolutePath missing! params:${toStr(params)}`); }

	if(!assetHref) { throw new Error(`Required param assetHref missing! params:${toStr(params)}`); }
	if(!mediaName) { throw new Error(`Required param mediaName missing! params:${toStr(params)}`); }
	if(!metadata) { throw new Error(`Required param metadata missing! params:${toStr(params)}`); }
	try {
		metadata = JSON.parse(metadata)
	} catch (e) {
		throw new Error(`Something went wrong when trying to parse fields:${toStr(params)}`);
	}
	if(!renditionUrl) { throw new Error(`Required param renditionUrl missing! params:${toStr(params)}`); }

	const mediaPath = `/${path}/${mediaName}`;
	const exisitingMedia = getContentByKey({key: mediaPath});
	let {
		x: {
			[X_APP_NAME]: {
				fotoWare: {
					hrefs: exisitingMediaHrefs//,
					//md5sum: exisitingMediaMd5sum
				} = {}
			} = {}
		} = {}
	} = exisitingMedia;
	if (!exisitingMediaHrefs) {
		log.warning(`A media was created without reference to it's assetUrl mediaPath:${mediaPath}`);
		exisitingMediaHrefs = [];
	} else if (!Array.isArray(exisitingMediaHrefs)) {
		exisitingMediaHrefs = [exisitingMediaHrefs];
	}
	if(exisitingMediaHrefs.includes(assetHref)) {
		log.info(`Skipping assetHref:${assetHref} already found in mediaPath:${mediaPath}`);
		return;
	}

	const downloadRenditionResponse = requestRendition({
		accessToken,
		hostname,
		renditionServiceShortAbsolutePath,
		renditionUrl
	});
	if (!downloadRenditionResponse) {
		throw new Error(`Something went wrong when downloading rendition for renditionUrl:${renditionUrl}!`);
	}
	const md5sumOfDownload = md5(readText(downloadRenditionResponse.bodyStream));
	const createMediaResult = createMedia({
		name: mediaName,
		parentPath: `/${path}`,
		data: downloadRenditionResponse.bodyStream
	});
	if (!createMediaResult) {
		const mediaPath = `/${path}/${mediaName}`;
		throw new Error(`Something went wrong when creating mediaPath:${mediaPath}!`);
	}
	const metadataArray = Object.keys(metadata).map((k) => {
		if (!fields[k]) {
			log.error(`Unable to find field:${k} metadata[${k}]:${toStr(metadata[k])} assetHref:${assetHref}`);
			return null;
		}
		return {
			id: k,
			label: fields[k].label,
			/*'multi-instance'
			'max-size'
			multiline
			data-type
			"validation": {
				"regexp": null,
				"max": null,
				"min": null
			},
			taxonomyHref*/
			values: metadata[k].value
		};
	}).filter((x) => x); // remove null entries
	//log.info(`metadataArray:${toStr(metadataArray)}`);

	modifyContent({
		key: createMediaResult._id,
		editor: (node) => {
			let fotoWareXData;
			try {
				log.info(`node:${toStr(node)}`);
				//log.info(`node.type:${toStr(node.type)}`);
				if (!node.x) {
					node.x = {}; // eslint-disable-line no-param-reassign
				}
				fotoWareXData = {
					fotoWare: {
						hrefs: assetHref, // NOTE Might be multiple
						metadata: metadataArray,
						md5sum: md5sumOfDownload
					}
				}
				node.x[X_APP_NAME] = fotoWareXData; // eslint-disable-line no-param-reassign
			} catch (e) {
				// Value of type [com.enonic.xp.data.PropertySet] cannot be converted to [Reference]
				log.error(`node:${toStr(node)}`);
				log.error(`fotoWareXData:${toStr(fotoWareXData)}`);
				throw e;
			}
			return node;
		}, // editor
		requireValid: false // Not under site so there is no x-data definitions
	}); // modifyContent
	//log.info(`modifiedMedia:${toStr(modifiedMedia)}`);
} // function run
