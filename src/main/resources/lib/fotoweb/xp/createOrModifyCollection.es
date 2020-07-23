//import {toStr} from '/lib/util';
import {sanitize} from '/lib/xp/common';
import {
	create as createContent,
	//createMedia,
	exists,
	//get as getContent,
	//modify,
	publish
} from '/lib/xp/content';

export const createOrModifyCollection = ({
	parentPath,
	name,
	displayName,
	href
}) => {
	const pathParts = parentPath.split('/'); //log.info(toStr({pathParts}));
	const sanitizedPathParts = pathParts.map((p) => sanitize(p));
	const sanitizedParentPath = sanitizedPathParts.join('/');
	const sanitizedName = sanitize(name);
	for (let i = 1; i < pathParts.length; i += 1) {
		const path = sanitizedPathParts.slice(0, i + 1).join('/'); //log.info(toStr({path}));
		if (!exists({key: path})) {
			const createFolderParams = {
				name: sanitizedPathParts[i],
				parentPath: sanitizedPathParts.slice(0, i).join('/') || '/',
				displayName: pathParts[i],
				contentType: 'base:folder',
				data: {}
			};
			//log.info(`createFolderParams:${toStr(createFolderParams)}`);
			const createdFolderContent = createContent(createFolderParams);
			//log.info(`createdFolderContent:${toStr(createdFolderContent)}`);
			//const publishFolderResult =
			publish({
				keys: [createdFolderContent._path],
				sourceBranch: 'draft',
				targetBranch: 'master',
				includeDependencies: false // default is true
			});
			//log.info(`publishFolderResult:${toStr(publishFolderResult)}`);
		} // if !exists
	} // for

	const contentPath = `${sanitizedParentPath}/${sanitizedName}`;
	//log.info(`contentPath:${toStr(contentPath)}`);

	let createdOrModifiedCollectionContent;
	if (exists({key: contentPath})) {
		/*const modifiedContent = modify({
			key: contentPath,
			editor: (content) => {
				content.displayName = displayName; // eslint-disable-line no-param-reassign
				content.data.href = href; // eslint-disable-line no-param-reassign
				//content.x = rest; // Needs schema
				return content;
			}
		});
		//log.info(`modifiedContent:${toStr(modifiedContent)}`);
		createdOrModifiedCollectionContent = modifiedContent;*/
	} else {
		const createContentParams = {
			parentPath: sanitizedParentPath,
			name: sanitizedName,
			displayName,
			contentType: 'com.enonic.app.fotoware:collection',
			data: {
				href
			}/*,
			x: rest*/ // Needs schema
		};
		//log.info(`createContentParams:${toStr(createContentParams)}`);
		const createdContent = createContent(createContentParams);
		//log.info(`createdContent:${toStr(createdContent)}`);
		createdOrModifiedCollectionContent = createdContent;
	}
	if (createdOrModifiedCollectionContent) {
		//const publishResult =
		publish({
			keys: [contentPath],
			sourceBranch: 'draft',
			targetBranch: 'master',
			includeDependencies: false // default is true
		});
		//log.info(`publishResult:${toStr(publishResult)}`);
	}
	return {
		createdOrModifiedCollectionContent
	};
}; // export const createOrModifyCollection
