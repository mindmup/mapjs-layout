/*global describe, beforeEach, it, expect, spyOn, require*/
const defaultTheme = require('../../../src/core/theme/default-theme'),
	Theme = require('../../../src/core/theme/theme');


describe('Theme', function () {
	'use strict';
	let underTest, theme;
	beforeEach(function () {
		theme = {
			name: 'Mike',
			'node': [
				{
					'name': 'default',
					'cornerRadius': 10.0,
					'backgroundColor': 'transparent'

				},
				{
					'name': 'special',
					'cornerRadius': 1.0,
					'connections': {
						childstyle: 'no-connector',
						style: 'green'
					}
				},
				{
					'name': 'sharp',
					'cornerRadius': 0.0
				},
				{
					'name': 'no-line',
					'connections': {
						style: 'no-line-curve'
					}
				}
			],
			connector: {
				default: {
					type: 'top-down-s-curve',
					line: {
						color: '#070707',
						width: 2.0
					}
				},
				'no-connector': {
					type: 'no-connector',
					line: {
						color: '#707070',
						width: 0
					}
				},
				green: {
					type: 'green-curve',
					line: {
						color: '#00FF00',
						width: 3.0
					}
				},
				'no-connector.green': {
					type: 'no-connector-green',
					line: {
						color: '#FFFF00',
						width: 4.0
					}
				},
				'no-line-curve': {
					type: 'no-line-curve'
				},
				controlPointCurve: {
					type: 'control-curve',
					line: {
						color: '#00FF00',
						width: 3.0
					},
					controlPoint: {
						'above': {'width': 0.5, 'height': 2.75},
						'below': {'width': 0.75, 'height': 0.5},
						'horizontal': {'width': 2, 'height': 1}
					}
				}

			},
			layout: {
				spacing: 30
			}
		};
		underTest = new Theme(theme);
	});
	it('should set the theme name', function () {
		expect(underTest.name).toEqual('Mike');
	});
	describe('blockParentConnectorOverride', function () {
		it('should be falsy if blockParentConnectorOverride flag is ommitted', function () {
			expect(underTest.blockParentConnectorOverride).toBeFalsy();
		});
		it('should be truthy when blockParentConnectorOverride flag is set', function () {
			theme.blockParentConnectorOverride = true;
			underTest = new Theme(theme);
			expect(underTest.blockParentConnectorOverride).toBeTruthy();
		});

	});
	describe('attributeValue', function () {
		it('should return default value for empty theme', function () {
			underTest = new Theme({});
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
			underTest = new Theme({});
			expect(underTest.nodeTheme([])).toEqual({
				margin: 5,
				font: {
					size: 12,
					weight: 'semibold',
					lineSpacing: 3.5
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
					lineSpacing: 3.5
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
		it('should return background color for background theme object', function () {
			delete theme.node[0].backgroundColor;
			theme.node[0].background = {
				color: '#FFFFFF',
				opacity: 0.8
			};
			underTest = new Theme(theme);
			expect(underTest.nodeTheme(['default']).backgroundColor).toEqual('rgba(255,255,255,0.8)');
		});
	});
	describe('connectorControlPoint', function () {
		it('should return the default horizontal connector if no style provided', function () {
			expect(underTest.connectorControlPoint('horizontal')).toEqual({'width': 0, 'height': 1});
		});
		it('should return the default horizontal connector if no style provided', function () {
			expect(underTest.connectorControlPoint('above')).toEqual({'width': 0, 'height': 1.75});
		});

		it('should return the default horizontal connector if no control point is configured for the connector style', function () {
			expect(underTest.connectorControlPoint('horizontal', 'green')).toEqual({'width': 0, 'height': 1});
		});
		it('should return the default non-horizontal connector if no control point is configured for the connector style', function () {
			expect(underTest.connectorControlPoint('above', 'green')).toEqual({'width': 0, 'height': 1.75});
		});
		['above', 'below'].forEach(function (pos) {
			it('should return the default ' + pos + ' connector if no style provided', function () {
				expect(underTest.connectorControlPoint(pos)).toEqual({'width': 0, 'height': 1.75});
			});
		});
		it('should return the configured controlPoint', function () {
			expect(underTest.connectorControlPoint('horizontal', 'controlPointCurve')).toEqual({'width': 2, 'height': 1});
			expect(underTest.connectorControlPoint('above', 'controlPointCurve')).toEqual({'width': 0.5, 'height': 2.75});
			expect(underTest.connectorControlPoint('below', 'controlPointCurve')).toEqual({'width': 0.75, 'height': 0.5});
		});
		it('should return the default non-horizontal connector if unconfigured childPosition supplied', function () {
			expect(underTest.connectorControlPoint('outside', 'controlPointCurve')).toEqual({'width': 0, 'height': 1.75});
		});

	});
	describe('linkTheme', function () {

		it('returns the default link theme if no theme is provided', function () {
			expect(underTest.linkTheme()).toEqual(defaultTheme.link.default);
		});
		it('returns the link theme from the current theme object if it exists', function () {
			underTest = new Theme({
				link: {
					default: {
						line: 'lll',
						label: 'xxx'
					}
				}
			});
			expect(underTest.linkTheme()).toEqual({label: 'xxx', line: 'lll'});
		});
		it('returns a particular link style if required', function () {
			underTest = new Theme({
				link: {
					default: {
						line: 'lll',
						label: 'xxx'
					},
					hipster: {
						line: 'hipl',
						label: 'hipt'
					}
				}
			});
			expect(underTest.linkTheme('hipster')).toEqual({line: 'hipl', label: 'hipt'});

		});
		it('merges with the default theme if the provided theme is only partial', function () {
			underTest = new Theme({
				link: {
					default: {
						line: 'yyy'
					}
				}
			});
			expect(underTest.linkTheme()).toEqual({line: 'yyy', label: defaultTheme.link.default.label });
		});

	});
	describe('connectorTheme', function () {
		let childPosition, defaultLabel;
		beforeEach(function () {
			defaultLabel = {
				position: {
					ratio: 0.5
				},
				backgroundColor: 'transparent',
				borderColor: 'transparent',
				text: {
					color: '#4F4F4F',
					font: {
						size: 9,
						sizePx: 12,
						weight: 'normal'
					}
				}
			};

			spyOn(underTest, 'connectorControlPoint').and.returnValue('testControlPoint');
			childPosition = 'above';
		});
		it('should return default line if not configured', function () {
			expect(underTest.connectorTheme(childPosition, ['no-line'])).toEqual({
				type: 'no-line-curve',
				controlPoint: 'testControlPoint',
				label: defaultLabel,
				line: {
					color: '#707070',
					width: 1.0
				}
			});
		});
		it('should return configured label', function () {
			theme.connector['no-line-curve'].label = 'configuredLabelHere';
			expect(underTest.connectorTheme(childPosition, ['no-line'])).toEqual({
				type: 'no-line-curve',
				controlPoint: 'testControlPoint',
				label: 'configuredLabelHere',
				line: {
					color: '#707070',
					width: 1.0
				}
			});
		});
		describe('should return the default style', function () {
			it('should default to a horizontal child position and default style to calculate controlPoint', function () {
				underTest.connectorTheme();
				expect(underTest.connectorControlPoint).toHaveBeenCalledWith('horizontal', 'default');
			});
			it('when childStyles is undefined', function () {
				expect(underTest.connectorTheme()).toEqual({
					type: 'top-down-s-curve',
					controlPoint: 'testControlPoint',
					label: defaultLabel,
					line: {
						color: '#070707',
						width: 2.0
					}
				});

			});
			it('when childStyles is empty', function () {
				expect(underTest.connectorTheme(childPosition, [])).toEqual({
					type: 'top-down-s-curve',
					controlPoint: 'testControlPoint',
					label: defaultLabel,
					line: {
						color: '#070707',
						width: 2.0
					}
				});
			});
			it('when childStyles is undefined and there is no default style configured', function () {
				delete theme.connector.default;
				expect(underTest.connectorTheme()).toEqual({
					type: 'quadratic',
					controlPoint: 'testControlPoint',
					label: defaultLabel,
					line: {
						color: '#707070',
						width: 1.0
					}
				});

			});
		});
		[['no parent', undefined], ['a parent with no child style configured', ['sharp']]].forEach(function (args) {
			describe('when the node has ' + args[0], function () {
				it('should use the child connector style to calculate the control point', function () {
					underTest.connectorTheme(childPosition, ['special'], args[1]);
					expect(underTest.connectorControlPoint).toHaveBeenCalledWith('above', 'green');
				});
				it('should return the default connector style when no connector style configured', function () {
					expect(underTest.connectorTheme(childPosition, ['sharp'], args[1])).toEqual({
						type: 'top-down-s-curve',
						controlPoint: 'testControlPoint',
						label: defaultLabel,
						line: {
							color: '#070707',
							width: 2.0
						}
					});
				});
				it('should return the hard coded default connector style when the node has no connector style configured and there is no default style configured',  function () {
					delete theme.connector.default;

					expect(underTest.connectorTheme(childPosition, ['sharp'], args[1])).toEqual({
						type: 'quadratic',
						controlPoint: 'testControlPoint',
						label: defaultLabel,
						line: {
							color: '#707070',
							width: 1.0
						}
					});
				});
				it('should return the configured connector style when the node has a connector style configured', function () {
					expect(underTest.connectorTheme(childPosition, ['special'], args[1])).toEqual({
						type: 'green-curve',
						controlPoint: 'testControlPoint',
						label: defaultLabel,
						line: {
							color: '#00FF00',
							width: 3.0
						}
					});
				});
			});
		});
		describe('when the node has a parent with a child style configured', function () {
			it('should use the combined connector style to calculate the control point', function () {
				underTest.connectorTheme(childPosition, ['special'], ['special']);
				expect(underTest.connectorControlPoint).toHaveBeenCalledWith('above', 'no-connector.green');
			});
			it('should use the parent.childstyle connector style to calculate the control point', function () {
				underTest.connectorTheme(childPosition, ['sharp'], ['special']);
				expect(underTest.connectorControlPoint).toHaveBeenCalledWith('above', 'no-connector');
			});

			it('should return a connector style that matches parentchildstyle.childstyle if it exists', function () {
				expect(underTest.connectorTheme(childPosition, ['special'], ['special'])).toEqual({
					type: 'no-connector-green',
					controlPoint: 'testControlPoint',
					label: defaultLabel,
					line: {
						color: '#FFFF00',
						width: 4.0
					}
				});
			});

			it('should return a connector style that matches parentchildstyle if parentchildstyle.childstyle does not exist', function () {
				expect(underTest.connectorTheme(childPosition, ['sharp'], ['special'])).toEqual({
					type: 'no-connector',
					controlPoint: 'testControlPoint',
					label: defaultLabel,
					line: {
						color: '#707070',
						width: 0
					}
				});
			});
		});
	});
});
