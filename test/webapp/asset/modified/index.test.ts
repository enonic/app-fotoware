import type { Request } from '/lib/xp/Request';


import {
	deleteIn,
	// forceArray,
	setIn,
	// toStr
} from '@enonic/js-utils';
import Log from '@enonic/mock-xp/dist/Log';
import {
	afterEach,
	// beforeEach,
	// describe,
	expect,
	jest,
	test
} from '@jest/globals';
import assetModifiedRequest from "./assetModifiedRequest.json";
import assetModifiedRequestBody from "./assetModifiedRequestBody.json";
import deref from '../../../deref';
import {
	REMOTE_ADDRESS_LEGAL1,
	mockAppConfig
} from '../../../mocks/appConfig';
import mockLibGalimatias from '../../../mocks/libGalimatias';
import mockLibLicense from '../../../mocks/libLicense';
import mockLibXpAuth from '../../../mocks/libXpAuth';
import mockLibXpContext from '../../../mocks/libXpContext';
import mockLibXpCommon from '../../../mocks/libXpCommon';
import mockLibXpScheduler from '../../../mocks/libXpScheduler';

//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
// const MD5SUM = 'md5Sum';
const REMOTE_ADDRESS_ILLEGAL = '10.0.0.1';
const USER_AGENT_ILLEGAL = 'illegal user agent';

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
mockAppConfig();
mockLibGalimatias();
mockLibLicense();
mockLibXpAuth();
mockLibXpContext();
mockLibXpCommon();
mockLibXpScheduler();

//──────────────────────────────────────────────────────────────────────────────
// Test data
//──────────────────────────────────────────────────────────────────────────────
const mockedAssetModifiedRequest = assetModifiedRequest as unknown as Request;
mockedAssetModifiedRequest.body = JSON.stringify(assetModifiedRequestBody);
setIn(mockedAssetModifiedRequest, ['headers', 'X-Forwarded-For'], REMOTE_ADDRESS_LEGAL1);
mockedAssetModifiedRequest.remoteAddress = REMOTE_ADDRESS_LEGAL1;

//──────────────────────────────────────────────────────────────────────────────
// Tests
//──────────────────────────────────────────────────────────────────────────────
// beforeEach(() => {
// 	mockLibLicense();
// 	// jest.resetModules();
// });

afterEach(() => {
	jest.resetModules();
	mockLibGalimatias();
	mockLibLicense();
});

test('modifies mediacontent from assetModified request', () => {
	import('../../../../src/main/resources/webapp/asset/modified/index').then((moduleName) => {
		expect(moduleName.assetModified(mockedAssetModifiedRequest)).toStrictEqual({
			body: {},
			contentType: 'application/json;charset=utf-8',
			status: 200
		});
	});
}); // test modifies mediacontent from assetModified request

test('returns 404 when license is expired ', () => {
	jest.resetModules();
	mockLibLicense({ expired: true });
	import('../../../../src/main/resources/webapp/asset/modified/index').then((moduleName) => {
		expect(moduleName.assetModified(mockedAssetModifiedRequest)).toStrictEqual({
			status: 404
		});
	});
});

test('returns 404 when body is empty', () => {
	import('../../../../src/main/resources/webapp/asset/modified/index').then((moduleName) => {
		const requestWithoutBody = deref(mockedAssetModifiedRequest);
		delete requestWithoutBody.body;
		expect(moduleName.assetModified(requestWithoutBody)).toStrictEqual({
			status: 404
		});
	});
});

test('returns 404 when there are no headers', () => {
	import('../../../../src/main/resources/webapp/asset/modified/index').then((moduleName) => {
		const requestWithoutHeaders = deref(mockedAssetModifiedRequest);
		delete requestWithoutHeaders.headers;
		expect(moduleName.assetModified(requestWithoutHeaders)).toStrictEqual({
			status: 404
		});
	});
});

test('returns 404 when remoteaddress is missing', () => {
	import('../../../../src/main/resources/webapp/asset/modified/index').then((moduleName) => {
		const requestWithoutRemoteAddress = deref(mockedAssetModifiedRequest);
		delete requestWithoutRemoteAddress.remoteAddress;
		// @ts-expect-error typerror
		deleteIn(requestWithoutRemoteAddress, 'headers', 'X-Forwarded-For');
		expect(moduleName.assetModified(requestWithoutRemoteAddress)).toStrictEqual({
			status: 404
		});
	});
});

