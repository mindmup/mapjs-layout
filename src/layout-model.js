/*global module, require*/
var _ = require('underscore');

module.exports = function LayoutModel() {
	'use strict';
	var self = this,
		options = {
			coneRatio: 0.5,
			majorAxisRatio: 3
		},
		layout,
		getNode = function (nodeId) {
			return layout && layout.nodes && layout.nodes[nodeId];
		},
		getNodesForPredicate = function (predicate) {
			var nodes = layout && _.values(layout.nodes),
				filtered = nodes && _.filter(nodes, predicate);
			return nodes && filtered.length && filtered;
		},
		getNodesDown = function (referenceNode, coneRatio) {
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
		getNodesUp = function (referenceNode, coneRatio) {
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
				},
				calculateDistance = function (point1, point2) {
					var dx = xRatio * (point1.x - point2.x),
						dy = yRatio * (point1.y - point2.y);
					return Math.pow(dx, 2)  + Math.pow(dy, 2);
				};
			if (!nodes) {
				return false;
			}
			if (nodes.length === 1) {
				return nodes[0];
			}
			result = _.min(nodes, function (node) {
				var d = [
						calculateDistance(node, referenceNodeCenter),
						calculateDistance({x: node.x + node.width, y: node.y + node.height}, referenceNodeCenter),
						calculateDistance({x: node.x + node.width, y: node.y}, referenceNodeCenter),
						calculateDistance({x: node.x, y: node.y + node.height}, referenceNodeCenter),
						calculateDistance({x: Math.round(node.x + node.width * 0.5), y: Math.round(node.y + node.height * 0.5)}, referenceNodeCenter)
					];
				return _.min(d);
			});
			return result;
		};
	self.setLayout = function (newLayout) {
		layout = newLayout;
	};
	self.getLayout = function () {
		return layout;
	};
	self.nodeIdLeft = function (nodeId) {
		var referenceNode = getNode(nodeId),
			nodes = referenceNode && (getNodesLeft(referenceNode, options.coneRatio) || getNodesLeft(referenceNode)),
			node = nodes && getNearest(referenceNode, nodes, 1, options.majorAxisRatio);
		return node && node.id;
	};
	self.nodeIdRight = function (nodeId) {
		var referenceNode = getNode(nodeId),
			nodes = referenceNode && (getNodesRight(referenceNode, options.coneRatio) || getNodesRight(referenceNode)),
			node = nodes && getNearest(referenceNode, nodes, 1, options.majorAxisRatio);
		return node && node.id;
	};

	self.nodeIdUp = function (nodeId) {
		var referenceNode = getNode(nodeId),
			nodes = referenceNode && (getNodesUp(referenceNode, options.coneRatio) || getNodesUp(referenceNode)),
			node = nodes && getNearest(referenceNode, nodes, options.majorAxisRatio, 1);
		return node && node.id;
	};
	self.nodeIdDown = function (nodeId) {
		var referenceNode = getNode(nodeId),
			nodes = referenceNode && (getNodesDown(referenceNode, options.coneRatio) || getNodesDown(referenceNode)),
			node = nodes && getNearest(referenceNode, nodes, options.majorAxisRatio, 1);
		return node && node.id;
	};
};