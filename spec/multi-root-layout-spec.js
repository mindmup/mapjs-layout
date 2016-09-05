/*global describe, beforeEach, it, require, expect*/
var MultiRootLayout = require('../src/multi-root-layout');

describe('MultiRootLayout', function () {
	'use strict';
	var underTest,
		rootLayouts,
		defaultRootMargin;
	beforeEach(function () {
		underTest = new MultiRootLayout();
		rootLayouts = {
			first: {
				1: {x: -50, y: -10, height: 20, width: 100}
			},
			second: {
				2: {x: -50, y: -10, height: 20, width: 100}
			}

		};
		defaultRootMargin = 20;
	});
	it('should throw and exception if no margin supplied', function () {
		underTest.appendRootNodeLayout(rootLayouts.first);
		expect(function () {
			underTest.getCombinedLayout();
		}).toThrow();
	});
	it('should return a single root layout unchanged', function () {
		underTest.appendRootNodeLayout(rootLayouts.first, 1);
		expect(underTest.getCombinedLayout(defaultRootMargin)).toEqual(rootLayouts.first);
	});
	it('should reposition when to single root nodes are appended', function () {
		underTest.appendRootNodeLayout(rootLayouts.first, 1);
		underTest.appendRootNodeLayout(rootLayouts.second, 2);
		expect(underTest.getCombinedLayout(defaultRootMargin)).toEqual({
			1: {x: -110, y: -10, height: 20, width: 100, rootId: 1},
			2: {x: 10, y: -10, height: 20, width: 100, rootId: 2}
		});
	});
});