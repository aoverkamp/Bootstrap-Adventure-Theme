/* eslint-env node*/
'use strict';

const path = require('path');
const _ = require('lodash');
const edge = require('edge-js');
const {
	getFirstMatchingFile,
	getMatchingFiles,
	sortByVersionNumber,
} = require('../utility');
const { getElementText } = require('./xpath-helpers');

const formatVersionInfoImpl = edge.func(
	path.join(__dirname, 'FormatVersionInfo.csx')
);

/**
 * Calls a C# function to get the version number of an assembly
 * @private
 * @param {string} assemblyPath - The path to the assembly
 * @returns {string} The version number, formatted with leading zeroes (e.g. 01.02.13)
 */
function formatVersionInfo(assemblyPath) {
	return formatVersionInfoImpl(assemblyPath, true);
}

const getProjectsForSolutionImpl = edge.func(
	path.join(__dirname, 'GetProjectsForSolution.csx')
);

/**
 * Calls a C# function which retrieves a list of projects referenced by a Visual Studio solution file
 * @private
 * @param {string} solutionFilePath - The path to the solution file
 * @returns {string[]} An array of paths to the projects
 */
function getProjectsForSolution(solutionFilePath) {
	return getProjectsForSolutionImpl(solutionFilePath, true);
}

const getReferencesFromProjectImpl = edge.func(
	path.join(__dirname, 'GetReferencesFromProject.csx')
);

/**
 * Calls a C# function which retrieves a list of references for a Visual Studio project.
 * This includes the assembly output from the project, any referenced assemblies copied along with that output,
 * and, optionally, referenced assemblies which are _not_ copied with the output.
 * @private
 * @param {string} projectPath - The path to the project file
 * @param {boolean} includePrivateReferences - Whether to include private references (i.e. references which are not marked "Copy Local")
 * @returns {string[]} An array of paths to the assembly files
 */
function getReferencesFromProject(projectPath, includePrivateReferences) {
	return getReferencesFromProjectImpl(
		[projectPath, includePrivateReferences],
		true
	);
}

/**
 * Finds the path for the output assembly of a Visual Studio project
 * @private
 * @param {Project} project - The gulp project
 * @param {Object} args - The common gulp task arguments
 * @returns {string} The path to the assembly
 * @throws No Visual Studio project is found to be associated with the given gulp project
 */
function getAssemblyForProject(project, args) {
	const projectFile = getFirstMatchingFile(
		project.primaryProjectGlobs,
		args,
		{
			noFilesErrorMessage: 'No project found, cannot update version',
			multipleFilesWarning:
				"Multiple projects found, please update the project's primaryProjectGlobs " +
				'property (via the customizeProjects function in gulpfile.config.js). ' +
				"This is used to determine the project's version",
		}
	);

	const assemblyName = getElementText(
		projectFile,
		'//*[local-name(.)="AssemblyName"]'
	);
	const assemblyFileName = `${assemblyName}.dll`;
	return path.join(project.compilationOutputDirPath, assemblyFileName);
}

/**
 * Gets the version number for an assembly
 * @public
 * @param {string} assemblyPath - The path to the assembly
 * @returns {string} The version number, formatted with leading zeroes (e.g. 01.02.13)
 */
function getVersionFromAssembly(assemblyPath) {
	return formatVersionInfo(assemblyPath);
}

/**
 * Gets the version number for the assembly produced by a project.
 * @public
 * @param {Project} project - The gulp project
 * @param {Object} args - The common gulp task arguments
 * @returns {string} The version number, formatted with leading zeroes (e.g. 01.02.13)
 * @throws There is no Visual Studio project associated with the given project
 */
function getVersionFromProjectAssembly(project, args) {
	const assemblyPath = getAssemblyForProject(project, args);
	return getVersionFromAssembly(assemblyPath);
}

/**
 * Retrieves a list of all assemblies referenced by the Visual Studio solution associated with the given project.
 * Returns an empty array if there is no associated Visual Studio solution.
 * @public
 * @param {Project} project - The gulp project
 * @param {Object} args - The common gulp task arguments
 * @param {Object} options - An object with options
 * @param {boolean} [options.includePrivateReferences=false] - Whether to include refernces which are not copied along with the output of the project
 * @returns {string[]} An array of paths to the assembly files
 */
function getAssembliesFromSolution(
	project,
	args,
	{ includePrivateReferences = false } = {}
) {
	const solutionFilePath = getFirstMatchingFile(
		project.solutionFilesGlobs,
		args
	);
	if (!solutionFilePath) {
		return [];
	}

	const projectPaths = getProjectsForSolution(solutionFilePath);
	return _(projectPaths)
		.map(projectPath =>
			getReferencesFromProject(projectPath, includePrivateReferences)
		)
		.flatten()
		.uniq()
		.value();
}

/**
 * Retrieves a list of all assemblies referenced via NuGet
 * @public
 * @param {Project} project - The gulp project
 * @param {Object} args - The common gulp task arguments
 * @returns {string[]} An array of paths to the assembly files
 */
function getAssembliesFromNuGet(project, args) {
	return getMatchingFiles(
		[path.join(project.nugetPackagesDirPath, '**/*.dll')],
		args
	);
}

/**
 * Gets the lowest supported version of DNN Platform for the project
 * @public
 * @param {Project} project - The gulp project
 * @param {Object} args - The common gulp task arguments
 * @returns {string} The version number
 */
function getPlatformVersion(project, args) {
	const assemblies = getAssembliesFromSolution(project, args, {
		includePrivateReferences: true,
	});
	const versions = _(assemblies)
		.filter(
			assembly =>
				path.basename(assembly, '.dll').toUpperCase() === 'DOTNETNUKE'
		)
		.map(getVersionFromAssembly);

	return sortByVersionNumber(versions.value)[0];
}

module.exports = {
	getVersionFromAssembly,
	getVersionFromProjectAssembly,
	getAssembliesFromSolution,
	getAssembliesFromNuGet,
	getPlatformVersion,
};
