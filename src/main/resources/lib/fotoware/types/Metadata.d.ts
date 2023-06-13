export interface FieldDescriptionField {
	'data-type':
		| 'boolean'
		| 'date'
		| 'integer'
		| 'real'
		| 'text'
	id: number
	label: string
	'max-size': number
	'multi-instance': boolean
	multiline: boolean
	taxonomyHref?: string
	validation?: { // Not documented! :(
		max?: number
		min?: number
		regexp?: string
	}
}

export interface FieldDescription {
	field: FieldDescriptionField
	isWritable: boolean
	required: boolean
	'taxonomy-only': boolean
}

export interface RegionDescription {
	name: string
	fields: FieldDescription[]
}

export interface BuiltinFields {
	description: FieldDescription
	notes: FieldDescription
	rating: FieldDescription
	status: FieldDescription
	tags: FieldDescription
	title: FieldDescription
}

type BuiltinFieldsKeys = keyof BuiltinFields;

export interface ThumbnailFields {
	label: FieldDescription
	firstLine: FieldDescription
	secondLine: FieldDescription
	additionalFields: FieldDescription[]
}

type ThumbnailFieldsKeys = keyof ThumbnailFields;

// https://learn.fotoware.com/Integrations_and_APIs/001_The_FotoWare_API/FotoWare_API_Overview/Metadata_Views
export interface MetadataView {
	builtinFields: BuiltinFields
	detailRegions: RegionDescription[]
	href: string
	id: string
	name: string
	thumbnailFields: ThumbnailFields
}
