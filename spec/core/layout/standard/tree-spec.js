/*global describe, expect, it, require, jasmine*/
const treeUtils = require('../../../../src/core/layout/standard/tree');

describe('tree', function () {
	'use strict';
	let result;
	describe('Tree', function () {
		const dimensionProvider = function (content) {
			const parts = content.title.split('x');
			return {
				width: parseInt(parts[0], 10),
				height: parseInt(parts[1], 10)
			};
		};
		describe('Calculating Tree', function () {
			it('should convert a single root node into a tree', function () {
				const content = {
					id: 1,
					title: '100x200',
					attr: { name: 'value' }
				};

				result = treeUtils.calculateTree(content, dimensionProvider);

				expect(result).toEqual(jasmine.objectContaining({
					id: 1,
					title: '100x200',
					attr: { name: 'value' },
					width: 100,
					height: 200
				}));
			});
			it('should convert a root node with a single child into a tree', function () {
				const content = {
					id: 1,
					title: '200x100',
					ideas: {
						100: {
							id: 2,
							title: '300x80'
						}
					}
				};

				result = treeUtils.calculateTree(content, dimensionProvider, 10);

				expect(result).toEqual(jasmine.objectContaining({
					id: 1,
					title: '200x100',
					width: 200,
					height: 100
				}));
				expect(result.subtrees[0]).toEqual(jasmine.objectContaining({
					id: 2,
					title: '300x80',
					width: 300,
					height: 80,
					deltaX: 210,
					deltaY: 10
				}));
			});
			it('should disregard children of collapsed nodes', function () {
				const content = {
					id: 1,
					title: '200x100',
					attr: { collapsed: true},
					ideas: {
						100: {
							id: 2,
							title: '300x80'
						}
					}
				};

				result = treeUtils.calculateTree(content, dimensionProvider, 10);

				expect(result).toEqual(jasmine.objectContaining({
					id: 1,
					title: '200x100',
					attr: {collapsed: true},
					width: 200,
					height: 100
				}));
				expect(result.subtrees).toBeUndefined();
			});
			it('should convert a root node with a two children into a tree', function () {
				const content = {
					id: 1,
					title: '200x100',
					ideas: {
						100: {
							id: 2,
							title: '300x80'
						},
						200: {
							id: 3,
							title: '100x30'
						}
					}
				};

				result = treeUtils.calculateTree(content, dimensionProvider, 10);

				expect(result).toEqual(jasmine.objectContaining({
					id: 1,
					title: '200x100',
					width: 200,
					height: 100
				}));
				expect(result.subtrees[0]).toEqual(jasmine.objectContaining({
					id: 2,
					title: '300x80',
					width: 300,
					height: 80,
					deltaX: 210,
					deltaY: -10
				}));
				expect(result.subtrees[1]).toEqual(jasmine.objectContaining({
					id: 3,
					title: '100x30',
					width: 100,
					height: 30,
					deltaX: 210,
					deltaY: 80
				}));
			});
			it('should only include nodes where rank and parent predicate says so', function () {
				const content = {
					id: 11,
					title: '200x100',
					ideas: {
						100: {
							id: 2,
							title: '300x80'
						},
						200: {
							id: 3,
							title: '100x30'
						}
					}
				};

				result = treeUtils.calculateTree(content, dimensionProvider, 10, function (rank, parentId) {
					return parentId !== 11 || rank !== 200;
				});
				expect(result).toEqual(jasmine.objectContaining({
					id: 11,
					title: '200x100',
					width: 200,
					height: 100
				}));
				expect(result.subtrees[0]).toEqual(jasmine.objectContaining({
					id: 2,
					title: '300x80',
					width: 300,
					height: 80,
					deltaX: 210,
					deltaY: 10
				}));
				expect(result.subtrees[1]).toBeUndefined();
			});
			describe('manual positioning', function () {
				it('should use manual position on a single child if set as deltaX and deltaY', function () {
					const content = {
						id: 11,
						title: '200x100',
						ideas: {
							100: {
								id: 2,
								title: '300x80',
								attr: { position: [500, -800] }
							}
						}
					};

					result = treeUtils.calculateTree(content, dimensionProvider, 10);
					expect(result.subtrees[0]).toEqual(jasmine.objectContaining({
						title: '300x80',
						deltaX: 500,
						deltaY: -800
					}));
				});
				it('should leave second child where it belongs automatically if only first child has manual position', function () {
					const content = {
						id: 11,
						title: '200x100',
						ideas: {
							100: {
								id: 2,
								title: '300x80',
								attr: { position: [210, -800] }
							},
							200: {
								id: 3,
								title: '100x30'
							}
						}
					};

					result = treeUtils.calculateTree(content, dimensionProvider, 10);

					expect(result.subtrees[0]).toEqual(jasmine.objectContaining({
						id: 2,
						deltaX: 210,
						deltaY: -800
					}));
					expect(result.subtrees[1]).toEqual(jasmine.objectContaining({
						id: 3,
						deltaX: 210,
						deltaY: 80
					}));
				});
				it('should push second child down if first child has manual position and would overlap', function () {
					const content = {
						id: 11,
						title: '200x100',
						ideas: {
							100: {
								id: 2,
								title: '300x80',
								attr: { position: [210, 10] }
							},
							200: {
								id: 3,
								title: '100x30'
							}
						}
					};

					result = treeUtils.calculateTree(content, dimensionProvider, 10);
					expect(result.subtrees[0].deltaY).toBe(10);
					expect(result.subtrees[1].deltaY).toBe(100);
				});
				it('should push first child up if second child has manual position and would overlap', function () {
					const content = {
						id: 11,
						title: '200x100',
						ideas: {
							100: {
								id: 2,
								title: '300x80'
							},
							200: {
								id: 3,
								title: '100x30',
								attr: { position: [210, 10] }
							}
						}
					};
					result = treeUtils.calculateTree(content, dimensionProvider, 10);
					expect(result.subtrees[0].deltaY).toBe(-80);
					expect(result.subtrees[1].deltaY).toBe(10);
				});
				it('should use child with maximum priority (3rd element in position) to determine alignment if multiple nodes have manual position', function () {
					const content = {
						id: 11,
						title: '200x100',
						ideas: {
							100: {
								id: 2,
								title: '300x80',
								attr: { position: [210, 5, 2] }
							},
							200: {
								id: 3,
								title: '100x30',
								attr: { position: [210, 10, 0] }
							}
						}
					};
					result = treeUtils.calculateTree(content, dimensionProvider, 10);
					expect(result.subtrees[0].deltaY).toBe(5);
					expect(result.subtrees[1].deltaY).toBe(95);
				});
				it('should take X position into consideration when stacking subtrees', function () {
					const content = {
						id: 11,
						title: '10x10',
						ideas: {
							100: {
								id: 2,
								title: '50x10',
								attr: { position: [210, -10, 0] },
								ideas: {
									201: {
										id: 4,
										title: '10x100'
									}
								}
							},
							200: {
								id: 3,
								title: '200x10'
							}
						}
					};
					result = treeUtils.calculateTree(content, dimensionProvider, 10);
					expect(result.subtrees[0].deltaY).toBe(-10);
					expect(result.subtrees[1].deltaY).toBe(10);
				});
				it('should compress as much as possible by Y when stacking subtrees with manual positions', function () {
					const content = {
						id: 11,
						title: '10x10',
						ideas: {
							100: {
								id: 2,
								title: '50x10'
							},
							200: {
								id: 3,
								title: '10x100',
								attr: { position: [210, 10, 0] }
							},
							300: {
								id: 4,
								title: '80x10'
							}
						}
					};
					result = treeUtils.calculateTree(content, dimensionProvider, 10);
					expect(result.subtrees[0].deltaY).toBe(-20);
					expect(result.subtrees[1].deltaY).toBe(10);
					expect(result.subtrees[2].deltaY).toBe(75);
				});
				it('should ignore horisontal positions that would make it overlap with parent', function () {
					const content = {
						id: 11,
						title: '10x10',
						ideas: {
							100: {
								id: 2,
								title: '50x10',
								attr: { position: [-10, 0, 0] }
							},
							200: {
								id: 3,
								title: '200x10'
							}
						}
					};
					result = treeUtils.calculateTree(content, dimensionProvider, 10);
					expect(result.subtrees[0].deltaX).toBe(20);
				});
			});
		});

		describe('conversion to layout', function () {
			it('should calculate the layout for a single node', function () {
				const tree = new treeUtils.Tree({
					id: 1,
					title: 'Hello world',
					attr: { name: 'value' },
					width: 200,
					height: 100,
					level: 1
				});

				result = tree.toLayout();

				expect(result).toEqual({
					nodes: {
						'1': {
							id: 1,
							level: 1,
							title: 'Hello world',
							attr: { name: 'value' },
							x: -100,
							y: -50,
							width: 200,
							height: 100
						}
					},
					connectors: {}
				});
			});
			it('should calculate the layout for two nodes', function () {
				const tree = new treeUtils.Tree({
					id: 1,
					title: 'Hello world',
					attr: { name: 'value' },
					width: 200,
					height: 100,
					level: 1,
					subtrees: [
						new treeUtils.Tree({
							id: 2,
							level: 2,
							title: 'First child',
							attr: { name: 'value2' },
							width: 300,
							height: 80,
							deltaX: 210,
							deltaY: 10
						})
					]
				});

				result = tree.toLayout();

				expect(result).toEqual({
					nodes: {
						'1': {
							id: 1,
							level: 1,
							title: 'Hello world',
							attr: { name: 'value' },
							x: -100,
							y: -50,
							width: 200,
							height: 100
						},
						'2': {
							id: 2,
							level: 2,
							title: 'First child',
							attr: { name: 'value2' },
							x: 110,
							y: -40,
							width: 300,
							height: 80
						}
					},
					connectors: {
						'2': {
							from: 1,
							to: 2
						}
					}
				});
			});
			it('should calculate the layout for two left-aligned sub child nodes', function () {
				const tree = new treeUtils.Tree({
					id: 1,
					title: 'Hello world',
					attr: { name: 'value' },
					width: 200,
					height: 100,
					level: 1,
					subtrees: [
						new treeUtils.Tree({
							id: 2,
							title: 'First child',
							attr: { name: 'value2' },
							width: 300,
							height: 80,
							deltaX: 210,
							deltaY: -10,
							level: 2
						}),
						new treeUtils.Tree({
							id: 3,
							title: 'Second child',
							attr: { name: 'value3' },
							width: 100,
							height: 30,
							deltaX: 210,
							deltaY: 80,
							level: 2
						})
					]
				});

				result = tree.toLayout();

				expect(result).toEqual({
					nodes: {
						'1': {
							id: 1,
							level: 1,
							title: 'Hello world',
							attr: { name: 'value' },
							x: -100,
							y: -50,
							width: 200,
							height: 100
						},
						'2': {
							id: 2,
							level: 2,
							title: 'First child',
							attr: { name: 'value2' },
							x: 110,
							y: -60,
							width: 300,
							height: 80
						},
						'3': {
							id: 3,
							level: 2,
							title: 'Second child',
							attr: { name: 'value3' },
							x: 110,
							y: 30,
							width: 100,
							height: 30
						}
					},
					connectors: {
						'2': {
							from: 1,
							to: 2
						},
						'3': {
							from: 1,
							to: 3
						}

					}
				});
			});
		});
	});
});
