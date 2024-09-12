import type { HttpClient } from '../../../src/main/resources/lib/fotoware';


export default function mockFullApiDescriptorResponse(
// {

// }: {

// } = {}
): HttpClient.Response {
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
}
