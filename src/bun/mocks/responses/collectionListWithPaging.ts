import type { HttpClient } from '../../../main/resources/lib/fotoware';


export default function mockCollectionListResponseWithPaging(): HttpClient.Response {
	return {
		body: JSON.stringify({
			"data": [
				{
					"name": "All files",
					"description": "",
					"href": "/fotoweb/archives/5000-All-files/?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
					"id": "5000",
					"data": "/fotoweb/archives/5000-All-files/?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
					"dataTemplate": "/fotoweb/archives/5000-All-files{/path*}/{;o}",
					"orderRootHref": "/fotoweb/archives/5000-All-files/",
					"matchingHref": "/fotoweb/archives/5000-All-files/",
					"uploadHref": "",
					"propertyValidations": [
						{
							"name": "childUrlFragment",
							"min": 1,
							"max": 255,
							"regex": "^[a-z0-9\\-]+$"
						}
					],
					"urlComponents": [],
					"type": "archive",
					"created": "",
					"modified": "2024-09-03T01:10:04.862762Z",
					"deleted": null,
					"archived": null,
					"_searchString": "((FQYFN contains (*.gif)) OR (FQYFN contains (*.jpg)) OR (FQYFN contains (*.jpeg)) OR (FQYFN contains (*.png)) OR (FQYFN contains (*.svg)))",
					"metadataEditor": {
						"name": "Archive",
						"href": "/fotoweb/editors/260ef215-1a1c-4218-b5fb-3837eeafa1a0"
					},
					"searchURL": "/fotoweb/archives/5000-All-files/{?q}",
					"originalURL": "/fotoweb/archives/5000-All-files/",
					"clearSearch": {
						"href": "/fotoweb/archives/5000-All-files/",
						"data": "/fotoweb/data/a/5000.59RQqyg49PY9HAMH_xSSZZTnQVDQw2MZZL5uIqabN5o/"
					},
					"searchString": "fn:*.gif|fn:*.jpg|fn:*.jpeg|fn:*.png|fn:*.svg",
					"searchQuery": "(fn:\"*.gif\") OR (fn:\"*.jpg\") OR (fn:\"*.jpeg\") OR (fn:\"*.png\") OR (fn:\"*.svg\")",
					"alertHref": "/fotoweb/archives/5000-All-files/?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
					"alt_orders": [
						{
							"name": "Last Modified",
							"key": "mt",
							"asc": {
								"href": "/fotoweb/archives/5000-All-files/;o=+?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5000-All-files/;o=+?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"urlComponents": [
									{
										"key": "o",
										"value": "+"
									}
								]
							},
							"desc": {
								"href": "/fotoweb/archives/5000-All-files/?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5000-All-files/?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"default": true,
								"urlComponents": [
									{
										"key": "o",
										"value": ""
									}
								]
							}
						},
						{
							"name": "Filename",
							"key": "fn",
							"asc": {
								"href": "/fotoweb/archives/5000-All-files/;o=fn?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5000-All-files/;o=fn?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"urlComponents": [
									{
										"key": "o",
										"value": "fn"
									}
								]
							},
							"desc": {
								"href": "/fotoweb/archives/5000-All-files/;o=-fn?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5000-All-files/;o=-fn?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"urlComponents": [
									{
										"key": "o",
										"value": "-fn"
									}
								]
							}
						},
						{
							"name": "Original date",
							"key": "350",
							"asc": {
								"href": "/fotoweb/archives/5000-All-files/;o=350?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5000-All-files/;o=350?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"urlComponents": [
									{
										"key": "o",
										"value": "350"
									}
								]
							},
							"desc": {
								"href": "/fotoweb/archives/5000-All-files/;o=-350?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5000-All-files/;o=-350?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"urlComponents": [
									{
										"key": "o",
										"value": "-350"
									}
								]
							}
						}
					],
					"taxonomies": [],
					"canHaveChildren": true,
					"isSearchable": true,
					"isSelectable": true,
					"isLinkCollection": false,
					"hasChildren": true,
					"canCopyTo": true,
					"canMoveTo": true,
					"canUploadTo": true,
					"canCreateFolders": true,
					"canIngestToChildren": true,
					"canBeDeleted": false,
					"canBeArchived": false,
					"isFolderNavigationEnabled": false,
					"isSmartFolderNavigationEnabled": true,
					"canSelect": true,
					"isConsentManagementEnabled": false,
					"isConsentStatusFilterEnabled": false,
					"create": [],
					"isVersioningEnabled": true,
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
						"SetPosterAsset"
					],
					"smartFolderHeader": "SmartFolders",
					"posterImages": [
						{
							"size": 300,
							"width": 300,
							"height": 169,
							"href": "/fotoweb/cache/posters/archives/5000/.s300_169.t66d653e2.xP3pgXzL715Xk.jpg",
							"square": false
						},
						{
							"size": 600,
							"width": 600,
							"height": 338,
							"href": "/fotoweb/cache/posters/archives/5000/.s600_338.t66d653e2.xVzmyVPN9jCh7.jpg",
							"square": false
						},
						{
							"size": 200,
							"width": 200,
							"height": 113,
							"href": "/fotoweb/cache/posters/archives/5000/.s200_113.t66d653e2.xP_qXbx8ly1Sg.jpg",
							"square": false
						},
						{
							"size": 400,
							"width": 400,
							"height": 226,
							"href": "/fotoweb/cache/posters/archives/5000/.s400_226.t66d653e2.xWgxD6Rfn8qrE.jpg",
							"square": false
						},
						{
							"size": 50,
							"width": 50,
							"height": 50,
							"href": "/fotoweb/cache/posters/archives/5000/.s50_50.t66d653e2.x1zWaIR3jbW0f.jpg",
							"square": true
						},
						{
							"size": 100,
							"width": 100,
							"height": 100,
							"href": "/fotoweb/cache/posters/archives/5000/.s100_100.t66d653e2.xhVMn2WHlEUql.jpg",
							"square": true
						}
					],
					"posterAsset": "/fotoweb/archives/5000-All-files/Folder%2019/DAM%20Dictionary%20-%20DAM.png.info",
					"pin": null,
					"assetCount": 58,
					"props": {
						"owner": null,
						"shares": {
							"enabled": false
						},
						"comments": {
							"enabled": false
						},
						"annotations": {
							"enabled": false
						},
						"tags": []
					},
					"iconCharacter": "",
					"color": "#595959",
					"reorder": null,
					"edit": null
				},
				{
					"name": "Photos",
					"description": "",
					"href": "/fotoweb/archives/5002-Photos/?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
					"id": "5002",
					"data": "/fotoweb/archives/5002-Photos/?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
					"dataTemplate": "/fotoweb/archives/5002-Photos{/path*}/{;o}",
					"orderRootHref": "/fotoweb/archives/5002-Photos/",
					"matchingHref": "/fotoweb/archives/5002-Photos/",
					"uploadHref": "",
					"propertyValidations": [
						{
							"name": "childUrlFragment",
							"min": 1,
							"max": 255,
							"regex": "^[a-z0-9\\-]+$"
						}
					],
					"urlComponents": [],
					"type": "archive",
					"created": "",
					"modified": "2024-09-03T01:10:04.862762Z",
					"deleted": null,
					"archived": null,
					"_searchString": "((FQYFN contains (*.gif)) OR (FQYFN contains (*.jpg)) OR (FQYFN contains (*.jpeg)) OR (FQYFN contains (*.png)) OR (FQYFN contains (*.svg)))",
					"metadataEditor": {
						"name": "Default Metadataset for SaaS",
						"href": "/fotoweb/editors/494e7785-3d40-4370-a0ef-69f4f0ef5a8e"
					},
					"searchURL": "/fotoweb/archives/5002-Photos/{?q}",
					"originalURL": "/fotoweb/archives/5002-Photos/",
					"clearSearch": {
						"href": "/fotoweb/archives/5002-Photos/",
						"data": "/fotoweb/data/a/5002.MsGLhyYfbBUKkRM_L3uIdEmgoi8RzXm-bsy4-H-sCzw/"
					},
					"searchString": "fn:*.gif|fn:*.jpg|fn:*.jpeg|fn:*.png|fn:*.svg",
					"searchQuery": "(fn:\"*.gif\") OR (fn:\"*.jpg\") OR (fn:\"*.jpeg\") OR (fn:\"*.png\") OR (fn:\"*.svg\")",
					"alertHref": "/fotoweb/archives/5002-Photos/?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
					"alt_orders": [
						{
							"name": "Last Modified",
							"key": "mt",
							"asc": {
								"href": "/fotoweb/archives/5002-Photos/;o=+?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5002-Photos/;o=+?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"urlComponents": [
									{
										"key": "o",
										"value": "+"
									}
								]
							},
							"desc": {
								"href": "/fotoweb/archives/5002-Photos/?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5002-Photos/?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"default": true,
								"urlComponents": [
									{
										"key": "o",
										"value": ""
									}
								]
							}
						},
						{
							"name": "Filename",
							"key": "fn",
							"asc": {
								"href": "/fotoweb/archives/5002-Photos/;o=fn?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5002-Photos/;o=fn?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"urlComponents": [
									{
										"key": "o",
										"value": "fn"
									}
								]
							},
							"desc": {
								"href": "/fotoweb/archives/5002-Photos/;o=-fn?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5002-Photos/;o=-fn?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"urlComponents": [
									{
										"key": "o",
										"value": "-fn"
									}
								]
							}
						},
						{
							"name": "Original date",
							"key": "350",
							"asc": {
								"href": "/fotoweb/archives/5002-Photos/;o=350?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5002-Photos/;o=350?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"urlComponents": [
									{
										"key": "o",
										"value": "350"
									}
								]
							},
							"desc": {
								"href": "/fotoweb/archives/5002-Photos/;o=-350?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5002-Photos/;o=-350?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"urlComponents": [
									{
										"key": "o",
										"value": "-350"
									}
								]
							}
						}
					],
					"taxonomies": [],
					"canHaveChildren": true,
					"isSearchable": true,
					"isSelectable": true,
					"isLinkCollection": false,
					"hasChildren": true,
					"canCopyTo": true,
					"canMoveTo": true,
					"canUploadTo": true,
					"canCreateFolders": false,
					"canIngestToChildren": false,
					"canBeDeleted": false,
					"canBeArchived": false,
					"isFolderNavigationEnabled": false,
					"isSmartFolderNavigationEnabled": true,
					"canSelect": true,
					"isConsentManagementEnabled": false,
					"isConsentStatusFilterEnabled": false,
					"create": [],
					"isVersioningEnabled": true,
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
						"SetPosterAsset"
					],
					"smartFolderHeader": "SmartFolders",
					"posterImages": [
						{
							"size": 300,
							"width": 300,
							"height": 169,
							"href": "/fotoweb/cache/posters/archives/5002/.s300_169.t66d653e2.xR9MbLzVJcosY.jpg",
							"square": false
						},
						{
							"size": 600,
							"width": 600,
							"height": 338,
							"href": "/fotoweb/cache/posters/archives/5002/.s600_338.t66d653e2.x_cnebfelx6c0.jpg",
							"square": false
						},
						{
							"size": 200,
							"width": 200,
							"height": 113,
							"href": "/fotoweb/cache/posters/archives/5002/.s200_113.t66d653e2.x9jUbVH1V7JDm.jpg",
							"square": false
						},
						{
							"size": 400,
							"width": 400,
							"height": 226,
							"href": "/fotoweb/cache/posters/archives/5002/.s400_226.t66d653e2.x1JdzbJBQWW18.jpg",
							"square": false
						},
						{
							"size": 50,
							"width": 50,
							"height": 50,
							"href": "/fotoweb/cache/posters/archives/5002/.s50_50.t66d653e2.xHwbf_WKrLCbc.jpg",
							"square": true
						},
						{
							"size": 100,
							"width": 100,
							"height": 100,
							"href": "/fotoweb/cache/posters/archives/5002/.s100_100.t66d653e2.xB1V5eBkZE-7_.jpg",
							"square": true
						}
					],
					"posterAsset": "/fotoweb/archives/5002-Photos/Folder%2019/actionvance-nLGX7U1dnZM-unsplash.jpg.info",
					"pin": null,
					"assetCount": 20,
					"props": {
						"owner": null,
						"shares": {
							"enabled": false
						},
						"comments": {
							"enabled": false
						},
						"annotations": {
							"enabled": true,
							"count": 0,
							"href": "/fotoweb/archives/5002-Photos/.annotations/"
						},
						"tags": []
					},
					"iconCharacter": "",
					"color": "#595959",
					"reorder": null,
					"edit": null
				},
				{
					"name": "Illustrations",
					"description": "",
					"href": "/fotoweb/archives/5003-Illustrations/?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
					"id": "5003",
					"data": "/fotoweb/archives/5003-Illustrations/?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
					"dataTemplate": "/fotoweb/archives/5003-Illustrations{/path*}/{;o}",
					"orderRootHref": "/fotoweb/archives/5003-Illustrations/",
					"matchingHref": "/fotoweb/archives/5003-Illustrations/",
					"uploadHref": "",
					"propertyValidations": [
						{
							"name": "childUrlFragment",
							"min": 1,
							"max": 255,
							"regex": "^[a-z0-9\\-]+$"
						}
					],
					"urlComponents": [],
					"type": "archive",
					"created": "",
					"modified": "2024-09-03T01:10:04.862762Z",
					"deleted": null,
					"archived": null,
					"_searchString": "((FQYFN contains (*.gif)) OR (FQYFN contains (*.jpg)) OR (FQYFN contains (*.jpeg)) OR (FQYFN contains (*.png)) OR (FQYFN contains (*.svg)))",
					"metadataEditor": {
						"name": "Default Metadataset for SaaS",
						"href": "/fotoweb/editors/494e7785-3d40-4370-a0ef-69f4f0ef5a8e"
					},
					"searchURL": "/fotoweb/archives/5003-Illustrations/{?q}",
					"originalURL": "/fotoweb/archives/5003-Illustrations/",
					"clearSearch": {
						"href": "/fotoweb/archives/5003-Illustrations/",
						"data": "/fotoweb/data/a/5003.SPIQePqauYB-9xrN2HTaMpWkST8NGIuTQ8tx9PDbcSU/"
					},
					"searchString": "fn:*.gif|fn:*.jpg|fn:*.jpeg|fn:*.png|fn:*.svg",
					"searchQuery": "(fn:\"*.gif\") OR (fn:\"*.jpg\") OR (fn:\"*.jpeg\") OR (fn:\"*.png\") OR (fn:\"*.svg\")",
					"alertHref": "/fotoweb/archives/5003-Illustrations/?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
					"alt_orders": [
						{
							"name": "Last Modified",
							"key": "mt",
							"asc": {
								"href": "/fotoweb/archives/5003-Illustrations/;o=+?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5003-Illustrations/;o=+?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"urlComponents": [
									{
										"key": "o",
										"value": "+"
									}
								]
							},
							"desc": {
								"href": "/fotoweb/archives/5003-Illustrations/?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5003-Illustrations/?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"default": true,
								"urlComponents": [
									{
										"key": "o",
										"value": ""
									}
								]
							}
						},
						{
							"name": "Filename",
							"key": "fn",
							"asc": {
								"href": "/fotoweb/archives/5003-Illustrations/;o=fn?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5003-Illustrations/;o=fn?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"urlComponents": [
									{
										"key": "o",
										"value": "fn"
									}
								]
							},
							"desc": {
								"href": "/fotoweb/archives/5003-Illustrations/;o=-fn?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5003-Illustrations/;o=-fn?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"urlComponents": [
									{
										"key": "o",
										"value": "-fn"
									}
								]
							}
						},
						{
							"name": "Original date",
							"key": "350",
							"asc": {
								"href": "/fotoweb/archives/5003-Illustrations/;o=350?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5003-Illustrations/;o=350?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"urlComponents": [
									{
										"key": "o",
										"value": "350"
									}
								]
							},
							"desc": {
								"href": "/fotoweb/archives/5003-Illustrations/;o=-350?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5003-Illustrations/;o=-350?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"urlComponents": [
									{
										"key": "o",
										"value": "-350"
									}
								]
							}
						}
					],
					"taxonomies": [],
					"canHaveChildren": true,
					"isSearchable": true,
					"isSelectable": true,
					"isLinkCollection": false,
					"hasChildren": true,
					"canCopyTo": true,
					"canMoveTo": true,
					"canUploadTo": true,
					"canCreateFolders": false,
					"canIngestToChildren": false,
					"canBeDeleted": false,
					"canBeArchived": false,
					"isFolderNavigationEnabled": false,
					"isSmartFolderNavigationEnabled": true,
					"canSelect": true,
					"isConsentManagementEnabled": false,
					"isConsentStatusFilterEnabled": false,
					"create": [],
					"isVersioningEnabled": true,
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
						"SetPosterAsset"
					],
					"smartFolderHeader": "SmartFolders",
					"posterImages": [
						{
							"size": 300,
							"width": 300,
							"height": 169,
							"href": "/fotoweb/cache/posters/archives/5003/.s300_169.t66d653e2.xIX1lnog42CY4.jpg",
							"square": false
						},
						{
							"size": 600,
							"width": 600,
							"height": 338,
							"href": "/fotoweb/cache/posters/archives/5003/.s600_338.t66d653e2.xu569ATZPQSul.jpg",
							"square": false
						},
						{
							"size": 200,
							"width": 200,
							"height": 113,
							"href": "/fotoweb/cache/posters/archives/5003/.s200_113.t66d653e2.xnP-ZnF8whyQT.jpg",
							"square": false
						},
						{
							"size": 400,
							"width": 400,
							"height": 226,
							"href": "/fotoweb/cache/posters/archives/5003/.s400_226.t66d653e2.x2hxxyAMcl3mL.jpg",
							"square": false
						},
						{
							"size": 50,
							"width": 50,
							"height": 50,
							"href": "/fotoweb/cache/posters/archives/5003/.s50_50.t66d653e2.xyDa2R45RBgyR.jpg",
							"square": true
						},
						{
							"size": 100,
							"width": 100,
							"height": 100,
							"href": "/fotoweb/cache/posters/archives/5003/.s100_100.t66d653e2.xxkgvFEvD8k4f.jpg",
							"square": true
						}
					],
					"posterAsset": "/fotoweb/archives/5003-Illustrations/Folder%2019/1%20(2)%20(2).png.info",
					"pin": null,
					"assetCount": 9,
					"props": {
						"owner": null,
						"shares": {
							"enabled": false
						},
						"comments": {
							"enabled": false
						},
						"annotations": {
							"enabled": false
						},
						"tags": []
					},
					"iconCharacter": "",
					"color": "#595959",
					"reorder": null,
					"edit": null
				},
				{
					"name": "Video",
					"description": "",
					"href": "/fotoweb/archives/5004-Video/?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
					"id": "5004",
					"data": "/fotoweb/archives/5004-Video/?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
					"dataTemplate": "/fotoweb/archives/5004-Video{/path*}/{;o}",
					"orderRootHref": "/fotoweb/archives/5004-Video/",
					"matchingHref": "/fotoweb/archives/5004-Video/",
					"uploadHref": "",
					"propertyValidations": [
						{
							"name": "childUrlFragment",
							"min": 1,
							"max": 255,
							"regex": "^[a-z0-9\\-]+$"
						}
					],
					"urlComponents": [],
					"type": "archive",
					"created": "",
					"modified": "2024-09-03T01:10:04.862762Z",
					"deleted": null,
					"archived": null,
					"_searchString": "((FQYFN contains (*.gif)) OR (FQYFN contains (*.jpg)) OR (FQYFN contains (*.jpeg)) OR (FQYFN contains (*.png)) OR (FQYFN contains (*.svg)))",
					"metadataEditor": {
						"name": "Default Metadataset for SaaS",
						"href": "/fotoweb/editors/494e7785-3d40-4370-a0ef-69f4f0ef5a8e"
					},
					"searchURL": "/fotoweb/archives/5004-Video/{?q}",
					"originalURL": "/fotoweb/archives/5004-Video/",
					"clearSearch": {
						"href": "/fotoweb/archives/5004-Video/",
						"data": "/fotoweb/data/a/5004.cxGb3ygkNfrz4nDV43RgKo9FrI6NnjAangYHp5DPRZ8/"
					},
					"searchString": "fn:*.gif|fn:*.jpg|fn:*.jpeg|fn:*.png|fn:*.svg",
					"searchQuery": "(fn:\"*.gif\") OR (fn:\"*.jpg\") OR (fn:\"*.jpeg\") OR (fn:\"*.png\") OR (fn:\"*.svg\")",
					"alertHref": "/fotoweb/archives/5004-Video/?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
					"alt_orders": [
						{
							"name": "Last Modified",
							"key": "mt",
							"asc": {
								"href": "/fotoweb/archives/5004-Video/;o=+?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5004-Video/;o=+?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"urlComponents": [
									{
										"key": "o",
										"value": "+"
									}
								]
							},
							"desc": {
								"href": "/fotoweb/archives/5004-Video/?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5004-Video/?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"default": true,
								"urlComponents": [
									{
										"key": "o",
										"value": ""
									}
								]
							}
						},
						{
							"name": "Filename",
							"key": "fn",
							"asc": {
								"href": "/fotoweb/archives/5004-Video/;o=fn?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5004-Video/;o=fn?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"urlComponents": [
									{
										"key": "o",
										"value": "fn"
									}
								]
							},
							"desc": {
								"href": "/fotoweb/archives/5004-Video/;o=-fn?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5004-Video/;o=-fn?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"urlComponents": [
									{
										"key": "o",
										"value": "-fn"
									}
								]
							}
						},
						{
							"name": "Original date",
							"key": "350",
							"asc": {
								"href": "/fotoweb/archives/5004-Video/;o=350?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5004-Video/;o=350?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"urlComponents": [
									{
										"key": "o",
										"value": "350"
									}
								]
							},
							"desc": {
								"href": "/fotoweb/archives/5004-Video/;o=-350?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"data": "/fotoweb/archives/5004-Video/;o=-350?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg",
								"urlComponents": [
									{
										"key": "o",
										"value": "-350"
									}
								]
							}
						}
					],
					"taxonomies": [],
					"canHaveChildren": true,
					"isSearchable": true,
					"isSelectable": true,
					"isLinkCollection": false,
					"hasChildren": true,
					"canCopyTo": true,
					"canMoveTo": true,
					"canUploadTo": true,
					"canCreateFolders": false,
					"canIngestToChildren": false,
					"canBeDeleted": false,
					"canBeArchived": false,
					"isFolderNavigationEnabled": false,
					"isSmartFolderNavigationEnabled": true,
					"canSelect": true,
					"isConsentManagementEnabled": false,
					"isConsentStatusFilterEnabled": false,
					"create": [],
					"isVersioningEnabled": true,
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
						"SetPosterAsset"
					],
					"smartFolderHeader": "SmartFolders",
					"posterImages": [
						{
							"size": 300,
							"width": 300,
							"height": 169,
							"href": "/fotoweb/cache/posters/archives/5004/.s300_169.t66d653e2.x6qVHnlyQD5be.jpg",
							"square": false
						},
						{
							"size": 600,
							"width": 600,
							"height": 338,
							"href": "/fotoweb/cache/posters/archives/5004/.s600_338.t66d653e2.xCHc15jTchPVF.jpg",
							"square": false
						},
						{
							"size": 200,
							"width": 200,
							"height": 113,
							"href": "/fotoweb/cache/posters/archives/5004/.s200_113.t66d653e2.xS2rxbMg3liRa.jpg",
							"square": false
						},
						{
							"size": 400,
							"width": 400,
							"height": 226,
							"href": "/fotoweb/cache/posters/archives/5004/.s400_226.t66d653e2.xTGqsX4IRph18.jpg",
							"square": false
						},
						{
							"size": 50,
							"width": 50,
							"height": 50,
							"href": "/fotoweb/cache/posters/archives/5004/.s50_50.t66d653e2.xwCC2-LUoQE4F.jpg",
							"square": true
						},
						{
							"size": 100,
							"width": 100,
							"height": 100,
							"href": "/fotoweb/cache/posters/archives/5004/.s100_100.t66d653e2.xEmoQjhSL0El5.jpg",
							"square": true
						}
					],
					"posterAsset": "/fotoweb/archives/5000-Video/Folder%2019/video_what_is_FotoWare_keyframe%20(2).png.info",
					"pin": null,
					"assetCount": 1,
					"props": {
						"owner": null,
						"shares": {
							"enabled": false
						},
						"comments": {
							"enabled": false
						},
						"annotations": {
							"enabled": false
						},
						"tags": []
					},
					"iconCharacter": "",
					"color": "#595959",
					"reorder": null,
					"edit": null
				}
			],
			"paging": {
				"next": "",
				"prev": "",
				"first": "/fotoweb/archives/",
				"last": "",
				"index": null,
				"totalPages": null,
				"count": null
			},
			"reorder": null,
			"add": null,
			"searchURL": "/fotoweb/archives/{?q}",
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
