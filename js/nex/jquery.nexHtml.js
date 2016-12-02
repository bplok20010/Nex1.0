/*
xtype html
继承用
*/
;(function($){
	"use strict";
	var html = Nex.widget('html');
	$.nexHtml = $.extHtml = html;
	html.extend({
		version : '1.0',
		getDefaults : function(opt){
			var _opt = {
				prefix : 'nexhtml-',
				tag : 'div',
				autoScroll : false,
				autoResize : true,
				selectionable : true,
				tabIndex : -1,
				renderTo : document.body,
				//isIE : !!window.ActiveXObject,
				url : '',//支持远程创建 返回数据格式  json
				cache : true,
				dataType : 'json',
				queryParams : {},
				method : 'get',
				parames : {},
				cls : '',
				overCls : '',
				cssText : '',
				width : 'auto',// 设为auto后 大小将不会设置 宽度 高度都是auto 或者css控制的,设为0 相当于100% 
				height : 'auto',
				border : false,
				borderCls : 'nex-html-border',
				containerCls : 'nex-html',
				autoScrollCls : 'nex-html-auto-scroll',
				_initMethod : [],//初始时扩展调用
				padding : 0,
				style : {},
				'class' : '',
				views : {},
				attrs : {},
				html : '',
				items : [],
				denyEvents : false,
				events : {
					onStart : $.noop,
					onCreate : $.noop,
					onSetContainerSize : $.noop,
					onSizeChange : $.noop,
					onSetContainerEvent : $.noop
				}
			};
			var _opt = this.extSet(_opt);
			return $.extend({},_opt,opt);
		},
		_Tpl : {}
	});
	html.fn.extend({
		_init : function(opt) {
			var self = this;
			var methods = opt._initMethod;
			self.setContainer();
			/*调用扩展api*/
			if( methods.length ) {
				var i=0,len = methods.length;
				for( ;i<len;i++ ) {
					var m = methods[i];
					if( !m ) continue;
					if( $.isFunction( m ) ) {
						m.call( self );	
					} else if( ($.type( m ) === 'string') && $.isFunction( self[m] ) ) {
						self[m].call( self );	
					}
				}	
			}
			self.initComponent();
		},
		_sysEvents : function(){
			var self = this;
			var opt = self.configs;
			self.bind("onStart",function(){
				if( opt.autoSize ) {
					opt.width = 'auto';
					opt.height = 'auto';
				}
			});
			self.bind("onCreate",function(){
				opt._isInit = false;	
			});
			self.bind("onMouseEnter",self._setOverCls,self);
			self.bind("onMouseLeave",self._unsetOverCls,self);
			return self;
		},
		/*如果width height 设置的是百分比那么将返回百分比值，只对resize和初始创建时有效*/
		getResizeWH : function(){
			var self = this;
			var opt = self.C();	
			var views = opt.views;
			var container = views['container'];
			var renderTo = $(opt.renderTo);
			var width =  renderTo._width();
			var height =  renderTo._height();
			
			var isChange = true;
			if( opt.pWidth === width && opt.pHeight === height && opt._isResize ) {//resize 时才判断 setWH 都会执行
				isChange = false;	
			}
			if( !isChange ) {
				return {
					width:opt._width,
					height:opt._height,
					isChange : isChange
				};	
			}
			
			opt.pWidth = width;
			opt.pHeight = height;
			
			var w = parseFloat(opt.width) === 0 ? width : opt.width
				,h = parseFloat(opt.height) === 0 ? height : opt.height;

			if( opt.width.toString().indexOf("%") != -1 ) {
				w = parseFloat(opt.width)*width/100;
			}
			if( opt.height.toString().indexOf("%") != -1 ) {
				h = parseFloat(opt.height)*height/100;
			}
			if( w === 'auto' || isNaN(parseFloat(w)) ) {
				$.each( views , function(key,_item){
					_item._removeStyle('width',true);	
				} );
				//container._removeStyle('width',true);
				w = container._outerWidth();	
			}
			if( h === 'auto' || isNaN(parseFloat(h)) ) {
				//container._removeStyle('height',true);
				$.each( views , function(key,_item){
					_item._removeStyle('height',true);	
				} );
				h = container._outerHeight();	
			}
			//因为浏览器会对像素进行 四舍五入 处理 所以应该用parseInt对像素取整 
			return {
				width:parseInt(w),
				height:parseInt(h),
				isChange : isChange
			};
		},
		checkSize : function(width,height){
			var self = this;
			var opt = self.configs;	
			//var renderTo = $(opt.renderTo);
			var cutHeight = self._getCutHeight(opt.cutHeight);
			var cutWidth = self._getCutWidth(opt.cutWidth);
			height -= isNaN(parseFloat(opt.cutHeight)) ? 0 : opt.cutHeight;
			width -= isNaN(parseFloat(opt.cutWidth)) ? 0 : opt.cutWidth;
			
			var minWidth = self._getMinWidth();
			var minHeight = self._getMinHeight();
			var maxHeight = self._getMaxHeight();
			var maxWidth = self._getMaxWidth();
			
			if( maxWidth>0 ) {
				width = Math.min(width,maxWidth);
			}
			if( maxHeight>0 ) {
				height = Math.min(height,maxHeight);
			}
			if( minWidth>0 ) {
				width = Math.max(width,minWidth);
			}
			if( minHeight>0 ) {
				height = Math.max(height,minHeight);
			}
			
			return {
					//width : isNaN(width)?'auto':width,
					//height : isNaN(height)?'auto':height
					width : parseInt(isNaN(width)?opt.pWidth:width),//实际上 width,height 一直不会是NaN
					height : parseInt(isNaN(height)?opt.pHeight:height)
				};
		},
		setContainerSize : function(w,h){
			var self = this,
				undef,
				opt = self.configs,	
				//render = $(opt.renderTo),
				container = opt.views['container']
				;
			
			opt.width = w === undef ? opt.width : w;	
			opt.height = h === undef ? opt.height : h;
			
			var size = self.getResizeWH();
			//注：如果width,height 为auto是 size 和 wh 的 width height 应该是一样的 除非设置了 max/min/cut width height 
			var wh = self.checkSize( size.width,size.height );
			
			self.fireEvent('onSetContainerSize',[wh,opt]);
			//判断宽高大小是否有变更
			if( !size.isChange ) {
				return false;	
			}
			
			opt._width = wh.width;
			opt._height = wh.height;
			
			var _w = opt.width.toString().toLowerCase(),
				_h = opt.height.toString().toLowerCase();
				
			//判断是否设置了 max/min/cut width height 
			if( _w === 'auto' && size.width !== wh.width ) {
				_w = wh.width;	
			}	
			if( _h === 'auto' && size.height !== wh.height ) {
				_h = wh.height;	
			}
			
			opt.realWidth = _w;
			opt.realHeight = _h;	
			
			//最终判断 如果 _w _h 已然是auto 那么参数  max/min/cut width height  根本没有设置 width heigth 可以设为auto 否则就设为对应的数
			if( _w !== 'auto') {
				container._outerWidth(opt._width);	
			} else {
				container._removeStyle('width',true);
			}
			if( _h !== 'auto') {
				container._outerHeight(opt._height);	
			} else {
				container._removeStyle('height',true);
			}
			
			return true;
		},
		onSizeChange : function(w,h){
			var self = this,
				undef,
				opt = self.configs,
				container = opt.views['container'];	
			
			var r = self.setContainerSize(w,h);
			
			if( r ) {
				
				self.onViewSizeChange(function(){
					self.fireEvent('onSizeChange',[container,opt]);
					if( Nex.Manager ) {
						setTimeout(function(){
							Nex.Manager.fireEvent("onResize",[opt.id]);		
						},0);
					}	
				});
				
			}
			
		},
		onViewSizeChange : function(func){
			var self = this,
				undef,
				opt = self.configs;
			if( $.isFunction(func) && !opt._isInit ) {	
				func.call(self);	
			}
		},
		setWH : function(w,h){
			var self = this,
				opt = self.configs;
			self.onSizeChange(w,h);
			return true;
		},
		autoSize : function(){
			this.setWH('auto','auto');	
		},
		//m : true 强制刷新
		resize : function(m){
			var self = this,
				opt = self.configs,
				undef;
			
			opt._rt = opt._rt || 0;
			
			if( opt._rt ) {
				clearTimeout( opt._rt );	
			}
			
			opt._rt = setTimeout(function(){
				opt._isResize = true;
				self.setWH();
				opt._isResize = false;
			},0);
		},
		setContainerEvent : function(){
			var self = this;
			var opt = self.C();
			var container = opt.views['container'];
			
			//事件绑定
			if( opt.denyEvents ) {
				return false;
			} else if( $.isFunction(opt.denyEvents) ) {
				opt.denyEvents.call(self);	
				return false;
			}
			
			var callBack = function(type,e){
				var r = self.fireEvent(type,[ this,e,opt ]);
				if( r === false ) {
					e.stopPropagation();
					e.preventDefault();
				}
			};
			var events = {
				'focus' : function(e) {
					callBack.call(this,'onFocus',e);
				},
				'blur' : function(e) {
					callBack.call(this,'onBlur',e);
				},
				'click' : function(e) {
					callBack.call(this,'onClick',e);
				},
				'dblclick' : function(e) {
					callBack.call(this,'onDblClick',e);
				},
				'scroll' : function(e){
					callBack.call(this,'onScroll',e);	
				},
				'keydown' : function(e) {
					callBack.call(this,'onKeyDown',e);
				},
				'keyup' : function(e) {
					callBack.call(this,'onKeyUp',e);
				},
				'keypress' : function(e){
					callBack.call(this,'onKeyPress',e);
				},
				'mousewheel' : function(e){
					callBack.call(this,'onMouseWheel',e);	
				},
				'mouseenter' : function(e){
					callBack.call(this,'onMouseEnter',e);
				},
				'mouseleave' : function(e){
					callBack.call(this,'onMouseLeave',e);
				},
				'mouseover' : function(e){
					callBack.call(this,'onMouseOver',e);
				},
				'mouseout' : function(e){
					callBack.call(this,'onMouseOut',e);
				},
				'mousedown' : function(e) {
					callBack.call(this,'onMouseDown',e);
				},
				'mouseup' : function(e) {
					callBack.call(this,'onMouseUp',e);
				},
				'contextmenu' : function(e){	
					callBack.call(this,'onContextMenu',e);
				}
			};
			container.bind(events);
			self.fireEvent("onSetContainerEvent",[container,opt]);
			return true;
		},
		_disableSelection : function(){
			var self = this;
			var opt = self.C();	
			var container = opt.views['container'];	
			container.disableSelection();	
		},
		setContainer : function(){
			var self = this;
			var opt = self.C();
			var render = $( $.isWindow(opt.renderTo) ? document.body : opt.renderTo );
			var container = $('<'+opt.tag+' class="'+opt.containerCls+' '+( opt.autoScroll ? opt.autoScrollCls : '' )+' '+( opt.border ? opt.borderCls : '' )+' '+opt.cls+' '+ opt['class'] +'" id="'+opt.id+'"></'+opt.tag+'>');
			render.append(container);
			opt.views['container'] = container;
			
			container[0].style.cssText = opt.cssText;
			
			container.css('padding',opt.padding);
			
			if( opt.tabIndex !== false ) {
				//设置tabIndex=-1 
				container.attr( {
					tabIndex : opt.tabIndex	   
				} );
			}
			container.attr( opt.attrs )
				     .css( opt.style );
					 
			self.setContainerEvent();	 
			
			if( !opt.selectionable ) {
				self._disableSelection();	
			}
			
			self.fireEvent("onContainerCreate",[container,opt]);
			return self;
		},
		_autoSize : function(){
			var self = this;
			var opt = self.configs;	
			var minWidth = self._getMinWidth();
			var minHeight = self._getMinHeight();
			var maxHeight = self._getMaxHeight();
			var maxWidth = self._getMaxWidth();	
			
			if( !minWidth && !minHeight && !maxHeight && !maxWidth ) {
				return self;	
			}
			
			if( opt.width === 'auto' || opt.height==='auto' ) {
				self.onSizeChange();
			}
			
			return self;
		},
		initComponent : function(){
			var self = this;
			var opt = self.configs;	
			self.onSizeChange();
			self._appendContent();
			self._autoSize();
			self.fireEvent('onCreate',[opt]);
			opt._isInit = false;
		},
		_appendContent : function(){
			var self = this;
			var opt = self.C();	
			var lbody = opt.views['container'];
			var items = opt['html'];
			self.addComponent( lbody,items );
			var items = opt['items'];
			self.addComponent( lbody,items );
			return lbody;
		},
		_setOverCls : function(){
			var self = this,
				opt = self.configs,
				container = opt.views['container'];
			if( opt.overCls ) {
				container.addClass( opt.overCls );	
			}
		},
		_unsetOverCls : function(){
			var self = this,
				opt = self.configs,
				container = opt.views['container'];
			if( opt.overCls ) {
				container.removeClass( opt.overCls );	
			}
		}
	});
})(jQuery);