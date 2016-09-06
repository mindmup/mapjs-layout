/*global module, require*/
var _ = require('underscore');

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
			desiredRootCenter = mostRecentlyPositioned && calcDesiredRootNodeCenter(mostRecentlyPositioned),
			rootDistance = function (storedLayout) {
				var rootCenter = calcDesiredRootNodeCenter(storedLayout);
				return Math.pow(rootCenter.x - desiredRootCenter.x, 2) + Math.pow(rootCenter.y - desiredRootCenter.y, 2);
			},
			sortedPositionedLayouts = _.sortBy(positionedLayouts, rootDistance),
			placedLayouts = [],
			layoutOffsetWithoutOverlap = function (storedLayout) {
				var globalRootNodePosition = globalIdeaTopLeftPosition(storedLayout.rootIdea);

				return {
					x: globalRootNodePosition.x - storedLayout.rootNode.x,
					y: globalRootNodePosition.y - storedLayout.rootNode.y
				};
			},
			positionLayout = function (storedLayout) {
				var offset;
				if (!storedLayout || _.contains(placedLayouts, storedLayout)) {
					return;
				}
				/* must not overlap previously positioned layouts*/
				offset = layoutOffsetWithoutOverlap(storedLayout, storedLayout);
				mergeNodes(storedLayout, offset);
				placedLayouts.push(storedLayout);
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
