/* eslint-env node*/
'use strict';

const gulp = require('gulp');
const debug = require('gulp-debug');
const gulpif = require('gulp-if');
const shell = require('gulp-shell');
const imagemin = require('gulp-imagemin');
const gitignoreFilter = require('./gitignore-filter');
const errorHandler = require('./errorHandler');

const maximumPngOptimizationLevel = 7;
const maximumGifOptimizationLevel = 3;

module.exports = function imagesTask(project, args) {
	const developmentBuild = args.developmentBuild;
	const imagesStream = gulp
		.src(project.imageFileGlobs)
		.pipe(errorHandler(args))
		.pipe(gitignoreFilter.filterStream())
		.pipe(gulpif(args.debug, debug({ title: `images:${project.name}` })));
	if (developmentBuild) {
		// do nothing to images during development
		return imagesStream;
	}

	return imagesStream
		.pipe(shell(['attrib -r "<%= file.path %>"'])) // remove readonly attribute, since we're overwriting the image
		.pipe(
			imagemin([
				imagemin.optipng({
					optimizationLevel: maximumPngOptimizationLevel,
				}),
				imagemin.jpegtran({ progressive: true }),
				imagemin.gifsicle({
					interlaced: true,
					optimizationLevel: maximumGifOptimizationLevel,
				}),
				imagemin.svgo({
					plugins: [
						{ removeViewBox: false },
						{ removeUselessDefs: false },
					],
				}),
			])
		)
		.pipe(gulp.dest(project.path));
};
