import type {Metadata} from '/types';


import {unforceArray} from '/lib/fotoware/xp/unforceArray';


export function getCopyright(metadata: Metadata) {
	return metadata[116] ? unforceArray(metadata[116].value) : undefined;
}
