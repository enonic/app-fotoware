//import {toStr} from '/lib/util';
import {REPO_ID} from '/lib/fotoware/xp/constants';
import {run as runInContext} from '/lib/xp/context';
import {
	create as createRepo,
	list as listRepos
}  from '/lib/xp/repo';
import {submit} from '/lib/xp/task';

runInContext({
	repository: 'system-repo',
	branch: 'master',
	user: {
		login: 'su', // So Livetrace Tasks reports correct user
		idProvider: 'system'
	},
	principals: ['role:system.admin']
}, () => submit({
	description: `Creating repoId:${REPO_ID} branch:master (if needed)`,
	task: () => {
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
				rootPermissions: [{
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
				}]
			});
			//log.debug(`createRes:${toStr(createRes)}`);
		} // if !repo
	} // task
}));
