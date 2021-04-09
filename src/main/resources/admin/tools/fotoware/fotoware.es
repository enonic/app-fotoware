import {buildGetter} from '/lib/enonic/static';
import {validateLicense} from '/lib/license';
import Router from '/lib/router';
//import {toStr} from '/lib/util';
import {
	getBaseUri,
	getLauncherPath,
	getLauncherUrl
} from '/lib/xp/admin';
import {
	getResource,
	readText
} from '/lib/xp/io';
import {
	assetUrl,
	serviceUrl as getServiceUrl
} from '/lib/xp/portal';

import {post} from './post';
import {getUploadLicenseForm} from './getUploadLicenseForm';
import {postUploadLicense} from './postUploadLicense';

/*
react-dom/react-dom.production.min.js
react-dom/react-dom.profiling.min.js
react-dom/react-dom.development.js
react/react.production.min.js
react/react.development.js
react/react.profiling.min.js
*/
//const REACT_MODE = 'production.min';
const REACT_MODE = 'development';

const router = Router();

export const all = (r) => router.dispatch(r);

router.post('/', (r) => post(r));
router.get('/uploadLicense', (r) => getUploadLicenseForm(r));
router.post('/uploadLicense', (r) => postUploadLicense(r));

const getAsset = buildGetter('assets', {
	//cacheControl: 'public, max-age=31536000, immutable', // This is the default
	//cacheControl: 'public, no-transform, max-age=31536000',
	//cacheControl: false,
	//cacheControl: 'must-revalidate', // 304
	contentType: {
		css: 'text/css',
		ico: 'image/x-icon',
		js: 'application/javascript',
		svg: 'image/svg+xml',

		woff: 'font/woff',
		//woff: 'application/font-woff',
		//woff: 'application/octet-stream',

		woff2: 'font/woff2'
		//woff2: 'application/octet-stream'
	},
	//etag: false,
	etag: true//,
	/*getCleanPath: (request) => {
		//log.debug(`request:${toStr(request)}`);
		if (!request.rawPath.startsWith('/admin/tool/com.enonic.app.fotoware/fotoware/')) {
			log.error(`request.rawPath:${toStr(request.rawPath)}`);
			throw Error('Ooops');
		}
		return request.rawPath.substring('/admin/tool/com.enonic.app.fotoware/fotoware/'.length);
	},*/
	//throwErrors: true
});
router.get('/admin/{path:.+}', (r) => getAsset(r));
router.get('/fonts/{path:.+}', (r) => getAsset(r));
router.get('/images/{path:.+}', (r) => getAsset(r));
router.get('/js/{path:.+}', (r) => getAsset(r));

function get(/*request*/) {
	//log.debug(`request:${toStr(request)}`);

	const licenseDetails = validateLicense({appKey: app.name});
	//log.info(`licenseDetails:${toStr(licenseDetails)}`);

	const licensedTo = licenseDetails
		? (
			licenseDetails.expired
				? 'License expired!'
				: `Licensed to ${licenseDetails.issuedTo}`
		)
		: 'Unlicensed!';



	const assetsUrl = assetUrl({path: ''});
	return {
		body: `<!DOCTYPE html>
<html>
	<head>
		<title>FotoWare Admin</title>

		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=Edge">
		<meta name="viewport" content="width=device-width, user-scalable=no">
		<meta name="theme-color" content="#ffffff">

		<!--script type="text/javascript" src="${assetUrl({path: `js/react/react.${REACT_MODE}.js`})}"></script-->
		<script type="text/javascript" src="fotoware/js/react/react.${REACT_MODE}.js"></script>

		<!--script type="text/javascript" src="${assetUrl({path: `js/react-dom/react-dom.${REACT_MODE}.js`})}"></script-->
		<script type="text/javascript" src="fotoware/js/react-dom/react-dom.${REACT_MODE}.js"></script>

		<!--script type="text/javascript" src="${assetUrl({path: `js/@material-ui/material-ui.${REACT_MODE}.js`})}"></script-->
		<script type="text/javascript" src="fotoware/js/@material-ui/material-ui.${REACT_MODE}.js"></script>

		<!--script type="text/javascript" src="${assetUrl({path: 'js/@babel/standalone/babel.min.js'})}"></script-->
		<script type="text/javascript" src="fotoware/js/@babel/standalone/babel.min.js"></script>

		<!--link rel="stylesheet" href="${assetUrl({path: 'fonts/fonts.css'})}" /-->
		<link rel="stylesheet" href="fotoware/fonts/fonts.css" />

		<!--link rel="shortcut icon" href="${assetsUrl}/images/ico/fotoware.ico"-->
		<link rel="shortcut icon" href="fotoware/images/ico/fotoware.ico">

		<!--link rel="stylesheet" type="text/css" href="${assetsUrl}/admin/common/styles/lib.css"-->
		<link rel="stylesheet" type="text/css" href="fotoware/admin/common/styles/lib.css">

		<!--script defer src="${assetsUrl}/admin/common/js/lib.js" type="text/javascript"></script-->
		<script defer src="fotoware/admin/common/js/lib.js" type="text/javascript"></script>

		<!--script type="text/javascript" src="${assetUrl({path: 'js/moment/moment-with-locales.min.js'})}"></script-->
		<script type="text/javascript" src="fotoware/js/moment/moment-with-locales.min.js"></script>

		<style>
			form {
				display: inline-block;
			}
			h2 {
				margin-top: 15px;
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
				<!--img class="app-icon" src="${assetsUrl}/images/svg/fotoware-white.svg" style="height: 15px;margin-top: 15px;width: auto;"/-->
				<img class="app-icon" src="fotoware/images/svg/fotoware-white.svg" style="height: 15px;margin-top: 15px;width: auto;"/>
				<span class="app-name">FotoWare Admin</span>
			</div>
			<div class="home-button system-info-button">
				<a class="app-name" href="fotoware/uploadLicense">${licensedTo}</a>
			</div>
		</div>
		<main style="padding: 59px 15px 0px 15px">
			<div id="root"></div>
		</main>

		<script type="text/babel">
			const baseServicesUrl = "${getServiceUrl({service: '/'})}";
			${readText(getResource(resolve('./app.babel')).getStream())}
		</script>

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
