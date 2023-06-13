import type {Request} from '/lib/xp/Request';


//import '@enonic/global-polyfill'; // Required by reflect-metadata
//import 'reflect-metadata'; // Required by set-value
//import {toStr} from '@enonic/js-utils';
// @ts-expect-error TS2307: Cannot find module '/lib/router' or its corresponding type declarations.
import Router from '/lib/router';
//import {assetUrl} from '/lib/xp/portal';
import {getResource} from '/lib/xp/io';

import {assetIngested} from '/webapp/assetIngested';
import {assetModified} from '/webapp/asset/modified';
import {assetDeleted} from '/webapp/assetDeleted';
import {exportPublished} from '/webapp/exportPublished';
import {exportRevoked} from '/webapp/exportRevoked';

const router = Router();

export const all = (r: Request) => router.dispatch(r);

router.post('/asset/ingested', (r: Request) => assetIngested(r));
router.post('/asset/modified', (r: Request) => assetModified(r));
router.post('/asset/deleted', (r: Request) => assetDeleted(r));
router.post('/export/published', (r: Request) => exportPublished(r));
router.post('/export/revoked', (r: Request) => exportRevoked(r));
router.all('', (/*r*/) => {
	//log.debug(`request:${toStr(r)}`);
	return {
		body: getResource(resolve('../application.svg')).getStream()
	};
});
