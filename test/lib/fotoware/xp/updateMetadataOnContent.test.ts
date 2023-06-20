import type {
	NestedRecord,
	PageComponent
} from '@enonic-types/core';
import type {
	Mappings,
	MediaContent,
	SiteConfigProperties
} from '/lib/fotoware';
import type {sanitize} from '@enonic-types/lib-common';


import Log from '@enonic/mock-xp/dist/Log';
import {
	deleteIn,
	hasOwnProperty,
	setIn
} from '@enonic/js-utils';
import {
	describe,
	expect,
	jest,
	test
} from '@jest/globals';
// @ts-ignore
// import {print} from 'q-i';
import {
	PROPERTY_ON_CREATE,
	PROPERTY_IF_CHANGED,
	PROPERTY_OVERWRITE,
	X_APP_NAME
} from '/lib/fotoware/xp/constants';
import { updateMetadataOnContent } from '/lib/fotoware/xp/updateMetadataOnContent';


// declare global {
// 	interface XpXData {
// 		media?: {
// 			imageInfo?: {
// 				byteSize?: number
// 				contentType?: string
// 				description?: string
// 				imageHeight?: number
// 				imageWidth?: number
// 				pixelSize?: number
// 			}
// 		}
// 	}
// }


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
	// loglevel: 'debug'
	// loglevel: 'info'
	loglevel: 'silent'
});

jest.mock('/lib/xp/common', () => ({
	sanitize: jest.fn<typeof sanitize>((text) => text)
}), { virtual: true });

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


const PROPERTY_POLICY: SiteConfigProperties = {
	displayName: PROPERTY_ON_CREATE,
	//altText: PROPERTY_IF_CHANGED,
	artist: PROPERTY_IF_CHANGED,
	copyright: PROPERTY_OVERWRITE,
	tags: PROPERTY_IF_CHANGED,
	description: PROPERTY_IF_CHANGED
};


const METADATA_VALUE_5_ORIG_FROM_FW = '5 (title displayname) original value from FotoWare';
const METADATA_VALUE_25_ORIG_FROM_FW = '25 (tags) original value from FotoWare';
const METADATA_VALUE_80_ORIG_FROM_FW = '80 (author artist) original value from FotoWare';
const METADATA_VALUE_116_ORIG_FROM_FW = '116 (copyright) original value from FotoWare';
const METADATA_VALUE_120_ORIG_FROM_FW = '120 (description) original value from FotoWare';

const METADATA_VALUE_5_CHANGED_FROM_FW = '5 (title displayname) changed value from FotoWare';
// const METADATA_VALUE_25_CHANGED_FROM_FW = '25 (tags) changed value from FotoWare';
// const METADATA_VALUE_80_CHANGED_FROM_FW = '80 (author artist) changed value from FotoWare';
// const METADATA_VALUE_116_CHANGED_FROM_FW = '116 (copyright) changed value from FotoWare';
// const METADATA_VALUE_120_CHANGED_FROM_FW = '120 (description) changed value from FotoWare';


const VALUE_DISPLAYNAME_5_CHANGED_IN_XP = '5 (title displayname) changed value in Enonic XP';
const VALUE_TAGS_25_CHANGED_IN_XP = '25 (tags) original changed in Enonic XP';
const VALUE_ARTIST_80_CHANGED_IN_XP = '80 (author artist) changed value in Enonic XP';
const VALUE_COPYRIGHT_116_CHANGED_IN_XP = '116 (copyright) changed value in Enonic XP';
const VALUE_DESCRIPTION_120_CHANGED_IN_XP = '120 (description) changed value in Enonic XP';
const VALUE_ALTTEXT_120_CHANGED_IN_XP = '120 (alttext description) changed value in Enonic XP';



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
	page: {} as PageComponent,
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
	} as XpXData,
	fragment: undefined
}; // MEDIA_CONTENT_WITHOUT_METADATA
// print(MEDIA_CONTENT_WITHOUT_METADATA, { maxItems: Infinity });


