//import '@enonic/global-polyfill'; // Required by reflect-metadata
//import 'reflect-metadata'; // Required by set-value

import Router from '/lib/router';
//import {toStr} from '/lib/util';
//import {assetUrl} from '/lib/xp/portal';
import {getResource} from '/lib/xp/io';

import {assetIngested} from '/webapp/assetIngested';
import {assetModified} from '/webapp/asset/modified';
import {assetDeleted} from '/webapp/assetDeleted';
import {exportPublished} from '/webapp/exportPublished';
import {exportRevoked} from '/webapp/exportRevoked';

const router = Router();

export const all = (r) => router.dispatch(r);

router.post('/asset/ingested', (r) => assetIngested(r));
router.post('/asset/modified', (r) => assetModified(r));
router.post('/asset/deleted', (r) => assetDeleted(r));
router.post('/export/published', (r) => exportPublished(r));
router.post('/export/revoked', (r) => exportRevoked(r));
router.all('', (/*r*/) => {
	//log.debug(`request:${toStr(r)}`);
	return {
		body: getResource(resolve('../application.svg')).getStream()
	};
});
