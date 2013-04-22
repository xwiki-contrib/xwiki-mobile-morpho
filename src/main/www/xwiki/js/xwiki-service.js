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
    this.xem = options.xem;
    this.wikis = options.wikis;
    this.url = options.url;
    this.baseurl = options.baseurl;
    this.resturl = options.resturl;
    this.viewurl = options.viewurl;
    this.username = options.username;
    this.password = options.password;
    this.autoconnect = (options.autoconnect) ? options.autoconnect : false;
    this.loggedin = false;
    this.protocol = (options.protocol) ? options.protocol : 3;
};

XWikiService.prototype.getConfig = function() {
    return {
        id : this.id,
        name: this.name,
        xem: this.xem,
        wikis: this.wikis,
        url: this.url,
        baseurl: this.baseurl,
        resturl: this.resturl,
        viewurl: this.viewurl,
        username: this.username,
        password: this.password,
        authconnect: this.autoconnect,
        protocol: this.protocol
    }
}

XWikiService.prototype.setConfig = function(options) {
    this.id = options.id;
    this.name = options.name;
    this.xem = options.xem;
    this.wikis = options.wikis;
    this.url = options.url;
    this.baseurl = options.baseurl;
    this.resturl = options.resturl;
    this.viewurl = options.viewurl;
    this.username = options.username;
    this.password = options.password;
    this.autoconnect = (options.autoconnect) ? options.autoconnect : false;
    this.loggedin = false;
    this.protocol = (options.protocol) ? options.protocol : 3;
}

/**
 Login
 */
XWikiService.prototype.isLoggedIn = function() {
    return this.loggedin;
}

XWikiService.prototype.getWikiConfig = function(wikiName, cache) {
    var result = nq.getResult(this.id + "." + wikiName + ".login");
    if (result==null || cache==false) {
        // we don't have a request we should add it in the queue
        this.login(wikiName, cache);
        return result;
    } else if (result == undefined) {
        return null;
    } else if (result.status==4 || result.status==3) {
        return $.parseJSON(result.data);
    } else {
        return null;
    }
}

XWikiService.prototype.login = function(wikiName, cache) {
    if (cache==null)
        cache = false;
    var loginURL = this.getLoginURL(wikiName);
    nq.addRequest(this, this.id + "." + wikiName + ".login", loginURL, "high", cache, function(req) {
                  console.log("In login callback " + req);
                  try {
                  if (req.data) {
                  var config = $.parseJSON(req.data);
                  // if we
                  if (config.js!="") {
                  eval(config.js);
                  // force refresh
                  xmobile.initScreens();
                  xmobile.reloadCurrentPage();
                  }
                  }
                  } catch(e) {
                  console.log("Exception while parsing js data " + e);
                  }
                  });
    // does not work anymore as it is in the xrecent screen: this.addRecentDocsRequest(wikiName, "high");
    this.loggedin = true;
};

XWikiService.prototype.getLoginURL = function(wikiName) {
    return this.baseurl.replace(/__wiki__/g, wikiName) + "/bin/loginsubmit/XWiki/XWikiLogin?"
    + "j_username=" + this.username + "&j_password=" + this.password + "&j_rememberme=true&xredirect=%2Fxwiki%2Fbin%2Fview%2FXWiki%2FMobileConfig%3Fxpage%3Dplain%26json%3D1%26outputSyntax%3Dplain";
}

/**
  REST Helpers
 */

XWikiService.prototype.getRestURL = function(wikiName, restURL) {
    return this.resturl.replace(/__wiki__/g, wikiName) + restURL;
}

XWikiService.prototype.getViewURL = function(wikiName, pageName) {
    return this.viewurl.replace(/__wiki__/g, wikiName) + pageName.replace(".", "/");
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
