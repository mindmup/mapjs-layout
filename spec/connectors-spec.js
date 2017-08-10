/*global describe, expect, it, MAPJS, beforeEach, require*/
const defaultTheme = require('../src/default-theme');
describe('MAPJS.Connectors', function () {
	'use strict';
	let parent, child;
	beforeEach(function () {
		parent = { top: 100, left: 200, width: 100, height: 40, styles: ['default']};
		child = { top: 220, left: 330, width: 12, height: 44, styles: ['default']};
	});
	describe('linkPath', function () {
		it('draws a straight line between the borders of two nodes', function () {
			const path = MAPJS.Connectors.linkPath(parent, child);
			expect(path.d).toEqual('M100,20L136,120');
			expect(path.position).toEqual({ left: 200, top: 100, width: 142, height: 164 });

		});
		it('calculates the arrow if link attributes require it', function () {
			const path = MAPJS.Connectors.linkPath(parent, child, {arrow: true});
			expect(path.arrow).toEqual('M136,106L136,120L127,109Z');
		});
		it('returns the default link theme if no theme is provided', function () {
			const path = MAPJS.Connectors.linkPath(parent, child);
			expect(path.theme).toEqual(defaultTheme.link.default);
		});
		it('returns the link theme from the provided theme object', function () {
			const path = MAPJS.Connectors.linkPath(parent, child, {}, new MAPJS.Theme({
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
			const path = MAPJS.Connectors.linkPath(parent, child, {type: 'curly'}, new MAPJS.Theme({
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
			const theme = new MAPJS.Theme({
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
			expect(MAPJS.Connectors.linkPath(parent, child, {}, theme).lineProps).toEqual({
				strokes: '20, 20',
				linecap: '',
				width: 5,
				color: 'green'
			});
			expect(MAPJS.Connectors.linkPath(parent, child, {color: 'blue'}, theme).lineProps).toEqual({
				strokes: '20, 20',
				linecap: '',
				width: 5,
				color: 'blue'
			});
			expect(MAPJS.Connectors.linkPath(parent, child, {lineStyle: 'dotted'}, theme).lineProps).toEqual({
				strokes: '1, 20',
				linecap: 'round',
				width: 5,
				color: 'green'
			});

			expect(MAPJS.Connectors.linkPath(parent, child, {lineStyle: 'solid'}, theme).lineProps).toEqual({
				strokes: '',
				linecap: 'square',
				width: 5,
				color: 'green'
			});
			expect(MAPJS.Connectors.linkPath(parent, child, {width: 9}, theme).lineProps).toEqual({
				strokes: '36, 36',
				linecap: '',
				width: 9,
				color: 'green'
			});
		});
	});
	describe('themePath', function () {
		describe('when no theme is provided', function () {
			it('draws a quadratic curve between the centers of two nodes', function () {
				const path = MAPJS.Connectors.themePath(parent, child);
				expect(path).toEqual({
					d: 'M50,20Q50,190 140,142',
					position: { left: 200, top: 100, width: 142, height: 166 },
					color: '#707070',
					width: 1,
					theme: new MAPJS.Theme().connectorTheme('above', child.styles, parent.styles)
				});
			});
		});
		describe('when a theme is provided with an underlined node style', function () {
			let theme;
			beforeEach(function () {
				theme = new MAPJS.Theme({
					name: 'MindMup Test',
					node: [
						{
							name: 'default',
							border: {
								type: 'underline'
							},
							connections: {
								default: {
									h: 'nearest',
									v: 'base'
								}
							}
						},
						{
							name: 'level_2',
							border: {
								type: 'surround'
							},
							connections: {
								style: 'simple',
								default: {
									h: 'nearest',
									v: 'center'
								}
							}
						}
					],
					connector: {
						default: {
							type: 'compact-s-curve',
							line: {
								color: '#707070',
								width: 1.0
							}
						},
						simple: {
							type: 'straight',
							line: {
								color: '#4F4F4F',
								width: 1.0
							}
						}
					}
				});
			});
			it('should use child level to determine connector type', function () {
				child.styles = ['level_2', 'default'];
				expect(MAPJS.Connectors.themePath(parent, child, theme)).toEqual({
					d: 'M100,41L130,142',
					position: { left: 200, top: 100, width: 142, height: 166 },
					color: '#4F4F4F',
					width: 1,
					theme: theme.connectorTheme('above', child.styles, parent.styles)
				});
			});
			it('should use the defaults when the child level is not in the theme', function () {
				child.level = 3;
				expect(MAPJS.Connectors.themePath(parent, child, theme)).toEqual({
					d: 'M100,41q10,0 10,10v104q0,10 10,10h10M130,165 H142',
					position: { left: 200, top: 100, width: 142, height: 166 },
					color: '#707070',
					width: 1,
					theme: theme.connectorTheme('above', child.styles, parent.styles)
				});

			});
		});

		describe('when a theme is provided with an overlined node style', function () {
			let theme;
			beforeEach(function () {
				theme = new MAPJS.Theme({
					name: 'MindMup Test',
					node: [
						{
							name: 'default',
							border: {
								type: 'overline'
							},
							connections: {
								default: {
									h: 'nearest',
									v: 'base'
								}
							}
						},
						{
							name: 'level_2',
							border: {
								type: 'surround'
							},
							connections: {
								style: 'simple',
								default: {
									h: 'nearest',
									v: 'center'
								}
							}
						}
					],
					connector: {
						default: {
							type: 'top-down-s-curve',
							line: {
								color: '#707070',
								width: 1.0
							}
						},
						simple: {
							type: 'straight',
							line: {
								color: '#4F4F4F',
								width: 2.0
							}
						}
					}
				});
			});
			it('should use child level to determine connector type', function () {
				child.styles = ['level_2', 'default'];
				expect(MAPJS.Connectors.themePath(parent, child, theme)).toEqual({
					d: 'M100,41L130,142',
					position: { left: 200, top: 100, width: 142, height: 166 },
					color: '#4F4F4F',
					width: 2,
					theme: theme.connectorTheme('above', child.styles, parent.styles)
				});
			});
			it('should use the defaults when the child level is not in the theme', function () {
				child.styles = ['level_3', 'default'];
				expect(MAPJS.Connectors.themePath(parent, child, theme)).toEqual({
					d: 'M100,41v47q0,15 15,15h0q15,0 15,15v47m-5,5q0,-5 5,-5 h0q5,0 5,5',
					position: { left: 200, top: 100, width: 142, height: 166 },
					initialRadius: 5,
					color: '#707070',
					width: 1,
					theme: theme.connectorTheme('above', child.styles, parent.styles)
				});

			});
		});
	});
});
