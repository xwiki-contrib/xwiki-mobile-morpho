/* xwiki mobile js */


$(document).ready(function() {
                  // allow multitouch gestures
                  // self.view.multipleTouchEnabled=1;
                  // self.view.exclusiveTouch=0;

                  sessionStorage.xwikiconfig = 0;
                  if (xwikiconfig[sessionStorage.xwikiconfig].xem==false)
                  sessionStorage.currentwiki = "";
                  else
                  sessionStorage.currentwiki = xwikiconfig[sessionStorage.xwikiconfig].wikis[0];
                  
                  xwikionload(sessionStorage.currentwiki);  
                  
                  });



function showConnectError(jqXHR, textStatus, errorThrown) {
    alert("Connection Failed: " + textStatus + " " + errorThrown);
    $.mobile.hidePageLoadingMsg();
}

$( '#config' ).live( 'pageshow',function(event){
                    $('#syncspaces').val(getSyncSpaces());
                    });

$( '#home' ).live( 'pageinit',function(event){
                  var items = [];
                  $.each(xwikiconfig, function(id, config) {    
                         $.each(config.wikis, function(kwiki, wiki) {     
                                var page = "site.html?config=" + id + "&wiki=" + wiki;
                                if (config.xem) {
                                items.push('<li><a href="' + page + '" onclick="sessionStorage.xwikiconfig=' + id + '; sessionStorage.currentwiki=\'' + wiki + '\'">' + config.name + ': ' + wiki + '</a></li>');
                                } else {
                                items.push('<li><a href="' + page + '" onclick="sessionStorage.xwikiconfig=' + id + '; sessionStorage.currentwiki=\'' + wiki + '\'">' + config.name + '</a></li>');
                                }
                                });
                         });                              
                  $('<ul/>', {
                    'id' : 'wikilist-list',
                    'data-role' : 'listview',
                    'data-filter' : 'true',
                    'data-inset' : 'true',
                    'data-dividertheme': 'f',
                    html: items.join('')
                    }).appendTo('#home-content');
                  $('#wikilist-list').listview();
                  
                  });


$( '#site' ).live( 'pageshow',function(event){
                  var id = sessionStorage.xwikiconfig;
                  var config = xwikiconfig[id];
                  var wiki = sessionStorage.currentwiki;
                  
                  // force login on this wiki
                  xwikionload(sessionStorage.currentwiki);  
                  
                  var wikipagelist = [ 
                                      { name: "Recent Changes", url : "activity.html" },
                                      { name: "Recent Documents (XWiki 4.2+)", url : "recentdocs.html" },
                                      { name: "Applications", url : "apps.html" },
                                      { name: "Spaces", url : "spaces.html" },
                                      { name: "Users", url : "users.html" },
                                      { name: "Search", url : "search.html" },
                                      { name: "Query (XWiki 4.2+)", url : "query.html" },
                                      { name: "Web View", url : "webview.html" },
                                      { name: "Offline", url : "offline.html" }
                                      ];
                  
                  var items = [];
                  if (config.xem) {
                  items.push('<li data-role="list-divider">' + config.name + ': ' + wiki + '</li>');
                  } else {
                  items.push('<li data-role="list-divider">' + config.name + '</li>');
                  }
                  $.each(wikipagelist, function(key, val) {
                         var page = val.url;
                         items.push('<li><a href="' + val.url + '" onclick="sessionStorage.xwikiconfig=' + id + '; sessionStorage.currentwiki=\'' + wiki + '\'">' + val.name + '</a></li>');
                         });
                  
                  $('<ul/>', {
                    'id' : 'siteactions-list-' + id + wiki,
                    'data-role' : 'listview',
                    'data-filter' : 'true',
                    'data-dividertheme': 'f',
                    html: items.join('')
                    }).appendTo('#siteactions');
                  $('#siteactions-list-' + id + wiki).listview();
                  });


$( '#webview' ).live( 'pageshow',function(event){
                     xwikionload(sessionStorage.currentwiki, function() {
                                 $('#page-content-iframe').html('loading...');
                                 $('#page-content-iframe').html('<iframe src="' + xwikigeturl(sessionStorage.currentwiki, "Main.WebHome") + '" width="100%" height="100%" border="0" frameborder="0"></iframe>');
                                 });                     
                     });

