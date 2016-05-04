/*global describe, it, expect, require, jasmine */
var layout = require('../../src/layouts/top-down'),
	_ = require('underscore');
describe('Top down layout', function () {
	'use strict';
	var dimensionProvider = function (idea /*, level */) {
			return {
				width: idea.title.length * 20,
				height: idea.title.length * 10
			};
		},
		position = function (node) {
			return _.pick(node, 'x', 'y');
		};
	it('copies the key node attributes to layout nodes', function () {
		var idea = {
				title: 'parent',
				id: 1,
				attr: {ax: 'a-parent'},
				ideas: {
					4: {
						title: 'child',
						id: 11,
						attr: {ax: 'a-child'}
					}
				}
			},
			margin = 5,
			result = layout(idea, dimensionProvider, margin);

		expect(result.nodes[1]).toEqual(jasmine.objectContaining({
			level: 1,
			id: 1,
			title: 'parent',
			attr: { ax: 'a-parent' }
		}));
		expect(result.nodes[11]).toEqual(jasmine.objectContaining({
			level: 2,
			id: 11,
			title: 'child',
			attr: { ax: 'a-child' }
		}));
	});
	it('lays out a single node map with the root at 0,0 center', function () {
		var idea = { title: 'Hello World', id: 1, attr: {ax: 'ay'} },
			margin = 5,
			result = layout(idea, dimensionProvider, margin);

		expect(result.nodes).toEqual({
			1: {
				level: 1,
				width: 220,
				height: 110,
				id: 1,
				x: -110,
				y: -55,
				title: 'Hello World',
				attr: { ax: 'ay' }
			}
		});
		expect(_.isEmpty(result.connectors)).toBeTruthy();
		expect(_.isEmpty(result.links)).toBeTruthy();
	});
	it('positions a single child directly below the parent', function () {
		var idea = {
				title: 'parent',
				id: 1,
				ideas: {
					4: {
						title: 'child',
						id: 11
					}
				}
			},
			margin = 5,
			result = layout(idea, dimensionProvider, margin);

		expect(position(result.nodes[1])).toEqual({ x: -60, y: -30});
		expect(position(result.nodes[11])).toEqual({ x: -50, y: 35});
	});
	it('positions two children centered below parent, in rank order', function () {
		var idea = {
				title: 'parent', /* 120, 60 */
				id: 1,
				ideas: {
					5: {
						title: 'second child', /* 240, 120 */
						id: 12
					},
					4: {
						title: 'child', /* 100, 50 */
						id: 11
					}
				}
			},
			margin = 5,
			result = layout(idea, dimensionProvider, margin);

		expect(position(result.nodes[1])).toEqual({ x: -60, y: -30});
		expect(position(result.nodes[11])).toEqual({ x: -172, y: 35});
		expect(position(result.nodes[12])).toEqual({ x: -67, y: 35});
	});
	it('positions third level below the second level, even if uneven heights on 2nd', function () {
		var idea = {
				title: 'parent', /* 120, 60 */
				id: 1,
				ideas: {
					5: {
						title: 'second child', /* 240, 120 */
						id: 12,
						ideas: {
							1: {
								id: 112,
								title: 'XYZ'
							}
						}
					},
					4: {
						title: 'child', /* 100, 50 */
						id: 11,
						ideas: {
							2: {
								id: 113,
								title: 'ZXY'
							}
						}
					}
				}
			},
			margin = 5,
			result = layout(idea, dimensionProvider, margin);
		expect(result.nodes[113].y).toEqual(160);
		expect(result.nodes[113].y).toEqual(160);
	});
	/*
	it('adds connector information', function () {
		var idea = {
				title: 'parent',
				id: 1,
				ideas: {
					5: {
						title: 'second child',
						id: 12
					},
					4: {
						title: 'child',
						id: 11
					}
				}
			},
			margin = 5,
			result = layout(idea, dimensionProvider, margin);
		expect(result.connectors).toEqual([]);
	});
	*/
});
