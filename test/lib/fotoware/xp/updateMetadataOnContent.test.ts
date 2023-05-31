import type { Component } from '@enonic-types/lib-content';
import type {MediaContent} from '/lib/fotoware/xp/MediaContent.d';
import type {sanitize} from '@enonic-types/lib-common';


import Log from '@enonic/mock-xp/dist/Log';
import {hasOwnProperty} from '@enonic/js-utils';
import {
	describe,
	expect,
	jest,
	test
} from '@jest/globals';
// @ts-ignore
import {print} from 'q-i';
import {
	PROPERTY_ON_CREATE,
	PROPERTY_IF_CHANGED,
	PROPERTY_OVERWRITE
} from '/lib/fotoware/xp/constants';
import { updateMetadataOnContent } from '/lib/fotoware/xp/updateMetadataOnContent';
import { SiteConfigProperties } from '/lib/fotoware/xp/AppConfig';


declare global {
	interface XpXData {
		media?: {
			imageInfo?: {
				byteSize?: number
				contentType?: string
				description?: string
				imageHeight?: number
				imageWidth?: number
				pixelSize?: number
			}
		}
	}
}


function deref<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}


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


const PROPERTY_POLICY: SiteConfigProperties = {
	displayName: PROPERTY_ON_CREATE,
	artist: PROPERTY_IF_CHANGED,
	copyright: PROPERTY_OVERWRITE,
	tags: PROPERTY_IF_CHANGED,
	description: PROPERTY_IF_CHANGED
};


const MEDIA_CONTENT_WITHOUT_METADATA: MediaContent = {
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
	} as MediaContent['data'],
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
	} as XpXData
}; // MEDIA_CONTENT_WITHOUT_METADATA
// print(MEDIA_CONTENT_WITHOUT_METADATA, { maxItems: Infinity });


const NEW_MEDIA_CONTENT: MediaContent = {
	...deref(MEDIA_CONTENT_WITHOUT_METADATA),
	data: {
		...deref(MEDIA_CONTENT_WITHOUT_METADATA.data),
		artist: '80 original value from FotoWare',
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
		tags: '25 original value from FotoWare'
	} as MediaContent['data'],
	displayName: '5 original value from FotoWare',
	x: {
		media: {
			imageInfo: {
				...MEDIA_CONTENT_WITHOUT_METADATA.x['media']?.['imageInfo'],
				description: '120 original value from FotoWare',
			}
		}
	} as XpXData
}; // NEW_MEDIA_CONTENT
// print(NEW_MEDIA_CONTENT, { maxItems: Infinity });


const MEDIA_CONTENT_CHANGED_IN_XP: MediaContent = {
	...deref(NEW_MEDIA_CONTENT),
	data: {
		...NEW_MEDIA_CONTENT.data,
		artist: 'artist changed value in Enonic XP',
		caption: 'caption added value in Enonic XP',
		copyright: 'copyright changed value in Enonic XP',
		tags: 'tags changed value in Enonic XP'
	} as MediaContent['data'],
	displayName: 'displayName changed value in Enonic XP',
	x: {
		media: {
			imageInfo: {
				...NEW_MEDIA_CONTENT.x['media']?.['imageInfo'],
				description: 'description changed value in Enonic XP',
			}
		}
	} as XpXData
}; // MEDIA_CONTENT_CHANGED_IN_XP
// print(MEDIA_CONTENT_CHANGED_IN_XP, { maxItems: Infinity });


