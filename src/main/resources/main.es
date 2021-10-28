//import {toStr} from '/lib/util';
import {
	CHILD_ORDER,
	PERMISSIONS,
	REPO_BRANCH,
	REPO_ID,
	TASKS_FOLDER_PARENT_PATH,
	TASKS_FOLDER_NAME,
	TASKS_FOLDER_PATH
} from '/lib/fotoware/xp/constants';
import {run as runInContext} from '/lib/xp/context';
import {connect} from '/lib/xp/node';
import {
	create as createRepo,
	list as listRepos
}  from '/lib/xp/repo';
import {executeFunction} from '/lib/xp/task';

runInContext({
	repository: 'system-repo',
	branch: REPO_BRANCH,
	user: {
		login: 'su',
		idProvider: 'system'
	},
	principals: ['role:system.admin']
}, () => executeFunction({
	description: `Creating repoId:${REPO_ID} branch:${REPO_BRANCH} (if needed)`,
	func: () => {
		const repoList = listRepos();
		//log.debug(`repoList:${toStr(repoList)}`);

		const reposObj = {};
		repoList.forEach(({id, branches}) => {
			reposObj[id] = {branches};
		});
		//log.debug(`reposObj:${toStr(reposObj)}`);

		if (!reposObj[REPO_ID]) {
			//const createRes =
			createRepo({
				id: REPO_ID,
				rootPermissions: PERMISSIONS,
				rootChildOrder: CHILD_ORDER
			});
			//log.debug(`createRes:${toStr(createRes)}`);
		} // if !repo

		const suConnection = connect({
			repoId: REPO_ID,
			branch: REPO_BRANCH
		});

		const boolTaskFolderExists = suConnection.exists(TASKS_FOLDER_PATH);
		//log.debug(`boolTaskFolderExists:${toStr(boolTaskFolderExists)}`);

		if (!boolTaskFolderExists) {
			//const nodeCreateRes =
			suConnection.create({
				_parentPath: TASKS_FOLDER_PARENT_PATH,
				_name: TASKS_FOLDER_NAME,
				_inheritsPermissions: true,
				_childOrder: CHILD_ORDER,
				displayName: 'Tasks'
			});
			//log.debug(`nodeCreateRes:${toStr(nodeCreateRes)}`);
		}
	} // task
}));
