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

/* Network module */
/* This module allows to manage a network stack to connect to remote wikis */

// id, name, xem, wikis, baseurl, resturl, viewurl, apps, username, password
function XWikiService(options) {
    this.id = options.id;
    this.name = options.name;
    this.type = (options.type==undefined) ? "xefromxem" : options.type;
    this.wikis = (options.wikis==undefined) ? "" : options.wikis;
    this.url = options.url;
    this.baseurl = options.baseurl;
    this.resturl = options.resturl;
    this.viewurl = options.viewurl;
    this.xembaseurl = (options.xembaseurl==undefined) ? "" : options.xembaseurl;
    this.xemresturl = (options.xemresturl==undefined) ? "" : options.xemresturl;
    this.username = options.username;
    this.password = options.password;
    this.automatic = (options.automatic==undefined) ? "1" : options.automatic;
    this.autoconnect = (options.autoconnect) ? options.autoconnect : false;
    this.protocol = (options.protocol) ? options.protocol : 3;
    
    this.loginStatus = "none";
    
    // network statistics on this service
    // nb of successes since the last failure
    this.nbSuccesses = 0;
    // nb of failures since the last success
    this.nbFailures = 0;
    // last success date
    this.lastSuccess;
    
};

XWikiService.prototype.getConfig = function() {
    return {
        id : this.id,
    name: this.name,
    type: this.type,
    wikis: this.wikis,
    url: this.url,
    baseurl: this.baseurl,
    resturl: this.resturl,
    viewurl: this.viewurl,
    xembaseurl: this.xembaseurl,
    xemresturl: this.xemresturl,
    username: this.username,
    password: this.password,
    automatic: this.automatic,
    authconnect: this.autoconnect,
    protocol: this.protocol
    }
}

XWikiService.prototype.setConfig = function(options) {
    this.id = options.id;
    this.name = options.name;
    this.type = options.type;
    this.wikis = options.wikis;
    this.url = options.url;
    this.baseurl = options.baseurl;
    this.resturl = options.resturl;
    this.viewurl = options.viewurl;
    this.xembaseurl = options.xembaseurl;
    this.xemresturl = options.xemresturl;
    this.username = options.username;
    this.password = options.password;
    this.automatic = options.automatic;
    this.autoconnect = (options.autoconnect) ? options.autoconnect : false;
    this.protocol = (options.protocol) ? options.protocol : 3;
}

/**
 Login
 */
XWikiService.prototype.isLoggedIn = function() {
    return this.loginStatus="success";
}

XWikiService.prototype.isNotLoggedIn = function() {
    return this.loginStatus="none" || this.loginStatus=="failed" || this.loginStatus=="wrongCredentials";
}

XWikiService.prototype.setLoginStatus = function(status) {
    this.loginStatus = status;
}

XWikiService.prototype.getNetworkStatus = function() {
    var str = "<ul><li>Service <strong>" + this.name + "</strong> network status</li><ul>";
    if (this.loginStatus=="failed")
        str += "<li>Login status: <font color='red'><strong>" + this.loginStatus + "</strong></font></li>";
    else
        str += "<li>Login status: <strong>" + this.loginStatus + "</strong></li>";
    str += "<li>Nb successes: " + this.nbSuccesses + "</li>";
    str += "<li>Nb failures: " + this.nbFailures + "</li>";
    str += "<li>Last success: " + this.lastSuccess + "</li>";
    str += "</ul></ul>"
    return str;
}


XWikiService.prototype.readConfig = function(config) {
    if (config.js!="") {
        eval(config.js);
    // force refresh
    xmobile.initScreens();
    xmobile.reloadCurrentPage();
    }
    
    this.notifications = false;
    if (config.notifications!=undefined) {
        this.notifications = true;
        this.pushinterval = config.pushinterval;
        this.pushwikis = config.pushwikis;
        }
}

XWikiService.prototype.getWikiConfig = function(wikiName, cache) {
    if (this.type=="dnsxem" || this.type=="urlxem") {
        console.log("getting wikiconfig of xem subwiki");
        var result = nq.getResult(this.id + "." + wikiName + ".wikiconfig");
        console.log("Result of " + this.id + "." + wikiName + ".wikiconfig" + " is " + result);
        if ((result==null || cache==false)) {
            // we don't have a request we should add it in the queue
            var url = this.baseurl.replace("__wiki__", wikiName) + "/bin/view/XWiki/MobileConfig?xpage=plain&json=1&outputSyntax=plain";
            if (xmobile.devicetoken && xmobile.devicetoken!="") {
                url += "&deviceid=" + xmobile.devicetoken;
            }

            var that = this;
            nq.addRequest(xmobile.getCurrentService(), this.id + "." + wikiName + ".wikiconfig", url, "high", cache, function(xhr) {
                           // parse result
                           var config = $.parseJSON(xhr.data);
                           that.readConfig(config);
                          });
            return null;
        } else if (result == undefined) {
            return null;
        } else if (result.status==4 || result.status==3) {
            if (result.data=="")
                return {};
            else
                return $.parseJSON(result.data);
        } else {
            return null;
        }
    } else {
        var result = nq.getResult(this.id + "." + wikiName + ".login");
        if ((result==null || cache==false) && !this.isLoggedIn()) {
            // we don't have a request we should add it in the queue
            this.login(wikiName, cache);
            return result;
        } else if (result == undefined) {
            return null;
        } else if (result.status==4 || result.status==3) {
            if (result.data=="")
                return {};
            else
                return $.parseJSON(result.data);
        } else {
            return null;
        }
    }
}

