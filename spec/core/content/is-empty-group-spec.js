/*global describe, it, expect, require*/
const isEmptyGroup = require('../../../src/core/content/is-empty-group');
describe('isEmptyGroup', function () {
	'use strict';
	it('returns true only if group attr present and no subideas', function () {
		expect(isEmptyGroup({})).toBeFalsy();
		expect(isEmptyGroup({ attr: {x: 1} })).toBeFalsy();
		expect(isEmptyGroup({ attr: {group: 'standard', x: 1} })).toBeTruthy();
		expect(isEmptyGroup({ attr: {group: 'standard'} })).toBeTruthy();
		expect(isEmptyGroup({ ideas: {}, attr: {group: 'standard'} })).toBeTruthy();
		expect(isEmptyGroup({ ideas: { 1: {} }, attr: {group: 'standard'} })).toBeFalsy();
		expect(isEmptyGroup({ ideas: { 1: {} }})).toBeFalsy();
		expect(isEmptyGroup({ ideas: {}})).toBeFalsy();
	});
});
