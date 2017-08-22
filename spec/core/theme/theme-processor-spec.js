/*global describe, it, expect, beforeEach, require*/
const ThemeProcessor = require('../../../src/core/theme/theme-processor'),
	underTest = new ThemeProcessor();
describe('MAPJS.ThemeProcessor', function () {
	'use strict';
	it('converts a trivial single-item theme file to css', function () {
		const result = underTest.process({
			node: [
				{
					name: 'default',
					cornerRadius: 12
				}
			]
		});
		expect(result.css).toEqual('.mapjs-node{' +
			'border-radius:12px;' +
		'}');
	});
	it('converts a trivial multi-property item theme file to css', function () {
		const result = underTest.process({
			node: [
				{
					name: 'default',
					cornerRadius: 12,
					background: {
						color: '#E0E0E0'
					}
				}
			]
		});
		expect(result.css).toEqual('.mapjs-node{' +
			'border-radius:12px;' +
			'background-color:#E0E0E0;' +
		'}');
	});
	it('converts a multi-style theme to css', function () {
		const result = underTest.process({
			node: [{
				name: 'default',
				cornerRadius: 12,
				backgroundColor: '#E0E0E0'
			},
			{
				name: 'level_1',
				backgroundColor: '#22AAE0'
			}
			]
		});
		expect(result.css).toEqual(
			'.mapjs-node{' +
				'border-radius:12px;' +
				'background-color:#E0E0E0;' +
			'}' +
			'.mapjs-node.level_1{' +
				'background-color:#22AAE0;' +
			'}'
		);
	});
	it('replaces spaces with underscores in theme names', function () {
		const result = underTest.process({
			node: [
				{
					name: 'def au lt',
					cornerRadius: 12,
					backgroundColor: '#E0E0E0'
				},
				{
					name: 'level 1',
					backgroundColor: '#22AAE0'
				}
			]
		});
		expect(result.css).toEqual(
			'.mapjs-node.def_au_lt{' +
				'border-radius:12px;' +
				'background-color:#E0E0E0;' +
			'}' +
			'.mapjs-node.level_1{' +
				'background-color:#22AAE0;' +
			'}'
		);
	});
	describe('complex props', function () {
		let theme, result;
		describe('text', function () {
			describe('alignment', function () {
				it('reads it into the text-align', function () {
					const result = underTest.process({node: [{name: 'default', text: {alignment: 'left'}}]});
					expect(result.css).toEqual('.mapjs-node{text-align:left;}');
				});
			});
			describe('margin', function () {
				it('reads it into the padding of the node style and sets margin to 0', function () {
					const result = underTest.process({node: [{name: 'default', text: {margin: 5}}]});
					expect(result.css).toEqual('.mapjs-node{padding:5px;}');
				});
			});
			describe('font', function () {
				it('combines line spacing and font styles', function () {
					const result = underTest.process({node: [{name: 'default',
						text: {
							font: {
								lineSpacing: 5,
								size: 10,
								weight: 'light'
							}
						}}]});
					expect(result.css).toEqual('.mapjs-node{font:normal normal 200 10pt/15pt NotoSans, "Helvetica Neue", Roboto, Helvetica, Arial, sans-serif;}');
				});

			});
			describe('regular/dark/light colours', function () {
				it('converts dark/light/regular into separate styles', function () {
					const result = underTest.process({node: [{name: 'default',
						text: {
							color: '#4F4F4F',
							lightColor: '#EEEEEE',
							darkColor: '#000000'
						}}]});
					expect(result.css).toEqual('.mapjs-node{color:#4F4F4F;}.mapjs-node.mapjs-node-light{color:#4F4F4F;}.mapjs-node.mapjs-node-dark{color:#EEEEEE;}.mapjs-node.mapjs-node-white{color:#000000;}');
				});
			});

		});
		describe('decorations', function () {
			beforeEach(function () {
				theme = {
					node: [{
						name: 'default',
						decorations: {
							edge: 'top',
							overlap: true,
							position: 'end',
							height: 16
						}
					}]
				};
			});
			describe('when working on top edge', function () {
				beforeEach(function () {
					theme.node[0].decorations.edge = 'top';
				});
				it('creates link position styles', function () {
					expect(underTest.process(theme).css).toEqual('.mapjs-node{}.mapjs-node .mapjs-decorations{position:absolute;right:0;top:-8px;}');
				});
				it('will position above if overlap is false', function () {
					theme.node[0].decorations.overlap = false;
					expect(underTest.process(theme).css).toEqual('.mapjs-node{}.mapjs-node .mapjs-decorations{position:absolute;right:0;top:-16px;}');
				});
				it('will position in the middle if position is center', function () {
					theme.node[0].decorations.position = 'center';
					expect(underTest.process(theme).css).toEqual('.mapjs-node{}.mapjs-node .mapjs-decorations{position:absolute;left:0;width:100%;text-align:center;top:-8px;}');
				});
				it('will position to the left if position is start', function () {
					theme.node[0].decorations.position = 'start';
					expect(underTest.process(theme).css).toEqual('.mapjs-node{}.mapjs-node .mapjs-decorations{position:absolute;left:0;top:-8px;}');
				});
			});
			describe('when working on bottom edge', function () {
				beforeEach(function () {
					theme.node[0].decorations.edge = 'bottom';
				});
				it('creates link position styles', function () {
					expect(underTest.process(theme).css).toEqual('.mapjs-node{}.mapjs-node .mapjs-decorations{position:absolute;right:0;bottom:-8px;}');
				});
				it('will position above if overlap is false', function () {
					theme.node[0].decorations.overlap = false;
					expect(underTest.process(theme).css).toEqual('.mapjs-node{}.mapjs-node .mapjs-decorations{position:absolute;right:0;bottom:-16px;}');
				});
				it('will position in the middle if position is center', function () {
					theme.node[0].decorations.position = 'center';
					expect(underTest.process(theme).css).toEqual('.mapjs-node{}.mapjs-node .mapjs-decorations{position:absolute;left:0;width:100%;text-align:center;bottom:-8px;}');
				});
				it('will position to the left if position is start', function () {
					theme.node[0].decorations.position = 'start';
					expect(underTest.process(theme).css).toEqual('.mapjs-node{}.mapjs-node .mapjs-decorations{position:absolute;left:0;bottom:-8px;}');
				});
			});

			describe('when working on left edge', function () {
				beforeEach(function () {
					theme.node[0].decorations.edge = 'left';
					theme.node[0].decorations.overlap = false;
				});
				it('creates link position styles', function () {
					expect(underTest.process(theme).css).toEqual('.mapjs-node{}.mapjs-node .mapjs-decorations{position:absolute;right:100%;bottom:0;}');
				});
				it('ignores overlap', function () {
					theme.node[0].decorations.overlap = false;
					expect(underTest.process(theme).css).toEqual('.mapjs-node{}.mapjs-node .mapjs-decorations{position:absolute;right:100%;bottom:0;}');
				});
				it('will position in the middle if position is center', function () {
					theme.node[0].decorations.position = 'center';
					expect(underTest.process(theme).css).toEqual('.mapjs-node{}.mapjs-node .mapjs-decorations{position:absolute;right:100%;top:calc(50% - 8px);}');
				});
				it('will position to the left if position is start', function () {
					theme.node[0].decorations.position = 'start';
					expect(underTest.process(theme).css).toEqual('.mapjs-node{}.mapjs-node .mapjs-decorations{position:absolute;right:100%;top:0;}');
				});
			});
			describe('when working on right edge', function () {
				beforeEach(function () {
					theme.node[0].decorations.edge = 'right';
					theme.node[0].decorations.overlap = false;
				});
				it('creates link position styles', function () {
					expect(underTest.process(theme).css).toEqual('.mapjs-node{}.mapjs-node .mapjs-decorations{position:absolute;left:100%;bottom:0;}');
				});
				it('ignores overlap', function () {
					theme.node[0].decorations.overlap = false;
					expect(underTest.process(theme).css).toEqual('.mapjs-node{}.mapjs-node .mapjs-decorations{position:absolute;left:100%;bottom:0;}');
				});
				it('will position in the middle if position is center', function () {
					theme.node[0].decorations.position = 'center';
					expect(underTest.process(theme).css).toEqual('.mapjs-node{}.mapjs-node .mapjs-decorations{position:absolute;left:100%;top:calc(50% - 8px);}');
				});
				it('will position to the left if position is start', function () {
					theme.node[0].decorations.position = 'start';
					expect(underTest.process(theme).css).toEqual('.mapjs-node{}.mapjs-node .mapjs-decorations{position:absolute;left:100%;top:0;}');
				});
			});


		});
		describe('border', function () {
			beforeEach(function () {
				theme = {
					node: [{
						name: 'default',
						border: {
							type: 'surround',
							line: {
								color: '#707070',
								width: 1
							}
						}
					}]
				};
			});

			it('reads it into the border css when border type is surround', function () {
				const result = underTest.process(theme);
				expect(result.css).toEqual('.mapjs-node{border:1px solid #707070;margin:-1px;}');

			});
			it('interprets line style dashed', function () {
				theme.node[0].border.line.style = 'dashed';
				expect(underTest.process(theme).css).toEqual('.mapjs-node{border:1px dashed #707070;margin:-1px;}');
			});
			it('sets no border in css if the border is underline -- will be handled with a connector', function () {
				delete theme.node[0].border.line;
				result = underTest.process(theme);
				expect(result.css).toEqual('.mapjs-node{border:0;}');
			});
		});
		describe('background-color', function () {
			it('should return color when opacity is not defined', function () {
				const result = underTest.process({
					node: [{
						name: 'default',
						background: {
							color: '#22AAE0'
						}
					}]
				});
				expect(result.css).toEqual('.mapjs-node{background-color:#22AAE0;}');
			});
			it('should return color with opacity when defined', function () {
				const result = underTest.process({
					node: [{
						name: 'default',
						background: {
							color: '#22AAE0',
							opacity: 0.8
						}
					}]
				});
				expect(result.css).toEqual('.mapjs-node{background-color:rgba(34,170,224,0.8);}');
			});
			it('should return transparent when opacity is 0', function () {
				const result = underTest.process({
					node: [{
						name: 'default',
						background: {
							color: '#22AAE0',
							opacity: 0
						}
					}]
				});
				expect(result.css).toEqual('.mapjs-node{background-color:transparent;}');
			});
			it('should return transparent when no color configured', function () {
				const result = underTest.process({
					node: [{
						name: 'default',
						background: {
						}
					}]
				});
				expect(result.css).toEqual('.mapjs-node{background-color:transparent;}');
			});

		});
		describe('shadow', function () {
			it('should return a single shadow', function () {
				const result = underTest.process({
					node: [{
						name: 'default',
						shadow: [
							{
								color: '#22AAE0',
								opacity: 0.8,
								offset: {width: 1, height: 2},
								radius: 3
							}
						]
					}]
				});
				expect(result.css).toEqual('.mapjs-node{box-shadow:1px 2px 3px rgba(34,170,224,0.8);}');
			});
			it('should return multiple shadows as a single box-shadow', function () {
				const result = underTest.process({
					node: [{
						name: 'default',
						shadow: [
							{
								color: '#22AAE0',
								opacity: 0.8,
								offset: {width: 1, height: 2},
								radius: 3
							},
							{
								color: '#000000',
								offset: {width: 4, height: 5},
								radius: 6
							},
							{
								color: '#FF0000',
								offset: {width: 7, height: 8},
								radius: 9
							}

						]
					}]
				});
				expect(result.css).toEqual('.mapjs-node{box-shadow:1px 2px 3px rgba(34,170,224,0.8),4px 5px 6px #000000,7px 8px 9px #FF0000;}');
			});
			it('should return box-shadow none when shadow is transparent', function () {
				const result = underTest.process({
					node: [{
						name: 'default',
						shadow: [{
							color: 'transparent'
						}]
					}]
				});
				expect(result.css).toEqual('.mapjs-node{box-shadow:none;}');
			});
		});

	});

});
