export {};

declare global {
	interface AppConfigObject {
		[key :string] :any
	}
	interface App {
		readonly config :AppConfigObject
		readonly name :string
		readonly version :string
	}
	interface Log {
		debug(...s :string[]): void
		error(...s :string[]): void
		info(...s :string[]): void
		warning(...s :string[]): void
	}
	const app :App;
	const log :Log;
}
