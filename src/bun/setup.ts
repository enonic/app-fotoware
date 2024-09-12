import type { HttpClient } from '../main/resources/lib/fotoware';
import type { App, DoubleUnderscore, Log } from './global.d';

import { toStr } from '@enonic/js-utils';
import {
	// expect,
	// jest,
	mock,
	// test as it
} from 'bun:test';
import mockCollectionListResponseWithPaging from './mocks/responses/collectionListWithPaging';
import mockTokenResponse from '../../test/mocks/responses/token';
import mockFullApiDescriptorResponse from '../../test/mocks/responses/fullApiDescriptor';
import mockCollectionListResponse from '../../test/mocks/responses/collectionList';
import mockMetadataEditorResponse from '../../test/mocks/responses/metadataEditor';
import mockAssetListResponse from '../../test/mocks/responses/assetList';
import mockRenditionResponse from '../../test/mocks/responses/rendition';
import mockOctetStreamResponse from '../../test/mocks/responses/octetStream';


// Avoid type errors
declare module globalThis {
	var app: App
	var log: Log
	var __: DoubleUnderscore
}

const LOG_LEVEL: 'debug' | 'error' | 'info' | 'warn' | 'silent' = 'debug';

const wrap = (code: number) => `\u001b[${code}m`;
const reset = wrap(0);
// const bold = wrap(1);
// const dim = wrap(2);
// const italic = wrap(3);
// const underline = wrap(4);
// const inverse = wrap(7);
// const hidden = wrap(8);
// const strikethrough = wrap(9);
// const black = wrap(30);
// const red = wrap(31);
const green = wrap(32);
const yellow = wrap(33);
const blue = wrap(34);
const magenta = wrap(35);
// const cyan = wrap(36);
const white = wrap(37);
const grey = wrap(90);
const brightRed = wrap(91);
// const brightGreen = wrap(92);
const brightYellow = wrap(93);
// const brightBlue = wrap(94);
// const brightMagenta = wrap(95);
// const brightCyan = wrap(96);
// const brightWhite = wrap(97);

/* coverage ignore start */
function colorize(a: unknown[], color = brightYellow) {
  return a.map(i => {
    if (typeof i === 'string') {
      return `${green}${i}${color}`;
    }
    if (typeof i === 'undefined' || i === null) {
      return `${yellow}${i}${color}`;
    }
    if (typeof i === 'boolean') {
      return `${magenta}${i}${color}`;
    }
    if (typeof i === 'number') {
      return `${blue}${i}${color}`;
    }
    return `${reset}${stringify(i, { maxItems: Infinity })}${color}`
  });
}

export function rpad(
  u: unknown,
	w: number = 2,
	z: string = ' '
): string {
  const s = '' + u; // Cast to string
	return s.length >= w
  ? s
  : s + new Array(w - s.length + 1).join(z);
}

function logWith({
  color,
  // level = 'debug',
  name,
  format,
  values
}: {
  color: string,
  // level?: 'debug' | 'error' | 'info' | 'warn' | 'silent',
  name: 'debug' | 'error' | 'info' | 'warn',
  format: string,
  values: unknown[]
}) {
  if (
    LOG_LEVEL === 'silent' ||
    (LOG_LEVEL === 'info' && name === 'debug') ||
    (LOG_LEVEL === 'warn' && (name === 'debug' || name === 'info')) ||
    (LOG_LEVEL === 'error' && (name === 'debug' || name === 'info' || name === 'warn'))
  ) {
    return;
  }
  const prefix = `${color}${rpad(name.toUpperCase(), 6)}${format}${reset}`;
  if (values.length) {
    console[name](prefix, ...colorize(values, color));
  } else {
    console[name](prefix);
  }
}
/* coverage ignore end */


globalThis.log = {
  // debug: () => {},
  // error: () => {},
  // info: () => {},
  // warning: () => {},
  // @ts-ignore
  debug: (format: string, ...s: unknown[]): void => {
    logWith({
      color: grey,
      name: 'debug',
      format,
      values: s
    });
  },
  // @ts-ignore
  error: (format: string, ...s: unknown[]): void => {
    logWith({
      color: brightRed,
      name: 'error',
      format,
      values: s
    });
  },
  // @ts-ignore
  info: (format: string, ...s: unknown[]): void => {
    logWith({
      color: white,
      name: 'info',
      format,
      values: s
    });
  },
  // @ts-ignore
  warning: (format: string, ...s: unknown[]): void => {
    logWith({
      color: brightYellow,
      name: 'warn',
      format,
      values: s
    });
  },
}

mock.module('/lib/http-client', () => ({
	request: (request: HttpClient.Request): HttpClient.Response => {
		const {url} = request;
		if (url === 'https://enonic.fotoware.cloud/fotoweb/oauth2/token') {
			return mockTokenResponse();
		} else if (url === 'https://enonic.fotoware.cloud/fotoweb/me/') {
			return mockFullApiDescriptorResponse();
		} else if (url === 'https://enonic.fotoware.cloud/fotoweb/archives/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)') {
			return mockCollectionListResponse();
		} else if (
			url === 'https://enonic.fotoware.cloud/fotoweb/editors/260ef215-1a1c-4218-b5fb-3837eeafa1a0' ||
			url === 'https://enonic.fotoware.cloud/fotoweb/editors/494e7785-3d40-4370-a0ef-69f4f0ef5a8e'
		) {
			return mockMetadataEditorResponse();
		// } else if (url === 'https://enonic.fotoware.cloud/fotoweb/archives/5000-All-files/?q=((fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg)AND%20NOT(25%3Anotforweb))AND(fn%3AThuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp)') {
		} else if (url === 'https://enonic.fotoware.cloud/fotoweb/archives/5000-All-files/?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg'){
		// } else if (url === 'https://enonic.fotoware.cloud/fotoweb/archives/5000-All-files/?q=fn%3A.gif%7Cfn%3A.jpg%7Cfn%3A.jpeg%7Cfn%3A.png%7Cfn%3A*.svg') {
			return mockAssetListResponse();
		} else if (url === 'https://enonic.fotoware.cloud/fotoweb/services/renditions') {
			return mockRenditionResponse();
		} else if (url === 'https://enonic.fotoware.cloud/fotoweb/me/background-tasks/647f4840-0f44-11ee-968b-000d3abcd05d/0/Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp') {
			return mockOctetStreamResponse();
		} else if (url === 'https://enonic.fotoware.cloud/fotoweb/archives/?q=fn%3A*.gif%7Cfn%3A*.jpg%7Cfn%3A*.jpeg%7Cfn%3A*.png%7Cfn%3A*.svg') {
			return mockCollectionListResponseWithPaging();
		}
		throw new Error(`Unmocked request url:${url} request:${toStr(request)}`);
	}
}));
