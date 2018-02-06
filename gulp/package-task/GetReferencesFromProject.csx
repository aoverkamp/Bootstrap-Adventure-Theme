#r "System.Xml.dll"
#r "System.Xml.Linq.dll"

using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Linq;

public class Startup
{
    public async Task<object> Invoke(object[] arguments)
    {
        var projectPath = (string)arguments[0];
        var includePrivateReferences = (bool)arguments[1];
        var project = new ProjectInfo(Path.GetDirectoryName(projectPath), XDocument.Load(projectPath));

        var selectors = new Func<ProjectInfo, IEnumerable<string>>[] { SelectProjectReferences(includePrivateReferences), SelectOutputAssemblies, };
        return (from selector in selectors
                from path in selector(project)
                select Path.GetFullPath(path))
               .Distinct()
               .ToArray();
    }

    private Func<ProjectInfo, IEnumerable<string>> SelectProjectReferences(bool includePrivateReferences)
    {
        return (project) => from reference in project.ProjectDocument.Descendants(project.RootNamespace + "Reference")
                            where includePrivateReferences || !reference.Descendants(project.RootNamespace + "Private").Any(p => p.Value.Equals("False", StringComparison.OrdinalIgnoreCase))
                            let hintPath = reference.Descendants(project.RootNamespace + "HintPath").SingleOrDefault()
                            where hintPath != null
                            select Path.Combine(project.ProjectDirectory, hintPath.Value);
    }

    private IEnumerable<string> SelectOutputAssemblies(ProjectInfo project)
    {
        var assemblyName = project.ProjectDocument.Descendants(project.RootNamespace + "AssemblyName").Single();
        var outputPathElement = project.ProjectDocument.Descendants(project.RootNamespace + "OutputPath").Single(elem => elem.Parent.Attributes().All(a => a.Name != "Condition" || a.Value.Contains("Release")));
        var outputAssemblyPath = Path.Combine(project.ProjectDirectory, outputPathElement.Value, assemblyName.Value + ".dll");
        return Enumerable.Repeat(outputAssemblyPath, 1);
    }

    private class ProjectInfo
    {
        public ProjectInfo(string projectDirectory, XDocument projectDocument)
        {
            this.ProjectDirectory = projectDirectory;
            this.ProjectDocument = projectDocument;
        }

        public string ProjectDirectory { get; private set; }
        public XDocument ProjectDocument { get; private set; }
        public XNamespace RootNamespace
        {
            get { return this.ProjectDocument.Root.Name.Namespace; }
        }
    }
}
