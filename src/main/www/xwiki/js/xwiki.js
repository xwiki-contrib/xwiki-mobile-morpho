/* xwiki mobile js */

sessionStorage.xwikiconfig = 0;
sessionStorage.currentwiki = "";
offlinecontent = {};
// defaultsyncspaces = "app:Events:0:marketing:EventsCode.EventClass";
defaultsyncspaces = "space:Procedures:0:projects:Procedures,app:Events:0:marketing:EventsCode.EventClass,app:Presentation:0:marketing:PresentationsCode.PresentationsClass";
//defaultsyncspaces = "space:Procedures:0:projects:Procedures";
//defaultsyncspaces = "space:Sandbox:0:xwiki:Sandbox";
syncinprogress = false;
syncstopping = false;
syncspaces = [];
syncpages = [];
syncfiles = [];
syncfailed = [];
cordovaready = false;
nbfilessynced = 0;
maxsyncpages = 1000;
totalsyncpages = 0;
totalsyncfiles = 0;
urlmap = "";
pagesmap = {};

xwikiconfig = [
               /*{
                id : "local",
                name: "Local Account",
                xem : false,
                wikis : [""],
                baseurl : "http://localhost:8080/xwiki",
                resturl : "http://localhost:8080/xwiki/rest/wikis/xwiki/",
                viewurl : "http://localhost:8080/xwiki/bin/view/",
                apps : [ { name: "Bikes", space: "Bikes", classname : "BikesCode.BikesClass" } ],                            
                username : "Admin",
                password : "admin"
                },
                
                {
                id : "ludovic",
                name: "Ludovic's Cloud Account",
                xem : false,
                wikis : [""],
                baseurl : "http://ludovic.cloud.xwiki.com/xwiki",
                resturl : "http://ludovic.cloud.xwiki.com/xwiki/rest/wikis/wiki0/",
                viewurl : "http://ludovic.cloud.xwiki.com/xwiki/bin/view/",
                apps : [ { name: "Bikes", space: "Bikes", classname : "BikesCode.BikesClass" } ],                            
                username : "Admin",
                password : "toimoilui"
                },*/
               {
               id : "xwikisas",
               name: "XWiki SAS Intranet",
               xem : true,
               wikis : ["sales", "marketing", "products", "projects", "support", "hr", "paris", "iasi", "platform", "research"],
               baseurl : "https://__wiki__.xwikisas.com/xwiki",
               resturl : "https://www.xwikisas.com/xwiki/rest/wikis/__wiki__/",
               viewurl : "https://__wiki__.xwikisas.com/xwiki/bin/view/",
               downloadurl : "https://__wiki__.xwikisas.com/xwiki/bin/download/",
               apps : { "hr" : [{ name: "Recruitment", space: "Recruitment", classname : "RecruitmentCode.CandidateClass" },
                                { name: "Holiday Requests", space: "HolidayRequest", classname : "HolidayRequestCode.HolidayRequestClass" },
                                { name: "Expense Reports", space: "ExpenseReport", classname : "ExpenseReportCode.ExpenseReportClass" },
                                { name: "Evaluations", space: "Evaluation", classname : "EvaluationCode.EvaluationMeetingClass" },
                                { name: "Employees", space: "RH", classname : "RH.EmployeeClass" },
                                { name: "Meetings", space: "Meetings", classname : "MMCode.MeetingClass" }
                                ],
               "sales" : [
                          { name: "Accounts", space: "CRM", classname : "CRMClasses.CRMAccountClass" },
                          { name: "Projects", space: "CRM", classname : "CRMClasses.CRMProjectClass" },
                          { name: "Contacts", space: "CRM", classname : "CRMClasses.CRMContactClass" },
                          { name: "Invoices", space: "CRM", classname : "CRMClasses.CRMInvoiceClass" }
                          ],
               "marketing" : [
                              { name: "Presentations", space: "Presentation", classname : "PresentationsCode.PresentationsClass" },
                              { name: "Events", space: "Events", classname : "EventsCode.EventClass" },
                              { name: "Meetings", space: "Meetings", classname : "MMCode.MeetingClass" }
                              ],
               "products" : [
                             { name: "Features", space: "Roadmap", classname : "IdeaCode.IdeaClass" }
                             ],
               
               "projects" : [                            
                             { name: "Projects", space: "Projects", classname : "PMCode.XProjectClass" },
                             { name: "Releases", space: "Projects", classname : "PMCode.ReleaseNoteClass" },
                             { name: "Meetings", space: "Meetings", classname : "MMCode.MeetingClass" }
                             ],
               "support" : [                            
                            { name: "Contracts", space: "Contracts", classname : "SupportCode.ContractClass" },
                            { name: "Meetings", space: "Meetings", classname : "MMCode.MeetingClass" }
                            ],
               "paris" : [
                          { name: "Xambox", space: "XamBox", classname : "XamBoxCode.XamBoxDocumentClass" }
                          ],
               "iasi" : [
                         { name: "Xambox", space: "XamBox", classname : "XamBoxCode.XamBoxDocumentClass" }
                         ],
               "platform" : [
                             { name: "Machines", space: "Platform", classname : "PlatformCode.MachineClass" },
                             { name: "VMs", space: "Platform", classname : "PlatformCode.VMClass" },
                             { name: "Farms", space: "Platform", classname : "PlatformCode.FarmClass" },
                             { name: "Contracts", space: "Platform", classname : "PlatformCode.ContractClass" },
                             { name: "Contract Items", space: "Platform", classname : "PlatformCode.ContractItemClass" },
                             { name: "Meetings", space: "Meetings", classname : "MMCode.MeetingClass" }
                             ],
               "research" : []
               },                           
               username : "TestTest",
               password : "test2011"
               }
               ]

