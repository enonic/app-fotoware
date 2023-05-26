// NOTE: Since I don't know what data could potentially come in the future,
// using OneOrMore is the safest.

export type Metadata = Record<PropertyKey, {
	value: string|string[]
}>
// export type Metadata = {
// 	5?: { // title used as displayName
// 		value: string|string[]
// 	}
// 	25?: {  // tags
// 		value: string|string[]
// 	}
// 	80?: { // artist
// 		value: string|string[]
// 	}
// 	116?: { // copyright
// 		value: string|string[]
// 	}
// 	120?: {  // description
// 		value: string|string[]
// 	}
// }

export type RenditionUrl = string
export type Rendition = {
	display_name: string
	href: RenditionUrl
}

export type Asset = {
	filename: string
	metadata: Metadata
	renditions: Rendition[]
}

export interface AssetModified {
	data: {
		asset: {
			filename :string
		}
	}
	href :string
	'previous-name' :string
}
