/* eslint-env node*/
/* eslint no-console:0*/
'use strict';

const util = require('util');

function hasGulplog() {
	try {
		return require('sparkles').exists('gulplog');
	} catch (err) {
		return false;
	}
}

const logLevels = ['error', 'warn', 'info', 'debug'];

module.exports = logLevels.reduce((log, level, index) => {
	function logMessage(...args) {
		if (hasGulplog()) {
			const gulplog = require('gulplog');
			gulplog[level](...args);
			return;
		}

		const gulpArgs = require('../process-arguments');
		if (gulpArgs.logLevel <= index) {
			return;
		}

		if (typeof args[0] === 'string') {
			args = [util.format(...args)];
		}

		console.log(...args);
	}

	return Object.assign(log, { [level]: logMessage });
}, {});
