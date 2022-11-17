export type ArchiveName = string
export type ClientId = string // Perhaps uuid v?
export type ClientSecret = string
export type ImportName = string
export type Path = string
export type Project = string
export type Query = string
export type RemoteAddress = string // Perhaps ip `${Number}.${Number}.${Number}.${Number}`
export type RenditionString = string
export type SiteName = string

interface Import {
	readonly path: Path
	readonly project: Project
	readonly query: Query
	readonly rendition: RenditionString
	readonly site? :string
}

export type Imports = Record<ImportName,Import> // Not readonly

export type RemoteAddresses = Record<RemoteAddress,boolean>

export interface SiteConfig {
	readonly allowWebhookFromIp? :string
	readonly archiveName: ArchiveName
	readonly clientId: ClientId
	readonly clientSecret: ClientSecret
	imports: Imports // Not readonly
	readonly properties: {
		readonly artist :string
		readonly copyright :string
		readonly description :string
		readonly displayName :string
		readonly tags :string
	}
	readonly remoteAddresses: RemoteAddresses
	readonly url :string
}

export type SitesConfigs = Record<SiteName,SiteConfig> // Not readonly

export interface AppConfig {
	readonly imports :Imports
	readonly sites :SitesConfigs
}
