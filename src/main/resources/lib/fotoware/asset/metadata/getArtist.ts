import type {Metadata} from '/types';


import {unforceArray} from '/lib/fotoware/xp/unforceArray';


export function getArtist(metadata: Metadata) {
	return metadata[80] ? unforceArray(metadata[80].value) : undefined;
}
