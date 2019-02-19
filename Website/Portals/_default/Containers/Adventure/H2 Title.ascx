<%@ Control language="C#" AutoEventWireup="false" Explicit="True" Inherits="DotNetNuke.UI.Containers.Container" %>
<%@ Register TagPrefix="dnn" TagName="Title" Src="~/Admin/Containers/title.ascx" %>

<div class="module-container">
	<h2 class="module-container--heading"><dnn:Title runat="server" /></h2>
	<div runat="server" id="ContentPane" class="module-container--body" ></div>
</div>
