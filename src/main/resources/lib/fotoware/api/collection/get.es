import {request} from '/lib/http-client';
import {toStr} from '/lib/util';

export const getCollection = ({
	accessToken,
	hostname,
	shortAbsolutePath
}) => {
	const collectionRequestParams = {
		contentType: 'application/json',
		followRedirects: true, // Documentation is on unclear on the default https://developer.enonic.com/docs/http-client-library/master#requestoptions
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
	//log.debug(`collectionRequestParams:${toStr(collectionRequestParams)}`);
	const collectionResponse = request(collectionRequestParams);
	//log.debug(`collectionResponse:${toStr(collectionResponse)}`);

	let collectionResponseBodyObj;
	try {
		collectionResponseBodyObj = JSON.parse(collectionResponse.body);
	} catch (e) {
		throw new Error(`Something went wrong when trying to JSON parse the response body! collectionListResponse:${toStr(collectionResponse)}`);
	}
	//log.debug(`collectionResponseBodyObj:${toStr(collectionResponseBodyObj)}`);

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
	//log.debug(`rest:${toStr(rest)}`);
	//log.debug(`hasChildren:${toStr(hasChildren)}`);
	//log.debug(`childCount:${toStr(childCount)}`);
	//log.debug(`children:${toStr(children)}`);
	return {
		//assets, // Using getAndPaginateAssetList instead
		childCount,
		children, // collection list (object)
		metadataEditor,
		name
	};
}; // export const getCollection
