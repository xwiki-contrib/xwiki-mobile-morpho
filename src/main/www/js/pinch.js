unction GestureCallback( element, endCallback, changeCallback ) {
    this.element = element;
    this.end_callback = endCallback;
    this.change_callback = changeCallback;
    this.scale = 1;
    this.rotation = 0;
    this.init();
}

GestureCallback.prototype.init = function() {
    // scope functions for listener removal
    var self = this;
    this.gestureStart = function(e){ self.onGestureStart(e) };
    this.gestureChange = function(e){ self.onGestureChange(e) };
    this.gestureEnd = function(e){ self.onGestureEnd(e) };
    
    // really no need to check for IE stupidness, but maybe they'll support gestures someday? oy.
    if( this.element.attachEvent ) this.element.attachEvent( "touchstart", this.gestureStart ); else this.element.addEventListener( "touchstart", this.gestureStart, false );
    if( this.element.attachEvent ) this.element.attachEvent( "gesturestart", this.gestureStart ); else this.element.addEventListener( "gesturestart", this.gestureStart, false );
};

GestureCallback.prototype.onGestureStart = function ( e ) {
    if( this.element.attachEvent ) this.element.attachEvent( "gesturechange", this.gestureChange ); else this.element.addEventListener( "gesturechange", this.gestureChange, false );
    if( this.element.attachEvent ) this.element.attachEvent( "gestureend", this.gestureEnd ); else this.element.addEventListener( "gestureend", this.gestureEnd, false );
};

GestureCallback.prototype.onGestureChange = function ( e ) {
    this.scale = e.scale;
    this.rotation = e.rotation;
    if( this.change_callback ) this.change_callback( this.scale, this.rotation );
};

GestureCallback.prototype.onGestureEnd = function ( e ) {
    if( this.element.detachEvent ) this.element.detachEvent( "gesturechange", this.gestureChange ); else this.element.removeEventListener( "gesturechange", this.gestureChange, false );
    if( this.element.detachEvent ) this.element.detachEvent( "gestureend", this.gestureEnd ); else this.element.removeEventListener( "gestureend", this.gestureEnd, false );
    
    this.scale = e.scale;
    this.rotation = e.rotation;
    if( this.end_callback ) this.end_callback( this.scale, this.rotation );
};

GestureCallback.prototype.dispose = function() {
    if( this.element.attachEvent ) this.element.detachEvent( "touchstart", this.gestureStart ); else this.element.removeEventListener( "touchstart", this.gestureStart, false );
    if( this.element.attachEvent ) this.element.detachEvent( "gesturestart", this.gestureStart ); else this.element.removeEventListener( "gesturestart", this.gestureStart, false );
    
    this.element = null;
    this.end_callback = null;
    this.change_callback = null;
    
    this.gestureStart = null;
    this.gestureChange = null;
    this.gestureEnd = null;
};