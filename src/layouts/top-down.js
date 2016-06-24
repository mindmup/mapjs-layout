/*global module, require*/
var _ = require('underscore'),
	isEmptyGroup = require('../is-empty-group'),
	combineVerticalSubtrees = require('./combine-vertical-subtrees');
module.exports  = function topdownLayout(aggregate, dimensionProvider, margin) {
	'use strict';
	var toNode = function (idea, level) {
			var dimensions = dimensionProvider(idea, level);
			return _.extend({level: level}, dimensions, _.pick(idea, ['id', 'title', 'attr']));
		},

		traverse = function (idea, predicate, level) {
			var childResults = {},
				shouldIncludeSubIdeas = !(_.isEmpty(idea.ideas) || (idea.attr && idea.attr.collapsed));

			level = level || 1;
			if (shouldIncludeSubIdeas) {
				Object.keys(idea.ideas).forEach(function (subNodeRank) {
					var result = traverse(idea.ideas[subNodeRank], predicate, level + 1);
					if (result) {
						childResults[subNodeRank] = result;
					}
				});
			}
			return predicate(idea, childResults, level);
		},
		traversalLayout = function (idea, childLayouts, level) {
			var node = toNode(idea, level),
				result = combineVerticalSubtrees(node, childLayouts, margin.h);
			return result;
		},
		traversalLayoutWithoutEmptyGroups = function (idea, childLayouts, level) {
			return (idea === aggregate || !isEmptyGroup(idea)) && traversalLayout(idea, childLayouts, level);
		},
		setLevelHeights = function (nodes, levelHeights) {
			_.each(nodes, function (node) {
				node.y = levelHeights[node.level - 1];
			});
		},
		getLevelHeights = function (nodes) {
			var maxHeights = [],
				level,
				heights = [],
				totalHeight = 0;

			_.each(nodes, function (node) {
				maxHeights[node.level - 1] = Math.max(maxHeights[node.level - 1] || 0, node.height);
			});
			totalHeight = maxHeights.reduce(function (memo, item) {
				return memo + item;
			}, 0) + (margin.v *  (maxHeights.length - 1));

			heights[0] = Math.round(-0.5 * totalHeight);

			for (level = 1; level < maxHeights.length; level++) {
				heights [level] = heights [level - 1] + margin.v + maxHeights[level - 1];
			}
			return heights;
		},
		tree;

	tree = traverse(aggregate, traversalLayoutWithoutEmptyGroups);
	setLevelHeights(tree.nodes, getLevelHeights(tree.nodes));

	return tree.nodes;
};

