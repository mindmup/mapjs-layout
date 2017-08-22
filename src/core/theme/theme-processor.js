/*global module, require*/
const _ = require('underscore'),
	colorParser = require('./color-parser');
module.exports = function ThemeProcessor() {
	'use strict';
	const self = this,
		addPx = function (val) {
			return val + 'px';
		},
		cssProp = {
			cornerRadius: 'border-radius',
			'text.color': 'color',
			'text.margin': 'padding',
			background: 'background-color',
			backgroundColor: 'background-color',
			border: 'border',
			shadow: 'box-shadow',
			'text.font': 'font',
			'text.alignment': 'text-align'
		},
		fontWeightParser = function (fontObj) {
			const weightMap = {
				'light': '200',
				'semi-bold': '600'
			};
			if (!fontObj || !fontObj.weight) {
				return 'bold';
			}
			return weightMap[fontObj.weight] || fontObj.weight;
		},
		fontSizeParser = function (fontObj) {
			const fontSize = (fontObj && fontObj.size) || 12,
				lineSpacing = (fontObj && fontObj.lineSpacing) || 3;

			return fontSize + 'pt/' + (lineSpacing + fontSize) + 'pt';
		},
		parsers = {
			cornerRadius: addPx,
			'text.margin': addPx,
			background: colorParser,
			border: function (borderOb) {
				if (!borderOb.line) {
					return '0';
				}
				return borderOb.line.width + 'px ' + (borderOb.line.style || 'solid') + ' '  + borderOb.line.color + ';margin:' + (-1 * borderOb.line.width) + 'px';
			},
			shadow: function (shadowArray) {
				const boxshadows = [];
				if (shadowArray.length === 1 && shadowArray[0].color === 'transparent') {
					return 'none';
				}
				shadowArray.forEach(function (shadow) {
					boxshadows.push(shadow.offset.width + 'px ' + shadow.offset.height + 'px ' + shadow.radius + 'px ' + colorParser(shadow));
				});
				return boxshadows.join(',');
			},
			'text.font': function (fontObj) {
				return 'normal normal ' + fontWeightParser(fontObj) + ' ' +  fontSizeParser(fontObj) + ' NotoSans, "Helvetica Neue", Roboto, Helvetica, Arial, sans-serif';
			}
		},
		processNodeStyles = function (nodeStyleArray) {
			let parser, cssVal;
			const result = [],
				pushProperties = function (styleObject, keyPrefix) {
					_.each(styleObject, function (val, propKey) {
						const key = (keyPrefix || '') + propKey;
						if (cssProp[key]) {
							parser = parsers[key] || _.identity;
							cssVal = parser(val);
							if (cssVal) {
								result.push(cssProp[key]);
								result.push(':');
								result.push(cssVal);
								result.push(';');
							}
						} else if (_.isObject(val)) {
							pushProperties(val, key + '.');
						}
					});
				},
				appendColorVariants = function (styleSelector, nodeStyle) {
					if (!nodeStyle.text) {
						return;
					}
					if (nodeStyle.text.color) {
						result.push(styleSelector);
						result.push('.mapjs-node-light{color:');
						result.push(nodeStyle.text.color);
						result.push(';}');
					}
					if (nodeStyle.text.lightColor) {
						result.push(styleSelector);
						result.push('.mapjs-node-dark{color:');
						result.push(nodeStyle.text.lightColor);
						result.push(';}');
					}
					if (nodeStyle.text.darkColor) {
						result.push(styleSelector);
						result.push('.mapjs-node-white{color:');
						result.push(nodeStyle.text.darkColor);
						result.push(';}');
					}

				},
				appendDecorationStyles = function (styleSelector, nodeStyle) {
					const style = nodeStyle.decorations,
						margin = nodeStyle.text && nodeStyle.text.margin || 0;
					if (!style) {
						return;
					}
					result.push(styleSelector);
					result.push(' .mapjs-decorations{position:absolute;');
					if (style.edge === 'top' || style.edge === 'bottom') {
						if (style.position === 'end') {
							result.push('right:0;');
						} else if (style.position === 'start') {
							result.push('left:0;');
						} else {
							result.push('left:0;width:100%;text-align:center;');
						}
						result.push(style.edge);
						result.push(':-');
						result.push (style.overlap ? Math.round(style.height / 2) + margin : style.height);
						result.push('px;');
					} else if (style.edge === 'left' || style.edge === 'right') {
						result.push(style.edge === 'left' ?  'right' : 'left');
						result.push(':100%;');
						if (style.position === 'end') {
							result.push('bottom:0;');
						} else if (style.position === 'start') {
							result.push('top:0;');
						} else {
							result.push('top:calc(50% - ');
							result.push(Math.round(style.height / 2));
							result.push('px);');
						}
					}
					result.push('}');
				};
			nodeStyleArray.forEach(function (nodeStyle) {
				let styleSelector = '.mapjs-node';
				if (nodeStyle.name !== 'default') {
					styleSelector = styleSelector + '.' + nodeStyle.name.replace(/\s/g, '_');
				}
				result.push(styleSelector);
				result.push('{');
				pushProperties(nodeStyle);
				result.push('}');

				appendColorVariants(styleSelector, nodeStyle);
				appendDecorationStyles(styleSelector, nodeStyle);
			});
			return result.join('');
		};
	self.process = function (theme) {
		let nodeStyles = '';
		if (theme.node) {
			nodeStyles = processNodeStyles(theme.node);
		}
		return {
			css: nodeStyles
		};
	};
	self.cssFont = parsers['text.font'];
};
