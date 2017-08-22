/*global describe, expect, it, require*/
const foregroundStyle = require('../../../src/core/theme/foreground-style');
describe('foregroundStyle', function () {
	'use strict';
	[
		['#FFFFFF', 'darkColor'],
		['rgba(255,255,255,1)', 'darkColor'],
		['#000000', 'lightColor'],
		['#EEEEEE', 'color'],
		['#22AAE0', 'color'],
		['#0000FF', 'lightColor'],
		['#4F4F4F', 'lightColor'],
		['#E0E0E0', 'color']
	].forEach(function (args) {
		it('calculates the text class of nodes with background color ' + args[0] + ' to ' + args[1], function () {
			expect(foregroundStyle(args[0])).toEqual(args[1]);
		});
	});
});
