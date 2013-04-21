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
};

XWikiScreen.prototype.showScreen = function() {
    return this.showCallback(this);
}

/*
 XWiki Mobile Standard Screens
 */
// status screen
var xstatusScreen = new XWikiScreen(
                                  {
                                  name: "xstatus",
                                  title: "Status",
                                  parent: "xhome",
                                  panelcontent: "<div id='networkstatus'></div>",
                                  route: "xstatus",
                                  addMainMenus: function(screen) {
                                     console.log("In screen menu setup");
                                     $("#toolsmenu").append("<li><a class='x-icon x-icon-dashboard' href='#xstatus' id='jqmlink'>Status</a></li>");
                                     $("#navbar").append("<a href='#xstatus' id='navbar_network' class='x-icon-big x-icon-dashboard' >Status</a>");
                                     $("#menu_scroller #sidemenu").append("<li><a class='x-icon-small x-icon-dashboard' href='#xstatus'>Status</a></li>");
                                     
                                  },
                                  routeCallback: function() {
                                     console.log("In status route callback");
                                     // $.ui.loadContent("#xstatus",false,false,"up");
                                     this.showCallback(this);
                                  },
                                  showCallback: function(screen) {
                                     console.log("In status show callback");
                                     xmobile.updateNetworkActive();
                                     $("#xstatus").html(nq.getQueueStatus());
                                  }
                                  }
                                  );
xmobile.addScreen(xstatusScreen);

//settings
var xsettingsScreen = new XWikiScreen(
                                  {
                                  name: "xsettings",
                                  title: "Settings",
                                  parent: "xhome",
                                  panelcontent: "<ul id='settings'></ul>",
                                  route: "xsettings",
                                  addMainMenus: function(screen) {
                                    console.log("In screen menu setup");
                                    $("#toolsmenu").append("<li><a class='x-icon x-icon-cog' href='#xsettings' id='jqmlink'>Settings</a></li>");
                                    $("#navbar").append("<a href='#xsettings' id='navbar_network' class='x-icon-big x-icon-cog' >Settings</a>");
                                    $("#menu_scroller #sidemenu").append("<li><a class='x-icon-small x-icon-cog' href='#xsettings'>Settings</a></li>");
                                  },
                                  routeCallback: function() {
                                    console.log("In settings route callback");
                                    // $.ui.loadContent("#xsettings",false,false,"up");
                                    this.showCallback(this);
                                  },
                                  showCallback: function(screen) {
                                    console.log("In settings show callback");
                                    $("#settings").html("");
                                    var items = "";
                                    var that = this;
                                    $.each(xmobile.xservices, function(key, val) {
                                         var wikiConfig = val.getConfig();
                                         items += "<li><a class='x-icon x-icon-cloud' href='#xsetting/" + wikiConfig.id + "' id='jqmlink'>" + wikiConfig.name + "</a></li>";
                                         });
                                    items += "<li><form id='xsettingsaddform'><input type='text' name='configname' value='newconfig' size='15' class='jq-ui-forms-add' /><input type='button' value='Add' onClick='this.form.screen.add(form);' class='button' /></form></li>";
                                      $("#settings").html(items);
                                    document.forms.xsettingsaddform.screen = screen;
                                  }
                                  }
                                  );
xsettingsScreen.add = function(form) {
    console.log("call add");
    
    if (xmobile.addWikiConfig(form.configname.value)) {
        this.showCallback(this);
    } else {
        alert("There is already a configuration with the name " + form.configname.value);
    }
}
xmobile.addScreen(xsettingsScreen);



//settings
var xsettingScreen = new XWikiScreen(
                                      {
                                      name: "xsetting",
                                      title: "Settings",
                                      parent: "xsettings",
                                      panelcontent: "",
                                      route: "xsetting/:wikiName",
                                      addMainMenus: function(screen) {
                                      },
                                      routeCallback: function(wiki) {
                                      console.log("In setting route callback");
                                       // make sur the config is set
                                       xmobile.setCurrentConfig(wiki);
                                       this.showCallback(this);
                                      },
                                      showCallback: function(screen) {
                                        console.log("In setting show callback");
                                        var sconfig = xmobile.getCurrentService().getConfig();
                                        var form = document.forms["setting_form"];
                                        form.screen = screen;
                                     form.setting_id.value = sconfig.id;
                                     form.setting_name.value = sconfig.name;
                                        form.setting_url.value = sconfig.url;
                                        form.setting_username.value = sconfig.username;
                                        form.setting_password.value = sconfig.password;
                                     form.setting_baseurl.value = sconfig.baseurl;
                                     form.setting_viewurl.value = sconfig.viewurl;
                                     form.setting_resturl.value = sconfig.resturl;

                                      }
                                     });

