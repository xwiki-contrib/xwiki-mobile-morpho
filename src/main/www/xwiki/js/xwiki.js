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
                   nq.startQueue();
                          
                          xmobile.initialize();
                          xmobile.setRouter(router);
                          xmobile.initScreens();
                          xmobile.loginToServices();
                          
                          Backbone.history.start();
                  
                          // force loading of initial screen
                          $.ui.loadContent(location.hash ,false,false,"up");
 
                          xmobile.showWikis();
                          
                          // allow multitouch gestures
                          // self.view.multipleTouchEnabled=1;
                          // self.view.exclusiveTouch=0;
                          });
        
        });
