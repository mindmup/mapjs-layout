/*global module, require */
var formattedNodeTitle = require('./formatted-node-title'),
	_ = require('underscore');
module.exports = function ThemeDimensionProvider(textSizer) {
	'use strict';
	var self = this;

	self.dimensionProviderForTheme = function (theme) {
		return function (idea, level) {
			var icon = idea.attr && idea.attr.icon,
				nodeTheme = theme.nodeTheme(theme.nodeStyles(level, idea.attr)),
				title = formattedNodeTitle(idea.title),
				textBox = textSizer(title, nodeTheme.maxWidth, nodeTheme.font);

			textBox.textSize = { width: textBox.width, height: textBox.height};
			textBox.width = Math.max(textBox.width + 2 * nodeTheme.margin, nodeTheme.cornerRadius * 2);
			textBox.height = Math.max(textBox.height + 2 * nodeTheme.margin, nodeTheme.cornerRadius * 2);

			if (icon) {
				if (icon.position === 'left' || icon.position === 'right') {
					textBox.width = textBox.width + nodeTheme.margin + icon.width;
				}
				if (icon.position === 'top' || icon.position === 'bottom') {
					textBox.height = textBox.height + nodeTheme.margin + icon.height;
				}
				textBox.height = Math.max(textBox.height, icon.height + 2 * nodeTheme.margin);
				textBox.width = Math.max(textBox.width, icon.width + 2 * nodeTheme.margin);

			}
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
				textBox = textSizer(title, nodeTheme.maxWidth, nodeTheme.font),
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
						imageLayout.x =  Math.min(nodeTheme.margin, (node.width - image.width) / 2);
						textLayout = {
							x: (node.width - textWidth) / 2,
							y: imageLayout.y + imageLayout.height + nodeTheme.margin,
							width: textWidth,
							height: node.height - image.height - (3 * nodeTheme.margin)
						};
						break;
					case 'bottom':
						imageLayout.x = Math.min(nodeTheme.margin, (node.width - image.width) / 2);
						imageLayout.y = node.height - image.height - nodeTheme.margin;
						textLayout = {
							x: (node.width - textWidth) / 2,
							y: nodeTheme.margin,
							width: textWidth,
							height: node.height - image.height - (3 * nodeTheme.margin)
						};

						break;
					case 'left':
						textWidth = Math.min(node.width - imageLayout.width - (3 * nodeTheme.margin), textBox.width);
						imageLayout.y = (node.height - image.height) / 2;
						offset = imageLayout.x + imageLayout.width;

						textLayout = {
							x: offset + (node.width - offset - textWidth) / 2,
							y: nodeTheme.margin,
							width: textWidth,
							height: node.height - (2 * nodeTheme.margin)
						};
						break;
					case 'right':
						textWidth = Math.min(node.width - imageLayout.width - (3 * nodeTheme.margin), textBox.width);
						imageLayout.x = node.width - image.width - nodeTheme.margin;
						imageLayout.y =  (node.height - image.height) / 2;
						textLayout = {
							x: (imageLayout.x - textWidth) / 2,
							y: nodeTheme.margin,
							width: textWidth,
							height: node.height - (2 * nodeTheme.margin)
						};
						break;

					default:
						imageLayout.x = (node.width - image.width) / 2;
						imageLayout.y =  (node.height - image.height) / 2;
						textLayout = {
							x: (node.width - textWidth) / 2,
							y: nodeTheme.margin,
							width: textWidth,
							height: node.height - (2 * nodeTheme.margin)
						};
				}
				if (_.contains(['left', 'right', 'center'], image.position)) {
					textLayout.y = (node.height - textBox.height) / 2;
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
