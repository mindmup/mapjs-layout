/*global module, require */
var _ = require('underscore'),
	VerticalSubtreeCollection = require('./vertical-subtree-collection');
module.exports = function combineVerticalSubtrees(node, childLayouts, margin) {
	'use strict';
	var result = {
			nodes: { }
		},
		shift = function (nodes, xOffset) {
			_.each(nodes, function (node) {
				node.x += xOffset;
			});
			return nodes;
		},
		treeOffset,
		verticalSubtreeCollection = new VerticalSubtreeCollection(childLayouts, margin);

	result.nodes[node.id] = node;
	node.x = Math.round(-0.5 * node.width);
	result.levels = [{width: node.width, xOffset: node.x}];

	if (!verticalSubtreeCollection.isEmpty()) {
		treeOffset = Math.round(-0.5 * verticalSubtreeCollection.widestLevelWidth());

		result.levels = result.levels.concat(verticalSubtreeCollection.getMergedLevels(treeOffset));

		Object.keys(childLayouts).forEach(function (subtreeRank) {
			_.extend(result.nodes, shift(childLayouts[subtreeRank].nodes, treeOffset + verticalSubtreeCollection.getExpectedTranslation(subtreeRank)));
		});
	}
	return result;
};
