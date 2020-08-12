/*
IF !exist -> download -> create -> return
IF exist
	IF assetHref -> skip -> return
	IF !assetHref download and compare md5sum
	  IF !md5match -> throw collision
	  IF md5match -> add href
*/

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

function downloadAndReturnStreamAndMd5({
	accessToken,
	hostname,
	renditionServiceShortAbsolutePath,
	renditionUrl
}) {
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
	return {
		stream: downloadRenditionResponse.bodyStream,
		md5sum: md5sumOfDownload
	};
} // function downloadAndReturnStreamAndMd5

export function run(params) {
	//log.info(`params:${toStr(params)}`);
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
	//log.info(`fields:${toStr(fields)}`);

	if(!renditionServiceShortAbsolutePath) { throw new Error(`Required param renditionServiceShortAbsolutePath missing! params:${toStr(params)}`); }

	if(!assetHref) { throw new Error(`Required param assetHref missing! params:${toStr(params)}`); }
	if(!mediaName) { throw new Error(`Required param mediaName missing! params:${toStr(params)}`); }
	if(!metadata) { throw new Error(`Required param metadata missing! params:${toStr(params)}`); }
	try {
		metadata = JSON.parse(metadata)
	} catch (e) {
		throw new Error(`Something went wrong when trying to parse fields:${toStr(params)}`);
	}
	//log.info(`metadata:${toStr(metadata)}`);
	if(!renditionUrl) { throw new Error(`Required param renditionUrl missing! params:${toStr(params)}`); }

	const mediaPath = `/${path}/${mediaName}`;
	const exisitingMedia = getContentByKey({key: mediaPath});
	//log.info(`exisitingMedia:${toStr(exisitingMedia)}`);

	if (!exisitingMedia) {
		const {stream, md5sum} = downloadAndReturnStreamAndMd5({
			accessToken,
			hostname,
			renditionServiceShortAbsolutePath,
			renditionUrl
		});
		const createMediaResult = createMedia({
			name: mediaName,
			parentPath: `/${path}`,
			data: stream
		});
		if (!createMediaResult) {
			const mediaPath = `/${path}/${mediaName}`;
			const errMsg = `Something went wrong when creating mediaPath:${mediaPath}!`;
			log.error(errMsg);
			throw new Error(errMsg);
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
				//log.info(`node:${toStr(node)}`);
				let fotoWareXData;
				try {
					if (!node.x) {
						node.x = {}; // eslint-disable-line no-param-reassign
					}
					fotoWareXData = {
						fotoWare: {
							hrefs: assetHref, // NOTE Might be multiple
							metadata: metadataArray,
							md5sum
						}
					}
					node.x[X_APP_NAME] = fotoWareXData; // eslint-disable-line no-param-reassign
				} catch (e) {
					// Value of type [com.enonic.xp.data.PropertySet] cannot be converted to [Reference]
					log.error(`node:${toStr(node)}`);
					log.error(`fotoWareXData:${toStr(fotoWareXData)}`);
					log.error(`e:${toStr(e)}`);
					log.error(e);
					throw e;
				}
				return node;
			}, // editor
			requireValid: false // Not under site so there is no x-data definitions
		}); // modifyContent
		//log.info(`modifiedMedia:${toStr(modifiedMedia)}`);
		return; // Finish task successfully
	} // !exisitingMedia

	let {
		x: {
			[X_APP_NAME]: {
				fotoWare: {
					hrefs: exisitingMediaHrefs,
					md5sum: exisitingMediaMd5sum
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
		return; // Finish task
	}

	const {md5sum} = downloadAndReturnStreamAndMd5({
		accessToken,
		hostname,
		renditionServiceShortAbsolutePath,
		renditionUrl
	});

	if (exisitingMediaMd5sum && exisitingMediaMd5sum !== md5sum) {
		const errMsg = `Hash collision for mediaName:${mediaName} exisitingMediaMd5sum:${exisitingMediaMd5sum} md5sumOfDownload:${md5sum}!`;
		log.error(errMsg);
		throw errMsg;
	}

	// At this point media exist, matches md5sum, but is missing assetHref
	exisitingMediaHrefs.push(assetHref);
	modifyContent({
		key: mediaPath,
		editor: (node) => {
			node.x[X_APP_NAME].fotoWare.hrefs = exisitingMediaHrefs;
		},
		requireValid: false // Not under site so there is no x-data definitions
	}); // modifyContent
	// Let task finish successfully
} // function run
