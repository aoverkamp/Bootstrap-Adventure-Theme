/* eslint-env node*/
'use strict';

const path = require('path');
const _ = require('lodash');
const through2 = require('through2');
const Vinyl = require('vinyl');
const vinylFile = require('vinyl-file');
const edge = require('edge-js');
const { getFirstMatchingFile, log } = require('../utility');
const { getAttributeValue } = require('./xpath-helpers');
const { getVersionFromAssembly } = require('./assembly-helpers');

const mergeDependentPackagesImpl = edge.func(
	path.join(__dirname, 'MergeDependentPackages.csx')
);

/**
 * A message to log
 * @typedef {Object} LogMessage
 * @property {string} level - The name of the gulplog function to call to log the message
 * @property {string} message - The message to log
 */
/**
 * The result of calling {@link mergeDependentPackages}
 * @typedef {Object} MergeDependentPackagesResult
 * @property {string} updatedManifestContents - The contents of the manifest file, updated to include the merged dependencies
 * @property {string[]} dependencyFiles - An array of files from the dependencies, which now need to be added to the package
 * @property {string[]} dependencyPackages - An array of names of packages from the dependencies, which now need to be added to the package
 * @property {LogMessage[]} logs - An array of messages to log from the merge process
 */
/**
 * Calls a C# function which converts a given manifest into one which has its dependencies merged into it
 * @private
 * @param {string} manifestContents - The contents of the manifest file
 * @param {string} packagesDirectoryPath - The path to the directory where dependency packages can be found
 * @returns {MergeDependentPackagesResult} The result of the call
 */
function mergeDependentPackages(manifestContents, packagesDirectoryPath) {
	return mergeDependentPackagesImpl(
		[manifestContents, packagesDirectoryPath],
		true
	);
}

const packagesDirectoryPath = path.join(
	process.cwd(),
	'node_modules/engage-dnn-javascript-libraries'
);

/**
 * Converts a file path into a Vinyl file
 *
 * @param {string} file - The path to the file
 * @returns {Promise} A Promise which, when resolved, will be a Vinyl representation of the given file
 */
function readAsVinylFile(file) {
	return vinylFile.read(file, { base: packagesDirectoryPath });
}

function getResponseFileName(response) {
	if (
		!response ||
		!response.headers ||
		!response.headers['content-disposition']
	) {
		return '';
	}

	const fileNameIndex = response.headers['content-disposition'].indexOf(
		'filename='
	);
	if (fileNameIndex === -1) {
		return '';
	}

	return response.headers['content-disposition'].substring(
		fileNameIndex + 'filename='.length
	);
}

