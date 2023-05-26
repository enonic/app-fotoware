module.exports = {
	// collectCoverageFrom: [
	// 	'src/main/resources/**/*.{ts,tsx}'
	// ],
	// coverageProvider: 'v8',
	globals: {
		app: {
			name: 'com.enonic.app.fotoware'
		}
	},
	moduleNameMapper: {
		'/lib/fotoware/(.*)': '<rootDir>/src/main/resources/lib/fotoware/$1'
	},
	preset: 'ts-jest/presets/js-with-babel-legacy',
	testEnvironment: 'node'
};
