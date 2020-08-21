import {toStr} from '/lib/util';

export const exportRevoked = (request) => {
	log.info(`request:${toStr(request)}`);
	return {
		body: {},
		contentType: 'application/json;charset=utf-8'
	};
};
