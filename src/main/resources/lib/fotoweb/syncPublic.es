import {request} from '/lib/http-client';
import {toStr} from '/lib/util';
import {sanitize} from '/lib/xp/common';
import {
	create as createContent,
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

		const archiveRequestParams = {
			contentType: 'application/json',
			method: 'GET',
			headers: {
				Accept: 'application/vnd.fotoware.collectionlist+json'
			},
			url: `${baseUrl}/archives/`
		};
		//log.info(`archiveRequestParams:${toStr(archiveRequestParams)}`);
		const archiveResponse = request(archiveRequestParams);
		//log.info(`archiveResponse:${toStr(archiveResponse)}`);

		let archiveResponseBodyObj;
		try {
			archiveResponseBodyObj = JSON.parse(archiveResponse.body);
		} catch (e) {
			throw new Error(`Something went wrong when trying to JSON parse the response body! archiveResponse:${toStr(archiveResponse)}`);
		}
		//log.info(`archiveResponseBodyObj:${toStr(archiveResponseBodyObj)}`);

		const {
			//add,
			data: archives//,
			//paging,
			//reorder,
			//searchURL
		} = archiveResponseBodyObj;

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
			}
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
