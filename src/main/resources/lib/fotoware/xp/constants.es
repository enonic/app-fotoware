import {sanitize} from '/lib/xp/common';

export const REPO_ID = app.name;
export const REPO_BRANCH = 'master';

export const PERMISSIONS = [{
	principal: 'role:system.admin',
	allow: [
		'READ',
		'CREATE',
		'MODIFY',
		'DELETE',
		'PUBLISH',
		'READ_PERMISSIONS',
		'WRITE_PERMISSIONS'
	],
	deny: []
}, {
	principal: 'role:system.everyone',
	allow: [],
	deny: [
		'READ',
		'CREATE',
		'MODIFY',
		'DELETE',
		'PUBLISH',
		'READ_PERMISSIONS',
		'WRITE_PERMISSIONS'
	]
}];

export const CHILD_ORDER = '_ts DESC';

export const PROPERTY_ON_CREATE = 'onCreate';
export const PROPERTY_IF_CHANGED = 'ifChanged';
export const PROPERTY_OVERWRITE = 'overwrite';

export const TASKS_FOLDER_PARENT_PATH = '/';
export const TASKS_FOLDER_NAME = 'tasks';
export const TASKS_FOLDER_PATH = `${TASKS_FOLDER_PARENT_PATH}${TASKS_FOLDER_NAME}`;

export const X_APP_NAME = sanitize(app.name).replace(/\./g, '-');
