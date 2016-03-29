/*global module*/
module.exports = function convertHexRGB(hexColor) {
	'use strict';
	var match = hexColor.toString(16).match(/[a-f0-9]{6}/i),
		integer,r, g, b;
	if (!match) {
		return [0, 0, 0];
	}

	integer = parseInt(match[0], 16);
	r = (integer >> 16) & 0xFF;
	g = (integer >> 8) & 0xFF;
	b = integer & 0xFF;

	return [r, g, b];
};
