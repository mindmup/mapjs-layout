/*global module, require*/
var _ = require('underscore'),
	PolyBool = require('polybooljs'),
	dotProduct = function (p1, p2) {
		'use strict';
		return (p1[0] * p2[0]) + (p1[1] * p2[1]);
	},
	polygonIntersectionPoints = function (poly1, poly2) {
		'use strict';
		var toPolyBoolPoly = function (poly) {
				return {
					regions: poly,
					inverted: false
				};
			},
			intersection = PolyBool.intersect(toPolyBoolPoly(poly1), toPolyBoolPoly(poly2));
		return _.flatten(intersection.regions, true);
	},
	projectPointOnLineVector = function (point, vectorOrigin, vector) {
		'use strict';
		var pointVector = [point[0] - vectorOrigin[0], point[1] - vectorOrigin[1]],
			valDp = dotProduct(vector, pointVector),
			len2 = dotProduct(vector, vector),
			resultVector = [
				vectorOrigin[0] + ((valDp * vector[0]) / len2),
				vectorOrigin[1] + ((valDp * vector[1]) / len2)
			];
		if (!vector[0] && !vector[1]) {
			throw 'invalid-args';
		}
		// console.log('point', point, 'vectorOrigin', vectorOrigin, 'vector', vector, 'pointVector', pointVector, 'valDp', valDp, 'len2', len2);
		return resultVector;
	},
	orderPointsOnVector = function (points, vectorOrigin, vector) {
		'use strict';
		return _.sortBy(points, function (point) {
			var dx = point[0] - vectorOrigin[0],
				dy = point[1] - vectorOrigin[1],
				val = dx === 0 ? dy / vector[1] : dx / vector[0],
				sign = val >= 0 ? 1 : -1;
			return sign * (Math.pow(dx, 2) + Math.pow(dy, 2));
		});
	},
	tolayoutPolygon = function (layout) {
		'use strict';
		var minX =  0,
			maxX = 0,
			minY = 0,
			maxY = 0;
		_.each(layout, function (node) {
			minX = Math.min(minX, node.x);
			maxX = Math.max(maxX, node.x + node.width);
			minY = Math.min(minY, node.y);
			maxY = Math.max(maxY, node.y + node.width);
		});
		return [
			[
				[minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]
			]
		];
	},
	translatePoly = function (poly, translation) {
		'use strict';
		return poly.map(function (region) {
			return region.map(function (point) {
				return [point[0] + translation[0], point[1] + translation[1]];
			});
		});
	},
	firstProjectedPolyPointOnVector = function (poly, vectorOrigin, vector) {
		'use strict';
		var polyPoints = _.flatten(poly, true),
			intersectionsOnLine = polyPoints.map(function (intersection) {
				return projectPointOnLineVector(intersection, vectorOrigin, vector);
			}),
			orderedIntersectionsOnLine = orderPointsOnVector(intersectionsOnLine, vectorOrigin, vector);
		return orderedIntersectionsOnLine.length && orderedIntersectionsOnLine[0];
	},
	furthestIntersectionPoint = function (poly1, poly2, vectorOrigin, vector) {
		'use strict';
		var intersections = polygonIntersectionPoints(poly1, poly2),
			intersectionsOnLine = intersections.map(function (intersection) {
				return projectPointOnLineVector(intersection, vectorOrigin, vector);
			}),
			orderedIntersectionsOnLine = orderPointsOnVector(intersectionsOnLine, vectorOrigin, vector);
		return orderedIntersectionsOnLine.pop();
	};

module.exports = {
	tolayoutPolygon: tolayoutPolygon,
	furthestIntersectionPoint: furthestIntersectionPoint,
	projectPointOnLineVector: projectPointOnLineVector,
	orderPointsOnVector: orderPointsOnVector,
	firstProjectedPolyPointOnVector: firstProjectedPolyPointOnVector,
	translatePoly: translatePoly
};
