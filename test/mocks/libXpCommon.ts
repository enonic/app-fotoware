import type { sanitize } from '@enonic-types/lib-common';
import { jest } from '@jest/globals';


export default function mockLibXpCommon() {
	jest.mock('/lib/xp/common', () => ({
		sanitize: jest.fn<typeof sanitize>((text) => text)
	}), { virtual: true });
}
