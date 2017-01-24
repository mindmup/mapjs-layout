/*global require, module*/
const _ = require('underscore'),
	borderLength = function (border) {
		'use strict';
		return _.reduce(border, function (seed, el) {
			return seed + el.l;
		}, 0);
	},
	borderSegmentIndexAt = function (border, length) {
		'use strict';
		let l = 0, i = -1;
		while (l <= length) {
			i += 1;
			if (i >= border.length) {
				return -1;
			}
			l += border[i].l;
		}
		return i;
	},
	extendBorder = function (originalBorder, extension) {
		'use strict';
		let lengthToCut,
			result = originalBorder.slice();
		const origLength = borderLength(originalBorder),
			i = borderSegmentIndexAt(extension, origLength);
		if (i >= 0) {
			lengthToCut = borderLength(extension.slice(0, i + 1));
			result.push({h: extension[i].h, l: lengthToCut - origLength});
			result = result.concat(extension.slice(i + 1));
		}
		return result;
	},
	Outline = function (topBorder, bottomBorder) {
		'use strict';
		const shiftBorder = function (border, deltaH) {
			return _.map(border, function (segment) {
				return {
					l: segment.l,
					h: segment.h + deltaH
				};
			});
		};
		this.initialHeight = function () {
			return this.bottom[0].h - this.top[0].h;
		};
		this.borders = function () {
			return _.pick(this, 'top', 'bottom');
		};
		this.spacingAbove = function (outline) {
			let i = 0, j = 0, result = 0, li = 0, lj = 0;
			while (i < this.bottom.length && j < outline.top.length) {
				result = Math.max(result, this.bottom[i].h - outline.top[j].h);
				if (li + this.bottom[i].l < lj + outline.top[j].l) {
					li += this.bottom[i].l;
					i += 1;
				} else if (li + this.bottom[i].l === lj + outline.top[j].l) {
					li += this.bottom[i].l;
					i += 1;
					lj += outline.top[j].l;
					j += 1;
				} else {
					lj += outline.top[j].l;
					j += 1;
				}
			}
			return result;
		};
		this.indent = function (horizontalIndent, margin) {
			const top = this.top.slice(),
				bottom = this.bottom.slice(),
				vertCenter = Math.round((bottom[0].h + top[0].h) / 2);

			if (!horizontalIndent) {
				return this;
			};

			top.unshift({h: Math.round(vertCenter - margin / 2), l: horizontalIndent});
			bottom.unshift({h: Math.round(vertCenter + margin / 2), l: horizontalIndent});
			return new Outline(top, bottom);
		};
		this.stackBelow = function (outline, margin) {
			const spacing = outline.spacingAbove(this),
				top = extendBorder(outline.top, shiftBorder(this.top, spacing + margin)),
				bottom = extendBorder(shiftBorder(this.bottom, spacing + margin), outline.bottom);
			return new Outline(
				top,
				bottom
			);
		};
		this.expand = function (initialTopHeight, initialBottomHeight) {
			const topAlignment = initialTopHeight - this.top[0].h,
				bottomAlignment = initialBottomHeight - this.bottom[0].h,
				top = shiftBorder(this.top, topAlignment),
				bottom = shiftBorder(this.bottom, bottomAlignment);
			return new Outline(
				top,
				bottom
			);
		};
		this.insertAtStart = function (dimensions, margin) {
			const alignment = 0, //-1 * this.top[0].h - suboutlineHeight * 0.5,
				topBorder = shiftBorder(this.top, alignment),
				bottomBorder = shiftBorder(this.bottom, alignment),
				easeIn = function (border) {
					border[0].l *= 0.5;
					border[1].l += border[0].l;
				};
			topBorder[0].l += margin;
			bottomBorder[0].l += margin;
			topBorder.unshift({h: Math.round(-0.5 * dimensions.height), l: dimensions.width});
			bottomBorder.unshift({h: Math.round(0.5 * dimensions.height), l: dimensions.width});
			if (topBorder[0].h > topBorder[1].h) {
				easeIn(topBorder);
			}
			if (bottomBorder[0].h < bottomBorder[1].h) {
				easeIn(bottomBorder);
			}
			return new Outline(topBorder, bottomBorder);
		};
		this.top = topBorder.slice();
		this.bottom = bottomBorder.slice();
	},
	outlineFromDimensions = function (dimensions) {
		'use strict';
		return new Outline([{
			h: Math.round(-0.5 * dimensions.height),
			l: dimensions.width
		}], [{
			h: Math.round(0.5 * dimensions.height),
			l: dimensions.width
		}]);
	};


module.exports = {
	borderLength: borderLength,
	borderSegmentIndexAt: borderSegmentIndexAt,
	extendBorder: extendBorder,
	Outline: Outline,
	outlineFromDimensions: outlineFromDimensions
};
