import {request} from '/lib/http-client';
import {toStr} from '/lib/util';

export const getCollection = ({
	accessToken,
	hostname,
	shortAbsolutePath
}) => {
	const collectionRequestParams = {
		contentType: 'application/json',
		method: 'GET',
		headers: {
			//Accept: 'application/vnd.fotoware.collectioninfo+json' // without assets and children
			Accept: 'application/vnd.fotoware.collection+json' // has assets and children
		},
		url: `${hostname}${shortAbsolutePath}`
	};
	if (accessToken) {
		collectionRequestParams.params = {
			access_token: accessToken
		};
	}
	//log.info(`collectionRequestParams:${toStr(collectionRequestParams)}`);
	const collectionResponse = request(collectionRequestParams);
	//log.info(`collectionResponse:${toStr(collectionResponse)}`);

	let collectionResponseBodyObj;
	try {
		collectionResponseBodyObj = JSON.parse(collectionResponse.body);
	} catch (e) {
		throw new Error(`Something went wrong when trying to JSON parse the response body! collectionListResponse:${toStr(collectionResponse)}`);
	}
	//log.info(`collectionResponseBodyObj:${toStr(collectionResponseBodyObj)}`);

	const {
		childCount,
		children,
		metadataEditor,
		name/*,
		href,
		hasChildren,
		assets
		assets : {
			data: assetsData,
			paging: {
				//prev,
				next: assetsPagingNext,
				//first,
				//last
			} = {}
		},
		description,
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
		ancestors,
		props,
		...rest*/
	} = collectionResponseBodyObj;
	//log.info(`rest:${toStr(rest)}`);
	//log.info(`hasChildren:${toStr(hasChildren)}`);
	//log.info(`childCount:${toStr(childCount)}`);
	//log.info(`children:${toStr(children)}`);
	return {
		//assets, // Using getAndPaginateAssetList instead
		childCount,
		children, // collection list (object)
		metadataEditor,
		name
	};
}; // export const getCollection
