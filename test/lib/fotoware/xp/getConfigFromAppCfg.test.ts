import type {sanitize} from '@enonic-types/lib-common';


import Log from '@enonic/mock-xp/dist/Log';
import {
	describe,
	expect,
	jest,
	test
} from '@jest/globals';
import { getConfigFromAppCfg } from '/lib/fotoware/xp/getConfigFromAppCfg';


// @ts-expect-error TS2339: Property 'app' does not exist on type 'typeof globalThis'.
global.log = Log.createLogger({
	// loglevel: 'debug'
	loglevel: 'silent'
});

jest.mock('/lib/xp/common', () => ({
	sanitize: jest.fn<typeof sanitize>((text) => text)
}), { virtual: true });


describe('lib', () => {
	describe('fotoware', () => {
		describe('xp', () => {
			describe('getConfigFromAppCfg', () => {

				test('handles an empty app.config', () => {
					// @ts-expect-error TS2339: Property 'app' does not exist on type 'typeof globalThis'.
					global.app.config = {};
					expect(getConfigFromAppCfg()).toStrictEqual({
						sitesConfigs:{}
					});
				});

				test('handles a full app.config', () => {
					// @ts-expect-error TS2339: Property 'app' does not exist on type 'typeof globalThis'.
					global.app.config = {
						'config.filename': 'com.enonic.app.fotoware.cfg',
						'imports.MyImportName.path': 'EnonicWare',
						'imports.MyImportName.project': 'fotoware',
						'imports.MyImportName.query': '(fn:.gif|fn:.jpg|fn:.jpeg|fn:.png|fn:*.svg)AND NOT(25:notforweb)',
						'imports.MyImportName.site': 'enonic',
						'service.pid': 'com.enonic.app.fotoware',
						'sites.enonic.clientId': 'clientId',
						'sites.enonic.clientSecret': 'clientSecret',
						'sites.enonic.allowWebhookFromIp': '13.95.161.205,127.0.0.1',
						'sites.enonic.url': 'https://enonic.fotoware.cloud',
						'sites.enonic.metadata.mappings.5': 'displayName',
						'sites.enonic.metadata.mappings.25': 'data.tags',
						'sites.enonic.metadata.mappings.80': 'data.artist',
						'sites.enonic.metadata.mappings.116': 'data.copyright',
						'sites.enonic.metadata.mappings.120': 'x.media.imageInfo.description,data.altText',
					};
					expect(getConfigFromAppCfg()).toStrictEqual({
						sitesConfigs:{
							enonic: {
								archiveName: '5000-All-files',
								clientId: 'clientId',
								clientSecret: 'clientSecret',
								imports: {
									MyImportName: {
										path: 'EnonicWare',
										project: 'fotoware',
										query: '(fn:.gif|fn:.jpg|fn:.jpeg|fn:.png|fn:*.svg)AND NOT(25:notforweb)',
										rendition: 'Original File',
									},
								},
								metadata: {
									mappings: {
										5: 'displayName',
										25: 'data.tags',
										80: 'data.artist',
										116: 'data.copyright',
										120: [
											'x.media.imageInfo.description',
											'data.altText',
										]
									}
								},
								properties: {
									artist: 'ifChanged',
									copyright: 'overwrite',
									description: 'ifChanged',
									displayName: 'onCreate',
									tags: 'ifChanged',
								},
								remoteAddresses: {
									'127.0.0.1': true,
									'13.95.161.205': true,
								},
								url: 'https://enonic.fotoware.cloud',
							}
						}
					});
				}); // test handles a full app.config

				test('throws on a corrupt app.config', () => {
					// @ts-expect-error TS2339: Property 'app' does not exist on type 'typeof globalThis'.
					global.app.config = {
						'sites.enonic' : ''
					};
					expect(() => getConfigFromAppCfg()).toThrow('Unable to find site with name:enonic!');
				});

				test('logs an error on missing clientId', () => {
					// @ts-expect-error TS2339: Property 'app' does not exist on type 'typeof globalThis'.
					global.app.config = {
						'sites.enonic.clientSecret': 'clientSecret',
						'sites.enonic.allowWebhookFromIp': '13.95.161.205,127.0.0.1',
						'sites.enonic.url': 'https://enonic.fotoware.cloud'
					};
					// @ts-expect-error 2552 Cannot find name 'log'.
					const spy = jest.spyOn(log, 'error');
					getConfigFromAppCfg();
					expect(spy).toHaveBeenCalledWith('Site enonic is missing clientId!');
					spy.mockClear();
				});

				test('logs an error on missing clientSecret', () => {
					// @ts-expect-error TS2339: Property 'app' does not exist on type 'typeof globalThis'.
					global.app.config = {
						'sites.enonic.clientId': 'clientId',
						'sites.enonic.allowWebhookFromIp': '13.95.161.205,127.0.0.1',
						'sites.enonic.url': 'https://enonic.fotoware.cloud'
					};
					// @ts-expect-error 2552 Cannot find name 'log'.
					const spy = jest.spyOn(log, 'error');
					getConfigFromAppCfg();
					expect(spy).toHaveBeenCalledWith('Site enonic is missing clientSecret!');
					spy.mockClear();
				});

				test('logs an error on missing url', () => {
					// @ts-expect-error TS2339: Property 'app' does not exist on type 'typeof globalThis'.
					global.app.config = {
						'sites.enonic.clientId': 'clientId',
						'sites.enonic.clientSecret': 'clientSecret',
						'sites.enonic.allowWebhookFromIp': '13.95.161.205,127.0.0.1',
					};
					// @ts-expect-error 2552 Cannot find name 'log'.
					const spy = jest.spyOn(log, 'error');
					getConfigFromAppCfg();
					expect(spy).toHaveBeenCalledWith('Site enonic is missing url!');
					spy.mockClear();
				});

				test('throws on when imports is corrupt', () => {
					// @ts-expect-error TS2339: Property 'app' does not exist on type 'typeof globalThis'.
					global.app.config = {
						'sites.enonic.clientId': 'clientId',
						'sites.enonic.clientSecret': 'clientSecret',
						'sites.enonic.allowWebhookFromIp': '13.95.161.205,127.0.0.1',
						'sites.enonic.url': 'https://enonic.fotoware.cloud',
						'imports.MyImportName': ''
					};
					expect(() => getConfigFromAppCfg()).toThrow('');
				});

				test('logs an error when import is missing site', () => {
					// @ts-expect-error TS2339: Property 'app' does not exist on type 'typeof globalThis'.
					global.app.config = {
						'sites.enonic.clientId': 'clientId',
						'sites.enonic.clientSecret': 'clientSecret',
						'sites.enonic.url': 'https://enonic.fotoware.cloud',
						'sites.enonic.allowWebhookFromIp': '13.95.161.205,127.0.0.1',
						'imports.MyImportName.path': 'EnonicWare',
						'imports.MyImportName.project': 'fotoware',
						'imports.MyImportName.query': '(fn:.gif|fn:.jpg|fn:.jpeg|fn:.png|fn:*.svg)AND NOT(25:notforweb)',
					};
					// @ts-expect-error 2552 Cannot find name 'log'.
					const spy = jest.spyOn(log, 'error');
					getConfigFromAppCfg();
					expect(spy).toHaveBeenCalledWith('Import MyImportName is missing site!');
					spy.mockClear();
				});

				test('logs an error when import is missing project', () => {
					// @ts-expect-error TS2339: Property 'app' does not exist on type 'typeof globalThis'.
					global.app.config = {
						'sites.enonic.clientId': 'clientId',
						'sites.enonic.clientSecret': 'clientSecret',
						'sites.enonic.url': 'https://enonic.fotoware.cloud',
						'sites.enonic.allowWebhookFromIp': '13.95.161.205,127.0.0.1',
						'imports.MyImportName.path': 'EnonicWare',
						'imports.MyImportName.query': '(fn:.gif|fn:.jpg|fn:.jpeg|fn:.png|fn:*.svg)AND NOT(25:notforweb)',
						'imports.MyImportName.site': 'enonic',
					};
					// @ts-expect-error 2552 Cannot find name 'log'.
					const spy = jest.spyOn(log, 'error');
					getConfigFromAppCfg();
					expect(spy).toHaveBeenCalledWith('Import MyImportName is missing project!');
					spy.mockClear();
				});

				test('logs an error when import is referenceing a site that is not configured', () => {
					// @ts-expect-error TS2339: Property 'app' does not exist on type 'typeof globalThis'.
					global.app.config = {
						'sites.enonic.clientId': 'clientId',
						'sites.enonic.clientSecret': 'clientSecret',
						'sites.enonic.url': 'https://enonic.fotoware.cloud',
						'sites.enonic.allowWebhookFromIp': '13.95.161.205,127.0.0.1',
						'imports.MyImportName.path': 'EnonicWare',
						'imports.MyImportName.project': 'fotoware',
						'imports.MyImportName.query': '(fn:.gif|fn:.jpg|fn:.jpeg|fn:.png|fn:*.svg)AND NOT(25:notforweb)',
						'imports.MyImportName.site': 'wrongSite',
					};
					// @ts-expect-error 2552 Cannot find name 'log'.
					const spy = jest.spyOn(log, 'error');
					getConfigFromAppCfg();
					expect(spy).toHaveBeenCalledWith('Unconfigured site wrongSite!');
					spy.mockClear();
				});

				test('logs an error when two imports try to write to the same location', () => {
					// @ts-expect-error TS2339: Property 'app' does not exist on type 'typeof globalThis'.
					global.app.config = {
						'sites.enonic.clientId': 'clientId',
						'sites.enonic.clientSecret': 'clientSecret',
						'sites.enonic.url': 'https://enonic.fotoware.cloud',
						'sites.enonic.allowWebhookFromIp': '13.95.161.205,127.0.0.1',
						'imports.MyImportName.path': 'EnonicWare',
						'imports.MyImportName.project': 'fotoware',
						'imports.MyImportName.query': '(fn:.gif|fn:.jpg|fn:.jpeg|fn:.png|fn:*.svg)AND NOT(25:notforweb)',
						'imports.MyImportName.site': 'enonic',
						'imports.MyImportName2.path': 'EnonicWare',
						'imports.MyImportName2.project': 'fotoware',
						'imports.MyImportName2.query': '(fn:.gif|fn:.jpg|fn:.jpeg|fn:.png|fn:*.svg)AND NOT(25:notforweb)',
						'imports.MyImportName2.site': 'enonic',
					};
					// @ts-expect-error 2552 Cannot find name 'log'.
					const spy = jest.spyOn(log, 'error');
					getConfigFromAppCfg();
					expect(spy).toHaveBeenCalledWith('Two imports cannot have the same project:fotoware and path:EnonicWare!');
					spy.mockClear();
				});

			});
		});
	});
});
