import type {Request} from '/lib/xp/Request';


import {toStr} from '@enonic/js-utils';


export const exportPublished = (request: Request) => {
	log.info(`request:${toStr(request)}`);
	return {
		body: {},
		contentType: 'application/json;charset=utf-8'
	};
};
