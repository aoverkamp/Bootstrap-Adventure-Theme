/* eslint-env node*/
'use strict';

const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const { formatMessage, log } = require('./utility');

/**
 * Gets a plumber stream to handle errors later in the stream
 *
 * @param {any} args The common project arguments
 * @returns {Stream} A stream which handles errors
 */
module.exports = function handleStreamError({ developmentBuild }) {
	return plumber({
		errorHandler: developmentBuild
			? notify.onError({
					title: '<%= error.plugin %> Error',
					message: '<%= error.message %>',
				})
			: function handleProductionError(err) {
					log.error(formatMessage(developmentBuild, true, err));
					process.exit(1);
				},
	});
};
