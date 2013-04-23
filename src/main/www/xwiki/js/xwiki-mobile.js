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

function XWikiMobile(xservices) {
    this.xservices = null;
    try {
        this.readConfig()
    } catch (e) {
        console.log("Exception reading config " + e);
    }

    if (_.size(this.xservices) == 0) {
      this.xservices = xservices;
      this.saveConfig();
    }

    // list of screens
    this.xscreens = {};
    
    this.router = null;
}

XWikiMobile.prototype.saveConfig = function() {
    var config = {};
    $.each(this.xservices, function(key, service) {
           config[key] = service.getConfig();
           })
    window.localStorage.setItem("xconfig", JSON.stringify(config));
}

XWikiMobile.prototype.readConfig = function() {
    var allconfig = JSON.parse(window.localStorage.getItem("xconfig"));
    this.xservices = {};
    var count = 0;
    var that = this;
    $.each(allconfig, function(key, config) {
           console.log("Reading config: " + key + " " + config);
           that.xservices[key] = new XWikiService(config);
           count ++;
           });
    if (count==0)
        this.xservices = {};
}

XWikiMobile.prototype.saveWikiConfig = function(wikiName, xconfig) {
    if (wikiName!=xconfig.id) {
        if (this.xservices[xconfig.id] == undefined) {
         this.xservices[xconfig.id] = this.xservices[wikiName];
         delete this.xservices[wikiName];
        } else
            xconfig.id = wikiName;
    }
    
    this.xservices[xconfig.id].setConfig(xconfig);
    this.saveConfig();
    xmobile.showWikis();
}

XWikiMobile.prototype.addWikiConfig = function(wikiName) {
    if (this.xservices[wikiName]==undefined) {
        var url = "https://" + wikiName + ".cloud.xwiki.com";
        var baseurl = url + "/xwiki";
        var viewurl = baseurl + "/bin/view/";
        var resturl = baseurl + "/rest/wikis/xwiki/";
        
        this.xservices[wikiName] = new XWikiService({ id: wikiName, name: wikiName, url: url, baseurl: baseurl, viewurl: viewurl, resturl: resturl, username: "", password: "", autoconnect: false });
        
        this.saveConfig();
        xmobile.showWikis();
        return true;
    } else {
        return false;
    }
}
XWikiMobile.prototype.deleteWikiConfig = function(wikiName) {
    delete this.xservices[wikiName];
    this.saveConfig();
    xmobile.showWikis();
}

// this list is important in order to force refreshing on the page
XWikiMobile.prototype.initialize = function() {
}

XWikiMobile.prototype.setRouter = function(router) {
    this.router = router;
}

XWikiMobile.prototype.loginToServices = function() {
    $.each(this.xservices, function(key, xservice) {
           if (xservice.autoconnect==true)
            xservice.login("default");
           });
}

XWikiMobile.prototype.getCurrentScreenPageName = function(screenName) {
    var screenPageName = this.getCurrentConfig() + "." + this.getCurrentWiki() + "." + screenName;
    if (screenName=="xapps")
        screenPageName = this.getCurrentConfig() + "." + this.getCurrentWiki() + ".login";
    if (screenName=="xpage")
        screenPageName += "." + this.getCurrentPage();
    if (screenName=="xapp")
        screenPageName += "." + this.getCurrentAppName();
    if (screenName=="xspace")
        screenPageName += "." + this.getCurrentSpace();
    if (screenName=="xsearch")
        screenPageName += "." + this.getCurrentKeyword();
    console.log("Screen Page Name: " + screenPageName);
    return screenPageName;
}

XWikiMobile.prototype.showNetworkActive = function() {
    $("#navbar_network").removeClass("wifi");
    $("#navbar_network").addClass("loading");
}

XWikiMobile.prototype.showNetworkInactive = function() {
    $("#navbar_network").removeClass("loading");
    $("#navbar_network").addClass("wifi");
}

XWikiMobile.prototype.updateNetworkActive = function() {
    // network is not active anymore
    var nbactive = nq.lowPriorityQueue.length + nq.highPriorityQueue.length + nq.runningQueue.length;
    if (nbactive==0) {
        if (this.getCurrentService()!=null && this.getCurrentService().nbFailures>0) {
         this.showNetworkInactive();
         $.ui.updateBadge("#navbar_network", "x", "tr")            
        } else {
         this.showNetworkInactive();
         $.ui.removeBadge("#navbar_network")
        }
    } else {
        this.showNetworkActive();
        $.ui.updateBadge("#navbar_network", "" + nbactive, "tr")
    }
}

