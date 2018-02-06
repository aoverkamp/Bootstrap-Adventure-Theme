/* eslint-env node*/
'use strict';

const os = require('os');
const path = require('path');
const _ = require('lodash');

/**
 * Attempts to load the given JavaScript module, returning an empty object if it can't be found
 * @private
 * @param {string} modulePath - The module specifier
 * @returns {Object} The loaded module or an empty object if the module wasn't found
 */
function maybeRequire(modulePath) {
	try {
		return require(modulePath);
	} catch (err) {
		if (err.code === 'MODULE_NOT_FOUND') {
			return {};
		}

		throw err;
	}
}

const projectCustomize = maybeRequire('../gulpfile.config');
const localUserCustomize = maybeRequire('../gulpfile.user');
const globalUserCustomize = maybeRequire(
	path.join(os.homedir(), 'gulpfile.user')
);

const passThrough = arg => arg;

module.exports = {
	/** Customize any arguments for this projects
     * @param {Object} args - The parsed arguments
     * @return {Object} The modified arguments
     */
	customizeArgs: _.flow(
		globalUserCustomize.customizeArgs || passThrough,
		projectCustomize.customizeArgs || passThrough,
		localUserCustomize.customizeArgs || passThrough
	),

	/** Customize the projects
     * @param {Object} projects - An object with groups of projects
     * @param {Project[]} projects.moduleProjects - The module projects
     * @param {Project[]} projects.themeProjects - The theme projects
     * @param {Project[]} projects.containersProjects - The containers projects
     * @param {Project[]} projects.2sxcProjects - The 2sxc projects
     * @param {Project[]} projects.otherProjects - The other projects (assumed to be template projects)
     * @return {Object} The modified projects object
     */
	customizeProjects: _.flow(
		globalUserCustomize.customizeProjects || passThrough,
		projectCustomize.customizeProjects || passThrough,
		localUserCustomize.customizeProjects || passThrough
	),
};
