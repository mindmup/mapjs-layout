/*global module, require */
var Theme = require('./theme'),
	defaultLayouts = {
		'standard': require('./layouts/standard'),
		'top-down': require('./layouts/top-down')
	};

module.exports = function calculateLayout(idea, dimensionProvider, optional) {
	'use strict';
	var margin, orientation,
		layouts = (optional && optional.layouts) || defaultLayouts,
		theme = (optional && optional.theme) || new Theme({}),
		calculator;
	margin = theme.attributeValue(['layout'], [], ['spacing'], 20);
	orientation = theme.attributeValue(['layout'], [], ['orientation'], 'standard');
	calculator = layouts[orientation] || layouts.standard;

	return calculator(idea, dimensionProvider, margin);
};

