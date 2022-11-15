import {
	isNumber,
	isString
} from '@enonic/js-utils';


//──────────────────────────────────────────────────────────────────────────────
// Types
//──────────────────────────────────────────────────────────────────────────────
type Nullable<T> = T | null;

type ByteSource = unknown
type ContentMapper = unknown // TODO Record<string,unknown> ?

interface ModifyMediaCommand {
	execute: () => ContentMapper,
	setArtist: (artist: Nullable<string>) => void,
	setCaption: (caption: Nullable<string>) => void,
	setCopyright: (copyright: Nullable<string>) => void,
	setData: (data: ByteSource) => void,
	setFocalX: (focalX: number) => void,
	setFocalY: (focalY: number) => void,
	setKey: (key: string) => void,
	setMimeType: (mimeType: Nullable<string>) => void,
	setName: (name: string) => void,
	setTags: (tags: Nullable<string>) => void,
}

interface UpdateMediaParams {
	// Required
	key: string
	name: string
	// Optional
	artist?: string
	caption?: string
	copyright?: string
	data?: ByteSource
	focalX?: number
	focalY?: number
	mimeType?: string
	tags?: string
}


//──────────────────────────────────────────────────────────────────────────────
// Private functions
//──────────────────────────────────────────────────────────────────────────────
function throwIfMissingRequiredParam<T extends object>(obj: T, name: keyof T): void {
	if (
		obj == null
		|| obj[name] == null
		//|| typeof obj[name] === 'undefined' // Covered by == null
	) {
		throw `Parameter '${String(name)}' is required!`;
	}
}


function throwIfOptionalParamNotNumber<T extends object>(obj: T, name: keyof T): void {
	if (
		obj != null // All params could be optional, so no params could be valid
		&& obj[name] != null // The parameter is not null or undefined
		&& !isNumber(obj[name]) // But is not a number
	) {
		throw `Optional parameter '${String(name)}' is not a number!`;
	}
}

function throwIfOptionalParamNotString<T extends object>(obj: T, name: keyof T): void {
	if (
		obj != null // All params could be optional, so no params could be valid
		&& obj[name] != null // The parameter is not null or undefined
		&& !isString(obj[name])
	) {
		throw `Optional parameter '${String(name)}' is not a string!`;
	}
}

function throwIfRequiredParamMissingOrNotString<T extends object>(obj: T, name: keyof T): void {
	throwIfMissingRequiredParam(obj, name);
	if (
		!isString(obj[name])
	) {
		throw `Required parameter '${String(name)}' is not a string!`;
	}
}

function nullOrValue<T>(value: T): T | null {
	if (value === undefined) {
		return null;
	}
	return value;
}

//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
export function updateMedia(params: UpdateMediaParams) {

	throwIfRequiredParamMissingOrNotString(params, 'key');
	throwIfRequiredParamMissingOrNotString(params, 'name');

	throwIfOptionalParamNotString(params, 'artist');
	throwIfOptionalParamNotString(params, 'caption');
	throwIfOptionalParamNotString(params, 'copyright');
	throwIfOptionalParamNotNumber(params, 'focalX');
	throwIfOptionalParamNotNumber(params, 'focalY');
	throwIfOptionalParamNotString(params, 'mimeType');
	throwIfOptionalParamNotString(params, 'tags');

	// Decontruction is safe for numbers and strings, but not function references.
	// Not certain what happens to java values, like streams (ByteSource)
	// Better to be safe than sorry
	const {
		// Required
		key,
		name,
		// Optional (defaults to null)
		// NOTE: Because of these fallbacks, the nullOrValue's below are probably not needed.
		artist = null,
		caption = null,
		copyright = null,
		mimeType = null,
		tags = null,
		// Optional (no defaults)
		focalX,
		focalY
		//data, // Probably unsafe
	} = params;

	const bean = __.newBean<ModifyMediaCommand>('com.enonic.app.fotoware.ModifyMediaCommand');

	// Required
	bean.setKey(key);
	bean.setName(name);

	// Optional
	// The decontruction fallbacks to null, probably renders nullOrValue unnecessary
	bean.setMimeType(nullOrValue(mimeType));

	if (focalX) {
		bean.setFocalX(focalX);
	}

	if (focalY) {
		bean.setFocalY(focalY);
	}

	bean.setCaption(nullOrValue(caption));
	bean.setArtist(nullOrValue(artist));
	bean.setCopyright(nullOrValue(copyright));
	bean.setTags(nullOrValue(tags));
	bean.setData(nullOrValue(params.data));

	return __.toNativeObject(bean.execute());
}
