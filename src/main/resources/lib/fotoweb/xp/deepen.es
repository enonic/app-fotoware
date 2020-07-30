//import {toStr} from '/lib/util';
// https://stackoverflow.com/questions/7793811/convert-javascript-dot-notation-object-to-nested-object
// NOTE: This is risky if you have a same-name top level property. Wrap from t=oo; to t[key] = o[k] in if (k.indexOf('.') !== -1) ... – brandonscript Apr 14 '14 at 19:14
// NOTE: It also doesn't work if you have more than one top-level key. – brandonscript Apr 14 '14 at 19:15
export function deepen(o) {
	const oo = {};
	Object.keys(o).forEach((k) => {
		//log.info(`k:${toStr(k)}`);
		let t = oo;
		//log.info(`t1:${toStr(t)}`);
		//const parts = k.split('.'); // This will fail on '' and ""
		/*const parts = k.split(/['"]\.|\.['"]/).map((a) => {
			log.info(`a:${toStr(a)}`);
			if (a.search(/'|"/) !== -1) {
			//if (a.includes('"') || a.includes("'")) {
				const p = a.replace(/['"]/, '').replace(/\./g, '#');
				log.info(`p:${toStr(p)}`);
				return p;
			}
			return a;
		}).join('.').split('.')
			.map((a) => a.replace(/#/g, '.'));*/
		const parts = k.split(/'|"/)
			.map((a) => a.startsWith('.') || a.endsWith('.') ? a : a.replace(/\./g, '#')) // eslint-disable-line no-confusing-arrow
			.join('')
			.split('.')
			.map((a) => a.replace(/#/g, '.'));
		//log.info(`parts:${toStr(parts)}`);
		const key = parts.pop();
		//log.info(`key:${toStr(key)}`);
		while (parts.length) {
			const part = parts.shift();
			//log.info(`part:${toStr(part)}`);
			t[part] = t[part] || {};
			//log.info(`t2:${toStr(t)}`);
			t = t[part];
			//log.info(`t3:${toStr(t)}`);
		}
		t[key] = o[k];
		//log.info(`t4:${toStr(t)}`);
	});
	//log.info(`oo:${toStr(oo)}`);
	return oo;
}
