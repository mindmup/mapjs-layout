/*global describe, it, expect, require*/
var layoutGeometry = require('../src/layout-geometry');
describe('layoutGeometry', function () {
	'use strict';
	describe('projectPointOnLineVector', function () {
		it('should project point on horizontal line', function () {
			expect(layoutGeometry.projectPointOnLineVector([2,0], [0,1], [1,0])).toEqual([2,1]);
		});
		it('should project point on vertical line', function () {
			expect(layoutGeometry.projectPointOnLineVector([0, 3], [1,0], [0,1])).toEqual([1,3]);
		});
		it('should project point onto an upward sloped line', function () {
			expect(layoutGeometry.projectPointOnLineVector([2, 3], [0,0], [1,2])).toEqual([8 / 5,16 / 5]);
		});
		it('should project point onto an downward sloped line', function () {
			expect(layoutGeometry.projectPointOnLineVector([0, -2], [0,0], [1,3])).toEqual([-3 / 5, -9 / 5]);
		});
		it('should project point on a line when it is the origin', function () {
			expect(layoutGeometry.projectPointOnLineVector([2,0], [2,0], [1,0])).toEqual([2,0]);
		});
		it('should project point on a line when it is not the origin', function () {
			expect(layoutGeometry.projectPointOnLineVector([3,0], [2,0], [1,0])).toEqual([3,0]);
		});
		describe('should throw invalid-args exception', function () {
			it('when vector is 0', function () {
				expect(function () {
					layoutGeometry.projectPointOnLineVector([3,0], [2,0], [0,0]);
				}).toThrow('invalid-args');
			});
		});

	});
});

