/*global describe, expect, it,  jasmine, beforeEach, require*/
const _ = require('underscore'),
	calculateLayout = require('../../../src/core/layout/calculate-layout'),
	Theme = require('../../../src/core/theme/theme');
describe('calculateLayout', function () {
	'use strict';
	const makeConnector = (obj) => _.extend({type: 'connector'}, obj);
	let idea, dimensionProvider, layouts, optional, defaultMargin;
	beforeEach(function () {
		defaultMargin = {h: 20, v: 20};
		idea = {
			formatVersion: 3,
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
	describe('version upgrades', function () {
		it('upgrades the content before layout', function () {
			idea.formatVersion = 2;
			calculateLayout(idea, dimensionProvider, optional);
			expect(idea.formatVersion).toEqual(3);
			expect(idea.ideas[1].id).toEqual('root');
			expect(layouts.standard).toHaveBeenCalledWith(idea.ideas[1], dimensionProvider, defaultMargin);
		});
		it('lays out subideas when using v3', function () {
			idea.formatVersion = 3;
			calculateLayout(idea, dimensionProvider, optional);
			expect(layouts.standard).toHaveBeenCalledWith(idea.ideas[1], dimensionProvider, defaultMargin);
		});
	});
	describe('when the theme is not provided', function () {
		it('should use the standard layout and margin', function () {
			calculateLayout(idea, dimensionProvider, optional);
			expect(layouts.standard).toHaveBeenCalledWith(idea.ideas[1], dimensionProvider, defaultMargin);
		});
	});
	describe('when the theme is provided', function () {
		it('should use the orientation to calculate the layout', function () {
			optional.theme = new Theme({layout: {orientation: 'top-down'}});
			calculateLayout(idea, dimensionProvider, optional);
			expect(layouts['top-down']).toHaveBeenCalledWith(idea.ideas[1], dimensionProvider, defaultMargin);
		});
		it('should use the spacing as a margin', function () {
			optional.theme = new Theme({layout: {spacing: 30}});
			calculateLayout(idea, dimensionProvider, optional);
			expect(layouts.standard).toHaveBeenCalledWith(idea.ideas[1], dimensionProvider, {h: 30, v: 30});
		});
		it('should pass margin when it is an object with h and v attributes', function () {
			optional.theme = new Theme({layout: {spacing: {h: 30, v: 50}}});
			calculateLayout(idea, dimensionProvider, optional);
			expect(layouts.standard).toHaveBeenCalledWith(idea.ideas[1], dimensionProvider, {h: 30, v: 50});

		});
		it('should use the standard layout to calculate the layout when orientation is not recognised', function () {
			optional.theme = new Theme({layout: {orientation: 'not-top-down'}});
			calculateLayout(idea, dimensionProvider, optional);
			expect(layouts.standard).toHaveBeenCalledWith(idea.ideas[1], dimensionProvider, defaultMargin);
			expect(layouts['top-down']).not.toHaveBeenCalled();
		});
	});
	describe('common layout info', function () {
		let result;
		it('should include the orientation from the theme', function () {
			const idea = {
				id: 'root',
				formatVersion: 3,
				ideas: {
					1: {
						title: 'parent',
						id: 1
					}
				}
			};
			layouts.standard.and.returnValue({
				1: {x: 0, y: 0, height: 10, width: 10}
			});
			optional.theme = new Theme({layout: {orientation: 'not-top-down'}});
			result = calculateLayout(idea, dimensionProvider, optional);
			expect(result.orientation).toEqual('not-top-down');
		});
		it('should attach node styles', function () {
			layouts.standard.and.returnValue({
				1: {level: 3, attr: { group: 'blue'}, x: 0, y: 0, height: 10, width: 10 },
				4: {level: 6, x: 0, y: 0, height: 10, width: 10}
			});
			result = calculateLayout(idea, dimensionProvider, optional);
			expect(result.nodes[1].styles).toEqual(['attr_group_blue', 'attr_group', 'level_3', 'default']);
			expect(result.nodes[4].styles).toEqual(['level_6', 'default']);
		});
		it('should attach root node IDs', function () {
			const idea = {
				id: 'root',
				formatVersion: 3,
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
			result = calculateLayout(idea, dimensionProvider, optional);
			expect(result.nodes[1].rootId).toEqual(1);
			expect(result.nodes[11].rootId).toEqual(1);
			expect(result.nodes[111].rootId).toEqual(1);
			expect(result.nodes[2].rootId).toEqual(2);
			expect(result.nodes[21].rootId).toEqual(2);
			expect(result.nodes[211].rootId).toEqual(2);
		});
		it('should include the theme id from the idea', function () {
			const idea = {
				id: 'root',
				formatVersion: 3,
				attr: { theme: 'blue' },
				ideas: {
					1: {
						title: 'parent',
						id: 1
					}
				}
			};
			layouts.standard.and.returnValue({
				1: {x: 0, y: 0, height: 10, width: 10}
			});
			optional.theme = new Theme({layout: {orientation: 'not-top-down'}});
			result = calculateLayout(idea, dimensionProvider, optional);
			expect(result.theme).toEqual('blue');
		});
		describe('connector handling', function () {
			beforeEach(function () {
				idea = {
					id: 'root',
					formatVersion: 3,
					ideas: {
						1: {
							title: 'parent',
							id: 1,
							ideas: {
								5: {
									title: 'second child',
									id: 12,
									ideas: { 1: { id: 112, title: 'XYZ' } },
									attr: { parentConnector: {color: 'green'} }
								},
								4: {
									title: 'child',
									id: 11,
									ideas: { 1: { id: 111, title: 'XYZ' } }
								}
							}
						}
					}
				};
				layouts.standard.and.returnValue({
					1: {x: 0, y: 0, height: 10, width: 10},
					11: {x: 0, y: 0, height: 10, width: 10},
					12: {x: 0, y: 0, height: 10, width: 10},
					112: {x: 0, y: 0, height: 10, width: 10},
					111: {x: 0, y: 0, height: 10, width: 10}
				});
			});
			it('should include connectors regardless of the layout', function () {
				result = calculateLayout(idea, dimensionProvider, optional);

				expect(result.connectors).toEqual({
					11: makeConnector({ from: 1, to: 11 }),
					12: makeConnector({ from: 1, to: 12, attr: {color: 'green'} }),
					112: makeConnector({ from: 12, to: 112 }),
					111: makeConnector({ from: 11, to: 111 })
				});
			});
			it('should allow the theme to block connector overrides', function () {
				optional.theme = new Theme({blockParentConnectorOverride: true});
				result = calculateLayout(idea, dimensionProvider, optional);
				expect(result.connectors[12].attr).toBeFalsy();
			});
		});

		it('should not include links between collapsed nodes', function () {
			const idea = {
				id: 'root',
				formatVersion: 3,
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
			};

			layouts.standard.and.returnValue({ 1: {id: 1, x: 0, y: 0, height: 10, width: 10}});
			result = calculateLayout(idea, dimensionProvider, optional);
			expect(result.links).toEqual({});
		});
		it('should include links between non-collapsed nodes', function () {
			const idea = {
				id: 'root',
				formatVersion: 3,
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
			};

			layouts.standard.and.returnValue({
				1: {id: 1, x: 0, y: 0, height: 10, width: 10},
				2: {id: 2, x: 0, y: 0, height: 10, width: 10},
				3: {id: 3, x: 0, y: 0, height: 10, width: 10}
			});
			result = calculateLayout(idea, dimensionProvider, optional);
			expect(result.links).toEqual({
				'2_3': {
					type: 'link',
					ideaIdFrom: 2,
					ideaIdTo: 3,
					attr: {
						name: 'val'
					}
				}
			});
		});
	});

});
