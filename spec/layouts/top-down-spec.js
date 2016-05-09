/*global describe, it, expect, require, jasmine */
var layout = require('../../src/layouts/top-down'),
	_ = require('underscore');
describe('layouts/top-down', function () {
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
			margin = {h: 5, v: 5},
			result = layout(idea, dimensionProvider, margin);

		expect(result[1]).toEqual(jasmine.objectContaining({
			level: 1,
			id: 1,
			title: 'parent',
			attr: { ax: 'a-parent' }
		}));
		expect(result[11]).toEqual(jasmine.objectContaining({
			level: 2,
			id: 11,
			title: 'child',
			attr: { ax: 'a-child' }
		}));
	});
	it('lays out a single node map with the root at 0,0 center', function () {
		var idea = { title: 'Hello World', id: 1, attr: {ax: 'ay'} },
			margin = {h: 5, v: 5},
			result = layout(idea, dimensionProvider, margin);

		expect(result).toEqual({
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
			margin = {h: 5, v: 5},
			result = layout(idea, dimensionProvider, margin);

		expect(position(result[1])).toEqual({ x: -60, y: -57});
		expect(position(result[11])).toEqual({ x: -50, y: 8});
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
			margin = {h: 5, v: 5},
			result = layout(idea, dimensionProvider, margin);

		expect(position(result[1])).toEqual({ x: -60, y: -92});
		expect(position(result[11])).toEqual({ x: -172, y: -27});
		expect(position(result[12])).toEqual({ x: -67, y: -27});
	});
	it('sorts children in rank order', function () {
		var idea = {
				title: 'loses',
				ideas: {
					'1': {
						title: 'text & line colors',
						id: 215,
						ideas: {
							'1': { title: 'text decoration and line thickness', 'id': 224}
						}
					},
					'3': {
						title: 'multi-line nodes',
						id: 220,
						ideas: {
							'1': {'title': 'makes node text into text attachment on blank node','id': 221 }
						}
					},
					'4': {
						title: 'relationship lines',
						id: 223
					},
					'0.5': {
						title: 'images',
						id: 216,
						ideas: {
							'1': { 'title': 'including icons', 'id': 222 }
						}
					}
				},
				id: 214
			},
			margin = {h: 10, v: 10},
			result = layout(idea, dimensionProvider, margin);
		expect(_.sortBy([215, 220, 223, 216], function (id) {
			return position(result[id]).x;
		})).toEqual([216, 215, 220, 223]);
	});
	it('ignores children below collapsed parent', function () {
		var idea = {
				title: 'parent', /* 120, 60 */
				id: 1,
				ideas: {
					5: {
						title: 'second child', /* 240, 120 */
						id: 12,
						attr: {
							collapsed: true
						},
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
			margin = {h: 5, v: 5},
			result = layout(idea, dimensionProvider, margin);

		expect(result[1]).toBeTruthy();
		expect(result[11]).toBeTruthy();
		expect(result[12]).toBeTruthy();
		expect(result[113]).toBeTruthy();
		expect(result[112]).toBeFalsy();
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
			margin = {h: 5, v: 10},
			result = layout(idea, dimensionProvider, margin);
		expect(result[113].y).toEqual(85);
		expect(result[113].y).toEqual(85);
	});
});
