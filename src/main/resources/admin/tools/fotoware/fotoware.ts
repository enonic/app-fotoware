import type {Request} from '/lib/xp/Request';


// import {toStr} from '@enonic/js-utils';
import endsWith from '@enonic/js-utils/string/endsWith'
import {requestHandler} from '/lib/enonic/static';
// @ts-expect-error TS2307: Cannot find module '/lib/license' or its corresponding type declarations.
import {validateLicense} from '/lib/license';
// @ts-expect-error TS2307: Cannot find module '/lib/router' or its corresponding type declarations.
import Router from '/lib/router';
import {
	getBaseUri,
	getLauncherPath,
	getLauncherUrl
} from '/lib/xp/admin';
import {
	getResource,
	readText
} from '/lib/xp/io';
import {serviceUrl as getServiceUrl} from '/lib/xp/portal';

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

export const all = (r: Request) => router.dispatch(r);

router.post('/', (r: Request) => post(r));
router.post('', (r: Request) => post(r));

router.get('/uploadLicense', (/*r: Request*/) => getUploadLicenseForm(/*r*/));
router.post('/uploadLicense', (r: Request) => postUploadLicense(r));

const getAsset = (request: Request) => requestHandler(
	request,
	{
		//cacheControl: 'public, max-age=31536000, immutable', // This is the default
		//cacheControl: 'public, no-transform, max-age=31536000',
		//cacheControl: false,
		//cacheControl: 'must-revalidate', // 304
		contentType: ({
			path,
			// resource
		}) => {
			if (!path) { return 'octet/stream'; }
			if (endsWith(path, '.js'   )) { return 'application/javascript'; }
			if (endsWith(path, '.css'  )) { return 'text/css'; }
			if (endsWith(path, '.ico'  )) { return 'image/x-icon'; }
			if (endsWith(path, '.woff2')) { return 'font/woff2'; }
			if (endsWith(path, '.woff' )) { return 'font/woff'; }
			if (endsWith(path, '.ttf'  )) { return 'font/ttf'; }
			if (endsWith(path, '.eot'  )) { return 'application/vnd.ms-fontobject'; }
			if (endsWith(path, '.svg'  )) { return 'image/svg+xml'; }
			return 'octet/stream';
		},
		/*getCleanPath: (request) => {
			//log.debug(`request:${toStr(request)}`);
			if (!request.rawPath.startsWith('/admin/tool/com.enonic.app.fotoware/fotoware/')) {
				log.error(`request.rawPath:${toStr(request.rawPath)}`);
				throw new Error('Ooops');
			}
			return request.rawPath.substring('/admin/tool/com.enonic.app.fotoware/fotoware/'.length);
		},*/
		//throwErrors: true
		root: 'assets',
	}
);
router.get('/admin/{path:.+}', (r: Request) => getAsset(r));
router.get('/fonts/{path:.+}', (r: Request) => getAsset(r));
router.get('/images/{path:.+}', (r: Request) => getAsset(r));
router.get('/js/{path:.+}', (r: Request) => getAsset(r));

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

	return {
		body: `<!DOCTYPE html>
<html>
	<head>
		<title>FotoWare Admin</title>

		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=Edge">
		<meta name="viewport" content="width=device-width, user-scalable=no">
		<meta name="theme-color" content="#ffffff">

		<script type="text/javascript" src="fotoware/js/react/react.${REACT_MODE}.js"></script>
		<script type="text/javascript" src="fotoware/js/react-dom/react-dom.${REACT_MODE}.js"></script>
		<script type="text/javascript" src="fotoware/js/@material-ui/material-ui.${REACT_MODE}.js"></script>
		<script type="text/javascript" src="fotoware/js/@babel/standalone/babel.min.js"></script>
		<link rel="stylesheet" href="fotoware/fonts/fonts.css" />
		<link rel="shortcut icon" href="fotoware/images/ico/fotoware.ico">
		<link rel="stylesheet" type="text/css" href="fotoware/admin/common/styles/lib.css">
		<script defer src="fotoware/admin/common/js/lib.js" type="text/javascript"></script>
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

router.get('/', (/*r: Request*/) => get(/*r*/));

router.get('/doc', () => ({
	body: getResource(resolve('./doc.html')).getStream(),
	contentType: 'text/html; charset=utf-8'
}));

router.get('', (/*r: Request*/) => get(/*r*/));
