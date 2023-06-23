import { jest } from '@jest/globals';


export default function mockLibTextEncoding({
	md5sum = 'md5sum'
}: {
	md5sum?: string
} = {}) {
	jest.mock('/lib/text-encoding', () => ({
		md5: jest.fn().mockReturnValue(md5sum)
	}), { virtual: true });
}
