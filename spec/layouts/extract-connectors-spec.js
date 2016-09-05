/*global describe, it, require, expect, beforeEach*/
var extractConnectors = require('../../src/layouts/extract-connectors');
describe('extractConnectors', function () {
	'use strict';
	var visibleNodes, idea;
	beforeEach(function () {
		idea = {
			ideas: {
				1: {
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
				}
			}
		};

		visibleNodes = {
			1: true,
			12: true,
			112: true,
			11: true,
			111: true
		};
	});
	it('creates an object indexed by child ID with from-to connector information', function () {
		var result = extractConnectors(idea, visibleNodes);
		expect(result).toEqual({
			11: Object({ from: 1, to: 11 }),
			12: Object({ from: 1, to: 12 }),
			112: Object({ from: 12, to: 112 }),
			111: Object({ from: 11, to: 111 })
		});
	});
	it('should not include connector when child node is not visible', function () {
		delete visibleNodes[12];
		delete visibleNodes[111];
		expect(extractConnectors(idea, visibleNodes)).toEqual({
			11: Object({ from: 1, to: 11 })
		});
	});
});
