import {getConfigFromAppCfg} from '/lib/fotoware/xp/getConfigFromAppCfg';
//import {toStr} from '/lib/util';
import {run} from '/lib/xp/context';
import {
	getBaseUri,
	getLauncherPath,
	getLauncherUrl
} from '/lib/xp/admin';
import {assetUrl} from '/lib/xp/portal';
import {
	list as listTasks,
	submitNamed
} from '/lib/xp/task';

const capitalize = (s) => {
	if (typeof s !== 'string') return ''
	return s.charAt(0).toUpperCase() + s.slice(1)
}

export function get(request) {
	//log.debug(`request:${toStr(request)}`);

	const taskList = listTasks({
		name: `${app.name}:syncSite`/*,
		state: 'RUNNING'*/
	});
	//log.debug(`taskList:${toStr(taskList)}`);

	const tasksHtml = taskList.map(({
		progress: {
			current,
			info,
			total
		},
		startTime,
		state
	}) => `<tr>
	<td class="min">${state}</td>
	<td class="min">${info}</td>
	<!--td class="min ta-r">${current}</td>
	<td class="min ta-r">${total}</td-->
	<td class="min">${startTime}</td>
	<td><div class="ta-c" style="background-color:lightgray;width:${current/total*100}%">[${current}/${total}]</div></td>
</tr>`).join('\n');

	const {
		//params,
		params: {
			site
		}
	} = request;
	//log.debug(`params:${toStr(params)}`);
	//log.debug(`site:${toStr(site)}`);

	let mainHtml = '';

	const sitesConfigs = getConfigFromAppCfg();

	const sitesHtml = Object.keys(sitesConfigs).map((site) => `<form method="post">
<input name="site" type="hidden" value="${site}"/>
<input type="submit" style="margin-bottom: 15px;padding: 5px" value="Sync ${capitalize(site)}"/>
</form>`);

	if (site) {
		mainHtml = `<h1>Sync started</h1>
<form>
	<input type="submit" style="margin-bottom: 15px;margin-top: 15px;padding: 5px" value="Go back to FotoWare admin"/>
</form>`
	} else {
		const allForm = Object.keys(sitesConfigs).length > 1 ? `<form method="post">
	<input name="site" type="hidden" value="_all"/>
	<input type="submit" style="margin-bottom: 15px;padding: 5px" value="Sync all configured FotoWare sites"/>
</form>` : '';
		mainHtml = `
${allForm}
${sitesHtml}`;
	}

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
		<style>
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
		</style>
	</head>
	<body>
		<div class="appbar">
			<div class="home-button app-icon system-info-button">
				<img class="app-icon" src="${assetsUrl}/images/svg/fotoware-white.svg" style="height: 15px;margin-top: 15px;width: auto;"/>
				<span class="app-name">FotoWare Admin</span>
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
						<th>Progress</th>
					</tr>
				</thead>
				<tbody>${tasksHtml}</tbody>
			</table>
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

export function post(request) {
	//log.debug(`request:${toStr(request)}`);

	const {
		//params,
		params: {
			site
		}
	} = request;
	//log.debug(`params:${toStr(params)}`);
	//log.debug(`site:${toStr(site)}`);

	const sitesConfigs = getConfigFromAppCfg();
	//log.debug(`sitesConfigs:${toStr(sitesConfigs)}`);

	const sites = site === '_all' ? Object.keys(sitesConfigs) : [site];

	sites.forEach((site) => {
		const {
			blacklistedCollections,
			clientId,
			clientSecret,
			path,
			project,
			query,
			//remoteAddresses,
			rendition,
			url,
			whitelistedCollections
		} = sitesConfigs[site];
		run({
			repository: `com.enonic.cms.${project}`,
			branch: 'draft',
			user: {
				login: 'su', // So Livetrace Tasks reports correct user
				idProvider: 'system'
			},
			principals: ['role:system.admin']
		}, () => submitNamed({
			name: 'syncSite',
			config: {
				blacklistedCollectionsJson: JSON.stringify(blacklistedCollections),
				clientId,
				clientSecret,
				path,
				project,
				query,
				//remoteAddressesJson: JSON.stringify(remoteAddresses),
				rendition,
				site,
				url,
				whitelistedCollectionsJson: JSON.stringify(whitelistedCollections)
			}
		})); // run
	}); // foreach

	return {
		applyFilters: false,
		postProcess: false,
		redirect: `?site=${site}`
	};
} // function post
