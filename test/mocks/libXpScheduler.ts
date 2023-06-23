import { toStr } from '@enonic/js-utils';
import type { ScheduledJob, create } from '@enonic-types/lib-scheduler';
import { jest } from '@jest/globals';


export default function mockLibXpScheduler<
	TaskConfig extends Record<string, unknown> = Record<string, unknown>
>() {
	jest.mock('/lib/xp/scheduler', () => ({
		create: jest.fn<typeof create<TaskConfig>>((params) => {
			log.debug('/lib/xp/scheduler create params:%s', toStr(params));
			return {} as ScheduledJob<TaskConfig>;
		})
	}), { virtual: true });
}
