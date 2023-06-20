import type { sanitize } from '@enonic-types/lib-common';
import type {
	// Content,
	createMedia,
	delete as deleteContent,
	exists,
	get,
	modify,
	query
} from '@enonic-types/lib-content';
import type { run } from '@enonic-types/lib-context';
import type {
	// ByteSource,
	readText
} from '@enonic-types/lib-io';
import type { executeFunction } from '@enonic-types/lib-task';
import type { Request } from '/lib/xp/Request';
import type { ReadStream } from 'fs';
import type {
	// CollectionList,
	HttpClient,
	MediaContent
} from '/lib/fotoware';


import {
	// forceArray,
	toStr
} from '@enonic/js-utils';
import Log from '@enonic/mock-xp/dist/Log';
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	jest,
	test
} from '@jest/globals';
import {
	createReadStream,
	statSync
} from 'fs';
import {join} from 'path';
import {JavaBridge} from '@enonic/mock-xp';


//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const remoteAddressLegal1 = '192.168.1.1';
const remoteAddressLegal2 = '172.16.0.0';
// const remoteAddressIllegal = '10.0.0.1';
const accessToken = 'accessToken';
const taskId = 'taskId';

//──────────────────────────────────────────────────────────────────────────────
// Globals
//──────────────────────────────────────────────────────────────────────────────
// @ts-ignore TS2339: Property 'app' does not exist on type 'typeof globalThis'.
global.app.config = {
	'config.filename': 'com.enonic.app.fotoware.cfg',
	'imports.MyImportName.path': 'EnonicWare',
	'imports.MyImportName.project': 'fotoware',
	'imports.MyImportName.query': '(fn:.gif|fn:.jpg|fn:.jpeg|fn:.png|fn:*.svg)AND NOT(25:notforweb)',
	'imports.MyImportName.site': 'enonic',
	'service.pid': 'com.enonic.app.fotoware',
	'sites.enonic.clientId': 'clientId',
	'sites.enonic.clientSecret': 'clientSecret',
	'sites.enonic.allowWebhookFromIp': `${remoteAddressLegal1},${remoteAddressLegal2}`,
	'sites.enonic.url': 'https://enonic.fotoware.cloud'
};

// @ts-ignore TS2339: Property 'log' does not exist on type 'typeof globalThis'.
global.log = Log.createLogger({
	loglevel: 'debug'
	// loglevel: 'info'
	// loglevel: 'warn'
	// loglevel: 'error'
	// loglevel: 'silent'
});

//──────────────────────────────────────────────────────────────────────────────
// Mock XP
//──────────────────────────────────────────────────────────────────────────────
const javaBridge = new JavaBridge({
	app: {
		config: {},
		name: 'com.enonic.app.fotoware',
		version: '0.0.1-SNAPSHOT'
	},
	log//: global.log
});
javaBridge.repo.create({
	id: 'com.enonic.cms.explorer'
});
const connection = javaBridge.connect({
	repoId: 'com.enonic.cms.explorer',
	branch: 'master'
});
connection.create({
	_name: 'content'
});
connection.create({
	_name: 'EnonicWare',
	_parentPath: '/content'
});

const xpPathToId: Record<string, string> = {};

//──────────────────────────────────────────────────────────────────────────────
// Mocks
//──────────────────────────────────────────────────────────────────────────────
jest.mock('/lib/galimatias', () => ({
	// @ts-ignore
	URL: jest.fn().mockImplementation((_url: string) => ({
		getHost: jest.fn().mockReturnValue('enonic.fotoware.cloud')
	}))
}), { virtual: true });

function mockLicense({expired}: {expired: boolean}) {
	jest.doMock('/lib/license', () => ({
		validateLicense: jest.fn().mockReturnValue({
			expired,
			issuedTo: 'issuedTo'
		})
	}), { virtual: true });
}


jest.mock('/lib/text-encoding', () => ({
	md5: jest.fn().mockReturnValue('md5Sum')
}), { virtual: true });


