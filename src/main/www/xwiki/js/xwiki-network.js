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


function NetworkQueue() {
    this.started = false;
    this.stopping = false;
    
    this.highPriorityQueue = [];
    this.lowPriorityQueue = [];
    this.runningQueue = [];
    this.lastResults = [];
    this.requestsByName = {};
    
    this.maxSimultaneousRequest = 1;
    this.maxRetries = 3;
    
    this.networklog = [];
};

/**
 This API adds a request to the queue
 @service the service on which the request is added, this is used for eventual re-login
 @url the url to add the queue
 @priority level of priority of the request ("high", "low")
 @cache wether the result should be taken from the cache or not
 @callback optional callback URL to be informed that the result arrived
 @result result is the code: 1 result added to queue, 2 result already in queue, 3 result comes from cache
 */
NetworkQueue.prototype.addRequest = function(service, name, url, priority, cache, callback) {
    console.log("Adding request " + name + " " + url + " priority " + priority + " cache " + cache);
    
    if (cache==true) {
        var result = this.requestsByName[name];
        if (result!=null) {
            console.log("Request " + name + " taken from cache");
            return 3;
        }
    }
    
    if (this.requestsByName[name] && this.requestsByName[name].status==1) {
        // request is already in the queue
        console.log("Request " + name + " already in queue");
        
        // TODO: check priority and move request from priority queue to the other
        return 2;
    }
    
    var request = { url : url, name : name, priority: priority, cache: cache, status : 1, data : "", resultCode : 0, startDate : new Date(), duration : -1, service: service, callback: callback};
    this.requestsByName[name] = request;
    
    if (priority=="low") {
        this.lowPriorityQueue.push(name);
    } else {
        this.highPriorityQueue.push(name);
    }

    // show activity on the network
    xmobile.updateNetworkActive();
};

/**
 1 or 2: result in queue
 3: result available from cache
 4: result available
 5: result not available because of error
 
 */
NetworkQueue.prototype.getResultStatus = function(requestName) {
    var result = this.requestsByName[requestName];
    if (result==null) {
        return 0;
    } else {
        return result.status;
    }
};

NetworkQueue.prototype.getResult = function(requestName) {
    return this.requestsByName[requestName];
};

/**
 This API gives CPU time to the queue management, allowing to start the next request in the queue
 */
NetworkQueue.prototype.startQueue = function() {
    var that = this;
    if (this.started==false && this.stopping== false) {
        this.started = true;
        setTimeout(function() { that.nextRequest(); },1000);
        console.log("network queue started");
    } else {
        console.log("network queue already started");
    }
};

NetworkQueue.prototype.stopQueue = function() {
    if (this.started==true && this.stopping==false) {
        this.stopping = true
        console.log("network queue set in stopping mode");
    }
};

/**
 run next request
 */
