/*global describe, it, expect, require*/
var alignGroup = require('../../src/layouts/align-group');
describe('alignGroup', function () {
	'use strict';
	it('expands the root node to cover its direct children', function () {
		var idea = {
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
		expect(layout.levels[0]).toEqual({width: 250, xOffset: -100});
	});
	it('ignores node size when layout out groups', function () {
		var idea = {
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
		expect(layout.levels[0]).toEqual({width: 250, xOffset: -100});
	});
	it('does not try to cover grandchildren', function () {
		var idea = {
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
		expect(layout.levels[0]).toEqual({width: 250, xOffset: -100});
	});
	it('does not blow up on empty groups', function () {
		var idea = {
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
});