$(document).ready(function() {
                  sessionStorage.xwikiconfig = 0;
                  if (xwikiconfig[sessionStorage.xwikiconfig].xem==false)
                  sessionStorage.currentwiki = "";
                  else
                  sessionStorage.currentwiki = xwikiconfig[sessionStorage.xwikiconfig].wikis[0];
                  
                  xwikionload(sessionStorage.currentwiki);  
                  
                  });

function stopSync() {
    syncstopping = true;
    $('#syncstatus').append("Syncing stop requested<br />");
}

function getSyncSpaces() {
    var syncspaces = window.localStorage.getItem("xwiki.syncspaces");
    if (syncspaces==null)
        syncspaces = defaultsyncspaces.split(",");
    else 
        syncspaces = syncspaces.split(",");
    return syncspaces;   
}

// regular updating of offline content
function startSync(full) {
    if (syncinprogress) {
        alert("Sync is already in progress");
    }
    syncinprogress = true;
    
    syncspaces = getSyncSpaces();
    
    $('#syncstatus').html("Syncing started<br />");
    var pagelist = getPageList();
    $('#syncstatus').append("" + pagelist.length + " pages in local store.<br />");
    
    syncNextSpace();
}

function syncStatus() {
    if (syncinprogress)
        $('#syncstatus').append("Syncing started<br />");
    else
        $('#syncstatus').append("Syncing stopped<br />");
    var pagelist = getPageList();
    $('#syncstatus').append("" + pagelist.length + " pages in local store.<br />");   
}

