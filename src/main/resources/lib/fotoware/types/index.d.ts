export type {
	Asset,
	AssetModified,
	Metadata,
	Rendition,
	RenditionUrl
} from './Asset.d'
export type {
	ArchiveName,
	ClientId,
	ClientSecret,
	Path,
	Project,
	Query,
	RenditionString,
	SiteConfig
} from '../xp/AppConfig.d'
export type {MediaContent} from '../xp/MediaContent.d'
export type {Request} from '../../xp/Request.d'
export type {Response} from '../../xp/Response.d'


export type AccessToken = string
export type Filename = string
export type Hostname = string
export type RenditionRequest = string
export type SearchURL = string

export type AllowOrDenyCollectionsRecord = Record<string,boolean>

export interface Cookie {
	name: string
	value: string
}
export type Cookies = Cookie[]

export interface TokenResponse {
	access_token: AccessToken
}

export interface PrivateFullAPIDescriptorResponse {
	archives: string
	searchURL: SearchURL
	services: {
		rendition_request: RenditionRequest
	}
}

export interface RenditionServiceResponseBodyParsed {
	href: string
}
