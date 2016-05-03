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
		var result = 0;
		_.each(subtreeMap, function (childLayout) {
			if (!childLayout.levels[level]) {
				return;
			}
			if (result > 0) {
				result += margin;
			}
			result += childLayout.levels[level].width;
		});
		return result;
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
	self.widestLevelWidth = function () {
		return _.max(self.getLevelWidths());
	};
	self.widestLevelIndex = function () {
		var levelWidths = self.getLevelWidths();
		return levelWidths.indexOf(self.widestLevelWidth());
	};
	self.getExpectedTranslation = function (rank) {
		var ranks = sortedRanks(),
			currentX = 0,
			translations = {},
			widestLevelIndex = self.widestLevelIndex();

		self.sortByRank().forEach(function (childLayout, index) {
			var offsetAtLevel = (childLayout.levels[widestLevelIndex] && childLayout.levels[widestLevelIndex].xOffset) || 0,
				widthAtLevel =  (childLayout.levels[widestLevelIndex] && childLayout.levels[widestLevelIndex].width) || 0;
			translations[ranks[index]] = currentX - offsetAtLevel;
			currentX += widthAtLevel + margin;
		});
		return translations[rank];

	};
	self.getMergedLevels = function (targetCombinedLeftOffset) {
		return self.getLevelWidths().map(function (val, index) {
			var referenceLeft = sortedRanks()[0], /* won't work if the first child layout does not exist on the widest level */
				referenceRight = sortedRanks()[sortedRanks().length - 1],
				rightLayout = subtreeMap[referenceRight],
				leftLayout = subtreeMap[referenceLeft];
			return {
				width:
					self.getExpectedTranslation(referenceRight) + rightLayout.levels[index].width -	self.getExpectedTranslation(referenceLeft),
				xOffset: self.getExpectedTranslation(referenceLeft) + targetCombinedLeftOffset + leftLayout.levels[index].xOffset
			};
		});

	};

};
