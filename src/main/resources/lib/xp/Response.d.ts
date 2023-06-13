import type { ByteSource } from '/lib/xp/io';


export interface Response {
	body?: string // Often JSON
	bodyStream?: ByteSource
	contentType?: string
	message?: string
	headers?: Record<string,string>
	cookies?: string[]
	status: number
}