jest.mock('/lib/xp/content', () => ({
	// @ts-ignore
	createMedia: jest.fn<typeof createMedia>(({
		name,
		parentPath,
		mimeType,
		focalX = 0.5,
		focalY = 0.5,
		data
	}) => {
		log.info('name', name, 'parentPath', parentPath, 'mimeType', mimeType, 'focalX', focalX, 'focalY', focalY);
		//log.info('data', data); // binary stream
		if (name === 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp') {
			const size = statSync(join(__dirname, 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp')).size;
			const mimeType = 'image/webp';
			const createdNode = connection.create({
				_childOrder: 'modifiedtime DESC',
				//_indexConfig // Not important for this test
				_inheritsPermissions: true,
				_name: name,
				_parentPath: `/content${parentPath}`,
				// _permissions // Not important for this test
				_nodeType: 'content',
				attachment: {
					binary: name,
					label: 'source',
					mimeType,
					name: name,
					size,
					sha512: 'sha512'
				},
				creator: 'user:system:cwe',
				createdTime: '2023-05-26T12:40:03.693253Z',
				data: {
					artist: '',
					caption: '',
					copyright: '',
					media: {
						attachment: name,
						focalPoint: {
							x: focalX,
							y: focalY
						}
					},
					tags: ''
				},
				displayName: 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg',
				modifier: 'user:system:cwe',
				modifiedTime: '2023-05-26T12:40:03.693253Z',
				owner: 'user:system:cwe',
				type: 'media:image',
				valid: true,
				x: {
					media: {
						imageInfo: {
							imageHeight: 600,
							imageWidth: 480,
							contentType: mimeType,
							pixelSize: 480*600,
							byteSize: size
						}
					}
				}
			});
			log.info('createdNode:%s', createdNode);
			xpPathToId[`/content${parentPath}/${name}`] = createdNode._id;
			log.info('xpPathToId:%s', xpPathToId);
			return createdNode;
		}
		throw new Error(`Unmocked createMedia params:${toStr({name, parentPath, mimeType, focalX, focalY, data})}`);
	}),
	delete: jest.fn<typeof deleteContent>(({
		key
	}) => {
		const id = xpPathToId[key];
		if (id) {
			delete xpPathToId[key];
		}
		connection.delete(id || key);
		return true; // TODO Hardcode (I'm using Node layer to simulate Content Layer)
	}),
	exists: jest.fn<typeof exists>(({key}) => {
		const id = xpPathToId[key];
		if (id) {
			const existsRes = connection.exists(id);
			log.error('existsRes:%s', existsRes);
			return !!existsRes;
		}
		return false;
	}),
	// @ts-ignore
	get: jest.fn<typeof get>(({
		key,
		versionId
	}) => {
		// log.info('key', key, 'versionId', versionId);
		if (key === '/EnonicWare/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp') {
			const id = xpPathToId[key];
			if (id) {
				return connection.get(id) as unknown as MediaContent;
			}
			return null;
		}
		throw new Error(`Unmocked get params:${toStr({key, versionId})}`);
	}),
	// @ts-ignore
	modify: jest.fn<typeof modify>(({
		key,
		editor,
		// requireValid
	}) => {
		// TODO: I'm using Node layer to simulate Content Layer. I should use mock-xp to simulate Content Layer.
		return connection.modify({
			key,
			// @ts-ignore
			editor,
			// requireValid
		}) //as unknown as Content;
	}),
	// @ts-ignore
	query: jest.fn<typeof query>((params) => {
		// log.info('query params', params);
		const {
			aggregations: _aggregations,
			contentTypes: _contentTypes,
			count: _count,
			filters = {},
			query,
			sort: _sort,
			start: _start,
		} = params;
		if (query === "_path LIKE '/content/EnonicWare/*'") {
			const {
				// @ts-ignore
				boolean: {
					must
				}
			} = filters // forceArray(filters)[0];
			// log.info('must', must);
			const {
				hasValue: {
					field: field,
					values: values
				}
			} = must[0]
			if (
				field === 'data.media.attachment'
				&& values[0] === 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp'
			) {
				return {
					count: 0,
					hits: [],
					total: 0
				};
			} else {
			 throw new Error(`Unmocked hasValue query params:${toStr(params)}`);
			}
		} else {
			throw new Error(`Unmocked query params:${toStr(params)}`);
		}
	})
}), { virtual: true });


jest.mock('/lib/xp/context', () => ({
	run: jest.fn<typeof run>((_context, callback) => callback())
}), { virtual: true });


jest.mock('/lib/xp/io', () => ({
	readText: jest.fn<typeof readText>((stream) => {
		const readerStream = stream as unknown as ReadStream;
		readerStream.setEncoding('utf8');
		let data = '';
		readerStream.on('data', function(chunk){
			data += chunk;
			// console.log('data event: ' + data);
		});
		return data;
	})
}), { virtual: true });


jest.mock('/lib/xp/task', () => ({
	executeFunction: jest.fn<typeof executeFunction>(({
		description: _description,
		func
	}) => (() => {
		func();
		return taskId;
	})())
}), { virtual: true });

jest.mock('/lib/http-client', () => ({
	request: jest.fn((request: HttpClient.Request) => {
		const {url} = request;
		if (url === 'https://enonic.fotoware.cloud/fotoweb/oauth2/token') {
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
		} else if (url === 'https://enonic.fotoware.cloud/fotoweb/me/') {
			return {
				body: JSON.stringify({
					"actionCropPresets": "/fotoweb/me/action-crop-presets/",
					"actions": "/fotoweb/me/actions/",
					"albums": "/fotoweb/me/albums/",
					"albums_archived": "/fotoweb/me/albums/archived/",
					"albums_contribute": "/fotoweb/me/albums/contribute/",
					"albums_deleted": "/fotoweb/me/albums/deleted/",
					"albums_own": "/fotoweb/me/albums/mine/",
					"albums_shared": "/fotoweb/me/albums/shared-with-me/",
					"alerts": "/fotoweb/me/alerts/",
					"apiFeatureLevels": {
						"consentFormsApiFeatureLevel": 30,
						"downloadSettingsApiFeatureLevel": 20
					},
					"appearance": {
						"customCss": "/fotoweb/appearance/css",
						"favicon": "/fotoweb/appearance/logos/favicon",
						"homepageImage": "/fotoweb/appearance/logos/homepage",
						"loginLogo": "/fotoweb/appearance/logos/login",
						"mainLogo": "/fotoweb/appearance/logos/main",
						"mobileLogo": "/fotoweb/appearance/logos/mobile"
					},
					"archives": "/fotoweb/me/archives/",
					"background_tasks": "/fotoweb/me/background-tasks/",
					"bookmarks": "/fotoweb/me/bookmarks/",
					"copy_to": "/fotoweb/me/copy-to/",
					"cropDownloadPresets": "/fotoweb/me/crop-download-presets/",
					"customizations": {},
					"destinations": "/fotoweb/me/destinations/",
					"fwdt": {
						"osx": {
							"installer": {
								"href": "https://cdn.fotoware.com/fwdt/8.0.869/FotoWeb-Desktop-8.0.869.dmg",
								"version": "8.0.869"
							},
							"minVersion": "8.0.670"
						},
						"services": {
							"crop": "/fotoweb/services/fwdt/crop",
							"edit": "/fotoweb/services/fwdt/edit",
							"open": "/fotoweb/services/fwdt/open"
						},
						"views": {
							"install": "/fotoweb/views/install-fotoweb-desktop"
						},
						"win": {
							"installer": {
								"href": "https://cdn.fotoware.com/fwdt/8.0.868/FotoWebDesktop-8.0.868.8017-Setup.exe",
								"version": "8.0.868"
							},
							"minVersion": "8.0.670"
						}
					},
					"groups": "/fotoweb/groups/",
					"groups_search": "/fotoweb/groups/{?q}",
					"href": "/fotoweb/me",
					"isForcePasswordChangeSet": false,
					"isPreferProInterfaceByDefaultEnabled": false,
					"isVersioningEnabled": true,
					"markers": "/fotoweb/me/markers/",
					"move_to": "/fotoweb/me/move-to/",
					"order": {
						"admin": {
							"approved": "/fotoweb/orders/approved/",
							"history": "/fotoweb/orders/",
							"pending": "/fotoweb/orders/pending/",
							"rejected": "/fotoweb/orders/rejected/",
							"views": {
								"pending": "/fotoweb/views/orders/admin"
							}
						},
						"cart": "/fotoweb/me/cart",
						"config": "/fotoweb/order-config",
						"history": "/fotoweb/me/orders/",
						"views": {
							"cart": "/fotoweb/views/cart",
							"history": "/fotoweb/views/orders",
							"termsAndConditions": null
						}
					},
					"people_search": "/fotoweb/me/people/{?q}",
					"permissions": {
						"albums": {
							"addAssets": true,
							"comment": true,
							"create": true,
							"shareWithGuests": true,
							"showOnHomepage": true
						},
						"allowRetranscode": true,
						"allowShareBookmark": true,
						"allowTaxonomyEditing": true,
						"canConfigureConsentForms": true,
						"canLinkInAdobeCC": true,
						"canManageExports": true,
						"canTogglePositionedMarkers": true,
						"delegateDownload": true,
						"hasAdvancedVideoControls": true,
						"hasAuditPermission": true,
						"hasManageArchivesPermission": true,
						"hasManageServicesPermission": false,
						"hasManageSettingsPermission": true,
						"hasManageWorkflowsPermission": true,
						"moderateComments": true,
						"print": true,
						"shareCropAndDownloadPresets": true,
						"showAdvancedBreadcrumb": false
					},
					"pins": "/fotoweb/me/pins/",
					"searchURL": "/fotoweb/archives/{?q}",
					"security": {
						"allowFileSystemDestinations": false
					},
					"server": "FotoWeb Core",
					"services": {
						"keepalive": {
							"href": "/fotoweb/services/keepalive",
							"interval": 20
						},
						"logout": "/fotoweb/services/logout",
						"navigate_next": "/fotoweb/services/next",
						"navigate_prev": "/fotoweb/services/prev",
						"rendition_request": "/fotoweb/services/renditions",
						"retranscode": "/fotoweb/services/retranscode/",
						"search": "/fotoweb/search/"
					},
					"signups": "/fotoweb/signups/",
					"siteConfigurationHref": "https://enonic.fotoware.cloud:7001/FotoWeb/Default.aspx?site=d85feb5f-a0fb-48d8-96e6-bf9f09b0cc65",
					"taxonomies": "/fotoweb/taxonomies/",
					"tokens": "/fotoweb/me/tokens/",
					"upload": {
						"preserveMetadata": true
					},
					"upload_to": "/fotoweb/me/upload-to/",
					"upload_tokens": "/fotoweb/me/tokens/upload/",
					"user": {
						"email": "administrator@fotoware.com",
						"firstName": "Administrative",
						"fullName": "Administrative User",
						"href": "/fotoweb/users/Administrator",
						"isGuest": false,
						"lastName": "User",
						"userId": 15001,
						"userName": "Administrator"
					},
					"user_preferences": "/fotoweb/me/user-preferences/",
					"userManagement": {
						"adminUser": "/fotoweb/users/builtin/admin",
						"everyoneGroup": "/fotoweb/groups/builtin/everyone",
						"groupList": "/fotoweb/groups/",
						"guestUser": "/fotoweb/users/builtin/guest",
						"registeredUsersGroup": "/fotoweb/groups/builtin/registered",
						"userList": "/fotoweb/users/"
					},
					"users": "/fotoweb/users/",
					"users_search": "/fotoweb/users/{?q}",
					"utc_offset": 60,
					"views": {
						"admin_webhooks": "/fotoweb/views/admin/webhooks",
						"createInvitations": "/fotoweb/views/invitations",
						"edit_taxonomy_item": "/fotoweb/views/admin/taxonomyitem",
						"loggedOut": "/fotoweb/views/login",
						"manage_exports": "/fotoweb/views/exportlist",
						"manageInvitations": "/fotoweb/views/admin/invitations",
						"pro": "/fotoweb/views/pro",
						"selection": "/fotoweb/views/selection-dialog",
						"signUpAdmin": "/fotoweb/views/admin/signups",
						"upload": "/fotoweb/views/upload"
					},
					"widgets": {
						"selection": "/fotoweb/widgets/selection"
					}
				}),
				contentType: 'application/vnd.fotoware.full-api-descriptor+json; charset=utf-8',
				message: 'OK',
				status: 200,
			};
		} else if (url === 'https://enonic.fotoware.cloud/fotoweb/archives/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)') {
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
			};
		} else if (url === 'https://enonic.fotoware.cloud/fotoweb/editors/260ef215-1a1c-4218-b5fb-3837eeafa1a0') {
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
			};
		} else if (url === 'https://enonic.fotoware.cloud/fotoweb/archives/5000-All-files/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)') {
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
							"metadata": {},
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
			};
		} else if (url === 'https://enonic.fotoware.cloud/fotoweb/services/renditions') {
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
			};
		} else if (url === 'https://enonic.fotoware.cloud/fotoweb/me/background-tasks/647f4840-0f44-11ee-968b-000d3abcd05d/0/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp') {
			return {
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
			};
		} else {
			throw new Error(`Unmocked request url:${url} request:${toStr(request)}`);
		}
	})
}), { virtual: true });

