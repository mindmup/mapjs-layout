/*global module, require */
var _ = require('underscore');
module.exports = function combineVerticalSubtrees(node, childLayouts, margin) {
	'use strict';
	var result = {
			nodes: { }
		},
		getLevelWidth = function (childLayouts) {
			var result = 0;
			_.each(childLayouts, function (childLayout) {
				if (result > 0) {
					result += margin;
				}
				result += childLayout.levels[0].width;
			});
			return result;
		},
		shift = function (nodes, xOffset) {
			_.each(nodes, function (node) {
				node.x += xOffset;
			});
			return nodes;
		},
		rankSort = function (childLayouts) {
			return _.sortBy(Object.keys(childLayouts), parseFloat).map(function (key) {
				return childLayouts[key];
			});
		},
		currentX,
		levelWidth;

	result.nodes[node.id] = node;

	node.x = Math.round(-0.5 * node.width);
	result.levels = [{width: node.width, xOffset: node.x}];

	if (!_.isEmpty(childLayouts)) {
		levelWidth = getLevelWidth(childLayouts);
		currentX = Math.round(-0.5 * levelWidth);
		result.levels.push({width: levelWidth, xOffset: currentX});
		rankSort(childLayouts).forEach(function (childLayout) {
			_.extend(result.nodes, shift(childLayout.nodes, currentX - childLayout.levels[0].xOffset)); /* horizontal spacing for multiple levels */
			currentX += childLayout.levels[0].width + margin;
		});
	}
	return result;
};
