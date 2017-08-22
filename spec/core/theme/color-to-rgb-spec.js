/*global describe, require, expect, it*/

const underTest = require('../../../src/core/theme/color-to-rgb');

describe('convertToRGB', function () {
	'use strict';

	describe('hex colors', function () {
		[
			['#000000', [0, 0, 0]],
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
			['rgb(0,0,0)', [0, 0, 0]],
			['rgb(255, 255, 255)', [255, 255, 255]],
			['rgb(255, 254, 253)', [255, 254, 253]],
			['rgb(255,254,253)', [255, 254, 253]]
		].forEach(function (args) {
			it('should convert ' + args[0] + ' to rgb:' + args[1].join(','), function () {
				expect(underTest(args[0])).toEqual(args[1]);
			});
		});
	});
	describe('rgba css colors', function () {
		[
			['rgba(0,0,0,1)', [0, 0, 0]],
			['rgba(255, 255, 255, 0.8)', [255, 255, 255]],
			['rgba(255, 254, 253, 0)', [255, 254, 253]],
			['rgba(255,254,253,0.9)', [255, 254, 253]]
		].forEach(function (args) {
			it('should convert ' + args[0] + ' to rgb:' + args[1].join(','), function () {
				expect(underTest(args[0])).toEqual(args[1]);
			});
		});
	});
});
