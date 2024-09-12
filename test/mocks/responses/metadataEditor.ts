import type { HttpClient } from '../../../src/main/resources/lib/fotoware';


export default function mockMetadataEditorResponse(): HttpClient.Response {
	return {
		body: JSON.stringify({
			"builtinFields": {
				"description": {
					"field": {
						"data-type": "text",
						"id": 120,
						"label": "Description",
						"max-size": 16000,
						"multi-instance": false,
						"multiline": true,
						"taxonomyHref": null,
						"validation": {
							"max": null,
							"min": null,
							"regexp": null
						}
					},
					"isWritable": true,
					"required": false,
					"taxonomy-only": false
				},
				"notes": {
					"field": {
						"data-type": "text",
						"id": 230,
						"label": "Image Notes",
						"max-size": 256,
						"multi-instance": false,
						"multiline": true,
						"taxonomyHref": null,
						"validation": {
							"max": null,
							"min": null,
							"regexp": null
						}
					},
					"isWritable": true,
					"required": false,
					"taxonomy-only": false
				},
				"rating": {
					"field": {
						"data-type": "text",
						"id": 320,
						"label": "Rating",
						"max-size": 1,
						"multi-instance": false,
						"multiline": false,
						"taxonomyHref": null,
						"validation": {
							"max": null,
							"min": null,
							"regexp": null
						}
					},
					"isWritable": true,
					"required": false,
					"taxonomy-only": false
				},
				"status": {
					"field": {
						"data-type": "text",
						"id": 10,
						"label": "Status",
						"max-size": 1,
						"multi-instance": false,
						"multiline": false,
						"taxonomyHref": null,
						"validation": {
							"max": null,
							"min": null,
							"regexp": null
						}
					},
					"isWritable": true,
					"required": false,
					"taxonomy-only": false
				},
				"tags": {
					"field": {
						"data-type": "text",
						"id": 25,
						"label": "Keywords",
						"max-size": 64,
						"multi-instance": true,
						"multiline": false,
						"taxonomyHref": "/fotoweb/taxonomies/25-Keywords/",
						"validation": {
							"max": null,
							"min": null,
							"regexp": null
						}
					},
					"isWritable": true,
					"required": false,
					"taxonomy-only": false
				},
				"title": {
					"field": {
						"data-type": "text",
						"id": 5,
						"label": "Title",
						"max-size": 64,
						"multi-instance": false,
						"multiline": false,
						"taxonomyHref": null,
						"validation": {
							"max": null,
							"min": null,
							"regexp": null
						}
					},
					"isWritable": true,
					"required": false,
					"taxonomy-only": false
				}
			},
			"detailRegions": [
				{
					"fields": [
						{
							"field": {
								"data-type": "text",
								"id": 800,
								"label": "Archive",
								"max-size": 256,
								"multi-instance": false,
								"multiline": false,
								"taxonomyHref": "/fotoweb/taxonomies/800-Archives/",
								"validation": {
									"max": null,
									"min": null,
									"regexp": null
								}
							},
							"isWritable": true,
							"required": false,
							"taxonomy-only": true
						},
						{
							"field": {
								"data-type": "text",
								"id": 5,
								"label": "Title",
								"max-size": 64,
								"multi-instance": false,
								"multiline": false,
								"taxonomyHref": null,
								"validation": {
									"max": null,
									"min": null,
									"regexp": null
								}
							},
							"isWritable": true,
							"required": false,
							"taxonomy-only": false
						},
						{
							"field": {
								"data-type": "text",
								"id": 25,
								"label": "Keywords",
								"max-size": 64,
								"multi-instance": true,
								"multiline": false,
								"taxonomyHref": "/fotoweb/taxonomies/25-Keywords/",
								"validation": {
									"max": null,
									"min": null,
									"regexp": null
								}
							},
							"isWritable": true,
							"required": false,
							"taxonomy-only": false
						},
						{
							"field": {
								"data-type": "text",
								"id": 120,
								"label": "Description",
								"max-size": 16000,
								"multi-instance": false,
								"multiline": true,
								"taxonomyHref": null,
								"validation": {
									"max": null,
									"min": null,
									"regexp": null
								}
							},
							"isWritable": true,
							"required": false,
							"taxonomy-only": false
						}
					],
					"name": "Default"
				},
				{
					"fields": [
						{
							"field": {
								"data-type": "text",
								"id": 80,
								"label": "Author",
								"max-size": 64,
								"multi-instance": true,
								"multiline": false,
								"taxonomyHref": null,
								"validation": {
									"max": null,
									"min": null,
									"regexp": null
								}
							},
							"isWritable": true,
							"required": false,
							"taxonomy-only": false
						},
						{
							"field": {
								"data-type": "text",
								"id": 110,
								"label": "Credit",
								"max-size": 32,
								"multi-instance": false,
								"multiline": false,
								"taxonomyHref": null,
								"validation": {
									"max": null,
									"min": null,
									"regexp": null
								}
							},
							"isWritable": true,
							"required": false,
							"taxonomy-only": false
						},
						{
							"field": {
								"data-type": "text",
								"id": 115,
								"label": "Source",
								"max-size": 32,
								"multi-instance": false,
								"multiline": false,
								"taxonomyHref": null,
								"validation": {
									"max": null,
									"min": null,
									"regexp": null
								}
							},
							"isWritable": true,
							"required": false,
							"taxonomy-only": false
						},
						{
							"field": {
								"data-type": "text",
								"id": 116,
								"label": "Copyright String",
								"max-size": 256,
								"multi-instance": false,
								"multiline": false,
								"taxonomyHref": null,
								"validation": {
									"max": null,
									"min": null,
									"regexp": null
								}
							},
							"isWritable": true,
							"required": false,
							"taxonomy-only": false
						},
						{
							"field": {
								"data-type": "text",
								"id": 611,
								"label": "Access",
								"max-size": 256,
								"multi-instance": false,
								"multiline": false,
								"taxonomyHref": "/fotoweb/taxonomies/611-Access/",
								"validation": {
									"max": null,
									"min": null,
									"regexp": null
								}
							},
							"isWritable": true,
							"required": false,
							"taxonomy-only": true
						},
						{
							"field": {
								"data-type": "text",
								"id": 40,
								"label": "Special Instructions",
								"max-size": 256,
								"multi-instance": false,
								"multiline": true,
								"taxonomyHref": null,
								"validation": {
									"max": null,
									"min": null,
									"regexp": null
								}
							},
							"isWritable": true,
							"required": false,
							"taxonomy-only": false
						}
					],
					"name": "More info"
				},
				{
					"fields": [
						{
							"field": {
								"data-type": "text",
								"id": 819,
								"label": "Consent status",
								"max-size": 256,
								"multi-instance": false,
								"multiline": false,
								"taxonomyHref": "/fotoweb/taxonomies/819-Consent-status/",
								"validation": {
									"max": null,
									"min": null,
									"regexp": null
								}
							},
							"isWritable": true,
							"required": false,
							"taxonomy-only": false
						},
						{
							"field": {
								"data-type": "text",
								"id": 820,
								"label": "Person",
								"max-size": 16000,
								"multi-instance": true,
								"multiline": false,
								"taxonomyHref": "/fotoweb/taxonomies/820-Persons/",
								"validation": {
									"max": null,
									"min": null,
									"regexp": null
								}
							},
							"isWritable": true,
							"required": false,
							"taxonomy-only": false
						}
					],
					"name": "GDPR"
				},
				{
					"fields": [
						{
							"field": {
								"data-type": "text",
								"id": 253,
								"label": "User defined 253",
								"max-size": 256,
								"multi-instance": false,
								"multiline": false,
								"taxonomyHref": null,
								"validation": {
									"max": null,
									"min": null,
									"regexp": null
								}
							},
							"isWritable": false,
							"required": false,
							"taxonomy-only": false
						},
						{
							"field": {
								"data-type": "text",
								"id": 254,
								"label": "User defined 254",
								"max-size": 256,
								"multi-instance": false,
								"multiline": false,
								"taxonomyHref": null,
								"validation": {
									"max": null,
									"min": null,
									"regexp": null
								}
							},
							"isWritable": true,
							"required": false,
							"taxonomy-only": false
						},
						{
							"field": {
								"data-type": "text",
								"id": 255,
								"label": "User defined 255",
								"max-size": 256,
								"multi-instance": false,
								"multiline": false,
								"taxonomyHref": null,
								"validation": {
									"max": null,
									"min": null,
									"regexp": null
								}
							},
							"isWritable": true,
							"required": false,
							"taxonomy-only": true
						}
					],
					"name": "Enonic"
				}
			],
			"href": "/fotoweb/editors/260ef215-1a1c-4218-b5fb-3837eeafa1a0",
			"id": "260ef215-1a1c-4218-b5fb-3837eeafa1a0",
			"name": "Archive",
			"preserveModificationTime": false,
			"thumbnailFields": {
				"additionalFields": [
					{
						"field": {
							"data-type": "text",
							"id": 25,
							"label": "Keywords",
							"max-size": 64,
							"multi-instance": true,
							"multiline": false,
							"taxonomyHref": "/fotoweb/taxonomies/25-Keywords/",
							"validation": {
								"max": null,
								"min": null,
								"regexp": null
							}
						},
						"isWritable": true,
						"required": false,
						"taxonomy-only": false,
						"valueStore": "metadata",
						"views": [
							"desktop",
							"widgets",
							"web"
						]
					},
					{
						"field": {
							"data-type": "text",
							"id": 120,
							"label": "Description",
							"max-size": 16000,
							"multi-instance": false,
							"multiline": true,
							"taxonomyHref": null,
							"validation": {
								"max": null,
								"min": null,
								"regexp": null
							}
						},
						"isWritable": true,
						"required": false,
						"taxonomy-only": false,
						"valueStore": "metadata",
						"views": [
							"desktop",
							"widgets",
							"web"
						]
					}
				],
				"firstLine": {
					"field": {
						"data-type": "text",
						"id": 5,
						"label": "Title",
						"max-size": 64,
						"multi-instance": false,
						"multiline": false,
						"taxonomyHref": null,
						"validation": {
							"max": null,
							"min": null,
							"regexp": null
						}
					},
					"isWritable": true,
					"required": false,
					"taxonomy-only": false,
					"valueStore": "metadata",
					"views": [
						"mobile",
						"desktop",
						"widgets",
						"web",
						"pro"
					]
				},
				"label": {
					"field": null,
					"isWritable": false,
					"required": false,
					"taxonomy-only": false,
					"valueStore": "filename",
					"views": [
						"mobile",
						"desktop",
						"widgets",
						"web",
						"pro"
					]
				},
				"secondLine": {
					"field": {
						"data-type": "text",
						"id": 80,
						"label": "Author",
						"max-size": 64,
						"multi-instance": true,
						"multiline": false,
						"taxonomyHref": null,
						"validation": {
							"max": null,
							"min": null,
							"regexp": null
						}
					},
					"isWritable": true,
					"required": false,
					"taxonomy-only": false,
					"valueStore": "metadata",
					"views": [
						"desktop",
						"widgets",
						"web",
						"pro"
					]
				}
			}
		}),
		contentType: 'application/vnd.fotoware.metadata-set+json',
		cookies: [],
		headers: {
			"cache-control": "max-age=60",
			"content-language": "en-gb",
			"content-length": "7921",
			"content-type": "application/vnd.fotoware.metadata-set+json",
			date: "Tue, 20 Jun 2023 08:28:10 GMT",
			server: "Microsoft-IIS/10.0",
			vary: "User-Agent, Accept",
			"x-powered-by": "FotoWare (https://www.fotoware.com/)",
			"x-requestid": "ZTlMLbshmOvNdOIV9K1Rtw"
		},
		message: 'OK',
		status: 200,
	}
}
