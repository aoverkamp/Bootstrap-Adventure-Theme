/* eslint-env node*/
'use strict';

const gulp = require('gulp');
const filter = require('gulp-filter');
const debug = require('gulp-debug');
const gulpif = require('gulp-if');
const postcss = require('gulp-postcss');
const postcssReporter = require('postcss-reporter');
const less = require('gulp-less');
const autoprefixer = require('autoprefixer');
const pseudoelements = require('postcss-pseudoelements');
const sourcemaps = require('gulp-sourcemaps');
const cssnano = require('gulp-cssnano');
const bless = require('gulp-bless');
const browserSync = require('browser-sync');
const gitignoreFilter = require('./gitignore-filter');
const errorHandler = require('./errorHandler');

const ListsPlugin = require('less-plugin-lists');
const lessPlugins = [
	require('less-plugin-advanced-color-functions'),
	require('less-plugin-cubehelix'),
	new ListsPlugin(),
	require('less-plugin-util'),
];

module.exports = function cssTask(project, args) {
	const developmentBuild = args.developmentBuild;

	return gulp
		.src(project.lessEntryFilesGlobs)
		.pipe(errorHandler(args))
		.pipe(gitignoreFilter.filterStream())
		.pipe(gulpif(args.debug, debug({ title: `css:${project.name}` })))
		.pipe(gulpif(developmentBuild, sourcemaps.init()))
		.pipe(less({ plugins: lessPlugins }))
		.pipe(
			postcss([
				autoprefixer(),
				pseudoelements(),
				postcssReporter({ clearReportedMessages: true }),
			])
		)
		.pipe(gulpif(!developmentBuild, bless()))
		.pipe(gulpif(!developmentBuild, cssnano({ safe: true })))
		.pipe(gulpif(developmentBuild, sourcemaps.write('.')))
		.pipe(gulp.dest(project.stylesOutputDirPath))
		.pipe(filter('**/*.css')) // don't pass source-map files to browser sync
		.pipe(gulpif(developmentBuild, browserSync.reload({ stream: true })));
};
