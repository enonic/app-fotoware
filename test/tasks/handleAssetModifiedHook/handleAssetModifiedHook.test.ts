import Log from '@enonic/mock-xp/dist/Log';
import {
	afterEach,
	// beforeEach,
	// describe,
	expect,
	jest,
	test
} from '@jest/globals';
// import { modifyMediaContent } from '/lib/fotoware/xp/modifyMediaContent';
import {
	REMOTE_ADDRESS_LEGAL1,
	REMOTE_ADDRESS_LEGAL2,
	mockAppConfig,
} from '../../mocks/appConfig';
import mockLibHttpClient from '../../mocks/libHttpClient';
import mockLibXpCommon from '../../mocks/libXpCommon';
import mockLibXpContent from '../../mocks/libXpContent';
import mockLibXpContext from '../../mocks/libXpContext';
import mockLibXpIo from '../../mocks/libXpIo';
import mockLibXpTask from '../../mocks/libXpTask';
import mockLibTextEncoding from '../../mocks/libTextEncoding';


//──────────────────────────────────────────────────────────────────────────────
// Globals
//──────────────────────────────────────────────────────────────────────────────
// @ts-expect-error TS2339: Property 'log' does not exist on type 'typeof globalThis'.
global.log = Log.createLogger({
	// loglevel: 'debug'
	// loglevel: 'info'
	// loglevel: 'warn'
	// loglevel: 'error'
	loglevel: 'silent'
});

//──────────────────────────────────────────────────────────────────────────────
// Static Mocks
//──────────────────────────────────────────────────────────────────────────────
mockLibHttpClient();
mockLibXpCommon();
mockLibXpContent();
mockLibXpContext();
mockLibXpIo();
mockLibXpTask();
mockLibTextEncoding();

jest.mock('/lib/fotoware/xp/modifyMediaContent', () => ({
	modifyMediaContent: jest.fn()
}));

//──────────────────────────────────────────────────────────────────────────────
// Tests
//──────────────────────────────────────────────────────────────────────────────
afterEach(() => {
	jest.resetModules();
});

test('modifies mediacontent from assetModified request', () => {
	mockAppConfig();
	import('../../../src/main/resources/tasks/handleAssetModifiedHook/handleAssetModifiedHook').then((moduleName) => {
		expect(moduleName.run({
			fileNameNew: 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp',
			fileNameOld: 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp',
			siteName: 'enonic'
		})).toStrictEqual(undefined);
	});
}); // test modifies mediacontent from assetModified request

test('logs an error when site is unconfigured', () => {
	mockAppConfig();
	import('../../../src/main/resources/tasks/handleAssetModifiedHook/handleAssetModifiedHook').then((moduleName) => {
		const logErrorSpy = jest.spyOn(log, 'error');
		expect(moduleName.run({
			fileNameNew: 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp',
			fileNameOld: 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp',
			siteName: 'illegal'
		})).toStrictEqual(undefined);
		expect(logErrorSpy).toHaveBeenCalledWith("Can't find siteConfig for site:illegal!");
		logErrorSpy.mockClear();
	});
});

test('throws an error when site is configured, but imports are invalid', () => {
	// @ts-expect-error TS2339: Property 'app' does not exist on type 'typeof globalThis'.
	global.app.config = {
		'config.filename': 'com.enonic.app.fotoware.cfg',
		'imports.MyImportName': '',
		'service.pid': 'com.enonic.app.fotoware',
		'sites.enonic.clientId': 'clientId',
		'sites.enonic.clientSecret': 'clientSecret',
		'sites.enonic.allowWebhookFromIp': `${REMOTE_ADDRESS_LEGAL1},${REMOTE_ADDRESS_LEGAL2}`,
		'sites.enonic.url': 'https://enonic.fotoware.cloud'
	};
	import('../../../src/main/resources/tasks/handleAssetModifiedHook/handleAssetModifiedHook').then((moduleName) => {
		const fn = () => moduleName.run({
			fileNameNew: 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp',
			fileNameOld: 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp',
			siteName: 'enonic'
		});
		expect(fn).toThrow('Unable to find import with name:MyImportName!');
	});
});
