/*global module */
module.exports = function extractConnectors(idea) {
	'use strict';
	var result = {},
		traverse = function (idea, parentId) {
			if (parentId) {
				result[idea.id] = {from: parentId, to: idea.id};
			}
			if (idea.ideas) {
				Object.keys(idea.ideas).forEach(function (subNodeRank) {
					traverse(idea.ideas[subNodeRank], idea.id);
				});
			}
		};
	traverse (idea);
	return result;
};
