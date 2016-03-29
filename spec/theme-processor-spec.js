/*global MAPJS, describe, it, expect, beforeEach*/
describe('MAPJS.ThemeProcessor', function () {
	'use strict';
	var underTest = new MAPJS.ThemeProcessor();
	it('converts a trivial single-item theme file to css', function () {
		var result = underTest.process({
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
		var result = underTest.process({
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
		var result = underTest.process({
				node: [
					{
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
		var result = underTest.process({
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
		var theme, result;
		describe('text', function () {
			describe('alignment', function () {
				it('reads it into the text-align', function () {
					var result = underTest.process({node: [{name: 'default', text: {alignment: 'left'}}]});
					expect(result.css).toEqual('.mapjs-node{text-align:left;}');
				});
			});
			describe('margin', function () {
				it('reads it into the padding of the node style and sets margin to 0', function () {
					var result = underTest.process({node: [{name: 'default', text: {margin: 5}}]});
					expect(result.css).toEqual('.mapjs-node{padding:5px;}');
				});
			});
			describe('font', function () {
				it('combines line spacing and font styles', function () {
					var result = underTest.process({node: [{name: 'default',
							text: {
								font: {
									lineSpacing: 5,
									size: 10,
									weight: 'light'
								}
							}}]});
					expect(result.css).toEqual('.mapjs-node{font:normal normal 200 10pt/15pt -apple-system, "Helvetica Neue", Roboto, Helvetica, Arial, sans-serif;}');
				});

			});
			describe('regular/dark/light colours', function () {
				it('converts dark/light/regular into separate styles', function () {
					var result = underTest.process({node: [{name: 'default',
							text: {
								color: '#4F4F4F',
								lightColor: '#EEEEEE',
								darkColor: '#000000'
							}}]});
					expect(result.css).toEqual('.mapjs-node{color:#4F4F4F;}.mapjs-node.mapjs-node-light{color:#4F4F4F;}.mapjs-node.mapjs-node-dark{color:#EEEEEE;}.mapjs-node.mapjs-node-white{color:#000000;}');
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
				var result = underTest.process(theme);
				expect(result.css).toEqual('.mapjs-node{border:1px solid #707070;}');

			});
			it('interprets line style dashed', function () {
				theme.node[0].border.line.style = 'dashed';
				expect(underTest.process(theme).css).toEqual('.mapjs-node{border:1px dashed #707070;}');
			});
			it('sets no border in css if the border is underline -- will be handled with a connector', function () {
				theme.node[0].border.type = 'underline';
				result = underTest.process(theme);
				expect(result.css).toEqual('.mapjs-node{border:0;}');
			});
		});
		describe('background-color', function () {
			it('should return color when opacity is not defined', function () {
				var result = underTest.process({
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
				var result = underTest.process({
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
				var result = underTest.process({
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
				var result = underTest.process({
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
				var result = underTest.process({
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
				var result = underTest.process({
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
				var result = underTest.process({
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
