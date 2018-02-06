/* eslint-env node*/
'use strict';

const path = require('path');
const _ = require('lodash');
const chalk = require('chalk');
const gulp = require('gulp');
const debug = require('gulp-debug');
const gulpif = require('gulp-if');
const rename = require('gulp-rename');
const eslint = require('gulp-eslint');
const prettier = require('gulp-plugin-prettier');
const babel = require('gulp-babel');
const rollupBabel = require('rollup-plugin-babel');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const rollup = require('gulp-rollup-each');
const mergeStream = require('merge-stream');
const gitignoreFilter = require('./gitignore-filter');
const errorHandler = require('./errorHandler');

const pathSeparatorRegExp = new RegExp(_.escapeRegExp(path.sep), 'g');

function getModuleName(project, file) {
	const projectFolderName = path.basename(project.path);
	const relativePath = path.relative(project.path, file.path);
	const directoryPath = path.dirname(relativePath);
	const relativeModuleName = directoryPath.replace(pathSeparatorRegExp, '.');
	return `${projectFolderName}.${relativeModuleName}`;
}

module.exports = function jsTask(project, args) {
	const developmentBuild = args.developmentBuild;

	function prettierReporter(filename, different) {
		if (!different) {
			return;
		}

		const relativePath = path.relative(project.path, filename);
		throw new Error(
			chalk`
A file, {green ${relativePath}},
in the {cyan ${project.name}} project was not formatted with Prettier.
You should enable Prettier in your editor, but you can run
	{white gulp --fix}
to update the file in the meantime.`
		);
	}

	const allJsGlobs = project.javaScriptFilesGlobs.concat(
		project.javaScriptModuleFilesGlobs
	);
	const lintStream = gulp
		.src(allJsGlobs)
		.pipe(errorHandler(args))
		.pipe(gitignoreFilter.filterStream())
		.pipe(gulpif(args.debug, debug({ title: `js-lint:${project.name}` })))
		.pipe(eslint(args.eslint))
		.pipe(
			eslint.format(
				developmentBuild
					? 'codeframe'
					: 'node_modules/eslint-formatter-vso'
			)
		)
		.pipe(eslint.failAfterError())
		.pipe(
			prettier.format(undefined, {
				reporter: args.fix ? 'none' : prettierReporter,
			})
		)
		.pipe(gulpif(args.fix, gulp.dest(project.path)));

	const scriptStream = gulp
		.src(project.javaScriptFilesGlobs)
		.pipe(errorHandler(args))
		.pipe(gitignoreFilter.filterStream())
		.pipe(gulpif(args.debug, debug({ title: `js-script:${project.name}` })))
		.pipe(gulpif(developmentBuild, sourcemaps.init()))
		.pipe(babel());

	const moduleStream = gulp
		.src(project.javaScriptEntryFilesGlobs)
		.pipe(errorHandler(args))
		.pipe(gitignoreFilter.filterStream())
		.pipe(gulpif(args.debug, debug({ title: `js-module:${project.name}` })))
		.pipe(gulpif(developmentBuild, sourcemaps.init()))
		.pipe(
			rollup(
				{
					plugins: [rollupBabel()],
				},
				entryFile => ({
					sourcemap: true,
					format: 'iife',
					name: getModuleName(project, entryFile),
				})
			)
		)
		.pipe(rename({ extname: '.js' }));

	const scriptAndModuleStream = mergeStream(scriptStream, moduleStream)
		.pipe(uglify())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulpif(developmentBuild, sourcemaps.write('.')))
		.pipe(gulp.dest(project.path));

	return mergeStream(lintStream, scriptAndModuleStream);
};
