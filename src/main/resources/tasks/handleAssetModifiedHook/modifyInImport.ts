import type {
	AccessToken,
	ArchiveName,
	Filename,
	Hostname,
	MediaContent,
	Path,
	Project,
	Query,
	RenditionRequest,
	RenditionString,
	SearchURL,
	SiteConfig
} from '/lib/fotoware';


// Enonic modules
import {get as getContentByKey} from '/lib/xp/content';
import {run as runInContext} from '/lib/xp/context';
import {executeFunction} from '/lib/xp/task';

// FotoWare modules
import {query as doQuery} from '/lib/fotoware/api/query';
import {queryForFilename} from '/lib/fotoware/xp/queryForFilename';
import {handleAsset} from '/tasks/handleAssetModifiedHook/handleAsset'


interface ModifyInImportParams {
	readonly accessToken: AccessToken
	readonly archiveName: ArchiveName
	readonly fileNameNew: Filename
	readonly fileNameOld: Filename
	readonly hostname: Hostname
	readonly path: Path
	readonly project: Project
	readonly properties: SiteConfig['properties']
	readonly query: Query
	readonly rendition: RenditionString
	readonly renditionRequest: RenditionRequest
	readonly searchURL: SearchURL
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
			let exisitingMediaContent :MediaContent|null|undefined;
			if (contentQueryResult.total === 0) {
				// Even though no media has been found tagged with filename, older versions of the integration might have synced the file already...
				exisitingMediaContent = getContentByKey<MediaContent>({key: `/${path}/${fileNameOld}`});
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