module.exports = {
	/**
     * A stream transformation (i.e. Gulp plugin) which adds files to the stream,
     * based on the dependencyFiles property added to the manifest file previously in the stream
     *
     * @returns {Function} A function which performs the stream transformation
     */
	addDependencyFiles() {
		return through2.obj(function transformStream(file, enc, cb) {
			this.push(file);

			if (!file.dependencyFiles) {
				log.debug('%s does not have dependencyFiles', file.path);
				cb();
				return;
			}

			log.debug(
				'%s has %d dependencyFiles',
				file.path,
				file.dependencyFiles.length
			);

			const vinylDependencyFilePromises = _(file.dependencyFiles).map(
				readAsVinylFile
			);
			Promise.all(vinylDependencyFilePromises).then(
				([...dependencyFiles]) => {
					_(dependencyFiles).each(dependencyFile =>
						this.push(dependencyFile)
					);
					cb();
				},
				err => {
					throw err;
				}
			);
		});
	},

	/**
     * A stream transformation (i.e. Gulp plugin) which replaces the files in
     * the stream with the packages referenced by the dependencyPackages
     * property added to the manifest file previously in the stream
     *
     * @returns {Function} A function which performs the stream transformation
     */
	getDependencyPackages() {
		return through2.obj(function transformStream(file, enc, cb) {
			if (!file.dependencyPackages) {
				log.debug('%s does not have dependencyPackages', file.path);
				cb();
				return;
			}

			log.debug(
				'%s has %d dependencyPackages',
				file.path,
				file.dependencyPackages.length
			);

			const GitHubApi = require('github');
			const github = new GitHubApi();
			file.dependencyPackages.forEach(packagePath =>
				log.debug('packagePath', packagePath)
			);
			const packageTags = file.dependencyPackages.map(packagePath =>
				path.basename(packagePath)
			);
			packageTags.forEach(tag => log.debug('tag', tag));
			const releasePromises = packageTags.map(tag =>
				github.repos
					.getReleaseByTag({
						owner: 'engagesoftware',
						repo: 'DNN-JavaScript-Libraries',
						tag,
					})
					.catch(err => {
						// probably tag doesn't exist
						log.debug('Error retrieving release package', err);
					})
			);

			log.debug('fetching tags for %d packages', releasePromises.length);

			Promise.all(releasePromises)
				.then(releases => {
					const releaseAssetPromises = _(releases)
						.filter(release => release !== undefined)
						.filter(({ data: { name, assets } }) => {
							if (assets.length === 0) {
								log.warn('No assets for release %s', name);
								return false;
							}

							return true;
						})
						.map(({ data: { assets } }) =>
							new Promise((resolve, reject) =>
								require('request').get(
									{
										url: assets[0].browser_download_url,
										encoding: null,
									},
									(error, response, body) =>
										error
											? reject(error)
											: resolve({ response, body })
								)
							).then(({ response, body }) => {
								log.debug('asset response length', body.length);

								const responseFileName = getResponseFileName(
									response
								);
								log.debug(
									'asset response filename',
									responseFileName
								);
								return new Vinyl({
									contents: body,
									path: responseFileName,
								});
							})
						);

					return Promise.all(releaseAssetPromises);
				})
				.then(assets => assets.map(asset => this.push(asset)))
				.then(() => cb())
				.catch(err => {
					cb(err);
				});
		});
	},

	/**
     * A stream transformation (i.e. Gulp plugin) which expects a DNN manifest file
     * and merges any available dependent packages into the manifest.
     * Any files required by those merged packages will be added to a new dependencyFiles
     * property on the manifest file (i.e. on the Vinyl file representing the manifest in the stream)
     *
     * @returns {Function} A function which performs the stream transformation
     */
	mergeDependenciesIntoManifest() {
		return through2.obj(function transformStream(manifest, enc, cb) {
			const mergeResults = mergeDependentPackages(
				manifest.contents.toString(),
				packagesDirectoryPath
			);
			const {
				updatedManifestContents,
				dependencyFiles,
				dependencyPackages,
				logs,
			} = mergeResults;

			_(logs)
				.chain()
				.each(({ level, message }) => log[level](message))
				.filter(({ level }) => level === 'error')
				.each(({ message }) => {
					throw new Error(message);
				})
				.commit();
			log.debug({
				updatedManifestContents,
				dependencyFiles,
				dependencyPackages,
			});

			manifest.contents = Buffer.from(updatedManifestContents);
			manifest.dependencyFiles = dependencyFiles;
			manifest.dependencyPackages = dependencyPackages;

			this.push(manifest);
			cb();
		});
	},

	/**
     * Gets the version number of the DNN manifest associated with the given project
     *
     * @param {Project} project - The gulp project
     * @param {Object} args - The common gulp task arguments
     * @returns {string} The version number from the first package in the manifest file
     * @throws The project does not have an associated DNN manifest file
     * @throws The project has multiple associated DNN manifest file
     */
	getVersionFromManifest(project, args) {
		const manifestFile = getFirstMatchingFile(
			project.packageManifestGlobs,
			args,
			{
				noFilesErrorMessage:
					'Invalid project found, without DNN manifest file',
				multipleFilesErrorMessage:
					'Multiple DNN manifests found in project, unable to continue packaging',
			}
		);

		return getAttributeValue(
			manifestFile,
			'/dotnetnuke/packages/package/@version'
		);
	},

	/**
     * A replacement in an XML file
     * @typedef {Object} XmlPokeReplacement
     * @property {string} xpath - The XPath query identifying the nodes to update
     * @property {string} value - The new value of the node
     * @property {string} [valueType=text] - The type of the value property, one of text, element, remove, or append
     */
	/**
     * Creates an array of replacements to pass to the xmlpoke gulp plugin for the DNN manifest file
     *
     * @param {any} version - The version number of the project, set in the manifest anywhere that a version attribute has a value of @latestVersion
     * @param {any} releaseNotesFile - The path to the release notes file
     * @param {any} assemblies - An array of assembly paths, to add to the assemblies component(s) in the manifest
     * @param {any} platformVersion - The version number of DNN Platform that this project supports
     * @returns {XmlPokeReplacement[]} An array of replacements
     */
	makeManifestReplacements(
		version,
		releaseNotesFile,
		assemblies,
		platformVersion
	) {
		const versionReplacement = {
			xpath: '//*[@version="@latestVersion"]/@version',
			value: version,
		};
		const releaseNotesReplacement = {
			xpath: '/dotnetnuke/packages/package/releaseNotes/@src',
			value: releaseNotesFile
				? path.basename(releaseNotesFile)
				: undefined,
		};
		const assemblyReplacements = assemblies.map(assemblyPath => {
			const assemblyName = path.basename(assemblyPath);
			const assemblyVersion = getVersionFromAssembly(assemblyPath);
			return {
				xpath:
					'/dotnetnuke/packages/package/components/component[@type="Assembly"]/assemblies',
				value: `
                <assembly>
                    <path>bin</path>
                    <name>${assemblyName}</name>
                    <version>${assemblyVersion}</version>
                </assembly>`,
				valueType: 'append',
			};
		});
		const platformVersionReplacement = !platformVersion
			? undefined
			: {
					xpath:
						'/dotnetnuke/packages/package/dependencies/dependency[@type="CoreVersion"]',
					value: platformVersion,
				};

		const replacements = [
			versionReplacement,
			releaseNotesReplacement,
		].concat(assemblyReplacements);
		if (!platformVersionReplacement) {
			return replacements;
		}

		return replacements.concat(platformVersionReplacement);
	},
};
