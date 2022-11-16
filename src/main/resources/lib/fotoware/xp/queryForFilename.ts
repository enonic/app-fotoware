import type {MediaContent} from '/lib/fotoware/xp/MediaContent';


//import {toStr} from '@enonic/js-utils';
import {query as queryForContent} from '/lib/xp/content';


export function queryForFilename({
	filename,
	path,
	query = `_path LIKE '/content/${path}/*'` // NOTE: File can be moved to sub folders, but not outside.
}: {
	filename: string
	path: string
	query?: string
}) {
	const contentQueryParams = {
		count: -1,
		filters: {
			boolean: {
				must: [
					{
						hasValue: {
							field: 'data.media.attachment',
							values: [
								filename
							]
						}
					}
				]
			}
		},
		query
	};
	//log.debug(`contentQueryParams:${toStr(contentQueryParams)}`);
	//const contentQueryResult =
	return queryForContent<MediaContent>(contentQueryParams);
	//log.debug(`contentQueryResult:${toStr(contentQueryResult)}`);
	//return contentQueryResult;
}
