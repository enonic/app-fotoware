export const REMOTE_ADDRESS_LEGAL1 = '192.168.1.1';
export const REMOTE_ADDRESS_LEGAL2 = '172.16.0.0';

export function mockAppConfig({
	allowWebhookFromIp = `${REMOTE_ADDRESS_LEGAL1},${REMOTE_ADDRESS_LEGAL2}`
}: {
	allowWebhookFromIp?: string
} = {}) {

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
		'sites.enonic.allowWebhookFromIp': allowWebhookFromIp,
		'sites.enonic.url': 'https://enonic.fotoware.cloud'
	};
}
