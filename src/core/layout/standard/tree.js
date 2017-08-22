/*global module, require*/
const _ = require('underscore'),
	isEmptyGroup = require('../../content/is-empty-group'),
	outlineUtils = require('./outline'),
	Tree = function (options) {
		'use strict';
		_.extend(this, options);
		this.toLayout = function (x, y, parentId) {
			const result = {
					nodes: {},
					connectors: {}
				},
				self = _.pick(this, 'id', 'title', 'attr', 'width', 'height', 'level');

			x = x || 0;
			y = y || 0;


			if (self.level === 1) {
				self.x = Math.round(-0.5 * this.width);
				self.y = Math.round(-0.5 * this.height);
			} else {
				self.x = x + this.deltaX || 0;
				self.y = y + this.deltaY || 0;
			}
			result.nodes[this.id] = self;
			if (parentId !== undefined) {
				result.connectors[self.id] = {
					from: parentId,
					to: self.id
				};
			}
			if (this.subtrees) {
				this.subtrees.forEach(function (t) {
					const subLayout = t.toLayout(self.x, self.y, self.id);
					_.extend(result.nodes, subLayout.nodes);
					_.extend(result.connectors, subLayout.connectors);
				});
			}
			return result;
		};
	},
	calculateTree = function (content, dimensionProvider, margin, rankAndParentPredicate, level) {
		'use strict';
		const options = {
				id: content.id,
				title: content.title,
				attr: content.attr,
				deltaY: 0,
				deltaX: 0,
				level: level || 1
			},
			buildReferenceTree = function (treeArray, dy, oldPositions) {
				let referenceTree, tree;
				const adjustSpacing = function (i) {
					const oldSpacing = oldPositions[i].deltaY - oldPositions[i - 1].deltaY,
						newSpacing = treeArray[i].deltaY - treeArray[i - 1].deltaY;
					if (newSpacing < oldSpacing) {
						tree.deltaY += oldSpacing - newSpacing;
					}
				};

				for (let i = 0; i < treeArray.length; i += 1) {
					tree = treeArray[i];
					if (tree.attr && tree.attr.position) {
						tree.deltaY = tree.attr.position[1];
						if (referenceTree === undefined || tree.attr.position[2] > treeArray[referenceTree].attr.position[2]) {
							referenceTree = i;
						}
					} else {
						tree.deltaY += dy;
					}
					if (i > 0) {
						adjustSpacing(i);
					}
				}
				return referenceTree;
			},
			setVerticalSpacing = function (treeArray,  dy) {
				const oldPositions = _.map(treeArray, function (t) {
						return _.pick(t, 'deltaX', 'deltaY');
					}),
					referenceTree = buildReferenceTree (treeArray, dy, oldPositions),
					alignment = referenceTree && (treeArray[referenceTree].attr.position[1] - treeArray[referenceTree].deltaY);
				if (alignment) {
					for (let i = 0; i < treeArray.length; i += 1) {
						treeArray[i].deltaY += alignment;
					}
				}
			},
			shouldIncludeSubIdeas = function () {
				return !(_.isEmpty(content.ideas) || (content.attr && content.attr.collapsed));
			},
			includedSubIdeaKeys = function () {
				const allRanks = _.map(_.keys(content.ideas), parseFloat),
					candidateRanks = rankAndParentPredicate ? _.filter(allRanks, function (rank) {
						return rankAndParentPredicate(rank, content.id);
					}) : allRanks,
					includedRanks = _.filter(candidateRanks, function (rank) {
						return !isEmptyGroup(content.ideas[rank]);
					});
				return _.sortBy(includedRanks, Math.abs);
			},
			includedSubIdeas = function () {
				const result = [];
				_.each(includedSubIdeaKeys(), function (key) {
					result.push(content.ideas[key]);
				});
				return result;
			},
			nodeDimensions = dimensionProvider(content, options.level),
			appendSubtrees = function (subtrees) {
				let suboutline, deltaHeight, subtreePosition, horizontal, treeOutline;
				_.each(subtrees, function (subtree) {
					subtree.deltaX = nodeDimensions.width + margin;
					subtreePosition = subtree.attr && subtree.attr.position && subtree.attr.position[0];
					if (subtreePosition && subtreePosition > subtree.deltaX) {
						horizontal = subtreePosition - subtree.deltaX;
						subtree.deltaX = subtreePosition;
					} else {
						horizontal = 0;
					}
					if (!suboutline) {
						suboutline = subtree.outline.indent(horizontal, margin);
					} else {
						treeOutline = subtree.outline.indent(horizontal, margin);
						deltaHeight = treeOutline.initialHeight();
						suboutline = treeOutline.stackBelow(suboutline, margin);
						subtree.deltaY = Math.round(suboutline.initialHeight() - deltaHeight / 2 - subtree.height / 2);
					}
				});
				if (subtrees && subtrees.length) {
					setVerticalSpacing(subtrees, Math.round(0.5 * (nodeDimensions.height  - suboutline.initialHeight())));
					suboutline = suboutline.expand(
						Math.round(subtrees[0].deltaY - nodeDimensions.height * 0.5),
						Math.round(subtrees[subtrees.length - 1].deltaY + subtrees[subtrees.length - 1].height - nodeDimensions.height * 0.5)
					);
				}
				options.outline = suboutline.insertAtStart(nodeDimensions, margin);
			};
		_.extend(options, nodeDimensions);
		options.outline = outlineUtils.outlineFromDimensions(nodeDimensions);
		if (shouldIncludeSubIdeas()) {
			options.subtrees = _.map(includedSubIdeas(), function (i) {
				return calculateTree(i, dimensionProvider, margin, rankAndParentPredicate, options.level + 1);
			});
			if (!_.isEmpty(options.subtrees)) {
				appendSubtrees(options.subtrees);
			}
		}
		return new Tree(options);
	};

module.exports = {
	Tree: Tree,
	calculateTree: calculateTree
};
