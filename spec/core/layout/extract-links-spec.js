/*global describe, expect, it, beforeEach, require*/
const extractLinks = require('../../../src/core/layout/extract-links');

describe('extractLinks', function () {
	'use strict';
	let contentAggregate, visibleNodes;
	beforeEach(function () {
		contentAggregate = {
			links: [
				{ideaIdFrom: 2, ideaIdTo: 3},
				{ideaIdFrom: 2, ideaIdTo: 4, attr: {color: 'blue'}}
			]
		};
		visibleNodes = {
			2: true,
			3: true,
			4: true
		};
	});
	it('should not include links when node from is not visible', function () {
		delete visibleNodes[3];
		delete visibleNodes[4];
		expect(extractLinks(contentAggregate, visibleNodes)).toEqual({});
	});
	it('should not include links when node to is not visible', function () {
		delete visibleNodes[2];
		expect(extractLinks(contentAggregate, visibleNodes)).toEqual({});
	});
	it('should not include links when from and to nodes are visible', function () {
		expect(extractLinks(contentAggregate, visibleNodes)).toEqual({
			'2_3': {
				type: 'link',
				ideaIdFrom: 2,
				ideaIdTo: 3,
				attr: undefined
			},
			'2_4': {
				type: 'link',
				ideaIdFrom: 2,
				ideaIdTo: 4,
				attr: {color: 'blue'}
			}
		});
	});
	it('should clone the attribute', function () {
		const result = extractLinks(contentAggregate, visibleNodes);
		result['2_4'].attr.color = 'red';
		expect(contentAggregate.links[1].attr.color).toEqual('blue');
	});
});
