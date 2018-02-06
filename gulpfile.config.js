/* eslint-env node*/
'use strict';

module.exports = {
	/** Customize any arguments for this projects
     * @param {Object} args - The parsed arguments
     * @return {Object} The modified arguments
     */
	customizeArgs: args => args,

	/** Customize the projects
     * @param {Object} projects - An object with groups of projects
     * @param {Project[]} projects.moduleProjects - The module projects
     * @param {Project[]} projects.themeProjects - The theme projects
     * @param {Project[]} projects.containersProjects - The containers projects
     * @param {Project[]} projects.2sxcProjects - The 2sxc projects
     * @param {Project[]} projects.otherProjects - The other projects (assumed to be template projects)
     * @return {Object} The modified projects object
     */
	customizeProjects: projects => projects,
};
