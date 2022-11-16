import type {Metadata} from '/types';


import {forceArray} from '@enonic/js-utils';
import {capitalize} from '/lib/fotoware/xp/capitalize';
import {unforceArray} from '/lib/fotoware/xp/unforceArray';


export function getTags(metadata: Metadata) {
	return metadata[25]
		? unforceArray( // ['single'] -> 'single' // [''] -> undefined // [] -> undefined
			forceArray(metadata[25].value) // Turns 'single' into ['single'] so map always works
				.map(v => capitalize(v))
		)
		: undefined;
}