$( '#spaces' ).live( 'pageshow',function(event){
                    var spacesurl = xwikigetresturl(sessionStorage.currentwiki, "spaces?media=json");
                    $.getJSON(spacesurl, function(data) {
                              $.mobile.hidePageLoadingMsg();
                              var items = [];
                              $.each(data.spaces, function(key, val) {
                                     var page = 'space.html?space=' + val.name;
                                     items.push('<li><a href="' + page + '" onclick="sessionStorage.space=\'' + page + '\'">' + val.name + '</a></li>');
                                     });
                              $('<ul/>', {
                                'id' : 'spaceslist-list',
                                'data-filter' : 'true',
                                'data-role' : 'listview',
                                html: items.join('')
                                }).appendTo('#spaceslist');
                              $('#spaceslist-list').listview();
                              })
                    setTimeout($.mobile.showPageLoadingMsg, 5); 
                    });

$( '#space' ).live( 'pageshow',function(event){
                   var space = getUrlVars(sessionStorage.space).space;
                   var pagelisturl = xwikigetresturl(sessionStorage.currentwiki, "spaces/" + space + "/pages?media=json&order=date");
                   $.getJSON(pagelisturl, function(data) {
                             $.mobile.hidePageLoadingMsg();
                             var items = [];
                             $.each(data.pageSummaries, function(key, val) {
                                    var page = 'page.html?page=' + val.fullName;
                                    var title = val.title + " (" + val.name + ")";
                                    items.push('<li><a href="' + page + '" onclick="sessionStorage.page=\'' + page + '\'">' + title + '</a></li>');
                                    });
                             $('<ul/>', {
                               'id' : 'pagelist-list',
                               'data-role' : 'listview',
                               'data-filter' : 'true',
                               html: items.join('')
                               }).appendTo('#pagelist');
                             $('#pagelist-list').listview();
                             }).error(showConnectError);
                   setTimeout($.mobile.showPageLoadingMsg, 5); 
});

$( '#activity' ).live( 'pageshow',function(event){
                      var d = new Date();
                      // substract 5 days
                      d.setDate(d.getDate() - 5);
                      var modsurl = xwikigetresturl(sessionStorage.currentwiki, "modifications?media=json&date=" + d.getTime());
                      $.getJSON(modsurl, function(data) {
                                $.mobile.hidePageLoadingMsg();
                                var items = [];
                                $.each(data.historySummaries, function(key, val) {
                                       var page = 'page.html?page=' + val.space + '.' + val.name;
                                       items.push('<li><a href="' + page + '" onclick="sessionStorage.page=\'' + page + '\'">' + val.space + '.' + val.name + ' (' + val.version + ')' + '</a></li>');
                                       });
                                $('#modslist').html("");
                                $('<ul/>', {
                                  'id' : 'modslist-list',
                                  'data-role' : 'listview',
                                  'data-filter' : 'true',
                                  html: items.join('')
                                  }).appendTo('#modslist');
                                $('#modslist-list').listview();
                                }).error(showConnectError);
                      setTimeout($.mobile.showPageLoadingMsg, 5); 
                      });


$( '#page' ).live( 'pageshow',function(event){   
                  var page = getUrlVars(sessionStorage.page).page;
                  updatePage(sessionStorage.xwikiconfig, sessionStorage.currentwiki, page);
                  // loading the attachments lists
                  var attachurl = xwikigetresturl(sessionStorage.currentwiki, "spaces/" + page.replace(".", "/pages/") + "/attachments?media=json");
                  $.getJSON(attachurl, function(data) {
                            var items = [];
                            $.each(data.attachments, function(key, val) {
                                   var page = "file.html?file=" + val.xwikiAbsoluteUrl;
                                   items.push('<li><a href="' + page + '" onclick="sessionStorage.file=\'' + page + '\';">' + val.name + ' (' + val.version + ')' + '</a></li>');
                                   });
                            $('#attachlist').html("");
                            $('<ul/>', {
                              'id' : 'attachlist-list',
                              'data-role' : 'listview',
                              html: items.join('')
                              }).appendTo('#attachlist');
                            $('#attachlist-list').listview();
                            }).error(showConnectError);
                  });                  