XWikiService.prototype.login = function(wikiName, cache) {
    if (cache==null)
        cache = false;
    var loginURL = this.getLoginURL(wikiName);
    var that = this;
    nq.addRequest(this, this.id + "." + wikiName + ".login", loginURL, "high", cache, function(req) {
                  console.log("In login callback " + req);
                  
                  // login was a success
                  if (req.status==4) {
                  that.setLoginStatus("success");
                  }
                  
                  try {
                  if (req.data) {
                  var config = $.parseJSON(req.data);
                  that.readConfig(config);
                  }
                  } catch(e) {
                  console.log("Exception while parsing js data " + e);
                  }
                  });
};

XWikiService.prototype.getLoginURL = function(wikiName) {
    if (this.username=="") {
        if (this.type=="dnsxem")
            return this.xembaseurl + "/bin/view/XWiki/MobileConfig?xpage=plain&json=1&outputSyntax=plain";
        else
            return this.baseurl.replace(/__wiki__/g, wikiName) + "/bin/view/XWiki/MobileConfig?xpage=plain&json=1&outputSyntax=plain";
    } else {
    if (this.type=="dnsxem")
        return this.xembaseurl + "/bin/loginsubmit/XWiki/XWikiLogin?"
        + "j_username=" + this.username + "&j_password=" + this.password + "&j_rememberme=true&xredirect=%2Fxwiki%2Fbin%2Fview%2FXWiki%2FMobileConfig%3Fxpage%3Dplain%26json%3D1%26outputSyntax%3Dplain%26deviceid%3D" + xmobile.devicetoken;
    else
        return this.baseurl.replace(/__wiki__/g, wikiName) + "/bin/loginsubmit/XWiki/XWikiLogin?"
        + "j_username=" + this.username + "&j_password=" + this.password + "&j_rememberme=true&xredirect=%2Fxwiki%2Fbin%2Fview%2FXWiki%2FMobileConfig%3Fxpage%3Dplain%26json%3D1%26outputSyntax%3Dplain%26deviceid%3D" + xmobile.devicetoken;
    }
}

/**
 REST Helpers
 */

XWikiService.prototype.getRestURL = function(wikiName, restURL) {
    return this.resturl.replace(/__wiki__/g, wikiName) + restURL;
}

XWikiService.prototype.getXEMRestURL = function(wikiName, restURL) {
    return this.xemresturl + restURL;
}

XWikiService.prototype.getViewURL = function(wikiName, pageName) {
    var i = pageName.indexOf(".");
    var space = pageName.substring(0,i);
    var page = pageName.substring(i+1);
    
    return this.viewurl.replace(/__wiki__/g, wikiName) + encodeURIComponent(space) + "/" + encodeURIComponent(page);
}

/*
 function isLevel1() {
 return (xwikiconfig[sessionStorage.xwikiconfig].level<2);
 }
 
 function xwikigetresturl(wiki, url) {
 return xwikiconfig[sessionStorage.xwikiconfig].resturl.replace(/__wiki__/g, wiki) + url;
 }
 
 function xwikigetxemresturl(wiki, url) {
 return xwikiconfig[sessionStorage.xwikiconfig].resturl.replace(/__wiki__\//g, "") + url;
 }
 
 function xwikigetresturl2(config, wiki, url) {
 return xwikiconfig[config].resturl.replace(/__wiki__/g, wiki) + url;
 }
 
 function xwikigeturl(wiki, page) {
 return xwikiconfig[sessionStorage.xwikiconfig].viewurl.replace(/__wiki__/g, wiki) + page.replace(".", "/");
 }
 
 function xwikigeturl2(config, wiki, page) {
 return xwikiconfig[config].viewurl.replace(/__wiki__/g, wiki) + page.replace(".", "/");
 }
 
 function xwikigetplainurl(config, wiki, page) {
 var template = "plain";
 if (xwikiconfig[config].template)
 template = xwikiconfig[config].template;
 return xwikiconfig[config].viewurl.replace(/__wiki__/g, wiki) + page.replace(".", "/") + "?xpage=" + template;
 }
 
 
 function xwikigetdownloadurl2(config, wiki, page, filename) {
 return xwikiconfig[config].downloadurl.replace(/__wiki__/g, wiki) + page.replace(".", "/") + "/" + filename;
 }
 
 function xwikionload(wiki, cb) {
 xwikilogin(xwikiconfig[sessionStorage.xwikiconfig], xwikiconfig[sessionStorage.xwikiconfig].baseurl.replace(/__wiki__/g, wiki), xwikiconfig[sessionStorage.xwikiconfig].username, xwikiconfig[sessionStorage.xwikiconfig].password,cb);
 }
 
 function xwikilogin(xwikiconfig, xbaseurl, username, password, cb) {
 showStatusMessage("connecting...");
 var url = xbaseurl + "/bin/loginsubmit/XWiki/XWikiLogin";
 xwikiconfig.level = 1;
 $.ajax({
 url: url,
 type: "POST",
 data: { j_username : username, j_password: password, j_rememberme : "true" }
 }).complete(function (jqXHR, textStatus) {
 
 if (jqXHR.status==200)
 showStatusMessage("success.");
 else
 showStatusMessage("connection failure (code " + jqXHR.status + ").");
 
 // if this URL is not found then we have rest level 1, other wise reset level 2 (additional query URLs are available).
 var queryUrl = xwikigetresturl(sessionStorage.currentwiki, "query?media=json");
 $.getJSON(queryUrl, function (data, textStatus2, jqXHR2) {
 // success so we are level 2
 xwikiconfig.level = 2;
 showStatusMessage("success (new version).");
 }).complete(function(jqXHR2, textStatus2) {
 if (jqXHR2.status==200 && xwikiconfig.level!=2)
 showStatusMessage("success (old version).");
 if (typeof cb!="undefined")
 cb();
 });
 });
 }
 
 */
