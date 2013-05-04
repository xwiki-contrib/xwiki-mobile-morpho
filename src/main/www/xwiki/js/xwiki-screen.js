/*
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */

/*
 XWiki communication and pages display
 */

// id, name, xem, wikis, baseurl, resturl, viewurl, apps, username, password
function XWikiScreen(options) {
    this.name = options.name;
    
    this.title = options.title;
    
    // parent screen where this panel appears
    this.parent = options.parent;
    
    // initial html content of the panel
    this.panelcontent = options.panelcontent;
    
    // initialize the main menu adding function
    this.addMainMenus = options.addMainMenus;
    
    // initialize the menu in the parent screen
    this.addParentMenus = options.addParentMenus;
    
    // route configuration
    this.route = options.route;
    this.routeCallback = options.routeCallback;
    
    // show call back. this is the JS called when there is new data
    this.showCallback = options.showCallback;
    
    // set initiliazed to false
    this.initialized = false;
};

XWikiScreen.prototype.showScreen = function() {
    var title = $.i18n.map[this.name + ".title"];
    if (title==undefined)
        title = this.title;
    console.log("Setting panel title " + title);
    $.ui.setTitle(title);
    return this.showCallback();
}

/*
 XWiki Mobile Standard Screens
 */
XWikiMobile.prototype.addDefaultScreens = function() {
    // main screen
    var mainScreen = new XWikiScreen(
                                     {
                                     name: "main",
                                     title: "Home",
                                     parent: "",
                                     panelcontent: "",
                                     route: "main",
                                     addMainMenus: function() {
                                     console.log("In screen menu setup");
                                     
                                     $("#menu_scroller #sidemenu").append("<li><a class='x-icon-small x-icon-user' href='#main'>" + $.i18n.map["sidebar.home"] + "</a></li>");
                                     $("#menu_scroller #sidemenu").append("<li><a class='x-icon-small x-icon-user' href='javascript:void(0)' onclick='xmobile.relogin(); return false;'>" + $.i18n.map["sidebar.relogin"] + "</a></li>");
                                     $("#menu_scroller #sidemenu").append("<li><a class='x-icon-small x-icon-user' href='javascript:void(0)' onclick='squeezeFrame(); return false;'>" + $.i18n.map["sidebar.squeeze"] + "</a></li>");
                                     $("#menu_scroller #sidemenu").append("<li><a href='javascript:void(0)' id='navbar_refresh' class='x-icon-small x-icon-refresh' onclick='xmobile.reloadCurrentPage(); return false;'>" +
                                                                          $.i18n.map["main.refresh"] + "</a></li>");
                                     
                                     //$("#navbar").append("<a href='#main' id='navbar_home' class='x-icon-big x-icon-home' >" + $.i18n.map["main.home"] + "</a>");
                                     
                                     },
                                     routeCallback: function() {
                                     console.log("In main route callback");
                                     this.showScreen();
                                     },
                                     showCallback: function(cache) {
                                     console.log("In main show callback");
                                     $("#xwikilist").html("");
                                     var items = "";
                                     var that = this;
                                     $.each(xmobile.xservices, function(key, val) {
                                            var wikiConfig = val.getConfig();
                                            if ((wikiConfig.type=="dnsxem"||wikiConfig.type=="urlxem"))
                                            items += "<li><a class='x-icon x-icon-cloud' href='#xemhome/" + wikiConfig.id + "' id='jqmlink' onClick='return false;'>" + wikiConfig.name + "</a></li>";
                                            else
                                            items += "<li><a class='x-icon x-icon-cloud' href='#xwikihome/" + wikiConfig.id + "' id='jqmlink' onClick='return false;'>" + wikiConfig.name + "</a></li>";
                                            });
                                     $("#xwikilist").html(items);
                                     
                                     }
                                     }
                                     );
    this.addScreen(mainScreen);
    
    
    
    // status screen
    var xstatusScreen = new XWikiScreen(
                                        {
                                        name: "xstatus",
                                        title: "Status",
                                        parent: "xhome",
                                        panelcontent: "<div id='networkstatus'></div>",
                                        route: "xstatus",
                                        addMainMenus: function() {
                                        console.log("In screen menu setup");
                                        $("#toolsmenu").append("<li><a class='x-icon x-icon-dashboard' href='#xstatus' id='jqmlink'>" + $.i18n.map["xstatus.title"] + "</a></li>");
                                        // $("#navbar").append("<a href='#xstatus' id='navbar_network' class='x-icon-big x-icon-dashboard' >" + $.i18n.map["xstatus.title"] + "</a>");
                                        $("#menu_scroller #sidemenu").append("<li><a class='x-icon-small x-icon-dashboard' href='#xstatus'>" + $.i18n.map["xstatus.title"]+ "</a></li>");
                                        
                                        },
                                        routeCallback: function() {
                                        console.log("In status route callback");
                                        // $.ui.loadContent("#xstatus",false,false,"up");
                                        this.showScreen();
                                        },
                                        showCallback: function(cache) {
                                        console.log("In status show callback");
                                        xmobile.updateNetworkActive();
                                        $("#xstatus").html(xmobile.getNetworkStatus());
                                        }
                                        }
                                        );
    this.addScreen(xstatusScreen);
    
    //settings
    var xsettingsScreen = new XWikiScreen(
                                          {
                                          name: "xsettings",
                                          title: "Settings",
                                          parent: "xhome",
                                          panelcontent: "<ul id='settings'></ul>",
                                          route: "xsettings",
                                          addMainMenus: function() {
                                          console.log("In screen menu setup");
                                          $("#toolsmenu").append("<li><a class='x-icon x-icon-cog' href='#xsettings' id='jqmlink'>" + $.i18n.map["xsettings.title"] + "</a></li>");
                                          // $("#navbar").append("<a href='#xsettings' id='navbar_network' class='x-icon-big x-icon-cog' >" + $.i18n.map["xsettings.title"] + "</a>");
                                          $("#menu_scroller #sidemenu").append("<li><a class='x-icon-small x-icon-cog' href='#xsettings'>" + $.i18n.map["xsettings.title"] + "</a></li>");
                                          },
                                          routeCallback: function() {
                                          console.log("In settings route callback");
                                          // $.ui.loadContent("#xsettings",false,false,"up");
                                          this.showScreen();
                                          },
                                          showCallback: function(cache) {
                                          console.log("In settings show callback");
                                          $("#settings").html("");
                                          var items = "";
                                          var that = this;
                                          $.each(xmobile.xservices, function(key, val) {
                                                 var wikiConfig = val.getConfig();
                                                 items += "<li id='setting_" + val.id + "'><a class='x-icon x-icon-cloud' href='#xsetting/" + wikiConfig.id + "' id='jqmlink'>" + wikiConfig.name + "</a></li>";
                                                 });
                                          items += "<li><form id='xsettingsaddform'><input type='text' name='configname' value='newconfig' size='15' class='jq-ui-forms-add' />&nbsp;&nbsp;<input type='button' value='" + $.i18n.map["xsettings.add"] + "' onClick='this.form.screen.add(form);' /></form></li>";
                                          $("#settings").html(items);
                                          
                                          $.each(xmobile.xservices, function(key, val) {
                                                 $.ui.updateBadge("#setting_" + val.id, $.i18n.map["xsettings.loginstatus"] + $.i18n.map["loginstatus." + val.loginStatus] + "   ", "br");
                                                 });
                                          
                                          document.forms.xsettingsaddform.screen = this;
                                          }
                                          
                                          
                                          
                                          }
                                          );
    xsettingsScreen.add = function(form) {
        console.log("call add");
        
        if (xmobile.addWikiConfig(form.configname.value)) {
            this.showCallback(true);
        } else {
            alert($.i18n.map["settings.configalreadyused"]);
        }
    }
    this.addScreen(xsettingsScreen);
    
    //settings
    var xsettingScreen = new XWikiScreen(
                                         {
                                         name: "xsetting",
                                         title: "Settings",
                                         parent: "xsettings",
                                         panelcontent: "",
                                         route: "xsetting/:wikiName",
                                         addMainMenus: function() {
                                         },
                                         routeCallback: function(wiki) {
                                         console.log("In setting route callback");
                                         // make sur the config is set
                                         xmobile.setCurrentConfig(wiki);
                                         this.showScreen();
                                         },
                                         showCallback: function(cache) {
                                         console.log("In setting show callback");
                                         var sconfig = xmobile.getCurrentService().getConfig();
                                         var form = document.forms["setting_form"];
                                         $("#setting_form_advanced").hide();
                                         
                                         form.screen = this;
                                         form.setting_id.value = sconfig.id;
                                         form.setting_name.value = sconfig.name;
                                         form.setting_url.value = sconfig.url;
                                         form.setting_username.value = sconfig.username;
                                         form.setting_password.value = sconfig.password;
                                         form.setting_wikis.value = sconfig.wikis;
                                         form.setting_baseurl.value = sconfig.baseurl;
                                         form.setting_resturl.value = sconfig.resturl;
                                         form.setting_viewurl.value = sconfig.viewurl;
                                         form.setting_xembaseurl.value = sconfig.xembaseurl;
                                         form.setting_xemresturl.value = sconfig.xemresturl;
                                         form.setting_protocol.value = "" + sconfig.protocol;
                                         if (sconfig.automatic=="1")
                                         document.getElementById("setting_automatic").checked  = true;
                                         else
                                         document.getElementById("setting_manual").checked  = true;
                                         
                                         if (sconfig.type=="xe") {
                                         document.getElementById("setting_xe").checked  = true;
                                         $("#setting_form_wikis").hide();
                                         $("#setting_form_xemurls").hide();
                                         } else if (sconfig.type=="xefromxem") {
                                         document.getElementById("setting_xefromxem").checked  = true;
                                         $("#setting_form_wikis").hide();
                                         $("#setting_form_xemurls").hide();
                                         } else if (sconfig.type=="dnsxem") {
                                         document.getElementById("setting_dnsxem").checked  = true;
                                         $("#setting_form_wikis").show();
                                         $("#setting_form_xemurls").show();
                                         } else if (sconfig.type=="urlxem") {
                                         document.getElementById("setting_urlxem").checked  = true;
                                         $("#setting_form_wikis").show();
                                         $("#setting_form_xemurls").show();
                                         }
                                         }
                                         });
    
    
    xsettingScreen.getRadioValue = function(fieldName) {
        var inputs = document.getElementsByName(fieldName);
        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].checked) {
                return inputs[i].value;
            }
        }
    }
    
    xsettingScreen.save = function(form) {
        console.log("setting call save");
        var sconfig = xmobile.getCurrentService().getConfig();
        sconfig.id = form.setting_id.value;
        sconfig.name = form.setting_name.value;
        sconfig.type = this.getRadioValue("type");
        sconfig.url = form.setting_url.value;
        sconfig.automatic = this.getRadioValue("automatic");
        sconfig.wikis = form.setting_wikis.value;
        sconfig.username = form.setting_username.value;
        sconfig.password = form.setting_password.value;
        sconfig.baseurl = form.setting_baseurl.value;
        sconfig.viewurl = form.setting_viewurl.value;
        sconfig.resturl = form.setting_resturl.value;
        sconfig.xembaseurl = form.setting_xembaseurl.value;
        sconfig.xemresturl = form.setting_xemresturl.value;
        if (form.setting_protocol.value!="") {
            try {
                sconfig.protocol = parseInt(form.setting_protocol.value);
            } catch (e) {
            }
        }
        
        this.detectConnection(sconfig, function(success) {
                              xmobile.saveWikiConfig(xmobile.getCurrentConfig(), sconfig);
                              if (success==true) {
                              xmobile.router.navigate("#xsettings", true);
                              }
                              });
    }
    
    xsettingScreen.deleteConnection = function(form) {
        console.log("setting call delete");
        if (confirm("Do you really want to delete this connection")) {
            xmobile.deleteWikiConfig(xmobile.getCurrentConfig());
            xmobile.router.navigate("#xsettings", true);
        }
    }
    
    xsettingScreen.testConnection = function(sconfig, cb) {
        // ready to test connection
        console.log("Testing connection: " + sconfig.url);
        console.log("Base URL: " + sconfig.baseurl);
        console.log("View URL: " + sconfig.viewurl);
        console.log("Rest URL: " + sconfig.resturl);
        
        var getwikiurl;
        var authurl;
        
        if (sconfig.username=="") {
          if (sconfig.type="xefromxem" && sconfig.automatic=="1")
           authurl = sconfig.url + "/xwiki/bin/preview/Sandbox/WebHome?content={{velocity}}$context.database{{/velocity}}&xpage=plain&outputSyntax=plain";
          else
           authurl = sconfig.url + "/xwiki/bin/view/Sandbox/WebHome?xpage=plain&outputSyntax=plain";
        } else {
          getwikiurl = sconfig.url + "/xwiki/bin/preview/Sandbox/WebHome?content={{velocity}}$context.database{{/velocity}}&xpage=plain&outputSyntax=plain";
          authurl = sconfig.url + "/xwiki/bin/loginsubmit/XWiki/XWikiLogin?j_username=" + sconfig.username + "&j_password=" + sconfig.password + "&xredirect=" + encodeURIComponent(getwikiurl);
        }
        
        var that = this;
        var sconfig2 = sconfig;
        console.log("Test connection to " + authurl);
        $.ajax({
               type:"GET",
               dataType : "text",
               url: authurl,
               timeout: 10000,
               success: function(data, text, xhr) {
               if (sconfig2.type=="xefromxem") {
               if (data.length<40) {
               alert($.i18n.map["settings.validation.success"]);
               sconfig2.resturl = that.url(sconfig2.baseurl, "/rest/wikis/" + data + "/");
               } else {
               alert($.i18n.map["settings.validation.failedonwikiname"]);
               }
               } else {
               alert($.i18n.map["settings.validation.success"]);
               }
               cb(true);
               },
               error: function(xhr, text, error) {
               if (xhr.status==401 || xhr.status==403) {
               alert($.i18n.map["settings.validation.failedcredentials"]);
               } else {
               alert($.i18n.map["settings.validation.failedconnection"])
               }
               cb(false);
               }
               });
    }
    
    xsettingScreen.url = function(baseurl, uri) {
        if (uri=="")
            return baseurl;
        
        if (baseurl[baseurl.length - 1] == '/' && uri[0] == '/')
            return baseurl = baseurl + uri.substring(1);
        
        if (baseurl[baseurl.length - 1] != '/' && uri[0] != '/')
            return baseurl = baseurl + "/" + uri.substring(1);
        
        return baseurl + uri;
    }
    
    xsettingScreen.detectConnection = function(sconfig, cb) {
        console.log("setting call detectConnection");
        
        // we first need to detect the connection
        if (sconfig.automatic=="1") {
            if (sconfig.url.indexOf("http")!=0) {
                if (sconfig.url.indexOf("cloud.xwiki.com")!=-1) {
                    sconfig.url = "https://" + sconfig.url;
                } else {
                    sconfig.url = "http://" + sconfig.url;
                }
            }
            
            if (sconfig.url.indexOf("cloud.xwiki.com")!=-1) {
                sconfig.type = "xefromxem";
            }
            
            if (sconfig.type=="xe") {
                sconfig.baseurl = this.url(sconfig.url, "/xwiki/");
                sconfig.viewurl = this.url(sconfig.baseurl, "/bin/view/");
                sconfig.resturl = this.url(sconfig.baseurl, "/rest/wikis/xwiki/");
                this.testConnection(sconfig, cb);
            } else if (sconfig.type=="xefromxem") {
                sconfig.baseurl = this.url(sconfig.url, "/xwiki/");
                sconfig.viewurl = this.url(sconfig.baseurl, "/bin/view/");
                // we need to make a query to get the rest url
                this.testConnection(sconfig, cb);
            } else if (sconfig.type=="dnsxem") {
                sconfig.baseurl = this.url(sconfig.url.replace("www.", "__wiki__."), "/xwiki/");
                sconfig.viewurl = this.url(sconfig.baseurl, "/bin/view/");
                sconfig.resturl = this.url(sconfig.baseurl, "/rest/wikis/__wiki__/");
                sconfig.xembaseurl = this.url(sconfig.url, "/xwiki/");
                sconfig.xemresturl = this.url(sconfig.url, "/xwiki/rest/wikis/");
                this.testConnection(sconfig, cb);
            } else {
                // urlxem
                sconfig.baseurl = this.url(sconfig.url, "/xwiki/");
                sconfig.viewurl = this.url(sconfig.baseurl, "/wiki/__wiki__/view/");
                sconfig.resturl = this.url(sconfig.baseurl, "/rest/wikis/__wiki__/");
                sconfig.xembaseurl = this.url(sconfig.url, "/xwiki/");
                sconfig.xemresturl = this.url(sconfig.url, "/xwiki/rest/wikis/");
                this.testConnection(sconfig, cb);
            }
        } else {
            this.testConnection(sconfig, cb);
        }
        
    }
    
    this.addScreen(xsettingScreen);
    
    
    
    // wiki home
    var xwikihomeScreen = new XWikiScreen(
                                          {
                                          name: "xwikihome",
                                          title: "Wiki",
                                          parent: "main",
                                          panelcontent: "<ul id='xwikiactions'></ul>",
                                          route: "xwikihome/:wikiName",
                                          addMainMenus: function() {
                                          },
                                          routeCallback: function(wiki) {
                                          console.log("In xwikihome route callback");
                                          // make sur the config is set
                                          xmobile.setCurrentFullConfig(wiki);
                                          
                                          this.showScreen();
                                          },
                                          showCallback: function(cache) {
                                          console.log("In xwikihome show callback");
                                          
                                          // force a login if it is not the case
                                          var xservice = xmobile.getCurrentService();
                                          if (xservice.type=="dnsxem" || xservice.type=="urlxem") {
                                             xservice.getWikiConfig(xmobile.getCurrentWiki(), true);
                                          } else {
                                           if (xservice.isNotLoggedIn() || (cache==false))
                                             xservice.login("default");
                                          }
                                          
                                          var configName = xmobile.getCurrentConfig();
                                          $("#xwikiactions").html("");
                                          var items = "";
                                          $("#xwikiactions").html(items);
                                          
                                          xmobile.insertChildMenus(this);
                                          }
                                          }
                                          );
    this.addScreen(xwikihomeScreen);
    
    
    // recent changes
    var xrecentScreen = new XWikiScreen(
                                        {
                                        name: "xrecent",
                                        title: "Changes",
                                        parent: "xwikihome",
                                        panelcontent: "<ul id='xwikirecentdocslist'></ul>",
                                        route: "xrecent/:wikiName",
                                        addMainMenus: function() {
                                        },
                                        addParentMenus: function() {
                                        var configName = xmobile.getCurrentFullConfig();
                                        $("#xwikiactions").append("<li><a class='x-icon x-icon-list' href='#xrecent/" + configName + "'>" + $.i18n.map["xrecent.title"] + "</a></li>");
                                        },
                                        routeCallback: function(wiki) {
                                        console.log("In xrecent route callback");
                                        
                                        // make sur the config is set
                                        xmobile.setCurrentFullConfig(wiki);
                                        
                                        this.showScreen();
                                        },
                                        showCallback: function(cache) {
                                        console.log("In xrecent show callback");
                                        
                                        $("#xwikirecentdocslist").html("");
                                        var data = this.getRecentDocs(xmobile.getCurrentWiki(), cache);
                                        if (data!=null) {
                                        var items = "";
                                        $.each(data.searchResults, function(key, val) {
                                               items += '<li>' + xmobile.getPageHTML(xmobile.getCurrentFullConfig(), val, false) + '</li>';
                                               });
                                        $("#xwikirecentdocslist").html(items);
                                        }
                                        }
                                        }
                                        );
    
    // adding network functions
    xrecentScreen.addRecentDocsRequest = function(wikiName, priority, cache) {
        if (cache==null)
            cache = true;
        var recentDocsURL = this.getRecentDocsURL(wikiName);
        nq.addRequest(xmobile.getCurrentService(), xmobile.getCurrentConfig() + "." + wikiName + ".xrecent", recentDocsURL, priority, cache, null);
    }
    
    
    xrecentScreen.getRecentDocsURL = function(wikiName) {
        var query = "hidden:false AND type:wikipage AND lang:default AND NOT space:XWiki AND NOT space:Scheduler";
        var searchurl = "query?media=json&type=lucene&q=" + query + ((xmobile.getCurrentService().protocol>=3) ? "&orderField=date&order=desc&prettyNames=true" : "&orderfield=date&order=desc&prettynames=true&number=20");
        return xmobile.getCurrentService().getRestURL(wikiName, searchurl);
    }
    
    xrecentScreen.getRecentDocs = function(wikiName, cache) {
        var result = nq.getResult(xmobile.getCurrentConfig() + "." + wikiName + ".xrecent");
        if (result==null || cache==false) {
            // we don't have a request we should add it in the queue
            this.addRecentDocsRequest(wikiName, "high", cache);
            return (result==null) ? null : $.parseJSON(result.data);
        } else if (result.status==4 || result.status==3) {
            return $.parseJSON(result.data);
        } else {
            return null;
        }
    }
    
    this.addScreen(xrecentScreen);
    
    
    
    // spaces screen
    var xspacesScreen = new XWikiScreen(
                                        {
                                        name: "xspaces",
                                        title: "Spaces",
                                        parent: "xwikihome",
                                        panelcontent: "<ul id='xwikispaceslist'></ul>",
                                        route: "xspaces/:wikiName",
                                        addMainMenus: function() {
                                        },
                                        addParentMenus: function() {
                                        console.log("Adding spaces menu");
                                        var configName = xmobile.getCurrentFullConfig();
                                        $("#xwikiactions").append("<li><a class='x-icon x-icon-list x-icon-folder-open' href='#xspaces/" + configName + "'>" + $.i18n.map["xspaces.title"] + "</a></li>");
                                        },
                                        routeCallback: function(wiki) {
                                        console.log("In xspaces route callback");
                                        
                                        // make sur the config is set
                                        xmobile.setCurrentFullConfig(wiki);
                                        
                                        this.showScreen();
                                        },
                                        showCallback: function(cache) {
                                        console.log("In xspaces show callback");
                                        
                                        $("#xwikispaceslist").html("");
                                        var data = this.getSpaces(xmobile.getCurrentWiki(), cache);
                                        if (data!=null) {
                                        var items = "";
                                        $.each(data.spaces, function(key, val) {
                                               items += "<li><a href=\"#xspace/" + xmobile.getCurrentFullConfig() + "/" + encodeURIComponent(val.name) + "\">" + val.name + "</a></li>"
                                               });
                                        $("#xwikispaceslist").html(items);
                                        }
                                        }
                                        }
                                        );
    
    
    xspacesScreen.addSpacesRequest = function(wikiName, priority, cache) {
        if (cache==null)
            cache = true;
        var spacesURL = this.getSpacesURL(wikiName);
        nq.addRequest(xmobile.getCurrentService(), xmobile.getCurrentConfig() + "." + wikiName + ".xspaces", spacesURL, priority, cache, null);
    }
    
    xspacesScreen.getSpacesURL = function(wikiName) {
        return xmobile.getCurrentService().getRestURL(wikiName, "spaces?media=json" + ((xmobile.getCurrentService().protocol>=3) ? "&prettyNames=true" : "&prettynames=true"));
    }
    
    xspacesScreen.getSpaces = function(wikiName, cache) {
        var result = nq.getResult(xmobile.getCurrentConfig() + "." + wikiName + ".xspaces");
        if (result==null || cache==false) {
            // we don't have a request we should add it in the queue
            this.addSpacesRequest(wikiName,"high", cache);
            return (result==null) ? null : $.parseJSON(result.data);
       } else if (result.status==4 || result.status==3) {
            return $.parseJSON(result.data);
        } else {
            return null;
        }
    }
    
    this.addScreen(xspacesScreen);
    
    // space page
    var xspaceScreen = new XWikiScreen(
                                       {
                                       name: "xspace",
                                       title: "Space",
                                       parent: "xspaces",
                                       panelcontent: "<ul id='xwikispacedocslist'></ul>",
                                       route: "xspace/:wikiName/:spaceName",
                                       addMainMenus: function() {
                                       },
                                       addParentMenus: function() {
                                       },
                                       routeCallback: function(wiki, spaceName) {
                                       console.log("In xspace route callback " + location.hash);
                                       
                                       // make sur the config is set
                                       xmobile.setCurrentFullConfig(wiki);
                                       xmobile.setCurrentSpace(spaceName);
                                       
                                       this.showScreen();
                                       },
                                       showCallback: function(cache) {
                                       console.log("In xspace show callback");
                                       
                                       $("#xwikispacedocslist").html("");
                                       var data = this.getSpaceDocs(xmobile.getCurrentWiki(), xmobile.getCurrentSpace(), cache);
                                       if (data!=null) {
                                       var items = "";
                                       $.each(data.searchResults, function(key, val) {
                                              items += '<li>' + xmobile.getPageHTML(xmobile.getCurrentFullConfig(), val, false) + '</li>';
                                              });
                                       $("#xwikispacedocslist").html(items);
                                       }
                                       }
                                       }
                                       );
    
    
    // adding network functions
    xspaceScreen.addSpaceDocsRequest = function(wikiName, spaceName, priority, cache) {
        if (cache==null)
            cache = true;
        
        var spaceDocsURL = this.getSpaceDocsURL(wikiName, spaceName);
        console.log("requesting space data");
        nq.addRequest(xmobile.getCurrentService(), xmobile.getCurrentConfig() + "." + wikiName + ".xspace." + spaceName, spaceDocsURL, priority, cache, null);
    }
    
    
    xspaceScreen.getSpaceDocsURL = function(wikiName, spaceName) {
        var hql = "where doc.space = '" + spaceName.replace("'","''").replace("&","%26") + "' order by doc.date desc";
        var spacedocsurl = "query?type=hql&q=" + encodeURIComponent(hql) + "&media=json&number=20" + ((xmobile.getCurrentService().protocol>=3) ? "&orderField=date&order=desc&prettyNames=true" : "&orderfield=date&order=desc&prettynames=true");
        return xmobile.getCurrentService().getRestURL(wikiName, spacedocsurl);
    }
    
    xspaceScreen.getSpaceDocs = function(wikiName, spaceName, cache) {
        var result = nq.getResult(xmobile.getCurrentConfig() + "." + wikiName + ".xspace." + spaceName);
        if (result==null || cache==false) {
            // we don't have a request we should add it in the queue
            this.addSpaceDocsRequest(wikiName, spaceName, "high", cache);
            return (result==null) ? null : $.parseJSON(result.data);
        } else if (result.status==4 || result.status==3) {
            return $.parseJSON(result.data);
        } else {
            return null;
        }
    }
    
    this.addScreen(xspaceScreen);
    
    // space page
    var xsearchScreen = new XWikiScreen(
                                        {
                                        name: "xsearch",
                                        title: "Search",
                                        parent: "xwikihome",
                                        panelcontent: "<ul><li><form id='searchform' name='searchform' onsubmit='return this.screen.search(this); return false;'>" + $.i18n.map["xsearch.term"] + " <input type='text' name='search' size='15' class='jq-ui-forms-search'>&nbsp;&nbsp;<input type='submit' value='" + $.i18n.map["xsearch.search"] + "' /></form></li></ul><ul id='xwikisearchlist'></ul>",
                                        route: "xsearch/:wikiName/(:keyword)",
                                        addMainMenus: function() {
                                        },
                                        addParentMenus: function() {
                                        console.log("Adding search menu");
                                        var configName = xmobile.getCurrentFullConfig();
                                        $("#xwikiactions").append("<li><a class='x-icon x-icon-list x-icon-search' href='#xsearch/" + configName + "/'>" + $.i18n.map["xsearch.title"] + "</a></li>");
                                        },
                                        routeCallback: function(wiki, keyword) {
                                        document.forms.searchform.screen = this;
                                        document.forms.searchform.search.value = keyword;
                                        console.log("In xsearch route callback " + location.hash);
                                        
                                        // make sur the config is set
                                        xmobile.setCurrentFullConfig(wiki);
                                        if (keyword == undefined || keyword == null)
                                        xmobile.setCurrentKeyword("");
                                        else
                                        xmobile.setCurrentKeyword(keyword);
                                        
                                        this.showScreen();
                                        },
                                        showCallback: function(cache) {
                                        console.log("In xsearch show callback");
                                        console.log("Screen: " + this);
                                        document.forms.searchform.screen = this;
                                        
                                        if (xmobile.getCurrentKeyword()!="") {
                                        var data = this.getSearch(xmobile.getCurrentWiki(), xmobile.getCurrentKeyword(), cache);
                                        if (data!=null) {
                                        $("#xwikisearchlist").html("");
                                        var items = "";
                                        $.each(data.searchResults, function(key, val) {
                                               items += '<li>' + xmobile.getPageHTML(xmobile.getCurrentFullConfig(), val, false) + '</li>';
                                               });
                                        $("#xwikisearchlist").html(items);
                                        }
                                        }
                                        }
                                        }
                                        );
    
    xsearchScreen.search = function(form) {
        try {
            var keyword = form.search.value;
            if (keyword!=null && keyword!="") {
                xmobile.router.navigate("#xsearch/" + xmobile.getCurrentFullConfig() + "/" + keyword, true);
            }
        } catch (e) {
            console.log("Search exception: " + e);
        }
        return false;
    }
    
    // adding network functions
    xsearchScreen.addSearchRequest = function(wikiName, keyword, priority, cache) {
        if (cache==null)
            cache = true;
        
        var searchURL = this.getSearchURL(wikiName, keyword);
        console.log("requesting search data");
        nq.addRequest(xmobile.getCurrentService(), xmobile.getCurrentConfig() + "." + wikiName + ".xsearch." + keyword, searchURL, priority, cache, null);
    }
    
    
    xsearchScreen.getSearchURL = function(wikiName, keyword) {
        var query = keyword + " AND hidden:false AND type:wikipage AND lang:default AND NOT space:XWiki AND NOT space:Scheduler";
        var searchurl = "query?media=json&type=lucene&q=" + query + ((xmobile.getCurrentService().prototcol>=3) ? "&orderField=date&order=desc&prettyNames=true" : "&orderfield=date&order=desc&prettynames=true&number=20");
        return xmobile.getCurrentService().getRestURL(wikiName, searchurl);
    }
    
    xsearchScreen.getSearch = function(wikiName, keyword, cache) {
        var result = nq.getResult(xmobile.getCurrentConfig() + "." + wikiName + ".xsearch." + keyword);
        if (result==null || cache==false) {
            if (cache==false)
                console.log("Forcing getting data cache is false");
            // we don't have a request we should add it in the queue
            this.addSearchRequest(wikiName, keyword, "high", cache);
            return (result==null) ? null : $.parseJSON(result.data);
        } else if (result.status==4 || result.status==3) {
            return $.parseJSON(result.data);
        } else {
            return null;
        }
    }
    
    this.addScreen(xsearchScreen);
    
    // space page
    var xpageScreen = new XWikiScreen(
                                      {
                                      name: "xpage",
                                      title: "Page",
                                      parent: "",
                                      panelcontent: "<iframe id='xpageframe' src='pageframe.html' width='98%' height='100%' style='magin: auto; border: 0;' frameborder='0'></iframe>",
                                      route: "xpage/:wikiName/:pageName",
                                      addMainMenus: function() {
                                      },
                                      addParentMenus: function() {
                                      },
                                      routeCallback: function(wiki, pageName) {
                                      console.log("In xpage route callback " + location.hash);
                                      
                                      // make sur the config is set
                                      xmobile.setCurrentFullConfig(wiki);
                                      xmobile.setCurrentPage(pageName);
                                      
                                      this.showScreen();
                                      },
                                      showCallback: function(cache) {
                                      $("#open").show();
                                      this.setPageContent("");
                                      console.log("In xpage show callback");
                                      var data = this.getPage(xmobile.getCurrentWiki(), xmobile.getCurrentPage(), cache);
                                      if (data!=null) {
                                       this.setPageContent(data);
                                      }
                                      }
                                      }
                                      );
    
    
    // adding network functions
    xpageScreen.addPageRequest = function(wikiName, pageName, priority, cache) {
        if (cache==null)
            cache = true;
        var pageURL = this.getPageURL(wikiName, pageName);
        nq.addRequest(xmobile.getCurrentService(), xmobile.getCurrentConfig() + "." + wikiName + ".xpage." + pageName, pageURL, priority, cache, null);
    }
    
    
    xpageScreen.getPageURL = function(wikiName, pageName) {
        var template = "plain";
        if (xmobile.getCurrentService().template != undefined)
            template =xmobile.getCurrentService().template;
        return xmobile.getCurrentService().viewurl.replace(/__wiki__/g, wikiName) + pageName.replace(".", "/") + "?xpage=" + template;
    }
    
    xpageScreen.getPage = function(wikiName, pageName, cache) {
        var result = nq.getResult(xmobile.getCurrentConfig() + "." + wikiName + ".xpage." + pageName);
        if (result==null || cache==false) {
            this.addPageRequest(wikiName, pageName, "high", cache);
            return (result==null) ? null : this.fixHTMLOnline(result.data, wikiName, pageName);
        } else if (result.status==4 || result.status==3) {
            return this.fixHTMLOnline(result.data, wikiName, pageName);
        } else {
            return null;
        }
    }
    
    xpageScreen.setPageContent = function(html) {
        var frame = document.getElementById('xpageframe');
        // force content in frame in case it was replayed
        if (frame!=undefined && (frame.contentDocument!=undefined)) {
            var pageContentEl = frame.contentDocument.getElementById('xwikipagecontent');
            if (pageContentEl != undefined) {
                pageContentEl.innerHTML = (html == null) ? "" : html;
                if (html!="") {
                    squeezeFrame();
                }
            } else {
                var that = this;
                frame.contentDocument.addEventListener( "DOMContentLoaded", function() {
                                                       that.setPageContent(html);
                                                       }, false);
                frame.src = "pageframe.html";
            }
        }
    }
    
    xpageScreen.fixHTMLOnline = function(html, wikiName, pageName) {
        var baseurl = xmobile.getCurrentService().getViewURL(wikiName, pageName);
        var domainurl = baseurl;
        var pos = baseurl.indexOf('/',9);
        if (pos!=-1)
            domainurl = baseurl.substring(0,pos);
        var pattern1 = new RegExp("(<img.*?src\s*=\s*[\"\'])(.*?)([\"\'])", "g");
        var pattern2 = new RegExp("(<a.*?href\s*=\s*[\"\'])(.*?)([\"\'])", "g");
        var newhtml = html.replace(pattern1,function(match) {
                                   if (arguments[2][0]=='/') {
                                   var url = domainurl + arguments[2];
                                   var result = (url==null) ? arguments[1] + arguments[2] + arguments[3]: arguments[1] + url + arguments[3];
                                   return result;
                                   } else {
                                   return arguments[0];
                                   }
                                   });
        newhtml = newhtml.replace(pattern2,function(match) {
                                  if ( arguments[2][0]=='#') {
                                  return arguments[0];
                                  } else {
                                  return arguments[1] + "javascript:void(0)" + arguments[3] + " onclick=\"return parent.xmobile.showlinkOnline(\'" + arguments[2] + "','" + domainurl + "\');\"";
                                  }
                                  });
        return newhtml;
    }
    
    
    this.addScreen(xpageScreen);
    /*
     XEM Section
     */
    
    
    
    // wiki home
    var xxemhomeScreen = new XWikiScreen(
                                         {
                                         name: "xemhome",
                                         title: "XEM Wiki",
                                         parent: "main",
                                         panelcontent: "<ul id='xemactions'></ul><div class='xheader'>" + $.i18n.map["xem.workspaces"] + "</div><ul id='xemworkspaces'></ul>",
                                         route: "xemhome/:wikiName",
                                         addMainMenus: function() {
                                         },
                                         routeCallback: function(wiki) {
                                         console.log("In xemhome route callback");
                                         
                                         // make sur the config is set
                                         xmobile.setCurrentFullConfig(wiki);
                                         
                                         this.showScreen();
                                         },
                                         showCallback: function(cache) {
                                         console.log("In xemhome show callback");
                                         
                                         // force a login if it is not the case
                                         var xservice = xmobile.getCurrentService();
                                         if (xservice.isNotLoggedIn())
                                         xservice.login("default");
                                         
                                         var configName = xmobile.getCurrentConfig();
                                         $("#xemactions").html("")
                                         
                                         $("#xemworkspaces").html("");
                                         var items = "";
                                         var that = this;
                                         var wikis = xmobile.getCurrentService().wikis;
                                         if (wikis==undefined || wikis=="") {
                                         wikis = "";
                                         var wikilist = this.getWikis(xmobile.getCurrentWiki());
                                         if (wikilist!=undefined) {
                                         var wikilist2 = $.parseJSON(wikilist);
                                         $.each(wikilist2.wikis, function(key, val) {
                                                wikis += "," + val.id;
                                                });
                                         }
                                         if (wikis!="")
                                         wikis = wikis.substring(1);
                                         }
                                         
                                         if (wikis!="") {
                                         $.each(wikis.split(","), function(key, val) {
                                                items += "<li><a class='x-icon x-icon-cloud' href='#xwikihome/" + configName + ":" + val + "' id='jqmlink' onClick='return false;'>" + val + "</a></li>";
                                                });
                                         }
                                         $("#xemworkspaces").html(items);
                                         
                                         xmobile.insertChildMenus(this);
                                         }
                                         }
                                         );
    this.addScreen(xxemhomeScreen);
    
    // adding network functions
    xxemhomeScreen.addWikisRequest = function(wikiName, priority, cache) {
        if (cache==null)
            cache = true;
        var wikisURL = this.getWikisURL(wikiName);
        nq.addRequest(xmobile.getCurrentService(), xmobile.getCurrentConfig() + "." + wikiName + ".xemhome", wikisURL, priority, cache, null);
    }
    
    
    xxemhomeScreen.getWikisURL = function(wikiName) {
        return xmobile.getCurrentService().xemresturl + "?media=json";
    }
    
    xxemhomeScreen.getWikis = function(wikiName, cache) {
        var result = nq.getResult(xmobile.getCurrentConfig() + "." + wikiName + ".xemhome");
        if (result==null || cache==false) {
            this.addWikisRequest(wikiName, "high", cache);
            return (result==null) ? null : $.parseJSON(result.data);
        } else if (result.status==4 || result.status==3) {
            return result.data;
        } else {
            return null;
        }
    }

    
    // recent changes
    var xxemrecentScreen = new XWikiScreen(
                                           {
                                           name: "xxemrecent",
                                           title: "Changes",
                                           parent: "xemhome",
                                           panelcontent: "<ul id='xemrecentdocslist'>here</ul>",
                                           route: "xxemrecent/:wikiName",
                                           addMainMenus: function() {
                                           },
                                           addParentMenus: function() {
                                           console.log("Adding xem menu recent");
                                           var configName = xmobile.getCurrentConfig();
                                           $("#xemactions").append("<li><a class='x-icon x-icon-list' href='#xxemrecent/" + configName + "'>" + $.i18n.map["xrecent.title"] + "</a></li>");
                                           },
                                           routeCallback: function(wiki) {
                                           console.log("In xxemrecent route callback");
                                           
                                           // make sur the config is set
                                           xmobile.setCurrentConfig(wiki);
                                           xmobile.setCurrentWiki("default");
                                           
                                           this.showScreen();
                                           },
                                           showCallback: function(cache) {
                                           console.log("In xxemrecent show callback");
                                           
                                           
                                           $("#xemrecentdocslist").html("");
                                           var data = this.getRecentDocs(xmobile.getCurrentWiki(), cache);
                                           if (data!=null) {
                                           console.log("go data" + data);
                                           var items = "";
                                           $.each(data.searchResults, function(key, val) {
                                                  items += '<li>' + xmobile.getPageHTML(xmobile.getCurrentConfig() + ":" + val.wiki, val, true) + '</li>';
                                                  });
                                            $("#xemrecentdocslist").html(items);
                                           }
                                           }
                                           }
                                           );
    
    // adding network functions
    xxemrecentScreen.addRecentDocsRequest = function(wikiName, priority, cache) {
        if (cache==null)
            cache = true;
        var recentDocsURL = this.getRecentDocsURL(wikiName);
        nq.addRequest(xmobile.getCurrentService(), xmobile.getCurrentConfig() + "." + wikiName + ".xxemrecent", recentDocsURL, priority, cache, null);
    }
    
    
    xxemrecentScreen.getRecentDocsURL = function(wikiName) {
        var query = "hidden:false AND type:wikipage AND lang:default AND NOT space:XWiki AND NOT space:Scheduler";
        var searchurl = "query?media=json&type=lucene&q=" + query + ((xmobile.getCurrentService().protocol>=3) ? "&orderField=date&order=desc&prettyNames=true&wikis=" : "&orderfield=date&order=desc&prettynames=true&number=20&wikis=");
        var wikis = xmobile.getCurrentService().wikis;
        if (wikis!=undefined && wikis!="")
            searchurl += encodeURIComponent(wikis);
        return xmobile.getCurrentService().getXEMRestURL(wikiName, searchurl);
    }
    
    xxemrecentScreen.getRecentDocs = function(wikiName, cache) {
        var result = nq.getResult(xmobile.getCurrentConfig() + "." + wikiName + ".xxemrecent");
        if (result==null || cache==false) {
            // we don't have a request we should add it in the queue
            this.addRecentDocsRequest(wikiName, "high", cache);
            return (result==null) ? null : $.parseJSON(result.data);
        } else if (result.status==4 || result.status==3) {
            return $.parseJSON(result.data);
        } else {
            return null;
        }
    }
    
    this.addScreen(xxemrecentScreen);
    
    
    
    // space page
    var xxemsearchScreen = new XWikiScreen(
                                           {
                                           name: "xxemsearch",
                                           title: "Search",
                                           parent: "xemhome",
                                           panelcontent: "<ul><li><form id='xemsearchform' name='xemsearchform' onsubmit='return this.screen.search(this);'>" + $.i18n.map["xsearch.term"] + " <input type='text' name='search' size='15' class='jq-ui-forms-search'>&nbsp;&nbsp;<input type='submit' value='" + $.i18n.map["xsearch.search"] + "' /></form></li></ul><ul id='xemsearchlist'></ul>",
                                           route: "xxemsearch/:wikiName/(:keyword)",
                                           addMainMenus: function() {
                                           },
                                           addParentMenus: function() {
                                           console.log("Adding XEM search menu");
                                           var configName = xmobile.getCurrentConfig();
                                           $("#xemactions").append("<li><a class='x-icon x-icon-list x-icon-search' href='#xxemsearch/" + configName + "/'>" + $.i18n.map["xsearch.title"] + "</a></li>");
                                           },
                                           routeCallback: function(wiki, keyword) {
                                           document.forms.xemsearchform.screen = this;
                                           document.forms.xemsearchform.search.value = keyword;
                                           console.log("In xsearch route callback " + location.hash);
                                           
                                           // make sur the config is set
                                           xmobile.setCurrentConfig(wiki);
                                           xmobile.setCurrentWiki("default");
                                           
                                           if (keyword == undefined || keyword == null)
                                           xmobile.setCurrentKeyword("");
                                           else
                                           xmobile.setCurrentKeyword(keyword);
                                           
                                           this.showScreen();
                                           },
                                           showCallback: function(cache) {
                                           console.log("In xxemsearch show callback");
                                           console.log("Screen: " + this);
                                           document.forms.xemsearchform.screen = this;
                                           
                                           if (xmobile.getCurrentKeyword()!="") {
                                           $("#xemsearchlist").html("");
                                           var data = this.getSearch(xmobile.getCurrentWiki(), xmobile.getCurrentKeyword(), cache);
                                           if (data!=null) {
                                           var items = "";
                                           if (data.searchResults) {
                                           $.each(data.searchResults, function(key, val) {
                                                  items += '<li>' + xmobile.getPageHTML(xmobile.getCurrentConfig() + ":" + val.wiki, val, true) + '</li>';
                                                  });
                                           $("#xemsearchlist").html(items);
                                           }
                                           }
                                           }
                                           }
                                           }
                                           );
    
    xxemsearchScreen.search = function(form) {
        try {
            var keyword = form.search.value;
            if (keyword!=null && keyword!="") {
                xmobile.router.navigate("#xxemsearch/" + xmobile.getCurrentConfig() + "/" + keyword, true);
            }
        } catch (e) {
            console.log("XEM Search exception: " + e);
        }
        return false;
    }
    
    // adding network functions
    xxemsearchScreen.addSearchRequest = function(wikiName, keyword, priority, cache) {
        if (cache==null)
            cache = true;
        
        var searchURL = this.getSearchURL(wikiName, keyword);
        console.log("requesting search data");
        nq.addRequest(xmobile.getCurrentService(), xmobile.getCurrentConfig() + "." + wikiName + ".xxemsearch." + keyword, searchURL, priority, cache, null);
    }
    
    
    xxemsearchScreen.getSearchURL = function(wikiName, keyword) {
        var query = keyword + " AND hidden:false AND type:wikipage AND lang:default AND NOT space:XWiki AND NOT space:Scheduler";
        var searchurl = "query?media=json&type=lucene&q=" + query + ((xmobile.getCurrentService().prototcol>=3) ? "&orderField=date&order=desc&prettyNames=true&wikis=" : "&orderfield=date&order=desc&prettynames=true&number=20&wikis=");
        var wikis = xmobile.getCurrentService().wikis;
        if (wikis!=undefined && wikis!="")
            searchurl += encodeURIComponent(wikis);
        return xmobile.getCurrentService().getXEMRestURL(wikiName, searchurl);
    }
    
    xxemsearchScreen.getSearch = function(wikiName, keyword, cache) {
        var result = nq.getResult(xmobile.getCurrentConfig() + "." + wikiName + ".xxemsearch." + keyword);
        if (result==null || cache==false) {
            if (cache==false)
                console.log("Forcing getting data cache is false");
            // we don't have a request we should add it in the queue
            this.addSearchRequest(wikiName, keyword, "high", cache);
            return (result==null) ? null : $.parseJSON(result.data);
        } else if (result.status==4 || result.status==3) {
            return $.parseJSON(result.data);
        } else {
            return null;
        }
    }
    
    this.addScreen(xxemsearchScreen);
    
    
}



