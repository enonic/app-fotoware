import type { sanitize } from '@enonic-types/lib-common';
import type {
	get,
	query
} from '@enonic-types/lib-content';
import type { run } from '@enonic-types/lib-context';
import type { executeFunction } from '@enonic-types/lib-task';
import type {Request} from '/lib/xp/Request';
import type {
	CollectionList,
	HttpClient
} from '/lib/fotoware';


import {
	// forceArray,
	toStr
} from '@enonic/js-utils';
import Log from '@enonic/mock-xp/dist/Log';
import {
	describe,
	expect,
	jest,
	test
} from '@jest/globals';
import { assetIngested } from '../../src/main/resources/webapp/assetIngested';

//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const remoteAddressLegal1 = '192.168.1.1';
const remoteAddressLegal2 = '172.16.0.0';
// const remoteAddressIllegal = '10.0.0.1';
const accessToken = 'accessToken';
const taskId = 'taskId';

//──────────────────────────────────────────────────────────────────────────────
// Globals
//──────────────────────────────────────────────────────────────────────────────
// @ts-ignore TS2339: Property 'app' does not exist on type 'typeof globalThis'.
global.app.config = {
	'config.filename': 'com.enonic.app.fotoware.cfg',
	'imports.MyImportName.path': 'EnonicWare',
	'imports.MyImportName.project': 'fotoware',
	'imports.MyImportName.query': '(fn:.gif|fn:.jpg|fn:.jpeg|fn:.png|fn:*.svg)AND NOT(25:notforweb)',
	'imports.MyImportName.site': 'enonic',
	'service.pid': 'com.enonic.app.fotoware',
	'sites.enonic.clientId': 'clientId',
	'sites.enonic.clientSecret': 'clientSecret',
	'sites.enonic.allowWebhookFromIp': `${remoteAddressLegal1},${remoteAddressLegal2}`,
	'sites.enonic.url': 'https://enonic.fotoware.cloud'
};

// @ts-ignore TS2339: Property 'log' does not exist on type 'typeof globalThis'.
global.log = Log.createLogger({
	loglevel: 'debug'
	// loglevel: 'silent'
});

//──────────────────────────────────────────────────────────────────────────────
// Mocks
//──────────────────────────────────────────────────────────────────────────────
jest.mock('/lib/galimatias', () => ({
	// @ts-ignore
	URL: jest.fn().mockImplementation((_url: string) => ({
		getHost: jest.fn().mockReturnValue('enonic.fotoware.cloud')
	}))
}), { virtual: true });


jest.mock('/lib/license', () => ({
	validateLicense: jest.fn().mockReturnValue({
		expired: false,
		issuedTo: 'issuedTo'
	})
}), { virtual: true });


jest.mock('/lib/text-encoding', () => ({
	md5: jest.fn().mockReturnValue('md5Sum')
}), { virtual: true });


jest.mock('/lib/xp/content', () => ({
	get: jest.fn<typeof get>(({
		key,
		versionId
	}) => {
		// log.info('key', key, 'versionId', versionId);
		if (key === '/EnonicWare/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp') {
			return null;
		}
		throw new Error(`Unmocked get params:${toStr({key, versionId})}`);
	}),
	// @ts-ignore
	query: jest.fn<typeof query>((params) => {
		// log.info('query params', params);
		const {
			aggregations: _aggregations,
			contentTypes: _contentTypes,
			count: _count,
			filters = {},
			query,
			sort: _sort,
			start: _start,
		} = params;
		if (query === "_path LIKE '/content/EnonicWare/*'") {
			const {
				// @ts-ignore
				boolean: {
					must
				}
			} = filters // forceArray(filters)[0];
			// log.info('must', must);
			const {
				hasValue: {
					field: field,
					values: values
				}
			} = must[0]
			if (
				field === 'data.media.attachment'
				&& values[0] === 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp'
			) {
				return {
					count: 0,
					hits: [],
					total: 0
				};
			} else {
			 throw new Error(`Unmocked hasValue query params:${toStr(params)}`);
			}
		} else {
			throw new Error(`Unmocked query params:${toStr(params)}`);
		}
	})
}), { virtual: true });


