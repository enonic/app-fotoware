// @ts-expect-error TS2307: Cannot find module '/lib/license' or its corresponding type declarations.
import {validateLicense} from '/lib/license';


export function get() {
	const licenseDetails = validateLicense({appKey: app.name});
	const licenseValid = !!(licenseDetails && !licenseDetails.expired);
	return {
		body: {
			licenseValid
		},
		contentType: 'application/json;charset=utf-8'
	};
} // get
