/* eslint-env node*/
'use strict';

const { getFirstMatchingFile } = require('../utility');

/**
 * Finds the path to the project's nuget.config file
 *
 * @param {Project} project - The gulp project
 * @param {Object} args - The common gulp task arguments
 * @returns {string} The path to the project's NuGet config file, or undefined if there isn't one for the project
 */
function findNugetConfig(project, args) {
	return getFirstMatchingFile(project.nugetConfigFilesGlobs, args, {
		multipleFilesWarning:
			'Multiple NuGet config file found, restoring only first file found',
	});
}

module.exports = {
	findNugetConfig,
};
