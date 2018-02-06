/* eslint-env node*/
'use strict';

const gulp = require('gulp');
const debug = require('gulp-debug');
const gulpif = require('gulp-if');
const rename = require('gulp-rename');
const elm = require('gulp-elm');
const elmTest = require('gulp-elm-test');
const uglify = require('gulp-uglify');
const gitignoreFilter = require('./gitignore-filter');
const errorHandler = require('./errorHandler');

const elmMake = 'node_modules/.bin/elm-make';

module.exports = {
	init: function initElm() {
		return elm.init({ elmMake });
	},

	build: function buildElm(project, args) {
		const developmentBuild = args.developmentBuild;
		return gulp
			.src(project.elmEntryFilesGlobs)
			.pipe(errorHandler(args))
			.pipe(gitignoreFilter.filterStream())
			.pipe(
				gulpif(
					args.debug,
					debug({ title: `elm-build:${project.name}` })
				)
			)
			.pipe(
				elm.bundle('elm.js', {
					elmMake,
					warn: developmentBuild,
					debug: developmentBuild,
				})
			)
			.pipe(uglify())
			.pipe(rename({ suffix: '.min' }))
			.pipe(gulp.dest(project.path));
	},

	test: function testElm(project, args) {
		return gulp
			.src(project.elmTestFilesGlobs)
			.pipe(errorHandler(args))
			.pipe(gitignoreFilter.filterStream())
			.pipe(
				gulpif(args.debug, debug({ title: `elm-test:${project.name}` }))
			)
			.pipe(
				elmTest({
					quiet: !args.verbose,
					verbose: args.verbose,
					args: ['--compiler', elmMake],
				})
			);
	},
};
