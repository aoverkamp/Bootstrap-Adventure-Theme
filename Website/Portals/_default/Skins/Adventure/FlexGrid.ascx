<%@ Control Language="C#" AutoEventWireup="false" Inherits="DotNetNuke.UI.Skins.Skin" %>
<%@ Register TagPrefix="bootstrapAdventure" TagName="CommonResources" src="controls/CommonResources.ascx" %>
<%@ Register TagPrefix="bootstrapAdventure" TagName="HeaderAlt" src="controls/HeaderAlt.ascx" %>
<%@ Register TagPrefix="bootstrapAdventure" TagName="Footer" src="controls/Footer.ascx" %>

<bootstrapAdventure:CommonResources runat="server" />

<div class="bootstrap-adventure bootstrap-adventure__flexgrid">
    <bootstrapAdventure:HeaderAlt runat="server" />
    <main role="main" class="site--main">
        <div runat="server" id="Banner" class="pane pane__banner"></div>

        <div class="row row__grid row__grid-1">
            <div runat="server" id="GridRow1Col1" class="col-sm col-md-6 pane pane__three-col-1"></div>
            <div runat="server" id="GridRow1Col2" class="col-sm col-md-3 pane pane__three-col-2"></div>
            <div runat="server" id="GridRow1Col3" class="col-sm col-md-3 pane pane__three-col-3"></div>
        </div>

        <div class="row row__grid row__grid-2">
            <div runat="server" id="GridRow2Col1" class="col-sm col-md-3 pane pane__three-col-1"></div>
            <div runat="server" id="GridRow2Col2" class="col-sm col-md-6 pane pane__three-col-2"></div>
            <div runat="server" id="GridRow2Col3" class="col-sm col-md-3 pane pane__three-col-3"></div>
        </div>

        <div runat="server" id="ContentPane" class="pane pane__contentpane"></div>

    </main>
    <bootstrapAdventure:Footer runat="server" />
</div>
