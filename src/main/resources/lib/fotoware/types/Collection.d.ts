import type { Paging } from './Paging';
import type { AssetList } from './Asset';


// https://learn.fotoware.com/Integrations_and_APIs/001_The_FotoWare_API/FotoWare_API_Overview/Collection_representation
export interface Collection {
	ancestors: {
		// TODO
	}[]
	archived?: string // date
	assetCount: number
	assets: AssetList
	canBeArchived: boolean
	canBeDeleted: boolean
	canCopyTo: boolean
	canCreateAlerts: boolean
	canCreateFolders: boolean
	canHaveChildren: boolean
	canIngestToChildren: boolean
	canMoveTo: boolean
	canSelect: boolean
	canUploadTo: boolean
	childCount: number
	children: CollectionList
	created: string // date
	data: string // User-specific data URL of the collection. Usually, this is the URL that the collection was requested from. In collection lists, this is the URL that should be followed in order to get assets and sub collections of the collection.
	deleted?: string // date
	description: string
	hasChildren: boolean
	href: string
	isFolderNavigationEnabled: boolean
	isLinkCollection: boolean
	isSearchable: boolean
	isSelectable: boolean
	metadataEditor: {
		href: string
		name: string
	}
	modified: string // date
	name: string
	originalURL: string
	permissions: string[]
	props: {
		// TODO
	}
	posterAsset?: string
	searchURL?: string
	taxonomies: {
		// TODO
	}[]
	type: string
	uploadHref: string
}

// https://learn.fotoware.com/Integrations_and_APIs/001_The_FotoWare_API/FotoWare_API_Overview/Collection_List_representation
export interface CollectionList {
	data: Collection[]
	paging?: Paging
	searchURL: string
}
