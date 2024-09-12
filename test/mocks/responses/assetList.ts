import type { HttpClient } from '../../../src/main/resources/lib/fotoware';


export default function mockAssetListResponse(): HttpClient.Response {
	return {
		body: JSON.stringify({
			"data": [
				{
					"archiveHREF": "/fotoweb/archives/5000-All-files/",
					"archiveId": 5000,
					"attributes": {
						"imageattributes": {
							"colorspace": "rgb",
							"flipmirror": 0,
							"pixelheight": 1,
							"pixelwidth": 1,
							"resolution": 300,
							"rotation": 0
						}
					},
					"builtinFields": [
						{
							"field": "title",
							"required": false,
							"value": ""
						},
						{
							"field": "description",
							"required": false,
							"value": ""
						},
						{
							"field": "tags",
							"required": false,
							"value": []
						},
						{
							"field": "status",
							"required": false,
							"value": ""
						},
						{
							"field": "rating",
							"required": false,
							"value": ""
						},
						{
							"field": "notes",
							"required": false,
							"value": ""
						}
					],
					"capabilities": {
						"crop": true,
						"print": true,
						"printWithAnnotations": true
					},
					"created": "2023-06-19T12:48:03.397000Z",
					"createdBy": "system",
					"doctype": "image",
					"downloadcount": 0,
					"dropHREF": "/fotoweb/archives/5000-All-files/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info#u=15001&m=uD48AokrWz0M7hw91aPiTPAhRXsObMnQdsgm86dvQ3o",
					"filename": "Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp",
					"filesize": 104448,
					"href": "/fotoweb/archives/5000-All-files/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info",
					"linkstance": "/fotoweb/archives/5000-All-files/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info",
					"metadata": {
						"110": {
							"value": "Credit"
						},
						"115": {
							"value": "Source"
						},
						"116": {
							"value": "Copyright"
						},
						"120": {
							"value": "Description"
						},
						"25": {
							"value": [
								"Tag1",
								"Tag2"
							]
						},
						"254": {
							"value": "User defined 254"
						},
						"40": {
							"value": "Special Instructions"
						},
						"5": {
							"value": "Title"
						},
						"80": {
							"value": [
								"Author",
								"Author2"
							]
						},
						"819": {
							"value": "Consent status"
						},
						"820": {
							"value": [
								"Person1",
								"Person2"
							]
						}
					},
					"metadataeditcount": 0,
					"metadataEditor": {
						"href": "/fotoweb/editors/260ef215-1a1c-4218-b5fb-3837eeafa1a0",
						"name": "Archive"
					},
					"modified": "2023-06-19T12:47:59Z",
					"modifiedBy": "system",
					"permissions": [
						"View",
						"Preview",
						"Workflow",
						"Download",
						"Order",
						"EditText",
						"CropRotate",
						"Delete",
						"Comping",
						"TrdParty1",
						"TrdParty2",
						"TrdParty3",
						"TrdParty4",
						"Alert",
						"CopyTo",
						"MoveTo",
						"CopyFrom",
						"MoveFrom",
						"Rename",
						"OpenFile",
						"EditFile",
						"CropFile",
						"UploadFile",
						"FwdtPlace",
						"Export",
						"Comment",
						"Annotate",
						"MngVideo",
						"EditSmartFolders",
						"DuplicateFile",
						"CropAndDownload",
						"HistoryView",
						"HistoryManage",
						"HistoryRollback"
					],
					"physicalFileId": "61d2db5594fb7f7314d5abf3/Folder 19/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp",
					"pincount": 0,
					"previewcount": 12,
					"previews": [
						{
							"height": 800,
							"href": "/fotoweb/cache/v2/7/A/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iCfhoYvVMf99B6tjQA0A.qQZEBt_u6p.jpg",
							"size": 800,
							"square": false,
							"width": 800
						},
						{
							"height": 1200,
							"href": "/fotoweb/cache/v2/E/L/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iCfhoYvVMf99B6tjYBMA.3er7cOnuWU.jpg",
							"size": 1200,
							"square": false,
							"width": 1200
						},
						{
							"height": 1600,
							"href": "/fotoweb/cache/v2/P/M/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iCfhoYvVMf99B6tjgBkA.uqoGl6R2Ud.jpg",
							"size": 1600,
							"square": false,
							"width": 1600
						},
						{
							"height": 2400,
							"href": "/fotoweb/cache/v2/A/1/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iCfhoYvVMf99B6tjwCUA.3psT3SeBox.jpg",
							"size": 2400,
							"square": false,
							"width": 2400
						},
						{
							"height": 200,
							"href": "/fotoweb/cache/v2/O/0/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iCfhoYvVMf99B6tjkAMA.eY7QKUsABs.jpg",
							"size": 200,
							"square": false,
							"width": 200
						},
						{
							"height": 300,
							"href": "/fotoweb/cache/v2/E/W/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iCfhoYvVMf99B6tjWAUA.NUWwu1oJqa.jpg",
							"size": 300,
							"square": false,
							"width": 300
						},
						{
							"height": 400,
							"href": "/fotoweb/cache/v2/L/t/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iCfhoYvVMf99B6tjIAcA.s3ZM6jnTM-.jpg",
							"size": 400,
							"square": false,
							"width": 400
						},
						{
							"height": 600,
							"href": "/fotoweb/cache/v2/F/Q/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iCfhoYvVMf99B6tjsAkA.LGnFK7kY1A.jpg",
							"size": 600,
							"square": false,
							"width": 600
						},
						{
							"height": 100,
							"href": "/fotoweb/cache/v2/l/i/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iCfhoYvVMf99B6tjyAQ.24CgAdVGvd.jpg",
							"size": 100,
							"square": true,
							"width": 100
						},
						{
							"height": 200,
							"href": "/fotoweb/cache/v2/X/H/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iCfhoYvVMf99B6tjkAME.3-edLRB-3k.jpg",
							"size": 200,
							"square": true,
							"width": 200
						},
						{
							"height": 200,
							"href": "/fotoweb/cache/v2/X/H/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iCfhoYvVMf99B6tjkAME.3-edLRB-3k.jpg",
							"size": 200,
							"square": true,
							"width": 200
						},
						{
							"height": 400,
							"href": "/fotoweb/cache/v2/M/8/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iCfhoYvVMf99B6tjIAcE.lyY7uSVCez.jpg",
							"size": 400,
							"square": true,
							"width": 400
						}
					],
					"previewToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2Vub25pYy5mb3Rvd2FyZS5jbG91ZC9mb3Rvd2ViLyIsInN1YiI6IjE1MDAxIiwiZXhwIjoxNjg3MjUzMjkxLCJuYmYiOjE2ODcyNDk2OTEsImlhdCI6MTY4NzI0OTY5MSwianRpIjoicC8rNUZ1OFJRM1V0d2k4ZGZDUWJnUU1zWHFsaFprQmNsSmVJYitYd1VMTT0iLCJhc3MiOiJhcmNoaXZlcy81MDAwL0ZvbGRlciUyMDE5L1RodXJpbmdpYV9TY2htYWxrYWxkZW5fYXN2MjAyMC0wN19pbWcxOF9TY2hsb3NzX1dpbGhlbG1zYnVyZy5qcGcud2VicCIsInJldiI6IiIsImF1ZCI6InByZXZpZXdfdG9rZW4iLCJzY29wZSI6WyJhcmJpdHJhcnlfcmVuZGl0aW9ucyJdfQ.7VgQkKA0pT4jR4yhmlN0S5hjFZpQRrAb3aJcT6zah-g",
					"props": {
						"annotations": {
							"enabled": false
						},
						"comments": {
							"enabled": false
						},
						"owner": null,
						"shares": {
							"enabled": false
						},
						"tags": []
					},
					"quickRenditions": [],
					"renditions": [
						{
							"default": true,
							"description": "Original File",
							"display_name": "Original File",
							"height": 1,
							"href": "/fotoweb/archives/5000-All-files/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info/__renditions/ORIGINAL",
							"original": true,
							"profile": "2af4914d-6c11-4b15-a7ee-a4260efc8309",
							"sizeFixed": false,
							"width": 1
						},
						{
							"default": false,
							"description": "ComLockRenditionDescription",
							"display_name": "ComLockRendition",
							"height": 0,
							"href": "/fotoweb/archives/5000-All-files/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info/__renditions/07c8334c-d869-4897-a53d-98c28e706d2f",
							"original": false,
							"profile": "07c8334c-d869-4897-a53d-98c28e706d2f",
							"sizeFixed": true,
							"width": 0
						}
					],
					"revisioncount": 0,
					"revisions": {
						"href": "/fotoweb/archives/5000-All-files/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp/__revisions/"
					},
					"thumbnailFields": {
						"additionalFields": [
							{
								"value": [],
								"views": [
									"desktop",
									"widgets",
									"web"
								]
							},
							{
								"value": "",
								"views": [
									"desktop",
									"widgets",
									"web"
								]
							}
						],
						"firstLine": {
							"value": ""
						},
						"label": {
							"value": "Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp"
						},
						"secondLine": {
							"value": []
						}
					},
					"uniqueid": "",
					"workflowcount": 0
				}
			],
			"paging": null
		}),
		contentType: "application/vnd.fotoware.assetlist+json; charset=utf-8",
		cookies: [],
		headers: {
			"cache-control": "private, max-age=30",
			"content-type": "application/vnd.fotoware.assetlist+json; charset=utf-8",
			date: "Tue, 20 Jun 2023 08:28:10 GMT",
			"fotoweb-server": "Product-Version=8.2.1412.0; Level=Invalid;",
			server: "Microsoft-IIS/10.0",
			vary: "Authorization,FWAPIToken,Cookie,Accept,Accept-Encoding,User-Agent",
			"x-powered-by": "FotoWare (https://www.fotoware.com/)",
			"x-processing-time": "0.000",
			"x-requestid": "BZxb8aHUPWAhL27ts0vuCg"
		},
		message: 'OK',
		status: 200,
	}
}
