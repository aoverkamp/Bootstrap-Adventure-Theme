<%@ Control Language="C#" AutoEventWireup="false" Inherits="Engage.Dnn.Framework.SkinControlBase" %>
<%@ Register TagPrefix="dnn" TagName="Logo" Src="~/Admin/Skins/logo.ascx" %>
<%@ Register TagPrefix="dnn" TagName="Login" Src="~/Admin/Skins/login.ascx" %>
<%@ Register TagPrefix="dnn" TagName="User" Src="~/Admin/Skins/user.ascx" %>
<%@ Register TagPrefix="dnn" TagName="MENU" src="~/DesktopModules/DDRMenu/Menu.ascx" %>
<%@ Register TagPrefix="dnn" Namespace="DotNetNuke.Web.DDRMenu.TemplateEngine" Assembly="DotNetNuke.Web.DDRMenu" %>
<%@ Register TagPrefix="dnn" TagName="Search" Src="~/Admin/Skins/search.ascx" %>

<header class="site--header">
    <div class="header--top-navbar">
        <nav class="navbar navbar-dark bg-dark">
            <div class="navbar-brand">Welcome to Adventure!</div>
            <button class="navbar-toggler collapsed" type="button" data-toggle="collapse" data-target="#navbarsExample01" aria-controls="navbarsExample01" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="navbar-collapse collapse" id="navbarsExample01" style="">
                <dnn:MENU runat="server" MenuStyle="menus/BootstrapNav" />
                <div class="navbar--utility-items">
                    <div class="user-links">
                        <ul>
                            <li class="user-links--login"><dnn:Login runat="server" id="dnnLogin" /></li>
                            <li class="user-links--user"><dnn:User runat="server" id="dnnUser" /></li>
                        </ul>
                    </div>
                    <div class="form-inline my-2 my-md-0 header--search header--search__top">
                        <dnn:Search runat="server" id="dnnSearch" ShowSite="false" ShowWeb="false" SiteText="Search" UseWebForSite="false" UseDropDownList="false" />
                    </div>
                </div>
            </div>
        </nav>
    </div>
    <div class="header--brand">
        <div class="container">
            <dnn:Logo runat="server" />
        </div>
    </div>
    <div class="header--quick-navbar">
        <div class="container">
            <nav class="navbar navbar-expand-lg navbar-light bg-light rounded">
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExample09" aria-controls="navbarsExample09" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarsExample09">
                    <dnn:MENU runat="server" MenuStyle="menus/BootstrapNav" />
                    <div class="form-inline my-2 my-md-0 header--search header--search__quick">
                        <dnn:Search runat="server" id="dnnSearch2" ShowSite="false" ShowWeb="false" SiteText="Search" UseWebForSite="false" UseDropDownList="false" />
                    </div>
                </div>
            </nav>
        </div>
    </div>
</header>
