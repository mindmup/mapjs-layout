/*global describe, beforeEach, it, expect, require*/
const underTest = require('../../../src/core/theme/line-types');
describe('lineTypes', function () {
	'use strict';

	let calculatedConnector, position, parent, child;
	beforeEach(function () {
		calculatedConnector = {
			from: {
				x: 0,
				y: 20
			},
			to: {
				x: 100,
				y: 30
			},
			connectorTheme: {
				controlPoint: {
					height: 1.25
				}
			}
		};
		position = {
			top: 10,
			left: 10
		};
		parent = {
			height: 40
		};
		child = {
			height: 30
		};
	});
	describe('quadratic', function () {
		it('should return quadratic path', function () {
			expect(underTest.quadratic(calculatedConnector, position, parent, child)).toEqual({
				d: 'M-10,10Q-10,33 90,20',
				position: position
			});
		});
	});
	describe('vertical-quadratic-s-curve', function () {
		beforeEach(function () {
			calculatedConnector = {
				from: {
					x: 0,
					y: 20
				},
				to: {
					x: 30,
					y: 100
				}
			};
		});
		it('should return quadratic s curve path', function () {
			expect(underTest['vertical-quadratic-s-curve'](calculatedConnector, position, parent, child)).toEqual({
				d: 'M-10,10q0,20 15,40q15,20 15,40',
				initialRadius: 10,
				position: position
			});
		});
		describe('should return a straight line if connector to is below the connector from with tolerance', function () {
			it('to the left', function () {
				calculatedConnector.to.x = -19;
				expect(underTest['vertical-quadratic-s-curve'](calculatedConnector, position, parent, child)).toEqual({
					d: 'M-10,10l-19,80',
					initialRadius: 10,
					position: position
				});
			});
			it('to the right', function () {
				calculatedConnector.to.x = 19;
				expect(underTest['vertical-quadratic-s-curve'](calculatedConnector, position, parent, child)).toEqual({
					d: 'M-10,10l19,80',
					initialRadius: 10,
					position: position
				});
			});
		});
	});
});
