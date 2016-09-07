/*global module, require*/
var _ = require('underscore'),
	PolyBool = require('polybooljs'),
	dotProduct = function (p1, p2) {
		'use strict';
		return (p1[0] * p2[0]) + (p1[1] * p2[1]);
	};

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
	},
	projectPointOnLineVector: function (point, vectorOrigin, vector) {
		'use strict';
		var pointVector = [point[0] - vectorOrigin[0], point[1] - vectorOrigin[1]],
			valDp = dotProduct(vector, pointVector),
			len2 = dotProduct(vector, vector),
			resultVector = [
				vectorOrigin[0] + ((valDp * vector[0]) / len2),
				vectorOrigin[1] + ((valDp * vector[1]) / len2)
			];
		if (!vector[0] && !vector[1]) {
			throw 'invalid-args';
		}
		// console.log('point', point, 'vectorOrigin', vectorOrigin, 'vector', vector, 'pointVector', pointVector, 'valDp', valDp, 'len2', len2);
		return resultVector;
	}

};
