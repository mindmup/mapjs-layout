/*global module, require*/
var Theme = require('./theme'),
	_ = require('underscore'),
	extractConnectors = require('./layouts/extract-connectors'),
	layoutLinks = require('./layouts/links'),
	defaultLayouts = {
		'standard': require('./layouts/standard'),
		'top-down': require('./layouts/top-down')
	};

module.exports = function calculateLayout(idea, dimensionProvider, optional) {
	'use strict';
	var margin, orientation,
		layouts = (optional && optional.layouts) || defaultLayouts,
		theme = (optional && optional.theme) || new Theme({}),
		calculator,
		result;
	margin = theme.attributeValue(['layout'], [], ['spacing'], 20);
	orientation = theme.attributeValue(['layout'], [], ['orientation'], 'standard');
	calculator = layouts[orientation] || layouts.standard;
	result = calculator(idea, dimensionProvider, margin);
	return _.extend(
		result,
		{
			connectors: extractConnectors(idea),
			links: layoutLinks(idea, result.nodes)
		}
	);
};

