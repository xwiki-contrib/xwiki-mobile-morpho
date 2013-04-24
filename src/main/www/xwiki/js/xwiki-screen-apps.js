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

// apps screen
XWikiMobile.prototype.addAppsScreens = function() {
var xappsScreen = new XWikiScreen(
                                      {
                                      name: "xapps",
                                      title: "Applications",
                                      parent: "xwikihome",
                                      panelcontent: "<ul id='xwikiappslist'></ul>",
                                      route: "xapps/:wikiName",
                                      addMainMenus: function() {
                                      },
                                      addParentMenus: function() {
                                        console.log("Adding apps menu");
                                        var configName = xmobile.getCurrentConfig();
                                        $("#xwikiactions").append("<li><a class='x-icon x-icon-list' href='#xapps/" + configName + "'>Applications</a></li>");
                                      },
                                      routeCallback: function(wiki) {
                                        console.log("In xapps route callback");
  
                                        // make sur the config is set
                                        xmobile.setCurrentConfig(wiki);
                                        xmobile.setCurrentWiki("default");
                                  
                                        // $.ui.loadContent("#xapps/" + wiki,false,false,"up");
                                        this.showScreen();
                                      },
                                      showCallback: function(cache) {
                                        console.log("In xapps show callback");
         
                                        $("#xwikiappslist").html("");
                                        var data = xmobile.getCurrentService().getWikiConfig(xmobile.getCurrentWiki(), cache);
                                        if (data!=null) {
                                            var items = "";
                                            var that = this;
                                            $.each(data.apps, function(key, val) {
                                                    var path = val.name + "|" + val.space + "|" + val.classname;
                                                    items += "<li><a href='#xapp/" + xmobile.getCurrentConfig() + "/" + path + "' onclick='xmobile.setCurrentApp(\"" + val.space + "\", \"" + val.classname + "\", \"" + val.name + "\");'>"
                                                               + val.name + "</a></li>"
                                                   });
                                            $("#xwikiappslist").html(items);
                                         }
                                        }
                                      }
                                      );


/**
 Apps
 */

/*
 XWikiService.prototype.addAppsRequest = function(wikiName, priority, cache) {
 if (cache==null)
 cache = true;
 var spacesURL = this.getSpacesURL(wikiName);
 nq.addRequest(xmobile.getCurrentService(), this.id + "." + wikiName + ".spaces", spacesURL, priority, cache, null);
 }
 
 XWikiService.prototype.getAppsURL = function(wikiName) {
 return this.getRestURL(wikiName, "spaces?media=json" + ((xmobile.getCurrentService()>=3) ? "&prettyNames=true" : "&prettynames=true"));
 }
 
 XWikiService.prototype.getApps = function(wikiName, cache) {
 var result = nq.getResult(this.id + "." + wikiName + ".spaces");
 if (result==null || cache==false) {
 // we don't have a request we should add it in the queue
 this.addAppsRequest(wikiName,"high", cache);
 return result;
 } else if (result.status==4 || result.status==3) {
 return $.parseJSON(result.data);
 } else {
 return null;
 }
 }
 */


this.addScreen(xappsScreen);


// app page
var xappScreen = new XWikiScreen(
                                  {
                                  name: "xapp",
                                  title: "Application",
                                  parent: "xapps",
                                  panelcontent: "<ul id='xwikiappdocslist'></ul>",
                                  route: "xapp/:wikiName/:appName|:appPrettyName|:appClassName",
                                  addMainMenus: function() {
                                  },
                                  addParentMenus: function() {
                                  },
                                  routeCallback: function(wiki, appName, prettyName, className) {
                                  console.log("In xapp route callback " + location.hash);
                                  
                                  // make sur the config is set
                                  xmobile.setCurrentConfig(wiki);
                                  xmobile.setCurrentWiki("default");
                                  xmobile.setCurrentApp(appName,prettyName,className);
                                 
                                  // $.ui.loadContent("#xapp/" + wiki + "/" + appName + "|" + prettyName + "|" + className ,false,false,"up");
                                  this.showScreen();
                                  },
                                  showCallback: function(cache) {
                                    console.log("In xapp show callback");
                                  
                                    $("#xwikiappdocslist").html("");
                                    var data = this.getAppDocs(xmobile.getCurrentWiki(), xmobile.getCurrentAppName(), xmobile.getCurrentAppClassName(), cache);
                                    if (data!=null) {
                                        console.log("In xapp show callback showing data");
                                        var items = "";
                                        $.each(data.searchResults, function(key, val) {
                                               items += '<li>' + xmobile.getPageHTML(xmobile.getCurrentConfig(), val) + '</li>';
                                        });
                                    $("#xwikiappdocslist").html(items);
                                   }
                                  }
                                  }
                                  );


// adding network functions
xappScreen.addAppDocsRequest = function(wikiName, appName, className, priority, cache) {
    if (cache==null)
        cache = true;
 
    var appDocsURL = this.getAppDocsURL(wikiName, appName, className);
    console.log("requesting app data");
    nq.addRequest(xmobile.getCurrentService(), xmobile.getCurrentConfig() + "." + wikiName + ".xapp." + appName, appDocsURL, priority, cache, null);
}


xappScreen.getAppDocsURL = function(wikiName, appName, className) {
    var hql = ", BaseObject as obj where doc.fullName=obj.name and obj.className='" + className + "' and doc.space='" + appName + "' order by doc.date desc";
    var appdocsurl = "query?type=hql&q=" + hql + "&media=json&number=20" + ((xmobile.getCurrentService()>=3) ? "&orderField=date&order=desc&prettyNames=true" : "&orderfield=date&order=desc&prettynames=true");
    return xmobile.getCurrentService().getRestURL(wikiName, appdocsurl);
}

xappScreen.getAppDocs = function(wikiName, appName, className, cache) {
    var key = xmobile.getCurrentConfig() + "." + wikiName + ".xapp." + appName;
    console.log("Looking for key: " + key);
    var result = nq.getResult(key);
    if (result==null || cache==false) {
        // we don't have a request we should add it in the queue
        this.addAppDocsRequest(wikiName, appName, className, "high", cache);
        return result;
    } else if (result.status==4 || result.status==3) {
        return $.parseJSON(result.data);
    } else {
        return null;
    }
}
this.addScreen(xappScreen);
}