/*global describe, it, require, expect*/
var extractConnectors = require('../../src/layouts/extract-connectors');
describe('extractConnectors', function () {
	'use strict';
	it('creates an object indexed by child ID with from-to connector information', function () {
		var idea = {
				title: 'parent',
				id: 1,
				ideas: {
					5: {
						title: 'second child',
						id: 12,
						ideas: { 1: { id: 112, title: 'XYZ' } }
					},
					4: {
						title: 'child',
						id: 11,
						ideas: { 1: { id: 111, title: 'XYZ' } }
					}
				}
			},
			result = extractConnectors(idea);
		expect(result).toEqual({
			11: Object({ from: 1, to: 11 }),
			12: Object({ from: 1, to: 12 }),
			112: Object({ from: 12, to: 112 }),
			111: Object({ from: 11, to: 111 })
		});
	});
});
