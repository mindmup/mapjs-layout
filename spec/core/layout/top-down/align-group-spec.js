/*global describe, it, expect, require*/
const alignGroup = require('../../../../src/core/layout/top-down/align-group');
describe('alignGroup', function () {
	'use strict';
	it('expands the root node to cover its direct children', function () {
		const idea = {
				id: 5,
				ideas: {
					'-1': { id: 6 },
					1: { id: 7 }
				}
			},
			layout = {
				nodes: {
					5: {width: 50, height: 20, x: -10, y: 10 },
					6: {width: 20, x: -100},
					7: {width: 50, x: 100}
				},
				levels: [{width: 50, xOffset: -10}]
			};
		alignGroup(layout, idea);
		expect(layout.nodes[5]).toEqual({width: 250, height: 20, x: -100, y: 10 });
	});
	it('ignores node size when layout out groups', function () {
		const idea = {
				id: 5,
				ideas: {
					'-1': { id: 6 },
					1: { id: 7 }
				}
			},
			layout = {
				nodes: {
					5: {width: 400, height: 20, x: -200, y: 10 },
					6: {width: 20, x: -100},
					7: {width: 50, x: 100}
				},
				levels: [{width: 400, xOffset: -200}]
			};
		alignGroup(layout, idea);
		expect(layout.nodes[5]).toEqual({width: 250, height: 20, x: -100, y: 10 });
	});
	it('does not try to cover grandchildren', function () {
		const idea = {
				id: 5,
				ideas: {
					'-1': { id: 6,
						ideas: {
							1: { id: 8 }
						}
					},
					1: { id: 7 }
				}
			},
			layout = {
				nodes: {
					5: {width: 50, height: 20, x: -10, y: 10 },
					6: {width: 20, x: -100},
					7: {width: 50, x: 100},
					8: {width: 400, x: -200 }
				},
				levels: [{xOffset: -10, width: 50}]
			};
		alignGroup(layout, idea);
		expect(layout.nodes[5]).toEqual({width: 250, height: 20, x: -100, y: 10 });
	});
	it('does not blow up on empty groups', function () {
		const idea = {
				id: 5
			},
			layout = {
				nodes: {
					5: {width: 50, height: 20, x: -10, y: 10 },
					6: {width: 20, x: -100},
					7: {width: 50, x: 100},
					8: {width: 400, x: -200 }
				},
				levels: [{xOffset: -10, width: 50}]
			};
		alignGroup(layout, idea);
		expect(layout.nodes[5]).toEqual({width: 50, height: 20, x: -10, y: 10 });

	});
	it('ignores collapsed groups', function () {
		const idea = {
				'title': 'Mindmup',
				'id': 1,
				'ideas': {
					'2': {
						'title': 'group',
						'id': 7,
						'attr': {
							'contentLocked': true,
							'group': true,
							'collapsed': true
						},
						'ideas': {
							'1': {
								'title': 'inside another group',
								'id': 8,
								'ideas': {}
							}
						}
					},
					'-1': {
						'title': 'outside group',
						'id': 6
					}
				},
				'attr': {
					'theme': 'topdown'
				}
			},
			layout = {
				nodes: {
					1: {width: 50, height: 20, x: -10, y: 10 },
					7: {width: 20, x: -100},
					6: {width: 400, x: -200 }
				},
				levels: [{xOffset: -10, width: 50}]
			};

		alignGroup(layout, idea.ideas[2]);
		expect(layout.nodes[6]).toEqual({width: 400, x: -200});
		expect(layout.nodes[7]).toEqual({width: 20, x: -100});

	});
	it('increments vertical offset on nodes within same level', function () {
		const idea = {
				id: 5
			},
			layout = {
				nodes: {
					5: {id: 5, width: 400, height: 20, x: -200, y: 10, level: 1, verticalOffset: 0 },
					6: {id: 6, width: 20, x: -100, level: 1},
					7: {id: 7, width: 50, x: 100, level: 1, verticalOffset: 10}
				},
				levels: [{width: 400, xOffset: -200}]
			};
		alignGroup(layout, idea);
		expect(layout.nodes[5].verticalOffset).toEqual(0);
		expect(layout.nodes[6].verticalOffset).toEqual(20);
		expect(layout.nodes[7].verticalOffset).toEqual(30);
	});
});