xsettingScreen.save = function(form) {
    console.log("setting call save");
    var sconfig = xmobile.getCurrentService().getConfig();
    sconfig.id = form.setting_id.value;
    sconfig.name = form.setting_name.value;
    sconfig.url = form.setting_url.value;
    sconfig.username = form.setting_username.value;
    sconfig.password = form.setting_password.value;
    sconfig.baseurl = form.setting_baseurl.value;
    sconfig.viewurl = form.setting_viewurl.value;
    sconfig.resturl = form.setting_resturl.value;
    xmobile.saveWikiConfig(xmobile.getCurrentConfig(), sconfig);
    xmobile.router.navigate("#xsettings", true);
}

xsettingScreen.deleteConnection = function(form) {
    console.log("setting call delete");
    if (confirm("Do you really want to delete this connection")) {
        xmobile.deleteWikiConfig(xmobile.getCurrentConfig());
        xmobile.router.navigate("#xsettings", true);
    }
}

xsettingScreen.testConnection = function(form) {
    console.log("setting call testConnection");
}

xmobile.addScreen(xsettingScreen);



// wiki home
var xwikihomeScreen = new XWikiScreen(
                                  {
                                  name: "xwikihome",
                                  title: "Wiki home",
                                  parent: "xwikihome",
                                  panelcontent: "<ul id='xwikiactions'></ul>",
                                  route: "xwikihome/:wikiName",
                                  addMainMenus: function(screen) {
                                  },
                                  routeCallback: function(wiki) {
                                    console.log("In xwikihome route callback");
                                      
                                    // make sur the config is set
                                    xmobile.setCurrentConfig(wiki);
                                    xmobile.setCurrentWiki("default");

                                    // $.ui.loadContent("#xwikihome/" + wiki,false,false,"up");
                                    this.showCallback(this);
                                  },
                                  showCallback: function(screen) {
                                    console.log("In xwikihome show callback");
                                      
                                    // force a login if it is not the case
                                    var xservice = xmobile.getCurrentService();
                                    if (!xservice.isLoggedIn())
                                      xservice.login("default");
                                      
                                    var configName = xmobile.getCurrentConfig();
                                    $("#xwikiactions").html("");
                                    var items = "";
                                    //items += "<li><a class='x-icon x-icon-folder-open' href='#xspaces/" + configName + "/spaces'>Spaces</a></li>"
                                    //items += "<li><a class='x-icon x-icon-search' href='#xsearch/" + configName + "/search'>Search</a></li>"
                                    $("#xwikiactions").html(items);
                                      
                                    xmobile.insertChildMenus(screen);
                                  }
                                  }
                                  );
xmobile.addScreen(xwikihomeScreen);


