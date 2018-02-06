/* eslint-env node*/
'use strict';

const fs = require('fs');
const { DOMParser } = require('xmldom');
const xpath = require('xpath.js');

/**
 * Gets the nodes matching the XPath query from the given XML file
 *
 * @param {string} filePath - The path to the XML document to search
 * @param {string} xpathQuery - The XPath query identifying the nodes to match
 * @returns {Node[]} An array of XML nodes
 */
function getMatchingNodes(filePath, xpathQuery) {
	const fileContent = fs.readFileSync(filePath, 'utf-8');

	const parser = new DOMParser();
	const document = parser.parseFromString(fileContent);
	return xpath(document, xpathQuery);
}

/**
 * Gets the text from the first element matching the XPath query in the given XML file.
 * This gets the first text node in the first matched element, so will not retrieve the full text
 * if there are multiple matched elements or if the matched element contains other nodes within it.
 *
 * @param {string} filePath - The path to the XML document to search
 * @param {string} xpathQuery - The XPath query identifying the element to match
 * @returns {string} The text content of the matched element
 * @throws {TypeError} There is no element matching the query
 */
function getElementText(filePath, xpathQuery) {
	const elements = getMatchingNodes(filePath, xpathQuery);
	const textNode = elements[0].firstChild || { data: null };
	return textNode.data;
}

/**
 * Gets the value of the first attribute matching the XPath query in the given XML file.
 *
 * @param {string} filePath - The path to the XML document to search
 * @param {string} xpathQuery - The XPath query identifying the attribute to match
 * @returns {string} The value of the matched attribute
 * @throws {TypeError} There is no attribute matching the query
 */
function getAttributeValue(filePath, xpathQuery) {
	const attributes = getMatchingNodes(filePath, xpathQuery);
	return attributes[0].value;
}

module.exports = {
	getMatchingNodes,
	getElementText,
	getAttributeValue,
};
