/*global MAPJS, describe, beforeEach, it, expect*/

describe('Theme', function () {
	'use strict';
	var underTest;
	beforeEach(function () {
		var theme = {
			name: 'Mike',
			'node': [
				{
					'name': 'default',
					'cornerRadius': 10.0,
					'backgroundColor': 'transparent'
				},
				{
					'name': 'special',
					'cornerRadius': 1.0
				},
				{
					'name': 'sharp',
					'cornerRadius': 0.0
				}
			],
			layout: {
				spacing: 30
			}
		};
		underTest = new MAPJS.Theme(theme);
	});
	it('should set the theme name', function () {
		expect(underTest.name).toEqual('Mike');
	});
	describe('attributeValue', function () {
		it('should return default value for empty theme', function () {
			underTest = new MAPJS.Theme({});
			expect(underTest.attributeValue(['node'], ['special', 'default'], ['cornerRadius'], 100)).toEqual(100);
		});
		it('should return first value found', function () {
			expect(underTest.attributeValue(['node'], ['special', 'default'], ['cornerRadius'], 100)).toEqual(1.0);
		});
		it('should return a secondary style value if primary not configured', function () {
			expect(underTest.attributeValue(['node'], ['special', 'default'], ['backgroundColor'], '#FFFFFF')).toEqual('transparent');
		});
		it('should return falsy values', function () {
			expect(underTest.attributeValue(['node'], ['sharp', 'special', 'default'], ['cornerRadius'], 100)).toEqual(0.0);
		});
		it('should return the fallback value if nothing configured', function () {
			expect(underTest.attributeValue(['node'], ['special', 'default'], ['foregroundColor'], '#FFFFFF')).toEqual('#FFFFFF');
		});
		it('should return the fallback value if no styles supplied', function () {
			expect(underTest.attributeValue(['node'], [], ['backgroundColor'], '#FFFFFF')).toEqual('#FFFFFF');
		});
		it('should return the value from a non-array structure', function () {
			expect(underTest.attributeValue(['layout'], [], ['spacing'])).toEqual(30);
		});
	});
	describe('nodeStyles', function () {
		it('attaches level only if attributes not provided', function () {
			expect(underTest.nodeStyles(3)).toEqual(['level_3', 'default']);
			expect(underTest.nodeStyles(3, {})).toEqual(['level_3', 'default']);
			expect(underTest.nodeStyles(3, {nongroup: 'x'})).toEqual(['level_3', 'default']);
		});
		it('attaches group attr if it is provided', function () {
			expect(underTest.nodeStyles(3, {group: 'blue'})).toEqual(['attr_group_blue', 'attr_group', 'level_3', 'default']);
			expect(underTest.nodeStyles(3, {group: 1})).toEqual(['attr_group_1', 'attr_group', 'level_3', 'default']);
			expect(underTest.nodeStyles(3, {group: true})).toEqual(['attr_group', 'level_3', 'default']);

		});
		it('does not explode when the group value is not a string', function () {
			expect(underTest.nodeStyles(3, {group: undefined})).toEqual(['level_3', 'default']);
			expect(underTest.nodeStyles(3, {group: false})).toEqual(['level_3', 'default']);
			expect(underTest.nodeStyles(3, {group: {'a': 'b'}})).toEqual(['attr_group', 'level_3', 'default']);
			expect(underTest.nodeStyles(3, {group: ['a', 'b']})).toEqual(['attr_group', 'level_3', 'default']);
		});
	});
	describe('nodeTheme', function () {
		it('should return default values for empty theme', function () {
			underTest = new MAPJS.Theme({});
			expect(underTest.nodeTheme([])).toEqual({
				margin: 5,
				font: {
					size: 12,
					weight: 'semibold',
					linespacing: 3.5
				},
				maxWidth: 146,
				backgroundColor: '#E0E0E0',
				borderType: 'surround',
				cornerRadius: 5,
				lineColor: '#707070',
				text: {
					color: '#4F4F4F',
					lightColor: '#EEEEEE',
					darkColor: '#000000'
				}
			});
		});
		it('should return the overridden values in the theme', function () {
			expect(underTest.nodeTheme(['default'])).toEqual({
				margin: 5,
				font: {
					size: 12,
					weight: 'semibold',
					linespacing: 3.5
				},
				maxWidth: 146,
				backgroundColor: 'transparent',
				borderType: 'surround',
				cornerRadius: 10,
				lineColor: '#707070',
				text: {
					color: '#4F4F4F',
					lightColor: '#EEEEEE',
					darkColor: '#000000'
				}
			});
		});
	});
});
