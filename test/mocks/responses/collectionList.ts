import type { HttpClient } from '/lib/fotoware';


export default function mockCollectionListResponse(): HttpClient.Response {
	return {
		body: JSON.stringify({
			"add": null,
			"data": [
				{
					"_searchString": "(((FQYFN contains (.gif)) OR (FQYFN contains (.jpg)) OR (FQYFN contains (.jpeg)) OR (FQYFN contains (.png)) OR (FQYFN contains (*.svg))) AND NOT (IPTC025 contains notforweb) AND (FQYFN contains (Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)))",
					"alertHref": "/fotoweb/archives/5000-All-files/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
					"alt_orders": [
						{
							"asc": {
								"data": "/fotoweb/archives/5000-All-files/;o=+?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5000-All-files/;o=+?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "+"
									}
								]
							},
							"desc": {
								"data": "/fotoweb/archives/5000-All-files/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"default": true,
								"href": "/fotoweb/archives/5000-All-files/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": ""
									}
								]
							},
							"key": "mt",
							"name": "Last Modified"
						},
						{
							"asc": {
								"data": "/fotoweb/archives/5000-All-files/;o=fn?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5000-All-files/;o=fn?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "fn"
									}
								]
							},
							"desc": {
								"data": "/fotoweb/archives/5000-All-files/;o=-fn?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5000-All-files/;o=-fn?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "-fn"
									}
								]
							},
							"key": "fn",
							"name": "Filename"
						},
						{
							"asc": {
								"data": "/fotoweb/archives/5000-All-files/;o=350?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5000-All-files/;o=350?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "350"
									}
								]
							},
							"desc": {
								"data": "/fotoweb/archives/5000-All-files/;o=-350?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5000-All-files/;o=-350?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "-350"
									}
								]
							},
							"key": "350",
							"name": "Original date"
						}
					],
					"archived": null,
					"assetCount": 1,
					"canBeArchived": false,
					"canBeDeleted": false,
					"canCopyTo": true,
					"canCreateFolders": true,
					"canHaveChildren": true,
					"canIngestToChildren": true,
					"canMoveTo": true,
					"canSelect": true,
					"canUploadTo": true,
					"clearSearch": {
						"data": "/fotoweb/data/a/5000.59RQqyg49PY9HAMH_xSSZZTnQVDQw2MZZL5uIqabN5o/",
						"href": "/fotoweb/archives/5000-All-files/"
					},
					"color": "#595959",
					"create": [],
					"created": "",
					"data": "/fotoweb/archives/5000-All-files/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
					"dataTemplate": "/fotoweb/archives/5000-All-files{/path*}/{;o}",
					"deleted": null,
					"description": "",
					"edit": null,
					"hasChildren": true,
					"href": "/fotoweb/archives/5000-All-files/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
					"iconCharacter": "",
					"id": "5000",
					"isConsentManagementEnabled": false,
					"isConsentStatusFilterEnabled": false,
					"isFolderNavigationEnabled": false,
					"isLinkCollection": false,
					"isSearchable": true,
					"isSelectable": true,
					"isSmartFolderNavigationEnabled": true,
					"matchingHref": "/fotoweb/archives/5000-All-files/",
					"metadataEditor": {
						"href": "/fotoweb/editors/260ef215-1a1c-4218-b5fb-3837eeafa1a0",
						"name": "Archive"
					},
					"modified": "2023-05-30T07:43:21.434841Z",
					"name": "All files",
					"orderRootHref": "/fotoweb/archives/5000-All-files/",
					"originalURL": "/fotoweb/archives/5000-All-files/",
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
						"HistoryRollback",
						"ViewConsentSummary",
						"ViewConsentDetails",
						"ManageConsentStatus",
						"SetPosterAsset"
					],
					"pin": null,
					"posterAsset": "/fotoweb/archives/5000-All-files/Folder%2019/DAM%20Dictionary%20-%20DAM.png.info",
					"posterImages": [
						{
							"height": 169,
							"href": "/fotoweb/cache/posters/archives/5000/.s300_169.t64759b0f.x6lCDhCEI4f2D.jpg",
							"size": 300,
							"square": false,
							"width": 300
						},
						{
							"height": 338,
							"href": "/fotoweb/cache/posters/archives/5000/.s600_338.t64759b0f.xt7SFsiFUj-nK.jpg",
							"size": 600,
							"square": false,
							"width": 600
						},
						{
							"height": 113,
							"href": "/fotoweb/cache/posters/archives/5000/.s200_113.t64759b0f.xCZS1sojXmIg7.jpg",
							"size": 200,
							"square": false,
							"width": 200
						},
						{
							"height": 226,
							"href": "/fotoweb/cache/posters/archives/5000/.s400_226.t64759b0f.xroCpM2nPTbYQ.jpg",
							"size": 400,
							"square": false,
							"width": 400
						},
						{
							"height": 50,
							"href": "/fotoweb/cache/posters/archives/5000/.s50_50.t64759b0f.xRkP3XyZYYnvt.jpg",
							"size": 50,
							"square": true,
							"width": 50
						},
						{
							"height": 100,
							"href": "/fotoweb/cache/posters/archives/5000/.s100_100.t64759b0f.xZt0Pj005k5Bl.jpg",
							"size": 100,
							"square": true,
							"width": 100
						}
					],
					"propertyValidations": [
						{
							"max": 507,
							"min": 1,
							"name": "childUrlFragment",
							"regex": "^[a-z0-9\\-]+$"
						}
					],
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
					"reorder": null,
					"searchQuery": "((fn:\".gif\") OR (fn:\".jpg\") OR (fn:\".jpeg\") OR (fn:\".png\") OR (fn:\"*.svg\")) AND (NOT (25:\"notforweb\")) AND (fn:\"Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp\")",
					"searchString": "((fn:.gif|fn:.jpg|fn:.jpeg|fn:.png|fn:*.svg)AND NOT(25:notforweb))AND(fn:Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
					"searchURL": "/fotoweb/archives/5000-All-files/{?q}",
					"smartFolderHeader": "SmartFolders",
					"taxonomies": [],
					"type": "archive",
					"uploadHref": "",
					"urlComponents": []
				},
				{
					"_searchString": "(((FQYFN contains (.gif)) OR (FQYFN contains (.jpg)) OR (FQYFN contains (.jpeg)) OR (FQYFN contains (.png)) OR (FQYFN contains (*.svg))) AND NOT (IPTC025 contains notforweb) AND (FQYFN contains (Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)))",
					"alertHref": "/fotoweb/archives/5001-My-Uploads/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
					"alt_orders": [
						{
							"asc": {
								"data": "/fotoweb/archives/5001-My-Uploads/;o=+?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5001-My-Uploads/;o=+?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "+"
									}
								]
							},
							"desc": {
								"data": "/fotoweb/archives/5001-My-Uploads/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"default": true,
								"href": "/fotoweb/archives/5001-My-Uploads/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": ""
									}
								]
							},
							"key": "mt",
							"name": "Last Modified"
						},
						{
							"asc": {
								"data": "/fotoweb/archives/5001-My-Uploads/;o=fn?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5001-My-Uploads/;o=fn?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "fn"
									}
								]
							},
							"desc": {
								"data": "/fotoweb/archives/5001-My-Uploads/;o=-fn?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5001-My-Uploads/;o=-fn?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "-fn"
									}
								]
							},
							"key": "fn",
							"name": "Filename"
						},
						{
							"asc": {
								"data": "/fotoweb/archives/5001-My-Uploads/;o=350?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5001-My-Uploads/;o=350?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "350"
									}
								]
							},
							"desc": {
								"data": "/fotoweb/archives/5001-My-Uploads/;o=-350?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5001-My-Uploads/;o=-350?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "-350"
									}
								]
							},
							"key": "350",
							"name": "Original date"
						}
					],
					"archived": null,
					"assetCount": 0,
					"canBeArchived": false,
					"canBeDeleted": false,
					"canCopyTo": true,
					"canCreateFolders": false,
					"canHaveChildren": true,
					"canIngestToChildren": false,
					"canMoveTo": true,
					"canSelect": true,
					"canUploadTo": true,
					"clearSearch": {
						"data": "/fotoweb/data/a/5001.1KUN1upuWrWz1MytTHxI6KSWs8UmjvAFIsFshn93SoI/",
						"href": "/fotoweb/archives/5001-My-Uploads/"
					},
					"color": "#595959",
					"create": [],
					"created": "",
					"data": "/fotoweb/archives/5001-My-Uploads/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
					"dataTemplate": "/fotoweb/archives/5001-My-Uploads{/path*}/{;o}",
					"deleted": null,
					"description": "",
					"edit": null,
					"hasChildren": true,
					"href": "/fotoweb/archives/5001-My-Uploads/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
					"iconCharacter": "",
					"id": "5001",
					"isConsentManagementEnabled": false,
					"isConsentStatusFilterEnabled": false,
					"isFolderNavigationEnabled": false,
					"isLinkCollection": false,
					"isSearchable": true,
					"isSelectable": true,
					"isSmartFolderNavigationEnabled": true,
					"matchingHref": "/fotoweb/archives/5001-My-Uploads/",
					"metadataEditor": {
						"href": "/fotoweb/editors/494e7785-3d40-4370-a0ef-69f4f0ef5a8e",
						"name": "Default Metadataset for SaaS"
					},
					"modified": "2023-05-30T07:43:21.434841Z",
					"name": "My Uploads",
					"orderRootHref": "/fotoweb/archives/5001-My-Uploads/",
					"originalURL": "/fotoweb/archives/5001-My-Uploads/",
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
						"HistoryRollback",
						"ViewConsentSummary",
						"ViewConsentDetails",
						"ManageConsentStatus",
						"SetPosterAsset"
					],
					"pin": null,
					"posterAsset": null,
					"posterImages": [],
					"propertyValidations": [
						{
							"max": 507,
							"min": 1,
							"name": "childUrlFragment",
							"regex": "^[a-z0-9\\-]+$"
						}
					],
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
					"reorder": null,
					"searchQuery": "((fn:\".gif\") OR (fn:\".jpg\") OR (fn:\".jpeg\") OR (fn:\".png\") OR (fn:\"*.svg\")) AND (NOT (25:\"notforweb\")) AND (fn:\"Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp\")",
					"searchString": "((fn:.gif|fn:.jpg|fn:.jpeg|fn:.png|fn:*.svg)AND NOT(25:notforweb))AND(fn:Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
					"searchURL": "/fotoweb/archives/5001-My-Uploads/{?q}",
					"smartFolderHeader": "SmartFolders",
					"taxonomies": [],
					"type": "archive",
					"uploadHref": "",
					"urlComponents": []
				},
				{
					"_searchString": "(((FQYFN contains (.gif)) OR (FQYFN contains (.jpg)) OR (FQYFN contains (.jpeg)) OR (FQYFN contains (.png)) OR (FQYFN contains (*.svg))) AND NOT (IPTC025 contains notforweb) AND (FQYFN contains (Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)))",
					"alertHref": "/fotoweb/archives/5002-Photos/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
					"alt_orders": [
						{
							"asc": {
								"data": "/fotoweb/archives/5002-Photos/;o=+?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5002-Photos/;o=+?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "+"
									}
								]
							},
							"desc": {
								"data": "/fotoweb/archives/5002-Photos/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"default": true,
								"href": "/fotoweb/archives/5002-Photos/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": ""
									}
								]
							},
							"key": "mt",
							"name": "Last Modified"
						},
						{
							"asc": {
								"data": "/fotoweb/archives/5002-Photos/;o=fn?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5002-Photos/;o=fn?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "fn"
									}
								]
							},
							"desc": {
								"data": "/fotoweb/archives/5002-Photos/;o=-fn?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5002-Photos/;o=-fn?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "-fn"
									}
								]
							},
							"key": "fn",
							"name": "Filename"
						},
						{
							"asc": {
								"data": "/fotoweb/archives/5002-Photos/;o=350?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5002-Photos/;o=350?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "350"
									}
								]
							},
							"desc": {
								"data": "/fotoweb/archives/5002-Photos/;o=-350?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5002-Photos/;o=-350?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "-350"
									}
								]
							},
							"key": "350",
							"name": "Original date"
						}
					],
					"archived": null,
					"assetCount": 0,
					"canBeArchived": false,
					"canBeDeleted": false,
					"canCopyTo": true,
					"canCreateFolders": false,
					"canHaveChildren": true,
					"canIngestToChildren": false,
					"canMoveTo": true,
					"canSelect": true,
					"canUploadTo": true,
					"clearSearch": {
						"data": "/fotoweb/data/a/5002.MsGLhyYfbBUKkRM_L3uIdEmgoi8RzXm-bsy4-H-sCzw/",
						"href": "/fotoweb/archives/5002-Photos/"
					},
					"color": "#595959",
					"create": [],
					"created": "",
					"data": "/fotoweb/archives/5002-Photos/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
					"dataTemplate": "/fotoweb/archives/5002-Photos{/path*}/{;o}",
					"deleted": null,
					"description": "",
					"edit": null,
					"hasChildren": true,
					"href": "/fotoweb/archives/5002-Photos/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
					"iconCharacter": "",
					"id": "5002",
					"isConsentManagementEnabled": false,
					"isConsentStatusFilterEnabled": false,
					"isFolderNavigationEnabled": false,
					"isLinkCollection": false,
					"isSearchable": true,
					"isSelectable": true,
					"isSmartFolderNavigationEnabled": true,
					"matchingHref": "/fotoweb/archives/5002-Photos/",
					"metadataEditor": {
						"href": "/fotoweb/editors/494e7785-3d40-4370-a0ef-69f4f0ef5a8e",
						"name": "Default Metadataset for SaaS"
					},
					"modified": "2023-05-30T07:43:21.434841Z",
					"name": "Photos",
					"orderRootHref": "/fotoweb/archives/5002-Photos/",
					"originalURL": "/fotoweb/archives/5002-Photos/",
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
						"HistoryRollback",
						"ViewConsentSummary",
						"ViewConsentDetails",
						"ManageConsentStatus",
						"SetPosterAsset"
					],
					"pin": null,
					"posterAsset": "/fotoweb/archives/5002-Photos/Folder%2019/actionvance-nLGX7U1dnZM-unsplash.jpg.info",
					"posterImages": [
						{
							"height": 169,
							"href": "/fotoweb/cache/posters/archives/5002/.s300_169.t64759b0f.xHEZTjaYdnPGu.jpg",
							"size": 300,
							"square": false,
							"width": 300
						},
						{
							"height": 338,
							"href": "/fotoweb/cache/posters/archives/5002/.s600_338.t64759b0f.x9MLe8Mm0RLqW.jpg",
							"size": 600,
							"square": false,
							"width": 600
						},
						{
							"height": 113,
							"href": "/fotoweb/cache/posters/archives/5002/.s200_113.t64759b0f.xnlxyvpYhMc08.jpg",
							"size": 200,
							"square": false,
							"width": 200
						},
						{
							"height": 226,
							"href": "/fotoweb/cache/posters/archives/5002/.s400_226.t64759b0f.xAMxwR_204sMz.jpg",
							"size": 400,
							"square": false,
							"width": 400
						},
						{
							"height": 50,
							"href": "/fotoweb/cache/posters/archives/5002/.s50_50.t64759b0f.xtMrwPQEjm-fG.jpg",
							"size": 50,
							"square": true,
							"width": 50
						},
						{
							"height": 100,
							"href": "/fotoweb/cache/posters/archives/5002/.s100_100.t64759b0f.xdKCYjlUZL4pi.jpg",
							"size": 100,
							"square": true,
							"width": 100
						}
					],
					"propertyValidations": [
						{
							"max": 507,
							"min": 1,
							"name": "childUrlFragment",
							"regex": "^[a-z0-9\\-]+$"
						}
					],
					"props": {
						"annotations": {
							"count": 0,
							"enabled": true,
							"href": "/fotoweb/archives/5002-Photos/.annotations/"
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
					"reorder": null,
					"searchQuery": "((fn:\".gif\") OR (fn:\".jpg\") OR (fn:\".jpeg\") OR (fn:\".png\") OR (fn:\"*.svg\")) AND (NOT (25:\"notforweb\")) AND (fn:\"Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp\")",
					"searchString": "((fn:.gif|fn:.jpg|fn:.jpeg|fn:.png|fn:*.svg)AND NOT(25:notforweb))AND(fn:Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
					"searchURL": "/fotoweb/archives/5002-Photos/{?q}",
					"smartFolderHeader": "SmartFolders",
					"taxonomies": [],
					"type": "archive",
					"uploadHref": "",
					"urlComponents": []
				},
				{
					"_searchString": "(((FQYFN contains (.gif)) OR (FQYFN contains (.jpg)) OR (FQYFN contains (.jpeg)) OR (FQYFN contains (.png)) OR (FQYFN contains (*.svg))) AND NOT (IPTC025 contains notforweb) AND (FQYFN contains (Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)))",
					"alertHref": "/fotoweb/archives/5003-Illustrations/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
					"alt_orders": [
						{
							"asc": {
								"data": "/fotoweb/archives/5003-Illustrations/;o=+?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5003-Illustrations/;o=+?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "+"
									}
								]
							},
							"desc": {
								"data": "/fotoweb/archives/5003-Illustrations/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"default": true,
								"href": "/fotoweb/archives/5003-Illustrations/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": ""
									}
								]
							},
							"key": "mt",
							"name": "Last Modified"
						},
						{
							"asc": {
								"data": "/fotoweb/archives/5003-Illustrations/;o=fn?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5003-Illustrations/;o=fn?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "fn"
									}
								]
							},
							"desc": {
								"data": "/fotoweb/archives/5003-Illustrations/;o=-fn?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5003-Illustrations/;o=-fn?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "-fn"
									}
								]
							},
							"key": "fn",
							"name": "Filename"
						},
						{
							"asc": {
								"data": "/fotoweb/archives/5003-Illustrations/;o=350?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5003-Illustrations/;o=350?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "350"
									}
								]
							},
							"desc": {
								"data": "/fotoweb/archives/5003-Illustrations/;o=-350?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5003-Illustrations/;o=-350?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "-350"
									}
								]
							},
							"key": "350",
							"name": "Original date"
						}
					],
					"archived": null,
					"assetCount": 0,
					"canBeArchived": false,
					"canBeDeleted": false,
					"canCopyTo": true,
					"canCreateFolders": false,
					"canHaveChildren": true,
					"canIngestToChildren": false,
					"canMoveTo": true,
					"canSelect": true,
					"canUploadTo": true,
					"clearSearch": {
						"data": "/fotoweb/data/a/5003.SPIQePqauYB-9xrN2HTaMpWkST8NGIuTQ8tx9PDbcSU/",
						"href": "/fotoweb/archives/5003-Illustrations/"
					},
					"color": "#595959",
					"create": [],
					"created": "",
					"data": "/fotoweb/archives/5003-Illustrations/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
					"dataTemplate": "/fotoweb/archives/5003-Illustrations{/path*}/{;o}",
					"deleted": null,
					"description": "",
					"edit": null,
					"hasChildren": true,
					"href": "/fotoweb/archives/5003-Illustrations/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
					"iconCharacter": "",
					"id": "5003",
					"isConsentManagementEnabled": false,
					"isConsentStatusFilterEnabled": false,
					"isFolderNavigationEnabled": false,
					"isLinkCollection": false,
					"isSearchable": true,
					"isSelectable": true,
					"isSmartFolderNavigationEnabled": true,
					"matchingHref": "/fotoweb/archives/5003-Illustrations/",
					"metadataEditor": {
						"href": "/fotoweb/editors/494e7785-3d40-4370-a0ef-69f4f0ef5a8e",
						"name": "Default Metadataset for SaaS"
					},
					"modified": "2023-05-30T07:43:21.434841Z",
					"name": "Illustrations",
					"orderRootHref": "/fotoweb/archives/5003-Illustrations/",
					"originalURL": "/fotoweb/archives/5003-Illustrations/",
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
						"HistoryRollback",
						"ViewConsentSummary",
						"ViewConsentDetails",
						"ManageConsentStatus",
						"SetPosterAsset"
					],
					"pin": null,
					"posterAsset": "/fotoweb/archives/5003-Illustrations/Folder%2019/1%20(2)%20(2).png.info",
					"posterImages": [
						{
							"height": 169,
							"href": "/fotoweb/cache/posters/archives/5003/.s300_169.t64759b0f.xZ4JPNHZS1Qne.jpg",
							"size": 300,
							"square": false,
							"width": 300
						},
						{
							"height": 338,
							"href": "/fotoweb/cache/posters/archives/5003/.s600_338.t64759b0f.xB_zsENuvg-3v.jpg",
							"size": 600,
							"square": false,
							"width": 600
						},
						{
							"height": 113,
							"href": "/fotoweb/cache/posters/archives/5003/.s200_113.t64759b0f.xyeWbcVc8lXbW.jpg",
							"size": 200,
							"square": false,
							"width": 200
						},
						{
							"height": 226,
							"href": "/fotoweb/cache/posters/archives/5003/.s400_226.t64759b0f.xGdRaSthpsrw5.jpg",
							"size": 400,
							"square": false,
							"width": 400
						},
						{
							"height": 50,
							"href": "/fotoweb/cache/posters/archives/5003/.s50_50.t64759b0f.xryqAqs7ydjl6.jpg",
							"size": 50,
							"square": true,
							"width": 50
						},
						{
							"height": 100,
							"href": "/fotoweb/cache/posters/archives/5003/.s100_100.t64759b0f.xMMZddvr1Pymn.jpg",
							"size": 100,
							"square": true,
							"width": 100
						}
					],
					"propertyValidations": [
						{
							"max": 507,
							"min": 1,
							"name": "childUrlFragment",
							"regex": "^[a-z0-9\\-]+$"
						}
					],
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
					"reorder": null,
					"searchQuery": "((fn:\".gif\") OR (fn:\".jpg\") OR (fn:\".jpeg\") OR (fn:\".png\") OR (fn:\"*.svg\")) AND (NOT (25:\"notforweb\")) AND (fn:\"Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp\")",
					"searchString": "((fn:.gif|fn:.jpg|fn:.jpeg|fn:.png|fn:*.svg)AND NOT(25:notforweb))AND(fn:Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
					"searchURL": "/fotoweb/archives/5003-Illustrations/{?q}",
					"smartFolderHeader": "SmartFolders",
					"taxonomies": [],
					"type": "archive",
					"uploadHref": "",
					"urlComponents": []
				},
				{
					"_searchString": "(((FQYFN contains (.gif)) OR (FQYFN contains (.jpg)) OR (FQYFN contains (.jpeg)) OR (FQYFN contains (.png)) OR (FQYFN contains (*.svg))) AND NOT (IPTC025 contains notforweb) AND (FQYFN contains (Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)))",
					"alertHref": "/fotoweb/archives/5004-Video/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
					"alt_orders": [
						{
							"asc": {
								"data": "/fotoweb/archives/5004-Video/;o=+?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5004-Video/;o=+?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "+"
									}
								]
							},
							"desc": {
								"data": "/fotoweb/archives/5004-Video/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"default": true,
								"href": "/fotoweb/archives/5004-Video/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": ""
									}
								]
							},
							"key": "mt",
							"name": "Last Modified"
						},
						{
							"asc": {
								"data": "/fotoweb/archives/5004-Video/;o=fn?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5004-Video/;o=fn?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "fn"
									}
								]
							},
							"desc": {
								"data": "/fotoweb/archives/5004-Video/;o=-fn?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5004-Video/;o=-fn?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "-fn"
									}
								]
							},
							"key": "fn",
							"name": "Filename"
						},
						{
							"asc": {
								"data": "/fotoweb/archives/5004-Video/;o=350?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5004-Video/;o=350?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "350"
									}
								]
							},
							"desc": {
								"data": "/fotoweb/archives/5004-Video/;o=-350?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"href": "/fotoweb/archives/5004-Video/;o=-350?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
								"urlComponents": [
									{
										"key": "o",
										"value": "-350"
									}
								]
							},
							"key": "350",
							"name": "Original date"
						}
					],
					"archived": null,
					"assetCount": 0,
					"canBeArchived": false,
					"canBeDeleted": false,
					"canCopyTo": true,
					"canCreateFolders": false,
					"canHaveChildren": true,
					"canIngestToChildren": false,
					"canMoveTo": true,
					"canSelect": true,
					"canUploadTo": true,
					"clearSearch": {
						"data": "/fotoweb/data/a/5004.cxGb3ygkNfrz4nDV43RgKo9FrI6NnjAangYHp5DPRZ8/",
						"href": "/fotoweb/archives/5004-Video/"
					},
					"color": "#595959",
					"create": [],
					"created": "",
					"data": "/fotoweb/archives/5004-Video/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
					"dataTemplate": "/fotoweb/archives/5004-Video{/path*}/{;o}",
					"deleted": null,
					"description": "",
					"edit": null,
					"hasChildren": true,
					"href": "/fotoweb/archives/5004-Video/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
					"iconCharacter": "",
					"id": "5004",
					"isConsentManagementEnabled": false,
					"isConsentStatusFilterEnabled": false,
					"isFolderNavigationEnabled": false,
					"isLinkCollection": false,
					"isSearchable": true,
					"isSelectable": true,
					"isSmartFolderNavigationEnabled": true,
					"matchingHref": "/fotoweb/archives/5004-Video/",
					"metadataEditor": {
						"href": "/fotoweb/editors/494e7785-3d40-4370-a0ef-69f4f0ef5a8e",
						"name": "Default Metadataset for SaaS"
					},
					"modified": "2023-05-30T07:43:21.434841Z",
					"name": "Video",
					"orderRootHref": "/fotoweb/archives/5004-Video/",
					"originalURL": "/fotoweb/archives/5004-Video/",
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
						"HistoryRollback",
						"ViewConsentSummary",
						"ViewConsentDetails",
						"ManageConsentStatus",
						"SetPosterAsset"
					],
					"pin": null,
					"posterAsset": "/fotoweb/archives/5000-Video/Folder%2019/video_what_is_FotoWare_keyframe%20(2).png.info",
					"posterImages": [
						{
							"height": 169,
							"href": "/fotoweb/cache/posters/archives/5004/.s300_169.t64759b0f.xqMgjd2QsCNMS.jpg",
							"size": 300,
							"square": false,
							"width": 300
						},
						{
							"height": 338,
							"href": "/fotoweb/cache/posters/archives/5004/.s600_338.t64759b0f.xXeYw8--SrZjr.jpg",
							"size": 600,
							"square": false,
							"width": 600
						},
						{
							"height": 113,
							"href": "/fotoweb/cache/posters/archives/5004/.s200_113.t64759b0f.xwvRUb3eVwq5g.jpg",
							"size": 200,
							"square": false,
							"width": 200
						},
						{
							"height": 226,
							"href": "/fotoweb/cache/posters/archives/5004/.s400_226.t64759b0f.xLjutWBxkRFvt.jpg",
							"size": 400,
							"square": false,
							"width": 400
						},
						{
							"height": 50,
							"href": "/fotoweb/cache/posters/archives/5004/.s50_50.t64759b0f.xbifCcOWb8Yfd.jpg",
							"size": 50,
							"square": true,
							"width": 50
						},
						{
							"height": 100,
							"href": "/fotoweb/cache/posters/archives/5004/.s100_100.t64759b0f.xmwEqQnM3xScK.jpg",
							"size": 100,
							"square": true,
							"width": 100
						}
					],
					"propertyValidations": [
						{
							"max": 507,
							"min": 1,
							"name": "childUrlFragment",
							"regex": "^[a-z0-9\\-]+$"
						}
					],
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
					"reorder": null,
					"searchQuery": "((fn:\".gif\") OR (fn:\".jpg\") OR (fn:\".jpeg\") OR (fn:\".png\") OR (fn:\"*.svg\")) AND (NOT (25:\"notforweb\")) AND (fn:\"Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp\")",
					"searchString": "((fn:.gif|fn:.jpg|fn:.jpeg|fn:.png|fn:*.svg)AND NOT(25:notforweb))AND(fn:Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)",
					"searchURL": "/fotoweb/archives/5004-Video/{?q}",
					"smartFolderHeader": "SmartFolders",
					"taxonomies": [],
					"type": "archive",
					"uploadHref": "",
					"urlComponents": []
				}
			],
			"paging": null,
			"reorder": null,
			"searchURL": "/fotoweb/archives/{?q}"
		}),
		contentType: 'application/vnd.fotoware.collectionlist+json; charset=utf-8',
		cookies: [],
		headers: {
			"cache-control": "private, max-age=5",
			"content-type": "application/vnd.fotoware.collectionlist+json; charset=utf-8",
			date: "Tue, 20 Jun 2023 08:28:10 GMT",
			"fotoweb-server": "Product-Version=8.2.1412.0; Level=Invalid;",
			server: "Microsoft-IIS/10.0",
			vary: "Authorization,FWAPIToken,Cookie,Accept,Accept-Encoding,User-Agent",
			"x-powered-by": "FotoWare (https://www.fotoware.com/)",
			"x-processing-time": "0.000",
			"x-requestid": "Vg51VmS1YHqVb3V4tMp7qQ"
		},
		message: 'OK',
		status: 200,
	}
}
