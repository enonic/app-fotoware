import JavaException from './JavaException';


export default class ValueTypeException extends JavaException {
	constructor(message?: string) {
		super({
			message,
			name: 'com.enonic.xp.data.ValueTypeException'
		});
	}
}
