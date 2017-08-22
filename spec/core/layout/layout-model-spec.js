/*global describe, require, beforeEach, it, expect*/
const LayoutModel = require('../../../src/core/layout/layout-model');
describe('LayoutModel', function () {
	'use strict';
	let underTest, layout;
	beforeEach(function () {
		underTest = new LayoutModel({bar: 'foo'});
	});
	describe('getLayout', function () {
		it('should return empty Layout if none set', function () {
			expect(underTest.getLayout()).toEqual({bar: 'foo'});
		});
		it('should return empty Layout if falsy set', function () {
			underTest.setLayout(false);
			expect(underTest.getLayout()).toEqual({bar: 'foo'});
		});
		it('should return layout', function () {
			underTest.setLayout({foo: 'bar'});
			expect(underTest.getLayout()).toEqual({foo: 'bar'});
		});
	});
	describe('getOrientation', function () {
		it('should return standard if the layout is never set', function () {
			expect(underTest.getOrientation()).toEqual('standard');
		});
		it('should return standard if .orientation is not defined on the layout', function () {
			underTest.setLayout({nodes: { 1: {}}});
			expect(underTest.getOrientation()).toEqual('standard');
		});
		it('should return .orientation if it is defined', function () {
			underTest.setLayout({nodes: { 1: {}}, orientation: 'all-over-the-place'});
			expect(underTest.getOrientation()).toEqual('all-over-the-place');
		});
	});
	describe('getNodeBox', function () {
		beforeEach(function () {
			layout = {
				nodes: {
					1: {
						id: 1,
						width: 30,
						height: 84,
						level: 1,
						x: -15,
						y: -42
					},
					2: {
						id: 2,
						width: 40,
						height: 49,
						level: 2,
						x: -20,
						y: 62
					},
					3: {
						id: 3,
						width: 30,
						height: 76,
						level: 2,
						x: -15,
						y: -138
					}
				}
			};
			underTest.setLayout(layout);
		});
		it('should return node box for Id', function () {
			expect(underTest.getNodeBox(2)).toEqual({
				width: 40,
				height: 49,
				level: 2,
				left: -20,
				top: 62,
				styles: ['default']
			});
		});
		it('should return falsy for invalid id', function () {
			expect(underTest.getNodeBox(4)).toBeFalsy();
		});
		it('should return falsy for undefined id', function () {
			expect(underTest.getNodeBox()).toBeFalsy();
		});
		it('should return falsy undefined layout', function () {
			underTest = new LayoutModel();
			expect(underTest.getNodeBox(4)).toBeFalsy();
		});

	});
	describe('getNode', function () {
		beforeEach(function () {
			layout = {
				nodes: {
					1: {
						id: 1,
						width: 30,
						height: 84,
						level: 1,
						x: -15,
						y: -42
					},
					2: {
						id: 2,
						width: 40,
						height: 49,
						level: 2,
						x: -20,
						y: 62
					},
					3: {
						id: 3,
						width: 30,
						height: 76,
						level: 2,
						x: -15,
						y: -138
					}
				}
			};
			underTest.setLayout(layout);
		});
		it('should return node for Id', function () {
			expect(underTest.getNode(2)).toEqual({
				id: 2,
				width: 40,
				height: 49,
				level: 2,
				x: -20,
				y: 62
			});
		});
		it('should return falsy for invalid id', function () {
			expect(underTest.getNode(4)).toBeFalsy();
		});
		it('should return falsy for undefined id', function () {
			expect(underTest.getNode()).toBeFalsy();
		});
		it('should return falsy undefined layout', function () {
			underTest = new LayoutModel();
			expect(underTest.getNode(4)).toBeFalsy();
		});
	});
	describe('isRootNode', function () {
		beforeEach(function () {
			layout = {
				nodes: {
					1: {
						id: 1,
						width: 30,
						height: 84,
						level: 1,
						x: -15,
						y: -42
					},
					2: {
						id: 2,
						width: 40,
						height: 49,
						level: 2,
						x: -20,
						y: 62
					},
					3: {
						id: 3,
						width: 30,
						height: 76,
						level: 2,
						x: -15,
						y: -138
					}
				}
			};
			underTest.setLayout(layout);
		});
		it('returns false if node is not in the layout', function () {
			expect(underTest.isRootNode(11)).toBeFalsy();
		});
		it('returns true if node is in the layout with level 1', function () {
			expect(underTest.isRootNode(1)).toBeTruthy();
		});
		it('returns false if node is in the layout with level > 1', function () {
			expect(underTest.isRootNode(3)).toBeFalsy();
		});
	});
	describe('vertical relationships', function () {
		beforeEach(function () {
			layout = {
				nodes: {
					1: {
						id: 1,
						width: 30,
						height: 84,
						level: 1,
						x: -15,
						y: -42
					},
					2: {
						id: 2,
						width: 40,
						height: 49,
						level: 2,
						x: -20,
						y: 62
					},
					3: {
						id: 3,
						width: 30,
						height: 76,
						level: 2,
						x: -15,
						y: -138
					}
				}
			};
			underTest.setLayout(layout);
		});
		describe('nodeIdUp', function () {
			it('should return the id of the node above', function () {
				expect(underTest.nodeIdUp(1)).toEqual(3);
			});

			it('should return the id of the node above when it is to the right', function () {
				layout.nodes[3].x = -1000;
				expect(underTest.nodeIdUp(1)).toEqual(3);
			});
			it('should return the id of the node above when it is to the left', function () {
				layout.nodes[3].x = 1000;
				expect(underTest.nodeIdUp(1)).toEqual(3);
			});
			it('should prioritise nodes in a 45/2 degree arc above the node', function () {
				layout.nodes[3].y = -10000;
				layout.nodes[4] = {
					id: 4,
					width: 30,
					height: 76,
					level: 2,
					x: -94,
					y: -138
				};
				layout.nodes[5] = {
					id: 5,
					width: 30,
					height: 76,
					level: 2,
					x: 139,
					y: -138
				};
				expect(underTest.nodeIdUp(1)).toEqual(3);
			});
			it('should prioritise nodes within the cone by proximity', function () {
				layout.nodes[3].y = -10000;
				layout.nodes[4] = {
					id: 4,
					width: 30,
					height: 95,
					level: 2,
					x: -93,
					y: -138
				};
				expect(underTest.nodeIdUp(1)).toEqual(4);
			});
			it('should give weighting to nodes that are nearest vertically in a 3:1 ratio', function () {
				layout.nodes[4] = {
					id: 4,
					width: 10,
					height: 10,
					level: 2,
					x: -14,
					y: -12
				};
				layout.nodes[5] = {
					id: 5,
					width: 10,
					height: 10,
					level: 2,
					x: -12,
					y: -14
				};
				expect(underTest.nodeIdUp(1)).toEqual(5);
			});
			it('should return falsy when there are no nodes to the right', function () {
				expect(underTest.nodeIdUp(3)).toBeFalsy();
			});
			it('should return falsy when there is no layout set', function () {
				underTest.setLayout();
				expect(underTest.nodeIdUp(1)).toBeFalsy();
			});
			it('should exclude nodes that have a right edge to the right of the reference nodes center', function () {
				layout.nodes[2].y = -10000;
				layout.nodes[4] = {
					id: 4,
					width: 30,
					height: 100,
					level: 2,
					x: -15,
					y: -100
				};
				expect(underTest.nodeIdUp(1)).toEqual(3);
			});
		});
		describe('nodeIdDown', function () {
			it('should return the id of the node to the right', function () {
				expect(underTest.nodeIdDown(1)).toEqual(2);
			});
			it('should return the id of the node to the right when it is above', function () {
				layout.nodes[2].x = -200;
				expect(underTest.nodeIdDown(1)).toEqual(2);
			});
			it('should return the id of the node to the right when it is Down', function () {
				layout.nodes[2].x = 200;
				expect(underTest.nodeIdDown(1)).toEqual(2);
			});
			it('should prioritise nodes in a 45/2 degree arc to the right of the node', function () {
				layout.nodes[2].y = 10000;
				layout.nodes[4] = {
					id: 4,
					width: 30,
					height: 76,
					level: 2,
					x: -94,
					y: 62
				};
				layout.nodes[5] = {
					id: 5,
					height: 76,
					width: 30,
					level: 2,
					x: 139,
					y: 62
				};
				expect(underTest.nodeIdDown(1)).toEqual(2);
			});
			it('should prioritise nodes within the cone by proximity', function () {
				layout.nodes[2].y = 10000;
				layout.nodes[4] = {
					id: 4,
					width: 30,
					height: 95,
					level: 2,
					x: -93,
					y: 62
				};
				expect(underTest.nodeIdDown(1)).toEqual(4);
			});
			it('should give weighting to nodes that are nearest vertically in a 3:1 ratio', function () {
				layout.nodes[4] = {
					id: 4,
					width: 10,
					height: 10,
					level: 2,
					x: -18,
					y: 14
				};
				layout.nodes[5] = {
					id: 5,
					width: 10,
					height: 10,
					level: 2,
					x: -14,
					y: 18
				};
				expect(underTest.nodeIdDown(1)).toEqual(5);
			});
			it('should return falsy when there are no nodes to the right', function () {
				expect(underTest.nodeIdDown(2)).toBeFalsy();
			});
			it('should return falsy when there is no layout set', function () {
				underTest.setLayout();
				expect(underTest.nodeIdDown(1)).toBeFalsy();
			});
			it('should exclude nodes that have a right edge to the right of the reference nodes center', function () {
				layout.nodes[2].y = 10000;
				layout.nodes[4] = {
					id: 4,
					width: 30,
					height: 100,
					level: 2,
					x: -15,
					y: 0
				};
				expect(underTest.nodeIdDown(1)).toEqual(2);
			});
		});
	});
	describe('horizontal relationships', function () {
		beforeEach(function () {
			layout = {
				nodes: {
					1: {
						id: 1,
						width: 84,
						height: 30,
						level: 1,
						x: -42,
						y: -15
					},
					2: {
						id: 2,
						width: 49,
						height: 40,
						level: 2,
						x: 62,
						y: -20
					},
					3: {
						id: 3,
						width: 76,
						height: 30,
						level: 2,
						x: -138,
						y: -15
					}
				}
			};
			underTest.setLayout(layout);
		});
		describe('nodeIdRight', function () {
			it('should return the id of the node to the right', function () {
				expect(underTest.nodeIdRight(1)).toEqual(2);
			});
			it('should return the id of the node to the right when it is above', function () {
				layout.nodes[2].y = -200;
				expect(underTest.nodeIdRight(1)).toEqual(2);
			});
			it('should return the id of the node to the right when it is below', function () {
				layout.nodes[2].y = 200;
				expect(underTest.nodeIdRight(1)).toEqual(2);
			});
			it('should prioritise nodes in a 45/2 degree arc to the right of the node', function () {
				layout.nodes[2].x = 10000;
				layout.nodes[4] = {
					id: 4,
					width: 76,
					height: 30,
					level: 2,
					x: 62,
					y: -94
				};
				layout.nodes[5] = {
					id: 5,
					width: 76,
					height: 30,
					level: 2,
					x: 62,
					y: 139
				};
				expect(underTest.nodeIdRight(1)).toEqual(2);
			});
			it('should prioritise nodes within the cone by proximity', function () {
				layout.nodes[2].x = 10000;
				layout.nodes[4] = {
					id: 4,
					width: 95,
					height: 30,
					level: 2,
					x: 62,
					y: -93
				};
				expect(underTest.nodeIdRight(1)).toEqual(4);
			});
			it('should give weighting to nodes that are nearest vertically in a 3:1 ratio', function () {
				layout.nodes[4] = {
					id: 4,
					width: 10,
					height: 10,
					level: 2,
					x: 14,
					y: -18
				};
				layout.nodes[5] = {
					id: 5,
					width: 10,
					height: 10,
					level: 2,
					x: 18,
					y: -14
				};
				expect(underTest.nodeIdRight(1)).toEqual(5);
			});
			it('should return falsy when there are no nodes to the right', function () {
				expect(underTest.nodeIdRight(2)).toBeFalsy();
			});
			it('should return falsy when there is no layout set', function () {
				underTest.setLayout();
				expect(underTest.nodeIdRight(1)).toBeFalsy();
			});
			it('should exclude nodes that have a right edge to the right of the reference nodes center', function () {
				layout.nodes[2].x = 10000;
				layout.nodes[4] = {
					id: 4,
					width: 100,
					height: 30,
					level: 2,
					x: 0,
					y: -15
				};
				expect(underTest.nodeIdRight(1)).toEqual(2);
			});
		});
		describe('nodeIdLeft', function () {
			it('should return the id of the node to the left', function () {
				expect(underTest.nodeIdLeft(1)).toEqual(3);
			});
			it('should return the id of the node to the left when it is above', function () {
				layout.nodes[3].y = -200;
				expect(underTest.nodeIdLeft(1)).toEqual(3);
			});
			it('should return the id of the node to the left when it is below', function () {
				layout.nodes[3].y = 200;
				expect(underTest.nodeIdLeft(1)).toEqual(3);
			});
			it('should prioritise nodes in a 45/2 degree arc to the left of the node', function () {
				layout.nodes[3].x = -10000;
				layout.nodes[4] = {
					id: 4,
					width: 76,
					height: 30,
					level: 2,
					x: -138,
					y: -94
				};
				layout.nodes[5] = {
					id: 5,
					width: 76,
					height: 30,
					level: 2,
					x: -138,
					y: 139
				};
				expect(underTest.nodeIdLeft(1)).toEqual(3);
			});
			it('should prioritise nodes within the cone by proximity', function () {
				layout.nodes[3].x = -10000;
				layout.nodes[4] = {
					id: 4,
					width: 95,
					height: 30,
					level: 2,
					x: -138,
					y: -93
				};
				expect(underTest.nodeIdLeft(1)).toEqual(4);
			});
			it('should give weighting to nodes that are nearest vertically in a 3:1 ratio', function () {
				layout.nodes[4] = {
					id: 4,
					width: 10,
					height: 10,
					level: 2,
					x: -14,
					y: -18
				};
				layout.nodes[5] = {
					id: 5,
					width: 10,
					height: 10,
					level: 2,
					x: -18,
					y: -14
				};
				expect(underTest.nodeIdLeft(1)).toEqual(5);
			});
			it('should return falsy when there are no nodes to the left', function () {
				expect(underTest.nodeIdLeft(3)).toBeFalsy();
			});
			it('should return falsy when there is no layout set', function () {
				underTest.setLayout();
				expect(underTest.nodeIdLeft(1)).toBeFalsy();
			});
			it('should exclude nodes that have a right edge to the right of the reference nodes center', function () {
				layout.nodes[3].x = -10000;
				layout.nodes[4] = {
					id: 4,
					width: 100,
					height: 30,
					level: 2,
					x: -100,
					y: -15
				};
				expect(underTest.nodeIdLeft(1)).toEqual(3);
			});
		});
	});
	describe('layoutBounds', function () {
		beforeEach(function () {
			layout = {
				'nodes': {
					'1': {
						'id': 1,
						'width': 272,
						'height': 308,
						'x': -136,
						'y': -154,
						'title': '1',
						'level': 1,
						'attr': {'style': {'background': '#FF0000'}}
					},
					'4': {
						'id': 4,
						'width': 23,
						'height': 34,
						'x': 156,
						'y': -71,
						'title': '4',
						'level': 2
					},
					'7': {
						'id': 7,
						'width': 66,
						'height': 34,
						'x': 199,
						'y': -71,
						'title': '7'
					},
					'9': {
						'id': 9,
						'width': 30,
						'height': 34,
						'x': 285,
						'y': -125,
						'title': '9'
					}
				},
				'connectors': {
					'12': {
						'from': 1,
						'to': 4
					},
					'15': {
						'from': 1,
						'to': 7
					},
					'34': {
						'from': 7,
						'to': 9
					}
				},
				'links': {
					'4_7': {
						'ideaIdFrom': 4,
						'ideaIdTo': 7,
						'attr': {
							'style': {
								'color': '#FF0000'
							}
						}
					}
				}
			};

		});
		it('calculates max and min coordinates for nodes in the layout', function () {
			underTest.setLayout(layout);
			expect(underTest.layoutBounds()).toEqual({minX: -136, minY: -154, maxX: 285 + 30, maxY: 308 - 154, width: 285 + 30 + 136, height: 308});
		});
		it('returns falsy if there are no nodes', function () {
			underTest.setLayout({});
			expect(underTest.layoutBounds()).toBeFalsy();
		});
	});
	describe('clipRectTransform', function () {
		beforeEach(function () {
			layout = {
				'nodes': {
					'1': {
						'id': 1,
						'width': 272,
						'height': 308,
						'x': -136,
						'y': -154,
						'title': '1',
						'level': 1,
						'attr': {'style': {'background': '#FF0000'}}
					},
					'4': {
						'id': 4,
						'width': 23,
						'height': 34,
						'x': 156,
						'y': -71,
						'title': '4',
						'level': 2
					},
					'7': {
						'id': 7,
						'width': 66,
						'height': 34,
						'x': 199,
						'y': -71,
						'title': '7'
					},
					'9': {
						'id': 9,
						'width': 30,
						'height': 34,
						'x': 285,
						'y': -125,
						'title': '9'
					}
				},
				'connectors': {
					'12': {
						'from': 1,
						'to': 4
					},
					'15': {
						'from': 1,
						'to': 7
					},
					'34': {
						'from': 7,
						'to': 9
					}
				},
				'links': {
					'4_7': {
						'ideaIdFrom': 4,
						'ideaIdTo': 7,
						'attr': {
							'style': {
								'color': '#FF0000'
							}
						}
					}
				}
			};
		});
		it('calculates the transform for nodes in the layout when clipRect not passed', function () {
			underTest.setLayout(layout);
			expect(underTest.clipRectTransform(1)).toEqual({x: 136, y: 154, width: 285 + 30 + 136, height: 308, scale: 1});
		});
		it('applies scale to width/height but not x and y if set', function () {
			underTest.setLayout(layout);
			expect(underTest.clipRectTransform(1, {scale: 2})).toEqual({x: 136, y: 154, width: 2 * (285 + 30 + 136), height: 2 * 308, scale: 2});
		});
		it('applies padding if set', function () {
			underTest.setLayout(layout);
			expect(underTest.clipRectTransform(1, {padding: 5})).toEqual({x: 141, y: 159, width: 285 + 30 + 136 + 10, height: 318, scale: 1});
		});
		it('divides padding with scale if both set, to use it in scaled coordinates', function () {
			underTest.setLayout(layout);
			expect(underTest.clipRectTransform(1, {padding: 10, scale: 2})).toEqual({x: 141, y: 159, width: 2 * (285 + 30 + 136) + 20, height: 2 * 308 + 20, scale: 2});
		});
		it('calculates the transform for nodes in the layout when clipRect is passed', function () {
			underTest.setLayout(layout);
			expect(underTest.clipRectTransform(1, {clipRect: {
				width: 50,
				height: 50
			}})).toEqual({x: 25, y: 25, width: 50, height: 50, scale: 1});
		});
		it('calculates the transform for nodes in the layout when scaled clipRect is passed', function () {
			underTest.setLayout(layout);
			expect(underTest.clipRectTransform(1, {
				clipRect: {
					width: 50,
					height: 50
				},
				scale: 0.7
			})).toEqual({x: 25, y: 25, width: 50, height: 50, scale: 0.7});
		});
		describe('page scaling', function () { // map is 451 x 308, minx = -136, miny = -154
			it('fits the map into a square page without padding', function () {
				underTest.setLayout(layout);
				expect(underTest.clipRectTransform(1, {
					page: {
						width: 200,
						height: 200
					}
				})).toEqual({
					scale: 0.4434589800443459, // 200 / 451
					height: 200,
					width: 200,
					x: 136, // fit to x
					y: 225 //  100 / (200 / 451) - 308 / 2 + 154
				});
			});
			it('fits the map into a square page with padding', function () {
				underTest.setLayout(layout);
				expect(underTest.clipRectTransform(1, {
					page: {
						width: 220,
						height: 220
					},
					padding: 10
				})).toEqual({
					scale: 0.4434589800443459, // 200 / 451
					height: 220,
					width: 220,
					x: 158, // round (136 + 10 / 0.4434589800443459)
					y: 248 // round (225 + 10 / 0.4434589800443459)
				});
			});
			it('expands the map into a portrait page', function () {
				underTest.setLayout(layout);
				expect(underTest.clipRectTransform(1, {
					page: {
						width: 902,
						height: 1000
					}
				})).toEqual({
					scale: 2,
					height: 1000,
					width: 902,
					x: 136, // fit to x
					y: (500 - 308) / 2 + 154
				});
			});
			it('expands the map into a landscape page', function () {
				underTest.setLayout(layout);
				expect(underTest.clipRectTransform(1, {
					page: {
						width: 1000,
						height: 616
					}
				})).toEqual({
					scale: 2,
					height: 616,
					width: 1000,
					x: (500 - 452) / 2 + 136,
					y: 154 // fit to y
				});
			});
		});
	});
});
