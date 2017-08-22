/* global require, module */
const _ = require('underscore');
module.exports = function isEmptyGroup(contentIdea) {
	'use strict';
	return contentIdea.attr && contentIdea.attr.group && _.isEmpty(contentIdea.ideas);
};
