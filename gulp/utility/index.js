/* eslint-env node*/
'use strict';

const fileHelpers = require('./file-helpers');
const collectionHelpers = require('./collection-helpers');
const streamHelpers = require('./stream-helpers');
const errorHelpers = require('./error-helpers');

module.exports = {
	getMatchingFiles: fileHelpers.getMatchingFiles,
	getFirstMatchingFile: fileHelpers.getFirstMatchingFile,
	sortByVersionNumber: collectionHelpers.sortByVersionNumber,
	sortDescending: collectionHelpers.sortDescending,
	streamToPromise: streamHelpers.streamToPromise,
	formatMessage: errorHelpers.formatMessage,
	log: require('./log'),
};
