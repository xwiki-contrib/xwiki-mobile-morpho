/* xwiki mobile js */

sessionStorage.xwikiconfig = 0;
sessionStorage.currentwiki = "";

xwikiconfig = [
               {
               id : "local",
               name: "Local Account",
               xem : false,
               wikis : [""],
               baseurl : "http://localhost:9080/xwiki",
               resturl : "http://localhost:9080/xwiki/rest/wikis/xwiki/",
               viewurl : "http://localhost:9080/xwiki/bin/view/",
               apps : { "" : [{ name: "Bikes", space: "Bikes", classname : "BikesCode.BikesClass" }] },                            
               username : "Admin",
               password : "admin"
               }
               ]