jest.mock('/lib/xp/context', () => ({
	run: jest.fn<typeof run>((_context, callback) => callback())
}), { virtual: true });


jest.mock('/lib/xp/io', () => ({
}), { virtual: true });


jest.mock('/lib/xp/task', () => ({
	executeFunction: jest.fn<typeof executeFunction>(({
		description: _description,
		func
	}) => (() => {
		func();
		return taskId;
	})())
}), { virtual: true });

jest.mock('/lib/http-client', () => ({
	request: jest.fn((request: HttpClient.Request) => {
		const {url} = request;
		if (url === 'https://enonic.fotoware.cloud/fotoweb/oauth2/token') {
			return {
				body: JSON.stringify({
					access_token: accessToken
				}),
				status: 200,
			};
		} else if (url === 'https://enonic.fotoware.cloud/fotoweb/me/') {
			return {
				body: JSON.stringify({
					archives: 'archives',
					searchURL: 'searchURL',
					services: {
						rendition_request: 'renditionRequest'
					}
				}),
				status: 200,
			};
		} else if (url === 'https://enonic.fotoware.cloudsearchURL') {
			return {
				body: JSON.stringify({
					data: [{
						assetCount: 1,
						href: 'assetHref',
						metadataEditor: {
							href: 'metadataEditorHref',
						},
						originalURL: '5000-All-files'
					} as Partial<CollectionList>]
				}),
				status: 200,
			};
		} else if (url === 'https://enonic.fotoware.cloudmetadataEditorHref') {
			return {
				body: JSON.stringify({
					id: 'id',
					name: 'name',
					builtinFields: {
						builtinFieldKey: {
							field: {
								id: 'fieldId',
							}
						}
					},
					detailRegions: [{
						name: 'detailRegionName',
						fields: [{
							field: {
								id: 'detailRegionFieldsFieldId',
							}
						}]
					}],
					thumbnailFields: {
						thumbnailFieldKey: {
							field: {
								id: 'thumbnailFieldKeyFieldId',
							}
						}
					}
				}),
				status: 200,
			};
		} else if (url === 'https://enonic.fotoware.cloudassetHref') {
			return {
				body: JSON.stringify({
					data: [{
						doctype: 'doctype',
						filename: 'filename',
						filesize: 1,
						href: 'assetHref2',
						metadata: {
							metadataKey: 'metadataValue'
						},
						metadataEditor: {
							href: 'metadataEditorHref'
						},
						renditions: [{
							display_name: 'renditionDisplayName',
							href: 'renditionHref',
						}]
					}]
				}),
				status: 200,
			};
		} else {
			throw new Error(`Unmocked request url:${url} request:${toStr(request)}`);
		}
	})
}), { virtual: true });

jest.mock('/lib/xp/common', () => ({
	sanitize: jest.fn<typeof sanitize>((text) => text)
}), { virtual: true });

