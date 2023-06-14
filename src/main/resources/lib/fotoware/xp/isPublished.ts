import type { ContextParams } from '/lib/xp/context';


import {exists} from '/lib/xp/content';
import {run as runInContext} from '/lib/xp/context';


export const isPublished = ({
	key,
	project,
	context = {
		repository: `com.enonic.cms.${project}`,
		branch: 'master',
		user: {
			login: 'su',
			idProvider: 'system'
		},
		principals: ['role:system.admin']
	}
}: {
	key: string
	project: string
	context?: ContextParams
}) => runInContext(context, () => exists({key})); // export const isPublished
