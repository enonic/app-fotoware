import type { StepDefinitions } from 'jest-cucumber';
// import type { App, DoubleUnderscore, Log } from '../global.d';


import { describe } from '@jest/globals';
import {
  expect,
  test
} from 'bun:test';
import {
  autoBindSteps,
  loadFeature,
} from 'jest-cucumber';
import { query } from '../../main/resources/lib/fotoware/api/query';


// Avoid type errors
// declare module globalThis {
// 	var app: App
// 	var log: Log
// 	var __: DoubleUnderscore
// }


const feature = loadFeature('./src/bun/features/query.feature', {
  runner: {
    describe,
    test,
  }
});


export const steps: StepDefinitions = ({ given, and, when, then }) => {
	let rv;

	when('query is called', () => {
		rv = query({
			accessToken: 'accessToken',
			blacklistedCollections: {},
			hostname: 'https://enonic.fotoware.cloud',
			q: 'fn:*.gif|fn:*.jpg|fn:*.jpeg|fn:*.png|fn:*.svg',
			searchURL: '/fotoweb/archives/{?q}',
			whitelistedCollections: {
				'5000-All-files': true
			}
		});
	});

	then('the return value is info logged', () => {
		log.info('rv:%s', JSON.stringify(rv, null, 4));
	});

	then(/^it should return an object with assetCountTotal equal to (\d+)$/, (arg0: string) => {
		expect(rv.assetCountTotal).toBe(Number.parseInt(arg0));
	});
}; // steps

autoBindSteps(feature, [ steps ]);
