//import {validateLicense} from '/lib/license';
import {LicenseDetails} from './LicenseDetails';


export function isLicenseValid(
	licenseDetails :LicenseDetails // = validateLicense({appKey: app.name})
) :boolean {
	return !!(licenseDetails && !licenseDetails.expired);
}
