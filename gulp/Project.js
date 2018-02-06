/* eslint-env node*/
'use strict';

const path = require('path');

const projectTypes = {
	module: 'module',
	theme: 'theme',
	containers: 'containers',
	'2sxc': '2sxc',
	other: 'other',
};

const Project = class Project {
	constructor(name, projectPath, projectType) {
		this.name = name;
		this.path = projectPath;
		this.projectType = projectType;

		const isModuleProject = this.projectType === projectTypes.module;

		this.imageExtensions = ['jpg', 'gif', 'png', 'svg'];
		this.imageFileGlobs = this.imageExtensions.map(ext =>
			path.join(projectPath, `**/*.${ext}`)
		);

		const defaultStylesDirPath = isModuleProject
			? projectPath
			: path.join(projectPath, 'styles/');
		this.stylesDirPath = defaultStylesDirPath;
		this.stylesOutputDirPath = projectPath;
		this.lessFilesGlobs = [path.join(this.stylesDirPath, '**/*.less')];
		this.lessEntryFilesGlobs = isModuleProject
			? [path.join(this.stylesDirPath, '**/module.less')]
			: [
					path.join(this.stylesDirPath, 'skin.less'),
					path.join(this.stylesDirPath, 'standalone/*.less'),
				];

		this.viewFilesGlobs = [
			path.join(projectPath, '**/*.ascx'),
			path.join(projectPath, '**/*.aspx'),
			path.join(projectPath, '**/*.cshtml'),
			path.join(projectPath, '**/*.vbhtml'),
			path.join(projectPath, '**/*.html'),
			path.join(projectPath, '**/*.htm'),
		];
		this.solutionFilesGlobs = [path.join(projectPath, '**/*.sln')];
		this.nugetPackagesFilesGlobs = [
			path.join(projectPath, '**/packages.config'),
		];
		this.nugetConfigFilesGlobs = [
			path.join(projectPath, '**/nuget.config'),
		];
		this.nugetPackagesDirPath = path.join(projectPath, './packages');
		if (isModuleProject) {
			const testProjectsGlob = path.join(
				projectPath,
				'**/*.Tests.csproj'
			);
			this.primaryProjectGlobs = [
				path.join(projectPath, '**/*.csproj'),
				`!${testProjectsGlob}`,
			];
			this.compilationOutputDirPath = 'Website/bin/';
		}

		const minifiedScriptsGlob = path.join(projectPath, '**/*.min.js');
		this.javaScriptEntryFilesGlobs = [
			path.join(projectPath, '**/main.mjs'),
		];
		this.javaScriptModuleFilesGlobs = [path.join(projectPath, '**/*.mjs')];
		this.javaScriptFilesGlobs = [
			path.join(projectPath, '**/*.js'),
			`!${minifiedScriptsGlob}`,
		];
		if (isModuleProject) {
			const testScriptsGlob = path.join(
				projectPath,
				'*.Tests/Scripts/**/*.js'
			);
			this.javaScriptFilesGlobs.push(`!${testScriptsGlob}`);
			const nugetScriptsGlob = path.join(projectPath, 'packages/**/*.js');
			this.javaScriptFilesGlobs.push(`!${nugetScriptsGlob}`);
		}

		this.elmEntryFilesGlobs = [path.join(projectPath, '**/Main.elm')];
		this.elmFilesGlobs = [path.join(projectPath, '**/*.elm')];
		this.elmTestFilesGlobs = [
			path.join(projectPath, '**/NodeTestRunner.elm'),
		];

		this.dependencyPackageOutputDirPath =
			'Website/Install/JavaScriptLibrary/';
		this.packageOutputDirPath =
			this.projectType === projectTypes.theme
				? 'Website/Install/Skin/'
				: this.projectType === projectTypes.containers
					? 'Website/Install/Container/'
					: 'Website/Install/Module/';

		this.packageManifestGlobs = [path.join(projectPath, '**/*.dnn')];
		this.packageReleaseNotesGlobs = [
			path.join(projectPath, '**/ReleaseNotes*.htm'),
		];

		const fontGlobs = [
			path.join(projectPath, '**/*.woff'),
			path.join(projectPath, '**/*.woff2'),
			path.join(projectPath, '**/*.ttf'),
			path.join(projectPath, '**/*.eot'),
			path.join(projectPath, '**/*.otf'),
		];
		const ignoreGlobs = [
			`!${path.join(projectPath, '**/bin/**')}`,
			`!${path.join(projectPath, '**/packages/**')}`,
			`!${path.join(projectPath, '**/Service References/**')}`,
			`!${path.join(projectPath, '**/_ReSharper.*/**')}`,
			`!${path.join(projectPath, '**/obj/**')}`,
			`!${path.join(projectPath, '**/.*')}`,
			`!${path.join(projectPath, '**/.*/**')}`,
		];

		if (this.projectType === projectTypes['2sxc']) {
			this.flattenPackageFiles = false;
			this.packageFilesGlobs = [
				minifiedScriptsGlob,
				path.join(projectPath, '**/*.resx'),
				path.join(projectPath, '**/*.xml'),
				path.join(projectPath, '**/*.css'),
			].concat(
				this.imageFileGlobs,
				this.viewFilesGlobs,
				fontGlobs,
				ignoreGlobs
			);

			this.packageResourcesGlobs = [];
		} else {
			this.flattenPackageFiles = true;
			this.packageFilesGlobs = [
				path.join(projectPath, '**/*.Cleanup.txt'),
				path.join(projectPath, '**/Readme.txt'),
				path.join(projectPath, '**/*.SqlDataProvider'),
				path.join(projectPath, '**/*.sql'),
			].concat(ignoreGlobs);

			this.packageResourcesGlobs = [
				minifiedScriptsGlob,
				path.join(projectPath, '**/*.asmx'),
				path.join(projectPath, '**/*.resx'),
				path.join(projectPath, '**/*.css'),
				path.join(projectPath, '**/*.pdf'),
				path.join(projectPath, '**/*.xml'),
				`!${path.join(projectPath, '**/CustomDictionary.xml')}`,
				`!${path.join(projectPath, '**/*.GhostDoc.xml')}`,
				path.join(projectPath, '**/*.xsd'),
				path.join(projectPath, '**/*.txt'),
				path.join(projectPath, '**/*.template'),
				path.join(projectPath, '**/*.json'),
				path.join(projectPath, '**/*.hbs'),
			].concat(
				this.imageFileGlobs,
				this.viewFilesGlobs,
				fontGlobs,
				ignoreGlobs,
				this.packageFilesGlobs
					.filter(glob => glob[0] !== '!')
					.map(glob => `!${glob}`),
				this.packageReleaseNotesGlobs
					.filter(glob => glob[0] !== '!')
					.map(glob => `!${glob}`)
			);
		}
	}
};

Project.projectTypes = projectTypes;

module.exports = Project;
