/* MIT licensed */
// (c) 2010 Jesse MacFadyen, Nitobi


(function() {
 
 var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; // old to new fallbacks
 
 function PageBrowser() {
 // Does nothing
 this.loaded = false;
 this.sidemenu = false;
 }
 
 // Callback when the location of the page changes
 // called from native
 PageBrowser._onLocationChange = function(newLoc)
 {
 window.plugins.pageBrowser.onLocationChange(newLoc);
 };
 
 // Callback when the location of the page changes
 // called from native
 PageBrowser._onBeforeLocationChange = function(newLoc)
 {
 window.plugins.pageBrowser.onBeforeLocationChange(newLoc);
 };
 
 // Callback when the location of the page changes
 // called from native
 PageBrowser._onShouldLocationChange = function(newLoc)
 {
 window.plugins.pageBrowser.onShouldLocationChange(newLoc);
 };
 
 // Callback when the user chooses the 'Done' button
 // called from native
 PageBrowser._onClose = function()
 {
 window.plugins.pageBrowser.onClose();
 };
 
 // Callback when the user chooses the 'open in Safari' button
 // called from native
 PageBrowser._onOpenExternal = function()
 {
 window.plugins.pageBrowser.onOpenExternal();
 };
 
 // Pages loaded into the PageBrowser can execute callback scripts, so be careful to
 // check location, and make sure it is a location you trust.
 // Warning ... don't exec arbitrary code, it's risky and could fuck up your app.
 // called from native
 PageBrowser._onJSCallback = function(js,loc)
 {
 // Not Implemented
 //window.plugins.PageBrowser.onJSCallback(js,loc);
 };
 
/* The interface that you will use to access functionality */
 
 // Show a webpage, will result in a callback to onLocationChange
 PageBrowser.prototype.showWebPage = function(loc)
 {
 cordovaRef.exec("PageBrowserCommand.showWebPage", loc);
 };
 
 
 // Show a webpage, will result in a callback to onLocationChange
 PageBrowser.prototype.showHTML = function(html)
 {
 cordovaRef.exec("PageBrowserCommand.showHTML", html);
 };
 
 // Show a webpage, will result in a callback to onLocationChange
 PageBrowser.prototype.setHTML = function(html)
 {
 cordovaRef.exec("PageBrowserCommand.setHTML", html);
 };
 
 // Make room for the side menu to show
 PageBrowser.prototype.showSideMenu = function(html)
 {
 cordovaRef.exec("PageBrowserCommand.showSideMenu", html);
 };

 
 // Hide side menu area
 PageBrowser.prototype.hideSideMenu = function(html)
 {
 cordovaRef.exec("PageBrowserCommand.hideSideMenu", html);
 };

 // Make room/Hide side menu for the side menu to show
 PageBrowser.prototype.toggleSideMenu = function(force)
 {
 if (force==undefined) {
  force = !this.sidemenu;
 }
 
 if (force) {
 this.showSideMenu();
 this.sidemenu = true;
 } else {
 this.hideSideMenu();
 this.sidemenu = false;
 }
 };

 
 // close the browser, will NOT result in close callback
 PageBrowser.prototype.close = function()
 {
 this.loaded = false;
 cordovaRef.exec("PageBrowserCommand.close");
 };
 
 // close the browser, will NOT result in close callback
 PageBrowser.prototype.realClose = function()
 {
 cordovaRef.exec("PageBrowserCommand.realClose");
 };
 
 // Not Implemented
 PageBrowser.prototype.jsExec = function(jsString)
 {
 // Not Implemented!!
 //PhoneGap.exec("PageBrowserCommand.jsExec",jsString);
 };
 
 PageBrowser.prototype.setPageContent = function(header, html) {
 try {
 var content = "<html><body><div id='xwikipageheader'>" + header + "</div>";
 
 content +=  "<div id='xwikipagecontent'>" + html + "</div></body></html>";
 
 if (this.loaded == false) {
 console.log("PAGE: In first loading");
 this.showHTML(content);
 this.loaded = true;
 } else {
 console.log("PAGE: In second loading");
 this.setHTML(content);
 }
 }
 catch (err)
 {
  console.log("Exception in pagebrowser setPageContent: " + err);
 }
 };
 
 
 PageBrowser.prototype.onBeforeLocationChange = function (url) {
 console.log("PAGEBROWSER: before loc change " + url);
 return true;
 };
 
 PageBrowser.prototype.fixHTMLForPageBrowser = function(html, wikiName, pageName) {
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
                           } else if (arguments[2][0]=='/' && arguments[2].indexOf("/view/")==-1) {
                           var result = arguments[1] + domainurl + arguments[2] + arguments[3] ;
                           console.log("Replaced " + arguments[0] + " with " + result);
                           return result;
                           } else {
                           // With the child browser we don't use this anymore
                           // return arguments[1] + "javascript:void(0)" + arguments[3] + " onclick=\"return parent.xmobile.showlinkOnline(\'" + arguments[2] + "','" + domainurl + "\');\"";
                           return arguments[0];
                           }
                           });
 return newhtml;
 }

 
 PageBrowser.prototype.onShouldLocationChange = function(url) {
 try {
 console.log("PAGEBROWSER: should loc change " + url);
 var baseurl = xmobile.getCurrentService().getViewURL(xmobile.getCurrentWiki(), xmobile.getCurrentPage());
 var domainurl = baseurl;
 var pos = baseurl.indexOf('/',9);
 if (pos!=-1)
 domainurl = baseurl.substring(0,pos);
 url = url.substring(7);
 console.log("URL is : " + url);
 
 // local url
 if (url[0]=='/' && url.indexOf("/view/")!=-1) {
 var i1 = url.lastIndexOf("/");
 var i2 = url.lastIndexOf("/", i1-1);
 if (i2!=-1) {
 var page = url.substring(i2+1);
 page = page.replace('/', '.');
 console.log("PAGEBROWSER: Found page " + page);
 
 xmobile.router.navigate("#xpage/" + xmobile.getCurrentFullConfig() + "/" + page, {trigger: true, replace: false});
 return false;
 }
 }
 
 return true;
 } catch(e) {
 console.log("PAGEBROWSER: exception in onShouldLocationChange " + e);
 }
 };
 
 PageBrowser.prototype.onClose = function(){
 this.loaded = false;
 // we need to force the xmobile UI to go back
 xmobile.goBack();
 };
 
 
 
 // Note: this plugin does NOT install itself, call this method some time after deviceready to install it
 // it will be returned, and also available globally from window.plugins.PageBrowser
 PageBrowser.install = function()
 {
 if(!window.plugins) {
 window.plugins = {};
 }
 if ( ! window.plugins.pageBrowser ) {
 window.plugins.pageBrowser = new PageBrowser();
 }
 
 };
 
 
 if (cordovaRef && cordovaRef.addConstructor) {
 cordovaRef.addConstructor(PageBrowser.install);
 } else {
 console.log("PageBrowser Cordova Plugin could not be installed.");
 return null;
 }
 
 
 })();