XWikiMobile.prototype.reloadCurrentPage = function() {
    var screenName = location.hash.substring(1);
    var i1 = screenName.indexOf("/");
    if (i1!=-1)
        screenName = screenName.substring(0, i1);
    console.log("Looking to reload screen " + screenName);
    // we are forcing a reload of the current page
    if (this.xscreens[screenName]!=null) {
        console.log("Forcing refresh of page " + screenName);
        this.xscreens[screenName].showCallback(false);
    }
}

XWikiMobile.prototype.relogin = function() {
    var screenName = location.hash.substring(2);
    var i1 = screenName.indexOf("_");
    if (i1!=-1)
        screenName = screenName.substring(0, i1);
    if (screenName=="main")
        this.loginToServices();
    else
        this.getCurrentService().login("default");
        
}

XWikiMobile.prototype.xwikiCallback = function(request) {
    try {
        if (request.callback) {
            request.callback(request);
        }
    } catch (e) {
        console.log("Exception in request callback: " + e);       
    }
    
    try {
    // network is not active anymore
    this.updateNetworkActive();
    
    var screenName = location.hash.substring(1);
        
        
    var i1 = screenName.indexOf("/");
    if (i1!=-1)
        screenName = screenName.substring(0, i1);
        console.log("ScreenName: " + screenName);
   
        var reqname = request.name;
        console.log("Request name: " + reqname);
        
    if (reqname == this.getCurrentScreenPageName(screenName)) {
        console.log("Correct screen: " + reqname + " " + screenName);
        if (this.xscreens[screenName] != undefined) {
            this.xscreens[screenName].showCallback(true)
        }
    }        
    } catch (e) {
        console.log("Exception in screen callback: " + e);
    }
}


XWikiMobile.prototype.addScreen = function(screen) {
    this.xscreens[screen.name] = screen;
}

XWikiMobile.prototype.initScreens = function() {
    console.log("Initializing screens");
    $.each(this.xscreens, function(key, screen) {
           if (screen.initialized==false) {
           console.log("Initializing screen: " + screen.name);
           
           // adding route
           this.router.route(screen.route, screen.name);
           var sname = screen.name;
           this.router.on('route:' + screen.name , function(p1,p2,p3,p4,p5) {
                          console.log("In router callback " + sname);
                          $("#open").hide();
                          screen.routeCallback(p1,p2,p3,p4,p5);
                          });
           
           // adding panel to UI
           if (screen.panelcontent!="")
           $.ui.addContentDiv(screen.name,screen.panelcontent,screen.title);
           
           // adding menus
           screen.addMainMenus(screen);
           screen.initialized = true;
           }
           });
}

XWikiMobile.prototype.insertChildMenus = function(parentscreen) {
    $.each(this.xscreens, function(key, screen) {
           if (screen.parent==parentscreen.name && screen.addParentMenus != undefined) {
           screen.addParentMenus();
           }
           });
}

XWikiMobile.prototype.showWikis = function() {
    $.ui.setBackButtonText("Back");
    $("#xwikilist").html("");
    var items = "";
    var that = this;
    $.each(this.xservices, function(key, val) {
           var wikiConfig = val.getConfig();
           items += "<li><a class='x-icon x-icon-cloud' href='#xwikihome/" + wikiConfig.id + "' id='jqmlink' onClick='return false;'>" + wikiConfig.name + "</a></li>";
           });
    $("#xwikilist").html(items);
}

XWikiMobile.prototype.getCurrentService = function() {
    return this.xservices[this.getCurrentConfig()];
}

XWikiMobile.prototype.getCurrentConfig = function() {
    return sessionStorage.currentConfig
}
    
XWikiMobile.prototype.setCurrentConfig = function(config) {
    sessionStorage.currentConfig = config;
}

XWikiMobile.prototype.getCurrentWiki = function() {
    return sessionStorage.currentWiki;
}

XWikiMobile.prototype.setCurrentWiki = function(wiki) {
    sessionStorage.currentWiki = wiki;
}

XWikiMobile.prototype.getCurrentSpace = function() {
    return sessionStorage.currentSpace;
}

XWikiMobile.prototype.setCurrentSpace = function(space) {
    sessionStorage.currentSpace = space;
}

