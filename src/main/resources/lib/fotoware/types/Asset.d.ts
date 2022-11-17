import type {OneOrMore} from '@enonic/js-utils/src/types';


// NOTE: Since I don't know what data could potentially come in the future,
// using OneOrMore is the safest.

export type Metadata = {
	5: { // title used as displayName
		value: OneOrMore<string>
	}
	25: {  // tags
		value: OneOrMore<string>
	}
	80: { // artist
		value: OneOrMore<string>
	}
	116: { // copyright
		value: OneOrMore<string>
	}
	120: {  // description
		value: OneOrMore<string>
	}
}

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
