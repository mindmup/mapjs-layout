/*global global, it*/
(function describeBatch() {
	'use strict';
	const oldDescribe = global.describe;
	global.describe = function () {
		const optionalBatch = arguments[1],
			parameterizedSpec = arguments[2];
		if (arguments.length === 2) {
			return oldDescribe.apply(this, arguments);
		}

		if (arguments.length === 3 && Array.isArray(optionalBatch)) {

			oldDescribe.call(this, arguments[0], function () {
				optionalBatch.forEach(function (args) {
					const specArgs = args.slice(1);
					it.call(this, args[0], function () {
						parameterizedSpec.apply(this, specArgs);
					});
				});
			});
		}
	};
}());
