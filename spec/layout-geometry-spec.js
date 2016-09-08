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
		var points;
		describe('when vector is horizontal', function () {
			beforeEach(function () {
				points = [[2,1], [3,1], [0,1], [-2,1]];
			});
			it('should order points left to right', function () {
				expect(layoutGeometry.orderPointsOnVector(points, [0,1], [1,0])).toEqual([[0,1], [2,1], [3,1]]);
			});
			it('should order points right to left', function () {
				expect(layoutGeometry.orderPointsOnVector(points, [0,1], [-1,0])).toEqual([[0,1], [-2,1]]);
			});

		});
		describe('when vector is vertical', function () {
			beforeEach(function () {
				points = [[1,2], [1,3], [1,0], [1, -2]];
			});
			it('should order points bottom to top', function () {
				expect(layoutGeometry.orderPointsOnVector(points, [1,0], [0,1])).toEqual([[1, 0], [1, 2], [1, 3]]);
			});
			it('should order points top to bottom', function () {
				expect(layoutGeometry.orderPointsOnVector(points, [1,0], [0,-1])).toEqual([[1, 0], [1, -2]]);
			});
		});
		describe('when line is sloped', function () {
			beforeEach(function () {
				points = [[4, 2], [2, 4], [3, 3], [7, -1]];
			});
			it('should order points top to bottom', function () {
				expect(layoutGeometry.orderPointsOnVector(points, [3,3], [1,-1])).toEqual([[3, 3], [4, 2], [7, -1]]);
			});
			it('should order points bottom to top', function () {
				expect(layoutGeometry.orderPointsOnVector(points, [3,3], [-1,1])).toEqual([[3, 3], [2, 4]]);
			});

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
		var poly, origin1, origin2, origin3, vector, vectorReversed, projection1, projection2;
		beforeEach(function () {
			poly = [
				[
					[10,40], [40,40], [40, 10], [40, 10]
				]
			];
		});
		describe('should return first projected point', function () {
			beforeEach(function () {
				vector = [1,0];
				vectorReversed = [-1, 0];
				origin1 = [10,50];
				origin2 = [20,50];
				origin3 = [50,50];
				projection1 = [10,50];
				projection2 = [40,50];
			});
			it('when all points are after the origin', function () {
				expect(layoutGeometry.firstProjectedPolyPointOnVector(poly, origin1, vector)).toEqual(projection1);
			});
			it('when some points are after the origin', function () {
				expect(layoutGeometry.firstProjectedPolyPointOnVector(poly, origin2, vector)).toEqual(projection2);
			});
			it('should return falsy when all points are before the origin', function () {
				expect(layoutGeometry.firstProjectedPolyPointOnVector(poly, origin3, vector)).toBeFalsy();
			});
		});
	});
});