function syncNextSpace() {    
    if (syncstopping) {
        $('#syncstatus').append("Sync stopped.<br />");
        syncinprogress = false;
        syncstopping = false;
        return;
    }
    
    var space = (syncspaces.length==0) ? null : syncspaces[0];
    syncspaces.shift();
    if (space==null) {
        $('#syncstatus').append("Added all pages to pages to sync.<br />");
        // note down how many pages we have to sync                                         
        totalsyncpages = syncpages.length;                                         
        syncNextPage();
    } else {
        var data = space.split(":");
        if (data[0] == "app") {
            var name = data[1];
            var config = parseInt(data[2]);
            var wiki = data[3];
            var classname = data[4];
            
            var pagelisturl = xwikigetresturl2(config, wiki, "classes/" + classname + "/objects?media=json");
            $('#syncstatus').append("Syncing application " +  name + " from wiki " + xwikiconfig[config].name + " " + wiki + " (" + pagelisturl + ")<br />");
            $.getJSON(pagelisturl, function(data) {
                      $.each(data.objectSummaries, function(key, val) {
                             // max pages to sync
                             if (syncpages.length<maxsyncpages) {
                             var page = config + ":" + wiki + ":" + val.space + "." + val.pageName;
                             syncpages.push(page);
                             }
                             });
                      $('#syncstatus').append("Added " + data.objectSummaries.length + " to pages to sync<br />");
                      syncNextSpace();
                      }).fail(function(data) {
                              $('#syncstatus').append("Failed to add pages to sync (" + space + ")<br />");
                              syncNextSpace();                             
                              });
        } else {
            var name = data[1];
            var config = parseInt(data[2]);
            var wiki = data[3];
            var space = data[4];
            var pagelisturl = xwikigetresturl2(config, wiki, "spaces/" + space + "/pages?media=json");
            $('#syncstatus').append("(Syncing space " + space + " from wiki " + config.name + " " + wiki + " (" + pagelisturl + ")<br />");
            $.getJSON(pagelisturl, function(data) {
                      $.each(data.pageSummaries, function(key, val) {
                             // max pages to sync
                             if (syncpages.length<maxsyncpages) {
                             var page = config + ":" + wiki + ":" + val.fullName;
                             syncpages.push(page);
                             }
                             });
                      $('#syncstatus').append("Added " + data.pageSummaries.length + " to pages to sync<br />");
                      syncNextSpace();
                      }).fail(function(data) {
                              $('#syncstatus').append("Failed to add pages to sync (" + space + ")<br />");
                              syncNextSpace();                             
                              });
        }
    }
}

function getPageList() {
    var spagelist = window.localStorage.getItem("pagelist");
    var pagelist;
    try {
        pagelist = JSON.parse(spagelist);
    } catch (e) {
        pagelist = [];
    }
    if (pagelist==null)
        pagelist = [];
    return pagelist;   
}

function clearStore() {
    window.localStorage.clear();
}

function syncNextPage() {
    if (syncstopping) {
        $('#syncstatus').append("Sync stopped.<br />");
        syncinprogress = false;
        syncstopping = false;
        $("#progressbar").progressbar('value', 0);
        return;
    }
    
    // update progress bar      
    var progressval = Math.floor((totalsyncpages-syncpages.length) * 50 / totalsyncpages);
    $("#progressbar").progressbar('value', progressval);
    
    var page = (syncpages.length==0) ? null : syncpages[0];
    syncpages.shift();
    if (page==null) {
        $('#syncstatus').append("Synced all pages.<br />");
        var pagelist = getPageList();
        $('#syncstatus').append("" + pagelist.length + " pages in local store.<br />");
        // note down how many pages we have to sync                                         
        totalsyncfiles = syncfiles.length;                                         
        syncNextFile();
    } else {
        var data = page.split(":");
        var config = parseInt(data[0]);
        var wiki = data[1];
        var pagename = data[2];
        var url = xwikigeturl2(config, wiki, pagename);
        url = url + "?xpage=plain";
        $.ajax({
               url: url,
               type: "GET",
               }).complete(function ( data ) { 
                           // alert("added : " + page);
                           $('#syncstatus').append("Synced page " + page + "<br />");
                           window.localStorage.setItem("page-" + page, JSON.stringify({ config : 0, wiki : wiki, page : page, content : data.responseText, lastsyncdate : new Date(), files : [] }));
                           var pagelist = getPageList();
                           if ($.inArray(page, pagelist)==-1)
                           pagelist.push(page);
                           window.localStorage.setItem("pagelist", JSON.stringify(pagelist));
                           
                           // getting the list of attachments to upload locally
                           var attachurl = xwikigetresturl2(config, wiki, "spaces/" + pagename.replace(".", "/pages/") + "/attachments?media=json");
                           $.getJSON(attachurl, function(data) {
                                     var items = [];
                                     $.each(data.attachments, function(key, val) {
                                            var url = val.xwikiAbsoluteUrl;
                                            var filename = val.name;
                                            var version = val.version;
                                            
                                            // adding file to list of files to download
                                            syncfiles.push({ page: page, filename: filename, url: url, version: version   });
                                            });
                                     syncNextPage();
                                     }).fail(function(data) {
                                             syncNextPage();
                                             });                 
                            }).fail(function(data) {
                                    $('#syncstatus').append("Failed to sync page " + page + "<br />");
                                    syncNextPage();
                                    });
    }
}