XWikiMobile.prototype.getCurrentAppName = function() {
    return sessionStorage.currentApp;
}

XWikiMobile.prototype.getCurrentAppPrettyName = function() {
    return sessionStorage.currentAppPrettyName;
}

XWikiMobile.prototype.getCurrentAppClassName = function() {
    return sessionStorage.currentAppClassName;
}

XWikiMobile.prototype.setCurrentApp = function(appName, prettyName, className) {
    sessionStorage.currentApp = appName;
    sessionStorage.currentAppClassName = className;
    sessionStorage.currentPrettyName = prettyName;
}

XWikiMobile.prototype.getCurrentPage = function() {
    return sessionStorage.currentPage;
}

XWikiMobile.prototype.setCurrentPage = function(page) {
    sessionStorage.currentPage = page;
}

XWikiMobile.prototype.getCurrentKeyword = function() {
    return sessionStorage.currentKeyword;
}

XWikiMobile.prototype.setCurrentKeyword = function(keyword) {
    sessionStorage.currentKeyword = keyword;
}

XWikiMobile.prototype.getNetworkStatus = function() {
   var str = "";
   $.each(this.xservices, function(key, xservice) {
          str += xservice.getNetworkStatus();
          });
    
    str += nq.getQueueStatus();
    return str;
}


XWikiMobile.prototype.getDate = function(gregorianDate) {
    var time = gregorianDate.replace(/.*time=(.*?),.*/, "$1");
    var d = new Date(parseInt(time));
    return moment(d).format('DD/MM/YYYY HH:MM')
}

XWikiMobile.prototype.getPageHTML = function(wikiName, val) {
    // var fullName = val.pageFullName;
    // return "<a href='#xpage/" + wikiName + "/" + val.pageFullName + "'>" + fullName + "</a>";
    
    var str = "<div class='pageitem'>"
    + "<a href='#xpage/" + wikiName + "/" + val.pageFullName + "'>"
    + "<div class='pageitem-title'>" + val.title + "</div></a>";
    if (val.pageFullName)
        str += "<div class='pageitem-name'>Page: " + val.pageFullName + "</div>";
    else
        str += "<div class='pageitem-name'>Page: " + val.fullName + "</div>";
    var author = val.authorName;
    if (author == undefined) {
        author = (val.author==undefined) ? "" : val.author.replace("XWiki.", "");
    }
    
    if (val.version)
        str +=  "<div class='pageitem-modified'>Version: " + val.version + " modified by " + author + " on " + this.getDate(val.modified) + "</div>"
        str += "</div>";
    return str;
}

XWikiMobile.prototype.showlinkOnline = function(url, domainurl) {
    // local url
    if (url[0]=='/' && url.indexOf("/view/")!=-1) {
        var i1 = url.lastIndexOf("/");
        var i2 = url.lastIndexOf("/", i1-1);
        if (i2!=-1) {
            var page = url.substring(i2+1);
            page = page.replace('/', '.');
            
            router.navigate("#xpage/" + this.getCurrentConfig() + "/" + page, {trigger: true, replace: false});
        }
        return false;
    } else {
        if (confirm("This is an external URL. Would you like to open it ?")) {
            var frame = document.getElementById('xpageframe');
            if (frame!=undefined)
                frame.src = url;
        }
        return false;
    }
    return false;
}

/*
 API to open the current page in a separate browser
 */
XWikiMobile.prototype.open = function() {
    var xs = this.getCurrentService();
    var url = xs.getViewURL(this.getCurrentWiki(), this.getCurrentPage());
    window.open(url, "_system");
}

/*
function getPageHTMLFromObject(val) {
    var str = "<div class='pageitem'>"
    + "<div class='pageitem-title'>" + val.space + "." + val.pageName + "</div>"
    +  "<div class='pageitem-name'>Page: " + val.space + "." + val.pageName + "</div>"
    +  "</div>";
    return str;
}


function getUrlVars(page) {
    var vars = [], hash;
    var href = (page==null) ? window.location.href : page;
    var queryUrl =href.slice(href.lastIndexOf('?') + 1);
    var hashes = queryUrl.split('&');
    for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = decodeURIComponent(hash[1]);
    }
    return vars;
}


function showStatusMessage(msg) {
    if (msg=="")
        $('.ui-title').html("&copy; 2012 XWiki SAS");
    else
        $('.ui-title').html("&copy; 2012 XWiki SAS: " + msg);
}
 */



