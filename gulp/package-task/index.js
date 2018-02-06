/* eslint-env node*/
'use strict';

const path = require('path');
const gulp = require('gulp');
const debug = require('gulp-debug');
const gulpif = require('gulp-if');
const rename = require('gulp-rename');
const xmlpoke = require('gulp-xmlpoke');
const zip = require('gulp-zip');
const mergeStream = require('merge-stream');
const errorHandler = require('../errorHandler');
const Project = require('../Project');
const { getMatchingFiles, sortByVersionNumber, log } = require('../utility');
const {
	getVersionFromProjectAssembly,
	getAssembliesFromSolution,
	getAssembliesFromNuGet,
	getPlatformVersion,
} = require('./assembly-helpers');
const {
	getVersionFromManifest,
	makeManifestReplacements,
	mergeDependenciesIntoManifest,
	addDependencyFiles,
	getDependencyPackages,
} = require('./manifest-helpers');

module.exports = function packageTask(project, args) {
	const developmentBuild = args.developmentBuild;

	const version =
		project.projectType === Project.projectTypes.module
			? getVersionFromProjectAssembly(project, args)
			: getVersionFromManifest(project, args);

	log.debug('Version for %s package is %s', project.name, version);

	const releaseNotesFiles = getMatchingFiles(
		project.packageReleaseNotesGlobs,
		args,
		{
			noFilesWarning: 'No release notes file found',
		}
	);

	function getVersionNumber(filePath) {
		const fileName = path.basename(filePath);
		const match = fileName.match(/\d+\.\d+\.\d+/);
		if (match) {
			return match[0];
		}

		// Release notes files without a version number are considered to apply to the current version and should sort as the highest version
		return '999999999.0.0';
	}

	const releaseNotesFile = sortByVersionNumber(
		releaseNotesFiles,
		getVersionNumber,
		'desc'
	)[0];
	const assemblies =
		project.projectType === Project.projectTypes.module
			? getAssembliesFromSolution(project, args)
			: getAssembliesFromNuGet(project, args);

	const manifestFileStream = gulp
		.src(project.packageManifestGlobs)
		.pipe(errorHandler(args))
		.pipe(
			gulpif(
				args.debug,
				debug({ title: `package-manifest:${project.name}` })
			)
		)
		.pipe(
			xmlpoke({
				replacements: makeManifestReplacements(
					version,
					releaseNotesFile,
					assemblies,
					getPlatformVersion(project, args)
				),
			})
		)
		.pipe(mergeDependenciesIntoManifest());

	const resourceZipStream = gulp
		.src(project.packageResourcesGlobs)
		.pipe(errorHandler(args))
		.pipe(
			gulpif(
				args.debug,
				debug({ title: `package-resources:${project.name}` })
			)
		)
		.pipe(zip('Resources.zip', { compress: !developmentBuild }));

	const packageStream = mergeStream(resourceZipStream, manifestFileStream)
		.add(gulp.src(releaseNotesFile || []))
		.add(gulp.src(project.packageFilesGlobs))
		.add(gulp.src(assemblies))
		.pipe(errorHandler(args))
		.pipe(gulpif(args.debug, debug({ title: `package:${project.name}` })))
		.pipe(
			rename(filePath => {
				if (project.flattenPackageFiles === false) {
					return;
				}

				if (filePath.extname.toUpperCase() === '.DLL') {
					filePath.dirname = './bin/';
				} else {
					filePath.dirname = './'; // flatten
				}
			})
		)
		.pipe(addDependencyFiles())
		.pipe(
			zip(`${project.name}_${version}_Install.zip`, {
				compress: !developmentBuild,
			})
		)
		.pipe(gulp.dest(project.packageOutputDirPath));

	const dependenciesStream = manifestFileStream
		.pipe(errorHandler(args))
		.pipe(
			gulpif(
				args.debug,
				debug({ title: `package-dependencies:${project.name}` })
			)
		)
		.pipe(getDependencyPackages())
		.pipe(gulp.dest(project.dependencyPackageOutputDirPath));

	return mergeStream(packageStream, dependenciesStream);
};
