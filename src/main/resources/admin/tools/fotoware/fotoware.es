import {capitalize} from '/lib/fotoware/xp/capitalize';
import {
	CHILD_ORDER,
	REPO_BRANCH,
	REPO_ID
} from '/lib/fotoware/xp/constants';
import {getConfigFromAppCfg} from '/lib/fotoware/xp/getConfigFromAppCfg';
import {validateLicense} from '/lib/license';
import Router from '/lib/router';
//import {toStr} from '/lib/util';
import {run as runInContext} from '/lib/xp/context';
import {
	getBaseUri,
	getLauncherPath,
	getLauncherUrl
} from '/lib/xp/admin';
import {getResource} from '/lib/xp/io';
import {connect} from '/lib/xp/node';
import {assetUrl} from '/lib/xp/portal';
import {list as listTasks} from '/lib/xp/task';

import {post} from './post';
import {getUploadLicenseForm} from './getUploadLicenseForm';
import {postUploadLicense} from './postUploadLicense';

const {currentTimeMillis} = Java.type('java.lang.System');

const router = Router();

export const all = (r) => router.dispatch(r);

router.post('/', (r) => post(r));
router.get('/uploadLicense', (r) => getUploadLicenseForm(r));
router.post('/uploadLicense', (r) => postUploadLicense(r));

