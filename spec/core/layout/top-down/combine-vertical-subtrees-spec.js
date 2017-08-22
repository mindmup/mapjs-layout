/*global describe, it, expect, require */
const combineVerticalSubtrees = require('../../../../src/core/layout/top-down/combine-vertical-subtrees');
describe('Combine Vertical Subtrees', function () {
	'use strict';
	it('should set the width properties of the root node', function () {
		const node = {id: 1, width: 50, height: 10},
			result = combineVerticalSubtrees(node, {}, 5);
		expect(result.nodes[1].x).toEqual(-25);
		expect(result.levels).toEqual([{xOffset: -25, width: 50}]);
	});
	it('should arrange a single child layout directly below the root', function () {
		const node = {id: 1, width: 50, height: 10},
			childLayouts = { /* rank */ 4: { levels: [{xOffset: -20, width: 40}], nodes: { /* id */ 11: { id: 11, x: -20, width: 40, height: 10 } } } },
			result = combineVerticalSubtrees(node, childLayouts, 5);
		expect(result.nodes[1].x).toEqual(-25);
		expect(result.nodes[11].x).toEqual(-20);

		expect(result.levels).toEqual([{xOffset: -25, width: 50}, {xOffset: -20, width: 40}]);

	});
	it('should rank-sort child layouts', function () {
		const node = {id: 1, width: 50, height: 10},
			childLayouts = {
				4: { levels: [{xOffset: -20, width: 40}], nodes: { /* id */ 14: { id: 14, x: -20, width: 40, height: 10 } } },
				'-1': { levels: [{xOffset: -20, width: 40}], nodes: { /* id */ 12: { id: 12, x: -20, width: 40, height: 10 } } },
				1: { levels: [{xOffset: -20, width: 40}], nodes: { /* id */ 13: { id: 13, x: -20, width: 40, height: 10 } } },
				'-4': { levels: [{xOffset: -20, width: 40}], nodes: { /* id */ 11: { id: 11, x: -20, width: 40, height: 10 } } }
			},
			result = combineVerticalSubtrees(node, childLayouts, 10);

		expect(result.levels).toEqual([{xOffset: -25, width: 50}, {xOffset: -95, width: 190}]);

		expect(result.nodes[1].x).toEqual(-25);
		expect(result.nodes[11].x).toEqual(-95);
		expect(result.nodes[12].x).toEqual(-45);
		expect(result.nodes[13].x).toEqual(5);
		expect(result.nodes[14].x).toEqual(55);

	});
	it('should arrange multi-level layouts where child nodes require spacing out parent levels', function () {

		const node = {id: 1, width: 50, height: 10},
			childLayouts = {
				4: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}], nodes: { /* id */ 12: { id: 12, x: -20, width: 40, height: 10 } } },
				1: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}], nodes: { /* id */ 11: { id: 11, x: -20, width: 40, height: 10 } } }
			},
			result = combineVerticalSubtrees(node, childLayouts, 10);

		expect(result.levels).toEqual([{xOffset: -25, width: 50}, {xOffset: -65, width: 130}, {xOffset: -85, width: 170}]);

		expect(result.nodes[1].x).toEqual(-25);
		expect(result.nodes[11].x).toEqual(-65);
		expect(result.nodes[12].x).toEqual(25);
	});
	it('should not add a level if samelevel provided', function () {
		const node = {id: 1, width: 50, height: 10},
			childLayouts = {
				4: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}], nodes: { /* id */ 12: { id: 12, x: -20, width: 40, height: 10 } } },
				1: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}], nodes: { /* id */ 11: { id: 11, x: -20, width: 40, height: 10 } } }
			},
			result = combineVerticalSubtrees(node, childLayouts, 10, true);

		expect(result.levels).toEqual([{xOffset: -65, width: 130}, {xOffset: -85, width: 170}]);

		expect(result.nodes[1].x).toEqual(-25);
		expect(result.nodes[11].x).toEqual(-65);
		expect(result.nodes[12].x).toEqual(25);

	});
	it('should arrange children where left edge is not flat', function () {
		const node = { level: 1, width: 120, height: 60, id: 1, title: 'parent', x: -60 },
			childLayouts = {
				4: {
					nodes: {
						11: {
							level: 2,
							width: 100,
							height: 50,
							id: 11,
							title: 'child',
							x: -207
						}
					},
					levels: [
						{ width: 100, xOffset: -50}
					]
				},
				5: {
					nodes: {
						12: {
							level: 2,
							width: 240,
							height: 120,
							id: 12,
							title: 'second child',
							x: -102
						}
					},
					levels: [
						{width: 240, xOffset: -120}
					]
				}},
			result = combineVerticalSubtrees(node, childLayouts, 5);
		expect(result.levels).toEqual([{width: 120, xOffset: -60 }, { width: 345, xOffset: -172 }]);
	});
});
