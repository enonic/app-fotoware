import type { Component } from '@enonic-types/lib-content';
import type {MediaContent} from '/lib/fotoware/xp/MediaContent.d';
import type {sanitize} from '@enonic-types/lib-common';

import Log from '@enonic/mock-xp/dist/Log';
import {
	describe,
	expect,
	jest,
	test
} from '@jest/globals';
import {
	PROPERTY_ON_CREATE,
	PROPERTY_IF_CHANGED,
	PROPERTY_OVERWRITE
} from '/lib/fotoware/xp/constants';
import { updateMetadataOnContent } from '/lib/fotoware/xp/updateMetadataOnContent';


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
	loglevel: 'warn'
});

jest.mock('/lib/xp/common', () => ({
	sanitize: jest.fn<typeof sanitize>((text) => text)
}), { virtual: true });


const MEDIA_CONTENT: MediaContent = {
	_id: '3dca8773-f108-43f9-af0b-bf35fb151c09',
	_name: 'image.png',
	_path: '/folder/image.png',
	_score: 1,
	attachments: {
		'image.png': {
			name: 'image.png',
			label: 'source',
			size: 8,
			mimeType: 'image/png'
		}
	},
	childOrder: 'modifiedtime DESC',
	creator: 'user:system:cwe',
	createdTime: '2023-05-26T12:40:03.693253Z',
	data: {
		artist: '',
		caption: '',
		copyright: '',
		media: {
			attachment: 'image.png',
			focalPoint: {
				x: 0.5,
				y: 0.5
			}
		},
		tags: ''
	},
	displayName: 'image',
	hasChildren: false,
	language: 'en_US',
	modifier: 'user:system:cwe',
	modifiedTime: '2023-05-26T13:00:00.123456Z',
	originProject: 'originProject',
	owner: 'user:system:cwe',
	page: {} as Component,
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
}; // MEDIA_CONTENT


describe('lib', () => {
	describe('fotoware', () => {
		describe('xp', () => {
			describe('updateMetadataOnContent', () => {
				test('it adds metadata on new media content', () => {
					expect(updateMetadataOnContent({
						content: MEDIA_CONTENT,
						md5sum: '1',
						metadata: {
							5: { value: '5 original value from FotoWare' },
							25: { value: '25 original value from FotoWare' },
							80: { value: '80 original value from FotoWare' },
							116: { value: '116 original value from FotoWare' },
							120: { value: '120 original value from FotoWare' }
						},
						// modify: true,
						properties: {
							displayName: PROPERTY_ON_CREATE,
							artist: PROPERTY_IF_CHANGED,
							copyright: PROPERTY_OVERWRITE,
							tags: PROPERTY_IF_CHANGED,
							description: PROPERTY_IF_CHANGED
						}
					})).toStrictEqual({
						// ...MEDIA_CONTENT,
						_id: '3dca8773-f108-43f9-af0b-bf35fb151c09',
						_name: 'image.png',
						_path: '/folder/image.png',
						_score: 1,
						attachments: {
							'image.png': {
								name: 'image.png',
								label: 'source',
								size: 8,
								mimeType: 'image/png'
							}
						},
						childOrder: 'modifiedtime DESC',
						creator: 'user:system:cwe',
						createdTime: '2023-05-26T12:40:03.693253Z',
						data: {
							artist: '80 original value from FotoWare',
							caption: '',
							copyright: '116 original value from FotoWare',
							fotoWare: {
								md5sum: '1',
								metadata: {
									'116': '116 original value from FotoWare',
									'120': '120 original value from FotoWare',
									'25': '25 original value from FotoWare',
									'5': '5 original value from FotoWare',
									'80': '80 original value from FotoWare'
								}
							},
							media: {
								attachment: 'image.png',
								focalPoint: {
									x: 0.5,
									y: 0.5
								}
							},
							tags: '25 original value from FotoWare'
						},
						displayName: '5 original value from FotoWare',
						hasChildren: false,
						language: 'en_US',
						modifier: 'user:system:cwe',
						modifiedTime: '2023-05-26T13:00:00.123456Z',
						originProject: 'originProject',
						owner: 'user:system:cwe',
						page: {},
						type: 'media:image',
						valid: true,
						x: {
							media: {
								imageInfo: {
									contentType: 'image/png',
									description: '120 original value from FotoWare',
									imageHeight: 2,
									imageWidth: 2,
									pixelSize: 4,
									byteSize: 8
								}
							}
						}
					});
				});
			});
		});
	});
});
