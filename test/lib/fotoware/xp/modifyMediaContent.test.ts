import type { sanitize } from '@enonic-types/lib-common';
import type {
	delete as deleteContent,
	modify
} from '@enonic-types/lib-content';
import type {
	XpXDataMedia
} from '../../../../src/main/resources/index.d';
import type {
	Mappings,
	MediaContent,
	SiteConfigProperties
} from '/lib/fotoware';
import deref from '../../../deref';


import {JavaBridge} from '@enonic/mock-xp';
import Log from '@enonic/mock-xp/dist/Log';
import {
	describe,
	expect,
	jest,
	test
} from '@jest/globals';
import { modifyMediaContent } from '/lib/fotoware/xp/modifyMediaContent';
import * as updateMetadataOnContentModule from '/lib/fotoware/xp/updateMetadataOnContent';
import {
	PROPERTY_ON_CREATE,
	PROPERTY_IF_CHANGED,
	PROPERTY_OVERWRITE
} from '/lib/fotoware/xp/constants';
import JavaException from '../../../JavaException';
import RuntimeException from '../../../RuntimeException';
import ValueTypeException from '../../../ValueTypeException';


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
	'sites.enonic.allowWebhookFromIp': '13.95.161.205,127.0.0.1',
	'sites.enonic.url': 'https://enonic.fotoware.cloud'
};

// @ts-ignore TS2339: Property 'log' does not exist on type 'typeof globalThis'.
global.log = Log.createLogger({
	loglevel: 'silent'
});

const MAPPINGS: Mappings = {
	5: 'displayName',
	25: 'data.tags',
	80: 'data.artist',
	116: 'data.copyright',
	120: [
		'x.media.imageInfo.description',
		'data.altText',
	]
};

jest.mock('/lib/xp/common', () => ({
	sanitize: jest.fn<typeof sanitize>((text) => text)
}), { virtual: true });

const javaBridge = new JavaBridge({
	app: {
		config: {},
		name: 'com.enonic.app.fotoware',
		version: '0.0.1-SNAPSHOT'
	},
	log//: global.log
});
javaBridge.repo.create({
	id: 'com.enonic.cms.explorer'
});
const connection = javaBridge.connect({
	repoId: 'com.enonic.cms.explorer',
	branch: 'master'
});

const FILESTEM = 'image';
const FILENAME = `${FILESTEM}.png`;

connection.create({
	_name: 'content'
});
connection.create({
	_name: 'EnonicWare',
	_parentPath: '/content'
});

const NODE_CREATE_PARAMS = {
	_childOrder: 'modifiedtime DESC',
	//_indexConfig // Not important for this test
	_inheritsPermissions: true,
	_name: FILENAME,
	_parentPath: '/content/EnonicWare',
	// _permissions // Not important for this test
	_nodeType: 'content',
	attachment: {
		binary: FILENAME,
		label: 'source',
		mimeType: 'image/png',
		name: FILENAME,
		size: 8,
		sha512: 'sha512'
	},
	creator: 'user:system:su',
	createdTime: '2023-05-26T12:40:03.693253Z',
	data: {
		artist: '',
		caption: '',
		copyright: '',
		media: {
			attachment: FILENAME,
			focalPoint: {
				x: 0.5,
				y: 0.5
			}
		},
		tags: ''
	},
	displayName: FILESTEM,
	modifier: 'user:system:su',
	modifiedTime: '2023-05-26T12:40:03.693253Z',
	owner: 'user:system:su',
	type: 'media:image',
	valid: true,
	x: {
		media: {
			imageInfo: {
				imageHeight: 2,
				imageWidth: 2,
				contentType: 'image/png',
				pixelSize: 4,
				byteSize: 8
			}
		}
	}
}

// TODO: Mock-xp should deref, there should be no reference to the "internal" content object
const createdMediaContent = deref(connection.create(NODE_CREATE_PARAMS));
// log.debug('createdMediaContent: %s', createdMediaContent);

jest.mock('/lib/xp/content', () => ({
	delete: jest.fn<typeof deleteContent>(({
		key
	}) => {
		connection.delete(key);
		return true; // TODO Hardcode (I'm using Node layer to simulate Content Layer)
	}),
	// @ts-ignore
	modify: jest.fn<typeof modify>(({
		key,
		editor,
		// requireValid
	}) => {
		// TODO: I'm using Node layer to simulate Content Layer. I should use mock-xp to simulate Content Layer.
		return connection.modify({
			key,
			// @ts-ignore
			editor,
			// requireValid
		}) //as unknown as Content;
	})
}), { virtual: true });

const PROPERTY_POLICY: SiteConfigProperties = {
	displayName: PROPERTY_ON_CREATE,
	artist: PROPERTY_IF_CHANGED,
	copyright: PROPERTY_OVERWRITE,
	tags: PROPERTY_IF_CHANGED,
	description: PROPERTY_IF_CHANGED
};

