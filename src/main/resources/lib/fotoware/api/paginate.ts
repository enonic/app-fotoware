import type {
	AssetList,
	CollectionList,
	HttpClient
} from '/lib/fotoware';


import {toStr} from '@enonic/js-utils';
// @ts-expect-error TS2307: Cannot find module '/lib/http-client' or its corresponding type declarations.
import {request as send} from '/lib/http-client';
import {DEBUG_REQUESTS} from '/constants';


export function paginate<
	List extends AssetList | CollectionList,
>({
	doPaginate = true,
	fnHandlePage = (_page) => undefined,
	hostname,
	request
}: {
	doPaginate?: boolean
	fnHandlePage?: (_page: Omit<List,'paging'>) => void
	hostname: string
	request: HttpClient.Request
}) {
	DEBUG_REQUESTS && log.debug('paginate request:%s', toStr(request));

	let response = send(request) as HttpClient.Response;
	DEBUG_REQUESTS && log.debug('paginate response:%s', toStr(response));

	if (!response.body) {
		log.error('response.body is empty request:%s response:%s', toStr(request), toStr(response));
		throw new Error('response.body is empty');
	}

	let bodyObj: List = JSON.parse(response.body);
	//log.debug(`bodyObj:${toStr(bodyObj)}`);

	let {paging, ...rest} = bodyObj; // eslint-disable-line prefer-const
	//log.debug(`paging:${toStr(paging)}`);
	//log.debug(`rest:${toStr(rest)}`);

	fnHandlePage({...rest});

	if (doPaginate && paging) {
		while (paging && paging.next) {
			request.url = `${hostname}${paging.next}`
			//log.debug(`p request:${toStr(request)}`);

			response = send(request) as HttpClient.Response;
			//log.debug(`p response:${toStr(response)}`);

			if (!response.body) {
				log.error('response.body is empty request:%s response:%s', toStr(request), toStr(response));
				throw new Error('response.body is empty');
			}

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
