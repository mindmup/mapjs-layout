/*global module */
// var Color = require('color');
module.exports = function foregroundStyle(backgroundColor) {
	'use strict';

	/*jslint newcap:true*/
	// var luminosity = Color(backgroundColor).mix(Color('#EEEEEE')).luminosity();
	var mix = function (color1, color2) {
			return [
				Math.round(0.5 * (color1[0] + color2[0])),
				Math.round(0.5 * (color1[1] + color2[1])),
				Math.round(0.5 * (color1[2] + color2[2]))
			];
		},
		convertHexRGB = function (hexColor) {
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
		},
		calcLuminosity = function () {
			// http://www.w3.org/TR/WCAG20/#relativeluminancedef
			var rgb = mix(convertHexRGB(backgroundColor), convertHexRGB('#EEEEEE')),
				lum = [], i, chan;
			for (i = 0; i < rgb.length; i++) {
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
