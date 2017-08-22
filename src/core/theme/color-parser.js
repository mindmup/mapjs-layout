/*global module, require*/
const convertToRGB = require('./color-to-rgb');
module.exports = function colorParser(colorObj) {
	'use strict';
	if (!colorObj.color || colorObj.opacity === 0) {
		return 'transparent';
	}
	if (colorObj.opacity) {
		return 'rgba(' + convertToRGB(colorObj.color).join(',') + ',' + colorObj.opacity + ')';
	} else {
		return colorObj.color;
	}
};
