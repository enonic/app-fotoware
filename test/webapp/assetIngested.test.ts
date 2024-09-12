import type { Request } from '/lib/xp/Request';


// import {
// 	toStr
// } from '@enonic/js-utils';
import Log from '@enonic/mock-xp/dist/Log';
import {
	afterEach,
	// beforeEach,
	// describe,
	expect,
	jest,
	test
} from '@jest/globals';
import {
	REMOTE_ADDRESS_LEGAL1,
	mockAppConfig,
} from '../mocks/appConfig';
import mockLibGalimatias from '../mocks/libGalimatias';
import mockLibHttpClient from '../mocks/libHttpClient';
import mockLibLicense from '../mocks/libLicense';
import mockLibTextEncoding from '../mocks/libTextEncoding';
import mockLibXpCommon from '../mocks/libXpCommon';
import mockLibXpContent from '../mocks/libXpContent';
import mockLibXpContext from '../mocks/libXpContext';
import mockLibXpIo from '../mocks/libXpIo';
import mockLibXpTask from '../mocks/libXpTask';

//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const MD5SUM = 'md5sum';
// const remoteAddressIllegal = '10.0.0.1';

//──────────────────────────────────────────────────────────────────────────────
// Globals
//──────────────────────────────────────────────────────────────────────────────
mockAppConfig();


// @ts-expect-error TS2339: Property 'log' does not exist on type 'typeof globalThis'.
global.log = Log.createLogger({
	// loglevel: 'debug'
	// loglevel: 'info'
	// loglevel: 'warn'
	// loglevel: 'error'
	loglevel: 'silent'
});

//──────────────────────────────────────────────────────────────────────────────
// Mocks
//──────────────────────────────────────────────────────────────────────────────
mockLibGalimatias();
mockLibLicense();
mockLibTextEncoding({
	md5sum: MD5SUM
});
const {
	contentConnection
} = mockLibXpContent();
mockLibXpContext();
mockLibXpIo();
mockLibXpTask();
mockLibHttpClient();
mockLibXpCommon();

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
	"remoteAddress": REMOTE_ADDRESS_LEGAL1,
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
		"X-Forwarded-For": REMOTE_ADDRESS_LEGAL1,
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
afterEach(() => {
	jest.resetModules();
	mockLibLicense();
});

test('creates mediacontent from assetIngested request', () => {
	import('../../src/main/resources/webapp/assetIngested').then((moduleName) => {
		expect(moduleName.assetIngested(mockRequest)).toStrictEqual({
			body: {},
			contentType: 'application/json;charset=utf-8',
			status: 200
		});
		const content = contentConnection.get({ key: '/EnonicWare/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp' });
		expect(content).toBeDefined();
		if (content) {
			expect(content).toStrictEqual({
				_id: content._id,
				_name: 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp',
				_path: '/EnonicWare/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp',
				attachments: {},
				childOrder: 'displayname ASC', // hardcoded in mock-xp
				creator: 'user:system:su',
				createdTime: content.createdTime,
				data: {
					artist: [
						'Author',
						'Author2',
					],
					caption: '',
					copyright: 'Copyright',
					fotoWare: {
						md5sum: MD5SUM,
						metadata: {
							110: 'Credit',
							115: 'Source',
							116: 'Copyright',
							120: 'Description',
							25: [
								'Tag1',
								'Tag2'
							],
							254: 'User defined 254',
							40: 'Special Instructions',
							5: 'Title',
							80: [
								'Author',
								'Author2'
							],
							819: 'Consent status',
							820: [
								'Person1',
								'Person2'
							]
						}
					},
					media: {
						attachment: 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp',
						focalPoint: {
							x: 0.5,
							y: 0.5
						}
					},
					tags: [
						'Tag1',
						'Tag2'
					]
				},
				displayName: 'Title',
				hasChildren: true,
				modifier: 'user:system:su',
				modifiedTime: content.modifiedTime,
				owner: 'user:system:su',
				publish: {},
				type: 'media:image',
				valid: true,
				x: {
					media: {
						imageInfo: {
							byteSize: 187348,
							// contentType: 'image/webp',
							description: 'Description',
							imageHeight: 600,
							imageWidth: 480,
							pixelSize: 288000,
						}
					}
				}
			});
		}
	});
});

test('returns 404 when license is expired ', () => {
	jest.resetModules();
	mockLibLicense({ expired: true });
	import('../../src/main/resources/webapp/assetIngested').then((moduleName) => {
		expect(moduleName.assetIngested(mockRequest)).toStrictEqual({
			status: 404
		});
	});
});
