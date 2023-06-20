import type {Request} from '/lib/xp/Request';


import {toStr} from '@enonic/js-utils';
import {DEBUG_INCOMING_REQUESTS} from '../constants';


export const exportRevoked = (request: Request) => {
	DEBUG_INCOMING_REQUESTS && log.debug('exportRevoked request:%s', toStr(request));
	return {
		body: {},
		contentType: 'application/json;charset=utf-8'
	};
};