// recent changes
var xrecentScreen = new XWikiScreen(
                                      {
                                      name: "xrecent",
                                      title: "Recent Changes",
                                      parent: "xwikihome",
                                      panelcontent: "<ul id='xwikirecentdocslist'></ul>",
                                      route: "xrecent/:wikiName",
                                      addMainMenus: function(screen) {
                                      },
                                      addParentMenus: function() {
                                        var configName = xmobile.getCurrentConfig();
                                        $("#xwikiactions").append("<li><a class='x-icon x-icon-list' href='#xrecent/" + configName + "'>Recent Changes</a></li>");
                                      },
                                      routeCallback: function(wiki) {
                                        console.log("In xrecent route callback");
  
                                        // make sur the config is set
                                        xmobile.setCurrentConfig(wiki);
                                        xmobile.setCurrentWiki("default");
                                    
                                        // $.ui.loadContent("#xrecent/" + wiki,false,false,"up");
                                        this.showCallback(this);
                                      },
                                      showCallback: function(screen, cache) {
                                        console.log("In xrecent show callback");
         
                                        $("#xwikirecentdocslist").html("");
                                        var data = this.getRecentDocs(xmobile.getCurrentWiki(), cache);
                                        if (data!=null) {
                                         var items = "";
                                         $.each(data.searchResults, function(key, val) {
                                           items += '<li>' + xmobile.getPageHTML(xmobile.getCurrentConfig(), val) + '</li>';
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
    nq.addRequest(this, xmobile.getCurrentConfig() + "." + wikiName + ".xrecent", recentDocsURL, priority, cache, null);
}


xrecentScreen.getRecentDocsURL = function(wikiName) {
    var query = "hidden:false AND type:wikipage AND lang:default AND NOT space:XWiki AND NOT space:Scheduler";
    var searchurl = "query?media=json&type=lucene&q=" + query + ((xmobile.getCurrentService()>=3) ? "&orderField=date&order=desc&prettyNames=true" : "&orderfield=date&order=desc&prettynames=true&number=20");
    return xmobile.getCurrentService().getRestURL(wikiName, searchurl);
}

xrecentScreen.getRecentDocs = function(wikiName, cache) {
    var result = nq.getResult(xmobile.getCurrentConfig() + "." + wikiName + ".xrecent");
    if (result==null || cache==false) {
        // we don't have a request we should add it in the queue
        this.addRecentDocsRequest(wikiName, "high", cache);
        return result;
    } else if (result.status==4 || result.status==3) {
        return $.parseJSON(result.data);
    } else {
        return null;
    }
}

xmobile.addScreen(xrecentScreen);



// spaces screen
var xspacesScreen = new XWikiScreen(
                                  {
                                  name: "xspaces",
                                  title: "Spaces",
                                  parent: "xwikihome",
                                  panelcontent: "<ul id='xwikispaceslist'></ul>",
                                  route: "xspaces/:wikiName",
                                  addMainMenus: function(screen) {
                                  },
                                  addParentMenus: function() {
                                  console.log("Adding spaces menu");
                                  var configName = xmobile.getCurrentConfig();
                                  $("#xwikiactions").append("<li><a class='x-icon x-icon-list x-icon-folder-open' href='#xspaces/" + configName + "'>Spaces</a></li>");
                                  },
                                  routeCallback: function(wiki) {
                                  console.log("In xspaces route callback");
                                  
                                  // make sur the config is set
                                  xmobile.setCurrentConfig(wiki);
                                  xmobile.setCurrentWiki("default");
                                  
                                  this.showCallback(this);
                                  },
                                  showCallback: function(screen, cache) {
                                  console.log("In xspaces show callback");
                                  
                                    $("#xwikispaceslist").html("");
                                    var data = this.getSpaces(xmobile.getCurrentWiki(), cache);
                                    if (data!=null) {
                                    var items = "";
                                    $.each(data.spaces, function(key, val) {
                                           items += "<li><a href='#xspace/" + xmobile.getCurrentConfig() + "/" + val.name + "'>" + val.name + "</a></li>"
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
    nq.addRequest(this, xmobile.getCurrentConfig() + "." + wikiName + ".xspaces", spacesURL, priority, cache, null);
}

xspacesScreen.getSpacesURL = function(wikiName) {
    return xmobile.getCurrentService().getRestURL(wikiName, "spaces?media=json" + ((xmobile.getCurrentService().protocol>=3) ? "&prettyNames=true" : "&prettynames=true"));
}

xspacesScreen.getSpaces = function(wikiName, cache) {
    var result = nq.getResult(xmobile.getCurrentConfig() + "." + wikiName + ".xspaces");
    if (result==null || cache==false) {
        // we don't have a request we should add it in the queue
        this.addSpacesRequest(wikiName,"high", cache);
        return result;
    } else if (result.status==4 || result.status==3) {
        return $.parseJSON(result.data);
    } else {
        return null;
    }
}

xmobile.addScreen(xspacesScreen);

// space page
var xspaceScreen = new XWikiScreen(
                                 {
                                 name: "xspace",
                                 title: "Space",
                                 parent: "xspaces",
                                 panelcontent: "<ul id='xwikispacedocslist'></ul>",
                                 route: "xspace/:wikiName/:spaceName",
                                 addMainMenus: function(screen) {
                                 },
                                 addParentMenus: function() {
                                 },
                                 routeCallback: function(wiki, spaceName) {
                                 console.log("In xspace route callback " + location.hash);
                                 
                                 // make sur the config is set
                                 xmobile.setCurrentConfig(wiki);
                                 xmobile.setCurrentWiki("default");
                                 xmobile.setCurrentSpace(spaceName);
                                 
                                 this.showCallback(this);
                                 },
                                 showCallback: function(screen, cache) {
                                   console.log("In xspace show callback");
                                 
                                   $("#xwikispacedocslist").html("");
                                   var data = this.getSpaceDocs(xmobile.getCurrentWiki(), xmobile.getCurrentSpace(), cache);
                                   if (data!=null) {
                                   var items = "";
                                   $.each(data.searchResults, function(key, val) {
                                          items += '<li>' + xmobile.getPageHTML(xmobile.getCurrentConfig(), val) + '</li>';
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
    nq.addRequest(this, xmobile.getCurrentConfig() + "." + wikiName + ".xspace." + spaceName, spaceDocsURL, priority, cache, null);
}


xspaceScreen.getSpaceDocsURL = function(wikiName, spaceName) {
    var hql = "where doc.space='" + spaceName + "' order by doc.date desc";
    var spacedocsurl = "query?type=hql&q=" + hql + "&media=json&number=20" + ((xmobile.getCurrentService()>=3) ? "&orderField=date&order=desc&prettyNames=true" : "&orderfield=date&order=desc&prettynames=true");
    return xmobile.getCurrentService().getRestURL(wikiName, spacedocsurl);
}

xspaceScreen.getSpaceDocs = function(wikiName, spaceName, cache) {
    var result = nq.getResult(xmobile.getCurrentConfig() + "." + wikiName + ".xspace." + spaceName);
    if (result==null || cache==false) {
        // we don't have a request we should add it in the queue
        this.addSpaceDocsRequest(wikiName, spaceName, "high", cache);
        return result;
    } else if (result.status==4 || result.status==3) {
        return $.parseJSON(result.data);
    } else {
        return null;
    }
}

xmobile.addScreen(xspaceScreen);



// space page
var xpageScreen = new XWikiScreen(
                                   {
                                   name: "xpage",
                                   title: "Page",
                                   parent: "",
                                   panelcontent: "<iframe id='xpageframe' src='pageframe.html' width='98%' height='100%' style='magin: auto; border: 0;' frameborder='0'></iframe>",
                                   route: "xpage/:wikiName/:pageName",
                                   addMainMenus: function(screen) {
                                   },
                                   addParentMenus: function() {
                                   },
                                   routeCallback: function(wiki, pageName) {
                                   console.log("In xpage route callback " + location.hash);
                                   
                                   // make sur the config is set
                                   xmobile.setCurrentConfig(wiki);
                                   xmobile.setCurrentWiki("default");
                                   xmobile.setCurrentPage(pageName);
                                   
                                   this.showCallback(this);
                                   },
                                   showCallback: function(screen, cache) {
                                     console.log("In xpage show callback");
                                     this.setPageContent("");
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
    nq.addRequest(this, xmobile.getCurrentConfig() + "." + wikiName + ".xpage." + pageName, pageURL, priority, cache, null);
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
        return result;
    } else if (result.status==4 || result.status==3) {
        return this.fixHTMLOnline(result.data, wikiName, pageName);
    } else {
        return null;
    }
}

xpageScreen.setPageContent = function(html) {
    var frame = document.getElementById('xpageframe');
    if (frame!=undefined && (frame.contentDocument!=undefined)) {
        var pageContentEl = frame.contentDocument.getElementById('xwikipagecontent');
        if (pageContentEl != undefined) {
            pageContentEl.innerHTML = (html == null) ? "" : html;
            if (html!="")
                squeezeFrame();
        }
    }
}

xpageScreen.fixHTMLOnline = function(html, wikiName, pageName) {
    var baseurl = xmobile.getCurrentService().getViewURL(wikiName, pageName);
    var domainurl = baseurl;
    var pos = baseurl.indexOf('/',9);
    if (pos!=-1)
        domainurl = baseurl.substring(0,pos);
    var newhtml = html.replace(/(<img.*?src\s*=\s*[\"\'])(.*?)([\"\'])/g,function(match) {
                                                   if (arguments[2][0]=='/') {
                                                   var url = domainurl + arguments[2];
                                                   var result = (url==null) ? arguments[1] + arguments[2] + arguments[3]: arguments[1] + url + arguments[3];
                                                   return result;
                                                   } else {
                                                   return arguments[0];
                                                   }
                                                   });
                                                   newhtml = newhtml.replace(/(<a.*?href\s*=\s*[\"\'])(.*?)([\"\'])/g,function(match) {
                                                                                                return arguments[1] + "javascript:void(0)" + arguments[3] + " onclick=\"return parent.xmobile.showlinkOnline(\'" + arguments[2] + "','" + domainurl + "\');\"";
                                                                                                });
                                                                                                return newhtml;
                                                                                                }
                                                                                                

xmobile.addScreen(xpageScreen);


