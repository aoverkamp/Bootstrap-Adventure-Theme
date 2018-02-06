<%@ Control Language="C#" AutoEventWireup="false" Inherits="DotNetNuke.UI.Skins.Skin" %>
<%@ Register TagPrefix="bootstrapAdventure" TagName="CommonResources" src="controls/CommonResources.ascx" %>
<%@ Register TagPrefix="bootstrapAdventure" TagName="Header" src="controls/Header.ascx" %>
<%@ Register TagPrefix="dnn" TagName="Breadcrumb" Src="~/Admin/Skins/breadcrumb.ascx" %>
<%@ Register TagPrefix="dnn" TagName="MENU" src="~/DesktopModules/DDRMenu/Menu.ascx" %>
<%@ Register TagPrefix="dnn" Namespace="DotNetNuke.Web.DDRMenu.TemplateEngine" Assembly="DotNetNuke.Web.DDRMenu" %>
<%@ Register TagPrefix="bootstrapAdventure" TagName="Footer" src="controls/Footer.ascx" %>

<bootstrapAdventure:CommonResources runat="server" />

<div class="bootstrap-adventure bootstrap-adventure__detail">
    <bootstrapAdventure:Header runat="server" />
    <main role="main" class="site--main">
        <div runat="server" id="Banner" class="pane pane__banner"></div>
        <div class="container">
            <nav class="breadcrumb"><small><dnn:Breadcrumb runat="server" id="dnnBreadcrumb" Separator="|"  /></small></nav>
            <div class="row">
                <div class="col-md-3">
                    <nav class="interior--nav">
                        <h2>Quick Links</h2>
                        <dnn:MENU runat="server" MenuStyle="menus/RazorNav" NodeSelector="RootChildren" />
                    </nav>
                    <div runat="server" id="Sidebar" class="pane pane__sidebar"></div>
                </div>
                <div class="col-md-8 offset-md-1">
                    <div runat="server" id="PromoTop" class="pane pane__promo-top"></div>
                    <div class="row">
                        <div runat="server" id="TwoCol1" class="col-sm pane pane__two-col-1"></div>
                        <div runat="server" id="TwoCol2" class="col-sm pane pane__two-col-2"></div>
                    </div>
                    <div runat="server" id="ContentPane" class="pane pane__contentpane"></div>
                </div>
            </div>
        </div>
        <div runat="server" id="Promo" class="pane pane__promo"></div>
        <div class="container">
            <div runat="server" id="Fullwidth" class="pane pane__full"></div>
        </div>
    </main>
    <bootstrapAdventure:Footer runat="server" />
</div>
