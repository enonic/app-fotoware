import {toStr} from '/lib/util';

export const post = (request) => {
	log.info(`request:${toStr(request)}`);
	return {
		body: {},
		contentType: 'application/json;charset=utf-8'
	};
};
