/* eslint-env node*/
'use strict';

const _ = require('lodash');

/**
 * A function to derive a version number from an item
 *
 * @callback getVersionNumber
 * @param {any} item - The item from which to derive a version number
 * @returns {string} The version number (as a string, e.g. '1.15.0')
 */

/**
 * Sorts a collection of items by a version number derived from those items
 *
 * @param {any[]} items - The collection of items to sort
 * @param {getVersionNumber} [getVersionNumber=_.identity] - A function to derive a version number from an item.
 * @param {string} [direction='desc'] - The direction of the sort, 'asc' or 'desc'
 * @param {number} [versionParts=3] - The number of parts in the version number
 * @returns {any[]} The sorted items collection
 */
function sortByVersionNumber(
	items,
	getVersionNumber = _.identity,
	direction = 'desc',
	versionParts = 3
) {
	function getVersionPart(index) {
		return item => {
			const versionPart = getVersionNumber(item).split('.')[index];
			return parseInt(versionPart, 10);
		};
	}

	const versionPartIndicies = _.range(versionParts); // e.g. [ 0, 1, 2, ]
	return _.orderBy(
		items,
		versionPartIndicies.map(getVersionPart),
		versionPartIndicies.map(() => direction)
	);
}

/**
 * Sorts a collection of items in descending
 *
 * @param {any[]} items - The collection of items to sort
 * @param {Function} [sortBy=_.identity] - A function to derive the value to sort by.
 * @returns {any[]} The sorted items collection
 */
function sortDescending(items, sortBy = _.identity) {
	return _.orderBy(items, [sortBy], ['desc']);
}

module.exports = {
	sortByVersionNumber,
	sortDescending,
};
