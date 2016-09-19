/*global describe, expect, it, MAPJS, jasmine, beforeEach*/
describe('MAPJS.calculateLayout', function () {
	'use strict';
	var idea, dimensionProvider, layouts, optional, defaultMargin;
	beforeEach(function () {
		defaultMargin = {h: 20, v: 20};
		idea = {
			id: 'root',
			ideas: {
				1: {}
			}
		};
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
			expect(layouts.standard).toHaveBeenCalledWith(idea.ideas[1], dimensionProvider, defaultMargin);
		});
	});
	describe('when the theme is provided', function () {
		it('should use the orientation to calculate the layout', function () {
			optional.theme = new MAPJS.Theme({layout: {orientation: 'top-down'}});
			MAPJS.calculateLayout(idea, dimensionProvider, optional);
			expect(layouts['top-down']).toHaveBeenCalledWith(idea.ideas[1], dimensionProvider, defaultMargin);
		});
		it('should use the spacing as a margin', function () {
			optional.theme = new MAPJS.Theme({layout: {spacing: 30}});
			MAPJS.calculateLayout(idea, dimensionProvider, optional);
			expect(layouts.standard).toHaveBeenCalledWith(idea.ideas[1], dimensionProvider, {h: 30, v: 30});
		});
		it('should pass margin when it is an object with h and v attributes', function () {
			optional.theme = new MAPJS.Theme({layout: {spacing: {h: 30, v: 50}}});
			MAPJS.calculateLayout(idea, dimensionProvider, optional);
			expect(layouts.standard).toHaveBeenCalledWith(idea.ideas[1], dimensionProvider, {h: 30, v: 50});

		});
		it('should use the standard layout to calculate the layout when orientation is not recognised', function () {
			optional.theme = new MAPJS.Theme({layout: {orientation: 'not-top-down'}});
			MAPJS.calculateLayout(idea, dimensionProvider, optional);
			expect(layouts.standard).toHaveBeenCalledWith(idea.ideas[1], dimensionProvider, defaultMargin);
			expect(layouts['top-down']).not.toHaveBeenCalled();
		});
	});
	describe('common layout info', function () {
		it('should include the orientation from the theme', function () {
			var idea = {
					id: 'root',
					ideas: {
						1: {
							title: 'parent',
							id: 1
						}
					}
				},
				result;
			layouts.standard.and.returnValue({
				1: {x: 0, y: 0, height: 10, width: 10}
			});
			optional.theme = new MAPJS.Theme({layout: {orientation: 'not-top-down'}});
			result = MAPJS.calculateLayout(idea, dimensionProvider, optional);
			expect(result.orientation).toEqual('not-top-down');
		});
		it('should attach node styles', function () {
			var result;
			layouts.standard.and.returnValue({
				1: {level: 3, attr: { group: 'blue'}, x: 0, y: 0, height: 10, width: 10 },
				4: {level: 6, x: 0, y: 0, height: 10, width: 10}
			});
			result = MAPJS.calculateLayout(idea, dimensionProvider, optional);
			expect(result.nodes[1].styles).toEqual(['attr_group_blue', 'attr_group', 'level_3', 'default']);
			expect(result.nodes[4].styles).toEqual(['level_6', 'default']);
		});
		it('should attach root node IDs', function () {
			var result;
			idea = {
					id: 'root',
					ideas: {
						1: {
							title: 'parent',
							id: 1
						},
						2: {
							title: 'parent2',
							id: 2
						}
					}
				};
			layouts.standard.and.callFake(function (idea) {
				if (idea.id === 1) {
					return {
						1: {level: 1, x: 0, y: 0, height: 10, width: 10},
						11: {level: 2, x: 0, y: 0, height: 10, width: 10},
						111: {level: 3, x: 0, y: 0, height: 10, width: 10}
					};
				} else {
					return {
						2: {level: 1, x: 0, y: 0, height: 10, width: 10},
						21: {level: 2, x: 0, y: 0, height: 10, width: 10},
						211: {level: 3, x: 0, y: 0, height: 10, width: 10}
					};
				}
			});
			result = MAPJS.calculateLayout(idea, dimensionProvider, optional);
			expect(result.nodes[1].rootId).toEqual(1);
			expect(result.nodes[11].rootId).toEqual(1);
			expect(result.nodes[111].rootId).toEqual(1);
			expect(result.nodes[2].rootId).toEqual(2);
			expect(result.nodes[21].rootId).toEqual(2);
			expect(result.nodes[211].rootId).toEqual(2);
		});
		it('should include the theme id from the idea', function () {
			var idea = {
					id: 'root',
					attr: { theme: 'blue' },
					ideas: {
						1: {
							title: 'parent',
							id: 1
						}
					}
				},
				result;
			layouts.standard.and.returnValue({
				1: {x: 0, y: 0, height: 10, width: 10}
			});
			optional.theme = new MAPJS.Theme({layout: {orientation: 'not-top-down'}});
			result = MAPJS.calculateLayout(idea, dimensionProvider, optional);
			expect(result.theme).toEqual('blue');
		});
		it('should include connectors regardless of the layout', function () {
			var idea = {
					id: 'root',
					ideas: {
						1: {
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
						}
					}
				},
				result;
			layouts.standard.and.returnValue({
				1: {x: 0, y: 0, height: 10, width: 10},
				11: {x: 0, y: 0, height: 10, width: 10},
				12: {x: 0, y: 0, height: 10, width: 10},
				112: {x: 0, y: 0, height: 10, width: 10},
				111: {x: 0, y: 0, height: 10, width: 10}
			});

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
					id: 'root',
					ideas: {
						1: {
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
							}
						}
					},
					links: [{
						ideaIdFrom: 2,
						ideaIdTo: 3
					}]
				},
				result;

			layouts.standard.and.returnValue({ 1: {id: 1, x: 0, y: 0, height: 10, width: 10}});
			result = MAPJS.calculateLayout(idea, dimensionProvider, optional);
			expect(result.links).toEqual({});
		});
		it('should include links between non-collapsed nodes', function () {
			var idea = {
					id: 'root',
					ideas: {
						1: {
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
							}
						}
					},
					links: [{
						ideaIdFrom: 2,
						ideaIdTo: 3,
						attr: { name: 'val' }
					}]
				},
				result;

			layouts.standard.and.returnValue({
				1: {id: 1, x: 0, y: 0, height: 10, width: 10},
				2: {id: 2, x: 0, y: 0, height: 10, width: 10},
				3: {id: 3, x: 0, y: 0, height: 10, width: 10}
			});
			result = MAPJS.calculateLayout(idea, dimensionProvider, optional);
			expect(result.links).toEqual({ '2_3' : { ideaIdFrom : 2, ideaIdTo : 3, attr : { name: 'val' } } });
		});
	});

});
