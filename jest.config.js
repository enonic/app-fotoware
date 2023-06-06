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
				tsconfig: { // actually compilerOptions
					sourceMap: true, // Needed to get correct Uncovered Line numbers
					// target: 'ES5', // Changes Uncovered Line numbers

					// This "group" have the same Uncovered Line numbers:
					// target: 'ES6', // Changes Uncovered Line numbers
					// target: 'ES2016', // Changes Uncovered Line numbers
					// target: 'ES2017', // Changes Uncovered Line numbers
					// target: 'ES2018', // Changes Uncovered Line numbers
					// target: 'ES2019', // Changes Uncovered Line numbers

					// This "group" have the same Uncovered Line numbers:
					// target: 'ES2020', // Changes Uncovered Line numbers
					// target: 'ES2021', // Changes Uncovered Line numbers
					// target: 'ES2022', // Changes Uncovered Line numbers
					// target: 'ESNext', // Changes Uncovered Line numbers
				}
			}
		]
	},
};
