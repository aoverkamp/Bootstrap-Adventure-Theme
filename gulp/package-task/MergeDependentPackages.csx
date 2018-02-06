#r "System.Xml.dll"
#r "System.Xml.Linq.dll"

using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Linq;
using System.Xml.XPath;

public class Startup
{
    private const string Debug = "debug";
    private const string Warn = "warn";

    public async Task<object> Invoke(object[] arguments)
    {
        try
        {
            var manifestContent = (string)arguments[0];
            var packagesDirectoryPath = (string)arguments[1];

            var packagesDirectory = new DirectoryInfo(packagesDirectoryPath);
            if (!packagesDirectory.Exists)
            {
                throw new DirectoryNotFoundException(string.Format(CultureInfo.CurrentCulture, "Packages directory {0} does not exist", packagesDirectoryPath));
            }

            dynamic result = MergeDependentPackages(XDocument.Parse(manifestContent), packagesDirectory);
            return new {
                updatedManifestContents = result.manifest.ToString(SaveOptions.OmitDuplicateNamespaces),
                dependencyFiles = Enumerable.ToArray(result.dependencyFiles),
                dependencyPackages = Enumerable.ToArray(result.dependencyPackages),
                logs = Enumerable.ToArray(result.logs),
            };
        }
        catch (Exception exc) {
            return new {
                logs = this.Log(Enumerable.Empty<object>(), "error", exc.ToString()),
            };
        }
    }

    private IEnumerable<object> Log(IEnumerable<object> logs, string level, string messageFormat, params object[] arguments)
    {
        var message = string.Format(CultureInfo.CurrentCulture, messageFormat, arguments);
        return logs.Append(new { level, message, });
    }

    private dynamic MergeDependentPackages(XDocument manifest, DirectoryInfo packagesDir)
    {
        var logs = Enumerable.Empty<object>();
        var dependencyFiles = Enumerable.Empty<string>();
        var dependencyPackages = Enumerable.Empty<string>();

        var dependencyCount = 0;
        dynamic localDependencyResults = GetLocalDependencies(manifest, packagesDir);
        logs = localDependencyResults.logs;
        XElement packagesElement = localDependencyResults.packagesElement;
        foreach (DirectoryInfo dependencyDirectory in localDependencyResults.localDependencies)
        {
            dynamic mergeResult = MergeDependency(packagesElement, dependencyDirectory, packagesDir);
            logs = logs.Concat((IEnumerable<object>)mergeResult.logs);
            dependencyFiles = dependencyFiles.Concat((IEnumerable<string>)mergeResult.dependencyFiles);
            dependencyPackages = dependencyPackages.Concat((IEnumerable<string>)mergeResult.dependencyPackages);

            dependencyCount++;
        }

        logs = this.Log(logs, Debug, "Merged {0} package{1} into manifest", dependencyCount, dependencyCount == 1 ? string.Empty : "s");

        return new {
            manifest,
            dependencyFiles,
            dependencyPackages,
            logs,
        };
    }

    private dynamic GetLocalDependencies(XDocument manifest, DirectoryInfo packagesDir)
    {
        var logs = Enumerable.Empty<object>();
        logs = this.Log(logs, Debug, "manifest '{0}'", manifest);
        logs = this.Log(logs, Debug, "packagesDir '{0}'", packagesDir.FullName);

        var localDependencies = Enumerable.Empty<DirectoryInfo>();
        var packagesElement = manifest.Element("dotnetnuke").Element("packages");
        var dependenciesElement = packagesElement.Element("package").Element("dependencies");
        if (dependenciesElement == null) {
            logs = this.Log(logs, Warn, "No dependencies in manifest to merge");
            return new {
                localDependencies,
                packagesElement,
                logs,
            };
        }

        var dependencies = (from dependency in dependenciesElement.Elements("dependency")
                            let type = dependency.Attribute("type").Value
                            where type == "package" || type == "managedPackage"
                            let versionAttr = dependency.Attribute("version")
                            select new {
                                Name = dependency.Value,
                                Version = versionAttr == null ? null : new Version(versionAttr.Value),
                            }).ToArray();

        var packageDirectories = packagesDir.GetDirectories();
        foreach (var dependency in dependencies)
        {
            logs = this.Log(logs, Debug, "Processing '{0}' version {1}", dependency.Name, dependency.Version);
            var dependencyDirectories = packageDirectories.Where(dir => dir.Name.StartsWith(dependency.Name + '_', StringComparison.OrdinalIgnoreCase))
                                                          .Select(dir => new { Directory = dir, Version = new Version(dir.Name.Substring(dir.Name.LastIndexOf('_') + 1)), })
                                                          .OrderByDescending(dir => dir.Version)
                                                          .ToArray();
            if (dependencyDirectories.Length == 0)
            {
                logs = this.Log(logs, Warn, "No matching directories for '{0}' version {1}", dependency.Name, dependency.Version);
                continue;
            }

            var dependencyDirectory = dependencyDirectories.FirstOrDefault(d => d.Version == dependency.Version)
                                      ?? dependencyDirectories.First();
            localDependencies = localDependencies.Append(dependencyDirectory.Directory);
        }

        return new {
            localDependencies,
            packagesElement,
            logs,
        };
    }

