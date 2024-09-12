import { jest } from '@jest/globals';


export default function mockLibGalimatias({
	host = 'enonic.fotoware.cloud'
} :{
	host?: string
} = {}) {
	jest.mock('/lib/galimatias', () => ({
		// @ts-expect-error typeerror
		URL: jest.fn().mockImplementation((_url: string) => ({
			getHost: jest.fn().mockReturnValue(host)
		}))
	}), { virtual: true });
}
