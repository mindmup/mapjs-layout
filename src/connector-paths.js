/*global module*/
module.exports = {
	'quadratic': function (calculatedConnector, position, parent, child) {
		'use strict';
		var offset = calculatedConnector.connectorTheme.controlPoint.height * (calculatedConnector.from.y - calculatedConnector.to.y),
			maxOffset = Math.min(child.height, parent.height) * 1.2;
		offset = Math.max(-maxOffset, Math.min(maxOffset, offset));

		return {
			'd': 'M' + Math.round(calculatedConnector.from.x - position.left) + ',' + Math.round(calculatedConnector.from.y - position.top) +
				'Q' + Math.round(calculatedConnector.from.x - position.left) + ',' + Math.round(calculatedConnector.to.y - offset - position.top) + ' ' + Math.round(calculatedConnector.to.x - position.left) + ',' + Math.round(calculatedConnector.to.y - position.top),
			'position': position
		};
	},
	's-curve': function (calculatedConnector, position) {
		'use strict';
		var initialRadius = 10,
			dx = Math.round(calculatedConnector.to.x - calculatedConnector.from.x),
			dy = Math.round(calculatedConnector.to.y - calculatedConnector.from.y),
			dxIncrement = (initialRadius < Math.abs(dx * 0.5)) ? initialRadius * Math.sign(dx) : Math.round(dx * 0.5),
			dyIncrement = (initialRadius < Math.abs(dy * 0.5)) ? initialRadius * Math.sign(dy) : Math.round(dy * 0.5);

		return {
			'd': 'M' + (calculatedConnector.from.x - position.left) + ',' + (calculatedConnector.from.y - position.top) +
				'q' + dxIncrement + ',0 ' + dxIncrement + ',' + dyIncrement +
				'c0,' + (dy - (2 * dyIncrement)) + ' ' + Math.round(dx / 2  - dxIncrement) + ',' +  (dy - dyIncrement) + ' '  + (dx - dxIncrement) + ',' + (dy - dyIncrement),
			'position': position
		};

	},
	'top-down-s-curve': function (calculatedConnector, position) {
		'use strict';
		var dx = Math.round(calculatedConnector.to.x - calculatedConnector.from.x),
			dy = Math.round(calculatedConnector.to.y - calculatedConnector.from.y),
			initialRadius = 15,
			dxIncrement = initialRadius * Math.sign(dx),
			dyIncrement = initialRadius * Math.sign(dy),
			verticalLine = Math.round(0.5 * dy) - dyIncrement;
		if (initialRadius > Math.abs(dx / 2)) {
			dyIncrement = verticalLine + Math.round(0.5 * dyIncrement);
			return {
				'd': 'M' + (calculatedConnector.from.x - position.left) + ',' + (calculatedConnector.from.y - position.top) +
					'v' + dyIncrement +
					'l' + dx + ',' + (dy - dyIncrement),
				'position': position,
				'initialRadius': 5
			};
		}

		return {
				'd': 'M' + (calculatedConnector.from.x - position.left) + ',' + (calculatedConnector.from.y - position.top) +
					'v' + verticalLine +
					'q0,' + dyIncrement + ' ' + dxIncrement + ',' + dyIncrement +
					'h' + (dx - (2 * dxIncrement)) +
					'q' + dxIncrement + ',0 ' + dxIncrement + ',' +  dyIncrement +
					'v' + verticalLine,
				'position': position,
				'initialRadius': 5
			};

	},
	'compact-s-curve': function (calculatedConnector, position) {
		'use strict';
		var initialRadius = 10,
			dx = Math.round(calculatedConnector.to.x - calculatedConnector.from.x),
			dy = Math.round(calculatedConnector.to.y - calculatedConnector.from.y),
			dxIncrement = initialRadius * Math.sign(dx),
			dyIncrement = initialRadius * Math.sign(dy);

		if (initialRadius > Math.abs(dx * 0.5) || initialRadius > Math.abs(dy * 0.5)) {
			dxIncrement = Math.round(dx / 2);
			return {
				'd': 'M' + (calculatedConnector.from.x - position.left) + ',' + (calculatedConnector.from.y - position.top) +
					'l' + dxIncrement + ',0 ' +
					'l' + (dx - dxIncrement) + ',' + dy,
				'position': position
			};
		}
		return {
				'd': 'M' + (calculatedConnector.from.x - position.left) + ',' + (calculatedConnector.from.y - position.top) +
					'q' + dxIncrement + ',0 ' + dxIncrement + ',' + dyIncrement +
					'v' + (dy - (2 * dyIncrement)) +
					'q0,' + dyIncrement + ' ' + dxIncrement + ',' +  dyIncrement +
					'h' + (dx - (2 * dxIncrement)),
				'position': position
			};

	},
	'vertical-quadratic-s-curve': function (calculatedConnector, position) {
		'use strict';
		var dx = Math.round(calculatedConnector.to.x - calculatedConnector.from.x),
			dy = Math.round(calculatedConnector.to.y - calculatedConnector.from.y),
			dxIncrement = dx / 2,
			dyIncrement = dy / 2;

		if (Math.abs(dx) < 20) {

			return {
				'd': 'M' + (calculatedConnector.from.x - position.left) + ',' + (calculatedConnector.from.y - position.top) +
					'l' + dx + ',' + dy,
				initialRadius: 10,
				'position': position
			};
		}
		return {
			'd': 'M' + (calculatedConnector.from.x - position.left) + ',' + (calculatedConnector.from.y - position.top) +
				'q0,' + Math.round(dyIncrement / 2) + ' ' + dxIncrement + ',' + dyIncrement +
				'q' + dxIncrement + ',' + Math.round(dyIncrement / 2) + ' ' + dxIncrement + ',' +  dyIncrement,
			initialRadius: 10,
			'position': position
		};
	},
	'vertical-s-curve': function (calculatedConnector, position) {
		'use strict';
		var initialRadius = 10,
			dx = Math.round(calculatedConnector.to.x - calculatedConnector.from.x),
			dy = Math.round(calculatedConnector.to.y - calculatedConnector.from.y),
			dxIncrement = initialRadius * Math.sign(dx),
			dyIncrement = initialRadius * Math.sign(dy);

		if (initialRadius > Math.abs(dx * 0.5) || initialRadius > Math.abs(dy * 0.5)) {
			dxIncrement = Math.round(dx / 2);
			return {
				'd': 'M' + (calculatedConnector.from.x - position.left) + ',' + (calculatedConnector.from.y - position.top) +
					'l' + dx + ',' + dy,
				'position': position
			};
		}
		return {
				'd': 'M' + (calculatedConnector.from.x - position.left) + ',' + (calculatedConnector.from.y - position.top) +
					'q0,' + dyIncrement + ' ' + dxIncrement + ',' + dyIncrement +
					'h' + (dx - (2 * dxIncrement)) +
					'q' + dxIncrement + ',0 ' + dxIncrement + ',' +  dyIncrement +
					'v' + (dy - (2 * dyIncrement)),
				'position': position
			};

	},
	'straight': function (calculatedConnector, position) {
		'use strict';
		return {
			'd': 'M' + Math.round(calculatedConnector.from.x - position.left) + ',' + Math.round(calculatedConnector.from.y - position.top) + 'L' + Math.round(calculatedConnector.to.x - position.left) + ',' + Math.round(calculatedConnector.to.y - position.top),
			'position': position
		};
	},
	'no-connector': function (calculatedConnector, position) {
		'use strict';
		return {
			'd': 'M' + Math.round(calculatedConnector.to.x - position.left) + ',' + Math.round(calculatedConnector.to.y - position.top),
			'position': position
		};
	}

};
