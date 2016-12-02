/*
resizable - jQuery Nex
nobo
zere.nobo@gmail.com
qq : 505931977
var drag = new Nex.resizable({target:$('#drag')});
*/
;(function($){
	"use strict";
	var resize = Nex.widget('resizable');

	$.resizable = $.nexResizable = resize;
	
	resize.extend({
		version : '1.0', 
		getDefaults : function(opt){
			var _opt = {
				target: null,
				disabled: false,
				handles:'n, e, s, w, ne, se, sw, nw, all',
				minWidth: 10,
				minHeight: 10,
				maxWidth: 10000,//$(document).width(),
				maxHeight: 10000,//$(document).height(),
				edge : 5,//移动边缘宽度
				left : 0,
				top : 0,
				_sLeft : 0,
				_sTop : 0,
				_sX : 0,
				_sY : 0,
				_sWidth : 0,
				_sHeight : 0,
				width : 0,
				height : 0,
				dir : '',
				events : {
					onStart : $.noop,//初始化事件
					onBeforeResize : $.noop,
					onStartResize : $.noop,
					onResize : $.noop,
					onStopResize : $.noop
				}
			};
			var _opt = this.extSet(_opt);
			
			return $.extend({},_opt,opt);
		}
	});
	resize.fn.extend({
		_init : function(opt) {
			var self = this;
			
			if( !opt.target ) return;
			
			$(opt.target).data('nex.resizable', self);
			
			opt.target.bind('mousedown.resizable', $.proxy( self,'mouseDown' ));
			opt.target.bind('mousemove.resizable', $.proxy( self,'mouseMove' ));
			opt.target.bind('mouseleave.resizable', $.proxy( self,'mouseLeave' ));
		},
		//系统事件
		_sysEvents : function(){
			var self = this;
			var opt = self.configs;
			//self.bind("onStart",self.onStart);	
		},
		getDirection : function(e) {
			var self = this;
			var opt = self.configs;
			var tt = $(opt.target);
			var dir = '';
			var offset = tt.offset();
			var width = tt.outerWidth();
			var height = tt.outerHeight();
			var edge = opt.edge;
			if (e.pageY > offset.top && e.pageY < offset.top + edge) {
				dir += 'n';
			} else if (e.pageY < offset.top + height && e.pageY > offset.top + height - edge) {
				dir += 's';
			}
			if (e.pageX > offset.left && e.pageX < offset.left + edge) {
				dir += 'w';
			} else if (e.pageX < offset.left + width && e.pageX > offset.left + width - edge) {
				dir += 'e';
			}
			
			var handles = opt.handles.split(',');
			for(var i=0; i<handles.length; i++) {
				var handle = handles[i].replace(/(^\s*)|(\s*$)/g, '');
				if (handle == 'all' || handle == dir) {
					return dir;
				}
			}
			return '';
		},
		resize : function(e){
			var self = this;
			var opt = self.configs;
			
			if (opt.dir.indexOf('e') != -1) {
				var width = opt._sWidth + e.pageX - opt._sX;
				width = Math.min(
							Math.max(width, opt.minWidth),
							opt.maxWidth
						);
				opt.width = width;
			}
			if (opt.dir.indexOf('s') != -1) {
				var height = opt._sHeight + e.pageY - opt._sY;
				height = Math.min(
						Math.max(height, opt.minHeight),
						opt.maxHeight
				);
				opt.height = height;
			}
			if (opt.dir.indexOf('w') != -1) {
				opt.width = opt._sWidth - e.pageX + opt._sX;
				if (opt.width >= opt.minWidth && opt.width <= opt.maxWidth) {
					opt.left = opt._sLeft + e.pageX - opt._sX;
				}
			}
			if (opt.dir.indexOf('n') != -1) {
				opt.height = opt._sHeight - e.pageY + opt._sY;
				if (opt.height >= opt.minHeight && opt.height <= opt.maxHeight) {
					opt.top = opt._sTop + e.pageY - opt._sY;
				}
			}
			
		},
		setWH : function(){
			var self = this;
			var opt = self.configs;	
			var v = $(opt.target).outerWidth() - $(opt.target).width();
			var h = $(opt.target).outerHeight() - $(opt.target).height();
			
			$(opt.target).width( opt.width-v );
			$(opt.target).height( opt.height-h );
		},
		_doDown : function(e){
			var self = this;
			var opt = self.configs;
			
			$(document).bind("selectstart.resizable",function(){return false;});	
			
			var r = self.fireEvent('onStartResize',[e,opt]);
			if( r === false) return;
		},
		_doMove : function(e){
			var self = this;
			var opt = self.configs;
			if( opt.disabled ) return;
			
			self.resize(e);
			
			var r = self.fireEvent('onResize',[opt.width,opt.height,e,opt]);
			if( r === false) return ;
			
			self.setWH();
		},
		_doUp : function(e){
			var self = this;
			var opt = self.configs;
			
			//self.resize(e);
			
			var r = self.fireEvent('onStopResize',[opt.width,opt.height,e,opt]);
			if( r !== false) {
				self.setWH();	
			}
			
			$(document).unbind('.resizable');
			$('body').css('cursor','');
		},
		mouseDown : function(e){
			var self = this;
			var opt = self.configs;
			
			var dir = self.getDirection(e);
			if (dir == '') return;
			
			function getCssValue(css) {
				var val = parseInt($(opt.target).css(css));
				if (isNaN(val)) {
					return 0;
				} else {
					return val;
				}
			}
			
			opt.dir = dir;
			opt._sLeft = getCssValue('left');
			opt._sTop = getCssValue('top');
			opt.left = getCssValue('left');
			opt.top = getCssValue('top');
			opt._sX = e.pageX;
			opt._sY = e.pageY;
			opt._sWidth = $(opt.target).outerWidth();
			opt._sHeight = $(opt.target).outerHeight();
			opt.width = $(opt.target).outerWidth();
			opt.height = $(opt.target).outerHeight();
			
			var r = self.fireEvent('onBeforeResize',[e,opt]);
			if( r === false) return;
		
			$(document).bind('mousedown.resizable', $.proxy( self,'_doDown' ));
			$(document).bind('mousemove.resizable', $.proxy( self,'_doMove' ));
			$(document).bind('mouseup.resizable', $.proxy( self,'_doUp' ));	
			$('body').css('cursor', dir+'-resize');	
		},
		mouseMove : function(e){
			var self = this;
			var opt = self.configs;
			
			var dir = self.getDirection(e);
			if (dir == '') {
				$(opt.target).css('cursor', '');
			} else {
				$(opt.target).css('cursor', dir + '-resize');
			}
		},
		mouseLeave : function(e){
			var self = this;
			var opt = self.configs;
			
			$(opt.target).css('cursor', '');
		}
	});
	$.fn.resizable = function(options, param){
		var options = options || {};
		if (typeof options == 'string'){
			switch(options) {
				case 'options':
					return $(this[0]).data('nex.resizable').C();
				case 'disabled':
					return this.each(function(){
								$(this).data('nex.resizable').C('disabled',true);
							});
				case 'enable':
					return this.each(function(){
								$(this).data('nex.resizable').C('disabled',false);
							});
				default : 
					return this.each(function(){
						if( param ) {
							$(this).data('nex.resizable').C(options,param);
						}
					}); 
			}
		}
		
		return this.each(function(){
			var opt;
			var self = $(this).data('nex.resizable');
			if (self) {
				opt = self.configs;
				$.extend(opt, options);
				return;
			}
			options.target = $(this);
			new Nex.resizable(options);
		});
	};
})(jQuery);