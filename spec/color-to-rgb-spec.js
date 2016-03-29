/*global describe, require, expect, it*/

describe('convertToRGB', function () {
	'use strict';
	var underTest = require('../src/color-to-rgb');
	describe('hex colors', function () {
		[
			['#000000', [0,0,0]],
			['#ffffff', [255, 255, 255]],
			['#FFFFFF', [255, 255, 255]]
		].forEach(function (args) {
			it('should convert ' + args[0] + ' to rgb:' + args[1].join(','), function () {
				expect(underTest(args[0])).toEqual(args[1]);
			});
		});

	});
	describe('rgb css colors', function () {
		[
			['rgb(0,0,0)', [0,0,0]],
			['rgb(255, 255, 255)', [255, 255, 255]],
			['rgb(255, 254, 253)', [255, 254, 253]],
			['rgb(255,254,253)', [255, 254, 253]]
		].forEach(function (args) {
			it('should convert ' + args[0] + ' to rgb:' + args[1].join(','), function () {
				expect(underTest(args[0])).toEqual(args[1]);
			});
		});
	});
});
