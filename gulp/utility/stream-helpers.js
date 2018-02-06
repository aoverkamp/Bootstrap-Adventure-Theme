/* eslint-env node*/
'use strict';

const through2 = require('through2');

/**
 * Creates a stream to pipe to which calls the given resolve function after the stream has ended
 *
 * @param {function} resolve - The resolve function to call
 * @returns {Stream} The stream which will resolve the promise at the end
 */
function resolvePromise(resolve) {
	return through2.obj(
		(chunk, enc, cb) => {
			// passthrough
			cb(null, chunk);
		},

		cb => {
			resolve();
			cb();
		}
	);
}

/**
 * Wraps a stream in a promise.
 *
 * @description The promise resolves at the end of the stream, or rejects if there's an error emitted from the stream
 * @param {Stream} stream - The stream to wrap
 * @returns {Promise} A promise which resolves (without a value) at the end of the stream, or rejects upon an error being emitted by the stream
 */
function streamToPromise(stream) {
	return new Promise((resolve, reject) =>
		stream.pipe(resolvePromise(resolve).on('error', reject))
	);
}

module.exports = {
	streamToPromise,
};
