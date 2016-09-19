/*global describe, it, expect, MAPJS*/
describe('MAPJS.URLHelper', function () {
	'use strict';
	describe('containsURL', function () {
		it('checks if the text contains a URL with protocol or starting with www somewhere', function () {
			expect(MAPJS.URLHelper.containsLink('http://www.google.com')).toBeTruthy();
			expect(MAPJS.URLHelper.containsLink('prefix http://www.google.com suffix')).toBeTruthy();
			expect(MAPJS.URLHelper.containsLink('https://www.google.com')).toBeTruthy();
			expect(MAPJS.URLHelper.containsLink('www.google.com')).toBeTruthy();
			expect(MAPJS.URLHelper.containsLink('abc.google.com')).toBeFalsy();
		});
		it('can work with undefined', function () {
			expect(MAPJS.URLHelper.containsLink(undefined)).toBeFalsy();
		});
	});
	describe('stripLink', function () {
		it('removes the first link and returns the remaining text', function () {
			expect(MAPJS.URLHelper.stripLink('http://www.google.com')).toBe('');
			expect(MAPJS.URLHelper.stripLink('prefix http://www.google.com suffix')).toBe('prefix  suffix');
			expect(MAPJS.URLHelper.stripLink('prefix http://www.google.com')).toBe('prefix');
			expect(MAPJS.URLHelper.stripLink('http://www.google.com suffix')).toBe('suffix');
			expect(MAPJS.URLHelper.stripLink('https://www.google.com')).toBe('');
			expect(MAPJS.URLHelper.stripLink('www.google.com')).toBe('');
			expect(MAPJS.URLHelper.stripLink('abc.google.com')).toBe('abc.google.com');
			expect(MAPJS.URLHelper.stripLink('https://sv.wikipedia.org/wiki/Mjölke_(växt)')).toBe('');
		});
		it('leaves any other links intact', function () {
			expect(MAPJS.URLHelper.stripLink('prefix http://www.google.com suffix http://xkcd.com')).toBe('prefix  suffix http://xkcd.com');
			expect(MAPJS.URLHelper.stripLink('https://sv.wikipedia.org/wiki/Mjölke_(växt) also')).toBe('also');
		});
		it('can work with undefined', function () {
			expect(MAPJS.URLHelper.stripLink(undefined)).toEqual('');
		});
	});
	describe('getLink', function () {
		it('can work with undefined', function () {
			expect(MAPJS.URLHelper.getLink(undefined)).toBeFalsy();
		});
		it('returns the first link, optionally adding http protocol', function () {
			expect(MAPJS.URLHelper.getLink('http://www.google.com')).toBe('http://www.google.com');
			expect(MAPJS.URLHelper.getLink('prefix http://www.google.com suffix')).toBe('http://www.google.com');
			expect(MAPJS.URLHelper.getLink('https://www.google.com')).toBe('https://www.google.com');
			expect(MAPJS.URLHelper.getLink('www.google.com')).toBe('http://www.google.com');
			expect(MAPJS.URLHelper.getLink('abc.google.com')).toBeFalsy();
		});
		it('supports google forum links', function () {
			expect(MAPJS.URLHelper.getLink('https://groups.google.com/forum/#!topic/deltabot/kDagXbWri94')).toBe('https://groups.google.com/forum/#!topic/deltabot/kDagXbWri94');
		});
		it('only retrieves the first link', function () {
			expect(MAPJS.URLHelper.getLink('prefix http://www.google.com suffix http://xkcd.com')).toBe('http://www.google.com');
		});
		it('retrieves the query string part of URL as well', function () {
			expect(MAPJS.URLHelper.getLink('http://www.google.com?abc=def&xkcd=mmm&amp;zeka=peka')).toBe('http://www.google.com?abc=def&xkcd=mmm&amp;zeka=peka');
		});
		it('retrieves the has part of URL as well', function () {
			expect(MAPJS.URLHelper.getLink('http://www.google.com#abcdef')).toBe('http://www.google.com#abcdef');
		});
		it('supports swedish letters', function () {
			expect(MAPJS.URLHelper.getLink('https://sv.wikipedia.org/wiki/Mjölke_(växt)')).toBe('https://sv.wikipedia.org/wiki/Mjölke_(växt)');
		});
	});
});
