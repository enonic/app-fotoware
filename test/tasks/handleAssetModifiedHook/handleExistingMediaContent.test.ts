import type {
	ByteSource,
	NestedRecord
} from '@enonic-types/core';
import type { SiteConfigProperties } from '/types';

import { deleteIn } from '@enonic/js-utils';
import Log from '@enonic/mock-xp/dist/Log';
import {
	describe,
	expect,
	jest,
	test
} from '@jest/globals';
import { readFileSync } from 'fs';
import { join } from 'path';
import mockLibTextEncoding from '../../mocks/libTextEncoding';
import mockLibXpCommon from '../../mocks/libXpCommon';
import mockLibXpContent from '../../mocks/libXpContent';
import mockLibXpContext from '../../mocks/libXpContext';
import mockLibXpIo from '../../mocks/libXpIo';
import deref from '../../deref';


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
const MD5SUM = 'D5DE696E796E8667780CD5BB5F9E401E';

mockLibTextEncoding({
	md5sum: MD5SUM
});
mockLibXpCommon();
const {
	contentConnection,
	mockModify,
} = mockLibXpContent();
mockLibXpContext();
mockLibXpIo();

const FILENAME = 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp'

jest.mock('/lib/fotoware/content', () => ({
	updateMedia: jest.fn()
}));