function get(/*request*/) {
	//log.debug(`request:${toStr(request)}`);

	const licenseDetails = validateLicense({appKey: app.name});
	//log.info(`licenseDetails:${toStr(licenseDetails)}`);
	//const licenseValid = !!(licenseDetails && !licenseDetails.expired);
	//log.info(`licenseValid:${toStr(licenseValid)}`);

	const licensedTo = licenseDetails
		? (
			licenseDetails.expired
				? 'License expired!'
				: `Licensed to ${licenseDetails.issuedTo}`
		)
		: 'Unlicensed!';

	const taskList = listTasks({
		name: `${app.name}:syncSite`/*,
		state: 'RUNNING'*/
	});
	//log.debug(`taskList:${toStr(taskList)}`);

	const currentTime = currentTimeMillis();
	const tasksHtml = taskList.map(({
		progress: {
			current,
			info,
			total
		},
		startTime,
		state
	}) => {
		// WARNING Date objects does not work serverside!
		//if (!startTime) { startTime = currentTime;}
		const remainingCount = total - current;
		//const durationMs = currentTime - startTime;
		//const averageMs = current ? durationMs / current : durationMs;
		//const remainingMs = (remainingCount * averageMs);
		//const etaMs = currentTime + remainingMs;
		return `<tr>
	<td class="min">${state}</td>
	<td class="min">${info}</td>
	<!--
		<td class="min ta-r">${current}</td>
		<td class="min ta-r">${total}</td>
	-->
	<td class="min"><script type="text/javascript">
	(function() {
		var scripts= document.getElementsByTagName('script');
		var script= scripts[scripts.length-1];
		var div= document.createElement('div');
		const startTime = (new Date('${startTime}')).getTime();
		const FORMAT = 'YYYY-MM-DD HH:mm:ss';
		div.innerHTML= moment(new Date(startTime)).format(FORMAT);
		script.parentNode.insertBefore(div, script);
	})();</script></td>
	<td class="min"><script type="text/javascript">
	(function() {
		var scripts= document.getElementsByTagName('script');
		var script= scripts[scripts.length-1];
		var div= document.createElement('div');
		const current = ${current};
		const remainingCount = ${remainingCount};
		const currentTime = ${currentTime};
		const startTime = (new Date('${startTime}')).getTime();
		const durationMs = currentTime - startTime;
		const averageMs = current ? durationMs / current : durationMs;
		const remainingMs = (remainingCount * averageMs);
		const etaMs = currentTime + remainingMs;
		const FORMAT = 'YYYY-MM-DD HH:mm:ss';
		div.innerHTML= moment(new Date(etaMs)).format(FORMAT);
		script.parentNode.insertBefore(div, script);
	})();</script></td>
	<td class="min"><script type="text/javascript">
	(function() {
		var scripts= document.getElementsByTagName('script');
		var script= scripts[scripts.length-1];
		var div= document.createElement('div');
		const current = ${current};
		const remainingCount = ${remainingCount};
		const currentTime = ${currentTime};
		const startTime = (new Date('${startTime}')).getTime();
		const durationMs = currentTime - startTime;
		const averageMs = current ? durationMs / current : durationMs;
		const remainingMs = (remainingCount * averageMs);
		div.innerHTML = moment.utc(moment.duration(remainingMs).asMilliseconds()).format("HH:mm:ss");
		script.parentNode.insertBefore(div, script);
	})();</script></td>
	<td><div class="ta-c" style="background-color:lightgray;width:${current/total*100}%">[${current}/${remainingCount}/${total}]</div></td>
</tr>`}).join('\n');

	const stoppableTasks = {};
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
			aggregations: '',
			explain: false
		};
		//log.debug(`queryParams:${toStr(queryParams)}`);
		const queryRes = suConnection.query(queryParams);
		//log.debug(`queryRes:${toStr(queryRes)}`);
		queryRes.hits.forEach(({id}) => {
			const aTaskNode = suConnection.get(id);
			const {
				data: {
					importName,
					site
				}
			} = aTaskNode;
			if (!stoppableTasks[site]) {
				stoppableTasks[site] = {}
			}
			stoppableTasks[site][importName] = id;
		});
	}); // runInFotoWareRepoContext

	const {sitesConfigs} = getConfigFromAppCfg();
	//log.debug(`sitesConfigs:${toStr(sitesConfigs)}`);

	const sitesHtml = Object.keys(sitesConfigs).map((site) =>
		Object.keys(sitesConfigs[site].imports).map((importName) => (stoppableTasks[site] && stoppableTasks[site][importName])
			? `<div><form method="post">
	<input name="stop" type="hidden" value="true"/>
	<input name="taskNodeId" type="hidden" value="${stoppableTasks[site][importName]}"/>
	<input name="site" type="hidden" value="${site}"/>
	<input name="importName" type="hidden" value="${importName}"/>
	<input type="submit" style="margin-bottom: 15px;padding: 5px" value="Stop ${capitalize(site)} ${capitalize(importName)}"/>
</form></div>`
			: `<div>
	<form method="post">
		<input name="resume" type="hidden" value="true"/>
		<input name="site" type="hidden" value="${site}"/>
		<input name="importName" type="hidden" value="${importName}"/>
		<input type="submit" style="margin-bottom: 15px;padding: 5px" value="Refresh ${capitalize(site)} ${capitalize(importName)}"/>
	</form>
	<form method="post">
		<input name="resume" type="hidden" value="false"/>
		<input name="site" type="hidden" value="${site}"/>
		<input name="importName" type="hidden" value="${importName}"/>
		<input type="submit" style="margin-bottom: 15px;padding: 5px" value="Full sync ${capitalize(site)} ${capitalize(importName)}"/>
	</form>
</div>`).join('\n')
	).join('\n');

	let allForm = '';
	if (
		Object.keys(sitesConfigs).length > 1 ||
		(
			Object.keys(sitesConfigs).length === 1 &&
			Object.keys(sitesConfigs[Object.keys(sitesConfigs)[0]].imports).length > 1
		)
	) {
		allForm = Object.keys(stoppableTasks).length ? `<div>
<form method="post">
	<input name="resume" type="hidden" value="true"/>
	<input name="site" type="hidden" value="_all"/>
	<input type="submit" style="margin-bottom: 15px;padding: 5px" value="Refresh all configured FotoWare sites"/>
</form>
<form method="post">
	<input name="resume" type="hidden" value="false"/>
	<input name="site" type="hidden" value="_all"/>
	<input type="submit" style="margin-bottom: 15px;padding: 5px" value="Full sync all configured FotoWare sites"/>
</form>
</div>`: '';
	}
	const mainHtml = `
${allForm}
${sitesHtml}`;

	const assetsUrl = assetUrl({path: ''});
	return {
		body: `<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=Edge">
		<meta name="viewport" content="width=device-width, user-scalable=no">
		<meta name="theme-color" content="#ffffff">
		<meta http-equiv="refresh" content="5"/>

		<title>FotoWare Admin</title>

		<link rel="shortcut icon" href="${assetsUrl}/images/ico/fotoware.ico">

		<link rel="stylesheet" type="text/css" href="${assetsUrl}/admin/common/styles/lib.css">
		<script defer src="${assetsUrl}/admin/common/js/lib.js" type="text/javascript"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.27.0/moment-with-locales.min.js" type="text/javascript"></script>
		<style>
			form {
				display: inline-block;
			}
			td, th {
				border: 1px solid gray;
				padding: 2px;
			}
			th {
				font-weight: bold;
			}
			td.min {
    			width: 1%;
    			white-space: nowrap;
			}
			.ta-r {
				text-align: right;
			}
			.ta-c {
				text-align: center;
			}
			a.app-name {
				color:#eee;
				text-decoration: none;
			}
			a.app-name:hover {
				text-decoration: underline;
			}
		</style>
	</head>
	<body>
		<div class="appbar">
			<div class="home-button app-icon system-info-button">
				<img class="app-icon" src="${assetsUrl}/images/svg/fotoware-white.svg" style="height: 15px;margin-top: 15px;width: auto;"/>
				<span class="app-name">FotoWare Admin</span>
			</div>
			<div class="home-button system-info-button">
				<a class="app-name" href="fotoware/uploadLicense">${licensedTo}</a>
			</div>
		</div>
		<main style="padding: 59px 15px 0px 15px">${mainHtml}
			<h2>Tasks</h2>
			<table style="width:100%">
				<thead>
					<tr>
						<th>State</th>
						<th>Info</th>
						<!--th>Current</th>
						<th>Total</th-->
						<th>StartTime</th>
						<th>Eta</th>
						<th>Remaining</th>
						<th>Progress</th>
					</tr>
				</thead>
				<tbody>${tasksHtml}</tbody>
			</table>
			<h2>Documentation</h2>
			Read the <a href="fotoware/doc/">documentation</a>.
		</main>
		<script type="text/javascript">
			var CONFIG = {
				//adminUrl: '${getBaseUri()}',
				//appId: '${app.name}',
				launcherUrl: '${getLauncherUrl()}',
				services: {}, // Workaround for i18nUrl BUG
				xpVersion: '7.1.3'
			};
		</script>
		<script defer type="text/javascript" src="${getLauncherPath()}"></script>
	</body>
</html>`,
		contentType: 'text/html; charset=utf-8'
	}; // return
} // function get

router.get('/', (r) => get(r));

router.get('/doc', () => ({
	body: getResource(resolve('./doc.html')).getStream(),
	contentType: 'text/html; charset=utf-8'
}));
