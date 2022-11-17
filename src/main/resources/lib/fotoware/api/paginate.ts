//import {toStr} from '@enonic/js-utils';

import {request as send} from '/lib/http-client';


export function paginate({
	doPaginate = true,
	fnHandlePage = (page) => page,
	hostname,
	request
}) {
	//log.debug(`request:${toStr(request)}`);

	let response = send(request);
	//log.debug(`response:${toStr(response)}`);

	let bodyObj = JSON.parse(response.body);
	//log.debug(`bodyObj:${toStr(bodyObj)}`);

	let {paging, ...rest} = bodyObj;
	//log.debug(`paging:${toStr(paging)}`);
	//log.debug(`rest:${toStr(rest)}`);

	fnHandlePage({...rest});

	if (doPaginate && paging) {
		while (paging.next) {
			request.url = `${hostname}${paging.next}`
			//log.debug(`p request:${toStr(request)}`);

			response = send(request);
			//log.debug(`p response:${toStr(response)}`);

			bodyObj = JSON.parse(response.body);
			//log.debug(`p bodyObj:${toStr(bodyObj)}`);

			const {paging: newPaging, ...rest} = bodyObj;
			//log.debug(`newPaging:${toStr(newPaging)}`);
			paging = newPaging;
			//log.debug(`rest:${toStr(rest)}`);
			fnHandlePage({...rest});
		}
	} // if paging
} // export function paginate
