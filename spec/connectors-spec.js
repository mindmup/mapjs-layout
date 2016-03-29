/*global describe, expect, it, MAPJS, beforeEach*/

describe('MAPJS.connectors', function () {
	'use strict';
	var parent, child;
	beforeEach(function () {
		parent = {top: 100, left: 200, width: 100, height: 40};
		child = {top: 220, left: 330, width: 12, height: 44};
	});
	describe('linkPath', function () {
		it('draws a straight line between the borders of two nodes', function () {
			var path = MAPJS.connectors.linkPath(parent, child, false);
			expect(path).toEqual({
				d: 'M100,20L136,120',
				conn: {
					from: { x: 300, y: 120 },
					to: { x: 336, y: 220 }
				},
				position: { left: 200, top: 100, width: 142, height: 164 },
				arrow: false
			});
		});
		it('draws a straight line with arrow between the borders of two nodes', function () {
			var path = MAPJS.connectors.linkPath(parent, child, true);
			expect(path).toEqual({
				d: 'M100,20L136,120',
				conn: {
					from: { x: 300, y: 120 },
					to: { x: 336, y: 220 }
				},
				position: { left: 200, top: 100, width: 142, height: 164 },
				arrow: 'M136,106L136,120L127,109Z'
			});
		});

	});
	describe('themePath', function () {
		describe('when no theme is provided', function () {
			it('draws a quadratic curve between the centers of two nodes', function () {
				var path = MAPJS.connectors.themePath(parent, child);
				expect(path).toEqual({
					d: 'M50,20Q50,202 140,142',
					position: { left: 200, top: 100, width: 142, height: 166 },
					color: '#707070'
				});
			});
		});
		describe('when a theme is provided', function () {
			var theme;
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
				child.level = 2;
				expect(MAPJS.connectors.themePath(parent, child, theme)).toEqual({
					d: 'M100,41L130,142',
					position: { left: 200, top: 100, width: 142, height: 166 },
					color: '#4F4F4F'
				});
			});
			it('should use the defaults when the child level is not in the theme', function () {
				child.level = 3;
				expect(MAPJS.connectors.themePath(parent, child, theme)).toEqual({
					d: 'M100,41q10,0 10,10v104q0,10 10,10h10M130,165 H142',
					position: { left: 200, top: 100, width: 142, height: 166 },
					color: '#707070'
				});

			});
		});
	});
});
