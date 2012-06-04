/*
 // Attendre que Cordova soit prêt
 //
 document.addEventListener("deviceready", onDeviceReady, false);
 
 // Cordova est prêt
 //
 function onDeviceReady() {
 cordovaready = true;
 }
 
 
 function readDataUrl(file) {
 var reader = new FileReader();
 reader.onloadend = function(evt) {
 var url = evt.target.result.replace("text/plain", "text/html");
 alert("here");
 
 };
 reader.readAsDataURL(file);
 }
 
 function readAsText(file) {
 var reader = new FileReader();
 reader.onloadend = function(evt) {
 alert(evt.target.result);
 $('#fstest').append(evt.target.result);
 $('#fstest').html('<iframe src="file://Documents/test.html" width="100%" height="100%" border="0" frameborder="0"></iframe>');
 };
 reader.readAsText(file);
 }
 
 function onFileSuccess(file) {
 // alert("file success");
 // readDataUrl(file);
 alert(file.fullPath);
 readAsText(file);
 }
 
 function onFileEntrySuccess(fileEntry) {
 fileEntry.createWriter(function (writer) {
 writer.onwrite = function(evt) {
 // fileEntry.file(onFileSuccess, onFSFail);
 var url = fileEntry.toURI();
 $('#fstest').html('<iframe src="' + url + '" width="100%" height="100%" border="0" frameborder="0"></iframe>');
 };
 writer.write("<html><body><p>TEST DATA</p></body></html>");
 
 }, onFSFail);
 }
 
 function saveFileData(directory, filename, data, fileSystem) {
 alert("here");
 fileSystem.root.getFile(directory + "-" + filename, {create: true}, function(fileEntry) {
 alert(directory + "-" + filename);
 try {
 fileEntry.createWriter(function (writer) {
 try {
 writer.onwrite = function(evt) {
 alert("in onwrite");
 var url = fileEntry.toURI();
 alert(url);
 $('#fstest').html('<iframe src="' + url + '" width="100%" height="500px" border="0" frameborder="0"></iframe>');
 };
 
 writer.onerror = function(evt) {
 alert("here error");
 onFSFail(evt);
 };
 writer.write(data.toString());
 } catch (e) {
 alert("exception" + e.message);
 }
 });
 } catch (e) {
 alert("exception");
 }
 }, onFSFail); 
 
 }
 
 function saveFileURL(config, wiki, pagename, filename, url, fileSystem) {
 req = $.ajax({
 url: url,
 type: "GET",
 });
 
 req.overrideMimeType('text/plain; charset=x-user-defined');
 
 req.complete(function ( data ) { 
 // alert("added : " + page);
 $('#syncstatus').append("Downloaded file " + filename + "<br />");
 var directory = "config" + config + "-" + wiki + "-" + pagename;
 saveFileData(directory, filename,data.responseText, fileSystem);
 // alert(data.responseText);
 }).fail(function(data) {
 alert("fail download file")
 });
 
 }
 
 function saveFile(page, filename, fileSystem) {
 var data = page.split(":");
 var config = parseInt(data[0]);
 var wiki = data[1];
 var pagename = data[2];
 var url = xwikigetdownloadurl2(config, wiki, pagename, filename);
 saveFileURL(config, wiki, pagename, filename, url, fileSystem);
 }
 
 function onFileSystemSuccess(fileSystem) {
 var page = "0:marketing:Events.Documation2012";
 var filename = "Q-DOC2012-0000001859.pdf";
 saveFile(page, filename, fileSystem);    
 }
 
 function onFSFail(evt) {
 alert("File System fail");
 console.log(evt.target.error.code);
 }
 
 function localFSTest() {
 if (cordovaready==false) {
 alert("Local file system is not ready");
 } else {
 window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, onFSFail);
 
 }
 }
 */
/*
 function FileDownloadComplete( filePath ) {
 alert( "Success \r" + filePath );
 $('#fstest').html('<iframe src="file://' + filePath + '" width="100%" height="500px" border="0" frameborder="0"></iframe>');
 }
 
 function FileDownloadCompleteWithError( message ) {
 alert( "Error \r" + message );
 }
 
 function localFSTest() {
 if (cordovaready==false) {
 alert("Local file system is not ready");
 } else {
 var page = "0:marketing:Events.Documation2012";
 var filename = "Q-DOC2012-0000001859.pdf";
 var data = page.split(":");
 var config = parseInt(data[0]);
 var wiki = data[1];
 var pagename = data[2];
 var url = xwikigetdownloadurl2(config, wiki, pagename, filename);
 sessionStorage.currentfile = { page: page, filename: filename };
 window.fileDownloadMgr.downloadFile(url, page + "-" + filename);
 }
 }
 */
