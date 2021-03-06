// squeezeFrame.js; standalone JS to solve small rendering issues that cause
// content to be inaccessible or scrollbars to appear on iframes
//
// version: 201003221700
//
// author: frank -futtta- goossens
// License: CreativeCommons Attribution-Share Alike
//          (http://creativecommons.org/licenses/by-sa/3.0/) or
//          GNU LGPL (http://www.gnu.org/licenses/lgpl-3.0.txt)
// more info: http://blog.futtta.be/2010/03/24/
//
// usage:
//      * include this script in the head of the iframe-content (i.e. in the
//        page that is displayed inside the iframe)
//	* set "myContainer" to the URL of the iframe container page (i.e. the
//        page in which the iframe is created/ defined), to redirect users
//        accessing the iframe-content out of context
//      * optionally set "myMax" with the maximum positive/negative zoom
//        allowed, e.g. 0.25 means that the page can zoom between 75 to 125%,
//        default is 0.10, so 90->110%
//	* optionally set "myRedraw" to "both" (default is "width") to adjust
//        to both width and height
//
// example code:
//	<script type="text/javascript" src="/path/to/squeezeFrame.js"></script>
//	<script type="text/javascript">
// 		myContainer="http://url.to/container-page/";
//	 	myMax=0.25;
//		myRedraw="width";
//	</script>
//
// bugs & issues:
//	* embedded YouTube in Firefox becomes invisible (but Vimeo for example
//        does work)
// 	* the vertical scrollbar does not always disappear in FF
//	* does not work in Opera

function squeezeFrame() {
 console.log("squeeze");
 var contentDocument = document.getElementById('xpageframe').contentDocument;
 if (typeof myMax!=="number") { max=0.7; } else { max=myMax;}
 if (typeof myRedraw!=="string") myRedraw="width";
 
 b=contentDocument.getElementsByTagName('body')[0];
 
 console.log(b.clientWidth);
 console.log(b.scrollWidth);
 console.log(window.innerWidth);
 zW=(window.innerWidth-5)/b.scrollWidth;
  console.log(zW);
    
 if (myRedraw==="both") {
 zH=(b.clientHeight)/b.scrollHeight;
 if (zH<zW && zH < 1) { z=zH } else { z=zW };
 }
 else {
 z=zW;
 }

 console.log(z);
 if (z>1+max) { z=1+max; } else if (z<1-max) { z=1-max; }
 console.log(z);
 
 document.getElementById('xpageframe').contentDocument.body.style.WebkitTransform="scale(" + z + ")";
 document.getElementById('xpageframe').contentDocument.body.style.WebkitTransformOrigin="0 0";
}
