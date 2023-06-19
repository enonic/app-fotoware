export interface Request<
	Params extends Record<string, string> = Record<string, string>
> {
	body?: string // Often JSON
	branch: 'draft'|'master' // string
	contentType: string
	contextPath: string
	cookies: Record<string, string>
	followRedirects?: boolean
	headers?: {
		Accept?: string
		'Accept-Encoding'?: string
		Authorization?: string
		Connection?: string
		'Content-Length'?: string
		'Content-Type'?: string
		Cookie?: string
		Host?: string
		'User-Agent'?: string
		'X-Forwarded-For'?: string
		'X-Forwarded-Host'?: string
		'X-Forwarded-Proto'?: string
		'X-Forwarded-Server'?: string
	}
	host: string
	method: 'GET'|'POST'
	mode: 'live'
	params: Params
	path: string
	pathParams: Record<string, string>
	port: number
	rawPath: string
	repositoryId: string
	remoteAddress?: string
	scheme: 'http'|'https' // string
	url: string
	webSocket: boolean
}
