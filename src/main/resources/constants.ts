export const CHECK_REMOTE_ADDRESS = true; // Should be true in production

export const DEBUG_INCOMING_REQUESTS = false;
export const DEBUG_REQUESTS = false;

export const METADATA_MAPPINGS_DEFAULT = {
	5: 'displayName',
	25: 'data.tags',
	80: 'data.artist',
	116: 'data.copyright',
	120: 'x.media.imageInfo.description',
} as const;
