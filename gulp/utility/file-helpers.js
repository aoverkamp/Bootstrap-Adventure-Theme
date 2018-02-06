/* eslint-env node*/
'use strict';

const _ = require('lodash');
const glob = require('glob');
const { handle } = require('./error-helpers');

/**
 * Finds all files which match the given glob patterns
 *
 * @param {string[]} globs - An array of glob patterns to use for matching
 * @param {Object} args - The common gulp task arguments
 * @param {Object} options - An object with options
 * @param {string} options.noGlobsErrorMessage - If supplied, the error message to display when there are no globs to search.  If not supplied, no globs is considered valid.
 * @param {string} options.noGlobsWarning - If supplied, the warning message to display when there are no globs to search.  If not supplied, no globs is considered valid.
 * @param {string} options.noFilesErrorMessage - If supplied, the error message to display when there are no matching files.  If not supplied, no matching files is considered valid.
 * @param {string} options.noFilesWarning - If supplied, the warning message to display when there are no matching files.  If not supplied, no matching files is considered valid.
 * @returns {string[]} An array of file paths
 * @throws The noGlobsErrorMessage option is supplied and there are no glob patterns to search
 * @throws The noFilesErrorMessage option is supplied and there are no matching files
 */
function getMatchingFiles(globs, args, options = {}) {
	const { false: searchGlobs, true: negationGlobs = [] } = _.groupBy(
		globs,
		pattern => pattern[0] === '!'
	);
	if (searchGlobs === undefined) {
		handle(args, options.noGlobsErrorMessage, options.noGlobsWarning);
		return [];
	}

	const ignoreGlobs = negationGlobs.map(pattern => pattern.substring(1));
	const files = _.flatten(
		searchGlobs.map(pattern => glob.sync(pattern, { ignore: ignoreGlobs }))
	);
	if (files.length === 0) {
		handle(args, options.noFilesErrorMessage, options.noFilesWarning);
	}

	return files;
}

/**
 * Finds the first file which matches the given glob patterns
 *
 * @param {string[]} globs - An array of glob patterns to use for matching
 * @param {Object} args - The common gulp task arguments
 * @param {Object} options - An object with options
 * @param {string} options.noGlobsErrorMessage - If supplied, the error message to display when there are no globs to search.  If not supplied, no globs is considered valid.
 * @param {string} options.noGlobsWarning - If supplied, the warning message to display when there are no globs to search.  If not supplied, no globs is considered valid.
 * @param {string} options.noFilesErrorMessage - If supplied, the error message to display when there are no matching files.  If not supplied, no matching files is considered valid.
 * @param {string} options.noFilesWarning - If supplied, the warning message to display when there are no matching files.  If not supplied, no matching files is considered valid.
 * @param {string} options.multipleFilesErrorMessage - If supplied, the error message to display when there are multiple matching files.  If not supplied, multiple matching files is considered valid.
 * @param {string} options.multipleFilesWarning - If supplied, the warning message to display when there are multiple matching files.  If not supplied, multiple matching files is considered valid.
 * @returns {string} The path to the file (or undefined if no file was found)
 * @throws The noGlobsErrorMessage option is supplied and there are no glob patterns to search
 * @throws The noFilesErrorMessage option is supplied and there are no matching files
 * @throws The multipleFilesErrorMessage option is supplied and there are multiple matching files
 */
function getFirstMatchingFile(globs, args, options = {}) {
	const files = getMatchingFiles(globs, args, options);
	if (files.length > 1) {
		handle(
			args,
			options.multipleFilesErrorMessage,
			options.multipleFilesWarning,
			files
		);
	}

	return files[0];
}

module.exports = {
	getMatchingFiles,
	getFirstMatchingFile,
};
