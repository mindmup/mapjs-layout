/*global describe, MAPJS, beforeEach, it, expect*/
describe('MAPJS.LayoutModel', function () {
	'use strict';
	var underTest, layout;
	beforeEach(function () {
		underTest = new MAPJS.LayoutModel({bar: 'foo'});
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
			underTest = new MAPJS.LayoutModel();
			expect(underTest.getNode(4)).toBeFalsy();
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
});
