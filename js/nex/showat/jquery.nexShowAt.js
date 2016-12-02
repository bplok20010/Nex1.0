/*
jquery.nexShowAt.js
http://www.extgrid.com/nexShowAt
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱
eg1:
var at = new Nex.showAt({source:'#t1',el:'#t2'});
eg2:
$("#t1").showAt("#t2"[,{xAlign:'right'}]);
*/

;(function($){
	"use strict";
	var showAt = Nex.widget('showAt');

	$.showAt = $.nexShowAt = showAt;
	
	showAt.extend({
		version : '1.0',
		getDefaults : function(opt){
			var _opt = {
				prefix : 'showAt-',
				source : null,
				openAtOpt : true,//开启后 可使用参数 at 代替el来设置，只是助于理解
				el : null,// 相当于at 或者 一个 坐标eg {left:0,top:2}
				parent : document.body,//source 的父元素 会自动获取offsetParent
				isIE : !!window.ActiveXObject,
				autoRegion : true,//自动调整显示方位
				visibleable : true,//必定可见
				offsetX : 0,//正 负 分别代表外离 内缩
				offsetY : 0,//同上
				zAlign : 'y',// x:横 y:竖
				xAlign : 'center',// left right center
				yAlign : 'center',//top cenger bottom
				animate : null,//动画显示函数 默认直接show
				events : {
					onStart : $.noop,
					onShow : $.noop,
					onGetPosition : $.noop,
					onBeforeAdaptRegion : $.noop,
					onAdaptRegion : $.noop,
					onAdaptPosition : $.noop,
					onBeforeShow : $.noop
				}
			};
			
			var _opt = this.extSet(_opt);
			
			return $.extend({},_opt,opt);
		}
	});
	$.showAt.fn.extend({
		_init : function(opt) {
			var self = this,undef;
			if( opt.source===null ) return false;
			if( opt.openAtOpt && opt.at !== undef ) {
				opt.el = opt.at;	
			}
			var s = $(opt.source);
			if( s.is(':hidden') ) {
				s.show();
				opt.parent = s.offsetParent();//如果source的display 设置为 none 则会是返回body
				s.hide();
			} else {
				opt.parent = s.offsetParent();	
			}
			//曾经在chrome下获取得到的是一个html
			opt.parent = opt.parent.is('html') ? $(document.body) : opt.parent;
			
			if( opt.el === null ) {
				opt.el = opt.parent;
				if( opt.el.is('body') ) {
					opt.el = window;	
				}
			}
			opt.el = (opt.el === document) ? window : opt.el;
		},
		_sysEvents : function(){
			var self = this;
			var opt = self.configs;
			//self.bind("onMouseOver.over",self.onMouseOver,self);
			return self;
		},
		//获取 source元素的 offsetParent
		getRender : function(p){
			var self = this,undef;
			var opt = self.configs;
			var parent = p === undef ? opt.parent : $(p);
			if( parent.is('body') || parent.is('html') ) {//opt.el === window || 
				return window;	
			} else {
				return  parent[0];	
			}
		},
		//返回相对于parent的绝对位置
		getOffset : function(el){
			var self = this,undef;
			var opt = self.configs;	
			var renderTo = self.getRender();
			
			if( $._isPlainObject( el ) ) {
				el.left = el.left === undef ? 0 : el.left ;
				el.top = el.top === undef ? 0 : el.top ;
				var offset = $.extend({},el);
				
				var sLeft = $(renderTo).scrollLeft();
				var sTop = $(renderTo).scrollTop();
				offset.left += sLeft;
				offset.top += sTop;
				return offset;
			}
			
			if( $.isWindow(renderTo) ) {// === window
				var offset = $(el).offset();//el是个纯对象时 会返回null
				var sLeft = $(window).scrollLeft();
				var sTop = $(window).scrollTop();
				//return !offset ? {left:sLeft,top:sTop} : offset;	
				return !offset ? {left:sLeft,top:sTop} : offset;	
			} else {
				var renderTo = $(renderTo);
				var sLeft = renderTo.scrollLeft();
				var sLeftBorder = parseFloat(renderTo.css('borderLeftWidth'));
				sLeftBorder = isNaN( sLeftBorder ) ? 0 : sLeftBorder;
				var sLeftPadding = parseFloat(renderTo.css('paddingLeft'));
				sLeftPadding = isNaN( sLeftPadding ) ? 0 : sLeftPadding;
				
				var sTop = renderTo.scrollTop();
				var sTopBorder = parseFloat(renderTo.css('borderTopWidth'));
				sTopBorder = isNaN( sTopBorder ) ? 0 : sTopBorder;
				var sTopPadding = parseFloat(renderTo.css('paddingTop'));
				sTopPadding = isNaN( sTopPadding ) ? 0 : sTopPadding;
				var offset = {
					left : 0,
					top : 0
				};
				try {
					var rOffset = renderTo.offset();
					var eOffset = $(el).offset();	
					//offset = $(el).position();	
					offset = {
						left : eOffset.left - rOffset.left - sLeftBorder - sLeftPadding,
						top : eOffset.top - rOffset.top - sTopBorder - sTopPadding
					};	
				} catch(e){
					//..el 不是dom	
					sLeft = 0;
					sTop = 0;
				}
				return {
					left : 	sLeft + offset.left,
					top : sTop + offset.top
				};
			}
		},
		//获取el[at]周围可显示空间
		getShowSpace : function(el,parent){
			var self = this,undef;
			var opt = self.configs;
			var el = self._undef(el,opt.el);
			//需要获取的对象
			var obj = $(el);
			
			var renderTo = self.getRender(parent);
			
			//获取窗口显示区域大小
			var cw = $(renderTo).width();
			var ch = $(renderTo).height();
			
			var offset = self.getOffset(el);
			
			//获取滚位置
			var sLeft = $(renderTo).scrollLeft();
			var sTop = $(renderTo).scrollTop();
			
			var space = {
				top : offset.top - sTop,
				left : offset.left - sLeft
			};
			space.bottom = ch - space.top - ( $._isPlainObject(el) ? 0 : obj._outerHeight() );
			space.right = cw - space.left - ( $._isPlainObject(el) ? 0 : obj._outerWidth() );
			
			return space;
		},
		checkSpace : function(a,s,e,r){
			var self = this;
			var opt = self.configs;	
			var space = self.getShowSpace();
			if( space[a]<=0 ) return false;
			switch(a){
				case 'bottom':
					return s.height>space.bottom?false:true;
					break;
				case 'top' : 
					return s.height>space.top?false:true;
					break;
				case 'right' :
					return s.width>space.right?false:true;
					break;
				case 'left' :
					return s.width>space.left?false:true;
					break;
			};
			return true;
		},
		/*
		*根据当前的设置自动适配对应显示位置
		*/
		adaptRegion : function(s,e,r){
			var self = this;
			var opt = self.configs;	
			var zAlign = opt.zAlign.toLowerCase();
			var xAlign = opt.xAlign.toLowerCase();
			var yAlign = opt.yAlign.toLowerCase();
			var space = self.getShowSpace();
			
			var r = self.fireEvent('onBeforeAdaptRegion',[xAlign,yAlign,zAlign,opt]);
			if( r === false ) return false;
			if( zAlign==='y' ) {
				if( yAlign==='center' ) return;
				var sp = self.checkSpace(yAlign,s,e,r);
				if( sp === false ) {
					var _yAlign = yAlign==='bottom' ? 'top' : 'bottom';
					var sp = self.checkSpace(_yAlign,s,e,r);	
					if( sp ) {
						opt.yAlign = _yAlign;
					} else {
						if( space.bottom > space.top ) {
							opt.yAlign = 'bottom';	
						} else if( space.bottom < space.top ) {
							opt.yAlign = 'top';		
						} //===情况
						//opt.yAlign = space.bottom>=space.top?'bottom':'top';	
					}
				}
			} else {
				if( xAlign==='center' ) return;
				var sp = self.checkSpace(xAlign,s,e,r);
				if( sp === false ) {
					var _xAlign = xAlign==='right' ? 'left' : 'right';
					var sp = self.checkSpace(_xAlign,s,e,r);	
					if( sp ) {
						opt.xAlign = _xAlign;
					} else {
						if( space.left > space.right ) {
							opt.yAlign = 'left';	
						} else if( space.left < space.right ) {
							opt.yAlign = 'right';		
						} //===情况
						//opt.xAlign = space.left>=space.right?'left':'right';	
					}
				}	
			}	
			self.fireEvent('onAdaptRegion',[opt.xAlign,opt.yAlign,opt.zAlign,opt]);
		},
		/*是否出现水平滚动条*/ 
		//scrollHeight scrollWidth
		hasScrollBarX : function(el){
			var self = this;
			var el = $(el);
			var overflow = el.css('overflow');
			var overflowX = el.css('overflowX');
			overflowX = !overflowX ? overflow : overflowX;
			if( el.get(0).scrollWidth <= el.width() ) {
				return false;	
			}
			return self.inArray( overflowX,[ 'hidden','visible' ] ) === -1 ? true : false;
		},
		/*是否出现垂直滚动条*/
		hasScrollBarY : function(el){
			var self = this;
			var el = $(el);
			var overflow = el.css('overflow');
			var overflowY = el.css('overflowY');
			overflowY = !overflowY ? overflow : overflowY;
			if( el.get(0).scrollHeight <= el.height() ) {
				return false;	
			}
			return self.inArray( overflowY,[ 'hidden','visible' ] ) === -1 ? true : false;	
		},
		adaptPosition : function(pos){
			var self = this;
			var opt = self.configs;
			var renderTo = self.getRender();
			
			//if( !$.isWindow(renderTo) ) return pos;
			
			var winWidth = $(renderTo).width();
			var winHeight = $(renderTo).height();
			if( !$.isWindow(renderTo) ) {
				var scrollbarSize = self.getScrollbarSize();
				if( self.hasScrollBarX(renderTo) ) {
					winHeight -= scrollbarSize.width;	
				}
				if( self.hasScrollBarY(renderTo) ) {
					winWidth -= scrollbarSize.height;	
				}
			}
			/*
			*有个小bug @已修正
			*如果renderTo 不是window时，应该判断renderTo 是否出现滚动条 然后winWidth - scrollBarWidth,winHeight - scrollBarWidth
			*/
			
			//获取滚位置
			var sLeft = $(renderTo).scrollLeft();
			var sTop = $(renderTo).scrollTop();
			var width = self.getWidth(opt.source);
			var height = self.getHeight(opt.source);

			var x = winWidth + sLeft - pos.left - width;
			var y = winHeight + sTop - pos.top - height;

			x = x<0?x:0;
			y = y<0?y:0;
			pos.left = (pos.left + x - sLeft)<0?sLeft:(pos.left + x);
			pos.top = (pos.top + y - sTop)<0?sTop:(pos.top + y);
			self.fireEvent('onAdaptPosition',[pos,opt]);
			return pos;
		},
		getWidth : function(el){
			var self = this;
			var opt = self.configs;
			return $._isPlainObject(el) ? 0 : $(el)._outerWidth();
		},
		getHeight : function(el){
			var self = this;
			var opt = self.configs;
			return $._isPlainObject(el) ? 0 : $(el)._outerHeight();
		},
		/*
		*x_inner_top x_inner_bottom y_inner_left y_inner_right
		*/
		x_innerleft : function(s,e,r){
			var self = this;
			var opt = self.configs;
			return e.left + opt.offsetX;
		},
		x_innerright : function(s,e,r){
			var self = this;
			var opt = self.configs;
			return e.left + ( e.width-s.width ) - opt.offsetX;
		},
		y_innertop : function(s,e,r){
			var self = this;
			var opt = self.configs;
			return e.top + opt.offsetY;
		},
		y_innerbottom : function(s,e,r){
			var self = this;
			var opt = self.configs;
			return e.top + ( e.height-s.height ) - opt.offsetY;
		},
		x_left : function(s,e,r){
			var self = this;
			var opt = self.configs;
			var zAlign = opt.zAlign.toLowerCase();
			return zAlign==='y' ? e.left + opt.offsetX : e.left-s.width - opt.offsetX ;
		},
		x_center : function(s,e,r){
			var self = this;
			var opt = self.configs;
			return e.left+(e.width-s.width)/2;
			//return (e.width-s.width)/2;
		},
		x_right : function(s,e,r){
			var self = this;
			var opt = self.configs;
			var zAlign = opt.zAlign.toLowerCase();
			return zAlign==='y' ? e.left + ( e.width-s.width ) - opt.offsetX : e.left+e.width + opt.offsetX ;
		},
		y_top : function(s,e,r){
			var self = this;
			var opt = self.configs;
			var zAlign = opt.zAlign.toLowerCase();
			return zAlign==='y' ? e.top-s.height - opt.offsetY : e.top-( s.height-e.height ) - opt.offsetY;
		},
		y_center : function(s,e,r){
			var self = this;
			var opt = self.configs;
			var zAlign = opt.zAlign.toLowerCase();
			return e.top+(e.height-s.height)/2;
			//return (e.height-s.height)/2;
		},
		y_bottom : function(s,e,r){
			var self = this;
			var opt = self.configs;
			var zAlign = opt.zAlign.toLowerCase();
			return zAlign==='y' ? e.top+e.height + opt.offsetY : e.top + opt.offsetY;
		},
		
		fixPosition : function(pos,opt){
			var self = this;
			
			/*if( opt.parent[0] !== document.body ) {
				if( $.support.boxModel == true ) {
					var _pos = $(opt.parent).offset();
					pos.left = pos.left- _pos.left;
					pos.top = pos.top- _pos.top;
				}
			}*/
			return pos;
		},
		unFixPosition : function(pos,opt){
			var self = this;
			/*if( opt.parent[0] !== document.body ) {
				if( $.support.boxModel == true ) {
					var _pos = $(opt.parent).offset();
					pos.left = pos.left + _pos.left;
					pos.top = pos.top + _pos.top;
				}
			}*/
			return pos;
		},
		getShowPos : function(){
			var self = this;
			var opt = self.configs;
			//滚动位置
			var renderTo = self.getRender();
			var sLeft = $(renderTo).scrollLeft();
			var sTop = $(renderTo).scrollTop();
			var scrollPos = {
				left : sLeft,
				top : sTop
			};
			//源数据
			var source = self.getOffset(opt.source);
			source.width = self.getWidth( opt.source );
			source.height = self.getHeight( opt.source );
			//目标数据
			var target = self.getOffset(opt.el);
			target.width = self.getWidth( opt.el );
			target.height = self.getHeight( opt.el );
			//自动设置或获取显示方位
			if( opt.autoRegion ) {
				self.adaptRegion(source,target,scrollPos);
			}
			
			//获取显示位置
			var _func = function(func){
				var getPos = null;
				if( func in opt ) {
					getPos = opt[func];	
				} else if( func in self ) {
					getPos = self[func];		
				} else if( func in window ) {
					getPos = window[func];	
				} else {
					getPos = function(){return {left:0,top:0};};	
				}
				return getPos;
			}
			var x_func = 'x_'+opt.xAlign.toLowerCase();
			var y_func = 'y_'+opt.yAlign.toLowerCase();
			var pos = {
				left : _func(x_func).call(self,source,target,scrollPos),
				top : _func(y_func).call(self,source,target,scrollPos) 
			};
			var _pos = false;
			
			if( opt.visibleable ) {
				_pos = self.adaptPosition(pos);	
			}
			var p = _pos ? _pos : pos;
			//对显示坐标做最终检测
			p = self.fixPosition(p,opt);
			
			self.fireEvent("onGetPosition",[p,opt]);
			//位置的最后修改
			return p;
		},
		show : function(){
			var self = this,
				opt=this.configs;	
			var pos = self.getShowPos();
			var r = self.fireEvent("onBeforeShow",[pos,opt]);
			if( r === false ) return false;
			if( $.isFunction(opt.animate) ) {
				opt.animate.call(self,opt.source,pos);	
			} else {
				var position = $(opt.source).css('position');
				if( position === 'static' || position === 'relative' ) {
					pos.position = 'absolute';
				}
				$(opt.source).css(pos).show();
			}
			self.fireEvent("onShow",[pos,opt]);
		}
	});
	$.fn.nexShowAt = function(options,conf){
		var undef,opt;
		var conf = conf === undef ? {} : conf;
		if( options === undef ) {
			opt = {}	
		}else if( !$._isPlainObject(options) ) {
			opt = { el:options };	
			$.extend(opt,conf);
		} else {
			opt = 	options;
		}
		var list = [];
		this.each(function(){
			opt.source = $(this);
			var o = new Nex.showAt(opt);
			o.show();
			list.push(o);
			$(this).data('nex.showAt',o);
		});
		return list.length === 1 ? list[0] : list;
	};
	$.fn.showAt = $.fn.nexShowAt;
})(jQuery);