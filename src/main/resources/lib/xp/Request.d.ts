export interface Request<
	Params extends Record<string, string> = Record<string, string>
> {
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
	params: Params
	remoteAddress?: string
	url: string
}
