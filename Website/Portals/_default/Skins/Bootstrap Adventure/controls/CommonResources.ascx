<%@ Import Namespace="DotNetNuke.Web.Client" %>
<%@ Register TagPrefix="dnn" TagName="Meta" Src="~/Admin/Skins/Meta.ascx" %>
<%@ Register TagPrefix="dnn" TagName="jQuery" Src="~/Admin/Skins/jQuery.ascx" %>
<%@ Register TagPrefix="dnn" TagName="JavaScriptLibraryInclude" Src="~/Admin/Skins/JavaScriptLibraryInclude.ascx" %>
<%@ Register TagPrefix="dnn" Namespace="DotNetNuke.Web.Client.ClientResourceManagement" Assembly="DotNetNuke.Web.Client" %>
<%@ Register TagPrefix="bootstrapAdventure" TagName="SVG" src="SVG.ascx" %>

<dnn:META runat="server" Name="viewport" Content="width=device-width,initial-scale=1" />

<%-- Fonts & Icons --%>
<dnn:DnnCssInclude runat="server" FilePath="https://fonts.googleapis.com/css?family=Crete+Round|Open+Sans" />
<%--<dnn:DnnCssInclude runat="server" FilePath="https://fonts.googleapis.com/icon?family=Material+Icons" />--%>

<%-- Libraries --%>
<dnn:jQuery runat="server" />
<dnn:JavaScriptLibraryInclude runat="server" Name="html5shiv" Version="3.7.3" SpecificVersion="LatestMajor" />
<dnn:JavaScriptLibraryInclude runat="server" Name="respond-minmax" Version="1.4.2" SpecificVersion="LatestMajor" />

<%-- Bootstrap4 --%>
<dnn:DnnCssInclude runat="server" FilePath="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" Priority="<%#FileOrder.Css.DefaultCss + 1%>" />
<dnn:DnnJsInclude runat="server" FilePath="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" ForceProvider="DnnFormBottomProvider"  />
<dnn:DnnJsInclude runat="server" FilePath="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" ForceProvider="DnnFormBottomProvider" />

<%-- Custom Scripts --%>
<%--<dnn:DnnJsInclude runat="server" FilePath="js/theme.min.js" PathNameAlias="SkinPath" ForceProvider="DnnFormBottomProvider" />--%>

<%-- SVG --%>
<bootstrapAdventure:SVG runat="server" />
