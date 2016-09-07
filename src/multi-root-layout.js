/*global module, require*/
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
			origin = mostRecentlyPositioned && calcDesiredRootNodeCenter(mostRecentlyPositioned),
			originVector = [origin.x, origin.y],
			rootDistance = function (storedLayout) {
				var rootCenter = calcDesiredRootNodeCenter(storedLayout);
				return Math.pow(rootCenter.x - origin.x, 2) + Math.pow(rootCenter.y - origin.y, 2);
			},
			sortedPositionedLayouts = _.sortBy(positionedLayouts, rootDistance),
			placedLayouts = [],
			placedLayoutPoly = [],
			layoutOffsetWithoutOverlap = function (storedLayoutPoly, vector, offset) {
				var intersectionPoint = layoutGeometry.furthestIntersectionPoint(storedLayoutPoly, placedLayoutPoly, originVector, vector),
					currentIntersection = layoutGeometry.firstProjectedPolyPointOnVector(storedLayoutPoly, originVector, vector),
					translation;
				offset = offset || {x: 0, y: 0};
				if (intersectionPoint) {
					translation =  {
						x: intersectionPoint[0] - currentIntersection[0],
						y: intersectionPoint[1] - currentIntersection[1]
					};
					offset = {
						x: offset.x + translation.x,
						y: offset.y + translation.y
					};
					return layoutOffsetWithoutOverlap(layoutGeometry.translatePoly(storedLayoutPoly, translation), vector, offset);
				}
				return offset;
			},
			positionLayout = function (storedLayout) {
				var placedRootCenter = calcDesiredRootNodeCenter(storedLayout),
					storedLayoutPoly = layoutGeometry.tolayoutPolygon(storedLayout),
					offset,
					vector = [placedRootCenter.x - origin.x, placedRootCenter.y - origin.y];
				if (!storedLayout || _.contains(placedLayouts, storedLayout)) {
					return;
				}
				storedLayoutPoly = layoutGeometry.translatePoly(storedLayoutPoly, vector);
				/* must not overlap previously positioned layouts*/
				offset = layoutOffsetWithoutOverlap(storedLayoutPoly, vector);
				mergeNodes(storedLayout, offset);
				placedLayoutPoly = placedLayoutPoly.concat(layoutGeometry.tolayoutPolygon(storedLayout));
			};
		if (!margin) {
			throw 'invalid-args';
		}

		positionLayout(mostRecentlyPositioned);
		sortedPositionedLayouts.forEach(positionLayout);
		unpositionedLayouts.forEach(positionLayout);
		return result;
	};
};
