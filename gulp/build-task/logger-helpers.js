/* eslint-env node*/
'use strict';

const fs = require('fs');
const _ = require('lodash');
const glob = require('glob');
const { sortDescending } = require('../utility');

/**
 * A promise which resolves when the logs directory has been created (if it didn't already exist)
 */
const ensureLogDirectoryExists = new Promise((resolve, reject) => {
	fs.mkdir('logs/', err => {
		if (err && err.code !== 'EEXIST') {
			reject(err);
		} else {
			resolve();
		}
	});
});

/**
 * A promise which resolves to the assembly in which is defined MSBuild loggers for VSTS, or null
 *
 * @description this searches for the VSTS logger, based on https://github.com/Microsoft/vsts-tasks/blob/ce2f6325b83f69ba81f1fabe4951cb0064128cbe/Tasks/Common/MSBuildHelpers/InvokeFunctions.ps1#L221
 */
const loggerAssemblyPromise = new Promise(resolve => {
	const searchDirectoriesGlobs = _([
		process.env.AGENT_ROOTDIRECTORY,
		process.env.SYSTEM_WORKFOLDER,
		process.env.AGENT_WORKFOLDER,
	])
		.filter(dir => Boolean(dir))
		.uniq()
		.map(dir => dir.replace(/\\/g, '/'))
		.map(dir => `${dir}/**`)
		.value();
	if (searchDirectoriesGlobs.length === 0) {
		resolve(null);
	}

	const searchDirectoriesGlob =
		searchDirectoriesGlobs.length === 1
			? searchDirectoriesGlobs[0]
			: `{${searchDirectoriesGlobs.join(',')}}`;
	glob(
		`${searchDirectoriesGlob}/Microsoft.TeamFoundation.DistributedTask.MSBuild.Logger.dll`,
		{ silent: true, realpath: true },
		(err, paths) => {
			if (err || paths.length === 0) {
				resolve(null);
			} else {
				resolve(sortDescending(paths)[0]);
			}
		}
	);
});

/**
 * Creates MSBuild arguments to create file loggers for each verbosity and to log to VSO if available
 * @private
 * @param {string[]} verbosities - An array of MSBuild verbosity values
 * @param {string} projectName - The name of the project
 * @param {string} loggerAssembly - The path to the assembly which defines the VSO loggers
 * @returns {string[]} An array of logger parameters
 */
function createLoggerArguments(verbosities, projectName, loggerAssembly) {
	const fileLoggerArguments = verbosities.map((verbosity, i) => {
		const index = i + 1;
		const [timestampSeconds, timestampNanoseconds] = process.hrtime();
		const logFile = `logs/msbuild-${projectName}-${verbosity}-${timestampSeconds}${timestampNanoseconds}.log`;
		return `/fileLoggerParameters${index}:LogFile=${logFile};Verbosity=${verbosity}`;
	});

	if (!loggerAssembly) {
		return fileLoggerArguments;
	}

	const centralLogger = `CentralLogger,${loggerAssembly}`;
	const forwardingLogger = `ForwardingLogger,${loggerAssembly}`;
	return fileLoggerArguments.concat(
		`/distributedlogger:${centralLogger}*${forwardingLogger}`
	);
}

/**
 * Creates an array of arguments to pass to MSBuild
 *
 * @param {Project} project - The project for which to create the build arguments
 * @param {Object} args - The common gulp task arguments
 * @param {string} loggerAssembly - The path to the assembly which defines the VSO loggers
 * @returns {string[]} An array of MSBuild arguments
 */
function getCustomArgs(project, args, loggerAssembly) {
	if (args.developmentBuild) {
		return [];
	}

	return createLoggerArguments(
		['diagnostic', 'detailed', 'normal'],
		project.name,
		loggerAssembly
	);
}

module.exports = {
	loggerAssemblyPromise,
	ensureLogDirectoryExists,
	getCustomArgs,
};
