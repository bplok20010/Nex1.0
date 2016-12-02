/*
Nex.ajax
*/

;(function($){
	"use strict";
	var ajax = Nex.widget('ajax');
	$.nexAjax = $.extAjax = ajax;
	ajax.extend({
		version : '1.0',
		getDefaults : function(opt){
			var _opt = {
				prefix : 'nexajax-',
				ajax : null,
				isIE : !!window.ActiveXObject,
				data : {},
				_qdata : {},
				events : {
					onStart : $.noop,
					onCreate : $.noop,
					onBeforeSend : $.noop,
					onSuccess : $.noop,
					onError : $.noop,
					onComplete : $.noop
				}
			};
			var _opt = this.extSet(_opt);
			return $.extend({},_opt,opt);
		},
		_Tpl : {}
	});
	ajax.fn.extend({
		_init : function(opt) {
			var self = this,undef;
			opt._beforeSend = opt.beforeSend || null;
			opt._error = opt.error || null;
			opt._success = opt.success || null;
			opt._complete = opt.complete || null;
			
			if( $.isPlainObject(opt.data) ) {
				$.extend( opt.data,opt._qdata );
			} else if( typeof opt.data === 'string' && typeof opt._qdata === 'string' ) {
				opt.data = opt.data.length ? '&'+opt._qdata : opt._qdata;
			}
			
			opt.success = function(){
				var argvs = [];
				for( var i=0;i<arguments.length;i++ ) {
					argvs.push( arguments[i] );	
				}
				argvs.push( this );
				var r = self.fireEvent('onSuccess',argvs);	
				if( r === false ) return r;	
				if( $.isFunction( opt._success ) ) {
					return opt._success.apply( this,argvs );
				}
			}
			opt.beforeSend = function(){
				var argvs = [];
				for( var i=0;i<arguments.length;i++ ) {
					argvs.push( arguments[i] );	
				}
				argvs.push( this );
				var r = self.fireEvent('onBeforeSend',argvs);	
				if( r === false ) return r;
				if( $.isFunction( opt._beforeSend ) ) {
					return opt._beforeSend.apply( this,argvs );
				}
			}
			opt.error = function(){
				var argvs = [];
				for( var i=0;i<arguments.length;i++ ) {
					argvs.push( arguments[i] );	
				}
				argvs.push( this );
				var r = self.fireEvent('onError',argvs);	
				if( r === false ) return r;
				if( $.isFunction( opt._error ) ) {
					return opt._error.apply( this,argvs );
				}
			}
			opt.complete = function(){
				var argvs = [];
				for( var i=0;i<arguments.length;i++ ) {
					argvs.push( arguments[i] );	
				}
				argvs.push( this );
				var r = self.fireEvent('onComplete',argvs);	
				if( r === false ) return r;	
				if( $.isFunction( opt._complete ) ) {
					return opt._complete.apply( this,argvs );
				}
			}
			
			opt.ajax = $.ajax( opt );
			
			self.fireEvent('onCreate',[ opt.ajax,opt ]);	
		},
		getAjax : function(){
			return this.C('ajax');	
		},
		abort : function(){
			var self = this;
			var ajax = self.getAjax();
			if( ajax ) {
				ajax.abort();	
			}
		},
		_sysEvents : function(){
			var self = this;
			var opt = self.configs;
			//self.bind("onTabClick",self.clickToOpen,self);
			return self;
		}
	});
})(jQuery);