function syncNextFile() {
    if (syncstopping) {
        $('#syncstatus').append("Sync stopped.<br />");
        syncinprogress = false;
        syncstopping = false;
        $("#progressbar").progressbar('value', 0);
        return;
    }
    
    // update progress bar      
    var progressval = 50 + Math.floor((totalsyncfiles-syncpages.length) * 50 / totalsyncfiles);
    $("#progressbar").progressbar('value', progressval);
    
    var file = (syncfiles.length==0) ? null : syncfiles[0];
    syncfiles.shift();
    if (file==null) {
        $('#syncstatus').append("Synced all files. Sync finished.<br />");
        $('#syncstatus').append("" + nbfilessynced + " files synced.<br />");
        syncinprogress = false;
        syncstopping = false;
    } else {
        // alert(file.page);
        nbfilessynced++;
        var path = file.page + "-" + file.filename;
        var url = file.url;
        sessionStorage.filepage = file.page;
        var offlinepage = JSON.parse(window.localStorage.getItem("page-" + file.page));
        offlinepage.currentfile = file;
        window.localStorage.setItem("page-" + file.page, JSON.stringify(offlinepage));
        // calling the plugin to download the URL and save it locally
        $('#syncstatus').append("Downloading file " + file.filename + "<br />"); 
        window.fileDownloadMgr.downloadFile(url, path);
    }
}

// Callback from file download
// We need to store the fact that we have a file
// with the page data
function FileDownloadComplete( filePath ) {
    var filepage = sessionStorage.filepage;
    var offlinepage = JSON.parse(window.localStorage.getItem("page-" + filepage));
    var file = offlinepage.currentfile;
    file.lastsyncdate = new Date();
    file.filepath = filePath;
    offlinepage.files.push(file);
    window.localStorage.setItem("page-" + filepage, JSON.stringify(offlinepage));
    $('#syncstatus').append("Downloaded file " + filePath + "<br />");
    syncNextFile();
}

function FileDownloadCompleteWithError( message ) {
    alert( "Error Download file " + message );
    syncNextFile();
}

function FileDownload() {
}

FileDownload.prototype.downloadFile = function(url,destFileName) {
    Cordova.exec("FileDownload.downloadFile", url,destFileName);
};

cordova.addConstructor(function() {
                       window.fileDownloadMgr = new FileDownload();
                       });


function localFSTest() {
    alert("no test");
}

