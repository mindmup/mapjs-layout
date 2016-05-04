/* global describe, it, expect, require */
/*global describe, it, expect, require */
var VerticalSubtreeCollection = require('../../src/layouts/vertical-subtree-collection');
describe('Vertical Subtree Collection', function () {
	'use strict';
	describe('getLevelWidth', function () {
		it('returns the combined width of all subtrees at a particular level', function () {
			var underTest = new VerticalSubtreeCollection({
					4: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}]},
					1: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}]}
				}, 10);
			expect(underTest.getLevelWidth(0)).toEqual(130);
			expect(underTest.getLevelWidth(1)).toEqual(170);
		});
		it('works with unbalanced trees', function () {
			var underTest = new VerticalSubtreeCollection({
					4: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}]},
					1: { levels: [{xOffset: -20, width: 40}]}
				}, 10);
			expect(underTest.getLevelWidth(0)).toEqual(90);
			expect(underTest.getLevelWidth(1)).toEqual(80);
		});
		it('should', function () {
			var childLayouts = {
				4: {
					levels: [{ width: 100,xOffset: -50}]
				},
				5: {
					levels: [{width: 240,xOffset: -120}]
				}},
				underTest = new VerticalSubtreeCollection(childLayouts, 5);
			expect(underTest.getLevelWidth(0)).toEqual(345);
		});
	});
	describe('getLevelWidths', function () {
		it('returns an array of combined level widths', function () {
			var underTest = new VerticalSubtreeCollection({
					4: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}]},
					1: { levels: [{xOffset: -20, width: 40}]}
				}, 10);
			expect(underTest.getLevelWidths()).toEqual([90, 80]);
		});
		it('defaults margin to 0', function () {
			var underTest = new VerticalSubtreeCollection({
					4: { levels: [{xOffset: -20, width: 40}], nodes: { /* id */ 14: { id: 14, x: -20, width: 40, height: 10 } } },
					'-1': { levels: [{xOffset: -20, width: 40}], nodes: { /* id */ 12: { id: 12, x: -20, width: 40, height: 10 } } },
					1: { levels: [{xOffset: -20, width: 40}], nodes: { /* id */ 13: { id: 13, x: -20, width: 40, height: 10 } } },
					'-4': { levels: [{xOffset: -20, width: 40}], nodes: { /* id */ 11: { id: 11, x: -20, width: 40, height: 10 } } }
				});
			expect(underTest.getLevelWidths()).toEqual([160]);
		});
	});
	describe('isEmpty', function () {
		it('checks if there are any subtrees', function () {
			expect(new VerticalSubtreeCollection({
				4: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}]},
				1: { levels: [{xOffset: -20, width: 40}]}
			}, 10).isEmpty()).toBeFalsy();
			expect(new VerticalSubtreeCollection({
				1: { levels: [{xOffset: -20, width: 40}]}
			}, 10).isEmpty()).toBeFalsy();
			expect(new VerticalSubtreeCollection({}, 10).isEmpty()).toBeTruthy();
			expect(new VerticalSubtreeCollection(false, 10).isEmpty()).toBeTruthy();
		});
	});
	describe('sortByRank', function () {
		it('sorts subtrees by rank', function () {
			var underTest = new VerticalSubtreeCollection({
				4: { levels: [{xOffset: -20, width: 40}], id: 1},
				'-1': { levels: [{xOffset: -20, width: 40}], id: 2},
				1: { levels: [{xOffset: -20, width: 40}], id: 3},
				'-4': { levels: [{xOffset: -20, width: 40}], id: 4}
			}, 10);
			expect(underTest.sortByRank().map(function (subtree) {
				return subtree.id;
			})).toEqual([4,2,3,1]);
		});
		it('returns an empty array if no subtrees', function () {
			var underTest = new VerticalSubtreeCollection({}, 10);
			expect(underTest.sortByRank()).toEqual([]);
		});
	});
	describe('existsOnLevel', function () {
		it('returns true if the subtree with a particular rank existis level', function () {
			var underTest = new VerticalSubtreeCollection({
				4: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 300}]},
				1: { levels: [{xOffset: -20, width: 40}]}
			}, 10);
			expect(underTest.existsOnLevel(4, 1)).toBeTruthy();
			expect(underTest.existsOnLevel(4, 0)).toBeTruthy();
			expect(underTest.existsOnLevel(1, 1)).toBeFalsy();
			expect(underTest.existsOnLevel(1, 0)).toBeTruthy();
		});
	});
	describe('getExpectedTranslation', function () {
		it('returns the expected horizontal translation for a single subtree with one level', function () {
			var childLayouts = {
				1: { levels: [{xOffset: -20, width: 40}] }
			},
			underTest = new VerticalSubtreeCollection(childLayouts, 10);
			expect(underTest.getExpectedTranslation(1)).toEqual(20);
		});
		it('returns the expected horizontal translation for a single subtree with two levels of same width', function () {
			var childLayouts = {
				1: { levels: [{xOffset: -20, width: 40}, {xOffset: -20, width: 40}] }
			},
			underTest = new VerticalSubtreeCollection(childLayouts, 10);
			expect(underTest.getExpectedTranslation(1)).toEqual(20);
		});
		it('returns the expected horizontal translation for a single subtree with two levels of different widths', function () {
			var childLayouts = {
				1: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}] }
			},
			underTest = new VerticalSubtreeCollection(childLayouts, 10);
			expect(underTest.getExpectedTranslation(1)).toEqual(20);
		});

		it('returns the expected horizontal translation for a multiple subtrees with a single level', function () {
			var childLayouts = {
				1: { levels: [{xOffset: -20, width: 40}]},
				2: { levels: [{xOffset: -20, width: 40}]},
				3: { levels: [{xOffset: -20, width: 40}]}
			},
			underTest = new VerticalSubtreeCollection(childLayouts, 10);
			expect(underTest.getExpectedTranslation(1)).toEqual(20);
			expect(underTest.getExpectedTranslation(2)).toEqual(70);
			expect(underTest.getExpectedTranslation(3)).toEqual(120);
		});
		it('returns the expected horizontal translation for a multiple subtrees where first rank has a multiple levels', function () {
			var childLayouts = {
				1: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}]},
				2: { levels: [{xOffset: -20, width: 40}]},
				3: { levels: [{xOffset: -20, width: 40}]}
			},
			underTest = new VerticalSubtreeCollection(childLayouts, 10);
			expect(underTest.getExpectedTranslation(1)).toEqual(20);
			expect(underTest.getExpectedTranslation(2)).toEqual(70);
			expect(underTest.getExpectedTranslation(3)).toEqual(120);
		});
		it('returns the expected horizontal translation for a multiple subtrees where both have a multiple levels', function () {
			var childLayouts = {
				1: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}]},
				2: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}]}
			},
			underTest = new VerticalSubtreeCollection(childLayouts, 10);
			expect(underTest.getExpectedTranslation(1)).toEqual(20);
			expect(underTest.getExpectedTranslation(2)).toEqual(110);
		});

		it('packs subtrees on left that do not exist on the widest level as close to center as possible given margin ', function () {
			var childLayouts = {
					4: { levels: [{xOffset: -20, width: 40}, {xOffset: -200, width: 400}] },
					1: { levels: [{xOffset: -20, width: 40}] }
				},
				underTest = new VerticalSubtreeCollection(childLayouts, 10);
			expect(underTest.getExpectedTranslation(1)).toEqual(20);
			expect(underTest.getExpectedTranslation(4)).toEqual(70);
		});

		/* what if the left-most does not exist on the widest level ? */
	});
	describe('getMergedLevels', function () {
		it('returns an array of level widths and offsets aligned to the widest level offset', function () {
			var childLayouts = {
					4: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}] },
					1: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}] }
				},
				underTest = new VerticalSubtreeCollection(childLayouts, 10);

			expect(underTest.getMergedLevels()).toEqual([{xOffset: -65, width: 130}, {xOffset: -85, width: 170}]);
		});
		it('works if the left-most does not exist on the widest level', function () {
			var childLayouts = {
					4: { levels: [{xOffset: -20, width: 40}, {xOffset: -200, width: 400}] },
					1: { levels: [{xOffset: -20, width: 40}] }
				},
				underTest = new VerticalSubtreeCollection(childLayouts, 10);

			expect(underTest.getMergedLevels()).toEqual([{xOffset: -45, width: 90}, {xOffset: -175, width: 400}]);

		});
		it('should return merged single level subtrees with different widths', function () {
			var childLayouts = {
				4: {
					levels: [{ width: 100,xOffset: -50}]
				},
				5: {
					levels: [{width: 240,xOffset: -120}]
				}},
				underTest = new VerticalSubtreeCollection(childLayouts, 5);
			expect(underTest.getMergedLevels()).toEqual([{ width: 345, xOffset: -172 }]);
		});
	});
});
