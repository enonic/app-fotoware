import {LicenseDetails} from './LicenseDetails';


export function buildLicensedTo(licenseDetails :LicenseDetails) :string {
	return licenseDetails
		? (
			licenseDetails.expired
				? 'License expired!'
				: `Licensed to ${licenseDetails.issuedTo}`
		)
		: 'Unlicensed!';
}
