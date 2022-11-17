export interface Request {
	body?: string // Often JSON
	contentType?: string
	followRedirects?: boolean
	headers?: {
		'Accept'?: string
		'Authorization'?: string
		'Cookie'?: string
		'User-Agent'?: string
	}
	method: 'GET'|'POST'
	remoteAddress?: string
	url: string
}
