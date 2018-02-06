/* eslint-env node*/
'use strict';

const util = require('util');
const boxen = require('boxen');
const log = require('./log');

/**
 * Format the message, via boxen for development, otherwise formatted for TFS
 * @param {boolean} developmentBuild - Whether this build is in a development or production environment
 * @param {boolean} isError - Whether the message is an error message or a warning message
 * @param {any} message - The message being logged, or an objects containing the message and details
 * @returns {string} The formatted message
 */
function formatMessage(developmentBuild, isError, message) {
	if (developmentBuild) {
		const borderColor = isError ? 'red' : 'yellow';
		const boxenOptions = {
			padding: 1,
			margin: 1,
			borderColor,
			borderStyle: 'round',
		};
		return boxen(message || message.message, boxenOptions);
	}

	const issueType = isError ? 'error' : 'warning';
	if (message.message) {
		const sourcepath = message.filename || message.fileName;
		const linenumber = message.line || message.lineNumber;
		const columnnumber = message.column || message.columnNumber || 0;
		message = message.message;
		return util.format(
			`##vso[task.logissue type=%s;${sourcepath
				? 'sourcepath=%s;'
				: '%s'}${linenumber !== undefined
				? 'linenumber=%d;'
				: '%s'}${columnnumber !== undefined
				? 'columnnumber=%d;'
				: '%s'}] %s`,
			issueType,
			sourcepath || '',
			linenumber || '',
			columnnumber || '',
			message
		);
	}

	return util.format('##vso[task.logissue type=%s;] %s', issueType, message);
}

/**
 * Displays an error or warning message, if supplied.
 * If there is an error message, stops processing of the current action.
 *
 * @param {Object} args - The common gulp task arguments
 * @param {boolean} args.developmentBuild - Whether this build is in a development or production environment
 * @param {any} errorMessage - If truthy, logs this value as an error
 * @param {any} warningMessage - If errorMessage is falsy and this value is truthy, logs this value as a warning
 * @param {any[]} additionalMessages - Additional messages to log (if either errorMessage or warningMessage is truthy)
 * @throws The errorMessage has a value
 */
function handle(
	{ developmentBuild },
	errorMessage,
	warningMessage,
	...additionalMessages
) {
	if (!errorMessage && !warningMessage) {
		return;
	}

	const isError = Boolean(errorMessage);
	const message = isError ? errorMessage : warningMessage;
	const combinedMessages = util.format(message, ...additionalMessages);
	const formattedMessage = formatMessage(
		developmentBuild,
		isError,
		combinedMessages
	);
	const logFunction = (isError ? log.error : log.warn).bind(log);
	logFunction(formattedMessage);

	if (isError) {
		throw new Error(combinedMessages);
	}
}

module.exports = {
	formatMessage,
	handle,
};
