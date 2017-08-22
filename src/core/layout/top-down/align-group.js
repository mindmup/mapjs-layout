/*global module, require */
const _ = require('underscore');
module.exports = function alignGroup(result, rootIdea) {
	'use strict';
	const nodes = result.nodes,
		childIds = _.values(rootIdea.ideas).map(function (idea) {
			return idea.id;
		}),
		childNodes = childIds.map(function (id) {
			return nodes[id];
		}).filter(function (node) {
			return node;
		}),
		leftBorders = _.map(childNodes, function (node) {
			return node.x;
		}),
		rightBorders = _.map(childNodes, function (node) {
			return node.x + node.width;
		}),
		minLeft = _.min(leftBorders),
		maxRight = _.max(rightBorders),
		rootNode = nodes[rootIdea.id],
		sameLevelNodes = _.values(nodes).filter(function (node) {
			return node.level === rootNode.level && node.id !== rootNode.id;
		});

	if (childNodes.length) {
		rootNode.x = minLeft;
		rootNode.width = maxRight - rootNode.x;
	}
	sameLevelNodes.forEach(function (node) {
		node.verticalOffset = (node.verticalOffset || 0) + rootNode.height;
	});
};
