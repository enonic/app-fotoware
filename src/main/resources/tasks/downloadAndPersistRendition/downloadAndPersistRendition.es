/*
IF !exist -> download -> create -> return
IF exist
	IF assetHref -> skip -> return
	IF !assetHref download and compare md5sum
	  IF !md5match -> throw collision
	  IF md5match -> add href
*/

//import {md5} from '/lib/text-encoding';
import {toStr} from '/lib/util';
import {sanitize} from '/lib/xp/common';
import {
	//create as createContent,
	createMedia,
	//getAttachmentStream,
	get as getContentByKey,
	modify as modifyContent
} from '/lib/xp/content';
//import {readText} from '/lib/xp/io';
import {progress} from '/lib/xp/task';
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
	//const md5sumOfDownload = md5(readText(downloadRenditionResponse.bodyStream));
	return {
		stream: downloadRenditionResponse.bodyStream//,
		//md5sum: md5sumOfDownload
	};
} // function downloadAndReturnStreamAndMd5

export function run(params) {
	//log.info(`params:${toStr(params)}`);
	progress({
		current: 0,
		total: 2,
		info: 'Initializing'
	});

	const {
		// From config
		hostname,
		path,
		// From API
		accessToken,
		renditionServiceShortAbsolutePath,
		// From asset
		assetHref,
		filename,
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

	if (exisitingMedia) {
		//log.debug(`Skipped ${assetHref} already found in mediaPath:${mediaPath}`);
		progress({
			current: 1,
			total: 1,
			info: `Skipped ${assetHref} already found in mediaPath:${mediaPath}`
		});
		return; // Finish task successfully
	}

	if (!exisitingMedia) {
		progress({
			current: 1,
			total: 5,
			info: `Polling rendition ${renditionUrl}`
		});
		const {stream/*, md5sum*/} = downloadAndReturnStreamAndMd5({
			accessToken,
			hostname,
			renditionServiceShortAbsolutePath,
			renditionUrl
		});
		progress({
			current: 2,
			total: 5,
			info: `Creating media ${mediaPath}`
		});
		const createMediaResult = createMedia({
			parentPath: `/${path}`,
			name: mediaName,
			//displayName: filename, // Not a parameter
			data: stream
		});
		if (!createMediaResult) {
			const mediaPath = `/${path}/${mediaName}`;
			const errMsg = `Something went wrong when creating mediaPath:${mediaPath}!`;
			log.error(errMsg);
			throw new Error(errMsg);
		}

		progress({
			current: 3,
			total: 5,
			info: `Processing metadata for ${assetHref}`
		});
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

		progress({
			current: 4,
			total: 5,
			info: `Adding xdata to ${mediaPath}`
		});
		modifyContent({
			key: createMediaResult._id,
			editor: (node) => {
				//log.info(`node:${toStr(node)}`);
				let fotoWareXData;
				try {
					node.displayName = filename;
					if (!node.x) {
						node.x = {}; // eslint-disable-line no-param-reassign
					}
					fotoWareXData = {
						fotoWare: {
							//hrefs: assetHref, // NOTE Might be multiple
							metadata: metadataArray//,
							//md5sum
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
		progress({
			current: 5,
			total: 5,
			info: `Finished processing ${assetHref} to ${mediaPath}`
		});
		return; // Finish task successfully
	} // !exisitingMedia

	/*let {
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
		progress({
			current: 1,
			total: 1,
			info: `Skipped ${assetHref} already found in mediaPath:${mediaPath}`
		});
		return; // Finish task
	}

	progress({
		current: 1,
		total: 4,
		info: `Polling rendition ${renditionUrl}`
	});
	const {md5sum} = downloadAndReturnStreamAndMd5({
		accessToken,
		hostname,
		renditionServiceShortAbsolutePath,
		renditionUrl
	});

	progress({
		current: 2,
		total: 4,
		info: `Checking md5 for ${mediaPath}`
	});
	if (exisitingMediaMd5sum && exisitingMediaMd5sum !== md5sum) {
		const errMsg = `Hash collision for mediaName:${mediaName} exisitingMediaMd5sum:${exisitingMediaMd5sum} md5sumOfDownload:${md5sum}!`;
		log.error(errMsg);
		throw errMsg;
	}

	// At this point media exist, matches md5sum, but is missing assetHref
	exisitingMediaHrefs.push(assetHref);
	progress({
		current: 3,
		total: 4,
		info: `Adding ${assetHref} to ${mediaPath}`
	});
	modifyContent({
		key: mediaPath,
		editor: (node) => {
			try {
				node.x[X_APP_NAME].fotoWare.hrefs = exisitingMediaHrefs;
			} catch (e) {
				// Value of type [com.enonic.xp.data.PropertySet] cannot be converted to [Reference]
				log.error(`Unable to add assetHref:${assetHref} in node:${toStr(node)}`);
				//throw e;
			}
			return node;
		},
		requireValid: false // Not under site so there is no x-data definitions
	}); // modifyContent
	// Let task finish successfully
	progress({
		current: 4,
		total: 4,
		info: `Finished processing ${assetHref} to ${mediaPath}`
	});
	*/
} // function run