describe('lib', () => {
	describe('fotoware', () => {
		describe('xp', () => {
			describe('modifyMediaContent', () => {

				test('it adds metadata on new media content', () => {
					modifyMediaContent({
						exisitingMediaContent: undefined, // is undefined when creating
						key: createdMediaContent._id,
						mappings: MAPPINGS,
						md5sum: 'md5sumValue',
						metadata: {
							5: { value: '5 original value from FotoWare' },
							25: { value: '25 original value from FotoWare' },
							80: { value: '80 original value from FotoWare' },
							116: { value: '116 original value from FotoWare' },
							120: { value: '120 original value from FotoWare' }
						},
						properties: PROPERTY_POLICY
					});
					const modifiedMediaContent = connection.get(createdMediaContent._id);
					// log.debug('modifiedMediaContent: %s', modifiedMediaContent);
					expect(modifiedMediaContent).toStrictEqual({
						...createdMediaContent,
						data: {
							...createdMediaContent['data'] as MediaContent['data'],
							altText: '120 original value from FotoWare',
							artist: '80 original value from FotoWare',
							copyright: '116 original value from FotoWare',
							fotoWare: {
								md5sum: 'md5sumValue',
								metadata: {
									'116': '116 original value from FotoWare',
									'120': '120 original value from FotoWare',
									'25': '25 original value from FotoWare',
									'5': '5 original value from FotoWare',
									'80': '80 original value from FotoWare'
								}
							},
							tags: '25 original value from FotoWare'
						},
						displayName: '5 original value from FotoWare',
						x: {
							...createdMediaContent['x'] as XpXData,
							media: {
								...(createdMediaContent['x'] as XpXData)['media'],
								imageInfo: {
									...((createdMediaContent['x'] as XpXData)['media'] as XpXDataMedia)['imageInfo'],
									description: '120 original value from FotoWare'
								}
							}
						}
					});
				}); // test it adds metadata on new media content

				test('it handles ValueTypeException', () => {
					const spyUpdateMetadataOnContent = jest.spyOn(updateMetadataOnContentModule, 'updateMetadataOnContent');
					spyUpdateMetadataOnContent.mockImplementation(() => {
						throw new ValueTypeException('Value type exception');
					});
					const spyLogError = jest.spyOn(log, 'error');
					expect(() => {
						modifyMediaContent({
							exisitingMediaContent: undefined,
							key: createdMediaContent._id,
							mappings: MAPPINGS,
							md5sum: 'md5sumValue',
							metadata: {
								5: { value: '5 original value from FotoWare' },
								25: { value: '25 original value from FotoWare' },
								80: { value: '80 original value from FotoWare' },
								116: { value: '116 original value from FotoWare' },
								120: { value: '120 original value from FotoWare' }
							},
							properties: PROPERTY_POLICY
						});
					}).toThrowError('Value type exception');
					expect(spyLogError).toHaveBeenCalledWith(`Unable to modify ${createdMediaContent._id}`);
					spyUpdateMetadataOnContent.mockClear();
					spyLogError.mockClear();
				});

				test('it handles RuntimeException', () => {
					const spyUpdateMetadataOnContent = jest.spyOn(updateMetadataOnContentModule, 'updateMetadataOnContent');
					spyUpdateMetadataOnContent.mockImplementation(() => {
						throw new RuntimeException('Failed to read BufferedImage from InputStream');
					});
					const spyLogWarning = jest.spyOn(log, 'warning');
					expect(() => {
						modifyMediaContent({
							exisitingMediaContent: undefined,
							key: createdMediaContent._id,
							mappings: MAPPINGS,
							md5sum: 'md5sumValue',
							metadata: {
								5: { value: '5 original value from FotoWare' },
								25: { value: '25 original value from FotoWare' },
								80: { value: '80 original value from FotoWare' },
								116: { value: '116 original value from FotoWare' },
								120: { value: '120 original value from FotoWare' }
							},
							properties: PROPERTY_POLICY
						});
					}).toThrowError('Failed to read BufferedImage from InputStream');
					expect(spyLogWarning).toHaveBeenCalledWith(`Deleting corrupt image ${createdMediaContent._id}`);

					const deletedMediaContent = connection.get(createdMediaContent._id);
					expect(deletedMediaContent).toBeUndefined();

					spyUpdateMetadataOnContent.mockClear();
					spyLogWarning.mockClear();
				});

				test('it handles other Errors', () => {
					const createdMediaContent2 = deref(connection.create(NODE_CREATE_PARAMS));
					log.debug('createdMediaContent2: %s', createdMediaContent2);
					const spyUpdateMetadataOnContent = jest.spyOn(updateMetadataOnContentModule, 'updateMetadataOnContent');
					const specificException = new JavaException({
						name: 'JavaException',
						message: 'Unknown Error'
					})
					spyUpdateMetadataOnContent.mockImplementation(() => {
						throw specificException;
					});
					const spyLogError = jest.spyOn(log, 'error');
					expect(() => {
						modifyMediaContent({
							exisitingMediaContent: undefined,
							key: createdMediaContent2._id,
							mappings: MAPPINGS,
							md5sum: 'md5sumValue',
							metadata: {
								5: { value: '5 original value from FotoWare' },
								25: { value: '25 original value from FotoWare' },
								80: { value: '80 original value from FotoWare' },
								116: { value: '116 original value from FotoWare' },
								120: { value: '120 original value from FotoWare' }
							},
							properties: PROPERTY_POLICY
						});
					}).toThrowError('Unknown Error');
					expect(spyLogError).toBeCalledTimes(2);
					expect(spyLogError).toHaveBeenCalledWith('Something unkown went wrong when trying to modifyContent exisitingMediaContent:undefined');
					expect(spyLogError).toHaveBeenCalledWith(specificException);
					const deletedMediaContent = connection.get(createdMediaContent2._id);
					expect(deletedMediaContent).toBeUndefined();
					spyUpdateMetadataOnContent.mockClear();
					spyLogError.mockClear();
				});

			});
		});
	});
});
