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

// push notifications screens
XWikiMobile.prototype.addPushScreens = function() {
var xpushScreen = new XWikiScreen(
                                  {
                                  name: "xnotifs",
                                  title: "Notifications",
                                  parent: ["xemhome", "xwikihome"],
                                  panelcontent: "<ul id='xnotifs2'></ul>",
                                  route: "xnotifs/:wikiName",
                                  addMainMenus: function() {
                                  },
                                  addParentMenus: function() {
                                  console.log("In screen menu setup");
                                  var configName = xmobile.getCurrentConfig();
                                  $("#xemactions").append("<li><a class='x-icon x-icon-list' href='#xnotifs/"  + configName + "'>" + $.i18n.map["xnotifs"] + "</a></li>");
                                  $("#xwikiactions").append("<li><a class='x-icon x-icon-list' href='#xnotifs/"  + configName + "'>" + $.i18n.map["xnotifs"] + "</a></li>");
                                  },
                                  routeCallback: function() {
                                  console.log("In xnotifs route callback");
                                  this.showScreen();
                                  },
                                  showCallback: function(cache) {
                                    console.log("In xnotifs show callback");
                                  var xservice = xmobile.getCurrentService();
                                  if (xservice) {
                                  if (xservice.notifications==undefined) {
                                    $("#xnotifs2").html("<li>Notifications status unknown. Please refresh.</li>");
                                  } else if (xservice.notifications==true) {
                                   if (xmobile.devicetoken!=undefined && xmobile.devicetoken!="") {
                                     $("#xnotifs2").html("<li>Notifications are not activated for this instance</li>");
                                  } else {
                                     $("#xnotifs2").html("<li>You have not authorized notifications on this device</li>");
                                   }
                                  } else {
                                     $("#xnotifs2").html("<li>This instance does not support notifications</li>");
                                  }
                                  } else {
                                     $("#xnotifs2").html("<li>Notifications status unknown. Please refresh.</li>");
                                  }
                                  
                                  
                                  }
                                  }
                                  );
  
this.addScreen(xpushScreen);
}
