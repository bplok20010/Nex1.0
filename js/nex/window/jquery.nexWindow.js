/*
jquery.nexWindow.js
http://www.extgrid.com/window
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱

*/

;(function($){
	"use strict";
	var win = Nex.widget('window');

	$.nexWindow = $.extWindow = win;
	
	win.extend({
		version : '1.0',
		//zIndex : 9999999,
		getDefaults : function(opt){
			var _opt = {
				prefix : 'nexwindow-',
				autoResize : true,
				position : 'absolute',
				autoScroll : false,
				autoShow : true,
				closeToRremove : true,//关闭窗口后 销毁对象
				draggable : true,
				resizeable : false,
				modal : false,
				focusToTop : true,//点击窗口后最顶层显示
				zIndex : (function(){
					var zIndex = Nex['zIndex']+2;
					Nex['zIndex'] = zIndex;
					return zIndex;
				})(),
				refreshPosOnResize : true,//通过调用resize时会重置窗口显示位置
				point : null,//point : {left:0,top:0},
				showAt : {},
				title : '',
				toolsItems : [],//更自由的自定义组件显示
				toolsIcons : [],//自定义图标显示 {icon:'abc',text:'',callBack:func}
				collapseable : false,
				collapsed :　false,
				minable : false,
				maxable : false,
				hideHeader : false,
				closeable : false,
				headerItems : [],
				footerItems : [],
				html : '',
				items : [],
				padding : 0,//body的
				style : '',//body的
				renderTo : window,
				isIE : !!window.ActiveXObject,
				url : '',//支持远程创建 返回数据格式  json
				cache : true,
				dataType : 'json',
				queryParams : {},
				method : 'get',
				parames : {},
				views : {},
				cls : '',
				modalCls : '',
				bodyCls : '',
				autoSize : false,
				width : 0,
				height : 0,
				maxWidth : 0,
				maxHeight : 0,
				minHeight : 100,
				minWidth : 230,
				events : {
					onStart : $.noop,
					onCreate : $.noop,
					onDestroy : $.noop
				}
			};
			
			var _opt = this.extSet(_opt);
			
			return $.extend({},_opt,opt);
		},
		_Tpl : {				
		}
	});
	win.fn.extend({
		_init : function(opt) {
			var self = this;
			//保存初始设置值
			opt.__width = opt.width;
			opt.__height = opt.height;
			self.setContainer();//setContainer必须
			if( !opt.hideHeader ) {	
				self.setHeader();
			}
			self.setHeaderItems()
				.setBody()
				.setFooter()
				.createModal()
				.initWindow();		
		},
		_sysEvents : function(){
			var self = this;
			var opt = self.configs;
			self.bind("onHeaderCreate",self._drag,self);
			self.bind("onCreate",self._resizeable,self);
			self.bind("onHeaderCreate",self._setTopzindex,self);
			//self.bind("onHeaderCreate",self.displayHeader,self);
			return self;
		},
		displayHeader : function(){
			var self = this;
			var opt = self.configs;
			if( opt.hideHeader ) {
				opt.views['header'].hide();	
			} else {
				opt.views['header'].show();	
			}
		},
		_setTopzindex : function(){
			var self = this;
			var opt = self.configs;	
			
			if( !opt.focusToTop ) return;
			
			var container = opt.views['container'];
			
			container.bind('mousedown.zindex',function(e){
				var zIndex = Nex['zIndex']+2;
				Nex['zIndex'] = zIndex;
				opt.zIndex = zIndex; 
				
				container.css('z-index',opt.zIndex);
				var modal = false;	
				if( opt.modal && ('modal' in opt.views) ) {
					modal = opt.views['modal'];
					modal.css('z-index',opt.zIndex-1);
				}										   
			
			});
		},
		_drag : function(){
			var self = this;
			var opt = self.configs;
			if( !opt.draggable || !Nex.draggable ) return;
			var header = opt.views['header'];
			Nex.Create('draggable',{
				helper : header,
				target:opt.views['container'],
				onBeforeDrag : function(e,_opt){
					
					if( !opt.draggable ) return false;
					
					var r = self.fireEvent("onWindowBeforeDrag",[e,_opt]);	
					if( r === false) return r;
				},
				onStartDrag : function(left,top,e,_opt){
					var r = self.fireEvent("onWindowStartDrag",[left,top,e,_opt]);	
					if( r === false) return r;
				},
				onDrag : function(left,top,e,_opt){
					var r = self.fireEvent("onWindowDrag",[left,top,e,_opt]);	
					if( r === false) return r;
				},
				onStopDrag : function(left,top,e,_opt){
					var r = self.fireEvent("onWindowStopDrag",[left,top,e,_opt]);	
					if( r === false) return r;
				}
			});
			//header.draggable({target:opt.views['container']});
		},
		_resizeable : function(){
			var self = this;
			var opt = self.configs;
			if( !opt.resizeable || !Nex.resizable ) return;
			var container = opt.views['container'];
			
			Nex.Create('resizable',{
				target : container,
				minWidth: opt.minWidth,	
				minHeight: opt.minHeight,
				onBeforeResize : function(e,_opt){
					
					if( opt.autoSize || !opt.resizeable ) return false;
					
					var r = self.fireEvent("onWindowBeforeResize",[e,_opt]);	
					if( r === false) return r;	
				},
				onStartResize : function(e,_opt){
					var r = self.fireEvent("onWindowStartResize",[e,_opt]);	
					if( r === false) return r;	
				},
				onResize : function(w,h,e,_opt){
					var r = self.fireEvent("onWindowResize",[w,h,e,_opt]);	
					if( r === false) return r;	
					self.setWH( _opt.width,_opt.height );	
				},
				onStopResize : function(w,h,e,_opt){
					var r = self.fireEvent("onWindowStopResize",[w,h,e,_opt]);	
					if( r === false) return r;	
				}
			});
			/*container.resizable({
				minWidth: opt.minWidth,
				minHeight: opt.minHeight,
				onResize:function(w,h){
				self.setWH( w,h );		
			}});*/
		},
		/*如果width height 设置的是百分比那么将返回百分比值，只对resize和初始创建时有效*/
		getResizeWH : function(){
			var self = this;
			var opt = self.C();	
			var container = opt.views['container'];
			var width =  $(opt.renderTo)._width();
			var height =  $(opt.renderTo)._height();

			var w = opt.__width === 0 ? width : opt.__width
				,h = opt.__height === 0 ? height : opt.__height;
			if( opt.__width.toString().indexOf("%") != -1 ) {
				w = parseFloat(opt.__width)*width/100;
			}
			if( opt.__height.toString().indexOf("%") != -1 ) {
				h = parseFloat(opt.__height)*height/100;
			}
			
			return {width:w,height:h};
		},
		checkSize : function(width,height){
			var self = this;
			var opt = self.configs;	
			
			height -= isNaN(parseFloat(opt.cutHeight)) ? 0 : opt.cutHeight;
			width -= isNaN(parseFloat(opt.cutWidth)) ? 0 : opt.cutWidth;
			
			if( opt.minWidth>0 ) {
				width = Math.max(width,opt.minWidth);
			}
			if( opt.minHeight>0 ) {
				height = Math.max(height,opt.minHeight);
			}
			if( opt.maxWidth<=0 ) {
				var maxWidth = $(opt.renderTo).width();
				width = Math.min(width,maxWidth);
			}
			if( opt.maxHeight<=0 ) {
				var maxHeight = $(opt.renderTo).height();
				height = Math.min(height,maxHeight);
			}
			
			return {
					width : width,
					height : height
				};
		},
		setContainerSize : function(w,h){
			var self = this;
			var opt = self.configs;	
			var render = $(opt.renderTo);
			var container = opt.views['container'];
			
			var size = self.getResizeWH();
			
			opt.width = w || size.width;
			opt.height = h || size.height;
			
			var wh = self.checkSize( opt.width,opt.height );
			opt.width = wh.width;
			opt.height = wh.height;
			
			container._outerWidth(opt.width);
			container._outerHeight(opt.height);
			
			return self;
		},
		setContainer : function(){
			var self = this;
			var opt = self.C();
			var render = $( $.isWindow(opt.renderTo) ? document.body : opt.renderTo );
			if( render.css('position') === 'static' ) {
				render.css('position','relative');	
			}
			//防止重复创建相同ID的窗口
			$("#"+opt.id).remove();
			var container = $('<div class="nex-window '+( opt.autoScroll ? 'nex-window-auto-scroll' : '' )+' nex-window-'+opt.position+' '+opt.cls+'" id="'+opt.id+'"></div>');
			opt.views['container'] = container;
			container.css('z-index',opt.zIndex);
			render.append(container);
			self.fireEvent("onContainerCreate",[container,opt]);
			return self;
		},
		unselectHeader : function(){
			var self = this;
			var opt = self.configs;	
			opt.views['header'].bind('selectstart.window',function(e){return false;});	
			return self;
		},
		_hide : function( func ){
			var self = this,undef;
			var opt = self.configs;	
			var container = opt.views['container'];
			var modal = false;	
			if( opt.modal && ('modal' in opt.views) ) {
				modal = opt.views['modal'];
			}	
			
			container.hide();
			
			if( modal ) {
				modal.hide();
			}
			
			if( $.isFunction(func) ) {
				func.call( self );	
			}
			
		},
		_show : function(func){
			var self = this,undef;
			var opt = self.configs;		
			var container = opt.views['container'];
			var modal = false;	
			if( opt.modal && ('modal' in opt.views) ) {
				modal = opt.views['modal'];
			}
			
			opt.showAt.el = opt.showAt.el === undef ? (opt.point === null ? opt.renderTo : opt.point) : opt.showAt.el;
			
			container.show()
					 .showAt(opt.showAt);
			
			if( modal ) {
				modal.show();
			}
			
			if( $.isFunction(func) ) {
				func.call( self );	
			}
		},
		maxWindow : function(btn){
			var self = this,undef;
			var opt = self.configs;		
			var container = opt.views['container'];
			var header = opt.views['header'];
			
			var r = self.fireEvent("onBeforeMaxWindow",[container,opt]);
			if( r === false ) return r;
			
			var btn = btn === undef ? $('.nex-window-max-icon',header) : btn;
			
			var render = $( $.isWindow(opt.renderTo) ? document.body : opt.renderTo );
			render.addClass('nex-window-noscroll');
			
			btn.addClass('nex-window-max-icon-reset');
			
			opt.__mOffset = self.getPosition();
			container.css({
							left : 0,
							top : 0
						});
			opt.__mWidth = opt.__width;
			opt.__mHeight = opt.__height;
			opt.__mdraggable = opt.draggable;
			opt.__mresizeable = opt.resizeable;
			opt.__mautosize = opt.autoSize;
			opt.autoSize = opt.resizeable = opt.draggable = false;
			
			self.initWH('100%','100%');	
			
			if( opt.collapsed ) {
				container.height( header._height() );	
				if( opt._mAutoResize ) {	
					Nex.Manager._resize(opt.id,true);
				}
			}
			
			self.fireEvent("onMaxWindow",[container,opt]);
			
		},
		maxResetWindow : function(btn){
			var self = this,undef;
			var opt = self.configs;		
			var container = opt.views['container'];
			var header = opt.views['header'];
			
			var r = self.fireEvent("onBeforeMaxResetWindow",[container,opt]);
			if( r === false ) return r;
			
			var btn = btn === undef ? $('.nex-window-max-icon',header) : btn;
			
			var render = $( $.isWindow(opt.renderTo) ? document.body : opt.renderTo );
			render.removeClass('nex-window-noscroll');
			
			btn.removeClass('nex-window-max-icon-reset');
			
			opt.__width = opt.__mWidth || opt.__width;
			opt.__height = opt.__mHeight || opt.__height;
			
			opt.draggable = self._undef(opt.__mdraggable,opt.draggable);
			opt.resizeable = self._undef(opt.__mresizeable,opt.resizeable);
			opt.autoSize = self._undef(opt.__mautosize,opt.autoSize);
			
			self.initWH(opt.__mWidth,opt.__mHeight);	
			
			if( opt.__mOffset ) {
				container.css(opt.__mOffset);
			}
			
			if( opt.collapsed ) {
				container.height( header._height() );		
				if( opt._mAutoResize ) {	
					Nex.Manager._resize(opt.id,true);
				}
			}
			
			self.fireEvent("onMaxResetWindow",[container,opt]);
			
		},
		minWindow : function(e1,e2){
			var self = this,undef;
			var opt = self.configs;		
			var container = opt.views['container'];
			var header = opt.views['header'];
			
			var e1 = e1 === undef ? 'onBeforeMinWindow' : e1;
			var e2 = e2 === undef ? 'onMinWindow' : e2;
			
			var r = self.fireEvent(e1,[container,opt]);
			if( r === false ) return r;
			
			var modal = false;	
			if( opt.modal && ('modal' in opt.views) ) {
				modal = opt.views['modal'];
			}	
			container.addClass('nex-window-hidden');
			if( modal ) {
				modal.addClass('nex-window-hidden');
			}
			
			opt._mAutoResize = opt.autoResize;
			self.disabledAutoResize();
			
			self._hide(function(){
				self.fireEvent(e2,[container,opt]);					
			});
		},
		minResetWindow : function(e1,e2){
			var self = this,undef;
			var opt = self.configs;		
			var container = opt.views['container'];
			var header = opt.views['header'];
			opt._mAutoResize = opt._mAutoResize === undef ? opt.autoResize : opt._mAutoResize;
			
			var e1 = e1 === undef ? 'onBeforeMinResetWindow' : e1;
			var e2 = e2 === undef ? 'onMinResetWindow' : e2;
			
			var r = self.fireEvent(e1,[container,opt]);
			if( r === false ) return r;
			
			var modal = false;	
			if( opt.modal && ('modal' in opt.views) ) {
				modal = opt.views['modal'];
			}	
			container.removeClass('nex-window-hidden');
			if( modal ) {
				modal.removeClass('nex-window-hidden');
			}
			//恢复	
			var func = opt._mAutoResize ? 'enableAutoResize' : 'disabledAutoResize';
			self[func]();
			
			self._show(function(){
				self.resize();
				self.fireEvent(e2,[container,opt]);					
			});
			
		},
		closeWindow : function(){
			var self = this,undef;
			var opt = self.configs;		
			var container = opt.views['container'];
			var header = opt.views['header'];
			if( !opt.closeToRremove ) {
				self.minWindow('onBeforeCloseWindow','onCloseWindow');	
			} else {
				var r = self.fireEvent('onBeforeCloseWindow',[container,opt]);
				if( r === false ) return r;
				opt._closed = true;
				self._hide(function(){
					opt.views['container'] = container.detach();
					var modal = false;	
					if( opt.modal && ('modal' in opt.views) ) {
						opt.views['modal'] = opt.views['modal'].detach();
					}	
					self.fireEvent('onCloseWindow',[container,opt]);
				});
			}
		},
		openWindow : function(){
			var self = this,undef;
			var opt = self.configs;		
			var container = opt.views['container'];
			var header = opt.views['header'];
			if( !opt.closeToRremove ) {
				self.minResetWindow('onBeforeOpenWindow','onOpenWindow');	
			} else {
				opt._closed = opt._closed === undef ? false : opt._closed;
				if( opt._closed ) {
					var r = self.fireEvent('onBeforeOpenWindow',[container,opt]);
					if( r === false ) return r;
					var render = $( $.isWindow(opt.renderTo) ? document.body : opt.renderTo );
					container.appendTo( render );
					var modal = false;	
					if( opt.modal && ('modal' in opt.views) ) {
						modal = opt.views['modal'];
						modal.appendTo( render );
					}	
				}
				self._show(function(){
					self.resize();	
					self.fireEvent('onOpenWindow',[container,opt]);
				});
			}
		},
		collapseWindow : function(btn){
			var self = this,undef;
			var opt = self.configs;		
			var container = opt.views['container'];
			var header = opt.views['header'];
			
			var r = self.fireEvent("onBeforeCollapseWindow",[container,opt]);
			if( r === false ) return r;
			
			var btn = btn === undef ? $('.nex-window-collapse-icon',header) : btn;
			btn.addClass('nex-window-collapse-icon-collapsed');	
			
			opt.collapsed = true;
			opt._mAutoResize = opt.autoResize;
			self.disabledAutoResize();
			container.animate({
				height : header._height()  
			},300);	
			self.fireEvent("onCollapseWindow",[container,opt]);
		},
		expandWindow : function(btn){
			var self = this,undef;
			var opt = self.configs;		
			var container = opt.views['container'];
			var header = opt.views['header'];
			
			var r = self.fireEvent("onBeforeExpandWindow",[container,opt]);
			if( r === false ) return r;
			
			var btn = btn === undef ? $('.nex-window-collapse-icon',header) : btn;
			btn.removeClass('nex-window-collapse-icon-collapsed');	
			
			opt.collapsed = false;
			var func = opt._mAutoResize ? 'enableAutoResize' : 'disabledAutoResize';
			self[func]();
			container.animate({
				height : opt.height - ( container._outerHeight() - container._height() )
			},300);	
			self.fireEvent("onExpandWindow",[container,opt]);
		},
		bindHeaderEvent : function(){
			var self = this;
			var opt = self.configs;	
			var container = opt.views['container'];
			var header = opt.views['header'];
			
			if( opt.closeable ) {
				$('a.nex-window-close-icon',header).click(function(e){
					self.closeWindow();
				});
			}
			if( opt.maxable ) {
				$('.nex-window-max-icon',header).click(function(e){
					var btn = $(this);
					if( btn.hasClass('nex-window-max-icon-reset') ) {
						self.maxResetWindow(btn);		
					} else {
						self.maxWindow(btn);		
					}					   
				});
			}
			if( opt.minable ) {
				$('.nex-window-min-icon',header).click(function(e){													
					/*if( container.hasClass('nex-window-hidden') ) { 
						self.minResetWindow();
					} else {
						self.minWindow();
					}*/
					self.minWindow();
				});	
			}
			if( opt.collapseable ) {
				$('.nex-window-collapse-icon',header).click(function(e){
					var btn = $(this);												  
					if( $(this).hasClass('nex-window-collapse-icon-collapsed') ) {
						self.expandWindow(btn);
					} else {
						self.collapseWindow(btn);
					}					   
				});
			}
		},
		setHeader : function(){
			var self = this;
			var opt = self.C();	
			var container = opt.views['container'];
			
			if( opt.views['header'] ) return self;
			
			var header = $('<div class="nex-window-header" id="'+opt.id+'_header" style=""><span class="nex-window-title-text"></span><div class="nex-window-tools"></div></div>');
			opt.views['header'] = header;
			container.prepend(header);
			self.unselectHeader();
			self.addComponent( $('>span.nex-window-title-text',header),opt.title );
			var icons = [];
			if( opt.closeable ) {
				icons.push('close');
			}
			if( opt.maxable ) {
				icons.push('max');
			}
			if( opt.minable ) {
				icons.push('min');
			}
			if( opt.collapseable ) {
				icons.push('collapse');
			}
			icons.reverse();
			var tools = $('>div.nex-window-tools',header);
			if( opt.toolsItems.length ) {
				self.addComponent( tools,opt.toolsItems );
			}
			for( var i=0;i<opt.toolsIcons.length;i++ ) {
				var __d = {
					icon : '',
					text : ''
				};
				var iconData = 	opt.toolsIcons[i];
				iconData = $.extend( __d,iconData );
				
				if( !$._isPlainObject( iconData ) ) {
					continue;	
				}
				var _icon = $('<a class="nex-window-icon '+iconData.icon+'" hideFocus=true href="javascript:void(0)">'+iconData.text+'</a>');
				tools.append( _icon );
				(function(cdata){
					_icon.click(function(e){
						if( $.isFunction( cdata.callBack ) ) {
							cdata.callBack.call( self,_icon,e );	
						}					 
					});	
				})(iconData);
			}
			for( var i=0;i<icons.length;i++ ) {
				tools.append( $('<a class="nex-window-icon nex-window-'+icons[i]+'-icon" hideFocus=true href="javascript:void(0)"></a>') );	
			}
			
			self.bindHeaderEvent();
			
			self.fireEvent("onHeaderCreate",[header],opt);
			
			if( opt.hideHeader ) {
				self.setWH();
			}
			
			return self;
		},
		setHeaderItems : function(){
			var self = this;
			var opt = self.C();	
			var container = opt.views['container'];	
			var headerItem = $('<div class="nex-window-header-items" id="'+opt.id+'_header_items" style=""></div>');
			container.append(headerItem);
			opt.views['headerItem'] = headerItem;
			self.addComponent( headerItem,opt.headerItems );
			return self;
		},
		setBody : function(){
			var self = this;
			var opt = self.configs;	
			var container = opt.views['container'];
			var bd = $( '<div class="nex-window-body" id="'+opt.id+'_body" class="'+opt.bodyCls+'" style=""></div>' );
			opt.views['body'] = bd;
			container.append(bd);
			bd.css('padding',opt.padding);
			bd.css(opt.style);
			self.fireEvent("onBodyCreate",[bd],opt);
			return self;
		},
		setFooter : function(){
			var self = this;
			var opt = self.C();	
			var container = opt.views['container'];
			var footer = $('<div class="nex-window-footer" id="'+opt.id+'_footer" style=""></div>');
			opt.views['footer'] = footer;
			
			container.append(footer);	
			
			self.addComponent( footer,opt.footerItems );
			
			self.fireEvent("onFooterCreate",[footer],opt);
			
			return self;
		},
		createModal : function (){
			var self = this;
			var opt = self.C();	
			
			if( !opt.modal ) return self;
			
			var container = opt.views['container'];
			var modal = $('<div class="nex-window-modal '+opt.modalCls+'" id="'+opt.id+'_modal" style=""></div>');	
			opt.views['modal'] = modal;
			
			modal.css( 'zIndex',opt.zIndex-1 );

			modal.bind({
				'click' : function(e){
					self.fireEvent('onModalClick',[modal,opt]);
					return false;
				},
				'mousedown' : function(e){
					self.fireEvent('onModalMouseDown',[modal,opt]);
					return false;	
				},
				'keydown' : function(e){
					self.fireEvent('onModalKeyDown',[modal,opt]);
					return false;		
				},
				'mousewheel' : function(e){
					self.fireEvent('onModalMouseWheel',[modal,opt]);
					return false;		
				},
				'mouseover' : function(e){
					self.fireEvent('onModalMouseOver',[modal,opt]);
					return false;		
				}
			});
			
			container.after(modal);	
			self.fireEvent("onModelCreate",[modal],opt);
			return self;
		},
		showModal : function (){
			var self = this;
			var opt = self.C();	
			//如果开启modal 应该是不能出现滚动条的
			//var render = $(opt.renderTo);
			//render.addClass('nex-window-noscroll');
			
			opt.views['modal'].show();
		},
		hideModal : function (){
			var self = this;
			var opt = self.C();	
			
			//var render = $(opt.renderTo);
			//render.removeClass('nex-window-noscroll');
			
			opt.views['modal'].hide();
		},
		/*根据窗口内容自动设置大小*/
		autoSize : function(){
			var self = this;
			var opt = self.C();	
			
			var container = opt.views['container'];
			var bd = opt.views['body'];
			
			self.setDiffWH();
			
			var _w = bd.css('width');
			var _h = bd.css('height');
			var _p = bd.css('position');
			bd.css({
				width : 'auto',
				height : 'auto',
				position : 'absolute'	
			});
			var w = bd._outerWidth(),
			 	h = bd._outerHeight();	
			bd.css({
				width : _w,
				height : _h,
				position : _p	
			});
			
			var wh = self.checkSize( opt.diffW + w,opt.diffH + h );
			
			/*opt.__width = */opt.width = wh.width;
			/*opt.__height = */opt.height = wh.height;
			
			self._onSizeChange(opt.width,opt.height);
			
			self._show();
			
		},
		setDiffWH : function(){
			var self = this;
			var opt = self.C();	
			var container = opt.views['container'];
			var bd = opt.views['body'];
			container._removeStyle('width,height');
			bd._removeStyle('width,height');
			opt.diffW =  container._outerWidth() - container._width();
			opt.diffH =  container._outerHeight() - bd._outerHeight();
		},
		getPosition : function(){
			var self = this;
			var opt = self.C();	
			var container = opt.views['container'];
			if( $.isWindow(opt.renderTo) ) {
				return 	container.position();
			} else {
				var sLeft = $(opt.renderTo).scrollLeft();
				var sTop = $(opt.renderTo).scrollTop();	
				var pos = container.position();
				return {
						left　: sLeft + pos.left,
						top　: sTop + pos.top
					}
			}
		},
		//废弃
		effectOnSizeChange : function(cpos){
			var self = this;
			var opt = self.C();		
			var container = opt.views['container'];
			container.showAt({el:cpos});
		},
		_onSizeChange : function(w,h){
			var self = this;
			var opt = self.C();	
			var container = opt.views['container'];
			
			opt.width = w || opt.width;
			opt.height = h || opt.height;	
			
			var render = $(opt.renderTo);
			var pWidth = render._width();
			var pHeight = render._height();
			
			//检查自定义setWH 是否使用百分比做为单位
			if( opt.width.toString().indexOf("%") != -1 ) {
				opt.width = parseFloat(opt.width)*pWidth/100;
			}
			if( opt.height.toString().indexOf("%") != -1 ) {
				opt.height = parseFloat(opt.height)*pHeight/100;
			}
			
			self.setDiffWH();
			
			self.setContainerSize(opt.width,opt.height);
			self.resetViewSize();
			self.resetModelSize();				
			
		//	self.effectOnSizeChange(cpos);
			
			return self;
		},
		onSizeChange : function(w,h){
			var self = this,
				opt=this.configs,
				undef;
			if( opt.autoSize ){
				self.autoSize();	
			} else {
				self._onSizeChange(w,h);	
			}
		},
		resetModelSize : function(){
			var self = this,
				opt=this.configs,
				undef;
			
			if( !opt.modal ) return self;
			if( !( 'modal' in opt.views ) ) return self;

			var render = $(opt.renderTo);
			
			var modal = opt.views['modal'];
			
			modal._outerWidth( render._outerWidth() );
			modal._outerHeight( render._outerHeight() );
			
			self.fireEvent('onModelSizeChange',[ opt ]);
		},
		resetViewSize : function(){
			var self = this,
				opt=this.configs,
				undef;
			var bd = opt.views['body'];
			bd._outerWidth(opt.width-opt.diffW);
			bd._outerHeight(opt.height-opt.diffH);
			
			self.fireEvent('onViewSizeChange',[ opt ]);
		},
		initWH : function(w,h){
			var self = this,
				opt = self.C();
			opt.__width = w;
			opt.__height = h;
			self.setWH(w,h);
		},
		setWH : function(w,h){
			var self = this;
			var opt = self.C();
			self.onSizeChange(w,h);
			self.fireEvent("onSizeChange");
			
			if( Nex.Manager ) {
				setTimeout(function(){
					Nex.Manager.fireEvent("onResize",[opt.id]);		
				},0);
			}
			
		},
		resize : function(m){
			var self = this,
				opt = self.C(),
				undef;
			
			opt._rt = opt._rt || 0;
			
			if( opt._rt ) {
				clearTimeout( opt._rt );	
			}
			
			opt._rt = setTimeout(function(){
				self._setBodyOverflowHidden();		
				var size = self.getResizeWH();
				
				var w =  size.width;
				var h =  size.height;		
				if( m ) {
					self.setWH(w,h);		
				} else {
					var  wh = self.checkSize( w,h );
					if( wh.width != opt.width || wh.height != opt.height ) {
						self.setWH(w,h);
						if( opt.refreshPosOnResize ) {
							self._show();
						}
					} else {
						if( opt.refreshPosOnResize ) {
							self.resetModelSize();
							self._show();
						}	
					}
					
				}
				
			},0);
			return self;
		},
		/*
		*清空window内容
		*/
		empytContent : function(){
			var self = this;
			var opt = self.C();		
			$('#'+opt.id+'_body').empty();
			if( opt.autoSize ) {
				self.autoSize();	
			}
		},
		/*
		*向window追加内容
		*/
		addContent : function(items){
			var self = this,undef;
			var opt = self.C();
			if( items === undef ) return;
			var tbody = $('#'+opt.id+'_body');
			if( tbody.length ) {
				self.addComponent( tbody,items );	
				if( opt.autoSize ) {
					self.autoSize();	
				}
			}
		},
		_appendContent : function(){
			var self = this;
			var opt = self.C();	
			var lbody = opt.views['body'];
			//因为创建后立马写入内容，宽高都没设置，放到回调里
			var items = opt['html'];
			self.addComponent( lbody,items );
			var items = opt['items'];
			self.addComponent( lbody,items );
			return lbody;
		},
		initWindow : function(){
			var self = this,
				opt=this.configs;
				
			if( !opt.autoSize ) {	
				self.onSizeChange();
			}
			
			self._appendContent();
			
			if( opt.autoSize ) {	
				self.autoSize();
			}
			
			var container = opt.views['container'];
			container.hide();
			if( opt.autoShow ) {
				self._show();	
			}
			self.fireEvent('onCreate',[ opt ]);
			
			return self;
		},
		hide :　function(){
			var self = this;
			var opt = self.configs;	
			self.closeWindow();
		},
		//默认显示函数
		show : function(){
			var self = this,
				opt=this.configs;	
			self.openWindow();	
		}
	});
})(jQuery);