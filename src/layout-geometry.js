/*global module, require*/
var _ = require('underscore'),
	PolyBool = require('polybooljs');

module.exports = {
	tolayoutPolygon: function (layout) {
		'use strict';
		var minX =  0,
			maxX = 0,
			minY = 0,
			maxY = 0;
		_.each(layout, function (node) {
			minX = Math.min(minX, node.x);
			maxX = Math.max(maxX, node.x + node.width);
			minY = Math.min(minY, node.y);
			maxY = Math.max(maxY, node.y + node.width);
		});
		return {
			regions: [
				[minX, minY],
				[maxX, minY],
				[maxX, maxY],
				[minX, maxY]
			],
			inverted: false
		};
	},
	polygonsOverlap: function (poly1, poly2) {
		'use strict';
		var intersection = PolyBool.intersect(poly1, poly2);
		return intersection;
	}
};
