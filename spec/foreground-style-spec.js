/*global describe, expect, it, MAPJS*/

describe('MAPJS.foregroundStyle', function () {
	'use strict';
	[
		['#FFFFFF', 'darkColor'],
		['#000000', 'lightColor'],
		['#EEEEEE', 'color'],
		['#22AAE0', 'color'],
		['#0000FF', 'lightColor'],
		['#4F4F4F', 'lightColor'],
		['#E0E0E0', 'color']
	].forEach(function (args) {
		it('calculates the text class of nodes with background color ' + args[0] + ' to ' + args[1], function () {
			expect(MAPJS.foregroundStyle(args[0])).toEqual(args[1]);
		});
	});
});
