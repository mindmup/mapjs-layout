/*global describe, beforeEach, jasmine, it, expect, require*/
const ThemeDimensionProvider = require('../../../src/core/theme/theme-dimension-provider');
describe('ThemeDimensionProvider', function () {
	'use strict';
	let underTest, textSizer, theme, nodeStyles, nodeTheme, textSize, options;
	beforeEach(function () {
		nodeTheme = {
			margin: 1,
			maxWidth: 20,
			cornerRadius: 10,
			font: 'theme font info here'
		};
		options = {};
		theme = jasmine.createSpyObj('theme', ['nodeStyles', 'nodeTheme']);
		theme.nodeStyles.and.returnValue(nodeStyles);
		theme.nodeTheme.and.returnValue(nodeTheme);
		textSizer = jasmine.createSpy('textSizer');
		textSize = {width: 50, height: 40};
		textSizer.and.returnValue(textSize);
		underTest = new  ThemeDimensionProvider(textSizer, options);
	});
	describe('dimensionProviderForTheme', function () {
		let idea;
		beforeEach(function () {
			idea = {id: 1, title: 'my node text'};
		});
		it('should return a function', function () {
			expect(underTest.dimensionProviderForTheme(theme)).toEqual(jasmine.any(Function));
		});
		describe('when the dimensionProviderForTheme function is called', function () {
			let dpFunc;
			beforeEach(function () {
				dpFunc = underTest.dimensionProviderForTheme(theme);
			});
			it('should get the node style from the theme for the level and attributes', function () {
				idea.attr = {
					foo: 'bar'
				};
				dpFunc(idea, 1);
				expect(theme.nodeStyles).toHaveBeenCalledWith(1, {foo: 'bar'});
			});
			it('should get the nodeTheme from the theme', function () {
				dpFunc(idea, 1);
				expect(theme.nodeTheme).toHaveBeenCalledWith(nodeStyles);
			});
			describe('should use the textSizer to calulate the wrapped text size', function () {
				it('should pass a formatted title, theme max width and theme font to textsizer if idea has no preferred width', function () {
					idea.title = 'my node text www.google.com';
					dpFunc(idea, 1);
					expect(textSizer).toHaveBeenCalledWith('my node text', 20, 'theme font info here');
				});
				it('should pass the title, idea preferred width and theme font to textsizer', function () {
					idea.attr = {
						style: {
							width: 25
						}
					};
					dpFunc(idea, 1);
					expect(textSizer).toHaveBeenCalledWith('my node text', 25, 'theme font info here');
				});
			});
			it('should use the preferrred width if greater than the wrapped text width', () => {
				idea.attr = {
					style: {
						width: 225
					}
				};
				expect(dpFunc(idea, 1).width).toEqual(225);

			});
			it('should use the wrapped text width if greater than preferrred width', () => {
				idea.attr = {
					style: {
						width: 50
					}
				};
				expect(dpFunc(idea, 1).width).toEqual(52);
			});
			it('should use the wrapped text width if preferrred width not specified', () => {
				idea.attr = {
				};
				expect(dpFunc(idea, 1).width).toEqual(52);
			});
			describe('for an ideas with no icon', function () {
				it('should return the text sizer dimensions as textSize property', function () {
					expect(dpFunc(idea, 1).textSize).toEqual(textSize);
				});
				it('should include the margin when calculating the size', function () {
					expect(dpFunc(idea, 1)).toEqual(jasmine.objectContaining({width: 52, height: 42}));
				});
				it('should not make the text box narrower than the corner radius allows', function () {
					textSize.width = 15;
					expect(dpFunc(idea, 1)).toEqual(jasmine.objectContaining({width: 20, height: 42}));
				});
				it('should not make the text box shorter than the corner radius allows', function () {
					textSize.height = 15;
					expect(dpFunc(idea, 1)).toEqual(jasmine.objectContaining({width: 52, height: 20}));
				});
			});
			describe('for ideas with an icon', function () {
				beforeEach(function () {
					idea.attr = {
						icon: {
							position: 'left',
							width: 30,
							height: 25
						}
					};
				});
				describe('should adjust the width by the icon width and margin', function () {
					['left', 'right'].forEach(function (args) {
						it('when the icon is positioned ' + args, function () {
							idea.attr.icon.position = args;
							expect(dpFunc(idea, 1)).toEqual(jasmine.objectContaining({width: 83, height: 42}));
						});
					});
				});
				describe('should adjust the height by the icon height and margin', function () {
					['top', 'bottom'].forEach(function (args) {
						it('when the icon is positioned ' + args, function () {
							idea.attr.icon.position = args;
							expect(dpFunc(idea, 1)).toEqual(jasmine.objectContaining({width: 52, height: 68}));
						});
					});
				});
				it('should not make the text box narrower than the image width allows (including margin)', function () {
					textSize.width = 0;
					expect(dpFunc(idea, 1)).toEqual(jasmine.objectContaining({width: 32, height: 42}));
				});
				it('should not make the text box shorter than the image height allows (including margin)', function () {
					textSize.height = 0;
					expect(dpFunc(idea, 1)).toEqual(jasmine.objectContaining({width: 83, height: 27}));
				});
				describe('when the icon is small', function () {
					it('should not make the text box narrower than the corner radius allows', function () {
						textSize.width = 0;
						idea.attr.icon.width = 15;
						expect(dpFunc(idea, 1)).toEqual(jasmine.objectContaining({width: 20, height: 42}));
					});
					it('should not make the text box shorter than the corner radius allows', function () {
						textSize.height = 0;
						idea.attr.icon.height = 15;
						expect(dpFunc(idea, 1)).toEqual(jasmine.objectContaining({width: 83, height: 20}));
					});
				});

			});
		});
	});
	describe('nodeLayoutProviderForTheme', function () {
		let node;
		beforeEach(function () {
			node = {
				level: 1,
				title: 'node title here',
				width: 83,
				height: 42,
				attr: {
					icon: {
						position: 'left',
						width: 30,
						height: 25
					}
				}
			};
		});
		it('should return a function', function () {
			expect(underTest.nodeLayoutProviderForTheme(theme)).toEqual(jasmine.any(Function));
		});
		describe('when the nodeLayoutProviderForTheme function is called', function () {
			let nlpFunc;
			beforeEach(function () {
				nlpFunc = underTest.nodeLayoutProviderForTheme(theme);
			});
			it('should get the node style from the theme for the level and attributes', function () {
				nlpFunc(node);
				expect(theme.nodeStyles).toHaveBeenCalledWith(1, node.attr);
			});
			it('should get the nodeTheme from the theme', function () {
				nlpFunc(node);
				expect(theme.nodeTheme).toHaveBeenCalledWith(nodeStyles);
			});
			describe('should use the textSizer to calulate the wrapped text size', function () {
				it('should pass a formatted title, theme max width and theme font to textsizer if idea has no preferred width', function () {
					node.title = 'my node text www.google.com';
					nlpFunc(node);
					expect(textSizer).toHaveBeenCalledWith('my node text', 20, 'theme font info here');
				});
				it('should remove margin from max width if option set', function () {
					options.substractMarginFromMaxWidth = true;
					node.title = 'my node text www.google.com';
					nlpFunc(node);
					expect(textSizer).toHaveBeenCalledWith('my node text', 18, 'theme font info here');

				});
				it('should pass the title, idea preferred width and theme font to textsizer', function () {
					node.attr.style = {
						width: 25
					};
					nlpFunc(node);
					expect(textSizer).toHaveBeenCalledWith('node title here', 25, 'theme font info here');
				});
			});
			describe('when the node has no icon', function () {
				beforeEach(function () {
					delete node.attr.icon;
				});
				it('should return a falsy image layout', function () {
					expect(nlpFunc(node).image).toBeFalsy();
				});
				describe('should return a text Layout', function () {
					it('with x that centers text', function () {
						expect(nlpFunc(node).text.x).toEqual(17);
					});
					it('with y that preserves margin', function () {
						expect(nlpFunc(node).text.y).toEqual(1);
					});
					it('with width that is the text width', function () {
						expect(nlpFunc(node).text.width).toEqual(50);
					});
					it('with width that fits into the node width including theme margin', function () {
						node.width = 50;
						expect(nlpFunc(node).text.width).toEqual(48);
					});
					it('with a height that fits into the node height incuding theme margin', function () {
						expect(nlpFunc(node).text.height).toEqual(40);
					});
				});
			});
			describe('when the node has an icon', function () {
				describe('should return an image layout', function ()  {
					['top', 'left', 'bottom', 'right', 'center'].forEach(function (args) {
						describe('for ' + args + ' position', function () {
							beforeEach(function () {
								node.attr.icon.position = args;
							});
							it('with width', function () {
								expect(nlpFunc(node).image.width).toEqual(30);
							});
							it('with height', function () {
								expect(nlpFunc(node).image.width).toEqual(30);
							});
						});
					});
				});
				describe('with top position', function () {
					beforeEach(function () {
						node.attr.icon.position = 'top';
					});
					it('should set the image x to margin if image is narrower than the node without margin', function () {
						expect(nlpFunc(node).image.x).toEqual(27);
					});
					it('should set the image x to be centered margin if image is wider than the node without margins', function () {
						nodeTheme.margin = 20;
						node.attr.icon.width = 70;
						expect(nlpFunc(node).image.x).toEqual(7);
					});
					describe('should return a text Layout', function () {
						it('with x that centers text', function () {
							expect(nlpFunc(node).text.x).toEqual(17);
						});
						it('with y that preserves margin and allows space for the image', function () {
							expect(nlpFunc(node).text.y).toEqual(27);
						});
						it('with width that is the text width', function () {
							expect(nlpFunc(node).text.width).toEqual(50);
						});
						it('with width that fits into the node width including theme margin', function () {
							node.width = 50;
							expect(nlpFunc(node).text.width).toEqual(48);
						});
						it('with a height that fits into the node height incuding theme margin', function () {
							expect(nlpFunc(node).text.height).toEqual(14);
						});
					});
				});
				describe('with bottom position', function () {
					beforeEach(function () {
						node.attr.icon.position = 'bottom';
					});
					it('should center the image horizontally', function () {
						expect(nlpFunc(node).image.x).toEqual(27);
					});
					it('should set the image x to be centered margin if image is wider than the node without margins', function () {
						nodeTheme.margin = 20;
						node.attr.icon.width = 70;
						expect(nlpFunc(node).image.x).toEqual(7);
					});
					describe('should return a text Layout', function () {
						it('with x that centers text', function () {
							expect(nlpFunc(node).text.x).toEqual(17);
						});
						it('with y that preserves margin', function () {
							expect(nlpFunc(node).text.y).toEqual(1);
						});
						it('with width that is the text width', function () {
							expect(nlpFunc(node).text.width).toEqual(50);
						});
						it('with width that fits into the node width including theme margin', function () {
							node.width = 50;
							expect(nlpFunc(node).text.width).toEqual(48);
						});
						it('with a height that fits into the node height incuding theme margin', function () {
							expect(nlpFunc(node).text.height).toEqual(14);
						});
					});
				});
				describe('with left position', function () {
					beforeEach(function () {
						node.attr.icon.position = 'left';
					});
					it('should center the image vertically', function () {
						expect(nlpFunc(node).image.y).toEqual(9);
					});
					it('should set the image x to margin', function () {
						expect(nlpFunc(node).image.x).toEqual(1);
					});
					describe('should return a text Layout', function () {
						it('with x that leaves space for the image', function () {
							expect(nlpFunc(node).text.x).toEqual(32);
						});
						it('with y that preserves margin', function () {
							expect(nlpFunc(node).text.y).toEqual(1);
						});
						it('with width that is the remaining width', function () {
							expect(nlpFunc(node).text.width).toEqual(50);
						});
						it('with width that fits into the node width including theme margin', function () {
							node.width = 50;
							expect(nlpFunc(node).text.width).toEqual(17);
						});
						it('with a height that fits into the node height incuding theme margin', function () {
							expect(nlpFunc(node).text.height).toEqual(40);
						});
					});
				});
				describe('with right position', function () {
					beforeEach(function () {
						node.attr.icon.position = 'right';
					});
					it('should center the image vertically', function () {
						expect(nlpFunc(node).image.y).toEqual(9);
					});
					it('should set the image x to position the image at the right margin ', function () {
						expect(nlpFunc(node).image.x).toEqual(52);
					});
					describe('should return a text Layout', function () {
						it('with x that leaves space for the image', function () {
							expect(nlpFunc(node).text.x).toEqual(1);
						});
						it('with y that preserves margin', function () {
							expect(nlpFunc(node).text.y).toEqual(1);
						});
						it('with width that is the remaining width', function () {
							expect(nlpFunc(node).text.width).toEqual(50);
						});
						it('with width that fits into the node width including theme margin', function () {
							node.width = 50;
							expect(nlpFunc(node).text.width).toEqual(17);
						});
						it('with a height that fits into the node height incuding theme margin', function () {
							expect(nlpFunc(node).text.height).toEqual(40);
						});
					});
				});
				describe('with center position', function () {
					beforeEach(function () {
						node.attr.icon.position = 'center';
					});
					it('should center the image vertically', function () {
						expect(nlpFunc(node).image.y).toEqual(9);
					});
					it('should center the image horizontally', function () {
						expect(nlpFunc(node).image.x).toEqual(27);
					});
					describe('should return a text Layout', function () {
						it('with x that centers the text', function () {
							expect(nlpFunc(node).text.x).toEqual(17);
						});
						it('with y that preserves margin', function () {
							expect(nlpFunc(node).text.y).toEqual(1); //TODO: This what it currently does, not sure if correct
						});
						it('with width that is the text width', function () {
							expect(nlpFunc(node).text.width).toEqual(50);
						});
						it('with a height that fits into the node height incuding theme margin', function () {
							expect(nlpFunc(node).text.height).toEqual(40);
						});
					});

				});
			});
		});

	});
});
