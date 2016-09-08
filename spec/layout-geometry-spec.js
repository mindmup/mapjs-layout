/*global describe, it, expect, require, beforeEach*/
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
	describe('orderPointsOnVector', function () {
		it('should order points on a horizontal line left to right', function () {
			expect(layoutGeometry.orderPointsOnVector([[2,1], [3,1], [0,1], [-2,1]], [0,1], [1,0])).toEqual([[-2,1], [0,1], [2,1], [3,1]]);
		});
		it('should order points on a horizontal line right to left', function () {
			expect(layoutGeometry.orderPointsOnVector([[2,1], [3,1], [0,1], [-2,1]], [0,1], [-1,0])).toEqual([[3,1], [2,1], [0,1], [-2,1]]);
		});
		it('should order points on a vertical line bottom to top', function () {
			expect(layoutGeometry.orderPointsOnVector([[1,2], [1,3], [1,0], [1, -2]], [1,0], [0,1])).toEqual([[1, -2], [1, 0], [1, 2], [1, 3]]);
		});
		it('should order points on a vertical line top to bottom', function () {
			expect(layoutGeometry.orderPointsOnVector([[1,2], [1,3], [1,0], [1, -2]], [1,0], [0,-1])).toEqual([[1, 3], [1, 2], [1, 0], [1, -2]]);
		});
		it('should order points on a sloped line top to bottom', function () {
			expect(layoutGeometry.orderPointsOnVector([[4, 2], [2, 4], [3, 3], [7, -1]], [3,3], [1,-1])).toEqual([[2, 4], [3, 3], [4, 2], [7, -1]]);
		});
		it('should order points on a sloped line bottom to top', function () {
			expect(layoutGeometry.orderPointsOnVector([[4, 2], [2, 4], [3, 3], [7, -1]], [3,3], [-1,1])).toEqual([[7, -1], [4, 2], [3, 3], [2, 4]]);
		});
	});
	describe('translatePoly', function () {
		it('should move all points of all regions in the poly', function () {
			expect(layoutGeometry.translatePoly([
				[[1,2], [2,3]],
				[[2,1], [3,2]]
			], [2,3])).toEqual([
				[[3,5], [4,6]],
				[[4,4], [5,5]]
			]);
		});
	});
	describe('addVectors', function () {
		it('should add vectors', function () {
			expect(layoutGeometry.addVectors([1,2], [3,4])).toEqual([4,6]);
		});
		describe('should throw exception', function () {
			it('when vector1 is falsy', function () {
				expect(function () {
					layoutGeometry.addVectors(undefined, [3,4]);
				}).toThrow();
			});
			it('when vector2 is falsy', function () {
				expect(function () {
					layoutGeometry.addVectors([1,2]);
				}).toThrow();
			});
			it('when result is not a number', function () {
				expect(function () {
					layoutGeometry.addVectors([1, 'a'], [3,4]);
				}).toThrow();
			});
		});
	});
	describe('subtractVectors', function () {
		it('should subtract vectors', function () {
			expect(layoutGeometry.subtractVectors([1,2], [3,4])).toEqual([-2,-2]);
		});
		describe('should throw exception', function () {
			it('when vector1 is falsy', function () {
				expect(function () {
					layoutGeometry.subtractVectors(undefined, [3,4]);
				}).toThrow();
			});
			it('when vector2 is falsy', function () {
				expect(function () {
					layoutGeometry.subtractVectors([1,2]);
				}).toThrow();
			});
			it('when result is not a number', function () {
				expect(function () {
					layoutGeometry.subtractVectors([1, 'a'], [3,4]);
				}).toThrow();
			});
		});
	});
	describe('translatePoly', function () {
		it('should translate a single point in a single region', function () {
			expect(layoutGeometry.translatePoly([[[1,2]]], [2,3])).toEqual([[[3,5]]]);
		});
		it('should translate a multiple points in a multiple regions', function () {
			var poly = [
					[
						[1,2], [3,4]
					],
					[
						[2,4], [6,8]
					]
				];
			expect(layoutGeometry.translatePoly(poly, [2,3])).toEqual([
					[
						[3,5], [5,7]
					],
					[
						[4,7], [8,11]
					]
				]);
		});
	});
	describe('firstProjectedPolyPointOnVector', function () {
		var poly;
		beforeEach(function () {
			poly = [
				[
					[10,90], [90,90], [90, 10], [10, 10]
				]
			];
		});
		it('should return first projected point for horizontal vector', function () {
			expect(layoutGeometry.firstProjectedPolyPointOnVector(poly, [0,0], [1,0])).toEqual([10,90]);
		});
	});
});


