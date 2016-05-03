/*global describe, it, expect, require */
var combineVerticalSubtrees = require('../../src/layouts/combine-vertical-subtrees');
describe('Top down layout', function () {
	'use strict';
	it('should set the width properties of the root node', function () {
		var node = {id: 1, width: 50, height: 10},
			result = combineVerticalSubtrees(node, {}, 5);
		expect(result.nodes[1].x).toEqual(-25);
		expect(result.levels).toEqual([{xOffset: -25, width: 50}]);
	});
	it('should arrange a single child layout directly below the root', function () {
		var node = {id: 1, width: 50, height: 10},
			childLayouts = { /* rank */ 4: { levels: [{xOffset: -20, width: 40}], nodes: { /* id */ 11: { id: 11, x: -20, width: 40, height: 10 } } } },
			result = combineVerticalSubtrees(node, childLayouts, 5);
		expect(result.nodes[1].x).toEqual(-25);
		expect(result.nodes[11].x).toEqual(-20);

		expect(result.levels).toEqual([{xOffset: -25, width: 50}, {xOffset: -20, width: 40}]);

	});
	it('should rank-sort child layouts', function () {

		var node = {id: 1, width: 50, height: 10},
			childLayouts = {
				/* rank */ 4: { levels: [{xOffset: -20, width: 40}], nodes: { /* id */ 14: { id: 14, x: -20, width: 40, height: 10 } } },
				/* rank */ '-1': { levels: [{xOffset: -20, width: 40}], nodes: { /* id */ 12: { id: 12, x: -20, width: 40, height: 10 } } },
				/* rank */ 1: { levels: [{xOffset: -20, width: 40}], nodes: { /* id */ 13: { id: 13, x: -20, width: 40, height: 10 } } },
				/* rank */ '-4': { levels: [{xOffset: -20, width: 40}], nodes: { /* id */ 11: { id: 11, x: -20, width: 40, height: 10 } } }
			},
			result = combineVerticalSubtrees(node, childLayouts, 10);

		expect(result.levels).toEqual([{xOffset: -25, width: 50}, {xOffset: -95, width: 190}]);

		expect(result.nodes[1].x).toEqual(-25);
		expect(result.nodes[11].x).toEqual(-95);
		expect(result.nodes[12].x).toEqual(-45);
		expect(result.nodes[13].x).toEqual(5);
		expect(result.nodes[14].x).toEqual(55);

	});
});
