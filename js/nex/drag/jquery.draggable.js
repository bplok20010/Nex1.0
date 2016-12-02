/*
draggable - jQuery Nex
nobo
zere.nobo@gmail.com
qq : 505931977
var drag = new Nex.draggable({helper:$('#drag')});
*/
;(function($){
	"use strict";
	var drag = Nex.widget('draggable');

	$.dragable = $.nexDragable = drag;
	
	drag.extend({
		version : '1.0', 
		getDefaults : function(opt){
			var _opt = {
				prefix : 'drag-',
				cursor:'move',
				helper:null,
				target: null,
				disabled: false,
				axis:null,	// v or h
				parent : null,
				left : 0,
				top : 0,
				_sLeft : 0,
				_sTop : 0,
				_sX : 0,
				_sY : 0,
				_sPosition : '',
				edge : 0,//无效边缘
				events : {
					onStart : $.noop,//初始化事件
					onBeforeDrag : $.noop,
					onStartDrag : $.noop,
					onDrag : $.noop,
					onStopDrag : $.noop
				}
			};
			var _opt = this.extSet(_opt);
			
			return $.extend({},_opt,opt);
		}
	});
	drag.fn.extend({
		_init : function(opt) {
			var self = this;
			
			if( !opt.helper ) return;
			var target = null;
            if (typeof opt.target == 'undefined' || opt.target == null){
                target = opt.helper;
            } else {
                target = (typeof opt.target == 'string' ? $(opt.target) : opt.target);
            }
			
			opt.parent = $(target).offsetParent();
			opt.target = target;
			
			
			$(opt.helper).data('nex.draggable', self);
			
			opt.helper.bind('mousedown.draggable', $.proxy( self,'mouseDown' ));
			opt.helper.bind('mousemove.draggable', $.proxy( self,'mouseMove' ));
			opt.helper.bind('mouseleave.draggable', $.proxy( self,'mouseLeave' ));
		},
		
		//系统事件
		_sysEvents : function(){
			var self = this;
			var opt = self.configs;
			//self.bind("onStart",self.onStart);	
		},
		_doDown : function(e){
			var self = this;
			var opt = self.configs;
			
			$(document).bind("selectstart.draggable",function(){return false;});	
			
			var r = self.fireEvent('onStartDrag',[opt.left,opt.top,e,opt]);
			if( r === false) return;
			
			$('body').css('cursor', opt.cursor);
		},
		_doMove : function(e){
			var self = this;
			var opt = self.configs;
			if( opt.disabled ) return;
			
			var left = opt._sLeft + e.pageX - opt._sX;
			var top = opt._sTop + e.pageY - opt._sY;
			
			if (opt.axis == 'h') {
				opt.left = left;
				opt.top = opt._sTop;
			} else if (opt.axis == 'v') {
				opt.left = opt._sLeft;
				opt.top = top;
			} else {
				opt.left = left;
				opt.top = top;
			}
			
			var r = self.fireEvent('onDrag',[opt.left,opt.top,e,opt]);
			if( r === false) return;
			
			self.moveToPosition(opt.left,opt.top,e);	
			
		},
		_doUp : function(e){
			var self = this;
			var opt = self.configs;
			$(document).unbind('.draggable');	
			setTimeout(function(){
				$('body').css('cursor','');
			},100);
			
			var r = self.fireEvent('onStopDrag',[opt.left,opt.top,e,opt]);
			if( r === false ) {
				opt.target.animate({
					left:opt._sLeft,
					top:opt._sTop
				}, function(){
					opt.target.css('position', opt._sPosition);
				});	
			} else {
				//self.moveToPosition(opt.left,opt.top,e);	
			}
			
		},
		moveToPosition : function(left,top,e){
			var self = this;
			var opt = self.configs;
			
			if (opt.parent[0] != document.body) {
				if ($.boxModel == true) {
					left += $(opt.parent).scrollLeft();
					top += $(opt.parent).scrollTop();
				}
			}
			
			opt.target.css({
				left : left,
				top : top,
				position : 'absolute'
			});
		},
		mouseDown : function(e){
			var self = this;
			var opt = self.configs;
			
			if( self.checkDisabledEdge(e) ) {
				opt.helper.css('cursor', '');
				return;
			}
			
			var target = opt.target;
			
			opt.helper.css('cursor', '');

			var position = target.position();
			
			opt.left = position.left;
			opt.top = position.top;
			
			opt._sPosition = target.css('position');
			opt._sLeft = position.left;
			opt._sTop = position.top;
			
			opt._sX = e.pageX;
			opt._sY = e.pageY;
			
			var r = self.fireEvent('onBeforeDrag',[e,opt]);
			if( r === false) return;

			$(document).bind('mousedown.draggable', $.proxy( self,'_doDown' ));
			$(document).bind('mousemove.draggable', $.proxy( self,'_doMove' ));
			$(document).bind('mouseup.draggable', $.proxy( self,'_doUp' ));	
		},
		mouseMove : function(e){
			var self = this;
			var opt = self.configs;
			
			if( self.checkDisabledEdge(e) ) {
				opt.helper.css('cursor', '');
				return;
			}
			
			opt.helper.css('cursor', opt.cursor);
		},
		mouseLeave : function(e){
			var self = this;
			var opt = self.configs;
			
			if( self.checkDisabledEdge(e) ) {
				opt.helper.css('cursor', '');
				return;
			}
			
			opt.helper.css('cursor', '');	
		},
		checkDisabledEdge : function(e){
			var self = this;
			var opt = self.configs;
			var offset = $(opt.helper).offset();
			var width = $(opt.helper).outerWidth();
			var height = $(opt.helper).outerHeight();
			var t = e.pageY - offset.top;
			var r = offset.left + width - e.pageX;
			var b = offset.top + height - e.pageY;
			var l = e.pageX - offset.left;
			return Math.min(t,r,b,l) < opt.edge;
		}
	});
	$.fn.draggable = function(options, param){
		var options = options || {};
		if (typeof options == 'string'){
			switch(options) {
				case 'options':
					return $(this[0]).data('nex.draggable').C();
				case 'disabled':
					return this.each(function(){
								$(this).data('nex.draggable').C('disabled',true);
							});
				case 'enable':
					return this.each(function(){
								$(this).data('nex.draggable').C('disabled',false);
							});
				default : 
					return this.each(function(){
						if( param ) {
							$(this).data('nex.draggable').C(options,param);
						}
					}); 
			}
		}
		
		return this.each(function(){
			var opt;
			var self = $(this).data('nex.draggable');
			if (self) {
				opt = self.configs;
				$.extend(opt, options);
				return;
			}
			options.helper = $(this);
			new Nex.draggable(options);
		});
	};
})(jQuery);