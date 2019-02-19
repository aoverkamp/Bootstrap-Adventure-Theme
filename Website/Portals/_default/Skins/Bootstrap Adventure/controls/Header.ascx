<%@ Register TagPrefix="dnn" TagName="Logo" Src="~/Admin/Skins/logo.ascx" %>
<%@ Register TagPrefix="dnn" TagName="Login" Src="~/Admin/Skins/login.ascx" %>
<%@ Register TagPrefix="dnn" TagName="User" Src="~/Admin/Skins/user.ascx" %>
<%@ Register TagPrefix="dnn" TagName="MENU" src="~/DesktopModules/DDRMenu/Menu.ascx" %>
<%@ Register TagPrefix="dnn" Namespace="DotNetNuke.Web.DDRMenu.TemplateEngine" Assembly="DotNetNuke.Web.DDRMenu" %>
<%@ Register TagPrefix="dnn" TagName="Search" Src="~/Admin/Skins/search.ascx" %>

<header class="site--header">
    <div class="header--top-navbar">
        
        <div class="container navbar--utility-items">
            <div class="form-inline my-2 my-md-0 header--search header--search__top">
                <dnn:Search runat="server" id="dnnSearch" ShowSite="false" ShowWeb="false" SiteText="Search" UseWebForSite="false" UseDropDownList="false" />
            </div>
            <div class="user-links">
                <ul>
                    <li class="user-links--login"><i class="material-icons">lock</i><dnn:Login runat="server" id="dnnLogin" /></li>
                    <li class="user-links--user"><i class="material-icons">person</i><dnn:User runat="server" id="dnnUser" /></li>
                </ul>
            </div>
            
        </div>
    </div>
    <div class="header--brand">
        <div class="container">
            
        </div>
    </div>
    <div class="header--quick-navbar">
        <div class="container">
            <div class="row">
                <div class="col-12 col-md-3 logo d-flex align-items-center justify-content-center">
                    <dnn:Logo runat="server" />
                </div>
                <div class="col-12 col-md-9 nav-wrap d-flex align-items-center justify-content-center">
                    <nav class="navbar navbar-expand-lg navbar-light bg-light">
                        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExample09" aria-controls="navbarsExample09" aria-expanded="false" aria-label="Toggle navigation">
                            <span class="navbar-toggler-icon"></span>
                        </button>

                        <div class="collapse navbar-collapse" id="navbarsExample09">
                            <dnn:MENU runat="server" MenuStyle="menus/BootstrapNav" />
                            
                        </div>
                    </nav>
                </div>
            </div>
        </div>
    </div>
</header>
