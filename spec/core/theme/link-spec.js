/*global describe, expect, it,  beforeEach, require*/
const defaultTheme = require('../../../src/core/theme/default-theme'),
	link = require('../../../src/core/theme/link'),
	Theme = require('../../../src/core/theme/theme');
describe('Connectors', function () {
	'use strict';
	let parent, child;
	beforeEach(function () {
		parent = { top: 100, left: 200, width: 100, height: 40, styles: ['default']};
		child = { top: 220, left: 330, width: 12, height: 44, styles: ['default']};
	});
	describe('linkPath', function () {
		it('draws a straight line between the borders of two nodes', function () {
			const path = link(parent, child);
			expect(path.d).toEqual('M100,20L136,120');
			expect(path.position).toEqual({ left: 200, top: 100, width: 142, height: 164 });

		});
		it('calculates the arrow if link attributes require it', function () {
			const path = link(parent, child, {arrow: true});
			expect(path.arrow).toEqual('M136,106L136,120L127,109Z');
		});
		it('returns the default link theme if no theme is provided', function () {
			const path = link(parent, child);
			expect(path.theme).toEqual(defaultTheme.link.default);
		});
		it('returns the link theme from the provided theme object', function () {
			const path = link(parent, child, {}, new Theme({
				link: {
					default: {
						line: 'lll',
						label: 'xxx'
					}
				}
			}));
			expect(path.theme).toEqual({label: 'xxx', line: 'lll'});
		});
		it('requests the theme from link attributes', function () {
			const path = link(parent, child, {type: 'curly'}, new Theme({
				link: {
					curly: {
						line: 'clll',
						label: 'cxxx'
					},
					default: {
						line: 'lll',
						label: 'xxx'
					}
				}
			}));
			expect(path.theme).toEqual({label: 'cxxx', line: 'clll'});

		});
		it('merges link attributes with the theme to create line properties', function () {
			const theme = new Theme({
				link: {
					default: {
						line: {
							lineStyle: 'dashed',
							width: 5,
							color: 'green'
						}
					}
				}
			});
			expect(link(parent, child, {}, theme).lineProps).toEqual({
				strokes: '20, 20',
				linecap: '',
				width: 5,
				color: 'green'
			});
			expect(link(parent, child, {color: 'blue'}, theme).lineProps).toEqual({
				strokes: '20, 20',
				linecap: '',
				width: 5,
				color: 'blue'
			});
			expect(link(parent, child, {lineStyle: 'dotted'}, theme).lineProps).toEqual({
				strokes: '1, 20',
				linecap: 'round',
				width: 5,
				color: 'green'
			});

			expect(link(parent, child, {lineStyle: 'solid'}, theme).lineProps).toEqual({
				strokes: '',
				linecap: 'square',
				width: 5,
				color: 'green'
			});
			expect(link(parent, child, {width: 9}, theme).lineProps).toEqual({
				strokes: '36, 36',
				linecap: '',
				width: 9,
				color: 'green'
			});
		});
	});
});
