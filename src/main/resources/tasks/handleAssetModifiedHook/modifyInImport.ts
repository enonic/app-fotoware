// Enonic modules
import {
	get as getContentByKey
	// @ts-ignore
} from '/lib/xp/content';

// @ts-ignore
import {run as runInContext} from '/lib/xp/context';

// @ts-ignore
import {executeFunction} from '/lib/xp/task';

// FotoWare modules
// @ts-ignore
import {query as doQuery} from '/lib/fotoware/api/query';

// @ts-ignore
import {queryForFilename} from '/lib/fotoware/xp/queryForFilename';

import {MediaContent} from '/lib/fotoware/xp/MediaContent';
import {handleAsset} from '/tasks/handleAssetModifiedHook/handleAsset'


interface ModifyInImportParams {
	readonly accessToken :string
	readonly archiveName :string
	readonly fileNameNew :string
	readonly fileNameOld :string
	readonly hostname :string
	readonly path :string
	readonly project :string
	readonly properties :unknown
	readonly query :string
	readonly rendition :string
	readonly renditionRequest :string
	readonly searchURL :string
}


export function modifyInImport({
	accessToken,
	archiveName,
	fileNameNew,
	fileNameOld,
	hostname,
	path,
	project,
	properties,
	query,
	rendition,
	renditionRequest,
	searchURL
} :ModifyInImportParams) :void {
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

			// This can't be moved outside an import, because the query is different for each import.
			const doQueryParams = {
				accessToken,
				blacklistedCollections: {}, // NOTE Intentional hardcode
				hostname,
				q: `(${query})AND(fn:${fileNameNew})`,
				searchURL,
				whitelistedCollections: { // NOTE Intentional hardcode
					[archiveName]: true
				}
			};
			const queryResult = doQuery(doQueryParams);
			//log.info(`queryResult:${toStr(queryResult)}`);

			if (queryResult.assetCountTotal === 0) {
				log.warning(`fileNameNew:${fileNameNew} not found when querying`);
				return;
			}

			if (queryResult.assetCountTotal > 1) {
				log.error(`Querying for fileNameNew:${fileNameNew} returned more than one asset!`);
				return;
			}

			handleAsset({
				accessToken,
				asset: queryResult.collections[0].assets[0],
				exisitingMediaContent,
				fileNameNew,
				fileNameOld,
				hostname,
				path,
				project,
				properties,
				rendition,
				renditionRequest
			});
		} // task
	})); // runInContext
}
