import deepEqual from 'fast-deep-equal';

import {request} from '/lib/http-client';
import {toStr} from '/lib/util';
import {forceArray} from '/lib/util/data';

export const getMetadataView = ({
	accessToken,
	fields, // gets modified
	hostname,
	shortAbsolutePath
}) => {
	const metadataViewRequestParams = {
		contentType: 'application/json',
		/*headers: {
			'Accept-Language': 'nb, no, en-US, en pt-BR' // Localization
		},*/
		method: 'GET',
		url: `${hostname}${shortAbsolutePath}`
	};
	if (accessToken) {
		metadataViewRequestParams.params = {
			access_token: accessToken
		};
	}
	//log.info(`metadataViewRequestParams:${toStr(metadataViewRequestParams)}`);
	const metadataViewResponse = request(metadataViewRequestParams);
	//log.info(`metadataViewResponse:${toStr(metadataViewResponse)}`);

	let metadataViewResponseBodyObj;
	try {
		metadataViewResponseBodyObj = JSON.parse(metadataViewResponse.body);
	} catch (e) {
		throw new Error(`Something went wrong when trying to JSON parse the response body! metadataViewListResponse:${toStr(metadataViewResponse)}`);
	}
	//log.info(`metadataViewResponseBodyObj:${toStr(metadataViewResponseBodyObj)}`);

	const {
		id,
		//href,
		name,
		builtinFields,
		detailRegions, // Contains descriptions of all metadata fields (WARNING NO this turns out not to be true)
		thumbnailFields//,
		//preserveModificationTime,
		//...rest
	} = metadataViewResponseBodyObj;
	//log.info(`rest:${toStr(rest)}`);

	//const fields = {};

	//log.info(`builtinFields:${toStr(builtinFields)}`);
	Object.keys(builtinFields).forEach((k) => {
		//log.info(`k:${toStr(k)}`);
		//log.info(`builtinFields[${k}]:${toStr(builtinFields[k])}`);
		const {
			id: fieldId,
			...fieldRest
		} = builtinFields[k].field;
		if (fields[fieldId]) {
			if (!deepEqual(fields[fieldId], fieldRest)) {
				throw new Error(`1 fieldId:${fieldId} fieldRest:${toStr(fieldRest)} already in fields:${toStr(fields)}`);
			}
		} else {
			fields[fieldId] = fieldRest; // eslint-disable-line no-param-reassign
		}
	});

	const detailRegionsObj = {};
	detailRegions.forEach(({
		name: detailRegionName,
		fields: detailRegionFields
	}) => {
		detailRegionsObj[detailRegionName] = {};
		detailRegionFields.forEach(({
			//'taxonomy-only',
			//isWritable,
			//required,
			field: {
				//label,
				//'multi-instance',
				//'max-size',
				//multiline,
				//'data-type',
				//validation,
				id: fieldId,
				//taxonomyHref,
				...fieldRest
			},
			...fieldOuterRest
		}) => {
			if (fields[fieldId]) {
				if (!deepEqual(fields[fieldId], fieldRest)) {
					throw new Error(`2 fieldId:${fieldId} fieldRest:${toStr(fieldRest)} already in fields:${toStr(fields)}`);
				}
			} else {
				fields[fieldId] = fieldRest; // eslint-disable-line no-param-reassign
			}
			detailRegionsObj[detailRegionName][fieldId] = {
				field: {
					...fieldRest
				},
				...fieldOuterRest
			};
		});
	});

	//log.info(`thumbnailFields:${toStr(thumbnailFields)}`);
	/*[
		'secondLine', // single
		'additionalFields', // array
		'firstLine', // single
		'label' // no field
	]*/
	Object.keys(thumbnailFields).forEach((k) => {
		const aThumbnailFieldsArray = forceArray(thumbnailFields[k]);
		aThumbnailFieldsArray.forEach(({field}) => {
			if (field) {
				const {
					id: fieldId,
					...fieldRest
				} = field;
				if (fields[fieldId]) {
					if (!deepEqual(fields[fieldId], fieldRest)) {
						throw new Error(`3 fieldId:${fieldId} fieldRest:${toStr(fieldRest)} already in fields:${toStr(fields)}`);
					}
				} else {
					fields[fieldId] = fieldRest; // eslint-disable-line no-param-reassign
				}
			}
		}); // aThumbnailFieldsArray.forEach
	});
	//log.info(`fields:${toStr(fields)}`);

	const getMetadataViewReturnValue = {
		id,
		name,
		fields,
		builtinFields,
		detailRegions: detailRegionsObj,
		thumbnailFields
	};
	//log.info(`getMetadataViewReturnValue:${toStr(getMetadataViewReturnValue)}`);

	return getMetadataViewReturnValue;
}; // getMetadataView
