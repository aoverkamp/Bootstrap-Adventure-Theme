using System.Globalization;
using System.Reflection;
using System.Threading.Tasks;

public class Startup
{
    public async Task<object> Invoke(string assemblyPath)
    {
        var assemblyName = AssemblyName.GetAssemblyName(assemblyPath);
        var assemblyVersion = assemblyName.Version;
        return string.Format(
            CultureInfo.InvariantCulture,
            "{0:00}.{1:00}.{2:00}",
            assemblyVersion.Major,
            assemblyVersion.Minor,
            assemblyVersion.Build);
    }
}
