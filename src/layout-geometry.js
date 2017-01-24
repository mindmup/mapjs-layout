/*global module, require, isNaN, console*/
const _ = require('underscore'),
	PolyBool = require('polybooljs'),
	convexHull = require('monotone-convex-hull-2d'),
	dotProduct = function (p1, p2) {
		'use strict';
		return (p1[0] * p2[0]) + (p1[1] * p2[1]);
	},
	unitVector = function (vector) {
		'use strict';
		const magnitude = Math.sqrt(Math.pow(vector[0], 2) +  Math.pow(vector[1], 2));
		if (magnitude === 0) {
			return [0, 0];
		}
		return [vector[0] / magnitude, vector[1] / magnitude];
	},
	toPolyBoolPoly = function (poly) {
		'use strict';
		return {
			regions: poly,
			inverted: false
		};
	},
	arePointsEqual = function (p1, p2) {
		'use strict';
		return p1 && p2 && p1.length === 2 && p2.length === 2 && p1[0] === p2[0] && p1[1] === p2[1];
	},
	areShapesEqual = function (shape1, shape2) {
		'use strict';
		if (!shape1 || !shape2 || shape1.length !== shape2.length) {
			return false;
		}
		return _.filter(shape1, function (p1) {
			return _.filter(shape2, function (p2) {
				return arePointsEqual(p1, p2);
			}).length;
		}).length === shape1.length;
	},
	polygonsAreEqual = function (poly1, poly2) {
		'use strict';
		const matchingShapes = function () {
			return  _.filter(poly1, function (shape1) {
				return _.filter(poly2, function (shape2) {
					return areShapesEqual(shape1, shape2);
				}).length;
			});
		};
		if (poly1.length > poly2.length) {
			return false;
		}

		// if (true || matchingShapes.length) {
		// 	console.log('matchingShapes.length === poly1.length', matchingShapes.length === poly1.length, 'matchingShapes', matchingShapes, 'poly1', poly1, 'poly2', poly2);

		// }
		return matchingShapes().length === poly1.length;
	},
	shapeContainingIntersection = function (poly, intersection) {
		'use strict';
		const pbIntersection = toPolyBoolPoly(intersection),
			containingShape = _.find(poly, function (shape) {
				const pbShape = toPolyBoolPoly([shape]),
					shapeIntersection =  PolyBool.intersect(pbIntersection, pbShape);
				return (polygonsAreEqual(intersection, shapeIntersection.regions));
			});
		return containingShape && containingShape.length && containingShape;
	},
	polygonIntersectionPoints = function (poly1, poly2) {
		'use strict';
		const pbPoly1 = toPolyBoolPoly(poly1),
			pbPoly2 = toPolyBoolPoly(poly2),
			intersection =  PolyBool.intersect(pbPoly1, pbPoly2),
			isSameAsPoly1 = polygonsAreEqual(poly1, intersection.regions),
			isContained = isSameAsPoly1 && !polygonsAreEqual(intersection.regions, poly2),
			containingShape = isContained && shapeContainingIntersection(poly2, intersection.regions);

		if (containingShape) {
			return containingShape;
		}
		return _.flatten(intersection.regions, true);
	},
	projectPointOnLineVector = function (point, vectorOrigin, vector) {
		'use strict';
		const pointVector = [point[0] - vectorOrigin[0], point[1] - vectorOrigin[1]],
			valDp = dotProduct(vector, pointVector),
			len2 = dotProduct(vector, vector),
			resultVector = [
				vectorOrigin[0] + ((valDp * vector[0]) / len2),
				vectorOrigin[1] + ((valDp * vector[1]) / len2)
			];
		if (!vector[0] && !vector[1]) {
			throw 'invalid-args';
		}
		return resultVector;
	},

	orderPointsOnVector = function (points, vectorOrigin, vector, pointsBeforeOriginOnly) {
		'use strict';
		const pointScale = function (point) {
				const dx = point[0] - vectorOrigin[0],
					dy = point[1] - vectorOrigin[1],
					val = (function () {
						if (dx === 0) {
							if (vector[1] === 0) {
								return 1;
							}
							return dy / vector[1];
						} else {
							if (vector[0] === 0) {
								return 1;
							}
							return dx / vector[0];
						}
					}()),
					pointSign = val >= 0 ? 1 : -1,
					vectorScale = pointSign * (Math.pow(dx, 2) + Math.pow(dy, 2));
				return vectorScale;
			},
			filteredPoints = _.filter(points, function (point) {
				if (pointsBeforeOriginOnly) {
					return pointScale(point) < 0;
				}
				return pointScale(point) >= 0;
			});


		return _.sortBy(filteredPoints, pointScale);
	},
	buildPoints = function (layout, margin) {
		'use strict';
		const points = [];
		_.each(layout, function (node) {
			const x1 = Math.round(node.x - margin),
				x2 = Math.round(node.x + node.width + margin),
				y1 = Math.round(node.y - margin),
				y2 = Math.round(node.y + node.height + margin);

			points.push([x1, y1]);
			points.push([x1, y2]);
			points.push([x2, y2]);
			points.push([x2, y1]);
		});
		return points;
	},
	tolayoutPolygonHull = function (layout, margin) {
		'use strict';
		const points = buildPoints(layout, margin),
			hullIndices = convexHull(points),
			hull =  _.map(hullIndices, function (hullIndex) {
				return points[hullIndex];
			});
		return [hull];
	},
	roundVector = function (vector) {
		'use strict';
		return [Math.round(vector[0]), Math.round(vector[1])];
	},
	tolayoutPolygonRect = function (layout, margin) {
		'use strict';
		let minX = 0,
			maxX = 0,
			minY = 0,
			maxY = 0;
		_.each(layout, function (node) {
			minX = Math.min(minX, node.x);
			maxX = Math.max(maxX, node.x + node.width);
			minY = Math.min(minY, node.y);
			maxY = Math.max(maxY, node.y + node.width);
		});
		minX = minX - margin;
		maxX = maxX + margin;
		minY = minY - margin;
		maxY = maxY + margin;
		return  [
			[
				roundVector([minX, minY]), roundVector([maxX, minY]), roundVector([maxX, maxY]), roundVector([minX, maxY])
			]
		];
	},
	addVectors = function (vector1, vector2) {
		'use strict';
		const x = vector1[0] + vector2[0],
			y = vector1[1] + vector2[1];
		if (isNaN(x) || isNaN(y)) {
			console.log('addVectors invalid-args x', x, 'y', y, 'vector1', vector1, 'vector2', vector2);
			throw 'invalid-args';
		}
		return [x, y];
	},
	subtractVectors = function (vector1, vector2) {
		'use strict';
		const x = vector1[0] - vector2[0],
			y = vector1[1] - vector2[1];
		if (isNaN(x) || isNaN(y)) {
			console.log('subtractVectors invalid-args vector1', vector1, 'vector2', vector2);
			throw 'invalid-args';
		}
		return [x, y];
	},
	translatePoly = function (poly, translation) {
		'use strict';
		return poly.map(function (region) {
			return region.map(function (vector) {
				return roundVector(addVectors(vector, translation));
			});
		});
	},
	firstProjectedPolyPointOnVector = function (poly, vectorOrigin, vector) {
		'use strict';
		const polyPoints = _.flatten(poly, true),
			intersectionsOnLine = polyPoints.map(function (intersection) {
				return projectPointOnLineVector(intersection, vectorOrigin, vector);
			}),
			orderedIntersectionsOnLine = orderPointsOnVector(intersectionsOnLine, vectorOrigin, vector, true);
		return orderedIntersectionsOnLine.length && orderedIntersectionsOnLine[0];
	},
	furthestIntersectionPoint = function (poly1, poly2, vectorOrigin, vector) {
		'use strict';
		const intersections = polygonIntersectionPoints(poly1, poly2),
			intersectionsOnLine = intersections.map(function (intersection) {
				return projectPointOnLineVector(intersection, vectorOrigin, vector);
			}),
			orderedIntersectionsOnLine = orderPointsOnVector(intersectionsOnLine, vectorOrigin, vector);
		return orderedIntersectionsOnLine.length && orderedIntersectionsOnLine.pop();
	},
	translatePolyToIntersecton = function (polyToTranslate, intersectionPoint, vector) {
		'use strict';
		const firstPolyPoint = firstProjectedPolyPointOnVector(polyToTranslate, intersectionPoint, vector),
			translation =  firstPolyPoint && roundVector(subtractVectors(intersectionPoint, firstPolyPoint));

		if (!firstPolyPoint) {
			return false;
		}
		return {
			translation: translation,
			translatedPoly: translatePoly(polyToTranslate, translation)
		};
	},
	translatePolyToNotOverlap = function (polyToFit, existingRegions, polyRootCenter, vector, previousTranslation, depth) {
		'use strict';

		const firstPolyPoint = firstProjectedPolyPointOnVector(polyToFit, polyRootCenter, vector) || polyRootCenter,
			intersectionPoint = furthestIntersectionPoint(polyToFit, existingRegions, firstPolyPoint, vector);
		let polyTranslation;
		depth = depth || 0;
		previousTranslation = previousTranslation || [0, 0];
		if (intersectionPoint) {
			polyTranslation = translatePolyToIntersecton(polyToFit, intersectionPoint, vector);
			if (polyTranslation) {
				previousTranslation	= addVectors(previousTranslation, polyTranslation.translation);
				polyRootCenter = addVectors(polyRootCenter, polyTranslation.translation);
				if (depth < 100) {
					return translatePolyToNotOverlap(polyTranslation.translatedPoly, existingRegions, polyRootCenter, vector, previousTranslation, (depth + 1));
				}
			} else {
				console.log('unable to translate poly', polyToFit, 'to intersectionPoint', intersectionPoint, 'with vector', vector);
			}
		}
		return {
			translation: previousTranslation,
			translatedPoly: polyToFit
		};
	};

module.exports = {
	tolayoutPolygonRect: tolayoutPolygonRect,
	tolayoutPolygonHull: tolayoutPolygonHull,
	furthestIntersectionPoint: furthestIntersectionPoint,
	projectPointOnLineVector: projectPointOnLineVector,
	orderPointsOnVector: orderPointsOnVector,
	firstProjectedPolyPointOnVector: firstProjectedPolyPointOnVector,
	translatePoly: translatePoly,
	addVectors: addVectors,
	subtractVectors: subtractVectors,
	translatePolyToIntersecton: translatePolyToIntersecton,
	translatePolyToNotOverlap: translatePolyToNotOverlap,
	unitVector: unitVector,
	roundVector: roundVector,
	polygonIntersectionPoints: polygonIntersectionPoints,
	shapeContainingIntersection: shapeContainingIntersection
};
