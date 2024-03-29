import type {OneOrMore} from '@enonic/js-utils/types';
//import {toStr} from '@enonic/js-utils';

// '' -> undefined
// [] -> undefined
// [''] -> undefined
// ['', ''] -> undefined
// ['single'] -> 'single'
// Anything else unchanged

// TODO: Traverse / Recurse
// { a: ['single'] } -> { a: single }

export function unforceArray(v: OneOrMore<string>): string|string[]|undefined {
	if (!Array.isArray(v)) {
		//log.debug(`unforceArray: not an array: ${toStr(v)}`)
		if (v === '') {
			return undefined;
		}
		// TODO recurse?
		return v;
	}
	if (v.length === 0) {
		return undefined;
	}
	const filtered = v.filter((e) => e !== ''); // TODO recurse?
	return (filtered.length === 1)
		? filtered[0]
		: filtered;
}
