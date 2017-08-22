/*global module, require */
const _ = require('underscore'),
	treeUtils = require('./tree');
module.exports  = function calculateStandardLayout(idea, dimensionProvider, margin) {
	'use strict';
	const positive = function (rank, parentId) {
			return parentId !== idea.id || rank > 0;
		},
		negative = function (rank, parentId) {
			return parentId !== idea.id || rank < 0;
		},
		positiveTree = treeUtils.calculateTree(idea, dimensionProvider, margin.h, positive),
		negativeTree = treeUtils.calculateTree(idea, dimensionProvider, margin.h, negative),
		layout = positiveTree.toLayout(),
		negativeLayout = negativeTree.toLayout();
	_.each(negativeLayout.nodes, function (n) {
		n.x = -1 * n.x - n.width;
	});
	return _.extend(negativeLayout.nodes, layout.nodes);
};