jest.mock('/lib/xp/common', () => ({
	sanitize: jest.fn<typeof sanitize>((text) => text)
}), { virtual: true });

//──────────────────────────────────────────────────────────────────────────────
// Test data
//──────────────────────────────────────────────────────────────────────────────
const mockRequest: Request = {
	"method": "POST",
	"scheme": "https",
	"host": "enonic-fotowaretest.enonic.cloud",
	"port": 443,
	"path": "/hooks/asset/ingested",
	"rawPath": "/webapp/com.enonic.app.fotoware/asset/ingested",
	"url": "https://enonic-fotowaretest.enonic.cloud/hooks/asset/ingested",
	"remoteAddress": remoteAddressLegal1,
	"mode": "live",
	"webSocket": false,
	"repositoryId": "com.enonic.cms.default",
	"branch": "draft",
	"contextPath": "/webapp/com.enonic.app.fotoware",
	"contentType": "application/json",
	"body": "{\"pixel-width\": \"1\", \"byline\": \"\", \"description\": \"\", \"tags\": \"\", \"file-size\": \"104448\", \"title\": \"\", \"thumbnail-href\": \"https://enonic.fotoware.cloud/fotoweb/cache/v2/6/w/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjkAMA.gEGcjMnSVw.jpg\", \"created\": \"2023-06-19T12:48:02.129Z\", \"href\": \"https://enonic.fotoware.cloud/fotoweb/archives/5001-My-Uploads/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info\", \"operation-name\": \"upload\", \"data\": {\"revisioncount\": 0, \"archiveHREF\": \"/fotoweb/archives/5001-My-Uploads/\", \"createdBy\": \"system\", \"metadataEditor\": {\"href\": \"/fotoweb/editors/494e7785-3d40-4370-a0ef-69f4f0ef5a8e\", \"name\": \"Default Metadataset for SaaS\"}, \"previewToken\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2Vub25pYy5mb3Rvd2FyZS5jbG91ZC9mb3Rvd2ViLyIsInN1YiI6IjE1MDAzIiwiZXhwIjoxNjg3MTgyNDgyLCJuYmYiOjE2ODcxNzg4ODIsImlhdCI6MTY4NzE3ODg4MiwianRpIjoiYXZMb2tqWFl3ZHhxWm5INFhjQnVPbFdObDJuQllDTlo2SEVYSlNVOXQvTT0iLCJhc3MiOiJhcmNoaXZlcy81MDAxL0ZvbGRlciUyMDE5L1RodXJpbmdpYV9TY2htYWxrYWxkZW5fYXN2MjAyMC0wN19pbWcxOF9TY2hsb3NzX1dpbGhlbG1zYnVyZy5qcGcud2VicCIsInJldiI6IiIsImF1ZCI6InByZXZpZXdfdG9rZW4iLCJzY29wZSI6WyJhcmJpdHJhcnlfcmVuZGl0aW9ucyJdfQ.lnE5GUjBwLrJLDFEzSSOjRGmIP7tmTFcszT4DcxTEg4\", \"modified\": \"2023-06-19T12:47:59Z\", \"href\": \"/fotoweb/archives/5001-My-Uploads/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info\", \"previewcount\": 12, \"linkstance\": \"/fotoweb/archives/5001-My-Uploads/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info\", \"builtinFields\": [{\"field\": \"title\", \"required\": false, \"value\": \"\"}, {\"field\": \"description\", \"required\": false, \"value\": \"\"}, {\"field\": \"tags\", \"required\": false, \"value\": []}, {\"field\": \"status\", \"required\": false, \"value\": \"\"}, {\"field\": \"rating\", \"required\": false, \"value\": \"\"}, {\"field\": \"notes\", \"required\": false, \"value\": \"\"}], \"ancestors\": [{\"href\": \"/fotoweb/archives/5001-My-Uploads/\", \"data\": \"/fotoweb/data/a/5001.BzqdNAA22OtpRkzHeV5Wt4hNF-v1ZV1kk-F_a7myLj0/\", \"name\": \"My Uploads\"}], \"thumbnailFields\": {\"secondLine\": {\"value\": []}, \"additionalFields\": [{\"value\": [], \"views\": [\"desktop\", \"widgets\", \"web\"]}, {\"value\": \"\", \"views\": [\"desktop\", \"widgets\", \"web\"]}], \"firstLine\": {\"value\": \"\"}, \"label\": {\"value\": \"Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp\"}}, \"capabilities\": {\"print\": true, \"printWithAnnotations\": true, \"crop\": true}, \"filename\": \"Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp\", \"modifiedBy\": \"system\", \"filesize\": 104448, \"props\": {\"owner\": null, \"tags\": [], \"comments\": {\"enabled\": false}, \"shares\": {\"enabled\": false}, \"annotations\": {\"enabled\": false}}, \"archiveId\": 5001, \"workflowcount\": 0, \"quickRenditions\": [], \"metadata\": {}, \"previews\": [{\"href\": \"/fotoweb/cache/v2/k/m/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjQA0A.I-3o5WAfmx.jpg\", \"width\": 800, \"height\": 800, \"square\": false, \"size\": 800}, {\"href\": \"/fotoweb/cache/v2/U/N/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjYBMA.tHZzKsyDvG.jpg\", \"width\": 1200, \"height\": 1200, \"square\": false, \"size\": 1200}, {\"href\": \"/fotoweb/cache/v2/3/L/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjgBkA.LwRPUYpHuf.jpg\", \"width\": 1600, \"height\": 1600, \"square\": false, \"size\": 1600}, {\"href\": \"/fotoweb/cache/v2/Y/x/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjwCUA.MfI68uqlKr.jpg\", \"width\": 2400, \"height\": 2400, \"square\": false, \"size\": 2400}, {\"href\": \"/fotoweb/cache/v2/6/w/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjkAMA.gEGcjMnSVw.jpg\", \"width\": 200, \"height\": 200, \"square\": false, \"size\": 200}, {\"href\": \"/fotoweb/cache/v2/c/s/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjWAUA.2qsEMp_k6v.jpg\", \"width\": 300, \"height\": 300, \"square\": false, \"size\": 300}, {\"href\": \"/fotoweb/cache/v2/K/7/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjIAcA.l47oEzcF95.jpg\", \"width\": 400, \"height\": 400, \"square\": false, \"size\": 400}, {\"href\": \"/fotoweb/cache/v2/K/z/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjsAkA.c0pbPwgK1W.jpg\", \"width\": 600, \"height\": 600, \"square\": false, \"size\": 600}, {\"href\": \"/fotoweb/cache/v2/B/t/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjyAQ.9m6sZx4h8G.jpg\", \"width\": 100, \"height\": 100, \"square\": true, \"size\": 100}, {\"href\": \"/fotoweb/cache/v2/9/6/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjkAME.XJmKzB1sOw.jpg\", \"width\": 200, \"height\": 200, \"square\": true, \"size\": 200}, {\"href\": \"/fotoweb/cache/v2/9/6/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjkAME.XJmKzB1sOw.jpg\", \"width\": 200, \"height\": 200, \"square\": true, \"size\": 200}, {\"href\": \"/fotoweb/cache/v2/Q/b/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjIAcE._62AVsBopW.jpg\", \"width\": 400, \"height\": 400, \"square\": true, \"size\": 400}], \"uniqueid\": \"\", \"downloadcount\": 0, \"metadataeditcount\": 0, \"permissions\": [\"View\", \"Preview\", \"Workflow\", \"Download\", \"EditText\", \"CropRotate\", \"Delete\", \"Comping\", \"TrdParty1\", \"TrdParty2\", \"TrdParty3\", \"TrdParty4\", \"Alert\", \"CopyTo\", \"MoveTo\", \"CopyFrom\", \"MoveFrom\", \"Rename\", \"OpenFile\", \"EditFile\", \"CropFile\", \"UploadFile\", \"FwdtPlace\", \"Export\", \"Comment\", \"Annotate\", \"MngVideo\", \"EditSmartFolders\", \"CropAndDownload\"], \"created\": \"1970-01-01T01:12:34Z\", \"renditions\": [{\"profile\": \"2af4914d-6c11-4b15-a7ee-a4260efc8309\", \"display_name\": \"Original File\", \"description\": \"Original File\", \"default\": true, \"height\": 1, \"width\": 1, \"href\": \"/fotoweb/archives/5001-My-Uploads/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info/__renditions/ORIGINAL\", \"original\": true, \"sizeFixed\": false}, {\"profile\": \"1e1887de-5147-4929-8777-2178e555c4ce\", \"display_name\": \"JPG 1024 PX Max 96 DPI\", \"description\": \"Converts image to JPG with max width/height of 1024 pixels and 96 DPI\", \"default\": false, \"height\": 0, \"width\": 0, \"href\": \"/fotoweb/archives/5001-My-Uploads/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info/__renditions/1e1887de-5147-4929-8777-2178e555c4ce\", \"original\": false, \"sizeFixed\": true}, {\"profile\": \"21ad0a7a-4f62-415f-87d9-45cc2214494e\", \"display_name\": \"JPG CMYK\", \"description\": \"Converts images to JPG CMYK with 300dpi\", \"default\": false, \"height\": 1, \"width\": 1, \"href\": \"/fotoweb/archives/5001-My-Uploads/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info/__renditions/21ad0a7a-4f62-415f-87d9-45cc2214494e\", \"original\": false, \"sizeFixed\": false}, {\"profile\": \"79c1d8f7-f5c7-4ff6-bc26-b1153f7e6857\", \"display_name\": \"JPG 1024 PX Width 96 DPI Greyscale\", \"description\": \"Converts image to 1024 max width 96 DPI Greyscale image\", \"default\": false, \"height\": 0, \"width\": 0, \"href\": \"/fotoweb/archives/5001-My-Uploads/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info/__renditions/79c1d8f7-f5c7-4ff6-bc26-b1153f7e6857\", \"original\": false, \"sizeFixed\": true}, {\"profile\": \"c5b1b937-85ba-42f1-8c4a-09808824725b\", \"display_name\": \"JPG sRGB\", \"description\": \"Converts images to JPG sRGB with 300dpi\", \"default\": false, \"height\": 1, \"width\": 1, \"href\": \"/fotoweb/archives/5001-My-Uploads/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info/__renditions/c5b1b937-85ba-42f1-8c4a-09808824725b\", \"original\": false, \"sizeFixed\": false}, {\"profile\": \"d0a672f6-ca68-4b18-a462-3203aced26b9\", \"display_name\": \"JPG 800 PX Max 96 DPI\", \"description\": \"Converts image to JPG with max width/height of 800 pixels and 96 DPI\", \"default\": false, \"height\": 0, \"width\": 0, \"href\": \"/fotoweb/archives/5001-My-Uploads/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info/__renditions/d0a672f6-ca68-4b18-a462-3203aced26b9\", \"original\": false, \"sizeFixed\": true}, {\"profile\": \"ec78a83c-4748-4426-a792-10459166c2f1\", \"display_name\": \"thomas\", \"description\": \"\", \"default\": false, \"height\": 0, \"width\": 0, \"href\": \"/fotoweb/archives/5001-My-Uploads/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info/__renditions/ec78a83c-4748-4426-a792-10459166c2f1\", \"original\": false, \"sizeFixed\": true}], \"pincount\": 0, \"doctype\": \"image\", \"physicalFileId\": \"61d2db5594fb7f7314d5abf3/Folder 19/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp\", \"dropHREF\": \"/fotoweb/archives/5001-My-Uploads/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.info#u=15003&m=U7wQh1jGOudhzIzMTDgXnx_CpfipLqEWJsCzjkJaCVg\", \"attributes\": {\"photoAttributes\": {}, \"imageattributes\": {\"colorspace\": \"rgb\", \"flipmirror\": 0, \"pixelwidth\": 1, \"pixelheight\": 1, \"resolution\": 300.0, \"rotation\": 0.0}}}, \"preview-href\": \"https://enonic.fotoware.cloud/fotoweb/cache/v2/k/m/Folder%2019/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp.iSfhoYvVMf99B6tjQA0A.I-3o5WAfmx.jpg\", \"type\": \"asset\", \"pixel-height\": \"1\", \"id\": \"670bf55e-bb11-46cc-874a-7ecd4a164ccb\"}",
	"params": {},
	"headers": {
		"Accept": "*/*",
		"User-Agent": "FotoWeb/8.1",
		"X-Forwarded-Proto": "https",
		"X-Forwarded-Host": "enonic-fotowaretest.enonic.cloud",
		"Connection": "keep-alive",
		"X-Forwarded-For": remoteAddressLegal1,
		"Host": "enonic-fotowaretest.enonic.cloud",
		"Accept-Encoding": "gzip, deflate",
		"Content-Length": "9534",
		"X-Forwarded-Server": "enonic-fotowaretest.enonic.cloud",
		"Content-Type": "application/json"
	},
	"cookies": {},
	"pathParams": {}
};

