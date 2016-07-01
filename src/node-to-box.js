/*global module*/
module.exports = function nodeToBox(node) {
	'use strict';
	if (!node) {
		return false;
	}
	return {
		left: node.x,
		top: node.y,
		width: node.width,
		height: node.height,
		level: node.level,
		styles: node.styles || ['default']
	};
};