NetworkQueue.prototype.nextRequest = function() {
    // console.log("network queue next request");
    var that = this;
    // TODO: manage more than 1 request at a time
    if (this.runningQueue.length<1) {
        var nextReqName = null;
        if (this.highPriorityQueue.length>0)
            nextReqName = this.highPriorityQueue.shift();
        else if (this.lowPriorityQueue.length>0)
            nextReqName = this.lowPriorityQueue.shift();
        if (nextReqName!=null) {
            this.runningQueue.push(nextReqName);
            var nextReq = this.requestsByName[nextReqName];
            console.log("start ajax " + nextReqName + ": " + nextReq.url);
            $.ajax({
                   type:"GET",
                   dataType : "text",
                   url: nextReq.url ,
                   timeout: 10000,
                   success: function(data, text, xhr) {
                   try {
                   console.log("AJAX done entry " + nextReqName + " code: " + xhr.status);
                   // TODO do not assume it's the first request launched
                   that.runningQueue.shift();
                   that.lastResults.push(nextReqName);
                   nextReq.data = data;
                   nextReq.resultCode = xhr.status;
                   nextReq.status = 4;
                   
                   nextReq.service.nbFailures = 0;
                   nextReq.service.nbSuccesses++;
                   nextReq.service.lastSuccess = new Date();
                   
                   // if we are running 5.1+ we'll have a response header in the rest API
                   // which allows to detect if we are correctly logged in.
                   var xuser = xhr.getResponseHeader("XWiki-User");
                   if (xuser!=undefined && xuser!="XWiki." + nextReq.service.username) {
                     // we have been logged
                   console.log("User has been logged out (detected using XWiki-User header) " + xuser + " XWiki." + nextReq.service.username);
                   nextReq.service.setLoginStatus("failed");
                   alert($.i18n.map["login.disconnected"] + " " + nextReq.service.name);
                   }
                   
                   console.log("AJAX done exit " + nextReqName + " code: " + nextReq.resultCode);
                   // on success let's do a callback to the UI to refresh the screen if new data arrived
                   xmobile.xwikiCallback(nextReq);
                   } catch (e) {
                   console.log("AJAX exception in success " + nextReqName + " code: " + nextReq.resultCode + " " + e);
                   }
                   },
                   error: function(xhr, text, error) {
                   try {
                   console.log("AJAX done entry " + nextReqName + " code: " + xhr.status);
                   // TODO manage retries and relogins
                   that.runningQueue.shift();
                   that.lastResults.push(nextReqName);
                   nextReq.status = 5;
                   nextReq.resultCode = xhr.status;
                   
                   if (nextReq.resultCode==401 || nextReq.resultCode==403) {
                   // we have been logged
                   console.log("User has been logged out (detected using 401 error code");
                   if (nextReq.name.indexOf(".login")!=-1) {
                    nextReq.service.setLoginStatus("wrongCredentials");
                    alert($.i18n.prop("login.failed",nextReq.service.name))
                   } else {
                    nextReq.service.setLoginStatus("failed");
                    alert($.i18n.map["login.disconnected"] + " " + nextReq.service.name);
                   }
                   }
                   
                   // let's log the error
                   that.networklog.push("Request error on service " + nextReq.service.name + " with code " + xhr.status);
                   nextReq.service.nbFailures++;
                   nextReq.service.nbSuccesses = 0;
                   
                   // on error let's do a callback to the UI to show an error
                   xmobile.xwikiCallback(nextReq);
                   console.log("AJAX done exit " + nextReqName + " code: " + nextReq.resultCode);
                   } catch (e) {
                   console.log("AJAX exception in error " + nextReqName + " code: " + nextReq.resultCode + " " + e);
                   }
                   }
                   });
        }
        if (this.started==true && this.stopping==false) {
            // console.log("network queue pause until timer");
            setTimeout(function() { that.nextRequest(); },1000);
        } else {
            console.log("network queue stopped");
            this.started = false;
            this.stopping = false;
        }
    } else {
        setTimeout(function() { that.nextRequest(); },1000);
    }
};



NetworkQueue.prototype.getQueueStatus = function() {
    var status = "";
    status += "<ul>"
    + "<li>Status: " + this.started + "</li>"
    + "<li>Stopping: " + this.stopping + "</li>"
    + "<li>High priority: " + this.highPriorityQueue.length + "</li>"
    + "<li>Low priority: " + this.lowPriorityQueue.length + "</li>"
    + "<li>Running: " + this.runningQueue.length + "</li>"
    + "<li>HP Queue: "
    + "<ul>";
    var that = this;
    $.each(this.highPriorityQueue, function(key, val) {
           var req = that.requestsByName[val];
           status += "<li>" + req.name + " " + req.priority + "</li>"
           + "<li><ul><li>" + req.startDate + "</li>"
           + "<li>status " + req.status + "</li>"
           + "<li>" + req.url + "</li></ul></li>";
           });
    status += "</ul></li>"
    + "<li>LP Queue: "
    + "<ul>";
    $.each(this.lowPriorityQueue, function(key, val) {
           var req = that.requestsByName[val];
           status += "<li>" + req.name + " " + req.priority + "</li>"
           + "<li><ul><li>" + req.startDate + "</li>"
           + "<li>status " + req.status + "</li>"
           + "<li>" + req.url + "</li></ul></li>";
           });
    status += "</ul></li>"
    + "<li>Running Queue: "
    + "<ul>";
    $.each(this.runningQueue, function(key, val) {
           var req = that.requestsByName[val];
           status += "<li>" + req.name + " " + req.priority + "</li>"
           + "<li><ul><li>" + req.startDate + "</li>"
           + "<li>status " + req.status + "</li>"
           + "<li>" + req.url + "</li></ul></li>";
           });
    status += "</ul></li>"
    status += "<li>Last results: " + this.lastResults.length
    + "<ul>";
    var counter = 0;
    $.each(this.lastResults.reverse(), function(key, val) {
           var req = that.requestsByName[val];
           if (counter<5 && req.status!=1) {
           counter++;
           status += "<li>" + req.name + " " + req.priority + "</li>"
           + "<li><ul><li>status " + req.status + " " + req.resultCode + "</li>"
           + "<li>" + req.startDate + "</li>"
           + "<li>" + req.url + "</li></ul></li>";
           }
           });
    status += "</ul></li>"
    status + "</ul>"
    return status;
};



