/*global module, require, console, localStorage*/
var _ = require('underscore'),
	layoutGeometry = require('./layout-geometry');

module.exports = function MultiRootLayout() {
	'use strict';
	var self = this,
		mergeNodes = function (storedLayout, offset) {
			_.each(storedLayout.rootLayout, function (node) {
				node.x = node.x + offset.x;
				node.y = node.y + offset.y;
				node.rootId = storedLayout.rootIdea.id;
			});
		},
		globalIdeaTopLeftPosition = function (idea) {
			var positionArray = (idea && idea.attr && idea.attr.position) || [0, 0, 0];
			return {
				x: positionArray[0],
				y: positionArray[1],
				priority: positionArray[2]
			};
		},
		toStoredLayout = function (rootLayout, rootIdea) {
			var dimensions = {
				minX: 0,
				maxX: 0,
				minY: 0,
				maxY: 0,
				rootIdea: rootIdea,
				rootNode: rootLayout[rootIdea.id],
				rootLayout: rootLayout
			};
			_.each(rootLayout, function (node) {
				dimensions.minX = Math.min(dimensions.minX, node.x);
				dimensions.maxX = Math.max(dimensions.maxX, node.x + node.width);
				dimensions.minY = Math.min(dimensions.minY, node.y);
				dimensions.maxY = Math.max(dimensions.maxY, node.y + node.width);
			});
			dimensions.height = dimensions.maxY - dimensions.minY;
			dimensions.width = dimensions.maxX - dimensions.minX;
			return dimensions;
		},
		isPositioned = function (rootIdea) {
			return globalIdeaTopLeftPosition(rootIdea).priority;
		},
		calcDesiredRootNodeCenter = function (storedLayout) {
			var rootPosition = globalIdeaTopLeftPosition(storedLayout.rootIdea);
			return {
				x: (rootPosition.x + storedLayout.rootNode.width / 2),
				y: (rootPosition.y + storedLayout.rootNode.height / 2)
			};
		},
		positionedLayouts = [],
		unpositionedLayouts = [];

	self.appendRootNodeLayout = function (rootLayout, rootIdea) {
		var storedLayout = toStoredLayout(rootLayout, rootIdea);
		if (isPositioned(rootIdea)) {
			positionedLayouts.push(storedLayout);
		} else {
			unpositionedLayouts.push(storedLayout);
		}
	};
	self.getCombinedLayout = function (margin) {
		var result = {},
			mostRecentlyPositioned = positionedLayouts.length && _.max(positionedLayouts, function (layout) {
				return globalIdeaTopLeftPosition(layout.rootIdea).priority;
			}),
			origin = {x: 0,y: 0}, //mostRecentlyPositioned && calcDesiredRootNodeCenter(mostRecentlyPositioned),
			originVector = [origin.x, origin.y],
			rootDistance = function (storedLayout) {
				// return globalIdeaTopLeftPosition(storedLayout.rootIdea).priority * -1;
				return storedLayout.rootIdea.id;
				// var rootCenter = calcDesiredRootNodeCenter(storedLayout);
				// return Math.pow(rootCenter.x - origin.x, 2) + Math.pow(rootCenter.y - origin.y, 2);
			},
			sortedPositionedLayouts = _.sortBy(positionedLayouts, rootDistance),
			sortedUnpositionedLayouts = _.sortBy(unpositionedLayouts, rootDistance),
			placedLayouts = [],
			placedLayoutPoly = [],
			layoutOffsetWithoutOverlap = function (storedLayoutPoly, vector, offset) {
				var intersectionPoint = layoutGeometry.furthestIntersectionPoint(storedLayoutPoly, placedLayoutPoly, originVector, vector),
					currentIntersection = layoutGeometry.firstProjectedPolyPointOnVector(storedLayoutPoly, originVector, vector),
					translation;
				offset = offset || {x: 0, y: 0};
				// console.log('layoutOffsetWithoutOverlap', 'storedLayoutPoly', storedLayoutPoly, 'vector', vector, 'offset', offset, 'placedLayoutPoly', placedLayoutPoly, 'originVector', originVector);
				if (intersectionPoint) {
					translation =  [intersectionPoint[0] - currentIntersection[0], intersectionPoint[1] - currentIntersection[1]];
					offset = {
						x: offset.x + translation[0],
						y: offset.y + translation[1]
					};
					// console.log('translation', translation, 'offset', offset);
					// console.log('layoutGeometry.translatePoly(', storedLayoutPoly, ', ', translation, ')', 'intersectionPoint', intersectionPoint, 'currentIntersection', currentIntersection);
					return layoutOffsetWithoutOverlap(layoutGeometry.translatePoly(storedLayoutPoly, translation), vector, offset);
				}
				return offset;
			},
			positionLayout = function (storedLayout) {
				var placedRootCenter = calcDesiredRootNodeCenter(storedLayout),
					storedLayoutPoly = layoutGeometry.tolayoutPolygon(storedLayout.rootLayout),
					offset,
					vector = [placedRootCenter.x - origin.x, placedRootCenter.y - origin.y],
					initialTranslation = [placedRootCenter.x, placedRootCenter.y],
					maxLayouts = localStorage && localStorage.maxLayouts;

				if (!storedLayout || _.contains(placedLayouts, storedLayout) || (maxLayouts && placedLayouts.length >= maxLayouts)) {
					return;
				}
				if (storedLayout.rootIdea.id === 39) {
					console.log('>>positionLayout');
				}
				if (positionedLayouts.length) {
					if (vector[0] === 0 && vector[1] === 0) {
						vector = [1, 0];
					}
					if (storedLayout.rootIdea.id === 39) {
						console.log('layoutGeometry.translatePoly(storedLayoutPoly:', storedLayoutPoly, ', initialTranslation:', initialTranslation, ')');
					}
					storedLayoutPoly = layoutGeometry.translatePoly(storedLayoutPoly, initialTranslation);
					offset = layoutOffsetWithoutOverlap(storedLayoutPoly, vector, placedRootCenter);
				} else {
					offset = placedRootCenter;
				}
				console.log('mergeNodes offset', offset, 'rootIdea.id', storedLayout.rootIdea.id);
				mergeNodes(storedLayout, offset);
				if (storedLayout.rootIdea.id === 39) {
					console.log('39 vector', vector, 'storedLayoutPoly', storedLayoutPoly, 'offset', offset, 'placedRootCenter', placedRootCenter, 'moved poly', layoutGeometry.tolayoutPolygon(storedLayout.rootLayout));
				}

				placedLayouts.push(storedLayout);
				placedLayoutPoly = placedLayoutPoly.concat(layoutGeometry.tolayoutPolygon(storedLayout.rootLayout));
			};
		if (!margin) {
			throw 'invalid-args';
		}
		console.log('mostRecentlyPositioned', mostRecentlyPositioned.rootIdea);
		positionLayout(mostRecentlyPositioned);
		sortedPositionedLayouts.forEach(positionLayout);
		sortedUnpositionedLayouts.forEach(positionLayout);
		placedLayouts.forEach(function (placedLayout) {
			result = _.extend(result, placedLayout.rootLayout);
		});
		return result;
	};
};