//──────────────────────────────────────────────────────────────────────────────
// Test data
//──────────────────────────────────────────────────────────────────────────────
const DOWNLOAD_RENDITION_RESPONSE = {
	// bodyStream: createReadStream(join(__dirname, '../../mocks/responses', 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp')) as unknown as ByteSource,
	bodyStream: readFileSync(join(__dirname, '../../mocks/responses', 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp')) as unknown as ByteSource,
	contentType: 'application/octet-stream',
	cookies: [],
	headers: {
		"cache-control": "private",
		"content-disposition": "attachment",
		"content-length": "103506",
		"content-type": "application/octet-stream",
		date: "Mon, 26 Jun 2023 07:21:59 GMT",
		"fotoweb-server": "Product-Version=8.2.1412.0; Level=Invalid;",
		server: "Microsoft-IIS/10.0",
		vary: "Authorization,FWAPIToken,Cookie,Cookie,Cookie,Accept,Accept-Encoding,User-Agent,Accept-Language",
		"x-powered-by": "FotoWare (https://www.fotoware.com/)",
		"x-processing-time": "0.000",
		"x-requestid": "WwOIzXx4k3SnXDpkrnISkA"
	},
	message: 'OK',
	status: 200,
};

const MAPPINGS = {
	"5": "displayName",
	"25": "data.tags",
	"80": "data.artist",
	"116": "data.copyright",
	"120": "x.media.imageInfo.description"
};

const PROJECT = 'fotoware';

const PROPERTIES: SiteConfigProperties = {
	"artist": "ifChanged",
	"copyright": "overwrite",
	"description": "ifChanged",
	"displayName": "onCreate",
	"tags": "ifChanged"
};

//──────────────────────────────────────────────────────────────────────────────
// Tests
//──────────────────────────────────────────────────────────────────────────────
describe('handleExistingMediaContent', () => {
	const createdMediaContent = contentConnection.createMedia({
		data: readFileSync(join(__dirname, '../../mocks/responses', FILENAME)) as unknown as ByteSource,
		name: FILENAME,
		parentPath: '/EnonicWare',
		mimeType: 'image/webp',
		focalX: 0.5,
		focalY: 0.5,
	});

	test("modifies content when there are changes", () => {
		import('../../../src/main/resources/tasks/handleAssetModifiedHook/handleExistingMediaContent').then((moduleName) => {
			const res = moduleName.handleExistingMediaContent({
				exisitingMediaContent: contentConnection.get({ key: createdMediaContent._id }),
				downloadRenditionResponse: DOWNLOAD_RENDITION_RESPONSE,
				fileNameNew: FILENAME,
				fileNameOld: FILENAME,
				mappings: MAPPINGS,
				md5sumOfDownload: MD5SUM,
				metadata: {
					"25": {
						"value": [
							"Changed in FotoWare"
						]
					}
				},
				project: PROJECT,
				properties: PROPERTIES
			}) as unknown as NestedRecord;
			// log.debug('res:%s', res);
			expect(res).toStrictEqual({
				_id: createdMediaContent._id,
				_name: 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp',
				_path: '/EnonicWare/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp',
				childOrder: 'displayname ASC', // TODO hardcoded
				creator: 'user:system:su',
				createdTime: res['createdTime'],
				data: {
					artist: '',
					media: {
						attachment: 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp',
						focalPoint: {
							x: 0.5,
							y: 0.5
						}
					},
					caption: '',
					copyright: '',
					fotoWare: {
						metadata: { '25': 'Changed in FotoWare' },
						md5sum: 'D5DE696E796E8667780CD5BB5F9E401E'
					},
					tags: 'Changed in FotoWare'
				},
				displayName: 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg',
				hasChildren: true, // TODO hardcoded
				modifier: 'user:system:su',
				modifiedTime: res['modifiedTime'],
				owner: 'user:system:su',
				publish: {},
				type: 'media:image',
				valid: true,
				x: {
					media: {
						imageInfo: {
							byteSize: 187348,
							contentType: 'image/webp',
							imageHeight: 600,
							imageWidth: 480,
							pixelSize: 288000
						}
					}
				},
				attachments: {},
			});
			expect(mockModify).toHaveBeenCalledTimes(1);
			mockModify.mockClear();
		});
	}); // test modifies content when there are changes

	test("doesn't call /lib/xp/content.modify when there are no changes", () => {
		// log.debug('createdMediaContent: %s', createdMediaContent);
		import('../../../src/main/resources/tasks/handleAssetModifiedHook/handleExistingMediaContent').then((moduleName) => {
			const res = moduleName.handleExistingMediaContent({
				exisitingMediaContent: contentConnection.get({ key: createdMediaContent._id }),
				downloadRenditionResponse: DOWNLOAD_RENDITION_RESPONSE,
				fileNameNew: FILENAME,
				fileNameOld: FILENAME,
				mappings: MAPPINGS,
				md5sumOfDownload: MD5SUM,
				metadata: {
					"25": {
						"value": [
							"Changed in FotoWare"
						]
					}
				},
				project: PROJECT,
				properties: PROPERTIES
			}) as unknown as NestedRecord;
			expect(res).toStrictEqual({
				_id: createdMediaContent._id,
				_name: 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp',
				_path: '/EnonicWare/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp',
				// _score: 0,
				attachments: {},
				childOrder: 'displayname ASC',
				creator: 'user:system:su',
				createdTime: res['createdTime'],
				data: {
					artist: '',
					media: {
						attachment: 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp',
						focalPoint: {
							x: 0.5,
							y: 0.5
						}
					},
					caption: '',
					copyright: '',
					fotoWare: {
						metadata: { '25': 'Changed in FotoWare' },
						md5sum: 'D5DE696E796E8667780CD5BB5F9E401E'
					},
					tags: 'Changed in FotoWare'
				},
				displayName: 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg',
				hasChildren: true, // TODO hardcoded
				modifier: 'user:system:su',
				modifiedTime: res['modifiedTime'],
				owner: 'user:system:su',
				type: 'media:image',
				valid: true,
				x: {
					media: {
						imageInfo: {
							byteSize: 187348,
							contentType: 'image/webp',
							imageHeight: 600,
							imageWidth: 480,
							pixelSize: 288000
						}
					}
				},
				// page: {}, // Content Layer
				publish: {},
				// workflow: { state: 'READY', checks: {} } // Content Layer
			});
			expect(mockModify).not.toHaveBeenCalled();
			mockModify.mockClear();
		});
	}); // test

	test("updates media on new md5sum", () => {
		import('../../../src/main/resources/tasks/handleAssetModifiedHook/handleExistingMediaContent').then((moduleName) => {
			const modifiedMediaContent = moduleName.handleExistingMediaContent({
				exisitingMediaContent: contentConnection.get({ key: createdMediaContent._id }),
				downloadRenditionResponse: DOWNLOAD_RENDITION_RESPONSE,
				fileNameNew: FILENAME,
				fileNameOld: FILENAME,
				mappings: MAPPINGS,
				md5sumOfDownload: 'newMd5sum',
				metadata: {
					"25": {
						"value": [
							"Orig"
						]
					}
				},
				project: PROJECT,
				properties: PROPERTIES
			});
			expect(modifiedMediaContent).toStrictEqual({
				_id: createdMediaContent._id,
				_name: 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp',
				_path: '/EnonicWare/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp',
				attachments: {},
				childOrder: 'displayname ASC',
				createdTime: createdMediaContent.createdTime,
				creator: 'user:system:su',
				data: {
					artist: '',
					caption: '',
					copyright: '',
					fotoWare: {
						metadata: { '25': 'Orig' },
						md5sum: 'newMd5sum'
					},
					media: {
						attachment: 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp',
						focalPoint: {
							x: 0.5,
							y: 0.5
						}
					},
					tags: 'Orig'
				},
				displayName: 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg',
				hasChildren: true,
				modifiedTime: modifiedMediaContent.modifiedTime,
				modifier: 'user:system:su',
				owner: 'user:system:su',
				// page: {},
				publish: {},
				type: 'media:image',
				valid: true,
				// workflow: { state: 'READY', checks: {} }
				x: {
					media: {
						imageInfo: {
							byteSize: 187348,
							contentType: 'image/webp',
							imageHeight: 600,
							imageWidth: 480,
							pixelSize: 288000
						}
					}
				},
			});
		});
	}); // test

	test("updates displayName on rename in fotoware", () => {
		import('../../../src/main/resources/tasks/handleAssetModifiedHook/handleExistingMediaContent').then((moduleName) => {
			const modifiedMediaContent = moduleName.handleExistingMediaContent({
				exisitingMediaContent: contentConnection.get({ key: createdMediaContent._id }),
				downloadRenditionResponse: DOWNLOAD_RENDITION_RESPONSE,
				fileNameNew: 'fileNameNew.webp',
				fileNameOld: FILENAME,
				mappings: MAPPINGS,
				md5sumOfDownload: MD5SUM,
				metadata: {
					"25": {
						"value": [
							"Orig"
						]
					}
				},
				project: PROJECT,
				properties: PROPERTIES
			});
			expect(modifiedMediaContent).toStrictEqual({
				_id: createdMediaContent._id,
				_name: 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp',
				_path: '/EnonicWare/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp',
				attachments: {},
				createdTime: createdMediaContent.createdTime,
				creator: 'user:system:su',
				childOrder: 'displayname ASC',
				data: {
					artist: '',
					caption: '',
					copyright: '',
					fotoWare: {
						metadata: { '25': 'Orig' },
						md5sum: MD5SUM
					},
					media: {
						attachment: 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp',
						focalPoint: {
							x: 0.5,
							y: 0.5
						}
					},
					tags: 'Orig'
				},
				displayName: 'fileNameNew',
				modifiedTime: modifiedMediaContent.modifiedTime,
				modifier: 'user:system:su',
				hasChildren: true,
				owner: 'user:system:su',
				// page: {},
				publish: {},
				type: 'media:image',
				valid: true,
				// workflow: { state: 'READY', checks: {} }
				x: {
					media: {
						imageInfo: {
							byteSize: 187348,
							contentType: 'image/webp',
							imageHeight: 600,
							imageWidth: 480,
							pixelSize: 288000
						}
					}
				},
			});
		});
	}); // test updates media with metadata

	//──────────────────────────────────────────────────────────────────────────────
	// Error handling
	//──────────────────────────────────────────────────────────────────────────────

	test("throws when exisitingMediaContent doesn't have a data property", () => {
		import('../../../src/main/resources/tasks/handleAssetModifiedHook/handleExistingMediaContent').then((moduleName) => {
			const exisitingMediaContentWithoutData = contentConnection.get({ key: createdMediaContent._id });
			deleteIn(exisitingMediaContentWithoutData as unknown as NestedRecord, 'data');
			const fn = () => moduleName.handleExistingMediaContent({
				exisitingMediaContent: exisitingMediaContentWithoutData,
				downloadRenditionResponse: DOWNLOAD_RENDITION_RESPONSE,
				fileNameNew: FILENAME,
				fileNameOld: FILENAME,
				mappings: MAPPINGS,
				md5sumOfDownload: MD5SUM,
				metadata: {
					"25": {
						"value": [
							"Orig"
						]
					}
				},
				project: PROJECT,
				properties: PROPERTIES
			})
			expect(fn).toThrow('exisitingMediaContent.data.media.attachment is not a string!');
		});
	}); // test throws when exisitingMediaContent doesn't have a data property

	test('handles exisitingMediaContent without data.fotoWare', () => {
		import('../../../src/main/resources/tasks/handleAssetModifiedHook/handleExistingMediaContent').then((moduleName) => {
			const exisitingMediaContentWithoutDataFotoWare = contentConnection.get({ key: createdMediaContent._id });
			deleteIn(exisitingMediaContentWithoutDataFotoWare as unknown as NestedRecord, 'data', 'fotoWare');
			const modifiedMediaContent = moduleName.handleExistingMediaContent({
				exisitingMediaContent: exisitingMediaContentWithoutDataFotoWare,
				downloadRenditionResponse: DOWNLOAD_RENDITION_RESPONSE,
				fileNameNew: FILENAME,
				fileNameOld: FILENAME,
				mappings: MAPPINGS,
				md5sumOfDownload: MD5SUM,
				metadata: {
					"25": {
						"value": [
							"Orig"
						]
					}
				},
				project: PROJECT,
				properties: PROPERTIES
			})
			expect(modifiedMediaContent).toStrictEqual({
				_id: createdMediaContent._id,
				_name: 'fileNameNew.webp',
				_path: '/EnonicWare/fileNameNew.webp',
				attachments: {},
				createdTime: createdMediaContent.createdTime,
				creator: 'user:system:su',
				childOrder: 'displayname ASC',
				data: {
					artist: '',
					caption: '',
					copyright: '',
					fotoWare: {
						metadata: { '25': 'Orig' },
						md5sum: MD5SUM
					},
					media: {
						attachment: 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp',
						focalPoint: {
							x: 0.5,
							y: 0.5
						}
					},
					tags: 'Orig'
				},
				displayName: 'fileNameNew',
				modifiedTime: modifiedMediaContent.modifiedTime,
				modifier: 'user:system:su',
				hasChildren: true,
				owner: 'user:system:su',
				// page: {},
				publish: {},
				type: 'media:image',
				valid: true,
				// workflow: { state: 'READY', checks: {} }
				x: {
					media: {
						imageInfo: {
							byteSize: 187348,
							contentType: 'image/webp',
							imageHeight: 600,
							imageWidth: 480,
							pixelSize: 288000
						}
					}
				},
			});
		});
	}); // test handles exisitingMediaContent without data

	test("throws when exisitingMediaContent is missing it's attachment and md5sum", () => {
		const exisitingMediaContentWithoutAttachmentAndMd5sum = contentConnection.get({ key: createdMediaContent._id });
		deleteIn(exisitingMediaContentWithoutAttachmentAndMd5sum as unknown as NestedRecord, 'attachments');
		deleteIn(exisitingMediaContentWithoutAttachmentAndMd5sum as unknown as NestedRecord, 'data', 'fotoWare', 'md5sum');
		// log.debug('exisitingMediaContentWithoutAttachmentAndMd5sum:%s', exisitingMediaContentWithoutAttachmentAndMd5sum);

		import('../../../src/main/resources/tasks/handleAssetModifiedHook/handleExistingMediaContent').then((moduleName) => {
			const fn = () => moduleName.handleExistingMediaContent({
				exisitingMediaContent: exisitingMediaContentWithoutAttachmentAndMd5sum,
				downloadRenditionResponse: DOWNLOAD_RENDITION_RESPONSE,
				fileNameNew: 'fileNameNew.webp',
				fileNameOld: 'fileNameNew.webp',
				mappings: MAPPINGS,
				md5sumOfDownload: MD5SUM,
				metadata: {
					"25": {
						"value": [
							"Orig"
						]
					}
				},
				project: PROJECT,
				properties: PROPERTIES
			})
			expect(fn).toThrow('Unable to getAttachmentStream for fileNameNew.webp');
		});
	}); // test throws when exisitingMediaContent is missing it's attachment and md5sum

	test("throws when downloadRenditionResponse.bodyStream is missing", () => {
		import('../../../src/main/resources/tasks/handleAssetModifiedHook/handleExistingMediaContent').then((moduleName) => {
			const downloadRenditionResponseWithoutBodyStream = deref(DOWNLOAD_RENDITION_RESPONSE);
			deleteIn(downloadRenditionResponseWithoutBodyStream, 'bodyStream');
			const fn = () => moduleName.handleExistingMediaContent({
				exisitingMediaContent: contentConnection.get({ key: createdMediaContent._id }),
				downloadRenditionResponse: downloadRenditionResponseWithoutBodyStream,
				fileNameNew: 'filenameWithoutAttachment',
				fileNameOld: 'filenameWithoutAttachment',
				mappings: MAPPINGS,
				md5sumOfDownload: 'changed',
				metadata: {
					"25": {
						"value": [
							"Orig"
						]
					}
				},
				project: PROJECT,
				properties: PROPERTIES
			})
			expect(fn).toThrow('downloadRenditionResponse.bodyStream is null! fileNameOld:filenameWithoutAttachment');
		});
	}); // test throws when downloadRenditionResponse.bodyStream is null

}); // describe handleExistingMediaContent