$( '#file' ).live( 'pageshow',function(event){   
                  var file = getUrlVars(sessionStorage.file).file;
                  $('#file-content').html('loading...');
                  $('#file-content').html('<iframe src="' + file + '" width="100%" height="100%" border="0" frameborder="0"></iframe>');
                  });

$( '#app' ).live( 'pageshow',function(event){
                 var space = getUrlVars(sessionStorage.space).space;
                 var pagelisturl = xwikigetresturl(sessionStorage.currentwiki, "classes/" + space + "." + space + "Class/objects?media=json&order=date")
                 $.getJSON(pagelisturl, function(data) {
                           $.mobile.hidePageLoadingMsg();
                           var items = [];
                           $.each(data.objectSummaries, function(key, val) {
                                  if (val.pageName!=space + "Template") {
                                  var title = (val.title) ?  val.title + " (" + val.pageName + ")" : val.pageName;
                                  var page = 'page.html?page=' + val.space + "." + val.pageName;
                                  items.push('<li><a href="' + page + '" onclick="sessionStorage.page=\'' + page + '\'">' + title + '</a></li>');
                                  }
                                  });
                           $('<ul/>', {
                             'id' : 'pagelist-list',
                             'data-role' : 'listview',
                             'data-filter' : 'true',
                             html: items.join('')
                             }).appendTo('#pagelist');
                           $('#pagelist-list').listview();
                           }).error(showConnectError);
                 setTimeout($.mobile.showPageLoadingMsg, 5); 
                 });


$( '#app2' ).live( 'pageshow',function(event){
                  var classname = getUrlVars(sessionStorage.app2).classname;
                  var pagelisturl = xwikigetresturl(sessionStorage.currentwiki, "classes/" + classname + "/objects?media=json&order=date");
                  $.getJSON(pagelisturl, function(data) {
                            $.mobile.hidePageLoadingMsg();
                            var items = [];
                            $.each(data.objectSummaries, function(key, val) {
                                   if (val.space + '.' + val.pageName!=classname.replace('Class', 'Template')) {
                                   var title = (val.title) ?  val.title + " (" + val.pageName + ")" : val.pageName;
                                   var page = 'page.html?page=' + val.space + "." + val.pageName;
                                   items.push('<li><a href="' + page + '" onclick="sessionStorage.page=\'' + page + '\'">' + title + '</a></li>');
                                   }
                                   });
                            $('<ul/>', {
                              'id' : 'pagelist-list',
                              'data-role' : 'listview',
                              'data-filter'  : 'true',
                              html: items.join('')
                              }).appendTo('#pagelist');
                            $('#pagelist-list').listview();
                            }).error(showConnectError);
                  setTimeout($.mobile.showPageLoadingMsg, 5); 
                  });

$( '#users' ).live( 'pageshow',function(event){
                   var pagelisturl = xwikigetresturl(sessionStorage.currentwiki, "classes/XWiki.XWikiUsers/objects?media=json");
                   $.getJSON(pagelisturl, function(data) {
                             $.mobile.hidePageLoadingMsg();
                             var items = [];
                             $.each(data.objectSummaries, function(key, val) {
                                    var page = 'page.html?page=' + val.space + "." + val.pageName;
                                    items.push('<li><a href="' + page + '" onclick="sessionStorage.page=\'' + page + '\'">' + val.pageName + '</a></li>');
                                    });
                             $('<ul/>', {
                               'id' : 'pagelist-list',
                               'data-role' : 'listview',
                               'data-filter'  : 'true',
                               html: items.join('')
                               }).appendTo('#pagelist');
                             $('#pagelist-list').listview();
                             }).error(showConnectError);
                   setTimeout($.mobile.showPageLoadingMsg, 5); 
                   });

