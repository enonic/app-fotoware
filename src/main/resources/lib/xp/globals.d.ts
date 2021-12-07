//declare global {
	interface App {
		readonly config: { // Object of unknown structure
		}
		readonly name :string
	}
	interface Log {
		debug(s: string): void
		error(s: string): void
		info(s: string): void
		warning(s: string): void
	}
//}

export const app :App;
export const log :Log;
