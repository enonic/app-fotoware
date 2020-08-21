import Router from '/lib/router';

import {assetIngested} from '/webapp/assetIngested';
import {assetModified} from '/webapp/assetModified';
import {assetDeleted} from '/webapp/assetDeleted';
import {exportPublished} from '/webapp/exportPublished';
import {exportRevoked} from '/webapp/exportRevoked';

const router = Router();

export const all = (r) => router.dispatch(r);

router.post('/assetIngested', (r) => assetIngested(r));
router.post('/assetModified', (r) => assetModified(r));
router.post('/assetDeleted', (r) => assetDeleted(r));
router.post('/exportPublished', (r) => exportPublished(r));
router.post('/exportRevoked', (r) => exportRevoked(r));
