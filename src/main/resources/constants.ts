export const CHECK_REMOTE_ADDRESS = true; // Should be true in production

export const DEBUG_INCOMING_REQUESTS = true;
export const DEBUG_REQUESTS = true;

export enum HTTP_RESPONSE_STATUS_CODES {
	OK = 200,
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	FORBIDDEN = 403,
	NOT_FOUND = 404,
	METHOD_NOT_ALLOWED = 405,
	INTERNAL_SERVER_ERROR = 500
}

export const METADATA_MAPPINGS_DEFAULT = {
	5: 'displayName',
	25: 'data.tags',
	80: 'data.artist',
	116: 'data.copyright',
	120: 'x.media.imageInfo.description',
} as const;
