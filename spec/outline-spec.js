/*global describe, expect, it, require, beforeEach*/
var outlineUtils = require('../src/outline');

describe('outlineUtils', function () {
	'use strict';
	describe('borderLength', function () {
		it('should calculate length of a border', function () {
			var result;

			result = outlineUtils.borderLength([{ l: 100, h: -10 }, { l: 200, h: -50 }]);

			expect(result).toBe(300);
		});
	});
	describe('borderSegmentIndexAt',
		[
			['returns element at length if exists', [{ l: 50, h: -10 }, { l: 100, h: -30 }], 70, 1],
			['returns -1 if too short', [{ l: 50, h: -10 }, { l: 100, h: -30 }], 151, -1],
			['returns right segment if on spot', [{ l: 50, h: -10 }, { l: 100, h: -30 }], 50, 1],
			['returns initial segment if length 0', [{ l: 50, h: -10 }, { l: 100, h: -30 }], 0, 0],
			['returns -1 on right border', [{ l: 50, h: -10 }, { l: 100, h: -30 }], 150, -1]
		],
		function (border, length, expected) {
			var result;

			result = outlineUtils.borderSegmentIndexAt(border, length);

			expect(result).toBe(expected);
		}
	);
	describe('extending borders',
		[
			['should preserve first border if second is shorter', [{h: -10, l: 3}], [{h: -20, l: 1}], [{h: -10, l: 3}]],
			['should preserve total length when first border is shorter', [{h: -30, l: 12}], [{h: -10, l: 6}, {h: -20, l: 8}], [{h: -30, l: 12}, {h:  -20, l:  2}]],
			['should preserve extend with segment of second border if second is longer', [{h: -10, l: 3}], [{h: -20, l: 5}], [{h: -10, l: 3}, {h:  -20, l: 2}]],
			['should skip second border elements before end of first border', [{h: -10, l: 3}], [{h: -20, l: 1}, {h:  -30, l:  4}], [{h: -10, l: 3}, {h:  -30, l: 2}]],
			['should skip second border elements aligned with the end of first border', [{h: -10, l: 3}], [{h: -20, l: 3}, {h:  -30, l:  4}], [{h: -10, l: 3}, {h:  -30, l: 4}]],
			['should skip second border elements aligned with the end of first border', [{h: -10, l: 1}, {h: -20, l: 2}, {h: -30, l: 3}], [{h: -20, l: 4}, {h:  -30, l:  3}, {h:  -50, l:  5 }], [{h: -10, l: 1}, {h:  -20, l: 2}, {h:  -30, l:  3}, {h:  -30, l:  1 }, {h:  -50, l: 5 }]]
		],
		function (firstBorder, secondBorder, expected) {
			var result;
			result = outlineUtils.extendBorder(firstBorder, secondBorder);
			expect(result).toEqual(expected);
		}
	);
	describe('Outline', function () {
		var dimensionProvider;
		beforeEach(function () {
			dimensionProvider = function (content) {
				var parts = content.title.split('x');
				return {
					width: parseInt(parts[0], 10),
					height: parseInt(parts[1], 10)
				};
			};
		});
		it('should create an outline from a single idea', function () {
			var result, content = { title: '20x10' };

			result = outlineUtils.outlineFromDimensions(dimensionProvider(content));

			expect(result.borders()).toEqual({
				top: [{
					h: -5,
					l: 20
				}],
				bottom: [{
					h: 5,
					l: 20
				}]
			});

		});
		it('should be calculate spacing between simple outlines', function () {
			var outline1 = new outlineUtils.Outline([{ h: -35, l: 50}], [{ h: 35, l: 50}]),
				outline2 = new outlineUtils.Outline([{ h: -40, l: 120}], [{ h: 40, l: 120}]),
				result;

			result = outline1.spacingAbove(outline2);

			expect(result).toBe(75);
		});
		it('should calculate spacing between more complex outlines', function () {

			var outline1 = new outlineUtils.Outline([{'h': -17, 'l': 23}, {'l': 123, 'h': -17}], [{'h': 17, 'l': 23}, {'l': 123, 'h': 17}]),
				outline2 = new outlineUtils.Outline([{'h': -17, 'l': 107}, {'l': 33, 'h': -39}], [{'h': 17, 'l': 107}, {'l': 33, 'h': 39}]),
				result = outline1.spacingAbove(outline2);

			expect(result).toBe(56);
		});
		it('should calculate spacing between even more complex outlines', function () {
			var outline1 = new outlineUtils.Outline([
				{
					'h': -17,
					'l': 57.5
				},
				{
					'l': 107.5,
					'h': -71
				},
				{
					'l': 85,
					'h': 37
				}
			],
			[
				{
					'h': 17,
					'l': 57.5
				},
				{
					'l': 192.5,
					'h': 71
				}
			]),
			outline2 = new outlineUtils.Outline([
				{
					'h': -17,
					'l': 30
				},
				{
					'l': 50,
					'h': -17
				}
			],
			[
				{
					'h': 17,
					'l': 30
				},
				{
					'l': 50,
					'h': 17
				}
			]),
			result = outline1.spacingAbove(outline2);
			expect(result).toBe(88);
		});
		describe('indent', function () {
			it('should indent the outline by inserting a thin line in the middle at the start', function () {
				var outline = new outlineUtils.Outline([{ h: -40, l: 120}, { h: -20, l: 20}], [{ h: 40, l: 100}, {h: 20, l: 20}]),
					result;

				result = outline.indent(11, 8);

				expect(result.top).toEqual([{h: -4, l: 11}, { h: -40, l: 120}, { h: -20, l: 20}]);
				expect(result.bottom).toEqual([{h: 4, l: 11}, { h: 40, l: 100}, {h: 20, l: 20}]);
			});
			it('should center the inserted line based on initial height', function () {
				var outline = new outlineUtils.Outline([{ h: -40, l: 120}, { h: -20, l: 20}], [{ h: -20, l: 100}, {h: 20, l: 20}]),
					result;

				result = outline.indent(11, 8);

				expect(result.top).toEqual([{h: -34, l: 11}, { h: -40, l: 120}, { h: -20, l: 20}]);
				expect(result.bottom).toEqual([{h: -26, l: 11}, { h: -20, l: 100}, {h: 20, l: 20}]);
			});
		});
		describe('insertAtStart', function () {
			it('should add a box at the start of an outline, and extend the existing outline by a margin', function () {
				var outline2 = new outlineUtils.Outline([{ h: -40, l: 120}], [{ h: 40, l: 120}]),
					result;

				result = outline2.insertAtStart({width: 30, height: 100}, 10);

				expect(result.top).toEqual([{ h: -50, l: 30}, { h: -40, l: 130}]);
				expect(result.bottom).toEqual([{ h: 50, l: 30}, {h: 40, l: 130}]);

			});
			it('does not move the outline vertically (regression check)', function () {
				var outline2 = new outlineUtils.Outline([{ h: -4, l: 120}], [{ h: 30, l: 120}]),
					result;

				result = outline2.insertAtStart({width: 30, height: 100}, 10);

				expect(result.top).toEqual([{ h: -50, l: 30}, { h: -4, l: 130}]);
				expect(result.bottom).toEqual([{ h: 50, l: 30}, {h: 30, l: 130}]);

			});
			it('shortens the initial box into 1/2 and expands the outline if outline is taller than box', function () {
				var outline2 = new outlineUtils.Outline([{ h: -40, l: 120}], [{ h: 40, l: 120}]),
					result;

				result = outline2.insertAtStart({width: 30, height: 20}, 10);

				expect(result.top).toEqual([{ h: -10, l: 15},  { h: -40, l: 145}]);
				expect(result.bottom).toEqual([{ h: 10, l: 15}, {h: 40, l: 145}]);
			});
		});
		describe('expand', function () {
			it('should expand borders so that the initial height matches arguments', function () {
				var outline = new outlineUtils.Outline([{h: -10, l: 10}, {h: -110, l: 20}], [{h: 10, l: 10}, {h: 110, l: 20}]),
					result = outline.expand(-50, 33);
				expect(result.top).toEqual([{h: -50, l: 10}, {h: -150, l: 20}]);
				expect(result.bottom).toEqual([{h: 33, l: 10}, {h: 133, l: 20}]);
			});
		});
		it('should calculate spacing between more complex outlines', function () {
			var outline1 = new outlineUtils.Outline([], [{ h: 5, l: 6}, { h: 15, l: 8 }]),
				outline2 = new outlineUtils.Outline([{ h: -10, l: 12}], []),
				result;

			result = outline1.spacingAbove(outline2);

			expect(result).toBe(25);

		});
		it('should be able to stack simple outlines', function () {
			var outline1 = new outlineUtils.Outline([{ h: -35, l: 50}], [{ h: 35, l: 50}]),
				outline2 = new outlineUtils.Outline([{ h: -40, l: 120}], [{ h: 40, l: 120}]),
				result;

			result = outline2.stackBelow(outline1, 10);

			expect(result.borders()).toEqual({
				top: [{ h: -35, l: 50}, {h: 45, l: 70}],
				bottom: [{h: 125, l: 120}]
			});
		});
		it('should be able to stack outlines with more complex borders', function () {
			var outline1 = new outlineUtils.Outline([{ h: -5, l: 6}, {h: -15, l: 8}], [{h: 5, l: 6}, {h: 15, l: 8}]),
				outline2 = new outlineUtils.Outline([{ h: -10, l: 12}], [{ h: 10, l: 12}]),
				result;

			result = outline2.stackBelow(outline1, 10);

			expect(result.borders()).toEqual({
				top: [{ h: -5, l: 6}, {h: -15, l: 8}],
				bottom: [{h: 45, l: 12}, {h: 15, l: 2}]
			});
		});
		it('should be able to stack outlines with more complex borders', function () {
			var outline1 = new outlineUtils.Outline([
				{'h': -17, 'l': 57.5 },
				{'l': 107.5, 'h': -71},
				{'l': 85, 'h': 37}
			],
			[
				{'h': 17, 'l': 57.5},
				{'l': 192.5, 'h': 71}
			]),
				outline2 = new outlineUtils.Outline([
				{'h': -17, 'l': 30},
				{'l': 50, 'h': -17}
			],
			[
				{'h': 17, 'l': 30},
				{'l': 50, 'h': 17}
			]),
				result;

			result = outline2.stackBelow(outline1, 10);

			expect(result.borders()).toEqual({
				top : [{ h : -17, l : 57.5 }, { l : 107.5, h : -71 }, { l : 85, h : 37 }],
				bottom : [{ l : 30, h : 115 }, { l : 50, h : 115 }, { h : 71, l : 170 }]
			});

			//
		});
	});
});
