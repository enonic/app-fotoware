import {X_APP_NAME} from '/lib/fotoware/xp/constants';

import {query as queryForContent} from '/lib/xp/content';


export function queryForFilename({
	filename
}) {
	const contentQueryParams = {
		count: -1,
		filters: {
			boolean: {
				must: [
					/*{
						exists: {
							field: `x.${X_APP_NAME}.fotoWare.filename`
						}
					},*/
					{
						hasValue: {
							field: `x.${X_APP_NAME}.fotoWare.filename`,
							values: [
								filename
							]
						}
					}
				]
			}
		}
		//query: `x.${X_APP_NAME}.fotoWare.filename = ${mediaName}`
	};
	//log.debug(`contentQueryParams:${toStr(contentQueryParams)}`);
	//const contentQueryResult =
	return queryForContent(contentQueryParams);
	//log.debug(`contentQueryResult:${toStr(contentQueryResult)}`);
	//return contentQueryResult;
}
