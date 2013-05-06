/* MIT licensed */
// (c) 2010 Jesse MacFadyen, Nitobi


(function() {
 
 function iFramePageBrowser() {
 // Does nothing
 this.loaded = false;
 }
 
 /* The interface that you will use to access functionality */
 
 // Show a webpage, will result in a callback to onLocationChange
 iFramePageBrowser.prototype.showWebPage = function(loc)
 {
 };
 
 
 // Show a webpage, will result in a callback to onLocationChange
 iFramePageBrowser.prototype.showHTML = function(html)
 {
 };
 
 // Show a webpage, will result in a callback to onLocationChange
 iFramePageBrowser.prototype.setHTML = function(html)
 {
 };
 
 // Make room/Hide side menu for the side menu to show
 iFramePageBrowser.prototype.toggleSideMenu = function(force)
 {
 // do nothing in xpage browser
 }
 
 // close the browser, will NOT result in close callback
 iFramePageBrowser.prototype.close = function()
 {
 };
 
 // close the browser, will NOT result in close callback
 iFramePageBrowser.prototype.realClose = function()
 {
 };
 

 iFramePageBrowser.prototype.onBeforeLocationChange = function (url) {
 console.log("PAGEBROWSER: before loc change " + url);
 return true;
 };
 
 iFramePageBrowser.prototype.onShouldLocationChange = function(url) {
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
 
 
 iFramePageBrowser.prototype.fixHTMLForPageBrowser = function(html, wikiName, pageName) {
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
                           // this is necessary to navigate to internal links
                           return arguments[1] + "javascript:void(0)" + arguments[3] + " onclick=\"return parent.pageBrowser.showlinkOnline(\'" + arguments[2] + "','" + domainurl + "\');\"";
                           }
                           });
 return newhtml;
 };
 
 iFramePageBrowser.prototype.showlinkOnline = function(url, domainurl) {
 // local url
 if (url[0]=='/' && url.indexOf("/view/")!=-1) {
 var i1 = url.lastIndexOf("/");
 var i2 = url.lastIndexOf("/", i1-1);
 if (i2!=-1) {
 var page = url.substring(i2+1);
 page = page.replace('/', '.');
 
 xmobile.router.navigate("#xpage/" + xmobile.getCurrentFullConfig() + "/" + page, {trigger: true, replace: false});
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

 iFramePageBrowser.prototype.setPageContent = function(html) {
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
};

 
 iFramePageBrowser.prototype.onClose = function(){
  this.loaded = false;
  // we need to force the xmobile UI to go back
  xmobile.goBack();
 };
 
 pageBrowser = new iFramePageBrowser();
 
 })();
