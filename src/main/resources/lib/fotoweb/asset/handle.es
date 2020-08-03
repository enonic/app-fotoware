/* eslint-disable no-param-reassign */
import humanFileSize from 'filesize';

import {sanitize} from '/lib/xp/common';
import {toStr} from '/lib/util';
import {progress} from '/lib/xp/task';
import {
	createMedia,
	exists,
	modify as modifyContent,
	publish
} from '/lib/xp/content';

import {requestRendition} from '../requestRendition';

const SANITIZED_APP_NAME = sanitize(app.name);

export const handleAsset = ({
	asset,

	// Task related
	stateObj,
	progressObj,

	// Config related
	hostname,
	renditionRequest,
	selectedDocTypes,
	selectedExtensions,

	accessToken,
	collectionName,
	collectionContentPath,
	fields
}) => {
	//log.info(`asset:${toStr(asset)}`);
	const {
		doctype,
		filename,
		filesize,
		metadata,
		renditions
	} = asset;
	stateObj.allFilesSize += filesize;
	/*const extention = filename.replace(/[^.]+\./, '');
	if (!foundDocTypes.includes(doctype)) {
		foundDocTypes.push(doctype);
		log.info(`Found new doctype:${doctype} foundDocTypes:${toStr(foundDocTypes)}`);
	}
	if (!foundExtentions.includes(extention)) {
		foundExtentions.push(extention);
		log.info(`Found new extention:${extention} foundExtentions:${toStr(foundExtentions)}`);
	}
	if (!foundDocTypesAndExtentions[doctype]) {
		foundDocTypesAndExtentions[doctype] = [];
	}
	if (!foundDocTypesAndExtentions[doctype].includes(extention)) {
		foundDocTypesAndExtentions[doctype].push(extention);
		log.info(`Found new extention:${extention} in doctype:${doctype} foundDocTypesAndExtentions:${toStr(foundDocTypesAndExtentions)}`);
	}*/
	//log.info(`renditions:${toStr(renditions)}`);

	const extention = filename.replace(/.+\./, '').toLowerCase();
	if (selectedDocTypes.includes(doctype) && selectedExtensions.includes(extention)) {
		stateObj.includedFilesCount += 1;
		stateObj.includedFilesSize += filesize;
		progressObj.info = `Syncing asset ${filename} in private collection ${collectionName}`;
		progress(progressObj);
		const existsKey = `${collectionContentPath}/${filename}`;
		//log.info(`existsKey:${toStr(existsKey)}`);
		if (exists({key: existsKey})) {
			log.info(`Skipping ${existsKey}, already exists.`);
		} else {
			stateObj.syncedThisTimeFilesCount += 1;
			stateObj.syncedThisTimeFilesSize += filesize;
			const {
				href: renditionHref/*,
				display_name: displayName,
				description,
				width,
				height,
				default: isDefault,
				original,
				sizeFixed,
				profile*/
			} = renditions
				.filter(({original}) => original === true)[0];
				//.filter(({display_name: displayName}) => displayName === 'Original File')[0];
				//.filter(({default: isDefault}) => isDefault === true)[0];
				//.sort((a, b) => a.size - b.size)[0]; // Smallest images
				//.sort((a, b) => b.size - a.size)[0]; // Largest images

			// WARNING These renditions might not exist!
			//.filter(({display_name: displayName}) => displayName === 'JPG CMYK')[0];
			//.filter(({display_name: displayName}) => displayName === 'JPG sRGB')[0];
			//.filter(({display_name: displayName}) => displayName === 'TIFF JPG CMYK')[0]; // size = 0 ???

			const downloadRenditionResponse = requestRendition({
				accessToken,
				//cookies,
				hostname,
				renditionServiceShortAbsolutePath: renditionRequest,
				renditionUrl: renditionHref
			});
			if (downloadRenditionResponse) {
				//log.info(`downloadRenditionResponse:${toStr(downloadRenditionResponse)}`);
				//log.info(`parentPath:${toStr(parentPath)}`);

				const createMediaResult = createMedia({
					name: filename,
					parentPath: collectionContentPath,
					//mimeType: downloadRenditionResponse.contentType,
					data: downloadRenditionResponse.bodyStream
				});
				//log.info(`createMediaResult:${toStr(createMediaResult)}`);
				//const publishResult =

				//log.info(`metadata:${toStr(metadata)}`);
				const metadataArray = Object.keys(metadata).map((k) => {
					if (!fields[k]) {
						log.error(`Unable to find field:${toStr(k)} metadata:${toStr(metadata)}`);
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
				log.info(`metadataArray:${toStr(metadataArray)}`);

				modifyContent({
					key: createMediaResult._id,
					editor: (node) => {
						log.info(`node:${toStr(node)}`);
						log.info(`node.type:${toStr(node.type)}`);
						if (!node.x) {
							node.x = {}; // eslint-disable-line no-param-reassign
						}
						node.x[SANITIZED_APP_NAME] = { // eslint-disable-line no-param-reassign
							fotoWare: {
								metadata: metadataArray
							}
						};
						return node;
					}, // editor
					requireValid: true
				}); // modifyContent
				publish({
					keys: [createMediaResult._id],
					sourceBranch: 'draft',
					targetBranch: 'master',
					includeDependencies: false // default is true
				});
				//log.info(`publishResult:${toStr(publishResult)}`);
			}
			log.info(`state:${toStr({
				allFilesCount: stateObj.allFilesCount,
				includedFilesCount: stateObj.includedFilesCount,
				excludedFilesCount: stateObj.allFilesCount - stateObj.includedFilesCount,
				syncedThisTimeFilesCount: stateObj.syncedThisTimeFilesCount,
				exsistingFilesCount: stateObj.includedFilesCount - stateObj.syncedThisTimeFilesCount,
				allFilesSize: `${humanFileSize(stateObj.allFilesSize)} (${stateObj.allFilesSize})`,
				includedFilesSize: `${humanFileSize(stateObj.includedFilesSize)} (${stateObj.includedFilesSize})`,
				syncedThisTimeFilesSize: `${humanFileSize(stateObj.syncedThisTimeFilesSize)} (${stateObj.syncedThisTimeFilesSize})`
			})}`);
		} // if !exist media content
	} else {
		log.info(`Skipping filename:${filename}, not included.`);
	} // if doctype && extension
	progressObj.current += 1; // Finished syncing a private asset
}; // handleAsset
