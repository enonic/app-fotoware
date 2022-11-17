import {
	progress as reportProgress
} from '/lib/xp/task';

export class Progress {
	constructor({
		current = 0,
		info = 'Initializing',
		total = 1
	} = {}) {
		this.current = current;
		this.info = info;
		this.total = total;
	}

	/*setCurrent(current) {
		this.current = current;
		return this; // chainable
	}*/

	setInfo(info) {
		this.info = info;
		return this; // chainable
	}

	report() {
		log.debug(`[${this.current}/${this.total}] ${this.info}`);
		reportProgress({
			current: this.current,
			info: this.info,
			total: this.total
		});
		return this; // chainable
	}

	addItems(count) {
		this.total += count;
		return this; // chainable
	}

	finishItem(info) {
		this.current += 1;
		if (info) {
			this.info = info;
		}
		return this; // chainable
	}
} // class Progress
