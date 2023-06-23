import type { generatePassword } from '@enonic-types/lib-auth';
import { jest } from '@jest/globals';

export default function mockLibXpAuth() {
	jest.mock('/lib/xp/auth', () => ({
		generatePassword: jest.fn<typeof generatePassword>().mockReturnValue('generatedPassword')
	}), { virtual: true });
}
