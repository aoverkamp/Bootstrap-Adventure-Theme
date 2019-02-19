<%@ Control Language="C#" AutoEventWireup="false" Inherits="DotNetNuke.UI.Skins.Skin" %>
<%@ Register TagPrefix="bootstrapAdventure" TagName="CommonResources" src="controls/CommonResources.ascx" %>
<%@ Register TagPrefix="bootstrapAdventure" TagName="Header" src="controls/Header.ascx" %>
<%@ Register TagPrefix="dnn" TagName="Breadcrumb" Src="~/Admin/Skins/breadcrumb.ascx" %>
<%@ Register TagPrefix="bootstrapAdventure" TagName="Footer" src="controls/Footer.ascx" %>

<bootstrapAdventure:CommonResources runat="server" />

<div class="bootstrap-adventure bootstrap-adventure__edit">
    <bootstrapAdventure:Header runat="server" />
    <main role="main" class="site--main">
        <div class="container">
            <nav class="breadcrumb"><small><dnn:Breadcrumb runat="server" id="dnnBreadcrumb" /></small></nav>
            <div runat="server" id="ContentPane" class="pane pane__contentpane"></div>
        </div>
    </main>
    <bootstrapAdventure:Footer runat="server" />
</div>
