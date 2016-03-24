/*global global, it*/
(function describeBatch() {
	'use strict';
	var oldDescribe = global.describe;
	global.describe = function () {
		var optionalBatch, parameterizedSpec;
		if (arguments.length === 2) {
			return oldDescribe.apply(this, arguments);
		}
		optionalBatch = arguments[1];
		if (arguments.length === 3 && Array.isArray(optionalBatch)) {
			parameterizedSpec = arguments[2];
			oldDescribe.call(this, arguments[0], function () {
				optionalBatch.forEach(function (args) {
					var specArgs = args.slice(1);
					it.call(this, args[0], function () {
						parameterizedSpec.apply(this, specArgs);
					});
				});
			});
		}
	};
}());
