import type { Options as TsupOptions} from 'tsup';


// import { polyfillNode } from 'esbuild-plugin-polyfill-node';
import copy from 'esbuild-plugin-copy-watch'
import { globSync } from 'glob';
import { defineConfig } from 'tsup';


interface Options extends TsupOptions {
	d?: string
}


const DIR_DST = 'build/resources/main';
const DIR_SRC = 'src/main/resources';
const DIR_SRC_ASSETS = `${DIR_SRC}/assets`;
const DIR_SRC_STATIC = `${DIR_SRC}/static`;


export default defineConfig((options: Options) => {
	// print(options, { maxItems: Infinity });
	// print(process.env, { maxItems: Infinity });
	// print({ NODE_ENV: process.env.NODE_ENV }); // production development
	// print({ LOG_LEVEL_FROM_GRADLE: process.env.LOG_LEVEL_FROM_GRADLE }); // QUIET WARN LIFECYCLE INFO DEBUG
	if (options.d === DIR_DST) {
		const GLOB_EXTENSIONS_SERVER = '{ts,js}';
		const FILES_SERVER = globSync(
			`${DIR_SRC}/**/*.${GLOB_EXTENSIONS_SERVER}`,
			{
				absolute: false,
				ignore: globSync(`${DIR_SRC_ASSETS}/**/*.${GLOB_EXTENSIONS_SERVER}`).concat(
					globSync(`${DIR_SRC_STATIC}/**/*.${GLOB_EXTENSIONS_SERVER}`)
				)
			}
		);
		// print(FILES_SERVER, { maxItems: Infinity });

		return {
			bundle: true, // Needed to bundle @enonic/js-utils
			dts: false, // d.ts files are use useless at runtime
			entry: FILES_SERVER,
			esbuildOptions(options, context) {
				// options.alias = {
				// 	'alias': './src/main/resources/lib/filename.js'
				// };

				// Some node modules might need globalThis
				// Needed by core-js/internals/global.js
				options.banner = {
					js: `const globalThis = (1, eval)('this');` // buffer polyfill needs this
				};

				// If you have libs with chunks, use this to avoid collisions
				options.chunkNames = '_chunks/[name]-[hash]';

				options.mainFields = ['module', 'main'];
			},
			esbuildPlugins: [
				// Some node modules might need parts of Node polyfilled:
				// polyfillNode({
				// 	globals: {
				// 		buffer: false,
				// 		process: false
				// 	},
				// 	polyfills: {
				// 		_stream_duplex: false,
				// 		_stream_passthrough: false,
				// 		_stream_readable: false,
				// 		_stream_transform: false,
				// 		_stream_writable: false,
				// 		assert: false,
				// 		'assert/strict': false,
				// 		async_hooks: false,
				// 		buffer: false,
				// 		child_process: false,
				// 		cluster: false,
				// 		console: false,
				// 		constants: false,
				// 		crypto: false,
				// 		dgram: false,
				// 		diagnostics_channel: false,
				// 		dns: false,
				// 		domain: false,
				// 		events: false,
				// 		fs: false,
				// 		'fs/promises': false,
				// 		http: false,
				// 		http2: false,
				// 		https: false,
				// 		module: false,
				// 		net: false,
				// 		os: false,
				// 		path: false,
				// 		perf_hooks: false,
				// 		process: false, //"empty",
				// 		punycode: false,
				// 		querystring: false,
				// 		readline: false,
				// 		repl: false,
				// 		stream: false,
				// 		string_decoder: false,
				// 		sys: false,
				// 		timers: false,
				// 		'timers/promises': false,
				// 		tls: false,
				// 		tty: false,
				// 		url: false,
				// 		util: false, // true,
				// 		v8: false,
				// 		vm: false,
				// 		wasi: false,
				// 		worker_threads: false,
				// 		zlib: false,
				// 	}
				// }), // ReferenceError: "navigator" is not defined
				copy({
					paths: [{
						from: 'node_modules/@babel/standalone/babel.*.js*',
						to: 'assets/js/@babel/standalone'
					}, {
						from: 'node_modules/@material-ui/core/umd/material-ui.*.js',
						to: 'assets/js/@material-ui'
					}, {
						from: 'node_modules/moment/min/*',
						to: 'assets/js/moment'
					}, {
						from: 'node_modules/react/umd/react.*.js',
						to: 'assets/js/react'
					}, {
						from: 'node_modules/react-dom/umd/react-dom.*.js',
						to: 'assets/js/react-dom'
					}]
				})
			],
			external: [
				'/lib/cache',
				'/lib/cron',
				/^\/lib\/fotoware/,
				'/lib/enonic/static',
				/^\/lib\/guillotine/,
				'/lib/galimatias',
				'/lib/graphql',
				'/lib/graphql-connection',
				'/lib/http-client',
				'/lib/license',
				'/lib/mustache',
				'/lib/router',
				'/lib/util',
				'/lib/util/data',
				'/lib/util/value',
				'/lib/vanilla',
				'/lib/text-encoding',
				'/lib/thymeleaf',
				'/lib/xp/admin',
				'/lib/xp/auth',
				'/lib/xp/common',
				'/lib/xp/context',
				'/lib/xp/content',
				'/lib/xp/io',
				'/lib/xp/node',
				'/lib/xp/portal',
				'/lib/xp/repo',
				'/lib/xp/scheduler',
				'/lib/xp/task',
				// /^\/lib\/xp\//,
			],
			format: 'cjs',
			inject: [
				// Injects makes it possible to use some functionality in any file :)
				// However it also makes every file larger, unless splitting: true
				// If for some reason you cannot use code splitting, it is better
				// to import a polyfill only in the entries that needs it.
				// Code-js polyfills share code, so together they don't add the sum of all the polyfills.
				// For example injecting both number/is-finite and is-integer only adds 60K, not 108K

				// Here are some things Nashorn doesn't support, comment them in to inject them:
				// 'node_modules/core-js/stable/array/flat.js',        // 69K (18K) minified
				'node_modules/core-js/stable/array/includes.js',    // 60K (15K) // Needed by @sindresorhus/is
				// 'node_modules/core-js/stable/math/trunc.js',        // 53K (14K)
				// 'node_modules/core-js/stable/number/is-finite.js',  // 54K (14K)
				// 'node_modules/core-js/stable/number/is-integer.js', // 54K (14K)
				'node_modules/core-js/stable/object/entries.js',
				// 'node_modules/core-js/stable/parse-float.js',       // 59K (15K)
				// 'node_modules/core-js/stable/reflect/index.js',     // 88K (22K)
				// 'node_modules/core-js/stable/string/pad-start.js',

				// TIP: I used this command to find sizes
				// npm --silent run clean && npm --silent run build:server; ls -lh build/resources/main/empty.js; npm --silent run clean && npm --silent run build:server -- --minify; ls -lh build/resources/main/empty.js
			],
			minify: false, // Minifying server files makes debugging harder

			// TIP: Command to check if there are any bad requires left behind
			// grep -r 'require("' build/resources/main | grep -v 'require("/'|grep -v chunk
			noExternal: [
				/^@enonic\/js-utils.*$/,
				'@sindresorhus/is',
				'deep-object-diff',
				'dot2val',
				'encodeuricomponent-tag',
				'fast-deep-equal',
				'get-value',
				'traverse',
				// 'urlencode' // requires 'stream' from Node. Replaced with encodeuricomponent-tag
			],

			platform: 'neutral',
			silent: ['QUIET', 'WARN'].includes(process.env.LOG_LEVEL_FROM_GRADLE||''),
			shims: false, // https://tsup.egoist.dev/#inject-cjs-and-esm-shims
			splitting: true,
			sourcemap: false,
			target: 'es5'
		};
	}
	throw new Error(`Unconfigured directory:${options.d}!`)
})
