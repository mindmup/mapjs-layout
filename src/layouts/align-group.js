/*global module, require */
var _ = require('underscore');
module.exports = function alignGroup(nodes, rootIdea) {
	'use strict';
	var childIds = _.values(rootIdea.ideas).map(function (idea) {
			return idea.id;
		}),
		childNodes = childIds.map(function (id) {
			return nodes[id];
		}),
		leftBorders = _.map(childNodes, function (node) {
			return node.x;
		}),
		rightBorders = _.map(childNodes, function (node) {
			return node.x + node.width;
		}),
		minLeft = _.min(leftBorders),
		maxRight = _.max(rightBorders),
		rootNode = nodes[rootIdea.id];

	if (!childIds.length) {
		return;
	}
	rootNode.x = Math.min(minLeft, rootNode.x);
	rootNode.width = Math.max(maxRight - rootNode.x,  rootNode.width);
};
