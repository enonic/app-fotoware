import type { HttpClient } from '/lib/fotoware';


import { toStr } from '@enonic/js-utils';
import { jest } from '@jest/globals';
import mockTokenResponse from './responses/token';
import mockFullApiDescriptorResponse from './responses/fullApiDescriptor';
import mockCollectionListResponse from './responses/collectionList';
import mockMetadataEditorResponse from './responses/metadataEditor';
import mockAssetListResponse from './responses/assetList';
import mockRenditionResponse from './responses/rendition';
import mockOctetStreamResponse from './responses/octetStream';


export default function mockLibHttpClient() {
	jest.mock('/lib/http-client', () => ({
		request: jest.fn((request: HttpClient.Request): HttpClient.Response => {
			const {url} = request;
			if (url === 'https://enonic.fotoware.cloud/fotoweb/oauth2/token') {
				return mockTokenResponse();
			} else if (url === 'https://enonic.fotoware.cloud/fotoweb/me/') {
				return mockFullApiDescriptorResponse();
			} else if (url === 'https://enonic.fotoware.cloud/fotoweb/archives/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)') {
				return mockCollectionListResponse();
			} else if (url === 'https://enonic.fotoware.cloud/fotoweb/editors/260ef215-1a1c-4218-b5fb-3837eeafa1a0') {
				return mockMetadataEditorResponse();
			} else if (url === 'https://enonic.fotoware.cloud/fotoweb/archives/5000-All-files/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)') {
				return mockAssetListResponse();
			} else if (url === 'https://enonic.fotoware.cloud/fotoweb/services/renditions') {
				return mockRenditionResponse();
			} else if (url === 'https://enonic.fotoware.cloud/fotoweb/me/background-tasks/647f4840-0f44-11ee-968b-000d3abcd05d/0/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp') {
				return mockOctetStreamResponse();
			} else {
				throw new Error(`Unmocked request url:${url} request:${toStr(request)}`);
			}
		})
	}), {virtual: true});
}
