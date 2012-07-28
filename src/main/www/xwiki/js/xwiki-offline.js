
offlinecontent = {};
defaultsyncspaces = "space:Sandbox:0:xwiki:Sandbox";

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
syncfull = false;
urlmap = "";
pagesmap = {};


function getOfflinePageList() {
  var list = JSON.parse(window.localStorage.getItem("offlinepagelist"));
    if (list==null || list.length==0) {
        list = [];
        list.push("3::Sandbox.TestMerge");
        window.localStorage.setItem("offlinepagelist", JSON.stringify(list));
    }
    return list;
}

function addToOfflinePageList(pagename) {
    var list = getOfflinePageList();
    list.push(pagename);
    window.localStorage.setItem("offline-pagelist", JSON.stringify(list));
    alert("Page has been added to you offline bookmarks");
}

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
    syncfull = full;
    
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

function addPageToSync(page, version) {
    // max pages to sync
    if (syncpages.length<maxsyncpages) {
        var sofflinepage = window.localStorage.getItem("page-" + page);  
        var offlinepage = (sofflinepage==null) ? null : JSON.parse(sofflinepage);
        if (offlinepage==null || typeof version=="undefined"|| typeof offlinepage.version=="undefined" || offlinepage.version!=version) {
            syncpages.push({ page : page, version: version});
        }
    }
    
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
                             var page = config + ":" + wiki + ":" + val.space + "." + val.pageName;
                             addPageToSync(page, val.pageVersion)
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
                             var page = config + ":" + wiki + ":" + val.fullName;
                             addPageToSync(page, val.version)
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

function syncAttachments(config, wiki, page, pagename) {
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
                      $('#syncstatus').append("Failed to sync attachments for page " + page + "<br />");
                      syncNextPage();
                      });      
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
    
    var page = (syncpages.length==0) ? null : syncpages[0].page;
    var version = (syncpages.length==0) ? null : syncpages[0].version;
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
        var url = xwikigetplainurl(config, wiki, pagename);
        $.ajax({
               url: url,
               type: "GET",
               }).complete(function ( data ) { 
                           // alert("added : " + page);
                           $('#syncstatus').append("Synced page " + page + "<br />");
                           window.localStorage.setItem("page-" + page, JSON.stringify({ config : 0, wiki : wiki, page : page, version: version, content : data.responseText, lastsyncdate : new Date(), editmode: "", files : [] }));
                           var pagelist = getPageList();
                           if ($.inArray(page, pagelist)==-1)
                           pagelist.push(page);
                           window.localStorage.setItem("pagelist", JSON.stringify(pagelist));
                           
                           // getting the page code
                           var pageurl = xwikigetresturl2(config, wiki, "spaces/" + pagename.replace(".", "/pages/") + "?media=json");
                           $.getJSON(pageurl, function(data) {
                                     // retrieve the wiki content field
                                     var offlinepage = JSON.parse(window.localStorage.getItem("page-" + page));
                                     offlinepage.wikicontent = data.content;
                                     offlinepage.originalwikicontent = data.content;
                                     window.localStorage.setItem("page-" + page, JSON.stringify(offlinepage));
                                     
                                     syncAttachments(config, wiki, page, pagename)
                                     }).fail(function(data) {
                                             $('#syncstatus').append("Failed to sync wiki content for page " + page + "<br />");
                                             syncAttachments(config, wiki, page, pagename)
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


function getAllSyncSpaces(cconfig, cwiki) {
    var items = [];
    $.each(getPageList(), function(key, val) {
           var data = val.split(":");
           var config = parseInt(data[0]);
           var wiki = data[1];
           var pageName = data[2];
           var spaceName = (pageName.indexOf(".")==-1) ? pageName : pageName.split(".")[0];
           if (config==cconfig && wiki==cwiki) {
           if ($.inArray(spaceName, items)==-1) {
           items.push(spaceName);
           }
           }
           });
    return items;
}

function updateOfflinePage(key) {
    var offlinepage = JSON.parse(window.localStorage.getItem("page-" + key));
    if (offlinepage!=null) {      
        var html = fixHTML(offlinepage.content, key);
        try {
            $('#offlinepagecontent').html(html);
        } catch (e) {
            console.log("Exception while inserting HTML offline page");
        }
        
        $('#offlinepagemenu-pageversion').html("Version: " + offlinepage.version);
        if (offlinepage.status=="modified") {
            $('#offlinepagemenu-status').html("Status: locally modified, old version below last synched " + offlinepage.lastsyncdate);            
        } else {
            $('#offlinepagemenu-status').html("Status: last synched " + offlinepage.lastsyncdate);                        
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

var tryCounter = 10;
var editmode = "wiki";
function loadWysiwyg() {
    if (typeof WysiwygEditor != 'undefined') {
        new WysiwygEditor({hookId: 'offlinepagecontent-textarea'});
        fireHTMLEvent(jQuery('.gwt-RichTextArea')[0], 'load', false, false);
    } else if (tryCounter-- > 0) {
        setTimeout(loadWysiwyg, 1000);
    } else {
        alert("failed loading wysiwyg");
    }
}

function updateOfflinePageEdit(key, wysiwyg) {
    $('#offlinepagecontent-textarea').val("loading...");
    var offlinepage = JSON.parse(window.localStorage.getItem("page-" + key));
    if (offlinepage!=null) { 
        if (offlinepage.status=="modified") {
            if (wysiwyg==true&&offlinepage.editmode=="wiki") {
                alert("This page has already been edited in wiki mode and cannot be edited in wysiwyg mode until it is synced to the server.");
                location = "offlinepageedit.html";
                return;
            }
            if (wysiwyg==false&&offlinepage.editmode=="wysiwyg") {
                alert("This page has already been edited in wysiwyg mode and cannot be edited in wiki mode until it is synced to the server.");
                location = "offlinepageeditwysiwyg.html";
                return;
            }            
        }
        
        if (wysiwyg) {
            $('#offlinepagecontent-textarea').val(offlinepage.content);
            // trying to activate the wysiwyg
            loadWysiwyg();
        } else {
            $('#offlinepagecontent-textarea').val(offlinepage.wikicontent);
        }
        if (offlinepage.status=="modified")
            $('#offlinepagemenu-localversion').html("Version: " + offlinepage.version + " modified");
        else
            $('#offlinepagemenu-localversion').html("Version: " + offlinepage.version);
        $('#offlinepagemenu-remoteversion').html("Version: " + offlinepage.version);
        if (wysiwyg)
            editmode = "wysiwyg";
        offlinepageCheck = true;
        offlinepageCheckNewVersion();
    }
}

function offlinepageSave() {
    var key = getUrlVars(sessionStorage.offlinepage).page;
    var offlinepage = JSON.parse(window.localStorage.getItem("page-" + key));
    var newwikicontent = $('#offlinepagecontent-textarea').val();
    // alert(newwikicontent);
    $('#offlinepagemenu-status').html("Status: locally modified");
    $('#offlinepagemenu-localversion').html("Version: " + offlinepage.version + " modified");
    if (editmode=="wysiwyg") {
        offlinepage.editmode = "wysiwyg";
        offlinepage.content = newwikicontent;
    } else {
        offlinepage.editmode = "wiki";
        offlinepage.wikicontent = newwikicontent;
    }
    offlinepage.status = "modified";
    window.localStorage.setItem("page-" + key, JSON.stringify(offlinepage));
    alert("Content saved locally");
}

function offlinepageSync(mode, fromview) {
    if (mode=="save") {
        if (!confirm('Server version will be overidden')) 
            return;        
    }
    if (mode=="update") {
        if (!confirm('Local version will be overidden')) 
            return;
    }
    
    var key = getUrlVars(sessionStorage.offlinepage).page;
    var offlinepage = JSON.parse(window.localStorage.getItem("page-" + key));
    var newwikicontent;
    var currenteditmode = "wiki";
    if (fromview) {
     // we are in view mode we need to get the content from the offlinepage
        if (offlinepage.editmode=="" || offlinepage.editmode == "wiki") {
            newwikicontent = offlinepage.wikicontent;
            currenteditmode = "wiki";
        } else {
            newwikicontent = content;
            currenteditmode = "wysiwyg";
        }
    } else {
        newwikicontent = $('#offlinepagecontent-textarea').val();   
        currenteditmode = editmode;
    }
    $('#offlinepagemenu-status').html("Status: in sync");
    offlinepage.wikicontent = newwikicontent;
    offlinepage.status = "modified";
    window.localStorage.setItem("page-" + key, JSON.stringify(offlinepage));
    var data = key.split(":");
    var config = parseInt(data[0]);
    var wiki = data[1];
    var page = data[2];
    var mergeurl = xwikigeturl2(config, wiki, "XWiki.Merge");
    mergeurl = mergeurl + "?xpage=plain&outputSyntax=plain&editmode=" + currenteditmode;
    if (mode=="save")
        mergeurl = mergeurl + "&mode=save";
    else if (mode=="update")
        mergeurl = mergeurl + "&mode=update";
    else 
        mergeurl = mergeurl + "&mode=merge";
    $.ajax({
           url: mergeurl,
           dataType: 'json',
           type: "POST",
           data: { page: page, refversion: offlinepage.version, content: newwikicontent }
           }).success(function ( data, textStatus, jqXHR ) {
                      if (data.result.status=="error") {
                      // merge failed
                      alert("Merged failed. Need to fix manually and force saving: " + data.result.messages);
                      $('#offlinepagemenu-localversion-textarea').show();
                      $('#offlinepagemenu-remoteversion-textarea').show();
                      
                      } else if (data.result.status=="success") {
                      // apply the merge
                      var newwikicontent = data.result.mergedcontent
                      // alert(newwikicontent);
                      // alert(data.result.remoteversion)
                      $('#offlinepagecontent-textarea').val(newwikicontent);
                      var offlinepage = JSON.parse(window.localStorage.getItem("page-" + key));
                      $('#offlinepagemenu-status').html("Status: merged");
                      if (data.result.mergestatus=="nochanges")
                      $('#offlinepagemenu-localversion').html("Version: " + data.result.remoteversion);
                      else
                      $('#offlinepagemenu-localversion').html("Version: " + data.result.remoteversion + " modified");                      
                      $('#offlinepagemenu-remoteversion').html("Version: " + data.result.remoteversion);
                      offlinepage.content = data.result.mergedhtmlcontent;
                      offlinepage.wikicontent = newwikicontent;
                      offlinepage.originalwikicontent = newwikicontent;
                      offlinepage.version = data.result.remoteversion;
                      offlinepage.lastsyncdate = new Date();
                      offlinepage.editmode = "";
                      offlinepage.status = "merged";
                      window.localStorage.setItem("page-" + key, JSON.stringify(offlinepage));
                      // merge successful
                      alert("Merge has been successfull");
                      if (fromview)
                       location = "offlinepage.html";
                      else if (editmode=="wiki")
                      location = "offlinepageedit.html";
                      else
                      location = "offlinepageeditwysiwyg.html";
                      
                      if (offlinepageCheck==false) {
                      offlinepageCheck = true;
                      offlinepageCheckNewVersion();
                      }
                      }
                      });
    
}

function fireHTMLEvent(element, eventType, bubbles, cancelable) {
    if (element.ownerDocument.createEvent) {
        // Standards compliant.
        var event = element.ownerDocument.createEvent('HTMLEvents');
        event.initEvent(eventType, bubbles, cancelable);
        return !element.dispatchEvent(event);
    } else if (document.createEventObject) {
        // IE
        var event = element.ownerDocument.createEventObject();
        return element.fireEvent('on' + eventType, event);
    }
}

var offlinepageCheck = false;
function offlinepageCheckNewVersion() {    
    setTimeout(function() {
               // Do something after 5 seconds
               if (offlinepageCheck==false)
               return;
               
               // getting the page version
               var key = getUrlVars(sessionStorage.offlinepage).page;
               var data = key.split(":");
               var config = parseInt(data[0]);
               var wiki = data[1];
               var page = data[2];
               var pageurl = xwikigetresturl2(config, wiki, "spaces/" + page.replace(".", "/pages/") + "?media=json");
               $.getJSON(pageurl, function(data) {
                         var version = data.majorVersion + "." + data.minorVersion;
                         var offlinepage = JSON.parse(window.localStorage.getItem("page-" + key));
                         if (offlinepage.version!=version) {
                         if (confirm("A new version is available on the server (" + version + "). Would you like to update your version ? If you don't you will have to manually sync.")) {
                         offlinepageCheck = false;
                         offlinepageSync();
                         } 
                         } else {
                         offlinepageCheckNewVersion();
                         }
                         });
               
               }, 5000);    
}


$( '#offline' ).live( 'pageshow',function(event){
                     var items = [];          
                     
                     $.each(getAllSyncSpaces(sessionStorage.xwikiconfig, sessionStorage.currentwiki), function(key1, val1) {
                            var page = 'offlinespace.html?space=' + val1;
                            items.push('<li><a href="' + page + '" onclick="sessionStorage.offlinespace=\'' + page + '\';">' + val1 + '</a></li>');      
                            });
                     
                     $('<ul/>', {
                       'id' : 'spacelist-list',
                       'data-role' : 'listview',
                       'data-filter'  : 'true',
                       html: items.join('')
                       }).appendTo('#spacelist');
                     $('#spacelist-list').listview();
                     });


$( '#offlinespace' ).live( 'pageshow',function(event){
                          var space = getUrlVars(sessionStorage.offlinespace).space;
                          var items = [];          
                          $.each(getPageList(), function(key, val) {
                                 var page = 'offlinepage.html?page=' + val;
                                 var data = val.split(":");
                                 var config = parseInt(data[0]);
                                 var wiki = data[1];
                                 var pageName = data[2];
                                 if (config==sessionStorage.xwikiconfig && wiki==sessionStorage.currentwiki && pageName.indexOf(space + ".")==0) {
                                 var rpageName = pageName.split('.')[1];
                                 items.push('<li><a href="' + page + '" onclick="sessionStorage.offlinepage=\'' + page + '\';">' + rpageName + '</a></li>');      
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


$( '#offlineall' ).live( 'pageshow',function(event){
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

$( '#offlinelist' ).live( 'pageshow',function(event){
                        var items = [];     
                        $.each(getOfflinePageList(), function(key, val) {
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


$( '#offlinepage' ).live( 'pageshow',function(event){
                         var key = getUrlVars(sessionStorage.offlinepage).page;
                         updateOfflinePage(key);
                         });

$( '#offlinepage' ).live( 'pageremove',function(event){
                         // alert("in page view remove");
                         });

$( '#offlinepageedit' ).live( 'pageshow',function(event){
                             var key = getUrlVars(sessionStorage.offlinepage).page;
                             updateOfflinePageEdit(key, false);
                             });

$( '#offlinepageeditwysiwyg' ).live( 'pageshow',function(event){
                                    var key = getUrlVars(sessionStorage.offlinepage).page;
                                    updateOfflinePageEdit(key, true);
                                    });


$( '#offlinepageedit' ).live( 'pageremove',function(event){
                             // alert("in page edit remove");
                             offlinepageCheck = false;
                             });

$( '#offlinefile' ).live( 'pageshow',function(event){   
                         var url = getUrlVars(sessionStorage.offlinefile).url;
                         $('#file-content').html('loading...');
                         $('#file-content').html('<iframe src="' + url + '" width="100%" height="100%" border="0" frameborder="0"></iframe>');
                         });

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
           var files = offlinepage.files;
           if (typeof files!="undefined" && files!=null && files.length!=0) {
           $.each(files, function(key2, file) {
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
                                                   var newurl = urlmap[unescape(url)];
                                                   var result = (newurl==null) ? arguments[1] + arguments[2] + arguments[3]: arguments[1] + newurl + arguments[3]; 
                                                   return result;
                                                   }); 
                                                   newhtml = newhtml.replace(/(<a.*?href\s*=\s*[\"\'])(.*?)([\"\'])/g,function(match) {
                                                                                                return arguments[1] + "javascript:void(0)" + arguments[3] + " onclick=\"return mylink(\'" + arguments[2] + "\');\"";           
                                                                                                });
                                                                                                return newhtml;
                                                                                                }
