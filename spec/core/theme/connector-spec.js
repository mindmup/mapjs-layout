/*global describe, expect, it,  beforeEach, require*/
const connector = require('../../../src/core/theme/connector'),
	Theme = require('../../../src/core/theme/theme');
describe('connector', function () {
	'use strict';
	let parent, child;
	beforeEach(function () {
		parent = { top: 100, left: 200, width: 100, height: 40, styles: ['default']};
		child = { top: 220, left: 330, width: 12, height: 44, styles: ['default']};
	});
	describe('connector', function () {
		describe('when no theme is provided', function () {
			it('draws a quadratic curve between the centers of two nodes', function () {
				const path = connector(parent, child);
				expect(path).toEqual({
					d: 'M50,20Q50,190 140,142',
					position: { left: 200, top: 100, width: 142, height: 166 },
					color: '#707070',
					width: 1,
					theme: new Theme().connectorTheme('above', child.styles, parent.styles)
				});
			});
		});
		describe('when a theme is provided with an underlined node style', function () {
			let theme;
			beforeEach(function () {
				theme = new Theme({
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
				expect(connector(parent, child, theme)).toEqual({
					d: 'M100,41L130,142',
					position: { left: 200, top: 100, width: 142, height: 166 },
					color: '#4F4F4F',
					width: 1,
					theme: theme.connectorTheme('above', child.styles, parent.styles)
				});
			});
			it('should use the defaults when the child level is not in the theme', function () {
				child.level = 3;
				expect(connector(parent, child, theme)).toEqual({
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
				theme = new Theme({
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
				expect(connector(parent, child, theme)).toEqual({
					d: 'M100,41L130,142',
					position: { left: 200, top: 100, width: 142, height: 166 },
					color: '#4F4F4F',
					width: 2,
					theme: theme.connectorTheme('above', child.styles, parent.styles)
				});
			});
			it('should use the defaults when the child level is not in the theme', function () {
				child.styles = ['level_3', 'default'];
				expect(connector(parent, child, theme)).toEqual({
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