$( '#config' ).live( 'pageinit',function(event){
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


$( '#site' ).live( 'pageinit',function(event){
                  var id = sessionStorage.xwikiconfig;
                  var config = xwikiconfig[id];
                  var wiki = sessionStorage.currentwiki;
                  
                  var wikipagelist = [ 
                                      { name: "Home", url : "webview.html" },
                                      { name: "Recent Changes", url : "activity.html" },
                                      { name: "Applications", url : "apps.html" },
                                      { name: "Spaces", url : "spaces.html" },
                                      { name: "Users", url : "users.html" },
                                      { name: "Search", url : "search.html" },
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


$( '#webview' ).live( 'pageinit',function(event){
                     xwikionload(sessionStorage.currentwiki);                     
                     });

$( '#spaces' ).live( 'pageinit',function(event){
                    var spacesurl = xwikigetresturl(sessionStorage.currentwiki, "spaces?media=json");
                    $.getJSON(spacesurl, function(data) {
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
                              });
                    });

$( '#space' ).live( 'pageinit',function(event){
                   var space = getUrlVars(sessionStorage.space).space;
                   var pagelisturl = xwikigetresturl(sessionStorage.currentwiki, "spaces/" + space + "/pages?media=json");
                   $.getJSON(pagelisturl, function(data) {
                             var items = [];
                             $.each(data.pageSummaries, function(key, val) {
                                    var page = 'page.html?page=' + val.fullName;
                                    items.push('<li><a href="' + page + '" onclick="sessionStorage.page=\'' + page + '\'">' + val.fullName + '</a></li>');
                                    });
                             $('<ul/>', {
                               'id' : 'pagelist-list',
                               'data-role' : 'listview',
                               'data-filter' : 'true',
                               html: items.join('')
                               }).appendTo('#pagelist');
                             $('#pagelist-list').listview();
                             });
                   });

$( '#activity' ).live( 'pageinit',function(event){
                      var modsurl = xwikigetresturl(sessionStorage.currentwiki, "modifications?media=json");
                      $.getJSON(modsurl, function(data) {
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
                                });
                      });

$( '#page' ).live( 'pageinit',function(event){   
                  var page = getUrlVars(sessionStorage.page).page;
                  $('#page-content-iframe').html('loading...');
                  $('#page-content-iframe').html('<iframe src="' + xwikigeturl(sessionStorage.currentwiki, page) + '" width="100%" height="100%" border="0" frameborder="0"></iframe>');
                  
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
                            });
                  });                  

$( '#file' ).live( 'pageinit',function(event){   
                  var file = getUrlVars(sessionStorage.file).file;
                  $('#file-content').html('loading...');
                  $('#file-content').html('<iframe src="' + file + '" width="100%" height="100%" border="0" frameborder="0"></iframe>');
                  });

$( '#app' ).live( 'pageinit',function(event){
                 var space = getUrlVars(sessionStorage.space).space;
                 var pagelisturl = xwikigetresturl(sessionStorage.currentwiki, "classes/" + space + "." + space + "Class/objects?media=json");
                 $.getJSON(pagelisturl, function(data) {
                           var items = [];
                           $.each(data.objectSummaries, function(key, val) {
                                  if (val.pageName!=space + "Template") {
                                  var page = 'page.html?page=' + val.space + "." + val.pageName;
                                  items.push('<li><a href="' + page + '" onclick="sessionStorage.page=\'' + page + '\'">' + val.pageName + '</a></li>');
                                  }
                                  });
                           $('<ul/>', {
                             'id' : 'pagelist-list',
                             'data-role' : 'listview',
                             'data-filter' : 'true',
                             html: items.join('')
                             }).appendTo('#pagelist');
                           $('#pagelist-list').listview();
                           });
                 });

$( '#app2' ).live( 'pageinit',function(event){
                  var classname = getUrlVars(sessionStorage.app2).classname;
                  var pagelisturl = xwikigetresturl(sessionStorage.currentwiki, "classes/" + classname + "/objects?media=json");
                  $.getJSON(pagelisturl, function(data) {
                            var items = [];
                            $.each(data.objectSummaries, function(key, val) {
                                   if (val.space + '.' + val.pageName!=classname.replace('Class', 'Template')) {
                                   var page = 'page.html?page=' + val.space + "." + val.pageName;
                                   items.push('<li><a href="' + page + '" onclick="sessionStorage.page=\'' + page + '\'">' + val.pageName + '</a></li>');
                                   }
                                   });
                            $('<ul/>', {
                              'id' : 'pagelist-list',
                              'data-role' : 'listview',
                              'data-filter'  : 'true',
                              html: items.join('')
                              }).appendTo('#pagelist');
                            $('#pagelist-list').listview();
                            });
                  });

$( '#users' ).live( 'pageinit',function(event){
                   var pagelisturl = xwikigetresturl(sessionStorage.currentwiki, "classes/XWiki.XWikiUsers/objects?media=json");
                   $.getJSON(pagelisturl, function(data) {
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
                             });
                   });

$( '#apps' ).live( 'pageinit',function(event){
                  var spacesurl = xwikigetresturl(sessionStorage.currentwiki, "classes/AppWithinMinutes.LiveTableClass/objects?media=json");
                  $.getJSON(spacesurl, function(data) {
                            var items = [];                            
                            $.each(xwikiconfig[sessionStorage.xwikiconfig].apps[sessionStorage.currentwiki], function(key, val) {
                                   var page = 'app2.html?space=' + val.space + '&classname=' + val.classname;
                                   
                                   items.push('<li><a href="' + page + '" onclick="sessionStorage.app2=\'' + page + '\'; sessionStorage.classname=\'' + val.classname + '\';">' + val.name + '</a></li>');                                   
                                   });
                            
                            $.each(data.objectSummaries, function(key, val) {
                                   if (val.space!="AppWithinMinutes") {
                                   var page = 'app.html?space=' + val.space;
                                   items.push('<li><a href="' + page + '" onclick="sessionStorage.space=\'' + page + '\'">' + val.space + '</a></li>');
                                   }
                                   });
                            
                            $('<ul/>', {
                              'id' : 'spaceslist-list',
                              'data-role' : 'listview',
                              'data-filter'  : 'true',
                              html: items.join('')
                              }).appendTo('#spaceslist');
                            $('#spaceslist-list').listview();
                            });
                  });

$( '#search' ).live( 'pageinit',function(event){
                    $("#searchinput").bind( "change", function(event, ui) {
                                           var searchurl = xwikigetresturl(sessionStorage.currentwiki, "search?media=json&scope=content&q=" + $(this).val());
                                           $.getJSON(searchurl, function(data) {
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
                                                     });
                                           });
                    });

$( '#offline' ).live( 'pageinit',function(event){
                     var items = [];                            
                     $.each(getPageList(), function(key, val) {
                            var page = 'offlinepage.html?page=' + val;
                            var data = val.split(":");
                            var config = parseInt(data[0]);
                            var wiki = data[1];
                            var pageName = data[2];
                            if (config==sessionStorage.xwikiconfig && wiki==sessionStorage.currentwiki) {
                            items.push('<li><a href="' + page + '" onclick="sessionStorage.offlinepage=\'' + page + '\';">' + val + '</a></li>');      
                            }
                            });
                     
                     $('<ul/>', {
                       'id' : 'pagelist-list',
                       'data-role' : 'listview',
                       'data-filter'  : 'true',
                       html: items.join('')
                       }).appendTo('#pagelist');
                     $('#pagelist-list').listview();
                     });

$( '#offlineall' ).live( 'pageinit',function(event){
                        var items = [];                            
                        $.each(getPageList(), function(key, val) {
                               var page = 'offlinepage.html?page=' + val;
                               var data = val.split(":");
                               var config = parseInt(data[0]);
                               var wiki = data[1];
                               var pageName = data[2];
                               // if (config==sessionStorage.xwikiconfig && wiki==sessionStorage.currentwiki) {
                               items.push('<li><a href="' + page + '" onclick="sessionStorage.offlinepage=\'' + page + '\';">' + val + '</a></li>');      
                               //}
                               });
                        
                        $('<ul/>', {
                          'id' : 'pagelist-list',
                          'data-role' : 'listview',
                          'data-filter'  : 'true',
                          html: items.join('')
                          }).appendTo('#pagelist');
                        $('#pagelist-list').listview();
                        });

function updateOfflinePage(key) {
    var offlinepage = JSON.parse(window.localStorage.getItem("page-" + key));
    if (offlinepage!=null) {      
        var html = fixHTML(offlinepage.content, key);
        try {
        $('#offlinepagecontent').html(html);
        } catch (e) {
            console.log("Exception while inserting HTML offline page");
        }
        
        try {
        $('#attachlist').html("");
        var files = offlinepage.files;
        var items = [];
        if (typeof files!="undefined" && files!=null && files.length!=0) {
            $.each(files, function(key, val) {
                   var page = "offlinefile.html?url=" + encodeURIComponent(val.filepath);
                   items.push('<li><a href="' + page + '" onclick="sessionStorage.offlinefile=\'' + page + '\';">' + val.filename + '</a></li>');
                   });
            
            $('<ul/>', {
              'id' : 'attachlist-list',
              'data-role' : 'listview',
              html: items.join('')
              }).appendTo('#attachlist');
            $('#attachlist-list').listview();
        }
        } catch (e) {
            console.log("Exception while adding files button");
        }
    }
}

$( '#offlinepage' ).live( 'pageinit',function(event){
                         var key = getUrlVars(sessionStorage.offlinepage).page;
                         updateOfflinePage(key);
                         });


$( '#offlinefile' ).live( 'pageinit',function(event){   
                         var url = getUrlVars(sessionStorage.offlinefile).url;
                         $('#file-content').html('loading...');
                         $('#file-content').html('<iframe src="' + url + '" width="100%" height="100%" border="0" frameborder="0"></iframe>');
                         });

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

function getURLMap() {
    if (urlmap=="") {
        urlmap = updateURLMap();
    }
    return urlmap;
}

function updateURLMap() {
    var map = {};
    var pagelist = getPageList();
    $.each(pagelist, function(key, page) {
           var offlinepage = JSON.parse(window.localStorage.getItem("page-" + page));
           if (typeof files!="undefined" && files!=null && files.length!=0) {
           $.each(offlinepage.files, function(key2, file) {
                  var filepath = file.filepath;
                  var url = file.url;
                  map[url] = filepath;
                  });
           }
           
           var data = page.split(":");
           var config = parseInt(data[0]);
           var wiki = data[1];
           var pageName = data[2];
           var pageurl = xwikigeturl2(config, wiki, pageName);
           pagesmap[pageurl] = page;
           });
    return map;
}

function mylink(url) {
    var page = pagesmap[sessionStorage.domainurl + url];
    if (typeof page=="undefined" || page==null) {
        var newurl = "";
        if (url[0]=='/')
            newurl = sessionStorage.domainurl + url;
        else 
            newurl = url;
        
        $('#offlinepagecontent').html("loading url " + newurl);
        $('#offlinepagecontent').html('<iframe src="' + newurl + '" width="100%" height="100%" border="0" frameborder="0"></iframe>');  
        return false;
    } else {
        updateOfflinePage(page);
        return false;
    }
}

// functions to fix offline HTML

function fixHTML(html, page) {
    var urlmap = getURLMap();
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
                                                   var url = domainurl + arguments[2];
                                                   var pos = url.lastIndexOf("?");
                                                   if (pos!=-1)
                                                   url = url.substring(0, pos);
                                                   var newurl = urlmap[url];
                                                   var result = (newurl==null) ? arguments[1] + arguments[2] + arguments[3]: arguments[1] + newurl + arguments[3]; 
                                                   return result;
                                                   }); 
    newhtml = newhtml.replace(/(<a.*?href\s*=\s*[\"\'])(.*?)([\"\'])/g,function(match) {
           return arguments[1] + "javascript:void(0)" + arguments[3] + " onclick=\"return mylink(\'" + arguments[2] + "\');\"";           
    });
    return newhtml;
}