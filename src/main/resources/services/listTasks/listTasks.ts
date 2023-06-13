import type {Request} from '/lib/fotoware';
import type {TaskStateType} from '/lib/xp/task';


import {list as listTasks} from '/lib/xp/task';


export const get = ({
	params: {
		name = 'syncSite',
		state// = undefined
	}
}: Request<{
	name?: string
	state?: TaskStateType
}>) => ({
	body: listTasks({
		name: `${app.name}:${name}`,
		state
	}),
	contentType: 'application/json;charset=utf-8'
});
