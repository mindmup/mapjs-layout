/*global module, require */
var _ = require('underscore'),
	layoutLinks = require('./layout-links'),
	Theme = require('./theme'),
	treeUtils = require('./tree');
module.exports  = function calculateLayout(idea, dimensionProvider, theme) {
	'use strict';
	var standardNodeLayout = function (margin) {
			var positiveTree, negativeTree, layout, negativeLayout,
				positive = function (rank, parentId) {
					return parentId !== idea.id || rank > 0;
				},
				negative = function (rank, parentId) {
					return parentId !== idea.id || rank < 0;
				};
			positiveTree = treeUtils.calculateTree(idea, dimensionProvider, margin, positive);
			negativeTree = treeUtils.calculateTree(idea, dimensionProvider, margin, negative);
			layout = positiveTree.toLayout();
			negativeLayout = negativeTree.toLayout();
			_.each(negativeLayout.nodes, function (n) {
				n.x = -1 * n.x - n.width;
			});
			_.extend(negativeLayout.nodes, layout.nodes);
			_.extend(negativeLayout.connectors, layout.connectors);
			return negativeLayout;
		},
		topDownLayout = function (margin) {
			var always = function (/* rank, parentId */) {
					return true;
				},
				rotatedDimensionProvider = function (idea, level) {
					var originalDimension = dimensionProvider(idea, level);
					return {
						width: originalDimension.height,
						height: originalDimension.width
					};
				},
				unRotate = function (layout) {
					_.each(layout.nodes, function (node) {
						var temp;
						temp = node.width;
						node.width = node.height;
						node.height = temp;

						temp = node.x;
						node.x = node.y;
						node.y = temp;
					});
					return layout;
				},
				// rotate node positions before placing?
				tree = treeUtils.calculateTree(idea, rotatedDimensionProvider, margin, always);
			return unRotate(tree.toLayout());
		},
		margin, orientation, layout;
	theme = theme || new Theme({});
	margin = theme.attributeValue(['layout'], [], ['spacing'], 20);
	orientation = theme.attributeValue(['layout'], [], ['orientation'], 'standard');
	if (orientation === 'standard') {
		layout = standardNodeLayout(margin);
	} else if (orientation === 'top-down') {
		layout = topDownLayout(margin);
	}
	layout.links = layoutLinks(idea, layout.nodes);
	layout.rootNodeId = idea.id;
	return layout;
};

