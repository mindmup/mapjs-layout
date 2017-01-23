/*global module, require */
const _ = require('underscore');
module.exports = function VerticalSubtreeCollection(subtreeMap, marginArg) {
	'use strict';
	const self = this,
		sortedRanks = function () {
			if (!subtreeMap) {
				return [];
			}
			return _.sortBy(Object.keys(subtreeMap), parseFloat);
		},
		margin = marginArg || 0,
		calculateExpectedTranslations = function () {
			const ranks = sortedRanks(),
				translations = {},

				sortByRank = function () {
					/* todo: cache */
					if (_.isEmpty(subtreeMap)) {
						return [];
					}
					return sortedRanks().map(function (key) {
						return subtreeMap[key];
					});
				};
			let currentWidthByLevel;

			sortByRank().forEach(function (childLayout, rankIndex) {
				const currentRank = ranks[rankIndex];
				if (currentWidthByLevel === undefined) {
					translations[currentRank] = 0 - childLayout.levels[0].xOffset;
					currentWidthByLevel = childLayout.levels.map(function (level) {
						return level.width + translations[currentRank] + level.xOffset;
					});
				} else {
					childLayout.levels.forEach(function (level, levelIndex) {
						const currentLevelWidth = currentWidthByLevel[levelIndex];
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
			return translations;
		},
		translationsByRank = calculateExpectedTranslations();

	self.getLevelWidth = function (level) {
		const candidateRanks = sortedRanks().filter(function (rank) {
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
		const result = [],
			maxLevel = _.max(_.map(subtreeMap, function (childLayout) {
				return childLayout.levels.length;
			}));
		for (let levelIdx = 0; levelIdx < maxLevel; levelIdx++) {
			result.push(self.getLevelWidth(levelIdx));
		}
		return result;
	};
	self.isEmpty = function () {
		return _.isEmpty(subtreeMap);
	};

	self.getExpectedTranslation = function (rank) {
		return translationsByRank[rank];
	};
	self.existsOnLevel = function (rank, level) {
		return subtreeMap[rank].levels.length > level;
	};
	self.getMergedLevels = function () {
		const targetCombinedLeftOffset = Math.round(self.getLevelWidth(0) * -0.5);
		return self.getLevelWidths().map(function (levelWidth, index) {
			const candidateRanks = sortedRanks().filter(function (rank) {
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
