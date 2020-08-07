//import {toStr} from '/lib/util';
import {
	create as createContent,
	//createMedia,
	exists,
	//get as getContent,
	modify,
	publish
} from '/lib/xp/content';

export const createOrModifyArchive = ({
	parentPath,
	name,
	displayName,
	href
}) => {
	const contentPath = `${parentPath}/${name}`;
	//log.info(`contentPath:${toStr(contentPath)}`);

	let createdOrModifiedArchiveContent;
	if (exists({key: contentPath})) {
		const modifiedContent = modify({
			key: contentPath,
			editor: (content) => {
				/* eslint-disable no-param-reassign */
				content.displayName = displayName;
				content.data.href = href;
				//content.x = rest; // Needs schema
				/* eslint-enable no-param-reassign */
				return content;
			}
		});
		//log.info(`modifiedContent:${toStr(modifiedContent)}`);
		createdOrModifiedArchiveContent = modifiedContent;
	} else {
		const createContentParams = {
			parentPath,
			name,
			displayName,
			contentType: 'com.enonic.app.fotoware:archive',
			data: {
				href
			}/*,
			x: rest*/ // Needs schema
		};
		//log.info(`createContentParams:${toStr(createContentParams)}`);
		const createdContent = createContent(createContentParams);
		//log.info(`createdContent:${toStr(createdContent)}`);
		createdOrModifiedArchiveContent = createdContent;
	}
	//const publishResult =
	publish({
		keys: [contentPath],
		sourceBranch: 'draft',
		targetBranch: 'master',
		includeDependencies: false // default is true
	});
	//log.info(`publishResult:${toStr(publishResult)}`);
	return {
		createdOrModifiedArchiveContent
	};
}; // export const createOrModifyArchive
