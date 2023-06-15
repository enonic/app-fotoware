export default class JavaException extends Error {
	constructor({
		message,
		name,
	}: {
		message?: string
		name: string
	}) {
		super(message);
		this.class = {
			name
		}
	}
}
