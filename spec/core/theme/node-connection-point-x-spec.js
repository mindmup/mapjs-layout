/*global describe, require, beforeEach, it, expect*/
const underTest = require('../../../src/core/theme/node-connection-point-x');

describe('nodeConnectionPointX', function () {
	'use strict';

	describe('center', function () {
		it('should return the horizontal center of the node', function () {
			expect(underTest.center({left: 10, width: 20})).toEqual(20);
		});
		it('should round the result', function () {
			expect(underTest.center({left: -10, width: 21})).toEqual(1);
		});
	});
	describe('center-separated', function () {
		let node, relatedNode, horizontalInset, verticalInsetRatio;
		beforeEach(function () {
			node = {left: 0, top: 10, height: 10, width: 100};
			relatedNode = {left: 0, top: 30, height: 10, width: 100};
			horizontalInset = 5;
			verticalInsetRatio = 0.3;
		});
		describe('when the related node horizontally overlaps the node', function () {
			it('should return the horizontal center of the node the the related node is directly beneath', function () {
				expect(underTest['center-separated'](node, relatedNode, horizontalInset, verticalInsetRatio)).toEqual(50);
			});
			it('should return the horizontal center of the node the the related node is directly above', function () {
				relatedNode.top = -30;
				expect(underTest['center-separated'](node, relatedNode, horizontalInset, verticalInsetRatio)).toEqual(50);
			});
			it('should triangluate offset from inset center of the node to the horizontal center of the related node if it is to the left of the node center', function () {
				relatedNode.left = -99;
				expect(underTest['center-separated'](node, relatedNode, horizontalInset, verticalInsetRatio)).toEqual(39);
			});
			it('should triangluate offset from inset center of the node to the horizontal center of the related node if it is to the right of the node center', function () {
				relatedNode.left = 99;
				expect(underTest['center-separated'](node, relatedNode, horizontalInset, verticalInsetRatio)).toEqual(61);
			});
		});
		describe('when the related node does not horizontally overlap the node', function () {
			it('should triangluate offset from inset center of the node to the nearest edge of the related node if it is to the left of the node center', function () {
				relatedNode.left = -129;
				expect(underTest['center-separated'](node, relatedNode, horizontalInset, verticalInsetRatio)).toEqual(41);
			});
			it('should not go beyond the inset left of the node', function () {
				relatedNode.left = -529;
				expect(underTest['center-separated'](node, relatedNode, horizontalInset, verticalInsetRatio)).toEqual(5);
				relatedNode.left = -1529;
				expect(underTest['center-separated'](node, relatedNode, horizontalInset, verticalInsetRatio)).toEqual(5);
			});

			it('should triangluate offset from inset center of the node to the nearest edge of the related node if it is to the right of the node center', function () {
				relatedNode.left = 129;
				expect(underTest['center-separated'](node, relatedNode, horizontalInset, verticalInsetRatio)).toEqual(59);
			});
			it('should not go beyond the inset right of the node', function () {
				relatedNode.left = 629;
				expect(underTest['center-separated'](node, relatedNode, horizontalInset, verticalInsetRatio)).toEqual(95);
				relatedNode.left = 1629;
				expect(underTest['center-separated'](node, relatedNode, horizontalInset, verticalInsetRatio)).toEqual(95);
			});
		});
	});
	describe('nearest', function () {
		it('should return the left of the node when the related node left is not to the right', function () {
			expect(underTest.nearest({left: 10, width: 20}, {left: 29})).toEqual(10);
		});
		it('should return the right of the node when the related node left is to the right', function () {
			expect(underTest.nearest({left: 10, width: 20}, {left: 31})).toEqual(30);
		});
		it('should return the left of the node when the related node left is level with the right', function () {
			expect(underTest.nearest({left: 10, width: 20}, {left: 30})).toEqual(10);
		});
	});
	describe('nearest-inset', function () {
		let inset;
		beforeEach(function () {
			inset = 3;
		});
		it('should return the inset left of the node when the related node left is not to the right', function () {
			expect(underTest['nearest-inset']({left: 10, width: 20}, {left: 29}, inset)).toEqual(13);
		});
		it('should return the inset right of the node when the related node left is to the right', function () {
			expect(underTest['nearest-inset']({left: 10, width: 20}, {left: 31}, inset)).toEqual(27);
		});
		it('should return the inset left of the node when the related node left is level with the right', function () {
			expect(underTest['nearest-inset']({left: 10, width: 20}, {left: 30}, inset)).toEqual(13);
		});

	});
});
