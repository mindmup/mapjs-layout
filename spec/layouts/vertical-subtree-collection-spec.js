/* global describe, it, expect, require */
/*global describe, it, expect, require */
var VerticalSubtreeCollection = require('../../src/layouts/vertical-subtree-collection');
describe('Vertical Subtree Collection', function () {
	'use strict';
	describe('getLevelWidth', function () {
		it('returns the combined width of all subtrees at a particular level', function () {
			var underTest = new VerticalSubtreeCollection({
					/* rank */ 4: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}]},
					/* rank */ 1: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}]}
				}, 10);
			expect(underTest.getLevelWidth(0)).toEqual(90);
			expect(underTest.getLevelWidth(1)).toEqual(170);
		});
		it('works with unbalanced trees', function () {
			var underTest = new VerticalSubtreeCollection({
					/* rank */ 4: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}]},
					/* rank */ 1: { levels: [{xOffset: -20, width: 40}]}
				}, 10);
			expect(underTest.getLevelWidth(0)).toEqual(90);
			expect(underTest.getLevelWidth(1)).toEqual(80);
		});
	});
	describe('getLevelWidths', function () {
		it('returns an array of combined level widths', function () {
			var underTest = new VerticalSubtreeCollection({
					/* rank */ 4: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}]},
					/* rank */ 1: { levels: [{xOffset: -20, width: 40}]}
				}, 10);
			expect(underTest.getLevelWidths()).toEqual([90, 80]);
		});
		it('works', function () {
			var underTest = new VerticalSubtreeCollection({
					/* rank */ 4: { levels: [{xOffset: -20, width: 40}], nodes: { /* id */ 14: { id: 14, x: -20, width: 40, height: 10 } } },
					/* rank */ '-1': { levels: [{xOffset: -20, width: 40}], nodes: { /* id */ 12: { id: 12, x: -20, width: 40, height: 10 } } },
					/* rank */ 1: { levels: [{xOffset: -20, width: 40}], nodes: { /* id */ 13: { id: 13, x: -20, width: 40, height: 10 } } },
					/* rank */ '-4': { levels: [{xOffset: -20, width: 40}], nodes: { /* id */ 11: { id: 11, x: -20, width: 40, height: 10 } } }
				});
			expect(underTest.getLevelWidths()).toEqual([160]);
		});
	});
	describe('isEmpty', function () {
		it('checks if there are any subtrees', function () {
			expect(new VerticalSubtreeCollection({
				/* rank */ 4: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}]},
				/* rank */ 1: { levels: [{xOffset: -20, width: 40}]}
			}, 10).isEmpty()).toBeFalsy();
			expect(new VerticalSubtreeCollection({
				/* rank */ 1: { levels: [{xOffset: -20, width: 40}]}
			}, 10).isEmpty()).toBeFalsy();
			expect(new VerticalSubtreeCollection({}, 10).isEmpty()).toBeTruthy();
			expect(new VerticalSubtreeCollection(false, 10).isEmpty()).toBeTruthy();
		});
	});
	describe('sortByRank', function () {
		it('sorts subtrees by rank', function () {
			var underTest = new VerticalSubtreeCollection({
				/* rank */ 4: { levels: [{xOffset: -20, width: 40}], id: 1},
				/* rank */ '-1': { levels: [{xOffset: -20, width: 40}], id: 2},
				/* rank */ 1: { levels: [{xOffset: -20, width: 40}], id: 3},
				/* rank */ '-4': { levels: [{xOffset: -20, width: 40}], id: 4}
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
	describe('widestLevelWidth', function () {
		it('returns the width including margins for the widest level', function () {
			var underTest = new VerticalSubtreeCollection({
				/* rank */ 4: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}]},
				/* rank */ 1: { levels: [{xOffset: -20, width: 40}]}
			}, 10);
			expect(underTest.widestLevelWidth()).toEqual(90);
		});
	});
	describe('widestLevelIndex', function () {
		it('returns the width including margins for the widest level', function () {
			var underTest = new VerticalSubtreeCollection({
				/* rank */ 4: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 300}]},
				/* rank */ 1: { levels: [{xOffset: -20, width: 40}]}
			}, 10);
			expect(underTest.widestLevelIndex()).toEqual(1);
		});
	});
	describe('existsOnLevel', function () {
		it('returns true if the subtree with a particular rank existis level', function () {
			var underTest = new VerticalSubtreeCollection({
				/* rank */ 4: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 300}]},
				/* rank */ 1: { levels: [{xOffset: -20, width: 40}]}
			}, 10);
			expect(underTest.existsOnLevel(4, 1)).toBeTruthy();
			expect(underTest.existsOnLevel(4, 0)).toBeTruthy();
			expect(underTest.existsOnLevel(1, 1)).toBeFalsy();
			expect(underTest.existsOnLevel(1, 0)).toBeTruthy();
		});
	});
	describe('getExpectedTranslation', function () {
		it('returns the expected horizontal translation to bring the left-most node of the combined tree is aligned to x=0', function () {
			var childLayouts = {
				/* rank */ 4: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}] },
				/* rank */ 1: { levels: [{xOffset: -20, width: 40}, {xOffset: -35, width: 70}] }
			},
			underTest = new VerticalSubtreeCollection(childLayouts, 10);
			expect(underTest.getExpectedTranslation(1)).toEqual(35);
			expect(underTest.getExpectedTranslation(4)).toEqual(120);
		});
		/* what if the left-most does not exist on the widest level ? */
	});
	describe('getMergedLevels', function () {
		it('returns an array of level widths and offsets aligned to the widest level offset', function () {
			var childLayouts = {
					/* rank */ 4: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}] },
					/* rank */ 1: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 80}] }
				},
				underTest = new VerticalSubtreeCollection(childLayouts, 10);

			expect(underTest.getMergedLevels(-100)).toEqual([{xOffset: -80, width: 130}, {xOffset: -100, width: 170}]);
		});
		/*
		it('works if the left-most does not exist on the widest level', function () {
			var childLayouts = {
					4: { levels: [{xOffset: -20, width: 40}, {xOffset: -200, width: 400}] },
					1: { levels: [{xOffset: -20, width: 40}] }
				},
				underTest = new VerticalSubtreeCollection(childLayouts, 10);

			expect(underTest.getMergedLevels(-200)).toEqual([{xOffset: -70, width: 90}, {xOffset: -200, width: 400}]);

		});
		it('works if the levels have the same width', function () {
			var childLayouts = {
					4: { levels: [{xOffset: -20, width: 40}, {xOffset: -40, width: 90}] },
					1: { levels: [{xOffset: -20, width: 40}] }
				},
				underTest = new VerticalSubtreeCollection(childLayouts, 10);

			expect(underTest.getMergedLevels(-100)).toEqual([{xOffset: -80, width: 130}, {xOffset: -100, width: 170}]);
		});*/
	});
});
