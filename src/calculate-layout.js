/*global module, require */
var _ = require('underscore'),
	layoutLinks = require('./layout-links'),
	treeUtils = require('./tree');
module.exports  = function calculateLayout(idea, dimensionProvider, margin) {
	'use strict';
	var positiveTree, negativeTree, layout, negativeLayout,
		positive = function (rank, parentId) {
			return parentId !== idea.id || rank > 0;
		},
		negative = function (rank, parentId) {
			return parentId !== idea.id || rank < 0;
		};
	margin = margin || 20;
	positiveTree = treeUtils.calculateTree(idea, dimensionProvider, margin, positive);
	negativeTree = treeUtils.calculateTree(idea, dimensionProvider, margin, negative);
	layout = positiveTree.toLayout();
	negativeLayout = negativeTree.toLayout();
	_.each(negativeLayout.nodes, function (n) {
		n.x = -1 * n.x - n.width;
	});
	_.extend(negativeLayout.nodes, layout.nodes);
	_.extend(negativeLayout.connectors, layout.connectors);
	negativeLayout.links = layoutLinks(idea, negativeLayout.nodes);
	negativeLayout.rootNodeId = idea.id;
	return negativeLayout;
};

