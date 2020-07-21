import {request} from '/lib/http-client';
import {toStr} from '/lib/util';
import {sanitize} from '/lib/xp/common';
import {
	create as createContent,
	//createMedia,
	exists,
	get as getContent,
	modify,
	publish
} from '/lib/xp/content';
import {
	get as getContext,
	run
} from '/lib/xp/context';

export const syncPublic = ({
	baseUrl,
	folder // contentId
}) => {
	const context = getContext();
	context.branch = 'draft'; // create/modify in draft then publish
	log.info(`context:${toStr(context)}`);

	run(context, () => {
		// WARNING Assuming context can read the folder
		const folderContent = getContent({key: folder});
		//log.info(`folderContent:${toStr(folderContent)}`);
		const parentPath = folderContent._path;

		const collectionListRequestParams = {
			contentType: 'application/json',
			method: 'GET',
			headers: {
				Accept: 'application/vnd.fotoware.collectionlist+json'
			},
			url: `${baseUrl}/archives/`
		};
		//log.info(`collectionListRequestParams:${toStr(collectionListRequestParams)}`);
		const collectionListResponse = request(collectionListRequestParams);
		//log.info(`collectionListResponse:${toStr(collectionListResponse)}`);

		let collectionListResponseBodyObj;
		try {
			collectionListResponseBodyObj = JSON.parse(collectionListResponse.body);
		} catch (e) {
			throw new Error(`Something went wrong when trying to JSON parse the response body! collectionListResponse:${toStr(collectionListResponse)}`);
		}
		//log.info(`collectionListResponseBodyObj:${toStr(collectionListResponseBodyObj)}`);

		const {
			//add,
			data: archives//,
			//paging,
			//reorder,
			//searchURL
		} = collectionListResponseBodyObj;

		archives.forEach(({
			/*alertHref,
			alt_orders: altOrders,
			archived,
			canBeArchived,
			canBeDeleted,
			canCopyTo,
			canCreateFolders,
			canHaveChildren,
			canIngestToChildren,
			canMoveTo,
			canSelect,
			canUploadTo,
			color,
			clearSearch,
			create,
			created,
			modified,
			deleted,
			data,
			dataTemplate,
			description,
			edit,
			hasChildren,*/
			href, /*
			iconCharacter,
			isFolderNavigationEnabled,
			isLinkCollection,
			isSearchable,
			isSelectable,
			isSmartFolderNavigationEnabled,
			matchingHref,
			metadataEditor,*/
			name, /*
			orderRootHref,
			originalURL,
			permissions,
			pin,
			posterAsset,
			posterImages,
			propertyValidations,
			props,
			reorder,
			searchQuery,
			searchString,
			searchURL,
			smartFolderHeader,
			taxonomies,*/
			type/*,
			uploadHref,
			urlComponents,
			...rest*/
		}/*, i*/) => {
			if (type === 'archive') {
				//log.info(`name:${toStr(name)}`);
				//log.info(`href:${toStr(href)}`);
				//log.info(`rest:${toStr(rest)}`);

				const contentName = sanitize(href.replace('/fotoweb/archives/', '').replace(/\/$/, ''));
				log.info(`contentName:${toStr(contentName)}`);

				const contentPath = `${parentPath}/${contentName}`;
				log.info(`contentPath:${toStr(contentPath)}`);

				if (exists({key: contentPath})) {
					const modifiedContent = modify({
						key: contentPath,
						editor: (content) => {
							/* eslint-disable no-param-reassign */
							content.displayName = name;
							content.data.href = href;
							//content.x = rest; // Needs schema
							/* eslint-enable no-param-reassign */
							return content;
						}
					});
					log.info(`modifiedContent:${toStr(modifiedContent)}`);
				} else {
					const createContentParams = {
						parentPath,
						name: contentName,
						displayName: name,
						contentType: 'com.enonic.app.fotoware:archive',
						data: {
							href
						}/*,
						x: rest*/ // Needs schema
					};
					log.info(`createContentParams:${toStr(createContentParams)}`);
					const createdContent = createContent(createContentParams);
					log.info(`createdContent:${toStr(createdContent)}`);
				}
				const publishResult = publish({
					keys: [contentPath],
					sourceBranch: 'draft',
					targetBranch: 'master',
					includeDependencies: false // default is true
				});
				log.info(`publishResult:${toStr(publishResult)}`);

				/*const collectionRequestParams = {
					contentType: 'application/json',
					method: 'GET',
					headers: {
						//Accept: 'application/vnd.fotoware.collectioninfo+json' // without assets and children
						Accept: 'application/vnd.fotoware.collection+json' // has assets and children
					},
					url: `${baseUrl}/archives/${href.replace('/fotoweb/archives/', '')}`
				};
				log.info(`collectionRequestParams:${toStr(collectionRequestParams)}`);
				const collectionResponse = request(collectionRequestParams);
				//log.info(`collectionResponse:${toStr(collectionResponse)}`);

				let collectionResponseBodyObj;
				try {
					collectionResponseBodyObj = JSON.parse(collectionResponse.body);
				} catch (e) {
					throw new Error(`Something went wrong when trying to JSON parse the response body! collectionListResponse:${toStr(collectionListResponse)}`);
				}
				log.info(`collectionResponseBodyObj:${toStr(collectionResponseBodyObj)}`);

				const {
					name: name2,
					description,
					href: href2,
					data,
					dataTemplate,
					orderRootHref,
					matchingHref,
					uploadHref,
					propertyValidations,
					urlComponents,
					type: type2,
					created,
					modified,
					deleted,
					archived,
					metadataEditor,
					searchURL,
					originalURL,
					clearSearch,
					searchString,
					searchQuery,
					alertHref,
					alt_orders: altOrders,
					taxonomies,
					canHaveChildren,
					isSearchable,
					isSelectable,
					isLinkCollection,
					hasChildren,
					canCopyTo,
					canMoveTo,
					canUploadTo,
					canCreateFolders,
					canIngestToChildren,
					canBeDeleted,
					canBeArchived,
					isFolderNavigationEnabled,
					isSmartFolderNavigationEnabled,
					canSelect,
					create,
					permissions,
					smartFolderHeader,
					posterImages,
					posterAsset,
					pin,
					assetCount,
					assets,
					childCount,
					children,
					ancestors,
					props,
					...rest2
				} = collectionResponseBodyObj;
				log.info(`name2:${toStr(name2)}`);
				log.info(`href2:${toStr(href2)}`);
				log.info(`type2:${toStr(type2)}`);
				log.info(`rest2:${toStr(rest2)}`);
				assets.forEach(({}, i) => {});*/

				const assetListRequestParams = {
					contentType: 'application/json',
					method: 'GET',
					headers: {
						Accept: 'application/vnd.fotoware.assetlist+json' // Does this work on archive?
					},
					url: `${baseUrl}/archives/${href.replace('/fotoweb/archives/', '')}`
				};
				log.info(`assetListRequestParams:${toStr(assetListRequestParams)}`);
				const assetListResponse = request(assetListRequestParams);
				//log.info(`assetListResponse:${toStr(assetListResponse)}`);

				let assetListResponseBodyObj;
				try {
					assetListResponseBodyObj = JSON.parse(assetListResponse.body);
				} catch (e) {
					throw new Error(`Something went wrong when trying to JSON parse the response body! assetListListResponse:${toStr(assetListResponse)}`);
				}
				log.info(`assetListResponseBodyObj:${toStr(assetListResponseBodyObj)}`);

				const {
					data: assets,
					paging
				} = assetListResponseBodyObj;
				log.info(`assets:${toStr(assets)}`);
				log.info(`paging:${toStr(paging)}`);
				assets.forEach(({
					href: assetHref,
					archiveHREF,
					linkstance,
					created,
					createdBy,
					modified,
					modifiedBy,
					filename,
					filesize,
					uniqueid,
					permissions,
					pincount,
					previewcount,
					downloadcount,
					workflowcount,
					metadataeditcount,
					revisioncount,
					doctype,
					capabilities,
					previews,
					quickRenditions,
					metadataEditor,
					renditions,
					previewToken,
					attributes,
					metadata,
					thumbnailFields,
					builtinFields,
					props,
					...assetRest
				}/*, i*/) => {
					log.info(`assetRest:${toStr(assetRest)}`);
					log.info(`assetHref:${toStr(assetHref)}`);
				}); // assets.forEach
			} // if archive
		}); // archives.forEach

		/*log.info(`data[0]:${toStr(data[0])}`);
		const {
		/*attributes: {
		imageattributes: {
		pixelwidth,//: 1191,
		pixelheight,//: 1684,
		resolution,//: 72,
		flipmirror,//: 0,
		rotation,//: 0,
		colorspace,//: 'rgb'
	},
	photoAttributes: {
	flash: {
	fired//: false
}
}
},
/*metadata: {
	[integer]: {
		value // string of list of string
	},
},
builtinFields,
created,
createdBy,
modified,
modifiedBy,
filename,
filesize,
previews//,
//props
//renditions
} = data[0];
/*const {
	//default: boolDefault,
	//description,
	//display_name: displayName,
	//height,
	href//,
	//original,
	//profile,
	//sizeFixed,
	//width
} = renditions[0];

const smallestPreview = previews.sort((a, b) => a.size - b.size)[0];
log.info(`smallestPreview:${toStr(smallestPreview)}`);
const {
	//height,
	href//,
	//size,
	//square,
	//width
} = smallestPreview;

const imageRequestParams = {
	method: 'GET',
	url: `${BASE_URL}${href}`
};
log.info(`imageRequestParams:${toStr(imageRequestParams)}`);
const imageResponse = request(imageRequestParams);
log.info(`imageResponse:${toStr(imageResponse)}`);
if (imageResponse.status !== 200) {
	throw new Error(`Status !== 200 imageResponse:${toStr(imageResponse)}`);
}
const CONTEXT = {
	repository: 'com.enonic.cms.default',
	branch: 'draft',
	user: {
		login: 'su',
		idProvider: 'system'
	},
	principals: ['role:system.admin']
};
log.info(`CONTEXT:${toStr(CONTEXT)}`);
run(CONTEXT, () => {
	const createMediaResult = createMedia({
		name: 'myImage',
		parentPath: '/mysite',
		mimeType: imageResponse.contentType,
		data: imageResponse.bodyStream
	});
	log.info(`createMediaResult:${toStr(createMediaResult)}`);
});*/
	}); // context.run
}; // syncPublic