test('returns 404 when useragent is missing', () => {
	import('../../../../src/main/resources/webapp/asset/modified/index').then((moduleName) => {
		const requestWithoutUserAgent = deref(mockedAssetModifiedRequest);
		// @ts-expect-error typerror
		deleteIn(requestWithoutUserAgent, 'headers', 'User-Agent');
		expect(moduleName.assetModified(requestWithoutUserAgent)).toStrictEqual({
			status: 404
		});
	});
});

test('returns 404 when useragent is illegal', () => {
	import('../../../../src/main/resources/webapp/asset/modified/index').then((moduleName) => {
		const requestWithIllegalUserAgent = deref(mockedAssetModifiedRequest);
		setIn(requestWithIllegalUserAgent, ['headers', 'User-Agent'], USER_AGENT_ILLEGAL);
		expect(moduleName.assetModified(requestWithIllegalUserAgent)).toStrictEqual({
			status: 404
		});
	});
});

test('returns 404 when body is not valid json', () => {
	import('../../../../src/main/resources/webapp/asset/modified/index').then((moduleName) => {
		const requestWithIllegalBody = deref(mockedAssetModifiedRequest);
		requestWithIllegalBody.body = 'not valid json';
		expect(moduleName.assetModified(requestWithIllegalBody)).toStrictEqual({
			status: 404
		});
	});
});

test('returns Bad Request when the asset filename is missing', () => {
	import('../../../../src/main/resources/webapp/asset/modified/index').then((moduleName) => {
		const assetModifiedRequestBodyWithoutFilename = deref(assetModifiedRequestBody);
		deleteIn(assetModifiedRequestBodyWithoutFilename, 'data', 'asset', 'filename');

		const requestWithoutFilename = deref(mockedAssetModifiedRequest);
		requestWithoutFilename.body = JSON.stringify(assetModifiedRequestBodyWithoutFilename);

		expect(moduleName.assetModified(requestWithoutFilename)).toStrictEqual({
			status: 400
		});
	});
});

test('returns Bad Request when the href is missing', () => {
	import('../../../../src/main/resources/webapp/asset/modified/index').then((moduleName) => {
		const requestBodyWithoutHref = deref(assetModifiedRequestBody);
		deleteIn(requestBodyWithoutHref, 'href');

		const requestWithoutFilename = deref(mockedAssetModifiedRequest);
		requestWithoutFilename.body = JSON.stringify(requestBodyWithoutHref);

		expect(moduleName.assetModified(requestWithoutFilename)).toStrictEqual({
			status: 400
		});
	});
});

test('returns OK when the asset filename starts with .', () => {
	import('../../../../src/main/resources/webapp/asset/modified/index').then((moduleName) => {
		const requestBodyWithDotFilename = deref(assetModifiedRequestBody);
		setIn(requestBodyWithDotFilename, ['data', 'asset', 'filename'], '.filename.jpg');

		const requestWithDotFilename = deref(mockedAssetModifiedRequest);
		requestWithDotFilename.body = JSON.stringify(requestBodyWithDotFilename);

		expect(moduleName.assetModified(requestWithDotFilename)).toStrictEqual({
			status: 200
		});
	});
});

test('returns Internal Server Error when the site in href is unconfigured', () => {
	jest.resetModules();
	mockLibGalimatias({ host: 'illegal.fotoware.cloud'});
	import('../../../../src/main/resources/webapp/asset/modified/index').then((moduleName) => {
		const requestBodyWithUnconfiguredHref = deref(assetModifiedRequestBody);
		requestBodyWithUnconfiguredHref.href = 'https://illegal.fotoware.cloud/fotoweb/archives/5000-All-files/Folder%2019/Folder%2019/test_rename_36.jpeg.info'

		const requestWithUnconfiguredHref = deref(mockedAssetModifiedRequest);
		requestWithUnconfiguredHref.body = JSON.stringify(requestBodyWithUnconfiguredHref);

		expect(moduleName.assetModified(requestWithUnconfiguredHref)).toStrictEqual({
			status: 500
		});
	});
});

test('returns 404 when remoteaddress is illegal', () => {
	import('../../../../src/main/resources/webapp/asset/modified/index').then((moduleName) => {
		const requestWithIllegalRemoteAddress = deref(mockedAssetModifiedRequest);
		setIn(requestWithIllegalRemoteAddress, ['headers', 'X-Forwarded-For'], REMOTE_ADDRESS_ILLEGAL);
		requestWithIllegalRemoteAddress.remoteAddress = REMOTE_ADDRESS_ILLEGAL;
		expect(moduleName.assetModified(requestWithIllegalRemoteAddress)).toStrictEqual({
			status: 404
		});
	});
});
