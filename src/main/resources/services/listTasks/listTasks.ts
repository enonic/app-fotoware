import {list as listTasks} from '/lib/xp/task';

export const get = ({
	params: {
		name = 'syncSite',
		state// = undefined
	}
}) => ({
	body: listTasks({
		name: `${app.name}:${name}`,
		state
	}),
	contentType: 'application/json;charset=utf-8'
});
