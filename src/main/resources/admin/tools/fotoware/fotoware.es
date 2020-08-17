import {getConfigFromAppCfg} from '/lib/fotoware/xp/getConfigFromAppCfg';
//import {toStr} from '/lib/util';
import {run} from '/lib/xp/context';
import {
	getBaseUri,
	getLauncherPath,
	getLauncherUrl
} from '/lib/xp/admin';
import {assetUrl} from '/lib/xp/portal';
import {submitNamed} from '/lib/xp/task';

const capitalize = (s) => {
	if (typeof s !== 'string') return ''
	return s.charAt(0).toUpperCase() + s.slice(1)
}

export function get(request) {
	//log.debug(`request:${toStr(request)}`);

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
		mainHtml = `<form method="post">
	<input name="site" type="hidden" value="_all"/>
	<input type="submit" style="margin-bottom: 15px;padding: 5px" value="Sync all configured FotoWare sites"/>
</form>
${sitesHtml}

<h2>Example com.enonic.app.fotoware.cfg</h2>
<pre style="background-color: #eee;border-radius: 3px;font-family: courier, monospace;padding: 5px;">
# Required
fotoware.sites.sitename.clientId = ...
fotoware.sites.sitename.clientSecret = ...

# This is automatically generated, but can be overridden:
#fotoware.sites.sitename.url = https://sitename.fotoware.cloud

# These are the defaults, but they can be overridden:
#fotoware.sites.sitename.project = default
#fotoware.sites.sitename.path = FotoWare
#fotoware.sites.sitename.query = fn:*.gif|fn:*.jpg|fn:*.jpeg|fn:*.png|fn:*.svg

# Only allow webhooks from these ips:
#fotoware.sites.sitename.remoteAddresses.'127.0.0.1'
#fotoware.sites.sitename.remoteAddresses.'127.0.0.2'

# You may configure multiple FotoWare sites:
fotoware.sites.anothersitename.clientId = ...
fotoware.sites.anothersitename.clientSecret = ...
fotoware.sites.anothersitename.project = MaybeAnotherProject
fotoware.sites.anothersitename.path = AtLeastADifferentPath

# Or you can sync different queries from the same FotoWare site:

fotoware.sites.sitenameDocuments.clientId = ...
fotoware.sites.sitenameDocuments.clientSecret = ...
# In this example it's important to set url, because sitenameDocuments is not part of the actual url
fotoware.sites.sitenameDocuments.url = https://sitename.fotoware.cloud
fotoware.sites.sitenameDocuments.path = FotoWare Documents
fotoware.sites.sitenameDocuments.path = fn:*.pdf

fotoware.sites.sitenameVideos.clientId = ...
fotoware.sites.sitenameVideos.clientSecret = ...
# In this example it's important to set url, because sitenameVideos is not part of the actual url
fotoware.sites.sitenameVideos.url = https://sitename.fotoware.cloud
fotoware.sites.sitenameVideos.path = FotoWare Videos
fotoware.sites.sitenameVideos.path = fn:*.mov|fn:*.mp4


</pre>`;
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

		<title>FotoWare Admin</title>

		<link rel="shortcut icon" href="${assetsUrl}/images/ico/fotoware.ico">

		<link rel="stylesheet" type="text/css" href="${assetsUrl}/admin/common/styles/lib.css">
		<script defer src="${assetsUrl}/admin/common/js/lib.js" type="text/javascript"></script>
	</head>
	<body>
		<div class="appbar">
			<div class="home-button app-icon system-info-button">
				<img class="app-icon" src="${assetsUrl}/images/svg/fotoware-white.svg" style="height: 15px;margin-top: 15px;width: auto;"/>
				<span class="app-name">FotoWare Admin</span>
			</div>
		</div>
		<main style="padding: 59px 15px 0px 15px">${mainHtml}</main>
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
