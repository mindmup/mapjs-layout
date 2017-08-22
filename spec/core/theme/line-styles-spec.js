/*global require, describe, it, expect*/
const lineStyles = require('../../../src/core/theme/line-styles');

describe('lineStyles', () => {
	'use strict';
	describe('strokes', () => {
		describe('should return empty string', () => {
			it('when name is falsy', () => expect(lineStyles.strokes(undefined, 2)).toEqual(''));
			it('when name is solid', () => expect(lineStyles.strokes('solid', 2)).toEqual(''));
		});
		it('width can be a minimum of 1', () => {
			expect(lineStyles.strokes('dashed', -1)).toEqual('4, 4');
			expect(lineStyles.strokes('dashed')).toEqual('4, 4');
		});
		it('should return multiple of width when dashed', () => {
			expect(lineStyles.strokes('dashed', 2)).toEqual('8, 8');
			expect(lineStyles.strokes('dashed', 1)).toEqual('4, 4');
			expect(lineStyles.strokes('dashed', 10)).toEqual('40, 40');
		});
		it('should return multiple of width when dotted', () => {
			expect(lineStyles.strokes('dotted', 2)).toEqual('1, 8');
			expect(lineStyles.strokes('dotted', 1)).toEqual('1, 4');
			expect(lineStyles.strokes('dotted', 10)).toEqual('1, 40');
		});
	});
	describe('linecap', () => {
		it('should return a square cap for undefined style', () => expect(lineStyles.linecap()).toEqual('square'));
		it('should return a square cap for solid', () => expect(lineStyles.linecap('solid')).toEqual('square'));
		it('should return a round cap for dotted', () => expect(lineStyles.linecap('dotted')).toEqual('round'));
		it('should return an empty cap as default', () => expect(lineStyles.linecap('idunno')).toEqual(''));
	});
});
