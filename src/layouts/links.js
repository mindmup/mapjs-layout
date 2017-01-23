/*global module, require*/
const _ = require('underscore');
module.exports = function (idea, visibleNodes) {
	'use strict';
	const result = {};
	_.each(idea.links, function (link) {
		if (visibleNodes[link.ideaIdFrom] && visibleNodes[link.ideaIdTo]) {
			result[link.ideaIdFrom + '_' + link.ideaIdTo] = {
				ideaIdFrom: link.ideaIdFrom,
				ideaIdTo: link.ideaIdTo,
				attr: _.clone(link.attr)
			};
		}
	});
	return result;
};