$( '#apps' ).live( 'pageshow',function(event){
                  var spacesurl = xwikigetresturl(sessionStorage.currentwiki, "classes/AppWithinMinutes.LiveTableClass/objects?media=json");
                  $.getJSON(spacesurl, function(data) {
                            $.mobile.hidePageLoadingMsg();
                            var items = [];   
                            $.each(xwikiconfig[sessionStorage.xwikiconfig].apps[sessionStorage.currentwiki], function(key, val) {
                                   var page = 'app2.html?space=' + val.space + '&classname=' + val.classname;
                                   
                                   items.push('<li><a href="' + page + '" onclick="sessionStorage.app2=\'' + page + '\'; sessionStorage.classname=\'' + val.classname + '\';">' + val.name + '</a></li>');                                   
                                   });
                            if (data.objectSummaries) {
                            $.each(data.objectSummaries, function(key, val) {
                                   if (val.space!="AppWithinMinutes") {
                                   var page = 'app.html?space=' + val.space;
                                   items.push('<li><a href="' + page + '" onclick="sessionStorage.space=\'' + page + '\'">' + val.space + '</a></li>');
                                   }
                                   });
                            }
                            
                            $('<ul/>', {
                              'id' : 'spaceslist-list',
                              'data-role' : 'listview',
                              'data-filter'  : 'true',
                              html: items.join('')
                              }).appendTo('#spaceslist');
                            $('#spaceslist-list').listview();
                            }).error(showConnectError);
                  setTimeout($.mobile.showPageLoadingMsg, 5); 
                  });

$( '#search' ).live( 'pageshow',function(event){
                    $("#searchinput").bind( "change", function(event, ui) {
                                           $.mobile.showPageLoadingMsg();
                                           var searchurl = xwikigetresturl(sessionStorage.currentwiki, "search?media=json&scope=name&q=" + $(this).val());
                                           $.getJSON(searchurl, function(data) {
                                                     $.mobile.hidePageLoadingMsg()
                                                     var items = [];
                                                     $.each(data.searchResults, function(key, val) {
                                                            var page = 'page.html?page=' + val.pageFullName;
                                                            items.push('<li><a href="' + page + '" onclick="sessionStorage.page=\'' + page + '\'">' + val.pageFullName + '</a></li>');
                                                            });
                                                     $('#pagelist').html("");
                                                     $('<ul/>', {
                                                       'id' : 'pagelist-list',
                                                       'data-role' : 'listview',
                                                       'data-filter'  : 'true',
                                                       html: items.join('')
                                                       }).appendTo('#pagelist');
                                                     $('#pagelist-list').listview();
                                                     }).error(showConnectError);
                                           });
                    });


$( '#query' ).live( 'pageinit',function(event){
                    $("#searchinput").bind( "change", function(event, ui) {
                                           $.mobile.showPageLoadingMsg();
                                           var q = $(this).val();
                                           var type = "lucene";
                                           var query = q;
                                           if (q.indexOf("lucene:")==0||q.indexOf("xwql:")==0||q.indexOf("hql:")==0) {
                                             var pos = q.indexOf(":");
                                           type = q.substring(0, pos);
                                           query = q.substring(pos+1);
                                           }                                           
                                           var searchurl = xwikigetresturl(sessionStorage.currentwiki, "query?media=json&type=" + type + "&q=" + query + "&number=5");
                                           $.getJSON(searchurl, function(data) {
                                                     $.mobile.hidePageLoadingMsg()
                                                     var items = [];
                                                     $.each(data.searchResults, function(key, val) {
                                                            var page = 'page.html?page=' + val.pageFullName;
                                                            items.push('<li><a href="' + page + '" onclick="sessionStorage.page=\'' + page + '\'">' + val.pageFullName + '</a></li>');
                                                            });
                                                     $('#pagelist').html("");
                                                     $('<ul/>', {
                                                       'id' : 'pagelist-list',
                                                       'data-role' : 'listview',
                                                       'data-filter'  : 'true',
                                                       html: items.join('')
                                                       }).appendTo('#pagelist');
                                                     $('#pagelist-list').listview();
                                                     }).error(showConnectError);
                                           });
                    });

