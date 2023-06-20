import type {
	AccessToken,
	Asset,
	Filename,
	Hostname,
	Mappings,
	MediaContent,
	Path,
	Project,
	RenditionRequest,
	RenditionString,
	SiteConfig
} from '/lib/fotoware';


import {toStr} from '@enonic/js-utils';
// @ts-ignore
import {md5} from '/lib/text-encoding';
import {readText} from '/lib/xp/io';
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
	mappings,
	path,
	project,
	properties,
	rendition,
	renditionRequest
} :{
	accessToken: AccessToken
	asset: Asset
	exisitingMediaContent: MediaContent|null|undefined
	fileNameNew: Filename
	fileNameOld: Filename
	hostname: Hostname
	mappings: Mappings
	path: Path
	project: Project
	properties: SiteConfig['properties']
	rendition: RenditionString
	renditionRequest: RenditionRequest
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
	if (!renditionUrl) {
		log.error(`Unable to determine renditionUrl from rendition:${rendition} in renditionsObj${toStr(renditionsObj)}!`);
		throw new Error(`Unable to determine renditionUrl from rendition:${rendition}!`);
	}

	const downloadRenditionResponse = requestRendition({
		accessToken,
		hostname,
		renditionServiceShortAbsolutePath: renditionRequest,
		renditionUrl
	});
	if (!downloadRenditionResponse) {
		throw new Error(`Something went wrong when downloading rendition for renditionUrl:${renditionUrl}!`);
	}
	const stream = downloadRenditionResponse.bodyStream;
	if (!stream) {
		throw new Error(`RenditionResponse.bodyStream is Falsy! renditionUrl:${renditionUrl}`);
	}
	const md5sumOfDownload = md5(readText(stream)) as string;
	//log.info(`md5sumOfDownload:${toStr(md5sumOfDownload)}`);

	if (exisitingMediaContent) {
		return handleExistingMediaContent({
			exisitingMediaContent,
			downloadRenditionResponse,
			fileNameNew,
			fileNameOld,
			mappings,
			md5sumOfDownload,
			metadata,
			project,
			properties
		});
	}

	handleMissingMediaContent({
		downloadRenditionResponse,
		fileNameNew,
		mappings,
		metadata,
		md5sumOfDownload,
		path,
		properties
	});
}
