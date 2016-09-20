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
			var storedLayout = {
				rootIdea: rootIdea,
				rootNode: rootLayout[rootIdea.id],
				rootLayout: rootLayout
			};
			return storedLayout;
		},
		isPositioned = function (rootIdea) {
			return globalIdeaTopLeftPosition(rootIdea).priority;
		},
		calcDesiredRootNodeCenter = function (storedLayout) {
			var rootPosition = globalIdeaTopLeftPosition(storedLayout.rootIdea);
			if (!rootPosition || !rootPosition.priority || !storedLayout.rootNode) {
				return {x: 0, y: 0};
			}
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
			rootDistance = function (storedLayout) {
				// return globalIdeaTopLeftPosition(storedLayout.rootIdea).priority * -1;
				// return storedLayout.rootIdea.id;
				var rootCenter = calcDesiredRootNodeCenter(storedLayout);
				return Math.pow(rootCenter.x - origin.x, 2) + Math.pow(rootCenter.y - origin.y, 2);
			},
			sortedPositionedLayouts = _.sortBy(positionedLayouts, rootDistance),
			placedLayouts = [],
			placedLayoutPoly = [],
			layoutCount = positionedLayouts.length + unpositionedLayouts.length,
			hasMultipleLayouts = layoutCount > 1,
			positionLayout = function (storedLayout) {
				var placedRootCenter = calcDesiredRootNodeCenter(storedLayout),
					initialTranslation = layoutGeometry.roundVector([placedRootCenter.x, placedRootCenter.y]),
					storedLayoutPoly = hasMultipleLayouts && layoutGeometry.translatePoly(layoutGeometry.tolayoutPolygonHull(storedLayout.rootLayout, margin), initialTranslation),
					offset,
					translationResult,
					placeNewLayout = function () {
						var vector = layoutGeometry.unitVector([placedRootCenter.x - origin.x, placedRootCenter.y - origin.y]);
						if (vector[0] === 0 && vector[1] === 0) {
							vector = [1, 0];
						}
						translationResult = layoutGeometry.translatePolyToNotOverlap(storedLayoutPoly, placedLayoutPoly, initialTranslation, vector, initialTranslation);
						offset = {x: translationResult.translation[0], y: translationResult.translation[1]};
						storedLayoutPoly = translationResult.translatedPoly;
					};
				if (!storedLayout || _.contains(placedLayouts, storedLayout)) {
					return;
				}
				if (placedLayouts.length) {
					placeNewLayout();
				} else {
					offset = placedRootCenter;
				}

				mergeNodes(storedLayout, offset);
				placedLayouts.push(storedLayout);
				if (hasMultipleLayouts) {
					placedLayoutPoly = placedLayoutPoly.concat(storedLayoutPoly);
				}

			};
		if (!margin) {
			throw 'invalid-args';
		}
		if (mostRecentlyPositioned) {
			positionLayout(mostRecentlyPositioned);
		}
		sortedPositionedLayouts.forEach(positionLayout);
		unpositionedLayouts.forEach(positionLayout);
		placedLayouts.forEach(function (placedLayout) {
			result = _.extend(result, placedLayout.rootLayout);
		});
		return result;
	};
};