const NEW_MEDIA_CONTENT: MediaContent = {
	...deref(MEDIA_CONTENT_WITHOUT_METADATA),
	data: {
		...deref(MEDIA_CONTENT_WITHOUT_METADATA.data),
		altText: METADATA_VALUE_120_ORIG_FROM_FW,
		artist: METADATA_VALUE_80_ORIG_FROM_FW,
		copyright: METADATA_VALUE_116_ORIG_FROM_FW,
		fotoWare: {
			md5sum: '1',
			metadata: {
				'116': METADATA_VALUE_116_ORIG_FROM_FW,
				'120': METADATA_VALUE_120_ORIG_FROM_FW,
				'25': METADATA_VALUE_25_ORIG_FROM_FW,
				'5': METADATA_VALUE_5_ORIG_FROM_FW,
				'80': METADATA_VALUE_80_ORIG_FROM_FW
			}
		},
		tags: METADATA_VALUE_25_ORIG_FROM_FW
	} as MediaContent['data'],
	displayName: METADATA_VALUE_5_ORIG_FROM_FW,
	x: {
		media: {
			imageInfo: {
				...MEDIA_CONTENT_WITHOUT_METADATA.x['media']?.['imageInfo'],
				description: METADATA_VALUE_120_ORIG_FROM_FW,
			}
		}
	} as XpXData
}; // NEW_MEDIA_CONTENT
// print(NEW_MEDIA_CONTENT, { maxItems: Infinity });


