/*global module, require */
var _ = require('underscore');
module.exports = function VerticalSubtreeCollection(subtreeMap, margin) {
	'use strict';
	var self = this,
		sortedRanks = function () {
			return _.sortBy(Object.keys(subtreeMap), parseFloat);
		};
	margin = margin || 0;
	self.getLevelWidth = function (level) {
		var candidateRanks = sortedRanks().filter(function (rank) {
				return self.existsOnLevel(rank, level);
			}),
			referenceLeft = candidateRanks[0], /* won't work if the first child layout does not exist on the widest level */
			referenceRight = candidateRanks[candidateRanks.length - 1],
			leftLayout = subtreeMap[referenceLeft],
			rightLayout = subtreeMap[referenceRight],
			leftx = leftLayout.levels[level].xOffset + self.getExpectedTranslation(referenceLeft),
			rightx = rightLayout.levels[level].xOffset + self.getExpectedTranslation(referenceRight);
		return rightx + rightLayout.levels[level].width - leftx;

	};
	self.getLevelWidths = function () {
		/* todo: cache */
		var result = [],
			levelIdx,
			maxLevel = _.max(_.map(subtreeMap, function (childLayout) {
				return childLayout.levels.length;
			}));
		for (levelIdx = 0; levelIdx < maxLevel; levelIdx++) {
			result.push(self.getLevelWidth(levelIdx));
		}
		return result;
	};
	self.isEmpty = function () {
		return _.isEmpty(subtreeMap);
	};
	self.sortByRank = function () {
		/* todo: cache */
		if (_.isEmpty(subtreeMap)) {
			return [];
		}
		return sortedRanks().map(function (key) {
			return subtreeMap[key];
		});
	};

	self.getExpectedTranslation = function (rank) {
		var ranks = sortedRanks(),
			translations = {},
			currentWidthByLevel;

		self.sortByRank().forEach(function (childLayout, rankIndex) {
			var currentRank = ranks[rankIndex];
			if (currentWidthByLevel === undefined) {
				translations[currentRank] = 0 - childLayout.levels[0].xOffset;
				currentWidthByLevel = childLayout.levels.map(function (level) {
					return level.width + translations[currentRank] + level.xOffset;
				});
			} else {
				childLayout.levels.forEach(function (level, levelIndex) {
					var currentLevelWidth = currentWidthByLevel[levelIndex];
					if (currentLevelWidth !== undefined) {
						if (translations[currentRank] === undefined) {
							translations[currentRank] = currentLevelWidth + margin - level.xOffset;
						} else {
							translations[currentRank] = Math.max(translations[currentRank], currentLevelWidth + margin - level.xOffset);
						}
					}
				});

				childLayout.levels.forEach(function (level, levelIndex) {
					currentWidthByLevel[levelIndex] = translations[currentRank] + level.xOffset + level.width;
				});
			}
		});
		return translations[rank];
	};
	self.existsOnLevel = function (rank, level) {
		return subtreeMap[rank].levels.length > level;
	};
	self.getMergedLevels = function () {
		var targetCombinedLeftOffset = Math.round(self.getLevelWidth(0) * -0.5);
		return self.getLevelWidths().map(function (levelWidth, index) {
			var candidateRanks = sortedRanks().filter(function (rank) {
					return self.existsOnLevel(rank, index);
				}),
				referenceLeft = candidateRanks[0], /* won't work if the first child layout does not exist on the widest level */
				leftLayout = subtreeMap[referenceLeft];
			return {
				width: levelWidth,
				xOffset: leftLayout.levels[index].xOffset + self.getExpectedTranslation(referenceLeft) + targetCombinedLeftOffset
			};
		});

	};

};
