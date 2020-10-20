import {
	installLicense,
	validateLicense
} from '/lib/license';
import {toStr} from '/lib/util';
import {readText} from '/lib/xp/io';
import {
	assetUrl as getAssetUrl,
	getMultipartStream
} from '/lib/xp/portal';

export function postUploadLicense(request) {
	log.info(`request:${toStr(request)}`);

	const licenseStream = getMultipartStream('license');
	const licenseStr = readText(licenseStream);

	const licenseDetails = validateLicense({
		appKey: app.name, // Application key. Optional.
		license: licenseStr//, // Encoded license string. Optional.
		//publicKey: // Public key. Optional.
	});
	log.info(`licenseDetails:${toStr(licenseDetails)}`);

	const boolLicenseInstalled = installLicense({
		appKey: app.name, // Application key.
		license: licenseStr//, // Encoded license string.
		//publicKey: // Public key to validate the license. Optional, if not set it will look for it in the current app.
	});
	log.info(`boolLicenseInstalled:${toStr(boolLicenseInstalled)}`);

	const assetsUrl = getAssetUrl({path: ''});

	return {
		body: `<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=Edge">
		<meta name="viewport" content="width=device-width, user-scalable=no">
		<meta name="theme-color" content="#ffffff">

		<title>License ${boolLicenseInstalled ? 'Installed' : 'Invalid!'}</title>
		<meta http-equiv="refresh" content="5;URL='${boolLicenseInstalled ? '.' : './uploadLicense'}'" />

		<link rel="shortcut icon" href="${assetsUrl}/images/ico/fotoware.ico">
		<link rel="stylesheet" type="text/css" href="${assetsUrl}/admin/common/styles/lib.css">
		<script defer src="${assetsUrl}/admin/common/js/lib.js" type="text/javascript"></script>
	</head>
	<body>
		<h1>License ${boolLicenseInstalled ? 'Installed.' : 'Invalid!'} Redirecting in 5 seconds...</h1>
	</body>
</html`
	};
}
