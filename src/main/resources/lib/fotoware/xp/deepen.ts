import type { NestedRecord } from '@enonic-types/core'

//import {toStr} from '@enonic/js-utils';

import {AppConfig} from './AppConfig';

// https://stackoverflow.com/questions/7793811/convert-javascript-dot-notation-object-to-nested-object
// NOTE: This is risky if you have a same-name top level property. Wrap from t=oo; to t[key] = o[k] in if (k.indexOf('.') !== -1) ... – brandonscript Apr 14 '14 at 19:14
// NOTE: It also doesn't work if you have more than one top-level key. – brandonscript Apr 14 '14 at 19:15
export function deepen(o: typeof app.config): AppConfig {
	const oo: NestedRecord = {};
	Object.keys(o).forEach((k) => {
		//log.debug(`k:${toStr(k)}`);
		let t = oo;
		//log.debug(`t1:${toStr(t)}`);
		//const parts = k.split('.'); // This will fail on '' and ""
		/*const parts = k.split(/['"]\.|\.['"]/).map((a) => {
			log.debug(`a:${toStr(a)}`);
			if (a.search(/'|"/) !== -1) {
			//if (a.includes('"') || a.includes("'")) {
				const p = a.replace(/['"]/, '').replace(/\./g, '#');
				log.debug(`p:${toStr(p)}`);
				return p;
			}
			return a;
		}).join('.').split('.')
			.map((a) => a.replace(/#/g, '.'));*/
		const parts = k.search(/'|"/) !== -1
			? k.split(/'|"/)
				.map((a) => a.startsWith('.') || a.endsWith('.') ? a : a.replace(/\./g, '#')) // eslint-disable-line no-confusing-arrow
				.join('')
				.split('.')
				.map((a) => a.replace(/#/g, '.'))
			: k.split('.');
		//log.debug(`parts:${toStr(parts)}`);
		const key = parts.pop() as string;
		//log.debug(`key:${toStr(key)}`);
		while (parts.length) {
			const part = parts.shift() as string;
			//log.debug(`part:${toStr(part)}`);
			t[part] = t[part] || {};
			//log.debug(`t2:${toStr(t)}`);
			t = t[part] as NestedRecord;
			//log.debug(`t3:${toStr(t)}`);
		}
		t[key] = o[k];
		//log.debug(`t4:${toStr(t)}`);
	});
	//log.debug(`oo:${toStr(oo)}`);
	return oo as unknown as AppConfig;
}

// https://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-json-objects
// http://jsfiddle.net/WSzec/14/
/*export const deepen = function(data) {
	//"use strict";
	if (Object(data) !== data || Array.isArray(data))
		return data;
	var result = {}, cur, prop, idx, last, temp;
	for(var p in data) {
		cur = result, prop = "", last = 0;
		do {
			idx = p.indexOf(".", last);
			temp = p.substring(last, idx !== -1 ? idx : undefined);
			cur = cur[prop] || (cur[prop] = (!isNaN(parseInt(temp)) ? [] : {}));
			prop = temp;
			last = idx + 1;
		} while(idx >= 0);
		cur[prop] = data[p];
	}
	return result[""];
}*/
