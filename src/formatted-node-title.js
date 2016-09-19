/*global module, require*/
var urlHelper = require('./url-helper');
module.exports = function (nodeTitle, maxUrlLength) {
	'use strict';
	var strippedTitle;
	if (!nodeTitle) {
		return '';
	}
	strippedTitle = urlHelper.stripLink(nodeTitle);
	if (strippedTitle.trim() === '') {
		return (!maxUrlLength || (nodeTitle.length < maxUrlLength) ? nodeTitle : (nodeTitle.substring(0, maxUrlLength) + '...'));
	}  else {
		return strippedTitle;
	}
};

