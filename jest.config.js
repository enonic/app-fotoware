module.exports = {
	collectCoverageFrom: [
		'src/main/resources/**/*.{ts,tsx}'
	],
	// In order for tests to work on all files, we have to use v8 coverage provider.
	coverageProvider: 'v8', // Changes Uncovered Lines

	globals: {
		app: {
			name: 'com.enonic.app.fotoware'
		},
	},
	moduleNameMapper: {
		'/lib/fotoware/(.*)': '<rootDir>/src/main/resources/lib/fotoware/$1'
	},
	preset: 'ts-jest/presets/js-with-babel-legacy',
	// preset: 'ts-jest/presets/js-with-babel',

	// testEnvironment: 'jsdom', // Doesn't change Uncovered Lines
	testEnvironment: 'node',

	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': [
			'ts-jest',
			{
				tsconfig: 'test/tsconfig.json'
			}
		]
	},

	transformIgnorePatterns: [
		'/node_modules/(?!@sindresorhus/)'
	]
};
