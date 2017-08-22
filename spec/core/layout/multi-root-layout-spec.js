/*global describe, beforeEach, it, require, expect*/
const MultiRootLayout = require('../../../src/core/layout/multi-root-layout');

describe('MultiRootLayout', function () {
	'use strict';
	let underTest,
		rootLayouts,
		defaultRootMargin;
	beforeEach(function () {
		underTest = new MultiRootLayout();
		rootLayouts = {
			first: {
				1: {level: 1, x: -50, y: -10, height: 20, width: 100}
			},
			second: {
				2: {level: 1, x: -50, y: -10, height: 20, width: 100}
			}

		};
		defaultRootMargin = 20;
	});
	it('should throw an exception if no margin supplied', function () {
		underTest.appendRootNodeLayout(rootLayouts.first, {id: 1});
		expect(function () {
			underTest.getCombinedLayout();
		}).toThrow();
	});
	it('should return a single root layout unchanged', function () {
		underTest.appendRootNodeLayout(rootLayouts.first, {id: 1});
		expect(underTest.getCombinedLayout(defaultRootMargin)).toEqual(rootLayouts.first);
	});
	it('should reposition when to single root nodes are appended', function () {
		underTest.appendRootNodeLayout(rootLayouts.first, {id: 1});
		underTest.appendRootNodeLayout(rootLayouts.second, {id: 2});
		expect(underTest.getCombinedLayout(defaultRootMargin)).toEqual({
			1: { level: 1, x: -50, y: -10, height: 20, width: 100, rootId: 1},
			2: { level: 1, x: 90, y: -10, height: 20, width: 100, rootId: 2}
		});
	});
});
