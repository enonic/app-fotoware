import type {
	getMimeType as importedGetMimeType,
	readText
} from '@enonic-types/lib-io';


import { jest } from '@jest/globals';


export default function mockLibXpIo() {
	jest.mock('/lib/xp/io', () => ({
		getMimeType: jest.fn<typeof importedGetMimeType>((path) => {
			// log.debug('getMimeType path:%s', path);
			if (path === 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp') {
				return 'image/webp';
			}
			if (path === 'fileNameNew.webp') {
				return 'image/webp';
			}
			throw new Error('getMimeType mock not implemented for path: ' + path);
		}),
		readText: jest.fn<typeof readText>((stream) => {
			return stream.toString();
		})
	}), { virtual: true });
}
