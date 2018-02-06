using System;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

public class Startup
{
    private static readonly Regex projectRegex = new Regex(@"Project\(.*""([^""]+\.(?:cs|vb|fs)proj)""", RegexOptions.Compiled | RegexOptions.CultureInvariant);

    public async Task<object> Invoke(string solutionFilePath)
    {
        var solutionFile = new FileInfo(solutionFilePath);
        if (!solutionFile.Exists)
        {
            throw new FileNotFoundException(string.Format(CultureInfo.CurrentCulture, "Solution file {0} does not exist", solutionFilePath));
        }

        var solutionDirectory = Path.GetDirectoryName(solutionFile.FullName);
        return from Match projectMatch in projectRegex.Matches(File.ReadAllText(solutionFile.FullName))
               let projectName = projectMatch.Groups[1].Value
               where !Path.GetFileNameWithoutExtension(projectName).EndsWith("Tests")
               select Path.GetFullPath(!Path.IsPathRooted(projectName) ? Path.Combine(solutionDirectory, projectName) : projectName);
    }
}
