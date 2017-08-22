/*global describe, expect, it, jasmine, require, beforeEach*/
const _ = require('underscore'),
	layout = require('../../../../src/core/layout/standard/calculate-standard-layout');

describe('calculateStandardLayout', function () {
	'use strict';
	let margin,
		dimensionProvider;

	beforeEach(function () {
		margin = {h: 20, v: 20};
		dimensionProvider = function (idea) {
			const length = (idea.title || '').length + 1;
			return {
				width: length * 20,
				height: length * 10
			};
		};
	});
	it('should assign root node level 1', function () {
		const contentAggregate = { id: 7 },
			result = layout(contentAggregate, dimensionProvider, margin);
		expect(result[7].level).toEqual(1);
	});
	it('should assign child node levels recursively', function () {
		const contentAggregate = {
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
		expect(result[7].level).toEqual(1);
		expect(result[2].level).toEqual(2);
		expect(result[22].level).toEqual(3);
		expect(result[3].level).toEqual(2);
	});
	it('should place a root node on (margin, margin)', function () {
		const contentAggregate = {
				id: 7,
				title: 'Hello'
			},
			result = layout(contentAggregate, dimensionProvider, margin);
		expect(result[7]).toEqual(jasmine.objectContaining({
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
		const contentAggregate = {
				id: 7,
				title: '1',
				ideas: {
					1: {
						id: 8,
						title: '12'
					}
				}
			},
			result = layout(contentAggregate, dimensionProvider, margin);
		expect(result[7]).toEqual(jasmine.objectContaining({
			x: -20,
			y: -10
		}));
		expect(result[8]).toEqual(jasmine.objectContaining({
			x: 40,
			y: -15
		}));
	});
	it('should place root node right of its only left child', function () {
		const contentAggregate = {
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
			result = layout(contentAggregate, dimensionProvider, margin);
		expect(result[9]).toEqual(jasmine.objectContaining({
			x: -120,
			y: -20
		}));
	});
	it('should work recursively', function () {
		const contentAggregate = {
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
			result = layout(contentAggregate, dimensionProvider, margin);
		expect(result[10].x).toBe(-240);
	});
	it('should place child nodes below each other', function () {
		const contentAggregate = {
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
			result = layout(contentAggregate, dimensionProvider, margin);
		expect(result[9].y).toBe(-45);
		expect(result[8].y).toBe(15);
	});
	it('should center children vertically', function () {
		const contentAggregate = {
				id: 10,
				title: '123',
				ideas: {
					'-2': {
						id: 11,
						title: ''
					}
				}
			},
			result = layout(contentAggregate, dimensionProvider, margin);
		expect(result[11].y).toBe(-5);
	});
	it('should copy style to nodes', function () {
		const contentAggregate = {
				id: 1,
				title: '123',
				attr: { collapsed: true, style: { background: '#FFFFFF'}}
			},
			result = layout(contentAggregate, dimensionProvider, margin);
		expect(result[1]).toEqual(jasmine.objectContaining({
			attr: {collapsed: true, style: { background: '#FFFFFF'}}
		}));
	});
	it('takes node spacing from the margin', function () {
		const contentAggregate = {
				id: 7,
				title: '1', /*width 40, height: 20 */
				ideas: {
					1: {
						id: 8,
						title: '12' /*width: 60, height: 40 */
					}
				}
			},
			result = layout(contentAggregate, dimensionProvider, {h: 30});
		expect(result[7]).toEqual(jasmine.objectContaining({
			x: -20,
			y: -10
		}));
		expect(result[8]).toEqual(jasmine.objectContaining({
			x: 50,
			y: -15
		}));
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

});
