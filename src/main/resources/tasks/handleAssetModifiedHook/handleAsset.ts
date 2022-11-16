import type {SiteConfig} from '/lib/fotoware/xp/AppConfig';
import type {Asset} from '/types';


// @ts-ignore
import {md5} from '/lib/text-encoding';
import {readText} from '/lib/xp/io';

// @ts-ignore
import {requestRendition} from '/lib/fotoware/api/requestRendition';

import {handleExistingMediaContent} from './handleExistingMediaContent';
import {handleMissingMediaContent} from './handleMissingMediaContent';


export function handleAsset({
	accessToken,
	asset,
	exisitingMediaContent,
	fileNameNew,
	fileNameOld,
	hostname,
	path,
	project,
	properties,
	rendition,
	renditionRequest
} :{
	asset: Asset
	properties: SiteConfig['properties']
}) {
	const {
		//doctype,
		filename: filenameFromQuery, // Should match or query is weird
		//filesize,
		//href,
		metadata,
		//metadataObj,
		//renditionHref
		renditions
	} = asset;
	//log.info(`filenameFromQuery:${toStr(filenameFromQuery)}`);
	//log.info(`metadata:${toStr(metadata)}`);
	if (fileNameNew !== filenameFromQuery) {
		throw new Error(`fileNameNew:${fileNameNew} from assetModified does not match filename:${filenameFromQuery} from query result`);
	}
	const renditionsObj: Record<string,string> = {};
	renditions.forEach(({
		//default,
		//description,
		display_name,
		//height,
		href: aRenditionHref//,
		//original,
		//profile,
		//sizeFixed,
		//width
	}) => {
		//log.debug(`display_name:${display_name} href:${href} height:${height} width:${width}`);
		renditionsObj[display_name] = aRenditionHref;
	});
	//log.debug(`renditionsObj:${toStr(renditionsObj)}`);

	const renditionUrl = renditionsObj[rendition] || renditionsObj['Original File'];

	const downloadRenditionResponse = requestRendition({
		accessToken,
		hostname,
		renditionServiceShortAbsolutePath: renditionRequest,
		renditionUrl
	});
	if (!downloadRenditionResponse) {
		throw new Error(`Something went wrong when downloading rendition for renditionUrl:${renditionUrl}!`);
	}
	const md5sumOfDownload = md5(readText(downloadRenditionResponse.bodyStream));
	//log.info(`md5sumOfDownload:${toStr(md5sumOfDownload)}`);

	if (exisitingMediaContent) {
		return handleExistingMediaContent({
			exisitingMediaContent,
			downloadRenditionResponse,
			fileNameNew,
			fileNameOld,
			md5sumOfDownload,
			metadata,
			project,
			properties
		});
	}

	handleMissingMediaContent({
		downloadRenditionResponse,
		fileNameNew,
		metadata,
		md5sumOfDownload,
		path,
		properties
	});
}
