/*global module, require*/
var _ = require('underscore');

module.exports = function LayoutModel(layout) {
	'use strict';
	var self = this,
		options = {
			coneRatio: 0.5,
			majorAxisRatio: 3
		},
		getNode = function (nodeId) {
			return layout && layout.nodes && layout.nodes[nodeId];
		},
		getNodesForPredicate = function (predicate) {
			var nodes = _.values(layout.nodes),
				filtered = _.filter(nodes, predicate);
			return filtered.length && filtered;
		},
		getNodesBelow = function (referenceNode, coneRatio) {
			var predicate  = function (node) {
				var dy = (node.y + node.height) - (referenceNode.y + referenceNode.height),
					x1 = referenceNode.x  - Math.abs(dy * coneRatio),
					x2 = referenceNode.x  + referenceNode.width + Math.abs(dy * coneRatio);

				if (node.id === referenceNode.id || node.y <= Math.round(referenceNode.y + referenceNode.height * 0.5)) {
					return false;
				}
				if (coneRatio !== undefined && (node.x > x2 || (node.x + node.width) < x1)) {
					return false;
				}
				return true;
			};
			return getNodesForPredicate(predicate);
		},
		getNodesRight = function (referenceNode, coneRatio) {
			var predicate  = function (node) {
				var dx = (node.x + node.width) - (referenceNode.x + referenceNode.width),
					y1 = referenceNode.y  - Math.abs(dx * coneRatio),
					y2 = referenceNode.y  + referenceNode.height + Math.abs(dx * coneRatio);

				if (node.id === referenceNode.id || node.x <= Math.round(referenceNode.x + referenceNode.width * 0.5)) {
					return false;
				}
				if (coneRatio !== undefined && (node.y > y2 || (node.y + node.height) < y1)) {
					return false;
				}
				return true;
			};
			return getNodesForPredicate(predicate);
		},
		getNodesAbove = function (referenceNode, coneRatio) {
			var predicate = function (node) {
				var dy = node.y - referenceNode.y,
					x1 = referenceNode.x - Math.abs(dy * coneRatio),
					x2 = referenceNode.x + referenceNode.width + Math.abs(dy * coneRatio);

				if (node.id === referenceNode.id || (node.y + node.height) >= Math.round(referenceNode.y + referenceNode.height * 0.5)) {
					return false;
				}
				if (coneRatio !== undefined && (node.x > x2 || (node.x + node.width) < x1)) {
					return false;
				}
				return true;
			};
			return getNodesForPredicate(predicate);
		},
		getNodesLeft = function (referenceNode, coneRatio) {
			var predicate = function (node) {
				var dx = node.x - referenceNode.x,
					y1 = referenceNode.y - Math.abs(dx * coneRatio),
					y2 = referenceNode.y + referenceNode.height + Math.abs(dx * coneRatio);

				if (node.id === referenceNode.id || (node.x + node.width) >= Math.round(referenceNode.x + referenceNode.width * 0.5)) {
					return false;
				}
				if (coneRatio !== undefined && (node.y > y2 || (node.y + node.height) < y1)) {
					return false;
				}
				return true;
			};
			return getNodesForPredicate(predicate);
		},
		getNearest = function (referenceNode, nodes, xRatio, yRatio) {
			var result,
				referenceNodeCenter = {
					x: Math.round(referenceNode.x + referenceNode.width * 0.5),
					y: Math.round(referenceNode.y + referenceNode.height * 0.5)
				};
			if (!nodes) {
				return false;
			}
			if (nodes.length === 1) {
				return nodes[0];
			}
			result = _.min(nodes, function (node) {
				var nodeCenter = {
						x: Math.round(node.x + node.width * 0.5),
						y: Math.round(node.y + node.height * 0.5)
					},
					dx = xRatio * (nodeCenter.x - referenceNodeCenter.x),
					dy = yRatio * (nodeCenter.y - referenceNodeCenter.y),
					d1 =  Math.pow(dx, 2)  + Math.pow(dy, 2);
				// console.log(node.id, dx, dy, d1);
				return d1;
			});
			return result;
		};

	self.nodeIdToLeftOf = function (nodeId) {
		var referenceNode = getNode(nodeId),
			nodes = getNodesLeft(referenceNode, options.coneRatio) || getNodesLeft(referenceNode),
			node = getNearest(referenceNode, nodes, 1, options.majorAxisRatio);
		return node && node.id;
	};
	self.nodeIdToRightOf = function (nodeId) {
		var referenceNode = getNode(nodeId),
			nodes = getNodesRight(referenceNode, options.coneRatio) || getNodesRight(referenceNode),
			node = getNearest(referenceNode, nodes, 1, options.majorAxisRatio);
		return node && node.id;
	};

	self.nodeIdAbove = function (nodeId) {
		var referenceNode = getNode(nodeId),
			nodes = getNodesAbove(referenceNode, options.coneRatio) || getNodesAbove(referenceNode),
			node = getNearest(referenceNode, nodes, options.majorAxisRatio, 1);
		return node && node.id;
	};
	self.nodeIdBelow = function (nodeId) {
		var referenceNode = getNode(nodeId),
			nodes = getNodesBelow(referenceNode, options.coneRatio) || getNodesBelow(referenceNode),
			node = getNearest(referenceNode, nodes, options.majorAxisRatio, 1);
		return node && node.id;
	};
};