//──────────────────────────────────────────────────────────────────────────────
// Test data
//──────────────────────────────────────────────────────────────────────────────
const mockRequest: Request = {
	"method": "POST",
	"scheme": "https",
	"host": "enonic-fotowaretest.enonic.cloud",
	"port": 443,
	"path": "/hooks/asset/ingested",
	"rawPath": "/webapp/com.enonic.app.fotoware/asset/ingested",
	"url": "https://enonic-fotowaretest.enonic.cloud/hooks/asset/ingested",
	"remoteAddress": remoteAddressLegal1,
	"mode": "live",
	"webSocket": false,
	"repositoryId": "com.enonic.cms.default",
	"branch": "draft",
	"contextPath": "/webapp/com.enonic.app.fotoware",
	"contentType": "application/json",
	"body": "{\"pixel-width\": \"1\", \"byline\": \"\", \"description\": \"\", \"tags\": \"\", \"file-size\": \"104448\", \"title\": \"\", \"thumbnail-href\": \"https://enonic.fotoware.cloud/fotoweb/cache/v2/6/w/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjkAMA.gEGcjMnSVw.jpg\", \"created\": \"2023-06-19T12:48:02.129Z\", \"href\": \"https://enonic.fotoware.cloud/fotoweb/archives/5001-My-Uploads/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info\", \"operation-name\": \"upload\", \"data\": {\"revisioncount\": 0, \"archiveHREF\": \"/fotoweb/archives/5001-My-Uploads/\", \"createdBy\": \"system\", \"metadataEditor\": {\"href\": \"/fotoweb/editors/494e7785-3d40-4370-a0ef-69f4f0ef5a8e\", \"name\": \"Default Metadataset for SaaS\"}, \"previewToken\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2Vub25pYy5mb3Rvd2FyZS5jbG91ZC9mb3Rvd2ViLyIsInN1YiI6IjE1MDAzIiwiZXhwIjoxNjg3MTgyNDgyLCJuYmYiOjE2ODcxNzg4ODIsImlhdCI6MTY4NzE3ODg4MiwianRpIjoiYXZMb2tqWFl3ZHhxWm5INFhjQnVPbFdObDJuQllDTlo2SEVYSlNVOXQvTT0iLCJhc3MiOiJhcmNoaXZlcy81MDAxL0ZvbGRlciUyMDE5L1RodXJpbmdpYV9TY2htYWxrYWxkZW5fYXN2MjAyMC0wN19pbWcxOF9TY2hsb3NzX1dpbGhlbG1zYnVyZy5qcGcud2VicCIsInJldiI6IiIsImF1ZCI6InByZXZpZXdfdG9rZW4iLCJzY29wZSI6WyJhcmJpdHJhcnlfcmVuZGl0aW9ucyJdfQ.lnE5GUjBwLrJLDFEzSSOjRGmIP7tmTFcszT4DcxTEg4\", \"modified\": \"2023-06-19T12:47:59Z\", \"href\": \"/fotoweb/archives/5001-My-Uploads/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info\", \"previewcount\": 12, \"linkstance\": \"/fotoweb/archives/5001-My-Uploads/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info\", \"builtinFields\": [{\"field\": \"title\", \"required\": false, \"value\": \"\"}, {\"field\": \"description\", \"required\": false, \"value\": \"\"}, {\"field\": \"tags\", \"required\": false, \"value\": []}, {\"field\": \"status\", \"required\": false, \"value\": \"\"}, {\"field\": \"rating\", \"required\": false, \"value\": \"\"}, {\"field\": \"notes\", \"required\": false, \"value\": \"\"}], \"ancestors\": [{\"href\": \"/fotoweb/archives/5001-My-Uploads/\", \"data\": \"/fotoweb/data/a/5001.BzqdNAA22OtpRkzHeV5Wt4hNF-v1ZV1kk-F_a7myLj0/\", \"name\": \"My Uploads\"}], \"thumbnailFields\": {\"secondLine\": {\"value\": []}, \"additionalFields\": [{\"value\": [], \"views\": [\"desktop\", \"widgets\", \"web\"]}, {\"value\": \"\", \"views\": [\"desktop\", \"widgets\", \"web\"]}], \"firstLine\": {\"value\": \"\"}, \"label\": {\"value\": \"Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp\"}}, \"capabilities\": {\"print\": true, \"printWithAnnotations\": true, \"crop\": true}, \"filename\": \"Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp\", \"modifiedBy\": \"system\", \"filesize\": 104448, \"props\": {\"owner\": null, \"tags\": [], \"comments\": {\"enabled\": false}, \"shares\": {\"enabled\": false}, \"annotations\": {\"enabled\": false}}, \"archiveId\": 5001, \"workflowcount\": 0, \"quickRenditions\": [], \"metadata\": {}, \"previews\": [{\"href\": \"/fotoweb/cache/v2/k/m/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjQA0A.I-3o5WAfmx.jpg\", \"width\": 800, \"height\": 800, \"square\": false, \"size\": 800}, {\"href\": \"/fotoweb/cache/v2/U/N/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjYBMA.tHZzKsyDvG.jpg\", \"width\": 1200, \"height\": 1200, \"square\": false, \"size\": 1200}, {\"href\": \"/fotoweb/cache/v2/3/L/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjgBkA.LwRPUYpHuf.jpg\", \"width\": 1600, \"height\": 1600, \"square\": false, \"size\": 1600}, {\"href\": \"/fotoweb/cache/v2/Y/x/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjwCUA.MfI68uqlKr.jpg\", \"width\": 2400, \"height\": 2400, \"square\": false, \"size\": 2400}, {\"href\": \"/fotoweb/cache/v2/6/w/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjkAMA.gEGcjMnSVw.jpg\", \"width\": 200, \"height\": 200, \"square\": false, \"size\": 200}, {\"href\": \"/fotoweb/cache/v2/c/s/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjWAUA.2qsEMp_k6v.jpg\", \"width\": 300, \"height\": 300, \"square\": false, \"size\": 300}, {\"href\": \"/fotoweb/cache/v2/K/7/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjIAcA.l47oEzcF95.jpg\", \"width\": 400, \"height\": 400, \"square\": false, \"size\": 400}, {\"href\": \"/fotoweb/cache/v2/K/z/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjsAkA.c0pbPwgK1W.jpg\", \"width\": 600, \"height\": 600, \"square\": false, \"size\": 600}, {\"href\": \"/fotoweb/cache/v2/B/t/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjyAQ.9m6sZx4h8G.jpg\", \"width\": 100, \"height\": 100, \"square\": true, \"size\": 100}, {\"href\": \"/fotoweb/cache/v2/9/6/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjkAME.XJmKzB1sOw.jpg\", \"width\": 200, \"height\": 200, \"square\": true, \"size\": 200}, {\"href\": \"/fotoweb/cache/v2/9/6/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjkAME.XJmKzB1sOw.jpg\", \"width\": 200, \"height\": 200, \"square\": true, \"size\": 200}, {\"href\": \"/fotoweb/cache/v2/Q/b/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjIAcE._62AVsBopW.jpg\", \"width\": 400, \"height\": 400, \"square\": true, \"size\": 400}], \"uniqueid\": \"\", \"downloadcount\": 0, \"metadataeditcount\": 0, \"permissions\": [\"View\", \"Preview\", \"Workflow\", \"Download\", \"EditText\", \"CropRotate\", \"Delete\", \"Comping\", \"TrdParty1\", \"TrdParty2\", \"TrdParty3\", \"TrdParty4\", \"Alert\", \"CopyTo\", \"MoveTo\", \"CopyFrom\", \"MoveFrom\", \"Rename\", \"OpenFile\", \"EditFile\", \"CropFile\", \"UploadFile\", \"FwdtPlace\", \"Export\", \"Comment\", \"Annotate\", \"MngVideo\", \"EditSmartFolders\", \"CropAndDownload\"], \"created\": \"1970-01-01T01:12:34Z\", \"renditions\": [{\"profile\": \"2af4914d-6c11-4b15-a7ee-a4260efc8309\", \"display_name\": \"Original File\", \"description\": \"Original File\", \"default\": true, \"height\": 1, \"width\": 1, \"href\": \"/fotoweb/archives/5001-My-Uploads/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info/__renditions/ORIGINAL\", \"original\": true, \"sizeFixed\": false}, {\"profile\": \"1e1887de-5147-4929-8777-2178e555c4ce\", \"display_name\": \"JPG 1024 PX Max 96 DPI\", \"description\": \"Converts image to JPG with max width/height of 1024 pixels and 96 DPI\", \"default\": false, \"height\": 0, \"width\": 0, \"href\": \"/fotoweb/archives/5001-My-Uploads/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info/__renditions/1e1887de-5147-4929-8777-2178e555c4ce\", \"original\": false, \"sizeFixed\": true}, {\"profile\": \"21ad0a7a-4f62-415f-87d9-45cc2214494e\", \"display_name\": \"JPG CMYK\", \"description\": \"Converts images to JPG CMYK with 300dpi\", \"default\": false, \"height\": 1, \"width\": 1, \"href\": \"/fotoweb/archives/5001-My-Uploads/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info/__renditions/21ad0a7a-4f62-415f-87d9-45cc2214494e\", \"original\": false, \"sizeFixed\": false}, {\"profile\": \"79c1d8f7-f5c7-4ff6-bc26-b1153f7e6857\", \"display_name\": \"JPG 1024 PX Width 96 DPI Greyscale\", \"description\": \"Converts image to 1024 max width 96 DPI Greyscale image\", \"default\": false, \"height\": 0, \"width\": 0, \"href\": \"/fotoweb/archives/5001-My-Uploads/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info/__renditions/79c1d8f7-f5c7-4ff6-bc26-b1153f7e6857\", \"original\": false, \"sizeFixed\": true}, {\"profile\": \"c5b1b937-85ba-42f1-8c4a-09808824725b\", \"display_name\": \"JPG sRGB\", \"description\": \"Converts images to JPG sRGB with 300dpi\", \"default\": false, \"height\": 1, \"width\": 1, \"href\": \"/fotoweb/archives/5001-My-Uploads/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info/__renditions/c5b1b937-85ba-42f1-8c4a-09808824725b\", \"original\": false, \"sizeFixed\": false}, {\"profile\": \"d0a672f6-ca68-4b18-a462-3203aced26b9\", \"display_name\": \"JPG 800 PX Max 96 DPI\", \"description\": \"Converts image to JPG with max width/height of 800 pixels and 96 DPI\", \"default\": false, \"height\": 0, \"width\": 0, \"href\": \"/fotoweb/archives/5001-My-Uploads/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info/__renditions/d0a672f6-ca68-4b18-a462-3203aced26b9\", \"original\": false, \"sizeFixed\": true}, {\"profile\": \"ec78a83c-4748-4426-a792-10459166c2f1\", \"display_name\": \"thomas\", \"description\": \"\", \"default\": false, \"height\": 0, \"width\": 0, \"href\": \"/fotoweb/archives/5001-My-Uploads/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info/__renditions/ec78a83c-4748-4426-a792-10459166c2f1\", \"original\": false, \"sizeFixed\": true}], \"pincount\": 0, \"doctype\": \"image\", \"physicalFileId\": \"61d2db5594fb7f7314d5abf3/Folder 19/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp\", \"dropHREF\": \"/fotoweb/archives/5001-My-Uploads/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info#u=15003&m=U7wQh1jGOudhzIzMTDgXnx_CpfipLqEWJsCzjkJaCVg\", \"attributes\": {\"photoAttributes\": {}, \"imageattributes\": {\"colorspace\": \"rgb\", \"flipmirror\": 0, \"pixelwidth\": 1, \"pixelheight\": 1, \"resolution\": 300.0, \"rotation\": 0.0}}}, \"preview-href\": \"https://enonic.fotoware.cloud/fotoweb/cache/v2/k/m/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjQA0A.I-3o5WAfmx.jpg\", \"type\": \"asset\", \"pixel-height\": \"1\", \"id\": \"670bf55e-bb11-46cc-874a-7ecd4a164ccb\"}",
	"params": {},
	"headers": {
		"Accept": "*/*",
		"User-Agent": "FotoWeb/8.1",
		"X-Forwarded-Proto": "https",
		"X-Forwarded-Host": "enonic-fotowaretest.enonic.cloud",
		"Connection": "keep-alive",
		"X-Forwarded-For": remoteAddressLegal1,
		"Host": "enonic-fotowaretest.enonic.cloud",
		"Accept-Encoding": "gzip, deflate",
		"Content-Length": "9534",
		"X-Forwarded-Server": "enonic-fotowaretest.enonic.cloud",
		"Content-Type": "application/json"
	},
	"cookies": {},
	"pathParams": {}
};

//──────────────────────────────────────────────────────────────────────────────
// Tests
//──────────────────────────────────────────────────────────────────────────────
describe('webapp', () => {
	describe('assetIngested', () => {
		test('', () => {
			expect(assetIngested(mockRequest)).toStrictEqual({});
		});
	});
});
