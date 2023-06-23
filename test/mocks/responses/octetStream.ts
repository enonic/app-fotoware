import type { HttpClient } from '/lib/fotoware';


import { createReadStream } from 'fs';
import {join} from 'path';


export default function mockOctetStreamResponse(): HttpClient.Response {
	return {
		body: null,
		bodyStream: createReadStream(join(__dirname, 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp')),
		contentType: "application/octet-stream",
		cookies: [],
		headers: {
			"cache-control": "private",
			"content-disposition": "attachment",
			"content-length": "103506",
			"content-type": "application/octet-stream",
			date: "Tue, 20 Jun 2023 10:08:47 GMT",
			"fotoweb-server": "Product-Version=8.2.1412.0; Level=Invalid;",
			server: "Microsoft-IIS/10.0",
			vary: "Authorization,FWAPIToken,Cookie,Cookie,Cookie,Accept,Accept-Encoding,User-Agent,Accept-Language",
			"x-powered-by": "FotoWare (https://www.fotoware.com/)",
			"x-processing-time": "0.000",
			"x-requestid": "sc8mZO1eAxMHfkw-6bKdmQ"
		},
		message: 'OK',
		status: 200,
	}
}
