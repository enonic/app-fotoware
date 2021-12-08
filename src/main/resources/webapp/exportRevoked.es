import {toStr} from '@enonic/js-utils';


export const exportRevoked = (request) => {
	log.info(`request:${toStr(request)}`);
	return {
		body: {},
		contentType: 'application/json;charset=utf-8'
	};
};
