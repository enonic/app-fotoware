import JavaException from './JavaException';


export default class RuntimeException extends JavaException {
	constructor(message?: string) {
		super({
			name: 'java.lang.RuntimeException',
			message
		});
	}
}
