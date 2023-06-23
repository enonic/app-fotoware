import type { HttpClient } from '/lib/fotoware';


export default function mockRenditionResponse(): HttpClient.Response {
	return {
		body: JSON.stringify({
			"href": "/fotoweb/me/background-tasks/647f4840-0f44-11ee-968b-000d3abcd05d/0/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp"
		}),
		contentType: "application/vnd.fotoware.rendition-response+json",
		cookies: [],
		headers: {
			"content-length": "149",
			"content-type": "application/vnd.fotoware.rendition-response+json",
			date: "Tue, 20 Jun 2023 08:28:10 GMT",
			location: "https://enonic.fotoware.cloud/fotoweb/me/background-tasks/647f4840-0f44-11ee-968b-000d3abcd05d/0/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp",
			server: "Microsoft-IIS/10.0",
			vary: "User-Agent, Accept",
			"x-powered-by": "FotoWare (https://www.fotoware.com/)",
			"x-requestid": "NOVhz68rOmYYpB1ZExI9ag"
		},
		message: 'Accepted',
		status: 202,
	}
}
