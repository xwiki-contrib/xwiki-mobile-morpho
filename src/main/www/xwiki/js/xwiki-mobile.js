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
    this.xservices = xservices;
}

XWikiMobile.prototype.loginToServices = function() {
    $.each(this.xservices, function(key, xservice) {
           xservice.setNetworkQueue(nq);
           if (xservice.autoconnect==true)
            xservice.login("default");
           });
}

XWikiMobile.prototype.getCurrentScreenPageName = function(screenName) {
    var pageName = this.getCurrentConfig() + "." + this.getCurrentWiki() + "." + screenName;
    if (screenName=="page")
        pageName += "." + this.getCurrentPage();
    return pageName;
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
    if (nq.lowPriorityQueue.length + nq.highPriorityQueue.length==0) {
        this.showNetworkInactive();
    } else {
        this.showNetworkInactive();
    }
}

XWikiMobile.prototype.reloadCurrentPage = function() {
    var screenName = location.hash.substring(2);
    var i1 = screenName.indexOf("_");
    if (i1!=-1)
        screenName = screenName.substring(0, i1);
    // we are forcing a reload of the current page
    if (this.xscreens[screenName]!=null) {
        console.log("Forcing refresh of page " + screenName);
        this.xscreens[screenName](false);
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
    // network is not active anymore
    this.updateNetworkActive();
    
    var screenName = location.hash.substring(2);
    var i1 = screenName.indexOf("_");
    if (i1!=-1)
        screenName = screenName.substring(0, i1);
    var reqname = request.name;
    if (reqname == this.getCurrentScreenPageName(screenName)) {
        console.log("Correct screen: " + reqname);
        this.xscreens[screenName]();
    }
}

XWikiMobile.prototype.showNetworkStatus = function(div) {
    this.updateNetworkActive();
    $("#xnetwork").html(nq.getQueueStatus());
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


XWikiMobile.prototype.getCurrentPage = function() {
    return sessionStorage.currentPage;
}

XWikiMobile.prototype.setCurrentPage = function(page) {
    sessionStorage.currentPage = page;
}

XWikiMobile.prototype.showWikiHome = function(cache) {
    var xservice = this.getCurrentService();
    if (!xservice.isLoggedIn())
        xservice.login();
    
}

XWikiMobile.prototype.showRecentDocs = function(cache) {
    this.updateNetworkActive();
    $("#xwikirecentdocslist").html("");       
    var data = this.getCurrentService().getRecentDocs(this.getCurrentWiki(), cache);
    if (data!=null) {
        var items = "";
        var that = this;
        $.each(data.searchResults, function(key, val) {
               items += '<li>' + that.getPageHTML(val) + '</li>';
               }); 
        $("#xwikirecentdocslist").html(items);
    }
}

XWikiMobile.prototype.setPageContent = function(html) {
    document.getElementById('xpageframe').contentDocument.getElementById('xwikipagecontent').innerHTML = html;
    if (html!="")
     squeezeFrame();
}

XWikiMobile.prototype.showPage = function(cache) {
    this.updateNetworkActive();
    console.log("page frame: " + $("#xpageframe"));
    this.setPageContent("");
    var data = this.getCurrentService().getPage(this.getCurrentWiki(), this.getCurrentPage(), cache);
    if (data!=null) {
    this.setPageContent(data);
    }
}


XWikiMobile.prototype.getDate = function(gregorianDate) {
    var time = gregorianDate.replace(/.*time=(.*?),.*/, "$1");
    var d = new Date(parseInt(time));
    //return dateFormat(d, "dd/mm/yyyy HH:MM");
    return d.getDay() + "/" + d.getMonth() + "/" + d.getYear();
}

XWikiMobile.prototype.getPageHTML = function(val) {
    var fullName = val.pageFullName;
    return "<a href='#xpage' onclick='xmobile.setCurrentPage(\"" + fullName + "\");'>" + fullName + "</a>";
    /*
     var str = "<div class='pageitem'>"
     + "<div class='pageitem-title'>" + val.title + "</div>";
     if (val.pageFullName)
     str += "<div class='pageitem-name'>Page: " + val.pageFullName + "</div>";
     else
     str += "<div class='pageitem-name'>Page: " + val.fullName + "</div>";
     if (val.version)
     str +=  "<div class='pageitem-modified'>Version: " + val.version + " modified by: " + val.authorName + " on " + getDate(val.modified) + "</div>"
     str += "</div>";
     return str;
     */
}

XWikiMobile.prototype.showlinkOnline = function(url, domainurl) {
    // local url
    if (url[0]=='/' && url.indexOf("/view/")!=-1) {
        var i1 = url.lastIndexOf("/");
        var i2 = url.lastIndexOf("/", i1-1);
        if (i2!=-1) {
            var page = url.substring(i2+1);
            page = page.replace('/', '.');
            this.setCurrentPage(page);
            this.showPage();
            // this is complicated for now as we are loading in the same div
            // $.ui.pushHistory("xpage", "xpage", "", "");
        }
        return false;
    } else {
        alert("Cannot yet display this url: " + url);
        return false;
    }
    return false;
}


XWikiMobile.prototype.initialize = function() {
    this.xscreens = { recentdocs : showRecentDocs, page: showPage, network : showNetworkStatus };
}

function showRecentDocs(cache) {
    return xmobile.showRecentDocs(cache);
}

function showPage(cache) {
    return xmobile.showPage(cache);
}

function showNetworkStatus(cache) {
    return xmobile.showNetworkStatus(cache);
}

function showWikiHome(cache) {
    return xmobile.showWikiHome(cache);
}

function loadedPanel() {
    return xmobile.updateNetworkActive();
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



