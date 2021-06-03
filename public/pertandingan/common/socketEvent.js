'use strict';

/* jshint ignore:start */
(function(window){
    var socketEvent = {}
    socketEvent.KONEKSI = "koneksi"


    if ( typeof module === 'object' && module && typeof module.exports === 'object' ) {
        module.exports = socketEvent;
    } else {
        window.socketEvent = socketEvent;
    }
})( this );
/* jshint ignore:end */