/*global describe, expect, it, MAPJS, jasmine, beforeEach*/
describe('MAPJS.calculateLayout', function () {
	'use strict';
	var idea, dimensionProvider, layouts, optional;
	beforeEach(function () {
		idea = {};
		dimensionProvider = {};

		layouts = {
			standard: jasmine.createSpy('standard'),
			'top-down': jasmine.createSpy('top-down')
		};
		optional = {
			layouts: layouts
		};
	});
	describe('when the theme is not provided', function () {
		it('should use the standard layout and margin', function () {
			MAPJS.calculateLayout(idea, dimensionProvider, optional);
			expect(layouts.standard).toHaveBeenCalledWith(idea, dimensionProvider, 20);
		});
	});
	describe('when the theme is provided', function () {
		it('should use the orientation to calculate the layout', function () {
			optional.theme = new MAPJS.Theme({layout: {orientation: 'top-down'}});
			MAPJS.calculateLayout(idea, dimensionProvider, optional);
			expect(layouts['top-down']).toHaveBeenCalledWith(idea, dimensionProvider, 20);
		});
		it('should use the spacing as a margin', function () {
			optional.theme = new MAPJS.Theme({layout: {spacing: 30}});
			MAPJS.calculateLayout(idea, dimensionProvider, optional);
			expect(layouts.standard).toHaveBeenCalledWith(idea, dimensionProvider, 30);
		});
		it('should use the standard layout to calculate the layout when orientation is not recognised', function () {
			optional.theme = new MAPJS.Theme({layout: {orientation: 'not-top-down'}});
			MAPJS.calculateLayout(idea, dimensionProvider, optional);
			expect(layouts.standard).toHaveBeenCalledWith(idea, dimensionProvider, 20);
			expect(layouts['top-down']).not.toHaveBeenCalled();
		});

	});
});
