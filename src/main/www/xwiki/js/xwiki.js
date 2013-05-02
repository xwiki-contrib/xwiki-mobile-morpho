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

/*
 define(function (require) {
 var Backbone = require('backbone')
 // do something cool...
 });
 */

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
    xmobile.router.navigate(hash, true);
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
        
        /*
         if(!((window.DocumentTouch&&document instanceof DocumentTouch)||'ontouchstart' in window)){
         var script=document.createElement("script");
         script.src="../js/jq.desktopBrowsers.js";
         var tag=$("head").append(script);
         }
         */
        
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
