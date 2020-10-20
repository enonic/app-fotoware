import {validateLicense} from '/lib/license';
import {
	CHILD_ORDER,
	REPO_BRANCH,
	REPO_ID,
	TASKS_FOLDER_PATH
} from '/lib/fotoware/xp/constants';
import {getConfigFromAppCfg} from '/lib/fotoware/xp/getConfigFromAppCfg';
//import {toStr} from '/lib/util';
import {run as runInContext} from '/lib/xp/context';
import {connect} from '/lib/xp/node';
import {assetUrl as getAssetUrl} from '/lib/xp/portal';
import {submitNamed} from '/lib/xp/task';

export function post(request) {
	//log.debug(`request:${toStr(request)}`);
	const assetsUrl = getAssetUrl({path: ''});

	const licenseDetails = validateLicense({appKey: app.name});
	//log.info(`licenseDetails:${toStr(licenseDetails)}`);
	const licenseValid = !!(licenseDetails && !licenseDetails.expired);
	const licensedTo = licenseDetails
		? (
			licenseDetails.expired
				? 'License expired!'
				: `Licensed to ${licenseDetails.issuedTo}`
		)
		: 'Unlicensed!';

	if (!licenseValid) {
		return {
			body: `<!DOCTYPE html>
	<html>
		<head>
			<meta charset="UTF-8">
			<meta http-equiv="X-UA-Compatible" content="IE=Edge">
			<meta name="viewport" content="width=device-width, user-scalable=no">
			<meta name="theme-color" content="#ffffff">

			<title>License ${licensedTo}</title>
			<meta http-equiv="refresh" content="5" />

			<link rel="shortcut icon" href="${assetsUrl}/images/ico/fotoware.ico">
			<link rel="stylesheet" type="text/css" href="${assetsUrl}/admin/common/styles/lib.css">
			<script defer src="${assetsUrl}/admin/common/js/lib.js" type="text/javascript"></script>
		</head>
		<body>
			<h1>License ${licensedTo} Redirecting in 5 seconds...</h1>
		</body>
	</html>`,
			contentType: 'text/html; charset=utf-8'
		};
	}

	const {
		//params,
		params: {
			taskNodeId,
			importName: onlyImportName,
			resume = 'true',
			site,
			stop = 'false'
		}
	} = request;
	//log.debug(`resume:${toStr(resume)}`);
	const boolResume = resume !== 'false';
	const boolStop = stop !== 'false';
	//log.debug(`boolResume:${toStr(boolResume)}`);
	//log.debug(`params:${toStr(params)}`);
	//log.debug(`site:${toStr(site)}`);

	const {sitesConfigs} = getConfigFromAppCfg();
	//log.debug(`sitesConfigs:${toStr(sitesConfigs)}`);

	const sites = site === '_all' ? Object.keys(sitesConfigs) : [site];
	//log.debug(`sites:${toStr(sites)}`);

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
		if(boolStop) {
			if (taskNodeId) {
				suConnection.modify({
					key: taskNodeId,
					editor: (node) => {
						node.data.shouldStop = true;
						return node;
					}
				})
			}
		} else {
			sites.forEach((site) => {
				const {
					clientId,
					clientSecret,
					url,
					imports = {}
				} = sitesConfigs[site];
				//log.debug(`clientId:${toStr(clientId)}`);
				//log.debug(`clientSecret:${toStr(clientSecret)}`);
				//log.debug(`url:${toStr(url)}`);
				const importNames = site === '_all'
					? Object.keys(imports)
					: onlyImportName
						? [onlyImportName]
						: Object.keys(imports);
				//log.debug(`importNames:${toStr(importNames)}`);
				importNames.forEach((importName) => {
					const {
						query,
						rendition,
						project,
						path
					} = sitesConfigs[site].imports[importName];
					//log.debug(`query:${toStr(query)}`);
					//log.debug(`rendition:${toStr(rendition)}`);
					//log.debug(`project:${toStr(project)}`);
					//log.debug(`path:${toStr(path)}`);
					const createdTaskNode = suConnection.create({
						_parentPath: TASKS_FOLDER_PATH,
						_name: `${site}_${importName}`,
						_inheritsPermissions: true,
						_childOrder: CHILD_ORDER,
						data: {
							importName,
							shouldStop: false,
							site
						}
					});
					//log.debug(`createdTaskNode:${toStr(createdTaskNode)}`);
					//const renameTaskNodeRes =
					suConnection.move({
						source: createdTaskNode._id,
						target: `${createdTaskNode._ts}_${createdTaskNode._name}`
					});
					//log.debug(`renameTaskNodeRes:${toStr(renameTaskNodeRes)}`);
					runInContext({
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
							boolResume,
							clientId,
							clientSecret,
							importName,
							path,
							project,
							query,
							rendition,
							site,
							taskNodeId: createdTaskNode._id,
							url
						}
					})); // run in project context
				}); // forEach import
			}); // forEach site
		}
	}); // run in FotoWareRepoContext

	return {
		applyFilters: false,
		postProcess: false,
		redirect: '?'
	};
} // export function post
