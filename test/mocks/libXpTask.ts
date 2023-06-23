import type { executeFunction } from '@enonic-types/lib-task';
import { jest } from '@jest/globals';


export default function mockLibXpTask({
	taskId = 'taskId',
}: {
	taskId?: string
} = {}) {
	jest.mock('/lib/xp/task', () => ({
		executeFunction: jest.fn<typeof executeFunction>(({
			description: _description,
			func
		}) => (() => {
			func();
			return taskId;
		})())
	}), { virtual: true });
}
