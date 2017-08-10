/*global module*/

module.exports = {
	strokes: (name, width) => {
		'use strict';
		if (!name || name === 'solid') {
			return '';
		}
		const multipleWidth = Math.max(width || 1, 1) * 4;
		if (name === 'dashed') {
			return [multipleWidth, multipleWidth].join(', ');
		} else {
			return [1, multipleWidth].join(', ');
		}
	},
	linecap: (name) => {
		'use strict';
		if (!name || name === 'solid') {
			return 'square';
		}
		if (name === 'dotted') {
			return 'round';
		}
		return '';
	}

};
