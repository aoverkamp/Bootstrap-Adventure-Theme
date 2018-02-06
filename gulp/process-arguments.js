/* eslint-env node*/
'use strict';

const yargs = require('yargs');
const { customizeArgs } = require('./customize');

const defaultOptions = customizeArgs({
	nantPath: '',
	env: process.env.NODE_ENV || 'development',
	L: 3,
});
const args = yargs
	.string('env')
	.string('nantPath')
	.string('url')
	.boolean('verbose')
	.boolean('fix')
	.boolean('debug')
	.default('debug', undefined)
	.count('L')
	.alias('L', 'log-level')
	.default(defaultOptions).argv;
args.developmentBuild = args.env !== 'production';

// use gulp log-level to indicate debug if it isn't passed explicitly
if (args.debug === undefined) {
	const debugLogLevel = 4;
	args.debug = args.logLevel >= debugLogLevel;
}

if (args.fix) {
	args.eslint = args.eslint || {};
	args.eslint.fix = args.fix;
}

module.exports = args;
