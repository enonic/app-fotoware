//import {toStr} from '@enonic/js-utils';

import {query as queryForContent} from '/lib/xp/content';


export function queryForFilename({
	filename,
	path,
	query = `_path LIKE '/content/${path}/*'` // NOTE: File can be moved to sub folders, but not outside.
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
	return queryForContent(contentQueryParams);
	//log.debug(`contentQueryResult:${toStr(contentQueryResult)}`);
	//return contentQueryResult;
}
