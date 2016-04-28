/*global describe, expect, it, jasmine, require, beforeEach*/
var layout = require('../../src/layouts/standard');
describe('layouts/standard', function () {
	'use strict';

	var margin,
		dimensionProvider;

	beforeEach(function () {
		margin = 20;
		dimensionProvider = function (idea) {
			var length = (idea.title || '').length + 1;
			return {
				width: length * 20,
				height: length * 10
			};
		};
	});
	it('should assign root node level 1', function () {
		var contentAggregate = { id: 7 },
			result = layout(contentAggregate, dimensionProvider, margin);
		expect(result.nodes[7].level).toEqual(1);
	});
	it('should assign child node levels recursively', function () {
		var contentAggregate = {
				id: 7,
				ideas: {
					1: {
						id: 2,
						ideas: {
							1: {
								id: 22
							}
						}
					},
					2: {
						id: 3
					}
				}
			},
			result = layout(contentAggregate, dimensionProvider, margin);
		expect(result.nodes[7].level).toEqual(1);
		expect(result.nodes[2].level).toEqual(2);
		expect(result.nodes[22].level).toEqual(3);
		expect(result.nodes[3].level).toEqual(2);
	});
	it('should place a root node on (margin, margin)', function () {
		var contentAggregate = {
				id: 7,
				title: 'Hello'
			},
			result;
		result = layout(contentAggregate, dimensionProvider, margin);
		expect(result.nodes[7]).toEqual(jasmine.objectContaining({
			id: 7,
			x: -60,
			y: -30,
			width: 120,
			height: 60,
			title: 'Hello',
			level: 1
		}));
	});
	it('should place root node left of its only right child', function () {
		var contentAggregate = {
				id: 7,
				title: '1',
				ideas: {
					1: {
						id: 8,
						title: '12'
					}
				}
			},
			result;
		result = layout(contentAggregate, dimensionProvider, margin);
		expect(result.nodes[7]).toEqual(jasmine.objectContaining({
			x: -20,
			y: -10
		}));
		expect(result.nodes[8]).toEqual(jasmine.objectContaining({
			x: 40,
			y: -15
		}));
	});
	it('should place root node right of its only left child', function () {
		var contentAggregate = {
				id: 7,
				title: '1',
				ideas: {
					1: {
						id: 8,
						title: '12'
					},
					'-1': {
						id: 9,
						title: '123'
					}
				}
			},
			result;
		result = layout(contentAggregate, dimensionProvider, margin);
		expect(result.nodes[9]).toEqual(jasmine.objectContaining({
			x: -120,
			y: -20
		}));
	});
	it('should work recursively', function () {
		var contentAggregate = {
				id: 7,
				title: '1',
				ideas: {
					1: {
						id: 8,
						title: '12'
					},
					'-1': {
						id: 9,
						title: '123',
						ideas: {
							3: {
								id: 10,
								title: '1234'
							}
						}
					}
				}
			},
			result;
		result = layout(contentAggregate, dimensionProvider, margin);
		expect(result.nodes[10].x).toBe(-240);
	});
	it('should place child nodes below each other', function () {
		var contentAggregate = {
				id: 7,
				title: '1',
				ideas: {
					2: {
						id: 8,
						title: '12'
					},
					1: {
						id: 9,
						title: '123'
					}
				}
			},
			result;
		result = layout(contentAggregate, dimensionProvider, margin);
		expect(result.nodes[9].y).toBe(-45);
		expect(result.nodes[8].y).toBe(15);
	});
	it('should center children vertically', function () {
		var contentAggregate = {
				id: 10,
				title: '123',
				ideas: {
					'-2': {
						id: 11,
						title: ''
					}
				}
			},
			result;
		result = layout(contentAggregate, dimensionProvider, margin);
		expect(result.nodes[11].y).toBe(-5);
	});
	it('should copy style to nodes', function () {
		var contentAggregate = {
			id: 1,
			title: '123',
			attr: { collapsed: true, style: { background: '#FFFFFF'}}
		},
			result = layout(contentAggregate, dimensionProvider, margin);
		expect(result.nodes[1]).toEqual(jasmine.objectContaining({
			attr: {collapsed: true, style: { background: '#FFFFFF'}}
		}));
	});
	it('should not include links between collapsed nodes', function () {
		var contentAggregate = {
			id: 1,
			title: 'first',
			attr: { collapsed: true },
			ideas: {
				100: {
					id: 2,
					title: 'second'
				},
				200: {
					id: 3,
					title: 'third'
				}
			},
			links: [{
				ideaIdFrom: 2,
				ideaIdTo: 3
			}]
		},
			result;

		result = layout(contentAggregate, dimensionProvider, margin);

		expect(result.links).toEqual({});
	});
	it('should include links between non-collapsed nodes', function () {
		var contentAggregate = {
			id: 1,
			title: 'first',
			ideas: {
				100: {
					id: 2,
					title: 'second'
				},
				200: {
					id: 3,
					title: 'third'
				}
			},
			links: [{
				ideaIdFrom: 2,
				ideaIdTo: 3,
				attr: { name: 'val' }
			}]
		},
			result;

		result = layout(contentAggregate, dimensionProvider, margin);

		expect(result.links).toEqual({ '2_3' : { ideaIdFrom : 2, ideaIdTo : 3, attr : { name: 'val' } } });
	});
	it('takes node spacing from the margin', function () {
		var contentAggregate = {
				id: 7,
				title: '1', /*width 40, height: 20 */
				ideas: {
					1: {
						id: 8,
						title: '12' /*width: 60, height: 40 */
					}
				}
			},
			result;
		result = layout(contentAggregate, dimensionProvider, 30);
		expect(result.nodes[7]).toEqual(jasmine.objectContaining({
			x: -20,
			y: -10
		}));
		expect(result.nodes[8]).toEqual(jasmine.objectContaining({
			x: 50,
			y: -15
		}));
	});
});