    private dynamic MergeDependency(XElement packagesElement, DirectoryInfo dependencyDirectory, DirectoryInfo packagesDir)
    {
        var logs = Enumerable.Empty<object>();
        var dependencyFiles = Enumerable.Empty<string>();
        var dependencyPackages = Enumerable.Empty<string>();

        var dependencySubdirectories = dependencyDirectory.EnumerateDirectories();
        dependencySubdirectories = dependencySubdirectories.Append(dependencyDirectory);
        foreach (var dependencyFile in dependencySubdirectories.SelectMany(dir => dir.EnumerateFiles()))
        {
            if (dependencyFile.Extension.Equals(".dnn", StringComparison.OrdinalIgnoreCase))
            {
                logs = logs.Concat((IEnumerable<object>)this.MergeManifests(packagesElement, dependencyFile, packagesDir));

                dynamic localDependencyResults = GetLocalDependencies(XDocument.Load(dependencyFile.FullName), packagesDir);
                logs = logs.Concat((IEnumerable<object>)localDependencyResults.logs);

                IEnumerable<DirectoryInfo> localDependencies = localDependencyResults.localDependencies;
                logs = this.Log(logs, Debug, "{0} local dependencies in '{1}'", localDependencies.Count(), dependencyFile.FullName);
                dependencyPackages = dependencyPackages.Concat(localDependencies.Select(dir => dir.FullName));
            }
            else
            {
                dependencyFiles = dependencyFiles.Append(dependencyFile.FullName);
            }
        }

        return new {
            logs,
            dependencyFiles,
            dependencyPackages,
        };
    }

    private IEnumerable<object> MergeManifests(XElement packagesElement, FileInfo dependencyManifestFile, DirectoryInfo packagesDir)
    {
        var logs = Enumerable.Empty<object>();
        var dependencyManifest = XDocument.Load(dependencyManifestFile.FullName);
        foreach (XAttribute srcAttribute in (IEnumerable)dependencyManifest.XPathEvaluate(@"//@src"))
        {
            var src = Path.Combine(dependencyManifestFile.Directory.Name, srcAttribute.Value);
            logs = this.Log(logs, Debug, "Updating src from '{0}' to '{1}'", srcAttribute.Value, src);
            srcAttribute.Value = src;
        }

        foreach (XElement fileElement in (IEnumerable)dependencyManifest.XPathEvaluate(@"//*[substring(local-name(), string-length(local-name()) - 3) = 'file' or substring(local-name(), string-length(local-name()) - 3) = 'File']"))
        {
            var nameElement = fileElement.Element("name");
            if (nameElement == null)
            {
                logs = this.Log(logs, Debug, "Skipping {0}", fileElement);
                continue;
            }

            string sourceFileName;
            var sourceFileNameElement = fileElement.Element("sourceFileName");
            if (sourceFileNameElement == null)
            {
                sourceFileName = nameElement.Value;
                sourceFileNameElement = new XElement("sourceFileName");
                fileElement.Add(sourceFileNameElement);
            } else {
                sourceFileName = sourceFileNameElement.Value;
            }

            sourceFileNameElement.Value = Path.Combine(dependencyManifestFile.Directory.Name, sourceFileName);
        }

        var packageElement = dependencyManifest.Element("dotnetnuke").Element("packages").Element("package");
        packageElement.SetAttributeValue("dependentPackage", "true");
        var packageName = packageElement.Attribute("name").Value;
        packagesElement.Element("package")
                       .Element("dependencies")
                       .Elements("dependency")
                       .Single(d => d.Value.Equals(packageName, StringComparison.OrdinalIgnoreCase))
                       .Remove();
        packagesElement.Add(packageElement);

        return logs;
    }
}

internal static class Extensions
{
    public static IEnumerable<T> Prepend<T>(this IEnumerable<T> sequence, T newItem)
    {
        yield return newItem;
        foreach (var item in sequence)
        {
            yield return item;
        }
    }

    public static IEnumerable<T> Append<T>(this IEnumerable<T> sequence, T newItem)
    {
        foreach (var item in sequence)
        {
            yield return item;
        }

        yield return newItem;
    }
}
