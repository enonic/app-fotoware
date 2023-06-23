import type { readText } from '@enonic-types/lib-io';
import type { ReadStream } from 'fs';


import { jest } from '@jest/globals';


export default function mockLibXpIo() {
	jest.mock('/lib/xp/io', () => ({
		readText: jest.fn<typeof readText>((stream) => {
			const readerStream = stream as unknown as ReadStream;
			readerStream.setEncoding('utf8');
			let data = '';
			readerStream.on('data', function(chunk){
				data += chunk;
				// console.log('data event: ' + data);
			});
			return data;
		})
	}), { virtual: true });
}
