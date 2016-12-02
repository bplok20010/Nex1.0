/*
jquery.nexTab.js
http://www.extgrid.com/tree
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱

*/

;(function($){
	"use strict";
	var tab = Nex.widget('tabs');

	$.nexTab = $.extTab = tab;
	
	tab.extend({
		version : '1.0',
		getDefaults : function(opt){
			var _opt = {
				prefix : 'nextab-',
				autoResize : true,
				tabid : 1,//内部tab唯一标识id
				renderTo : document.body,
				align : 'top',
				border : true,
				borderCls : 'nex-tabs-container-border',
				isIE : !!window.ActiveXObject,
				url : '',//支持远程创建 返回数据格式  json
				cache : true,
				dataType : 'json',
				queryParams : {},
				method : 'get',
				parames : {},
				animateShow : true,//开启动画方式切入tab
				easing : 'easeOutCirc',
				animate : null,//可自定义切换函数
				animateTime : 300,
				leftWidth : 144,//当ailgn = right时 选项卡宽度
				rightWidth : 144,//...
				scrollStep : 80,
				scrollTime : 200,
				tabsData : [],
				_tabs : {},
				_tabsData : function(){
					return {
						id : null,
						title : '',
						html : '',
						cls : '',
						style : {},
						padding : 0,
						open : false,
						autoScroll : false,
						items : [],
						icon : '',
						url : '',
						closeable : false,
						enable : true
					}
				},
				views : {},
				cls : '',
				openOnEvent : 1,//0 mouseover 1 click 
				width : 0,
				height : 0,
				maxWidth : 0,
				maxHeight : 0,
				minHeight : 0,
				minWidth : 0,
				events : {
					onStart : $.noop,
					onCreate : $.noop,
					onSizeChange : $.noop,
					onViewSizeChange : $.noop,
					onTabClick : $.noop,
					onTabDblClick : $.noop,
					onTabKeyDown : $.noop,
					onTabKeyUp : $.noop,
					onTabKeyPress : $.noop,
					onTabMouseOver : $.noop,
					onTabMouseOut : $.noop,
					onTabMouseDown : $.noop,
					onTabMouseUp : $.noop,
					onTabContextMenu : $.noop,
					onTabBodyClick : $.noop,
					onTabBodyDblClick : $.noop,
					onTabBodyKeyDown : $.noop,
					onTabBodyKeyUp : $.noop,
					onTabBodyKeyPress : $.noop,
					onTabBodyMouseOver : $.noop,
					onTabBodyMouseOut : $.noop,
					onTabBodyMouseDown : $.noop,
					onTabBodyMouseUp : $.noop,
					onTabBodyContextMenu : $.noop,
					onDestroy : $.noop
				}
			};
			
			var _opt = this.extSet(_opt);
			
			return $.extend({},_opt,opt);
		},
		_Tpl : {
			'tab_container' : '<div class="nex-tabs-container <%=cls%> <%=border?borderCls : ""%>" id="<%=id%>"></div>',
			'tab_header' : '<div class="nex-tabs-header" id="<%=id%>_header">'
								+'<div class=" nex-tabs-wrap nex-tabs-float-left">'
									+'<ul class="nex-tabs-ul" id="<%=id%>_tab_ul">'
									+'</ul>'
								+'</div>'
						  +'</div>',
			'tab_content' : '<div class="nex-tabs-bodys" id="<%=id%>_bodys"></div>',
			'tab_header_item' : '<li id="<%=tabid%>_tab_<%=id%>" tabid="<%=id%>">'
									+'<div class="nex-tabs-inner" id="<%=tabid%>_tab_<%=id%>_inner">'
										+'<span id="<%=tabid%>_tab_<%=id%>_icon" class="<%=(icon===""?"":"nex-tabs-icon "+icon)%>"></span><span  id="<%=tabid%>_tab_<%=id%>_text" class="nex-tabs-text"><%=title%></span>'
									+'</div>'
									+'<%if(closeable){%><a href="javascript:void(0)" class="nex-tabs-close"></a><%}%>'
								+'</li>',
			'tab_content_body' : '<div id="<%=tabid%>_tab_body_<%=id%>"  tabid="<%=id%>" style="left:10000px;" class="nex-tabs-body <%=( autoScroll ? "nex-tabs-auto-scroll" : "" )%>"></div>'					
		}
	});
	$.nexTab.fn.extend({
		_init : function(opt) {
			var self = this;
			
			//保存初始设置值
			opt.__width = opt.width;
			opt.__height = opt.height;
			
			self.getTabsData()
				.setContainer() //setContainer必须
				.setHeader()
				.setBody()
				.show();		
		},
		_sysEvents : function(){
			var self = this;
			var opt = self.configs;
			self.bind("onTabClick",self.clickToOpen,self);
			self.bind("onTabMouseOver",self.overToOpen,self);
			return self;
		},
		clickToOpen : function(li,tid,d,e){
			var self = this;
			var opt = self.configs;
			if( opt.openOnEvent === 1 ) {
				self.openTab(tid);	
			}
		},
		overToOpen : function(li,tid,d,e){
			var self = this;
			var opt = self.configs;
			if( opt.openOnEvent === 0 ) {
				self.openTab(tid);	
			}	
		},
		_getTabData : function(d){
			var self = this;
			var opt = self.configs;	
			var d = $.extend({},opt._tabsData.call( self ),d);
			if( d.id === null || d.id==="" || typeof d.id !== 'string' ) {
				d.id = 'tab_'+self.unique();	
			}
			return d;
		},
		getTabsData : function(){
			var self = this;
			var opt = self.configs;	
			var tab = {};
			for( var i=0;i<opt.tabsData.length;i++ ) {
				tab = self._getTabData(opt.tabsData[i]);
				opt.tabsData[i] = tab;
				opt._tabs[tab.id] = tab;
			}
			return self;
		},
		_setTabOpen : function(tid){
			var self = this;
			var opt = self.configs;	
			if( !(tid in opt._tabs) ) return self;
			for( var id in opt._tabs ) {
				if( id == tid  ) {
					opt._tabs[id]['open'] = true;	
				} else {
					opt._tabs[id]['open'] = false;		
				}	
			}
			return self;
		},
		/*如果width height 设置的是百分比那么将返回百分比值，只对resize和初始创建时有效*/
		getResizeWH : function(){
			var self = this;
			var opt = self.C();	
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
			if( opt.maxWidth>0 ) {
				width = Math.min(width,opt.maxWidth);
			}
			if( opt.maxHeight>0 ) {
				height = Math.min(height,opt.maxHeight);
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
			opt.width = parseInt(wh.width);
			opt.height = parseInt(wh.height);
			
			container._outerWidth(opt.width);
			container._outerHeight(opt.height);
			return self;
		},
		setContainer : function(){
			var self = this;
			var opt = self.configs;
			var render = $(opt.renderTo);
			var container = $(self.tpl( 'tab_container',opt ));
			opt.views['container'] = container;
			$("#"+opt.id).remove();
			render.append(container);
			self.setContainerSize();
			self.fireEvent("onContainerCreate",[container],opt);
			return self;
		},
		unselectHeader : function(){
			var self = this;
			var opt = self.configs;	
			opt.views['header'].bind('selectstart.tabs',function(){return false;});	
			return self;
		},
		setHeader : function(){
			var self = this;
			var opt = self.configs;	
			var container = opt.views['container'];
			var header = $(self.tpl( 'tab_header',opt ));
			opt.views['header'] = header;
			container.append(header);
			self.unselectHeader();
			self.fireEvent("onHeaderCreate",[header],opt);
			return self;
		},
		setBody : function(){
			var self = this;
			var opt = self.configs;	
			var container = opt.views['container'];
			var bodys = $(self.tpl( 'tab_content',opt ));
			opt.views['body'] = bodys;
			container.append(bodys);
			self.fireEvent("onBodyCreate",[bodys],opt);
			return self;
		},
		onSizeChange : function(w,h){
			var self = this;
			var opt = self.C();	
			
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
			
			self.setContainerSize(opt.width,opt.height);
			
			self.resetViewSize();
			
			self.checkScrollAble();
			
			return self;
		},
		width : function( width ){
			var self = this;
			var opt = self.configs;	
			if( typeof width != 'undefined' ) {
				self.setWH(width,opt.height);	
			}
			return $("#"+opt.id)._width();
		},
		height : function( height ){
			var self = this;
			var opt = self.configs;	
			if( typeof height != 'undefined' ) {
				self.setWH(opt.width,height);	
			}
			return $("#"+opt.id)._height();
		},
		initWH : function(w,h){
			var self = this,
				opt = self.C();
			opt.__width = w;
			opt.__height = h;
			self.setWH(w,h);
		},
		setWH : function(w,h){
			var self = this,opt = this.C();
			self.onSizeChange(w,h);
			
			if( Nex.Manager ) {
				setTimeout(function(){
					Nex.Manager.fireEvent("onResize",[opt.id]);		
				},0);
			}
			
			self.fireEvent("onSizeChange");
		},
		resize : function(m){
			var self = this,
				opt = self.C(),
				undef;
			
			opt._rt = opt._rt || 0;
			
			if( opt._rt ) {
				clearTimeout( opt._rt );	
			}
			
			//var render = $(opt.renderTo);
			//var _body = $(document.body);
			//_body.addClass('nex-overflow-hidden');
			//render.addClass('nex-overflow-hidden');
			
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
					}
				}
				//_body.removeClass('nex-overflow-hidden');
				//render.removeClass('nex-overflow-hidden');
			},0);
			return self;
		},
		
		x_viewsize : function(){
			var self = this,
				opt=this.configs,
				undef;	
			var container = opt.views['container'];
			var header = opt.views['header'];
			var bodys = opt.views['body'];
			var width = container.width();
			var height = container.height();
			//自定义div宽度大小
			var oh = 0;
			$(">div:not(div.nex-tabs-bodys,div.nex-tabs-header)",container).each(function(){
				oh += $(this)._outerHeight();												  
			});
			height -= oh; 
			/*header*/
			var h = 0;
			$(">div:not(div.nex-tabs-wrap)",header).each(function(){
				h += $(this)._outerHeight();													  
			});
			
			header._outerWidth( opt[opt.align+'Width'] );
			header._outerHeight( height - h );
			var ul = $("#"+opt.id+"_tab_ul");
			ul._outerWidth( header.width() );
			/*body*/
			bodys._outerHeight( height );
			var ww = header._outerWidth();
			bodys._outerWidth( width - ww );
	
			$(">div.nex-tabs-body",bodys).each(function(){
				$(this)._outerWidth( bodys._width() );	
				$(this)._outerHeight( bodys._height() );	
			});
			return self;
		},
		//top bottom
		y_viewsize : function(){
			var self = this,
				opt=this.configs,
				undef;	
			var container = opt.views['container'];
			var header = opt.views['header'];
			var bodys = opt.views['body'];
			var width = container._width();
			var height = container._height();
			/*header*/
			var w = 0;
			$(">div:not(.nex-tabs-wrap)",header).each(function(){
				w += $(this)._outerWidth();													  
			});
			header._outerWidth( width );
			$('>div.nex-tabs-wrap',header)._outerWidth( header._width() - w );
			
			$("#"+opt.id+"_tab_ul").width(10000);
			header.height( $(">div.nex-tabs-wrap",header)._outerHeight() );
			/*body*/
			bodys._outerWidth( width );
			var hh = 0;//header-height
			$(">div:not(.nex-tabs-bodys)",container).each(function(){
				hh += $(this)._outerHeight();												  
			});
			hh = height - hh;
			bodys._outerHeight( hh );
			$(">div.nex-tabs-body",bodys).each(function(){
				$(this)._outerWidth( bodys._width() );	
				$(this)._outerHeight( bodys._height() );	
			});
			return self;
		},
		resetViewSize : function(align){
			var self = this,
				opt=this.configs,
				undef;
			var align = align === undef ? opt.align : align;
			switch( align ) {
				case 'top':
				case 'bottom':
					self.y_viewsize();
					break;
				case 'left':
				case 'right':
					self.x_viewsize();
					break;
			}
			self.fireEvent('onViewSizeChange',[ opt ]);
		},
		_clearAlignCls : function(){
			var self = this,
				opt=this.configs;
			var cls = 'nex-tabs-header-left nex-tabs-header-right nex-tabs-header-bottom nex-tabs-bodys-top nex-tabs-bodys-left nex-tabs-bodys-right';
			var header = opt.views['header'];
			var bodys = opt.views['body'];
			header.removeClass(cls);
			bodys.removeClass(cls);
		},
		setAlign : function(align){
			var self = this,
				opt=this.configs;	
			opt.align = align.toLowerCase();
			
			var acShow = opt.align+'Show';
			if( acShow in self ) {
				self[acShow].call(self,opt.align);
			}	
			self.resetViewSize();
		},
		topShow : function(){
			var self = this,
				opt=this.configs;
			self._clearAlignCls();	
			var header = opt.views['header'];
			var bodys = opt.views['body'];
			bodys.before(header);
			return self;
		},
		bottomShow : function(){
			var self = this,
				opt=this.configs;	
			self._clearAlignCls();
			var header = opt.views['header'];
			var bodys = opt.views['body'];
			bodys.after(header);
			header.addClass('nex-tabs-header-bottom');
			bodys.addClass('nex-tabs-bodys-top');
			return self;
		},
		rightShow : function(){
			var self = this,
				opt=this.configs;	
			self._clearAlignCls();
			var header = opt.views['header'];
			var bodys = opt.views['body'];
			bodys.before(header);
			header.addClass('nex-tabs-header-right');
			bodys.addClass('nex-tabs-bodys-left');
			return self;	
		},
		leftShow : function(){
			var self = this,
				opt=this.configs;	
			self._clearAlignCls();
			var header = opt.views['header'];
			var bodys = opt.views['body'];
			bodys.before(header);
			header.addClass('nex-tabs-header-left');
			bodys.addClass('nex-tabs-bodys-right');
			return self;	
		},
		bindTabEvent : function(hd,bd,d){
			var self = this,
				opt=this.configs;
				var tid = d.id;
			$("a.nex-tabs-close",hd).click(function(){
				self.removeTab(tid);										
			});
			var callBack = function(type,e){
				var _type = type.replace('Tab','');
				var r;
				if( !d.enable ) return;
				if( (_type in d) && $.isFunction(d[_type]) ) {
					r = d[_type].apply(self,[this,tid,d,e]);
				}
				if( r!==false ) {
					r = self.fireEvent(type,[ this,tid,d,e ]);
				}
				if( r === false ) {
					e.stopPropagation();
					e.preventDefault();
				}
			};
			var events = {
				'click' : function(e) {
					callBack.call(this,'onTabClick',e);
				},
				'dblclick' : function(e) {
					callBack.call(this,'onTabDblClick',e);
				},
				'keydown' : function(e) {
					callBack.call(this,'onTabKeyDown',e);
				},
				'keyup' : function(e) {
					callBack.call(this,'onTabKeyUp',e);
				},
				'keypress' : function(e){
					callBack.call(this,'onTabKeyPress',e);
				},
				'mouseover' : function(e){
					callBack.call(this,'onTabMouseOver',e);
				},
				'mouseout' : function(e){
					callBack.call(this,'onTabMouseOut',e);
				},
				'mousedown' : function(e) {
					callBack.call(this,'onTabMouseDown',e);
				},
				'mouseup' : function(e) {
					callBack.call(this,'onTabMouseUp',e);
				},
				'contextmenu' : function(e){	
					callBack.call(this,'onTabContextMenu',e);
				}
			};
			var callBack2 = function(type,e){
				var _type = type.replace('Tab','');
				var r;
				if( !d.enable ) return;
				if( (_type in d) && $.isFunction(d[_type]) ) {
					r = d[_type].apply(self,[this,tid,d,e]);
				}
				if( r!==false ) {
					r = self.fireEvent(type,[ this,tid,d,e ]);
				}
				if( r === false ) {
					e.stopPropagation();
					e.preventDefault();
				}
			};
			var events2 = {
				'click' : function(e) {
					callBack2.call(this,'onTabBodyClick',e);
				},
				'dblclick' : function(e) {
					callBack2.call(this,'onTabBodyDblClick',e);
				},
				'keydown' : function(e) {
					callBack2.call(this,'onTabBodyKeyDown',e);
				},
				'keyup' : function(e) {
					callBack2.call(this,'onTabBodyKeyUp',e);
				},
				'keypress' : function(e){
					callBack2.call(this,'onTabBodyKeyPress',e);
				},
				'mouseover' : function(e){
					callBack2.call(this,'onTabBodyMouseOver',e);
				},
				'mouseout' : function(e){
					callBack2.call(this,'onTabBodyMouseOut',e);
				},
				'mousedown' : function(e) {
					callBack2.call(this,'onTabBodyMouseDown',e);
				},
				'mouseup' : function(e) {
					callBack2.call(this,'onTabBodyMouseUp',e);
				},
				'contextmenu' : function(e){	
					callBack2.call(this,'onTabBodyContextMenu',e);
				}
			};
			hd.bind(events);
			bd.bind(events2);
			return self;
		},
		/*
		*检测tab选项卡是否需要添加滚动按钮 只支持top bottom
		*/
		checkScrollAble : function(){
			var self = this;
			var opt = self.C();	
			if( opt.align !== 'top' && opt.align !== 'bottom' ) return;
			var ul = $('#'+opt.id+'_tab_ul');
			var w = 0;
			$('>li',ul).each(function(){
				w += $(this)._outerWidth(true);						  
			});
			var header = opt.views['header'];
			var wrap = $('>div.nex-tabs-wrap',header);
			if( w<=wrap._width() ) {
				$('>div.nex-tabs-scroller-left',header).remove();
				$('>div.nex-tabs-scroller-right',header).remove();
			} else {
				if( !$('>div.nex-tabs-scroller-left',header).size() ) {
					var l = $('<div class="nex-tabs-scroller-left"></div>');
					l.bind({
						click :　function(e){
							var r = self.fireEvent('onScrollLeft',[ this,e ]);	
							if( r === false ) return;
							self.scrollLeft();
						}	   
					});
					wrap.before(l);	
				}
				if( !$('>div.nex-tabs-scroller-right',header).size() ) {
					var r = $('<div class="nex-tabs-scroller-right"></div>');
					r.bind({
						click :　function(e){
							var r = self.fireEvent('onScrollRight',[ this,e ]);	
							if( r === false ) return;
							self.scrollRight();
						}	   
					});
					wrap.after(r);	
				}
			}
			//二次调用 牺牲点性能
			self.resetViewSize();
		},
		/*
		*滚动到指定tab 只适合 top bottom
		*/
		scrollToTab : function(tid){
			var self = this;
			var opt = self.configs;
			
			if( opt.align !== 'top' && opt.align !== 'bottom' ) return;
			
			var body = $('#'+opt.id+'_tab_ul');
			var header = body.parent();
			
			if( !header.length ) {
				return self;	
			}
			
			var r = self.fireEvent("onBeforeScrollToTab",[tid,opt]);
			if( r === false ) {
				return r;	
			}
			
			var offset = header.offset();
			var w = header.outerWidth();
			
			var f = $('#'+opt.id+'_tab_'+tid);
			
			if( !f.length ) return self;
			
			var fo = f.offset();
			var fw = f.outerWidth(true);
			
			var outerWidth = 0;
			if( offset.left > fo.left ) {
				outerWidth = offset.left - fo.left;
			} else if( (offset.left+w) < (fo.left+fw) ) {
				outerWidth = (offset.left+w) - (fo.left+fw);
			}
			var sLeft = 0;
			
			var _sLeft = body.css('marginLeft');
			_sLeft = isNaN( parseFloat( _sLeft ) ) ? 0 : parseFloat( _sLeft );
			
			sLeft = _sLeft + outerWidth;
			
			self._scrollTab( sLeft,function(){
				self.fireEvent("onAfterScrollToTab",[tid,opt]);									
			} );
				
			return self;
		},
		_scrollTab : function(sLeft,func){
			var self = this;
			var opt = self.C();	
			var ul = $('#'+opt.id+'_tab_ul');
			ul.stop(true)
			  .animate({
					marginLeft : sLeft	   
				},opt.scrollTime,function(){
					if( $.isFunction( func ) )
						func.call(self);	
				});
		},
		scrollLeft : function(func){
			var self = this;
			var opt = self.C();
			var ul = $('#'+opt.id+'_tab_ul');
			var left = ul.css('marginLeft');
			left = isNaN( parseFloat( left ) ) ? 0 : parseFloat( left );
			left += opt.scrollStep;
			left = left >= 0 ? 0 : left;
			self._scrollTab( left,func );
		},
		scrollRight : function(func){
			var self = this;
			var opt = self.C();
			var ul = $('#'+opt.id+'_tab_ul');
			var wrap = ul.parent();
			var width = 0;
			ul.children().each(function(){
				width += $(this).outerWidth(true);	
			});
			var left = ul.css('marginLeft');
			left = isNaN( parseFloat( left ) ) ? 0 : parseFloat( left );
			
			left -= opt.scrollStep;
			var w = wrap.width();
			if( ( Math.abs( left ) + w ) >= width ) {
				left = 	(width - w)*-1;
			}
			self._scrollTab( left,func );
		},
		/*
		*清空tab内容
		*/
		empytContent : function(tid){
			var self = this;
			var opt = self.C();		
			$('#'+opt.id+'_tab_body_'+tid).empty();
		},
		/*
		*向tab追加内容
		*/
		addContent : function(tid,items){
			var self = this,undef;
			var opt = self.C();
			if( items === undef ) return;
			var tbody = $('#'+opt.id+'_tab_body_'+tid);
			if( tbody.length ) {
				self.addComponent( tbody,items );	
			}
		},
		/*调用_addTab 后 应该再掉用_appendTabContent 添加内容*/
		_appendTabContent : function(d){
			var self = this;
			var opt = self.C();	
			var lbody = $('#'+opt.id+'_tab_body_'+d.id);
			//因为创建后立马写入内容，宽高都没设置，放到回调里
			var items = d['html'];
			self.addComponent( lbody,items );
			var items = d['items'];
			self.addComponent( lbody,items );
			return lbody;
		},
		_addTab : function(d){
			var self = this,
				opt=this.configs;
			d.tabid = opt.id;
			d.self = self;
			var hd = $( self.tpl('tab_header_item',d) );
			var bd = $( self.tpl('tab_content_body',d) );
			var ul = $("#"+opt.id+"_tab_ul");
			var bodys = $("#"+opt.id+"_bodys");
			ul.append(hd);
			bodys.append(bd);
			
			if( d.padding ) {
				bd.css( 'padding',d.padding );	
			}
			bd.addClass( d.cls );
			bd.css( d.style );
			
			self.bindTabEvent(hd,bd,d);
			
			self.checkScrollAble();
			
			return bd;
		},
		/*
		* @m true=添加后切换当前tab 默认 ; =false 添加后不切换当前tab
		*/
		addTab : function(d,m){
			var self = this,undef,
				opt=this.configs;
			var d = d || {};
			var m = m === undef ? true : m;
			d = self._getTabData(d);
			
			var r = self.fireEvent('onBeforeAddTab',[ d,opt ]);
			if( r === false ) return false;
			
			if( d.id in opt._tabs ) {
				return false;	
			}
			
			var bd = self._addTab(d);
			
			opt._tabs[d.id] = d;
			opt.tabsData.push(d);
			
			self.resetViewSize();
			
			if( m ) {
				self.openTab( d.id );	
			}
			
			//_appendTabContent 必须要在resetViewSize执行后调用，
			self._appendTabContent(d);
			self.fireEvent('onAddTab',[ bd,d,opt ]);
			return d.id;
		},
		getCurrentTab : function(m){
			var self = this,
				opt=this.configs;
			var ul = $("#"+opt.id+"_tab_ul");
			var li = $(">li.nex-tabs-selected",ul).first();
			if( !li.length ) return null;
			var tid = li.attr('tabid');
			return m ? opt._tabs[tid] : tid;
		},
		/*
		*动画方式切换tab  @otab 需要消失的tab @ntab需要显示的tab
		*/
		animateShowTab : function(otab,ntab,bodys){
			var self = this,
				opt=this.configs;	
			//otab.css('left',10000);
			$(">div.nex-tabs-body",bodys).css('left',10000);
			ntab.css({
				left : otab._outerWidth()*-1,
				opacity : 0
			});
			ntab.stop(true)
				.animate({
					left : 0,
					opacity : 1
				},
				opt.animateTime,
				opt.easing);
		},
		openTab : function(tid){
			var self = this,
				opt=this.configs;
			
			if( !(tid in opt._tabs) ) return false;
			
			var curr = self.getCurrentTab();
			if( curr == tid ) {
				return true;	
			}
			
			var r = self.fireEvent('onBeforeCloseTab',[ curr,opt._tabs[curr],opt ]);
			if( r === false ) return false;
			var r = self.fireEvent('onBeforeOpenTab',[ tid,opt._tabs[tid],opt ]);
			if( r === false ) return false;
			
			var ul = $("#"+opt.id+"_tab_ul");
			var bodys = $("#"+opt.id+"_bodys");
			
			$(">li.nex-tabs-selected",ul).removeClass('nex-tabs-selected');
			$("#"+opt.id+"_tab_"+tid).addClass('nex-tabs-selected');
			
			var otab = $("#"+opt.id+"_tab_body_"+curr);
			var ntab = $("#"+opt.id+"_tab_body_"+tid);
			
			if( opt.animateShow ) {//CallBack
				var callBack = $.isFunction( opt.animate ) ? opt.animate : self.animateShowTab;
				callBack.call( self,otab,ntab ,bodys);
			} else {
				//$(">div.nex-tabs-body",bodys).hide();
				$(">div.nex-tabs-body",bodys).css('left',10000);
				ntab.css('left',0);
			}
			self._setTabOpen(tid);
			
			self.fireEvent('onCloseTab',[ curr,opt._tabs[curr],opt ]);
			self.fireEvent('onOpenTab',[ tid,opt._tabs[tid],opt ]);
			//自动滚动到指定tabid
			self.scrollToTab( tid );
			
			return true;
		},
		removeTab : function(tid){
			var self = this,
				opt=this.configs;
			if( !(tid in opt._tabs) ) return false;
			
			var r = self.fireEvent('onBeforeRemoveTab',[ tid,opt._tabs[tid],opt ]);
			if( r === false ) return false;
			
			var curr = self.getCurrentTab();
			var tabs = opt.tabsData;
			for( var i=0;i<tabs.length;i++ ) {
				if( tabs[i]['id'] == tid ) break;	
			}
			if( curr == tid ) {
				var t = i+1 > tabs.length-1 ? i-1 : i+1;
				if( tabs[t] ) {
					self.openTab(tabs[t]['id']);	
				}
			} 
			
			$("#"+opt.id+"_tab_"+tid).remove();
			$("#"+opt.id+"_tab_body_"+tid).remove();	
			delete opt._tabs[tid];
			tabs.splice(i,1);
			
			self.fireEvent('onRemoveTab',[ tid,opt._tabs[tid],opt ]);
			
			self.methodInvoke('resetViewSize');
			//self.resetViewSize();
			
			self.methodInvoke('checkScrollAble');
			//self.checkScrollAble();
			
			return true;
		},
		removeAllTabs : function(){
			var self = this,
				opt=this.configs;	
			self.lockMethod('resetViewSize');	
			self.lockMethod('checkScrollAble');	
			for( var tid in opt._tabs ) {
				self.removeTab(tid);
			}
			
			self.methodInvoke('resetViewSize');
			self.methodInvoke('checkScrollAble');
		},
		closeTab : function(tid){
			return this.removeTab(tid);	
		},
		closeAllTabs : function(){
			this.removeAllTabs();	
		},
		_initTabs : function(){
			var self = this,
				opt=this.configs;
			var tabs = opt.tabsData;
			for( var i=0;i<tabs.length;i++ ) {
				self._addTab(tabs[i]);	
			}
			//fix 初始化宽度问题
			setTimeout(function(){	
				self.resetViewSize();
				for( var i=0;i<tabs.length;i++ ) {
					var bd = self._appendTabContent(tabs[i]);	
					self.fireEvent('onAddTab',[ bd,tabs[i],opt ]);
				}
				self.fireEvent('onCreate',[ opt ]);
			},0);
			return self;
		},
		/*初始化时 调用默认tab或第一个tab*/
		openFirstTab : function(){
			var self = this,
				opt=this.configs;
			var tabs = opt.tabsData;
			if( !tabs.length ) return false;
			var tab = tabs[0];
			for( var tid in opt._tabs ) {
				if( opt._tabs[tid]['open'] ) {
					tab = opt._tabs[tid];
				}	
			}
			self.openTab(tab['id']);
			return self;
		},
		show : function(){
			var self = this,
				opt=this.configs;	
			opt.align = opt.align.toLowerCase();
			
			self._initTabs();
			
			var acShow = opt.align+'Show';
			if( acShow in self ) {
				self[acShow].call(self,opt.align);
			}
			
			self.openFirstTab();
		}
	});
	$.fn.nexTab = function(conf){
		
	};
	$.fn.extTab = $.fn.nexTab;
})(jQuery);