describe('lib', () => {
	describe('fotoware', () => {
		describe('xp', () => {
			describe('updateMetadataOnContent', () => {

				test('it adds metadata on new media content', () => {
					expect(updateMetadataOnContent({
						content: deref(MEDIA_CONTENT_WITHOUT_METADATA),
						md5sum: '1',
						metadata: {
							5: { value: '5 original value from FotoWare' },
							25: { value: '25 original value from FotoWare' },
							80: { value: '80 original value from FotoWare' },
							116: { value: '116 original value from FotoWare' },
							120: { value: '120 original value from FotoWare' }
						},
						// modify: true,
						properties: PROPERTY_POLICY
					})).toStrictEqual(NEW_MEDIA_CONTENT);
				});

				// test('it does nothing, when nothing is changed', () => {
				// 	expect(updateMetadataOnContent({
				// 		content: MEDIA_CONTENT_CHANGED_IN_XP,
				// 		md5sum: '1',
				// 		metadata: {
				// 			5: { value: '5 original value from FotoWare' },
				// 			25: { value: '25 original value from FotoWare' },
				// 			80: { value: '80 original value from FotoWare' },
				// 			116: { value: '116 original value from FotoWare' },
				// 			120: { value: '120 original value from FotoWare' }
				// 		},
				// 		// modify: true,
				// 		properties: PROPERTY_POLICY
				// 	})).toStrictEqual(MEDIA_CONTENT_CHANGED_IN_XP);
				// });

				test('it respects default property policies on change', () => {
					const content_with_changes: MediaContent = {
						...deref(MEDIA_CONTENT_CHANGED_IN_XP),
						data: {
							...deref(MEDIA_CONTENT_CHANGED_IN_XP.data),
							artist: '80 changed value from FotoWare',
							caption: 'caption added value in Enonic XP',
							copyright: '116 changed value from FotoWare',
							fotoWare: {
								...deref(MEDIA_CONTENT_CHANGED_IN_XP.data.fotoWare),
								metadata: {
									'116': '116 changed value from FotoWare',
									'120': '120 changed value from FotoWare',
									'25': '25 changed value from FotoWare',
									'5': '5 changed value from FotoWare',
									'80': '80 changed value from FotoWare'
								}
							},
							tags: '25 changed value from FotoWare'
						},
						// displayName: 'displayName changed value in Enonic XP', // unchanged
						x: {
							media: {
								imageInfo: {
									...deref(MEDIA_CONTENT_CHANGED_IN_XP.x['media']?.['imageInfo']),
									description: '120 changed value from FotoWare',
								}
							}
						}
					};
					// print({content_with_changes}, { maxItems: Infinity });
					expect(updateMetadataOnContent({
						content: deref(MEDIA_CONTENT_CHANGED_IN_XP),
						md5sum: '1',
						metadata: {
							5: { value: '5 changed value from FotoWare' },
							25: { value: '25 changed value from FotoWare' },
							80: { value: '80 changed value from FotoWare' },
							116: { value: '116 changed value from FotoWare' },
							120: { value: '120 changed value from FotoWare' }
						},
						modify: true,
						properties: PROPERTY_POLICY
					})).toStrictEqual(content_with_changes);
				});

				test('it deletes deleted fields', () => {
					const fw = deref(MEDIA_CONTENT_CHANGED_IN_XP.data.fotoWare);
					if (fw && hasOwnProperty(fw, 'metadata')) {
						delete fw.metadata;
					}

					const contentWithDeletedFields: MediaContent = {
						...deref(MEDIA_CONTENT_CHANGED_IN_XP),
						data: {
							...deref(MEDIA_CONTENT_CHANGED_IN_XP.data),
							artist: undefined,
							fotoWare: fw,
							copyright: '',
							tags: undefined
						},
						// displayName: 'displayName changed value in Enonic XP', // unchanged
						x: {
							media: {
								imageInfo: {
									...deref(MEDIA_CONTENT_CHANGED_IN_XP.x['media']?.['imageInfo']),
									description: undefined,
								}
							}
						} as XpXData
					};
					// print({contentWithDeletedFields}, { maxItems: Infinity });

					expect(updateMetadataOnContent({
						content: deref(MEDIA_CONTENT_CHANGED_IN_XP),
						md5sum: '1',
						metadata: {},
						modify: true,
						properties: PROPERTY_POLICY
					})).toStrictEqual(contentWithDeletedFields);
				});

				test('it handles content without xData', () => {
					type MediaContentWithOptionalX = Omit<MediaContent,'x'> & {
						x?: XpXData
					}
					const contentWithoutX: MediaContentWithOptionalX = deref(MEDIA_CONTENT_WITHOUT_METADATA);
					if (contentWithoutX && hasOwnProperty(contentWithoutX, 'x')) {
						delete contentWithoutX.x;
					}
					// print({content_without_x}, { maxItems: Infinity });
					const content_with_x_but_only_description: MediaContent = {
						...deref(NEW_MEDIA_CONTENT),
						// data: {
						// 	...NEW_MEDIA_CONTENT.data,
						// 	fotoWare: {
						// 		md5sum: '1',
						// 		metadata: {
						// 			'116': '116 original value from FotoWare',
						// 			'120': '120 original value from FotoWare',
						// 			'25': '25 original value from FotoWare',
						// 			'5': '5 original value from FotoWare',
						// 			'80': '80 original value from FotoWare'
						// 		}
						// 	}
						// },
						x: {
							media: {
								imageInfo: {
									description: '120 original value from FotoWare'
								}
							}
						} as XpXData
					};
					// print({content_with_x_but_only_description}, { maxItems: Infinity });
					expect(updateMetadataOnContent({
						content: contentWithoutX,
						md5sum: '1',
						metadata: {
							5: { value: '5 original value from FotoWare' },
							25: { value: '25 original value from FotoWare' },
							80: { value: '80 original value from FotoWare' },
							116: { value: '116 original value from FotoWare' },
							120: { value: '120 original value from FotoWare' }
						},
						// modify: true,
						properties: PROPERTY_POLICY
					})).toStrictEqual(content_with_x_but_only_description);
				});

				test('it updates md5sum ', () => {
					expect(updateMetadataOnContent({
						content: deref(MEDIA_CONTENT_CHANGED_IN_XP),
						md5sum: '2',
						metadata: {
							5: { value: '5 original value from FotoWare' },
							25: { value: '25 original value from FotoWare' },
							80: { value: '80 original value from FotoWare' },
							116: { value: '116 original value from FotoWare' },
							120: { value: '120 original value from FotoWare' }
						},
						modify: true,
						properties: PROPERTY_POLICY
					})).toStrictEqual({
						...deref(MEDIA_CONTENT_CHANGED_IN_XP),
						data: {
							...deref(MEDIA_CONTENT_CHANGED_IN_XP.data),
							copyright: '116 original value from FotoWare',
							fotoWare: {
								...deref(MEDIA_CONTENT_CHANGED_IN_XP.data.fotoWare),
								md5sum: '2',
							}
						}
					});
				});

				test('it handles extra metadata', () => {
					expect(updateMetadataOnContent({
						content: deref(MEDIA_CONTENT_WITHOUT_METADATA),
						md5sum: '1',
						metadata: {
							5: { value: '5 original value from FotoWare' },
							25: { value: '25 original value from FotoWare' },
							80: { value: '80 original value from FotoWare' },
							115: { value: '115 original value from FotoWare' },
							116: { value: '116 original value from FotoWare' },
							120: { value: '120 original value from FotoWare' },
						},
						// modify: true,
						properties: PROPERTY_POLICY
					})).toStrictEqual({
						...deref(NEW_MEDIA_CONTENT),
						data: {
							...deref(NEW_MEDIA_CONTENT.data),
							fotoWare: {
								...deref(NEW_MEDIA_CONTENT.data.fotoWare),
								metadata: {
									...deref(NEW_MEDIA_CONTENT.data.fotoWare?.metadata),
									115: '115 original value from FotoWare'
								}
							}
						}
					});
				});

				test('it deletes extra metadata', () => {
					const contentWithExtraMetadata: MediaContent = {
						...deref(NEW_MEDIA_CONTENT),
						data: {
							...deref(NEW_MEDIA_CONTENT.data),
							fotoWare: {
								...deref(NEW_MEDIA_CONTENT.data.fotoWare),
								metadata: {
									...deref(NEW_MEDIA_CONTENT.data.fotoWare?.metadata),
									115: '115 original value from FotoWare'
								}
							}
						}
					};
					print({contentWithExtraMetadata}, { maxItems: Infinity });

					const md = deref(contentWithExtraMetadata.data.fotoWare?.metadata);
					if (md) {
						delete md[115];
					}
					const contentWithExtraMetadataDeleted: MediaContent = {
						...deref(contentWithExtraMetadata),
						data: {
							...deref(contentWithExtraMetadata.data),
							fotoWare: {
								...deref(contentWithExtraMetadata.data.fotoWare),
								metadata: md
							}
						}
					};
					print({contentWithExtraMetadataDeleted}, { maxItems: Infinity });

					expect(updateMetadataOnContent({
						content: contentWithExtraMetadata,
						md5sum: '1',
						metadata: {
							5: { value: '5 original value from FotoWare' },
							25: { value: '25 original value from FotoWare' },
							80: { value: '80 original value from FotoWare' },
							// No 115 anymore :)
							116: { value: '116 original value from FotoWare' },
							120: { value: '120 original value from FotoWare' },
						},
						modify: true,
						properties: PROPERTY_POLICY
					})).toStrictEqual(contentWithExtraMetadataDeleted);
				});

			}); // updateMetadataOnContent
		}); // xp
	}); // fotoware
}); // lib
