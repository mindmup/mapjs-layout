/*global describe, MAPJS, beforeEach, it, expect*/
describe('MAPJS.LayoutModel', function () {
	'use strict';
	var underTest, layout;
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
			underTest = new MAPJS.LayoutModel(layout);
		});
		describe('nodeIdAbove', function () {
			it('should return the id of the node above', function () {
				expect(underTest.nodeIdAbove(1)).toEqual(3);
			});
			it('should return the id of the node above when it is to the right', function () {
				layout.nodes[3].x = -1000;
				expect(underTest.nodeIdAbove(1)).toEqual(3);
			});
			it('should return the id of the node above when it is to the left', function () {
				layout.nodes[3].x = 1000;
				expect(underTest.nodeIdAbove(1)).toEqual(3);
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
				expect(underTest.nodeIdAbove(1)).toEqual(3);
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
				expect(underTest.nodeIdAbove(1)).toEqual(4);
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
				expect(underTest.nodeIdAbove(1)).toEqual(5);
			});
			it('should return falsy when there are no nodes to the right', function () {
				expect(underTest.nodeIdAbove(3)).toBeFalsy();
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
				expect(underTest.nodeIdAbove(1)).toEqual(3);
			});
		});
		describe('nodeIdBelow', function () {
			it('should return the id of the node to the right', function () {
				expect(underTest.nodeIdBelow(1)).toEqual(2);
			});
			it('should return the id of the node to the right when it is above', function () {
				layout.nodes[2].x = -200;
				expect(underTest.nodeIdBelow(1)).toEqual(2);
			});
			it('should return the id of the node to the right when it is below', function () {
				layout.nodes[2].x = 200;
				expect(underTest.nodeIdBelow(1)).toEqual(2);
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
				expect(underTest.nodeIdBelow(1)).toEqual(2);
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
				expect(underTest.nodeIdBelow(1)).toEqual(4);
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
				expect(underTest.nodeIdBelow(1)).toEqual(5);
			});
			it('should return falsy when there are no nodes to the right', function () {
				expect(underTest.nodeIdBelow(2)).toBeFalsy();
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
				expect(underTest.nodeIdBelow(1)).toEqual(2);
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
			underTest = new MAPJS.LayoutModel(layout);
		});
		describe('nodeIdToRightOf', function () {
			it('should return the id of the node to the right', function () {
				expect(underTest.nodeIdToRightOf(1)).toEqual(2);
			});
			it('should return the id of the node to the right when it is above', function () {
				layout.nodes[2].y = -200;
				expect(underTest.nodeIdToRightOf(1)).toEqual(2);
			});
			it('should return the id of the node to the right when it is below', function () {
				layout.nodes[2].y = 200;
				expect(underTest.nodeIdToRightOf(1)).toEqual(2);
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
				expect(underTest.nodeIdToRightOf(1)).toEqual(2);
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
				expect(underTest.nodeIdToRightOf(1)).toEqual(4);
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
				expect(underTest.nodeIdToRightOf(1)).toEqual(5);
			});
			it('should return falsy when there are no nodes to the right', function () {
				expect(underTest.nodeIdToRightOf(2)).toBeFalsy();
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
				expect(underTest.nodeIdToRightOf(1)).toEqual(2);
			});
		});
		describe('nodeIdToLeftOf', function () {
			it('should return the id of the node to the left', function () {
				expect(underTest.nodeIdToLeftOf(1)).toEqual(3);
			});
			it('should return the id of the node to the left when it is above', function () {
				layout.nodes[3].y = -200;
				expect(underTest.nodeIdToLeftOf(1)).toEqual(3);
			});
			it('should return the id of the node to the left when it is below', function () {
				layout.nodes[3].y = 200;
				expect(underTest.nodeIdToLeftOf(1)).toEqual(3);
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
				expect(underTest.nodeIdToLeftOf(1)).toEqual(3);
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
				expect(underTest.nodeIdToLeftOf(1)).toEqual(4);
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
				expect(underTest.nodeIdToLeftOf(1)).toEqual(5);
			});
			it('should return falsy when there are no nodes to the left', function () {
				expect(underTest.nodeIdToLeftOf(3)).toBeFalsy();
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
				expect(underTest.nodeIdToLeftOf(1)).toEqual(3);
			});
		});
	});
});
