/*global describe, expect, it, MAPJS, jasmine, beforeEach*/
describe('MAPJS.calculateLayout', function () {
	'use strict';
	var idea, dimensionProvider, layouts, optional, defaultMargin;
	beforeEach(function () {
		defaultMargin = {h: 20, v: 20};
		idea = {};
		dimensionProvider = {};

		layouts = {
			standard: jasmine.createSpy('standard'),
			'top-down': jasmine.createSpy('top-down')
		};
		optional = {
			layouts: layouts
		};
		layouts.standard.and.returnValue({});
		layouts['top-down'].and.returnValue({});

	});
	describe('when the theme is not provided', function () {
		it('should use the standard layout and margin', function () {
			MAPJS.calculateLayout(idea, dimensionProvider, optional);
			expect(layouts.standard).toHaveBeenCalledWith(idea, dimensionProvider, defaultMargin);
		});
	});
	describe('when the theme is provided', function () {
		it('should use the orientation to calculate the layout', function () {
			optional.theme = new MAPJS.Theme({layout: {orientation: 'top-down'}});
			MAPJS.calculateLayout(idea, dimensionProvider, optional);
			expect(layouts['top-down']).toHaveBeenCalledWith(idea, dimensionProvider, defaultMargin);
		});
		it('should use the spacing as a margin', function () {
			optional.theme = new MAPJS.Theme({layout: {spacing: 30}});
			MAPJS.calculateLayout(idea, dimensionProvider, optional);
			expect(layouts.standard).toHaveBeenCalledWith(idea, dimensionProvider, {h: 30, v: 30});
		});
		it('should pass margin when it is an object with h and v attributes', function () {
			optional.theme = new MAPJS.Theme({layout: {spacing: {h: 30, v: 50}}});
			MAPJS.calculateLayout(idea, dimensionProvider, optional);
			expect(layouts.standard).toHaveBeenCalledWith(idea, dimensionProvider, {h: 30, v: 50});

		});
		it('should use the standard layout to calculate the layout when orientation is not recognised', function () {
			optional.theme = new MAPJS.Theme({layout: {orientation: 'not-top-down'}});
			MAPJS.calculateLayout(idea, dimensionProvider, optional);
			expect(layouts.standard).toHaveBeenCalledWith(idea, dimensionProvider, defaultMargin);
			expect(layouts['top-down']).not.toHaveBeenCalled();
		});
	});
	describe('common layout info', function () {
		it('should include connectors regardless of the layout', function () {
			var idea = {
					title: 'parent',
					id: 1,
					ideas: {
						5: {
							title: 'second child',
							id: 12,
							ideas: { 1: { id: 112, title: 'XYZ' } }
						},
						4: {
							title: 'child',
							id: 11,
							ideas: { 1: { id: 111, title: 'XYZ' } }
						}
					}
				},
				result = MAPJS.calculateLayout(idea, dimensionProvider, optional);

			expect(result.connectors).toEqual({
				11: Object({ from: 1, to: 11 }),
				12: Object({ from: 1, to: 12 }),
				112: Object({ from: 12, to: 112 }),
				111: Object({ from: 11, to: 111 })
			});
		});
		it('should not include links between collapsed nodes', function () {
			var idea = {
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

			layouts.standard.and.returnValue({ 1: {id: 1}});
			result = MAPJS.calculateLayout(idea, dimensionProvider, optional);
			expect(result.links).toEqual({});
		});
		it('should include links between non-collapsed nodes', function () {
			var idea = {
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

			layouts.standard.and.returnValue({ 1: {id: 1}, 2: {id: 2}, 3: {id: 3}});
			result = MAPJS.calculateLayout(idea, dimensionProvider, optional);
			expect(result.links).toEqual({ '2_3' : { ideaIdFrom : 2, ideaIdTo : 3, attr : { name: 'val' } } });
		});
	});

});
