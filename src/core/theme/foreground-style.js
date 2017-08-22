/*global module, require */
const convertToRGB = require('./color-to-rgb');

module.exports = function foregroundStyle(backgroundColor) {
	'use strict';

	/*jslint newcap:true*/
	// var luminosity = Color(backgroundColor).mix(Color('#EEEEEE')).luminosity();
	const mix = function (color1, color2) {
			return [
				Math.round(0.5 * (color1[0] + color2[0])),
				Math.round(0.5 * (color1[1] + color2[1])),
				Math.round(0.5 * (color1[2] + color2[2]))
			];
		},
		calcLuminosity = function () {
			// http://www.w3.org/TR/WCAG20/#relativeluminancedef
			const rgb = mix(convertToRGB(backgroundColor), convertToRGB('#EEEEEE')),
				lum = [];
			let chan;
			for (let i = 0; i < rgb.length; i++) {
				chan = rgb[i] / 255;
				lum[i] = (chan <= 0.03928) ? chan / 12.92 : Math.pow(((chan + 0.055) / 1.055), 2.4);
			}
			return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
		},
		luminosity = calcLuminosity();
	if (luminosity < 0.5) {
		return 'lightColor';
	} else if (luminosity < 0.9) {
		return 'color';
	}
	return 'darkColor';
};
