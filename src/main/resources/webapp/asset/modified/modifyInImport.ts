// Enonic modules
// @ts-ignore
import {md5} from '/lib/text-encoding';

import {
	get as getContentByKey,
	// @ts-ignore
} from '/lib/xp/content';

// @ts-ignore
import {run as runInContext} from '/lib/xp/context';

// @ts-ignore
import {readText} from '/lib/xp/io';

// @ts-ignore
import {executeFunction} from '/lib/xp/task';

// FotoWare modules
// @ts-ignore
import {query as doQuery} from '/lib/fotoware/api/query';

// @ts-ignore
import {requestRendition} from '/lib/fotoware/api/requestRendition';

// @ts-ignore
import {queryForFilename} from '/lib/fotoware/xp/queryForFilename';

import {MediaContent} from '../../../lib/fotoware/xp/MediaContent';
import {handleExistingMediaContent} from './handleExistingMediaContent';
import {handleMissingMediaContent} from './handleMissingMediaContent';


interface ModifyInImportParams {
	readonly accessToken :string
	readonly archiveName :string
	readonly fileNameNew :string
	readonly fileNameOld :string
	readonly hostname :string
	readonly importName :string
	imports :unknown
	readonly properties :unknown
	readonly renditionRequest :string
	readonly searchURL :string
}


export function modifyInImport({
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
} :ModifyInImportParams) :void {
	const {
		project,
		path,
		query,
		rendition
	} = imports[importName];
	runInContext({
		repository: `com.enonic.cms.${project}`,
		branch: 'draft',
		user: {
			login: 'su', // So Livetrace Tasks reports correct user
			idProvider: 'system'
		},
		principals: ['role:system.admin']
	}, () => executeFunction({
		description: '',
		func: () :void => {
			const contentQueryResult = queryForFilename({
				filename: fileNameOld,
				path
			});
			let exisitingMediaContent :MediaContent;
			if (contentQueryResult.total === 0) {
				// Even though no media has been found tagged with filename, older versions of the integration might have synced the file already...
				exisitingMediaContent = getContentByKey({key: `/${path}/${fileNameOld}`});
			} else if (contentQueryResult.total === 1) {
				exisitingMediaContent = contentQueryResult.hits[0];
			} else if (contentQueryResult.total > 1) {
				log.error(`Found more than one content with FotoWare fileNameOld:${fileNameOld} ids:${contentQueryResult.hits.map(({_id}) => _id).join(', ')}`);
				return;
			}

			if (!exisitingMediaContent) {
				log.error(`path:${path} fileNameOld:${fileNameOld} not found! Perhaps missed assetIngested, or assetDeleted arrived before assetModified.`);
			}

			const queryResult = doQuery({
				accessToken,
				blacklistedCollections: {}, // NOTE Intentional hardcode
				hostname,
				q: `(${query})AND(fn:${fileNameNew})`,
				searchURL,
				whitelistedCollections: { // NOTE Intentional hardcode
					[archiveName]: true
				}
			});
			//log.info(`queryResult:${toStr(queryResult)}`);

			const {
				assetCountTotal,
				collections
			} = queryResult;

			if (assetCountTotal === 0) {
				log.warning(`fileNameNew:${fileNameNew} not found when querying!`);
			} else if (assetCountTotal > 1) {
				log.error(`Querying for fileNameNew:${fileNameNew} returned more than one asset!`);
			} else {
				const {
					//doctype,
					filename: filenameFromQuery, // Should match or query is weird
					//filesize,
					//href,
					metadata,
					//metadataObj,
					//renditionHref
					renditions
				} = collections[0].assets[0];
				//log.info(`filenameFromQuery:${toStr(filenameFromQuery)}`);
				//log.info(`metadata:${toStr(metadata)}`);
				if (fileNameNew !== filenameFromQuery) {
					throw new Error(`fileNameNew:${fileNameNew} from assetModified does not match filename:${filenameFromQuery} from query result`);
				}
				const renditionsObj = {};
				renditions.forEach(({
					//default,
					//description,
					display_name,
					//height,
					href: aRenditionHref//,
					//original,
					//profile,
					//sizeFixed,
					//width
				}) => {
					//log.debug(`display_name:${display_name} href:${href} height:${height} width:${width}`);
					renditionsObj[display_name] = aRenditionHref;
				});
				//log.debug(`renditionsObj:${toStr(renditionsObj)}`);

				const renditionUrl = renditionsObj[rendition] || renditionsObj['Original File'];

				const downloadRenditionResponse = requestRendition({
					accessToken,
					hostname,
					renditionServiceShortAbsolutePath: renditionRequest,
					renditionUrl
				});
				if (!downloadRenditionResponse) {
					throw new Error(`Something went wrong when downloading rendition for renditionUrl:${renditionUrl}!`);
				}
				const md5sumOfDownload = md5(readText(downloadRenditionResponse.bodyStream));
				//log.info(`md5sumOfDownload:${toStr(md5sumOfDownload)}`);

				if (exisitingMediaContent) {
					return handleExistingMediaContent({
						exisitingMediaContent,
						downloadRenditionResponse,
						fileNameNew,
						fileNameOld,
						md5sumOfDownload,
						metadata,
						project,
						properties
					});
				}

				handleMissingMediaContent({
					downloadRenditionResponse,
					fileNameNew,
					metadata,
					md5sumOfDownload,
					path,
					properties
				});
			} // if assetCountTotal
		} // task
	})); // runInContext
}
