import {toStr} from '/lib/util';
//import {get as getContext} from '/lib/xp/context';
import {
	getContent as getCurrentContent//,
	//getSiteConfig as getCurrentSiteConfig,
	//getSite as getCurrentSite,
	//serviceUrl as getServiceUrl
} from '/lib/xp/portal';

export const get = (request) => {
	const {
		branch, // draft, master
		mode, // inline, preview, edit, live
		repositoryId
	} = request;
	//log.info(`request:${toStr(request)}`);
	log.info(`branch:${toStr(branch)}`);
	log.info(`mode:${toStr(mode)}`);
	log.info(`repositoryId:${toStr(repositoryId)}`);

	if (branch !== 'draft' || mode !== 'inline') {
		return {status: 404};
	}

	//const context = getContext();
	//log.info(`context:${toStr(context)}`);

	const currentContent = getCurrentContent();
	//log.info(`currentContent:${toStr(currentContent)}`);

	const {
		data: {
			archive,
			hostname,
			docTypesOptionSet
		}
	} = currentContent;
	log.info(`archive:${toStr(archive)}`);
	log.info(`hostname:${toStr(hostname)}`);
	log.info(`docTypesOptionSet:${toStr(docTypesOptionSet)}`);

	return {
		body: `<html>
	<head>
		<title>Archive page</title>
	</head>
	<body>
		<form action="" method="post">
			<input type="submit" value="Sync a single asset"/>
		</form>
		<form action="" method="post">
			<input type="submit" value="Sync a single collection"/>
		</form>
		<form action="" method="post">
			<input type="submit" value="Sync everything"/>
		</form>
	</body>
	</html>`
	};
};
