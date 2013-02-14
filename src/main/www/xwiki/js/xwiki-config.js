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

/* Configuration module */

defaultConfig = "intranet";
defaultWiki = "default";
defaultPage = "";
defaultSpace = "";

xservices = {
    local : new XWikiService({
                             id : "local",
                             name: "Local Account",
                             xem : false,
                             wikis : [""],
                             baseurl : "http://localhost:7080/xwiki",
                             resturl : "http://localhost:7080/xwiki/rest/wikis/xwiki/",
                             viewurl : "http://localhost:7080/xwiki/bin/view/",
                             apps : { "" : [{ name: "Bikes", space: "Bikes", classname : "BikesCode.BikesClass" }] },
                             username : "Admin",
                             password : "admin1",
                             protocol : 3,
                             autoconnect : true
                             })
    ,
    intranet : new XWikiService({
                                id : "intranet",
                                name: "XWiki Sales Intranet",
                                xem : false,
                                wikis : [""],
                                baseurl : "https://sales.xwikisas.com/xwiki",
                                resturl : "https://sales.xwikisas.com/xwiki/rest/wikis/sales/",
                                viewurl : "https://sales.xwikisas.com/xwiki/bin/view/",
                                apps : { "" : [{ name: "Bikes", space: "Bikes", classname : "BikesCode.BikesClass" }] },
                                username : "TestTest",
                                password : "xwtt2013",
                                protocol : 2,
                                autoconnect : false
                                })
    ,
    projects : new XWikiService({
                                id : "projects",
                                name: "XWiki Projects Intranet",
                                xem : false,
                                wikis : [""],
                                baseurl : "https://projects.xwikisas.com/xwiki",
                                resturl : "https://projects.xwikisas.com/xwiki/rest/wikis/projects/",
                                viewurl : "https://projects.xwikisas.com/xwiki/bin/view/",
                                apps : { "" : [{ name: "Projects", space: "Projects", classname : "PMCode.XProjectClasss" }] },
                                username : "TestTest",
                                password : "xwtt2013",
                                protocol : 2,
                                autoconnect : false
                                })
}

xmobile = new XWikiMobile(xservices);
xmobile.setCurrentConfig(defaultConfig);
xmobile.setCurrentWiki(defaultWiki);
xmobile.setCurrentPage(defaultPage);
