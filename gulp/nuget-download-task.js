/* eslint-env node*/
'use strict';

const fs = require('fs');
const request = require('request');
const { log } = require('./utility');

// based on example from https://github.com/mckn/gulp-nuget
module.exports = function nugetDownloadTask(args, done) {
	fs.access('nuget.exe', cannotAccess => {
		if (!cannotAccess) {
			log.debug('[nuget-download]', 'nuget.exe already exists');

			done();
			return;
		}

		request
			.get('https://dist.nuget.org/win-x86-commandline/latest/nuget.exe')
			.pipe(fs.createWriteStream('nuget.exe'))
			.on('close', done);
	});
};
