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
			result += childLayout.width;
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
		var sortedKeys = _.sortBy(Object.keys(childLayouts), parseFloat);
		return sortedKeys.map(function (key) {
			return childLayouts[key];
		});
	},
	currentX;
	result.nodes[node.id] = node;
	result.width = result.nodes[node.id].width;
	result.xOffset = result.nodes[node.id].x = Math.round(-0.5 * result.nodes[node.id].width);
	currentX = Math.round(-0.5 * getLevelWidth(childLayouts));
	if (childLayouts) {
		rankSort(childLayouts).forEach(function (childLayout) {
			_.extend(result.nodes, shift(childLayout.nodes, currentX - childLayout.xOffset)); /*offset and horizontal spacing, ordering */
			currentX += childLayout.width + margin;
		});
	}
	return result;
};
