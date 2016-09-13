/*global require, describe, it, expect*/
var underTest = require('../src/formatted-node-title');
describe('formattedNodeTitle', function () {
	'use strict';
	[
		['a text title with no link', 'hello', 'hello'],
		['an empty string if nothing provided', undefined, ''],
		['a title without link if title contains text followed by link', 'hello www.google.com', 'hello'],
		['a title without link if title contains link followed by text', 'www.google.com hello', 'hello'],
		['a title without link if title contains link surrounded by text', 'hello www.google.com bye', 'hello  bye'],
		['a title with second link if title contains multiple links with text', 'hello www.google.com www.google.com', 'hello  www.google.com'],
		['a title with second link if title contains multiple links', 'www.google.com www.google.com', 'www.google.com'],
		['a link if title is link only', 'www.google.com', 'www.google.com']
	].forEach(function (args) {
		it('should return ' + args[0], function () {
			expect(underTest(args[1])).toEqual(args[2]);
		});
	});
	it('truncates link-only titles if maxlength is provided', function () {
		expect(underTest('http://google.com/search?q=onlylink', 25)).toEqual('http://google.com/search?...');
		expect(underTest('http://google.com/search?q=onlylink', 100)).toEqual('http://google.com/search?q=onlylink');
	});
	it('does not truncate links if maxlength is not provided', function () {
		expect(underTest('http://google.com/search?q=onlylink')).toEqual('http://google.com/search?q=onlylink');
	});
	it('does not truncate text even if maxlength is provided', function () {
		expect(underTest('http google.com search?q=onlylink', 25)).toEqual('http google.com search?q=onlylink');
	});

});
