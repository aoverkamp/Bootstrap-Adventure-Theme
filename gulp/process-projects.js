/* eslint-env node*/
'use strict';

const path = require('path');
const _ = require('lodash');
const glob = require('glob');
const Project = require('./Project');
const gitignoreFilter = require('./gitignore-filter');
const { customizeProjects } = require('./customize');

/**
 * Makes the name of the project
 * @private
 * @param {string} folder - The path to the project's folder
 * @param {string} projectType - The type of project
 * @returns {string} The name of the project
 */
function makeProjectName(folder, projectType) {
	const folderName = path.basename(folder);
	return `${folderName}-${projectType}`;
}

/**
 * Makes the name of the project for a project in the "other" group
 * @private
 * @param {string} folder - The path to the project's folder
 * @returns {string} The name of the project
 */
function makeOtherProjectName(folder) {
	const folderName = path.basename(folder);

	let name;
	if (folderName === 'Templates') {
		name = path.basename(path.dirname(folder));
	} else {
		name = folderName;
	}

	return `${name}-templates`;
}

/**
 * Creates a Project for each folder
 * @private
 * @param {string[]} folders - An array of folder paths
 * @param {string} projectType - The type of project, one of module, theme, containers, other, from {@link Project.projectTypes}
 * @param {Function} [makeName=makeProjectName] - A function to make the name of the project, based on the folder and project type
 * @returns {Project[]} An array of projects
 */
function makeProjectGroup(folders, projectType, makeName = makeProjectName) {
	return folders.map(
		folder =>
			new Project(makeName(folder, projectType), folder, projectType)
	);
}

/**
 * An object containing all of the projects in various groups
 * @typedef {Object} ProjectGroups
 * @property {Project[]} moduleProjects - The module projects
 * @property {Project[]} themeProjects - The theme projects
 * @property {Project[]} containersProjects - The containers projects
 * @property {Project[]} 2sxcProjects - The 2sxc projects
 * @property {Project[]} otherProjects - The other projects (assumed to be template projects)
 */
/**
 * Finds all of the projects in the file system and groups them by type
 *
 * @returns {ProjectGroups} The projects
 */
module.exports = function processProjects() {
	const projectFolders = glob
		.sync('**/*.dnn', { nocase: true })
		.filter(gitignoreFilter.filter)
		.map(dnnFile => path.dirname(dnnFile));
	const folderGroups = _.groupBy(
		projectFolders,
		folder =>
			folder.includes('/DesktopModules/') &&
			path.basename(folder) !== 'Templates'
				? 'modules'
				: folder.includes('/Portals/_default/Skins/')
					? 'themes'
					: folder.includes('/Portals/_default/Containers/')
						? 'containers'
						: folder.endsWith('/Portals/_default/2sxc')
							? '2sxc'
							: 'others'
	);

	const moduleProjects = makeProjectGroup(
		folderGroups.modules || [],
		Project.projectTypes.module
	);
	const themeProjects = makeProjectGroup(
		folderGroups.themes || [],
		Project.projectTypes.theme
	);
	const containersProjects = makeProjectGroup(
		folderGroups.containers || [],
		Project.projectTypes.containers
	);
	const twoSxcProjects = makeProjectGroup(
		folderGroups['2sxc'] || [],
		Project.projectTypes['2sxc'],
		makeOtherProjectName
	);
	const otherProjects = makeProjectGroup(
		folderGroups.others || [],
		Project.projectTypes.other,
		makeOtherProjectName
	);

	return customizeProjects({
		moduleProjects,
		themeProjects,
		containersProjects,
		'2sxcProjects': twoSxcProjects,
		otherProjects,
	});
};
