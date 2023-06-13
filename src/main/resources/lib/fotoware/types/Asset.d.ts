import type { Paging } from './Paging';


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

// https://learn.fotoware.com/Integrations_and_APIs/001_The_FotoWare_API/FotoWare_API_Overview/Document_Types
export type DocumentType = 'Image' | 'Movie' | 'Audio' | 'Document' | 'Graphic' | 'Generic'

// https://learn.fotoware.com/Integrations_and_APIs/001_The_FotoWare_API/FotoWare_API_Overview/Preview_Lists_representation
export interface Preview {
	height: number
	href: string
	size: number
	square: boolean
	width: number
}

// https://learn.fotoware.com/Integrations_and_APIs/001_The_FotoWare_API/FotoWare_API_Overview/Extracting_Quick_Renditions_using_the_API
export interface QuickRendition {
	height: number
	href: string
	name: string
	size: number
	square: boolean
	width: number
}

// https://learn.fotoware.com/Integrations_and_APIs/001_The_FotoWare_API/FotoWare_API_Overview/Asset_representation
export type Asset = {
	ancestors: {
		// TODO
	}
	archiveHREF: string
	attributes: {
		documentattributes?: {
			// TODO
		}
		imageattributes?: {
			// TODO
		}
		photoAttributes?: {
			// TODO
		}
		videoattributes?: {
			// TODO
		}
	}
	created: string // date
	doctype: DocumentType
	filename: string
	filesize: number
	href: string
	linkstance: string
	metadata: Metadata
	metadataEditor: {
		href: string
		name: string
	}
	modified: string // date
	permissions: string[]
	previews: Preview[]
	props: {
		// TODO
	}
	quickRenditions: QuickRendition[]
	renditions: Rendition[]
	uniqueid: string
}

// https://learn.fotoware.com/Integrations_and_APIs/001_The_FotoWare_API/FotoWare_API_Overview/Asset_list_representation
export interface AssetList {
	data: Asset[]
	paging?: Paging
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
