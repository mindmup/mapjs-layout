/*global module, require*/
var _ = require('underscore'),
	combineVerticalSubtrees = require('./combine-vertical-subtrees');
module.exports  = function topdownLayout(aggregate, dimensionProvider, margin) {
	'use strict';
	var toNode = function (idea, level) {
			var dimensions = dimensionProvider(idea, level);
			return _.extend({level: level}, dimensions, _.pick(idea, ['id', 'title', 'attr']));
		},

		traverse = function (idea, predicate, level) {
			var childResults,
				shouldIncludeSubIdeas = !(_.isEmpty(idea.ideas) || (idea.attr && idea.attr.collapsed));

			level = level || 1;
			if (shouldIncludeSubIdeas) {
				childResults = Object.keys(idea.ideas).map(function (subNodeRank) {
					return traverse(idea.ideas[subNodeRank], predicate, level + 1);
				});
			}
			return predicate(idea, childResults, level);
		},
		traversalLayout = function (idea, childLayouts, level) {
			var node = toNode(idea, level),
				result = combineVerticalSubtrees(node, childLayouts, margin.h);
			return result;
		},
		setLevelHeights = function (nodes, levelHeights) {
			_.each(nodes, function (node) {
				node.y = levelHeights[node.level - 1];
			});
		},
		getLevelHeights = function (nodes) {
			var maxHeights = [],
				level,
				heights = [];

			_.each(nodes, function (node) {
				maxHeights[node.level - 1] = Math.max(maxHeights[node.level - 1] || 0, node.height);
			});

			heights[0] = Math.round(-0.5 * nodes[aggregate.id].height);

			for (level = 1; level < maxHeights.length; level++) {
				heights [level] = heights [level - 1] + margin.v + maxHeights[level - 1];
			}
			return heights;
		},
		tree;

	tree = traverse(aggregate, traversalLayout);
	setLevelHeights(tree.nodes, getLevelHeights(tree.nodes));

	return tree.nodes;
};

