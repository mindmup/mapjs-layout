/*global module, require*/
var _ = require('underscore');
module.exports = function MultiRootLayout() {
	'use strict';
	var self = this,
		shiftCoordinates = function (rootLayout, dx) {
			_.each(rootLayout, function (node) {
				node.x = node.x + dx;
			});
		},
		toStoredLayout = function (rootLayout) {
			var dimensions = {
				minX: 0,
				maxX: 0,
				minY: 0,
				maxY: 0,
				rootLayout: rootLayout
			};
			_.each(rootLayout, function (node) {
				dimensions.minX = Math.min(dimensions.minX, node.x);
				dimensions.maxX = Math.max(dimensions.maxX, node.x + node.width);
				dimensions.minY = Math.min(dimensions.minY, node.y);
				dimensions.maxY = Math.max(dimensions.maxY, node.y + node.width);
			});
			dimensions.height = dimensions.maxY - dimensions.minY;
			dimensions.width = dimensions.maxX - dimensions.minX;
			return dimensions;
		},
		calcTotalWidth = function (margin) {
			var totalWidth = 0;
			combinedLayout.forEach(function (storedRootLayout) {
				totalWidth = totalWidth + storedRootLayout.width;
			});
			totalWidth = totalWidth + (margin * (combinedLayout.length - 1));
			return totalWidth;
		},
		combinedLayout = [];

	self.appendRootNodeLayout = function (rootLayout) {
		combinedLayout.push(toStoredLayout(rootLayout));
	};
	self.getCombinedLayout = function (margin) {
		var totalWidth, xOffset,
			result = {};
		if (!margin) {
			throw 'invalid-args';
		}
		totalWidth = calcTotalWidth(margin);
		xOffset = totalWidth * -0.5;
		combinedLayout.forEach(function (storedRootLayout) {
			var dx = xOffset - storedRootLayout.minX;
			shiftCoordinates(storedRootLayout.rootLayout, dx);
			result = _.extend(result, storedRootLayout.rootLayout);
			xOffset = xOffset + storedRootLayout.width + margin;
		});
		return result;
	};
};