//──────────────────────────────────────────────────────────────────────────────
// Tests
//──────────────────────────────────────────────────────────────────────────────
describe('webapp', () => {
	describe('assetIngested', () => {

		beforeEach(() => {
		// 	log.info('beforeEach xpPathToId:%s', xpPathToId);
			jest.resetModules();
		});

		afterEach(() => {
			// log.info('afterEach1 xpPathToId:%s', xpPathToId);
			Object.values(xpPathToId).forEach((id) => {
				connection.delete(id);
			});
			Object.keys(xpPathToId).forEach((path) => {
				delete xpPathToId[path];
			});
			// log.info('afterEach2 xpPathToId:%s', xpPathToId);
		});

		test('creates mediacontent from assetIngested request', () => {
			mockLicense({expired: false});
			import('../../src/main/resources/webapp/assetIngested').then((moduleName) => {
				expect(moduleName.assetIngested(mockRequest)).toStrictEqual({
					body: {},
					contentType: 'application/json;charset=utf-8',
					status: 200
				});
			});
		});

		test('returns 404 when license is expired ', () => {
			mockLicense({expired: true});
			import('../../src/main/resources/webapp/assetIngested').then((moduleName) => {
				expect(moduleName.assetIngested(mockRequest)).toStrictEqual({
					status: 404
				});
			});
		});

	});
});
