import type { TaskNodeData } from '/lib/fotoware';


import {
	CHILD_ORDER,
	REPO_BRANCH,
	REPO_ID
} from '/lib/fotoware/xp/constants';
import {run as runInContext} from '/lib/xp/context';
import {connect} from '/lib/xp/node';


export function get() {
	const stoppableTasks: Record<string, Record<string,string>> = {};
	runInContext({
		repository: REPO_ID,
		branch: REPO_BRANCH,
		user: {
			login: 'su',
			idProvider: 'system'
		},
		principals: ['role:system.admin']
	}, () => {
		const suConnection = connect({
			repoId: REPO_ID,
			branch: REPO_BRANCH
		});
		const queryParams = {
			start: 0,
			count: -1,
			query: '',
			filters: {
				boolean: {
					must: {
						hasValue: {
							field: 'data.shouldStop',
							values: [
								false
							]
						}
					}
				}
			},
			sort: CHILD_ORDER,
			aggregations: {},
			explain: false
		};
		//log.debug(`queryParams:${toStr(queryParams)}`);
		const queryRes = suConnection.query(queryParams);
		//log.debug(`queryRes:${toStr(queryRes)}`);
		queryRes.hits.forEach(({id}) => {
			const aTaskNode = suConnection.get<TaskNodeData>(id);
			if (!aTaskNode) {
				log.error(`Unable to find task node with id:${id}`);
				throw new Error('Unable to find task node! See server log for node _id')
			}
			const {
				data: {
					importName,
					site
				}
			} = aTaskNode;
			if (!stoppableTasks[site]) {
				stoppableTasks[site] = {}
			}
			(stoppableTasks[site] as Record<string,string>)[importName] = id;
		});
	}); // runInFotoWareRepoContext
	return {
		body: stoppableTasks,
		contentType: 'application/json;charset=utf-8'
	};
} // get
