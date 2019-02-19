<%@ Control Language="C#" AutoEventWireup="false" Inherits="DotNetNuke.UI.Skins.Skin" %>
<%@ Register TagPrefix="bootstrapAdventure" TagName="CommonResources" src="controls/CommonResources.ascx" %>
<%@ Register TagPrefix="bootstrapAdventure" TagName="Header" src="controls/Header.ascx" %>
<%@ Register TagPrefix="bootstrapAdventure" TagName="Footer" src="controls/Footer.ascx" %>

<bootstrapAdventure:CommonResources runat="server" />

<div class="bootstrap-adventure bootstrap-adventure__landing">
    <bootstrapAdventure:Header runat="server" />
    <main role="main" class="site--main">
        <div runat="server" id="Banner" class="pane pane__banner"></div>
        <div class="container">
            <div runat="server" id="PromoTop" class="pane pane__promo-top"></div>
            <div class="row">
                <div runat="server" id="TwoCol1" class="col-sm pane pane__two-col-1"></div>
                <div runat="server" id="TwoCol2" class="col-sm pane pane__two-col-2"></div>
            </div>
            <div runat="server" id="ContentPane" class="pane pane__contentpane"></div>
        </div>
        <div runat="server" id="Promo" class="pane pane__promo"></div>
        <div class="container">
            <div runat="server" id="Fullwidth" class="pane pane__full"></div>
        </div>
    </main>
    <bootstrapAdventure:Footer runat="server" />
</div>
