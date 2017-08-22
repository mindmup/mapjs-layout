/*global module, require*/
const contentUpgrade = require('mindmup-mapjs-model').contentUpgrade,
	Theme = require('../theme/theme'),
	extractConnectors = require('./extract-connectors'),
	extractLinks = require('./extract-links'),
	MultiRootLayout = require('./multi-root-layout'),
	defaultLayouts = {
		'standard': require('./standard/calculate-standard-layout'),
		'top-down': require('./top-down/calculate-top-down-layout')
	},
	attachStyles = function (nodes, theme) {
		'use strict';
		Object.keys(nodes).forEach(function (nodeKey) {
			const node = nodes[nodeKey];
			node.styles = theme.nodeStyles(node.level, node.attr);
		});
		return nodes;
	},
	formatResult = function (result, idea, theme, orientation) {
		'use strict';
		return {
			orientation: orientation,
			nodes: attachStyles(result, theme),
			connectors: extractConnectors(idea, result, theme),
			links: extractLinks(idea, result),
			theme: idea.attr && idea.attr.theme
		};
	};

module.exports = function calculateLayout(idea, dimensionProvider, optional) {
	'use strict';
	const layouts = (optional && optional.layouts) || defaultLayouts,
		theme = (optional && optional.theme) || new Theme({}),
		multiRootLayout = new MultiRootLayout(),
		margin = theme.attributeValue(['layout'], [], ['spacing'], {h: 20, v: 20}),
		orientation = theme.attributeValue(['layout'], [], ['orientation'], 'standard'),
		calculator = layouts[orientation] || layouts.standard;

	idea = contentUpgrade(idea);

	Object.keys(idea.ideas).forEach(function (rank) {
		const rootIdea = idea.ideas[rank],
			rootResult = calculator(rootIdea, dimensionProvider, {h: (margin.h || margin), v: (margin.v || margin)});
		multiRootLayout.appendRootNodeLayout(rootResult, rootIdea);
	});

	return formatResult (multiRootLayout.getCombinedLayout(10), idea, theme, orientation);
	// result = calculator(idea, dimensionProvider, {h: (margin.h || margin), v: (margin.v || margin)});

};

