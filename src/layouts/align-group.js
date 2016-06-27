/*global module, require */
var _ = require('underscore');
module.exports = function alignGroup(result, rootIdea) {
	'use strict';
	var nodes = result.nodes,
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
		rootNode = nodes[rootIdea.id];

	if (!childIds.length) {
		return;
	}
	rootNode.x = minLeft;
	rootNode.width = maxRight - rootNode.x;
	result.levels[0] = {width: rootNode.width, xOffset: rootNode.x};

};
