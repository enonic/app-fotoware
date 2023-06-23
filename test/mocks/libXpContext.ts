import type { run } from '@enonic-types/lib-context';
import { jest } from '@jest/globals';


export default function mockLibXpContext() {
	jest.mock('/lib/xp/context', () => ({
		run: jest.fn<typeof run>((_context, callback) => callback())
	}), { virtual: true });
}
