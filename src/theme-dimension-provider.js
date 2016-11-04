/*global module, require */
var formattedNodeTitle = require('mindmup-mapjs-model').formattedNodeTitle,
	_ = require('underscore');
module.exports = function ThemeDimensionProvider(textSizer) {
	'use strict';
	var self = this,
		calcMaxWidth = function (attr, nodeTheme) {
			return (attr && attr.style && attr.style.width) || nodeTheme.maxWidth;
		};

	self.dimensionProviderForTheme = function (theme) {
		return function (idea, level) {
			var icon = idea.attr && idea.attr.icon,
				nodeTheme = theme.nodeTheme(theme.nodeStyles(level, idea.attr)),
				title = formattedNodeTitle(idea.title),
				maxWidth = calcMaxWidth(idea.attr, nodeTheme),
				textBox = _.extend({}, textSizer(title, maxWidth, nodeTheme.font));

			textBox.textSize = {width: textBox.width, height: textBox.height};

			if (icon) {
				if (icon.position === 'left' || icon.position === 'right') {
					if (textBox.width && icon.width && nodeTheme.margin) {
						textBox.width = textBox.width + nodeTheme.margin;
					}
					textBox.width = textBox.width + icon.width;
				}
				if (icon.position === 'top' || icon.position === 'bottom') {
					if (textBox.height && icon.height && nodeTheme.margin) {
						textBox.height = textBox.height + nodeTheme.margin;
					}
					textBox.height = textBox.height + icon.height;
				}
				textBox.height = Math.max(textBox.height, icon.height);
				textBox.width = Math.max(textBox.width, icon.width);

			}
			textBox.width = Math.max(textBox.width + 2 * nodeTheme.margin, nodeTheme.cornerRadius * 2);
			textBox.height = Math.max(textBox.height + 2 * nodeTheme.margin, nodeTheme.cornerRadius * 2);
			return textBox;
		};
	};
	self.nodeLayoutProviderForTheme = function (theme) {
		return function (node) {
			var image = node.attr && node.attr.icon,
				textLayout, imageLayout,
				offset,
				nodeTheme = theme.nodeTheme(theme.nodeStyles(node.level, node.attr)),
				title = formattedNodeTitle(node.title),
				maxWidth = calcMaxWidth(node.attr, nodeTheme),
				textBox = textSizer(title, maxWidth, nodeTheme.font),
				textWidth = Math.min(node.width - (2 * nodeTheme.margin), textBox.width);
			if (image) {
				imageLayout = {
					x: nodeTheme.margin,
					y: nodeTheme.margin,
					width: image.width,
					height: image.height
				};

				switch (image.position) {
					case 'top':
						imageLayout.x =  Math.round((node.width - image.width) / 2);
						textLayout = {
							x: Math.round((node.width - textWidth) / 2),
							y: imageLayout.y + imageLayout.height + nodeTheme.margin,
							width: textWidth,
							height: node.height - image.height - (3 * nodeTheme.margin)
						};
						break;
					case 'bottom':
						imageLayout.x = Math.round((node.width - image.width) / 2);
						imageLayout.y = node.height - image.height - nodeTheme.margin;
						textLayout = {
							x: Math.round((node.width - textWidth) / 2),
							y: nodeTheme.margin,
							width: textWidth,
							height: node.height - image.height - (3 * nodeTheme.margin)
						};

						break;
					case 'left':
						textWidth = Math.min(node.width - imageLayout.width - (3 * nodeTheme.margin), textBox.width);
						imageLayout.y = Math.round((node.height - image.height) / 2);
						offset = imageLayout.x + imageLayout.width;

						textLayout = {
							x: Math.round(offset + (node.width - offset - textWidth) / 2),
							y: nodeTheme.margin,
							width: textWidth,
							height: node.height - (2 * nodeTheme.margin)
						};
						break;
					case 'right':
						textWidth = Math.min(node.width - imageLayout.width - (3 * nodeTheme.margin), textBox.width);
						imageLayout.x = node.width - image.width - nodeTheme.margin;
						imageLayout.y =  Math.round((node.height - image.height) / 2);
						textLayout = {
							x: Math.round((imageLayout.x - textWidth) / 2),
							y: nodeTheme.margin,
							width: textWidth,
							height: node.height - (2 * nodeTheme.margin)
						};
						break;

					default:
						imageLayout.x = Math.round((node.width - image.width) / 2);
						imageLayout.y =  Math.round((node.height - image.height) / 2);
						textLayout = {
							x: Math.round((node.width - textWidth) / 2),
							y: nodeTheme.margin,
							width: textWidth,
							height: node.height - (2 * nodeTheme.margin)
						};
				}
				if (_.contains(['left', 'right', 'center'], image.position)) {
					textLayout.y = Math.round((node.height - textBox.height) / 2);
				}
			} else {
				textLayout = {
					x: Math.round((node.width - textBox.width) / 2),
					y: nodeTheme.margin,
					width: Math.min(textBox.width, node.width - (2 * nodeTheme.margin)),
					height: node.height - (2 * nodeTheme.margin)
				};
			}

			return {
				text: textLayout,
				image: imageLayout
			};
		};
	};

};
