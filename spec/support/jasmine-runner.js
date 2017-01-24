#!/usr/bin/env node
/*global jasmine, require, process */
(function () {
	'use strict';
	const Jasmine = require('jasmine'),
		SpecReporter = require('jasmine-spec-reporter'),
		noop = function () {},
		jrunner = new Jasmine();
	let filter;


	process.argv.slice(2).forEach(function (option) {
		if (option === 'full') {
			jrunner.configureDefaultReporter({print: noop});    // remove default reporter logs
			jasmine.getEnv().addReporter(new SpecReporter());   // add jasmine-spec-reporter
		}
		if (option.match('^filter=')) {
			filter = option.match('^filter=(.*)')[1];
		}
	});
	jrunner.loadConfig({
		'spec_dir': 'spec',
		'spec_files': [
			'**/*-spec.js'
		],
		'helpers': [
			'helpers/**/*.js'
		]
	});                           // load jasmine.json configuration
	jrunner.execute(undefined, filter);

}());
