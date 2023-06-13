export namespace HttpClient {
	export type Method = 'GET'|'POST'|'PUT'|'DELETE'|'HEAD'|'PATCH'
	export type Request = {
		auth?: {
			user: string
			password: string
		}
		body?: string|AnyObject // (string | object) Body content to send with the request, usually for POST or PUT requests. It can be of type string or stream.
		certificates?: unknown
		clientCertificate?: unknown
		connectionTimeout?: number
		contentType?: string
		followRedirects?: boolean
		headers?: Record<string,string>
		method?: Method
		multipart?: Array<AnyObject>
		params?: StringObject
		proxy?: {
			host: string
			port: number
			user: string
			password: string
		}
		queryParams?: StringObject
		readTimeout?: number
		url: string
	}
	export type Response = {
		body: string|null // Body of the response as string. Null if the response content-type is not of type text.
		bodyStream?: unknown
		contentType: string
		status: number
	}
} // namespace HttpClient
