import { jest } from '@jest/globals';


export default function mockLibLicense({
	expired = false
}: {
	expired?: boolean
} = {}) {
	jest.doMock('/lib/license', () => ({
		validateLicense: jest.fn().mockReturnValue({
			expired,
			issuedTo: 'issuedTo'
		})
	}), { virtual: true });
}
