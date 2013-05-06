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

var withPush = false;
var withPageBrowser = true;

// load require js modules
require.config({
               // force cache reload
               urlArgs : "bust="+new Date().getTime(),
               paths: {
               underscore: "../js/underscore",
               backbone: "../js/backbone",
               moment: "../js/moment.min",
               xconfig: "js/xwiki-config",
               xmobile: "js/xwiki-mobile",
               xnetwork: "js/xwiki-network",
               xservice: "js/xwiki-service",
               xscreen: "js/xwiki-screen",
               xscreenapps: "js/xwiki-screen-apps"
               },
               shim: {
               'backbone': {
               deps: ['underscore'],
               exports: 'Backbone',
               init: function() {
               Backbone.$ = window.$;
               }
               },
               'underscore': {
               exports: '_'
               },
               'xnetwork' : {
               exports:'nq'
               },
               'xmobile' : {
               deps: ['xservice', 'backbone', 'moment']
               },
               'xservice' : {
               deps: ['xnetwork']
               },
               'xconfig' : {
               deps: ['xservice', 'xmobile']
               },
               'xscreen' : {
               deps: ['xconfig']
               },
               'xscreenapps' : {
               deps: ['xscreen']
               }
               }
               });


// result contains any message sent from the plugin call
function successHandler (result) {
    alert('result = '+result)
}

// result contains any error description text returned from the plugin call
function errorHandler (error) {
    alert('error = '+error)
}

function tokenHandler (result) {
    // Your iOS push server needs to know the token before it can push to this device
    // here is where you might want to send it the token for later use.
    console.log('device token = '+result)
}

// iOS
function onNotificationAPN(event) {
    if (event.alert) {
        navigator.notification.alert(event.alert);
    }
    
    if (event.sound) {
        var snd = new Media(event.sound);
        snd.play();
    }
    
    if (event.badge) {
        pushNotification.setApplicationIconBadgeNumber(successHandler, event.badge);
    }
}

function initXMobile() {
    // start network queue
    nq = new NetworkQueue();
    nq.startQueue();

    xmobile = new XWikiMobile(defaultxservices);
    xmobile.setCurrentConfig("");
    xmobile.setCurrentWiki("");
    xmobile.setCurrentPage("");
    xmobile.initialize();
    xmobile.setRouter(router);

    
    
    // initialize screens
    xmobile.addDefaultScreens();
    xmobile.addAppsScreens();
    xmobile.initScreens();
    
    // launch login
    xmobile.loginToServices();

    Backbone.history.start();
    // force loading of initial screen
    var hash = ((location.hash=="") ? "main" : location.hash);
    $.ui.loadContent(hash ,false,false,"up");
    $.ui.toggleNavMenu(false);
    $.ui.showNavMenu = false;
    
    /* hack to take control of the side menu button */
    $("#menu_scroller")[0].getElementsByTagName("a")[0].onclick = function() {
        xmobile.toggleSideMenu(false);
        return false;
    }
    
    xmobile.router.navigate(hash, true);
    
    document.addEventListener("deviceready", function() {
                              console.log("Device is ready");
                              
                              // After device ready, activate push
                              // push notifications are currently only supported on iOS
                              if (withPush && device.platform=="iOS") {
                              pushNotification = (window.plugins) ? window.plugins.pushNotification : null;
                              pushNotification.register(tokenHandler, errorHandler ,{"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});
                              }
                              
                              // page browser is currently only supported on iOS
                              // without it it will fallback to the iframe page browser
                              if (withPageBrowser && device.platform=="iOS") {
                              pageBrowser = window.plugins.pageBrowser;
                              }                              
                              }, false);
}

function initi18n(locale) {
    $.i18n.properties({
                      name: 'Messages',
                      path:'i18n/',
                      mode:'map',
                      language: locale,
                      callback: function(){
                      // replacing div with ids
                      $.each($.i18n.map, function(key, value) {
                             var keyname = "#i18n_" + key.replace(".","_")
                             var el = $(keyname);
                             // alert(keyname + " " + el.html());
                             if (el != undefined) {
                             if (el[0] !=undefined && el[0].nodeName=="INPUT")
                             el[0].value = value;
                             else {
                             console.log("Replacing element " + keyname + " with " + value);
                             el.html(value);
                             }
                             }
                             });
                             initXMobile();
                      }
                      });
        
}

require(["xscreen" , "xscreenapps" ], function() {
        
        // declare backbone routes
        var Router = Backbone.Router.extend({
                                            routes : {
                                            }});
        
        // Initiate the router
        router = new Router;
        
        $.ui.ready(function() {
                   // initializes i18n UI
                   if (1==0) {
                     initi18n("");
                   } else if (navigator.globalization) {
                     navigator.globalization.getLocaleName(
                                                           function (locale) {
                                                           console.log("Locale provided by phonegap: " + locale.value);
                                                           if (locale.value.indexOf("fr")==0) {
                                                           initi18n("fr");
                                                           }
                                                           else {
                                                           initi18n("en_US");
                                                           }},
                                                           function () {
                                                           initi18n("en_US");
                                                           }
                                                         );
                   } else if (navigator.language) {
                   console.log("Locale provided by navigator: " + navigator.language);
                   if (navigator.language.indexOf("fr")==0) {
                   initi18n("fr");                   
                   } else {
                   initi18n("en_US");
                   }
                   } else {
                   console.log("Locale not provided. Using b.")
                   initi18n("en_US");
                   }

                   // allow multitouch gestures
                   // self.view.multipleTouchEnabled=1;
                   // self.view.exclusiveTouch=0;
                   });
        
        });
