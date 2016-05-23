/*global describe, it , expect, MAPJS*/
describe('nodeToBox', function () {
	'use strict';
	it('should convert node to a box', function () {
		expect(MAPJS.nodeToBox({x: 10, y: 20, width: 30, height: 40, level: 2})).toEqual({left: 10, top: 20, width: 30, height: 40, level: 2});
	});
});