const MEDIA_CONTENT_CHANGED_IN_XP: MediaContent = {
	...deref(NEW_MEDIA_CONTENT),
	data: {
		...NEW_MEDIA_CONTENT.data,
		altText: VALUE_ALTTEXT_120_CHANGED_IN_XP,
		artist: VALUE_ARTIST_80_CHANGED_IN_XP,
		caption: 'caption added value in Enonic XP',
		copyright: VALUE_COPYRIGHT_116_CHANGED_IN_XP,
		tags: VALUE_TAGS_25_CHANGED_IN_XP
	} as MediaContent['data'],
	displayName: VALUE_DISPLAYNAME_5_CHANGED_IN_XP,
	x: {
		media: {
			imageInfo: {
				...NEW_MEDIA_CONTENT.x['media']?.['imageInfo'],
				description: VALUE_DESCRIPTION_120_CHANGED_IN_XP,
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
						mappings: MAPPINGS,
						md5sum: '1',
						metadata: {
							5: { value: METADATA_VALUE_5_ORIG_FROM_FW },
							25: { value: METADATA_VALUE_25_ORIG_FROM_FW },
							80: { value: METADATA_VALUE_80_ORIG_FROM_FW },
							116: { value: METADATA_VALUE_116_ORIG_FROM_FW },
							120: { value: METADATA_VALUE_120_ORIG_FROM_FW }
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
				// 			5: { value: METADATA_VALUE_5_ORIG_FROM_FW },
				// 			25: { value: METADATA_VALUE_25_ORIG_FROM_FW },
				// 			80: { value: METADATA_VALUE_80_ORIG_FROM_FW },
				// 			116: { value: METADATA_VALUE_116_ORIG_FROM_FW },
				// 			120: { value: METADATA_VALUE_120_ORIG_FROM_FW }
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
							altText: '120 changed value from FotoWare',
							artist: '80 changed value from FotoWare',
							caption: 'caption added value in Enonic XP',
							copyright: '116 (copyright) changed value from FotoWare',
							fotoWare: {
								...deref(MEDIA_CONTENT_CHANGED_IN_XP.data.fotoWare),
								metadata: {
									'116': '116 (copyright) changed value from FotoWare',
									'120': '120 changed value from FotoWare',
									'25': '25 changed value from FotoWare',
									'5': '5 changed value from FotoWare',
									'80': '80 changed value from FotoWare'
								}
							},
							tags: '25 changed value from FotoWare'
						},
						// displayName: VALUE_DISPLAYNAME_5_CHANGED_IN_XP, // unchanged
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
						mappings: MAPPINGS,
						md5sum: '1',
						metadata: {
							5: { value: '5 changed value from FotoWare' },
							25: { value: '25 changed value from FotoWare' },
							80: { value: '80 changed value from FotoWare' },
							116: { value: '116 (copyright) changed value from FotoWare' },
							120: { value: '120 changed value from FotoWare' }
						},
						modify: true,
						properties: PROPERTY_POLICY
					})).toStrictEqual(content_with_changes);
				});

				test('it deletes deleted fields', () => {
					const data = deref(MEDIA_CONTENT_CHANGED_IN_XP.data)
					delete data.altText;
					delete data.artist;
					delete data.copyright;
					delete data.tags;

					const fw = data.fotoWare;
					if (fw && hasOwnProperty(fw, 'metadata')) {
						delete fw.metadata;
					}

					const x = deref(MEDIA_CONTENT_CHANGED_IN_XP.x) as NestedRecord;
					deleteIn(x, 'media', 'imageInfo', 'description');

					const contentWithDeletedFields: MediaContent = {
						...deref(MEDIA_CONTENT_CHANGED_IN_XP),
						data,
						// displayName: VALUE_DISPLAYNAME_5_CHANGED_IN_XP, // unchanged
						x: x as unknown as XpXData
					};
					// print({contentWithDeletedFields}, { maxItems: Infinity });

					expect(updateMetadataOnContent({
						content: deref(MEDIA_CONTENT_CHANGED_IN_XP),
						mappings: MAPPINGS,
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
						// 			'116': METADATA_VALUE_116_ORIG_FROM_FW,
						// 			'120': METADATA_VALUE_120_ORIG_FROM_FW,
						// 			'25': METADATA_VALUE_25_ORIG_FROM_FW,
						// 			'5': METADATA_VALUE_5_ORIG_FROM_FW,
						// 			'80': METADATA_VALUE_80_ORIG_FROM_FW
						// 		}
						// 	}
						// },
						x: {
							media: {
								imageInfo: {
									description: METADATA_VALUE_120_ORIG_FROM_FW
								}
							}
						} as XpXData
					};
					// print({content_with_x_but_only_description}, { maxItems: Infinity });
					expect(updateMetadataOnContent({
						content: contentWithoutX,
						mappings: MAPPINGS,
						md5sum: '1',
						metadata: {
							5: { value: METADATA_VALUE_5_ORIG_FROM_FW },
							25: { value: METADATA_VALUE_25_ORIG_FROM_FW },
							80: { value: METADATA_VALUE_80_ORIG_FROM_FW },
							116: { value: METADATA_VALUE_116_ORIG_FROM_FW },
							120: { value: METADATA_VALUE_120_ORIG_FROM_FW }
						},
						// modify: true,
						properties: PROPERTY_POLICY
					})).toStrictEqual(content_with_x_but_only_description);
				});

				test('it updates md5sum ', () => {
					expect(updateMetadataOnContent({
						content: deref(MEDIA_CONTENT_CHANGED_IN_XP),
						mappings: MAPPINGS,
						md5sum: '2',
						metadata: {
							5: { value: METADATA_VALUE_5_ORIG_FROM_FW },
							25: { value: METADATA_VALUE_25_ORIG_FROM_FW },
							80: { value: METADATA_VALUE_80_ORIG_FROM_FW },
							116: { value: METADATA_VALUE_116_ORIG_FROM_FW },
							120: { value: METADATA_VALUE_120_ORIG_FROM_FW }
						},
						modify: true,
						properties: PROPERTY_POLICY
					})).toStrictEqual({
						...deref(MEDIA_CONTENT_CHANGED_IN_XP),
						data: {
							...deref(MEDIA_CONTENT_CHANGED_IN_XP.data),
							copyright: METADATA_VALUE_116_ORIG_FROM_FW,
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
						mappings: MAPPINGS,
						md5sum: '1',
						metadata: {
							5: { value: METADATA_VALUE_5_ORIG_FROM_FW },
							25: { value: METADATA_VALUE_25_ORIG_FROM_FW },
							80: { value: METADATA_VALUE_80_ORIG_FROM_FW },
							115: { value: '115 original value from FotoWare' },
							116: { value: METADATA_VALUE_116_ORIG_FROM_FW },
							120: { value: METADATA_VALUE_120_ORIG_FROM_FW },
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
					// print({contentWithExtraMetadata}, { maxItems: Infinity });

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
					// print({contentWithExtraMetadataDeleted}, { maxItems: Infinity });

					expect(updateMetadataOnContent({
						content: contentWithExtraMetadata,
						mappings: MAPPINGS,
						md5sum: '1',
						metadata: {
							5: { value: METADATA_VALUE_5_ORIG_FROM_FW },
							25: { value: METADATA_VALUE_25_ORIG_FROM_FW },
							80: { value: METADATA_VALUE_80_ORIG_FROM_FW },
							// No 115 anymore :)
							116: { value: METADATA_VALUE_116_ORIG_FROM_FW },
							120: { value: METADATA_VALUE_120_ORIG_FROM_FW },
						},
						modify: true,
						properties: PROPERTY_POLICY
					})).toStrictEqual(contentWithExtraMetadataDeleted);
				});

				// This probably doesn't happen in real life, but it's a good test
				test('it deletes empty x-data', () => {
					const mediaContentWithoutImageInfo: MediaContent = {
						...deref(MEDIA_CONTENT_WITHOUT_METADATA),
						data: {
							...deref(MEDIA_CONTENT_WITHOUT_METADATA.data),
							fotoWare: {
								md5sum: '1',
							}
						},
						x: {
							media: {
								imageInfo: {}
							}
						}
					};
					deleteIn(mediaContentWithoutImageInfo as unknown as NestedRecord, 'data', 'artist');
					deleteIn(mediaContentWithoutImageInfo as unknown as NestedRecord, 'data', 'copyright');
					deleteIn(mediaContentWithoutImageInfo as unknown as NestedRecord, 'data', 'tags');
					const mediaContentWithoutXData: MediaContent = {
						...deref(mediaContentWithoutImageInfo),
					}
					// @ts-ignore
					delete mediaContentWithoutXData.x;
					expect(updateMetadataOnContent({
						content: mediaContentWithoutImageInfo,
						mappings: MAPPINGS,
						md5sum: '1',
						metadata: {},
						modify: true,
						properties: PROPERTY_POLICY
					})).toStrictEqual(mediaContentWithoutXData);
				});

				test('it deletes old x-data', () => {
					const mediaContentWithOldXData: MediaContent = {
						...deref(MEDIA_CONTENT_WITHOUT_METADATA),
						data: {
							...deref(MEDIA_CONTENT_WITHOUT_METADATA.data),
							fotoWare: {
								md5sum: '1',
							}
						},
						x: {
							[X_APP_NAME]: {
								fotoWare: {
									md5sum: '1',
									metadata: {
										5: { value: METADATA_VALUE_5_ORIG_FROM_FW },
									}
								}
							}
						}
					};
					deleteIn(mediaContentWithOldXData as unknown as NestedRecord, 'data', 'artist');
					deleteIn(mediaContentWithOldXData as unknown as NestedRecord, 'data', 'copyright');
					deleteIn(mediaContentWithOldXData as unknown as NestedRecord, 'data', 'tags');
					const mediaContentWithoutOldXData: MediaContent = {
						...deref(mediaContentWithOldXData),
					}
					// @ts-ignore
					delete mediaContentWithoutOldXData.x;
					expect(updateMetadataOnContent({
						content: mediaContentWithOldXData,
						mappings: MAPPINGS,
						md5sum: '1',
						metadata: {},
						modify: true,
						properties: PROPERTY_POLICY
					})).toStrictEqual(mediaContentWithoutOldXData);
				});

				//──────────────────────────────────────────────────────────────
				// At this point 100% Funcs and Line coverage is achieved
				//──────────────────────────────────────────────────────────────

				test('it handles content without data', () => {
					const mediaContentWithoutData: MediaContent = deref(MEDIA_CONTENT_WITHOUT_METADATA);
					// @ts-ignore
					delete mediaContentWithoutData.data;
					// print({mediaContentWithoutData}, { maxItems: Infinity });

					const mediaContentWithData: MediaContent = {
						...deref(mediaContentWithoutData),
						data: {
							fotoWare: {
								md5sum: '1',
							},
						} as MediaContent['data']
					};
					// print({mediaContentWithData}, { maxItems: Infinity });
					expect(updateMetadataOnContent({
						content: mediaContentWithoutData,
						mappings: MAPPINGS,
						md5sum: '1',
						metadata: {},
						//modify: true,
						properties: PROPERTY_POLICY
					})).toStrictEqual(mediaContentWithData);
				});

				//──────────────────────────────────────────────────────────────
				// At this point 100% Stmts, Funcs and Line coverage is achieved
				//──────────────────────────────────────────────────────────────

				test('it handles displayName: PROPERTY_IF_CHANGED', () => {
					// print({MEDIA_CONTENT_CHANGED_IN_XP}, { maxItems: Infinity });

					const mediaContentWithChangedDisplayName: MediaContent = deref(MEDIA_CONTENT_CHANGED_IN_XP);
					setIn(mediaContentWithChangedDisplayName, ['data', 'copyright'], METADATA_VALUE_116_ORIG_FROM_FW);
					setIn(mediaContentWithChangedDisplayName, ['data', 'fotoWare', 'metadata', 5], METADATA_VALUE_5_CHANGED_FROM_FW);
					setIn(mediaContentWithChangedDisplayName, 'displayName', METADATA_VALUE_5_CHANGED_FROM_FW);
					// print({mediaContentWithChangedDisplayName}, { maxItems: Infinity });

					expect(updateMetadataOnContent({
						content: deref(MEDIA_CONTENT_CHANGED_IN_XP),
						mappings: MAPPINGS,
						md5sum: '1',
						metadata: {
							5: { value: METADATA_VALUE_5_CHANGED_FROM_FW },
							25: { value: METADATA_VALUE_25_ORIG_FROM_FW },
							80: { value: METADATA_VALUE_80_ORIG_FROM_FW },
							116: { value: METADATA_VALUE_116_ORIG_FROM_FW },
							120: { value: METADATA_VALUE_120_ORIG_FROM_FW }
						},
						modify: true,
						properties: {
							...deref(PROPERTY_POLICY),
							displayName: PROPERTY_IF_CHANGED
						}
					})).toStrictEqual(mediaContentWithChangedDisplayName);
				});

				test('it handles artist array', () => {
					const contentWithTwoArtists: MediaContent = deref(NEW_MEDIA_CONTENT);
					contentWithTwoArtists.data.artist = [
						'80 original Artist1 from FotoWare',
						'80 original Artist2 from FotoWare'
					];
					contentWithTwoArtists.data.fotoWare!.metadata![80] = [ // eslint-disable-line @typescript-eslint/no-non-null-assertion
						'80 original Artist1 from FotoWare',
						'80 original Artist2 from FotoWare'
					];
					expect(updateMetadataOnContent({
						content: deref(MEDIA_CONTENT_WITHOUT_METADATA),
						mappings: MAPPINGS,
						md5sum: '1',
						metadata: {
							5: { value: METADATA_VALUE_5_ORIG_FROM_FW},
							25: { value: METADATA_VALUE_25_ORIG_FROM_FW },
							80: { value: [
								'80 original Artist1 from FotoWare',
								'80 original Artist2 from FotoWare'
							] },
							116: { value: METADATA_VALUE_116_ORIG_FROM_FW },
							120: { value: METADATA_VALUE_120_ORIG_FROM_FW }
						},
						// modify: true,
						properties: PROPERTY_POLICY
					})).toStrictEqual(contentWithTwoArtists);
				});

				test('it handles copyright PROPERTY_IF_CHANGED', () => {
					const contentWithChangedCopyright = deref(NEW_MEDIA_CONTENT) as unknown as NestedRecord;
					deleteIn(contentWithChangedCopyright, 'data', 'copyright');
					deleteIn(contentWithChangedCopyright, 'data', 'fotoWare', 'metadata', 116);

					expect(updateMetadataOnContent({
						content: deref(MEDIA_CONTENT_WITHOUT_METADATA),
						mappings: MAPPINGS,
						md5sum: '1',
						metadata: {
							5: { value: METADATA_VALUE_5_ORIG_FROM_FW },
							25: { value: METADATA_VALUE_25_ORIG_FROM_FW },
							80: { value: METADATA_VALUE_80_ORIG_FROM_FW },
							// 116: { value: METADATA_VALUE_116_ORIG_FROM_FW }
							120: { value: METADATA_VALUE_120_ORIG_FROM_FW }
						},
						// modify: true,
						properties: {
							...deref(PROPERTY_POLICY),
							copyright: PROPERTY_IF_CHANGED,
						}
					})).toStrictEqual(contentWithChangedCopyright);
				});

				test('it handles tags array', () => {
					const contentWithTwoTags: MediaContent = deref(NEW_MEDIA_CONTENT);
					contentWithTwoTags.data.tags = [
						'25 original Tag1 from FotoWare',
						'25 original Tag2 from FotoWare'
					];
					contentWithTwoTags.data.fotoWare!.metadata![25] = [ // eslint-disable-line @typescript-eslint/no-non-null-assertion
						'25 original Tag1 from FotoWare',
						'25 original Tag2 from FotoWare'
					];
					expect(updateMetadataOnContent({
						content: deref(MEDIA_CONTENT_WITHOUT_METADATA),
						mappings: MAPPINGS,
						md5sum: '1',
						metadata: {
							5: { value: METADATA_VALUE_5_ORIG_FROM_FW},
							25: { value: [
								'25 original Tag1 from FotoWare',
								'25 original Tag2 from FotoWare'
							]},
							80: { value: METADATA_VALUE_80_ORIG_FROM_FW },
							116: { value: METADATA_VALUE_116_ORIG_FROM_FW },
							120: { value: METADATA_VALUE_120_ORIG_FROM_FW }
						},
						// modify: true,
						properties: PROPERTY_POLICY
					})).toStrictEqual(contentWithTwoTags);
				});

				test('it handles falsy metadata', () => {
					const contentWithNoMetadata = deref(MEDIA_CONTENT_WITHOUT_METADATA) as unknown as NestedRecord;
					deleteIn(contentWithNoMetadata, 'data', 'artist');
					deleteIn(contentWithNoMetadata, 'data', 'copyright');
					deleteIn(contentWithNoMetadata, 'data', 'tags');
					setIn(contentWithNoMetadata, 'data.fotoWare.md5sum', '1');

					expect(updateMetadataOnContent({
						content: deref(MEDIA_CONTENT_WITHOUT_METADATA),
						mappings: MAPPINGS,
						md5sum: '1',
						metadata: {
							// @ts-ignore
							5: undefined,
						},
						// modify: true,
						properties: PROPERTY_POLICY
					})).toStrictEqual(contentWithNoMetadata);
				});

			}); // updateMetadataOnContent
		}); // xp
	}); // fotoware
}); // lib
