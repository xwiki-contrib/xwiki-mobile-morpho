isc.Element.addClassMethods({getOffsetLeft:function(e){if(e==null){this.logWarn("getOffsetLeft: passed null element");
return 0
}var c=e.offsetLeft;
if(e._cachedReportedOffsetLeft==c){return e._cachedCalculatedOffsetLeft
}else{}var a=parseInt(isc.Element.getComputedStyleAttribute(e,"marginLeft"));
if(isc.isA.Number(a)&&a>0){c-=a
}var i=this.getDocumentBody(),n,m="px",d=e.style.position;
if(isc.Browser.isMoz){if(e.offsetParent==null){return c
}if(e.offsetParent!=i){n=this.ns.Element.getComputedStyle(e.offsetParent,["borderLeftWidth","overflow"]);
var o=isc.Browser.geckoVersion,l=(n.overflow!="visible")&&(o>=20051111||(d==isc.Canvas.ABSOLUTE&&n.overflow!="hidden")),j=(o>20020826&&(e.offsetParent.style.MozBoxSizing=="border-box"));
if(j!=l){if(j){c-=(isc.isA.Number(parseInt(n.borderLeftWidth))?parseInt(n.borderLeftWidth):0)
}if(l){c+=(isc.isA.Number(parseInt(n.borderLeftWidth))?parseInt(n.borderLeftWidth):0)
}}}}if(isc.Browser.isIE&&!isc.Browser.isIE8Strict){var b=e.offsetParent,n;
if(b&&n!=i){n=b.currentStyle
}var h=(e.currentStyle.height!=isc.Canvas.AUTO||e.currentStyle.width!=isc.Canvas.AUTO);
var f=true;
while(b&&b!=document.body){if(n.position==isc.Canvas.ABSOLUTE){f=false
}if(n.width==isc.Canvas.AUTO&&n.height==isc.Canvas.AUTO&&n.position==isc.Canvas.RELATIVE){if(f&&isc.isA.String(n.borderLeftWidth)&&n.borderLeftWidth.contains(m)){c-=parseInt(n.borderLeftWidth)
}if(h){if(isc.isA.String(n.marginLeft)&&n.marginLeft.contains(m)){var g=parseInt(n.marginLeft);
if(g>0){c-=g
}}if(b.offsetParent!=i){var k=b.offsetParent.currentStyle.padding;
if(isc.isA.String(k)&&k.contains(m)){c-=parseInt(k)
}}else{c-=(i.leftMargin?parseInt(i.leftMargin):0)
}}}d=b.style.position;
b=b.offsetParent;
if(b&&b!=document.body){n=b.currentStyle
}}}if(isc.Browser.isSafari&&isc.Browser.safariVersion<525.271){if(e.offsetParent!=null&&e.offsetParent!=i){var p=this.ns.Element.getComputedStyle(e.offsetParent,["borderLeftWidth"]).borderLeftWidth;
if(p!=null){p=parseInt(p)
}if(isc.isA.Number(p)){c-=p
}}}e._cachedReportedOffsetLeft=e.offsetLeft;
e._cachedCalculatedOffsetLeft=c;
return c
}});