/* eslint-env node*/
'use strict';

const fsExtra = require('fs-extra');

module.exports = function initConfig() {
	try {
		fsExtra.copySync(
			'./gulp/gulpfile.user.default.js',
			'./gulpfile.user.js',
			{ overwrite: false }
		);
	} catch (err) {
		// file already exists
	}
};
