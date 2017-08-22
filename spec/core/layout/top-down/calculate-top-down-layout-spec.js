/*global describe, it, expect, require, jasmine, beforeEach */
const layout = require('../../../../src/core/layout/top-down/calculate-top-down-layout'),
	_ = require('underscore');
describe('calculateTopDownLayout', function () {
	'use strict';
	const dimensionProvider = function (idea /*, level */) {
			return {
				width: idea.title.length * 20,
				height: idea.title.length * 10
			};
		},
		position = function (node) {
			return _.pick(node, 'x', 'y');
		};
	it('copies the key node attributes to layout nodes', function () {
		const idea = {
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
		const idea = { title: 'Hello World', id: 1, attr: {ax: 'ay'} },
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
		const idea = {
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
		const idea = {
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
		expect(result[1].width).toEqual(120);
		expect(position(result[11])).toEqual({ x: -172, y: -27});
		expect(position(result[12])).toEqual({ x: -67, y: -27});
	});
	it('aligns groups horizontally', function () {
		const idea = {
				title: 'parent', /* 120, 60 */
				attr: { group: 'blue' },
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

		expect(position(result[1])).toEqual({ x: -172, y: -90});
		expect(result[1].width).toEqual(345);
		expect(position(result[11])).toEqual({ x: -172, y: -30});
		expect(position(result[12])).toEqual({ x: -67, y: -30});
	});
	describe('aligns grouped children within the same level', function () {
		let idea, result;
		beforeEach(function () {
			idea = {
				title: 'parent', /* 120, 60 */
				id: 1,
				ideas: {
					5: {
						title: 'second child', /* 240, 120 */
						attr: { group: 'blue' },
						id: 12,
						ideas: {
							1: { id: 121, title: 'child' /* 100, 50 */ },
							2: { id: 122, title: 'third child' /* 220, 110 */ },
							3: { id: 123, attr: { group: 'yellow' }, title: 'subgroup' /* 160 x 80 */,
								ideas: {
									1: {id: 1231, title: 'subsubchild' /* 220 x 110*/ }
								}
							}
						}
					},
					4: {
						title: 'child', /* 100, 50 */
						id: 11,
						ideas: {
							1: { id: 111, title: 'child' /* 100, 50 */ }
						}
					}
				}
			};

			result = layout(idea, dimensionProvider, {h: 5, v: 5});
		});
		it('aligns the non-grouped children with a margin', function () {
			expect(result[12].y - result[1].y).toEqual(65);
			expect(result[11].y - result[1].y).toEqual(65);

			expect(result[12].level).toEqual(2);
			expect(result[11].level).toEqual(2);
		});
		it('aligns the non-grouped second level children below the groups', function () {
			expect(result[111].y - result[11].y).toEqual(315);
			expect(result[111].level).toEqual(3);
		});
		it('aligns the grouped children inside the same level', function () {
			expect(result[121].y).toEqual(result[122].y);
			expect(result[123].y).toEqual(result[122].y);
			expect(result[121].y - result[12].y).toEqual(120);
			expect(result[121].level).toEqual(2);
			expect(result[122].level).toEqual(2);
			expect(result[123].level).toEqual(2);
		});
		it('aligns the subgroup children within the same level', function () {
			expect(result[1231].y - result[123].y).toEqual(80);
			expect(result[1231].level).toEqual(2);
		});
	});
	it('does not overlap children of sublevels created after groups', function () {
		const idea = {
				title: 'parent', /* 120, 60 */
				id: 1,
				ideas: {
					5: {
						title: 'group', /* 100 x 50 */
						attr: { group: 'blue' },
						id: 12,
						ideas: {
							1: { id: 121, title: 'child' /* 100, 50 */,
								ideas: {
									1: {id: 121, title: 'subsubchild' /* 220 x 110*/ },
									2: {id: 122, title: 'subsubchild' /* 220 x 110*/ },
									3: {id: 123, title: 'subsubchild' /* 220 x 110*/ }
								}
							}
						}
					},
					4: {
						title: 'nogrp', /* 100 x 50 */
						id: 11,
						ideas: {
							1: { id: 111, title: 'child' /* 100 x 50 */ }
						}
					}
				}
			},
			result = layout(idea, dimensionProvider, {h: 5, v: 5});
		expect(result[111].x + result[111].width).toBeLessThan(result[121].x);
	});
	it('sorts children in rank order', function () {
		const idea = {
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
							'1': {'title': 'makes node text into text attachment on blank node', 'id': 221 }
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
		const idea = {
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
		const idea = {
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
	it('ignores empty groups', function () {
		const contentAggregate = {
				id: 7,
				title: '1',
				ideas: {
					1: {
						id: 8,
						title: '12'
					},
					2: {
						id: 9,
						title: '13',
						attr: { group: 'standard' },
						ideas: {}
					},
					3: {
						id: 10,
						title: '14',
						attr: { group: 'standard' }
					},
					4: {
						id: 11,
						title: '14',
						attr: { group: 'standard' },
						ideas: {
							2: {
								id: 16,
								title: '15'
							}
						}
					}
				}
			},
			result = layout(contentAggregate, dimensionProvider, {h: 30});
		expect(_.sortBy(Object.keys(result), parseFloat)).toEqual(['7', '8', '11', '16']);
	});
	it('includes root even if empty group', function () {
		const contentAggregate = {
				id: 7,
				title: '1',
				attr: { group: 'standard' },
				ideas: {}
			},
			result = layout(contentAggregate, dimensionProvider, {h: 30});
		expect(result[7]).toBeTruthy();
	});
	it('removes titles from group nodes', function () {
		const contentAggregate = {
				id: 7,
				title: '1',
				attr: { group: 'standard' },
				ideas: {}
			},
			result = layout(contentAggregate, dimensionProvider, {h: 30});
		expect(result[7].title).toBe('');
	});
	it('does not remove titles from non-group nodes', function () {
		const contentAggregate = {
				id: 7,
				title: '1',
				attr: { xgroup: 'standard' },
				ideas: {}
			},
			result = layout(contentAggregate, dimensionProvider, {h: 30});
		expect(result[7].title).toBe('1');
	});
});
