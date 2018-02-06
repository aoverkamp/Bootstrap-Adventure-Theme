/* eslint-env node*/
'use strict';

const gulp = require('gulp');
const debug = require('gulp-debug');
const gulpif = require('gulp-if');
const nuget = require('gulp-nuget');
const msbuild = require('gulp-msbuild');
const gitignoreFilter = require('../gitignore-filter');
const errorHandler = require('../errorHandler');
const Project = require('../Project');
const {
	loggerAssemblyPromise,
	ensureLogDirectoryExists,
	getCustomArgs,
} = require('./logger-helpers');
const { findNugetConfig } = require('./nuget-helpers');
const { streamToPromise } = require('../utility');

module.exports = function buildTask(project, args) {
	const developmentBuild = args.developmentBuild;
	const nugetVerbosity = args.verbose ? 'detailed' : 'normal';

	const srcGlobs =
		project.projectType === Project.projectTypes.module
			? project.solutionFilesGlobs
			: project.nugetPackagesFilesGlobs;

	const buildStream = gulp
		.src(srcGlobs)
		.pipe(errorHandler(args))
		.pipe(gitignoreFilter.filterStream())
		.pipe(gulpif(args.debug, debug({ title: `${project.name}-build:` })))
		.pipe(
			nuget.restore({
				verbosity: nugetVerbosity,
				configFile: findNugetConfig(project, args),
				packagesDirectory: project.nugetPackagesDirPath,
			})
		);

	if (project.projectType !== Project.projectTypes.module) {
		return buildStream;
	}

	return Promise.all([loggerAssemblyPromise, ensureLogDirectoryExists])
		.then(([loggerAssembly]) =>
			buildStream.pipe(
				msbuild({
					errorOnFail: !developmentBuild,
					stdout: true,
					verbosity: 'minimal',
					logCommand: args.debug,
					nodeReuse: developmentBuild,
					customArgs: getCustomArgs(project, args, loggerAssembly),
					targets: ['Build'],
					toolsVersion: 'auto',
					configuration: developmentBuild ? 'Debug' : 'Release',
				})
			)
		)
		.then(streamToPromise);
};
