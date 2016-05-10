/*global module, require*/
var urlHelper = require('./url-helper');
module.exports = function (nodeTitle) {
	'use strict';
	var strippedTitle;
	if (!nodeTitle) {
		return '';
	}
	strippedTitle = urlHelper.stripLink(nodeTitle);
	if (strippedTitle.trim() === '') {
		return nodeTitle;
	}  else {
		return strippedTitle;
	}
};

