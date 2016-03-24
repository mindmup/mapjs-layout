/*global module, require */
var Color = require('color');
module.exports = function foregroundStyle(backgroundColor) {
	'use strict';
	/*jslint newcap:true*/
	var luminosity = Color(backgroundColor).mix(Color('#EEEEEE')).luminosity();
	if (luminosity < 0.5) {
		return 'lightColor';
	} else if (luminosity < 0.9) {
		return 'color';
	}
	return 'darkColor';
};
