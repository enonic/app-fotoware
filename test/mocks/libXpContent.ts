import type {
	Content,
	createMedia,
	delete as deleteContent,
	exists,
	get,
	modify,
	query,
} from '@enonic-types/lib-content';
import type { MediaContent } from '/lib/fotoware';


import { toStr } from '@enonic/js-utils';
import {JavaBridge} from '@enonic/mock-xp';
import { jest } from '@jest/globals';
import { statSync } from 'fs';
import {join} from 'path';


export default function mockLibXpContent() {
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
	connection.create({
		_name: 'content'
	});
	connection.create({
		_name: 'EnonicWare',
		_parentPath: '/content'
	});
	const xpPathToId: Record<string, string> = {};
	jest.mock('/lib/xp/content', () => ({
		// @ts-ignore
		createMedia: jest.fn<typeof createMedia>(({
			name,
			parentPath,
			mimeType,
			focalX = 0.5,
			focalY = 0.5,
			data
		}) => {
			log.info('name', name, 'parentPath', parentPath, 'mimeType', mimeType, 'focalX', focalX, 'focalY', focalY);
			//log.info('data', data); // binary stream
			if (name === 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp') {
				const size = statSync(join(__dirname, 'responses', 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp')).size;
				const mimeType = 'image/webp';
				const createdNode = connection.create({
					_childOrder: 'modifiedtime DESC',
					//_indexConfig // Not important for this test
					_inheritsPermissions: true,
					_name: name,
					_parentPath: `/content${parentPath}`,
					// _permissions // Not important for this test
					_nodeType: 'content',
					attachment: {
						binary: name,
						label: 'source',
						mimeType,
						name: name,
						size,
						sha512: 'sha512'
					},
					creator: 'user:system:cwe',
					createdTime: '2023-05-26T12:40:03.693253Z',
					data: {
						artist: '',
						caption: '',
						copyright: '',
						media: {
							attachment: name,
							focalPoint: {
								x: focalX,
								y: focalY
							}
						},
						tags: ''
					},
					displayName: 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg',
					modifier: 'user:system:cwe',
					modifiedTime: '2023-05-26T12:40:03.693253Z',
					owner: 'user:system:cwe',
					type: 'media:image',
					valid: true,
					x: {
						media: {
							imageInfo: {
								imageHeight: 600,
								imageWidth: 480,
								contentType: mimeType,
								pixelSize: 480*600,
								byteSize: size
							}
						}
					}
				});
				log.info('createdNode:%s', createdNode);
				xpPathToId[`/content${parentPath}/${name}`] = createdNode._id;
				log.info('xpPathToId:%s', xpPathToId);
				return createdNode;
			}
			throw new Error(`Unmocked createMedia params:${toStr({name, parentPath, mimeType, focalX, focalY, data})}`);
		}),
		delete: jest.fn<typeof deleteContent>(({
			key
		}) => {
			const id = xpPathToId[key];
			if (id) {
				delete xpPathToId[key];
			}
			connection.delete(id || key);
			return true; // TODO Hardcode (I'm using Node layer to simulate Content Layer)
		}),
		exists: jest.fn<typeof exists>(({key}) => {
			const id = xpPathToId[key];
			if (id) {
				const existsRes = connection.exists(id);
				log.error('existsRes:%s', existsRes);
				return !!existsRes;
			}
			return false;
		}),
		// @ts-ignore
		get: jest.fn<typeof get>(({
			key,
			versionId
		}) => {
			// log.info('key', key, 'versionId', versionId);
			if (key === '/EnonicWare/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp') {
				const id = xpPathToId[key];
				if (id) {
					return connection.get(id) as unknown as MediaContent;
				}
				return null;
			}
			throw new Error(`Unmocked get params:${toStr({key, versionId})}`);
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
		}),
		// @ts-ignore
		query: jest.fn<typeof query<Content>>((params) => {
			log.debug('/lib/xp/content query(%s)', toStr(params));
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
			// return {
			// 	// aggregations: {},
			// 	count: 0,
			// 	hits: [],
			// 	total: 0,
			// } as unknown as Content;
		})
	}), { virtual: true });
	return {
		connection,
		xpPathToId
	}
}
