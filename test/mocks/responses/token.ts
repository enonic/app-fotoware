import type { HttpClient } from '/lib/fotoware';


export default function mockTokenResponse({
	accessToken = 'accessToken'
}: {
	accessToken?: string
} = {}): HttpClient.Response {
	return {
		body: JSON.stringify({
			access_token: accessToken,
			cookies: [],
			headers: {
				"content-type": "application/json",
				date: "Tue, 20 Jun 2023 08:28:10 GMT",
				"fotoweb-server": "Product-Version=8.2.1412.0; Level=Invalid;",
				server: "Microsoft-IIS/10.0",
				"x-powered-by": "FotoWare (https://www.fotoware.com/)",
				"x-processing-time": "0.000",
				"x-requestid": "THcUlGo9MJjyo2fNuvr_ww"
			},
			refresh_token: 'refreshToken',
			token_type: 'bearer',
			expires_in: 28800.000000
		}),
		contentType: 'application/json',
		message: 'OK',
		status: 200,
	};
}