$( '#recentdocs' ).live( 'pageinit',function(event){
                                          $.mobile.showPageLoadingMsg();
                                          var type = "lucene";
                                          var query = "lang:default AND hidden:false AND type:wikipage";                                          
                                          var searchurl = xwikigetresturl(sessionStorage.currentwiki, "query?media=json&type=" + type + "&q=" + query + "&order=-date");
                                          $.getJSON(searchurl, function(data) {
                                                    $.mobile.hidePageLoadingMsg()
                                                    var items = [];
                                                    $.each(data.searchResults, function(key, val) {
                                                           var page = 'page.html?page=' + val.pageFullName;
                                                           items.push('<li><a href="' + page + '" onclick="sessionStorage.page=\'' + page + '\'">' + val.pageFullName + '</a></li>');
                                                           });
                                                    $('#pagelist').html("");
                                                    $('<ul/>', {
                                                      'id' : 'pagelist-list',
                                                      'data-role' : 'listview',
                                                      'data-filter'  : 'true',
                                                      html: items.join('')
                                                      }).appendTo('#pagelist');
                                                    $('#pagelist-list').listview();
                                                    }).error(showConnectError);
                   });

function updatePage(config, wiki, pagename) {
    var url = xwikigetplainurl(config, wiki, pagename);
    $.ajax({
           url: url,
           type: "GET",
           }).complete(function ( data ) { 
                       $.mobile.hidePageLoadingMsg();
                       var html = fixHTMLOnline(data.responseText, config + ":" + wiki + ":" + pagename, url);
                       try {
                       $('#page-content').html(html);
                       } catch (e) {
                       console.log("Exception while inserting HTML offline page " + e);
                       }
                       }).error(showConnectError);
    setTimeout($.mobile.showPageLoadingMsg, 5); 
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

function xwikigetresturl(wiki, url) {
    return xwikiconfig[sessionStorage.xwikiconfig].resturl.replace(/__wiki__/g, wiki) + url;
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
    xwikilogin(xwikiconfig[sessionStorage.xwikiconfig].baseurl.replace(/__wiki__/g, wiki), xwikiconfig[sessionStorage.xwikiconfig].username, xwikiconfig[sessionStorage.xwikiconfig].password,cb);
}

/*
 Perform XWiki login
 */
function xwikilogin(xbaseurl, username, password, cb) {
    var url = xbaseurl + "/bin/loginsubmit/XWiki/XWikiLogin";
    // alert(url);
    $.ajax({
           url: url,
           type: "POST",
           data: { j_username : username, j_password: password, j_rememberme : "true" }
           }).complete(function ( data ) {
                       // callback
                       if (typeof cb!="undefined")
                       cb();       
                       });
}

function mylinkOnline(url, domainurl) {
    // local url
    if (url[0]=='/' && url.indexOf("/view/")!=-1) {
        var i1 = url.lastIndexOf("/");
        var i2 = url.lastIndexOf("/", i1-1);
        if (i2!=-1) {
            var page = url.substring(i2+1);
            page = page.replace('/', '.');
            var pageurl = 'page.html?page=' + page;
            sessionStorage.page = pageurl;
            updatePage(sessionStorage.xwikiconfig, sessionStorage.currentwiki, page);
            // $.mobile.changePage(pageurl);
        }
        return false;
    } else {
        var page = (url[0]=='/') ? "file.html?file=" + domainurl + url : "file.html?file=" + url;
        sessionStorage.file = page;
        $.mobile.changePage(page);
        return false;
    }
    return false;
}


                                                 function fixHTMLOnline(html, page) {
                                                 var data = page.split(":");
                                                 var config = parseInt(data[0]);
                                                 var wiki = data[1];
                                                 var pageName = data[2];
                                                 var baseurl = xwikigeturl2(config, wiki, pageName);
                                                 var domainurl = baseurl;
                                                 var pos = baseurl.indexOf('/',9);
                                                 if (pos!=-1)
                                                 domainurl = baseurl.substring(0,pos);
                                                 sessionStorage.domainurl = domainurl;
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
                                                                                                                                             return arguments[1] + "javascript:void(0)" + arguments[3] + " onclick=\"return mylinkOnline(\'" + arguments[2] + "','" + domainurl + "\');\"";           
                                                                                                                                             });
                                                                                                                                             return newhtml;
                                                                                                                                             }