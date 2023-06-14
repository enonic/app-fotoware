import type {
	BuiltinFieldsKeys,
	FieldDescription,
	FieldDescriptionField,
	HttpClient,
	MetadataView,
	ThumbnailFieldsKeys
} from '/lib/fotoware';


import {
	forceArray,
	toStr
} from '@enonic/js-utils';
//import * as deepEqual from 'fast-deep-equal';
import deepEqual from 'fast-deep-equal';
// @ts-expect-error TS2307: Cannot find module '/lib/http-client' or its corresponding type declarations.
import {request} from '/lib/http-client';


export const getMetadataView = ({
	accessToken,
	fields, // gets modified
	hostname,
	shortAbsolutePath
}: {
	accessToken?: string
	fields: Record<string, Omit<FieldDescriptionField, 'id'>>
	hostname: string
	shortAbsolutePath: string
}) => {
	const metadataViewRequestParams: HttpClient.Request = {
		contentType: 'application/json',
		followRedirects: true, // Documentation is on unclear on the default https://developer.enonic.com/docs/http-client-library/master#requestoptions
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
	//log.debug(`metadataViewRequestParams:${toStr(metadataViewRequestParams)}`);
	const metadataViewResponse = request(metadataViewRequestParams);
	//log.debug(`metadataViewResponse:${toStr(metadataViewResponse)}`);

	let metadataViewResponseBodyObj: MetadataView;
	try {
		metadataViewResponseBodyObj = JSON.parse(metadataViewResponse.body);
	} catch (e) {
		throw new Error(`Something went wrong when trying to JSON parse the response body! metadataViewListResponse:${toStr(metadataViewResponse)}`);
	}
	//log.debug(`metadataViewResponseBodyObj:${toStr(metadataViewResponseBodyObj)}`);

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
	//log.debug(`rest:${toStr(rest)}`);

	//const fields = {};

	//log.debug(`builtinFields:${toStr(builtinFields)}`);
	Object.keys(builtinFields).forEach((k) => {
		//log.debug(`k:${toStr(k)}`);
		//log.debug(`builtinFields[${k}]:${toStr(builtinFields[k])}`);
		const {
			id: fieldId,
			...fieldRest
		} = builtinFields[k as BuiltinFieldsKeys].field;
		if (fields[fieldId]) {
			if (!deepEqual(fields[fieldId], fieldRest)) {
				throw new Error(`1 fieldId:${fieldId} fieldRest:${toStr(fieldRest)} already in fields:${toStr(fields)}`);
			}
		} else {
			fields[fieldId] = fieldRest; // eslint-disable-line no-param-reassign
		}
	});

	type FieldDescriptionWithoutId = Omit<FieldDescription,'field'> & {
		field: Omit<FieldDescriptionField, 'id'>
	}
	type FieldDescriptionObj = Record<number, FieldDescriptionWithoutId>;
	type DetailRegionsObj = Record<string, FieldDescriptionObj>;
	const detailRegionsObj: DetailRegionsObj = {};
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
			(detailRegionsObj[detailRegionName] as FieldDescriptionObj)[fieldId] = {
				field: {
					...fieldRest
				},
				...fieldOuterRest
			};
		});
	});

	//log.debug(`thumbnailFields:${toStr(thumbnailFields)}`);
	/*[
		'secondLine', // single
		'additionalFields', // array
		'firstLine', // single
		'label' // no field
	]*/
	Object.keys(thumbnailFields).forEach((k) => {
		const aThumbnailFieldsArray = forceArray(thumbnailFields[k as ThumbnailFieldsKeys]);
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
	//log.debug(`fields:${toStr(fields)}`);

	const getMetadataViewReturnValue = {
		id,
		name,
		fields,
		builtinFields,
		detailRegions: detailRegionsObj,
		thumbnailFields
	};
	//log.debug(`getMetadataViewReturnValue:${toStr(getMetadataViewReturnValue)}`);

	return getMetadataViewReturnValue;
}; // getMetadataView
