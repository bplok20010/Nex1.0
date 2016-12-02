/*
Nex.location
eg
index.html#!/Home/Login
*/

;(function($){
	"use strict";
	var $location = Nex.widget('location');
	$.nexLocation = $.extLocation = location;
	$location.extend({
		version : '1.0',
		getDefaults : function(opt){
			var _opt = {
				prefix : 'nexlocation-',
				ajax : null,
				data : {},
				_qdata : {},
				removeHTag : true,//删除 #
				removeHTagData : '#', 
				location : window.location,
				doc : document,
				timeout_id : null,
				hash : '',
				_iframe : null,
				_delay : 50,
				_currentHash : '',
				supportHashChange : (function(win){
					var  documentMode = document.documentMode;
					return ('onhashchange' in window) && ( documentMode === void 0 || documentMode > 7 );	
				})(window),
				events : {
					onStart : $.noop,
					onCreate : $.noop,
					onGetHash : $.noop,
					onInitHashChange : $.noop,
					onHashChange : $.noop
				}
			};
			var _opt = this.extSet(_opt);
			return $.extend({},_opt,opt);
		},
		_Tpl : {}
	});
	$location.fn.extend({
		_init : function(opt) {
			var self = this;
			self.initLocation();
		},
		_getHash : function( url ) {
			var self = this;
			var opt = self.C();
            url = url || opt.location.href;
			return '#' + url.replace( /^[^#]*#?(.*)$/, '$1' );
        },
		getHash : function( url ){
			var self = this;	
			var opt = self.C();
			opt.hash = self._getHash( url );
			self.fireEvent('onGetHash',[ opt ]);	
			return opt.hash;
		},
		_initHashChange : function(){
			var self = this;
			var opt = self.C();	
			var iframe, timeoutID;
			
			opt.last_hash = self._getHash();
			
			iframe = $('<iframe tabindex="-1" title="empty"/>').hide()
			
				.one( 'load', function(){
					 self.history_set( self._getHash() );
					//计时器监控hanschange
					self._poll();
				})
				// Load Iframe src if specified, otherwise nothing.
				.attr( 'src', 'javascript:0' )
				// Append Iframe after the end of the body to prevent unnecessary
				// initial page scrolling (yes, this works).
				.insertAfter( 'body' );
			
			opt._iframe = iframe;
			opt._iframe_win = iframe[0].contentWindow;
			
		},
		history_get : function() {
			var self = this;
			var opt = self.C();	
			return self._getHash( opt._iframe_win.location.href );
		},
		history_set : function( hash, history_hash ) {
			var self = this;
			var opt = self.C();	
			var iframe = opt._iframe_win;
			var iframe_doc = iframe.document;
			var doc = opt.doc;
			if ( hash !== history_hash ) {
			  // Update Iframe with any initial `document.title` that might be set.
			  iframe_doc.title = doc.title;
			  
			  // Opening the Iframe's document after it has been closed is what
			  // actually adds a history entry.
			  iframe_doc.open();
			  
			  // Set document.domain for the Iframe document as well, if necessary.
			  //domain && iframe_doc.write( '<script>document.domain="' + domain + '"</script>' );//''
			  
			  iframe_doc.close();
			  
			  // Update the Iframe's hash, for great justice.
			  iframe.location.hash = hash;
			}
		  },
		_poll : function() {
			var self = this;
			var opt = self.C();	
			  var hash = self._getHash(),
			  	last_hash = opt.last_hash,
				history_hash = self.history_get( last_hash );
			  
			  if ( hash !== last_hash ) {
				self.history_set( opt.last_hash = hash, history_hash );
				self.fireEvent('onHashChange',[self.getHash(),opt]);
			  } else if ( history_hash !== last_hash ) {
				location.href = location.href.replace( /#.*/, '' ) + history_hash;
			  }
			  
			  opt.timeout_id = setTimeout( function(){
					self._poll();									
				}, opt._delay );
		},
		initLocation : function(){
			var self = this;
			var opt = self.C();	
			if( opt.supportHashChange ) {
				$(window).bind('hashchange.location',function(){
					self.fireEvent('onHashChange',[ self.getHash(),opt ]);	
				});	
				self.fireEvent('onInitHashChange',[ self.getHash(),opt ]);
				self.fireEvent('onCreate',[ opt ]);
			} else {
				$(document).ready(function(){
					self._initHashChange();		
					self.fireEvent('onInitHashChange',[ self.getHash(),opt ]);
					self.fireEvent('onCreate',[ opt ]);						   
				});
			}
		},
		_sysEvents : function(){
			var self = this;
			var opt = self.configs;
			self.bind('onGetHash',function(opt){
				if( opt.removeHTag ) {
					opt.hash = opt.hash.replace( opt.removeHTagData ,'');	
				}
			});	
			return self;
		}
	});
})(jQuery);