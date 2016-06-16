/*global module*/
var URLHelper = function () {
	'use strict';
	var self = this,
		urlPattern = /(https?:\/\/|www\.)[\w-]+(\.[\w-]+)+([\w.,!@?^=%&amp;:\/~+#-]*[\w!@?^=%&amp;\/~+#-])?/i;

	self.containsLink = function (text) {
		return urlPattern.test(text);
	};

	self.getLink  = function (text) {
		var url = text && text.match(urlPattern);
		if (url && url[0]) {
			url = url[0];
			if (!/https?:\/\//i.test(url)) {
				url = 'http://' + url;
			}
		}
		return url;
	};

	self.stripLink  = function (text) {
		if (!text) {
			return '';
		}
		return text.replace(urlPattern, '');
	};
};

module.exports = new URLHelper();
