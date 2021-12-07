interface Import {
	readonly path :string
	readonly project :string
	readonly query :string
	readonly rendition :string
	readonly site? :string
}

interface Imports {
	[key :string]: Import // Not readonly
}

export interface SiteConfig {
	readonly allowWebhookFromIp? :string
	readonly archiveName :string
	readonly clientId :string
	readonly clientSecret :string
	readonly imports :Imports
	readonly properties: {
		readonly artist :string
		readonly copyright :string
		readonly description :string
		readonly displayName :string
		readonly tags :string
	}
	readonly remoteAddresses: {
		readonly [key :string]: boolean
	}
	readonly url :string
}

export interface SitesConfigs {
	[key :string]: SiteConfig // Not readonly
}

export interface AppConfig {
	readonly imports :Imports
	readonly sites :SitesConfigs
}
