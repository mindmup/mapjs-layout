/*global module*/
const nearestInset = function (node, relatedNode, inset) {
	'use strict';
	if (node.left + node.width < relatedNode.left) {
		return node.left + node.width - inset;
	}
	return node.left + inset;
};

module.exports = {
	'center': function (node) {
		'use strict';
		return Math.round(node.left + node.width * 0.5);
	},
	'center-separated': function (node, relatedNode, horizontalInset, verticalInsetRatio) {
		'use strict';
		const insetY = node.height * (verticalInsetRatio || 0.2),
			insetX = horizontalInset || 10,
			halfWidth = node.width / 2,
			nodeMidX = node.left + halfWidth,
			relatedNodeMidX = relatedNode.left + (relatedNode.width / 2),
			relatedNodeRight = (relatedNode.left + relatedNode.width),
			dy = relatedNode.top - node.top + node.height - insetY,
			calcDx = function () {
				if (relatedNode.left > node.left + node.width) {
					return relatedNode.left - nodeMidX;
				} else if (relatedNodeRight < node.left) {
					return relatedNodeRight - nodeMidX;
				} else if (relatedNode.left < nodeMidX) {
					return relatedNodeMidX - nodeMidX;
				} else {
					return relatedNodeMidX - nodeMidX;
				}
			},
			dx = calcDx(),
			requestedOffset = (dx / Math.abs(dy)) * insetY,
			cappedOffset = Math.max(requestedOffset, (halfWidth * -1) + insetX),
			offsetX = Math.min(cappedOffset, halfWidth - insetX);
		return Math.round(node.left + (node.width * 0.5) + offsetX);
	},
	'nearest': function (node, relatedNode) {
		'use strict';
		return nearestInset(node, relatedNode, 0);
	},
	'nearest-inset': nearestInset
};
