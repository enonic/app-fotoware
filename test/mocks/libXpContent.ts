import type {
	Content,
	createMedia as importedCreateMedia,
	delete as deleteContent,
	exists,
	get as importedGet,
	getAttachmentStream as importedGetAttachmentStream,
	modify as importedModify,
	move as importedMove,
	publish as importedPublish,
	query,
} from '@enonic-types/lib-content';


import { toStr } from '@enonic/js-utils';
import { JavaBridge } from '@enonic/mock-xp';
import { jest } from '@jest/globals';


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
		id: 'com.enonic.cms.fotoware'
	});
	javaBridge.repo.createBranch({
		branchId: 'draft',
		repoId: 'com.enonic.cms.fotoware'
	});
	const contentConnection = javaBridge.contentConnect({
		branch: 'draft',
		project: 'fotoware',
	});
	const createdFolder = contentConnection.create({
		contentType: 'base:folder',
		data: {},
		name: 'EnonicWare',
		parentPath: '/',
	});
	contentConnection.publish({
		keys: [createdFolder._id],
		sourceBranch: 'draft', // ignored
		targetBranch: 'master', // ignored
	});

	const mockModify = jest.fn<typeof importedModify>((...params) => contentConnection.modify(...params));


	jest.mock('/lib/xp/content', () => ({
		createMedia: jest.fn<typeof importedCreateMedia>((...params) => contentConnection.createMedia(...params)),
		delete: jest.fn<typeof deleteContent>((...params) => contentConnection.delete(...params)),
		exists: jest.fn<typeof exists>((...params) => contentConnection.exists(...params)),
		get: jest.fn<typeof importedGet>((...params) => contentConnection.get(...params)),
		getAttachmentStream: jest.fn<typeof importedGetAttachmentStream>((...params) => contentConnection.getAttachmentStream(...params)),
		modify: mockModify,
		move: jest.fn<typeof importedMove>((...params) => contentConnection.move(...params)),
		publish: jest.fn<typeof importedPublish>((...params) => contentConnection.publish(...params)),
		// @ts-ignore
		query: jest.fn<typeof query<Content>>((params) => {
			log.warning('query');
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
		contentConnection,
		mockModify,
	}
}
