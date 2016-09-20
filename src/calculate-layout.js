/*global module, require*/
var Theme = require('./theme'),
	extractConnectors = require('./layouts/extract-connectors'),
	layoutLinks = require('./layouts/links'),
	MultiRootLayout = require('./multi-root-layout'),
	defaultLayouts = {
		'standard': require('./layouts/standard'),
		'top-down': require('./layouts/top-down')
	},
	attachStyles = function (nodes, theme) {
		'use strict';
		Object.keys(nodes).forEach(function (nodeKey) {
			var node = nodes[nodeKey];
			node.styles = theme.nodeStyles(node.level, node.attr);
		});
		return nodes;
	};

module.exports = function calculateLayout(idea, dimensionProvider, optional) {
	'use strict';
	var margin, orientation,
		layouts = (optional && optional.layouts) || defaultLayouts,
		theme = (optional && optional.theme) || new Theme({}),
		calculator,
		multiRootLayout = new MultiRootLayout(),
		result;
	margin = theme.attributeValue(['layout'], [], ['spacing'], {h: 20, v: 20});
	orientation = theme.attributeValue(['layout'], [], ['orientation'], 'standard');
	calculator = layouts[orientation] || layouts.standard;


	if (!idea.formatVersion || idea.formatVersion < 3) {
		multiRootLayout.appendRootNodeLayout(
				calculator(idea, dimensionProvider, {h: (margin.h || margin), v: (margin.v || margin)}),
				idea);
	} else {
		Object.keys(idea.ideas).forEach(function (rank) {
			var rootIdea = idea.ideas[rank],
				rootResult = calculator(rootIdea, dimensionProvider, {h: (margin.h || margin), v: (margin.v || margin)});
			multiRootLayout.appendRootNodeLayout(rootResult, rootIdea);
		});
	}

	result = multiRootLayout.getCombinedLayout(10);
	// result = calculator(idea, dimensionProvider, {h: (margin.h || margin), v: (margin.v || margin)});
	return {
		orientation: orientation,
		nodes: attachStyles(result, theme),
		connectors: extractConnectors(idea, result),
		links: layoutLinks(idea, result),
		theme: idea.attr && idea.attr.theme
	};
};

