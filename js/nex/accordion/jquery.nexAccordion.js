/*
jquery.nexAccordion.js
http://www.extgrid.com/accordion
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱

*/

;(function($){
	"use strict";
	var accordion = Nex.extend('accordion','html');
	var baseConf = Nex.html.getDefaults( Nex.html.getOptions() );
	$.nexAccordion = $.extAccordion = accordion;
	accordion.extend({
		version : '1.0',
		_Tpl : {
			accordion_item : '<div class="nex-accordion-item <%=cls%> <%=autoScroll? "nex-accordion-item-auto-scroll":""%> nex-accordion-expand" itemindex="<%=index%>" id="<%=id%>_accordion_item_<%=index%>">'
								+'<div class="nex-accordion-header" itemindex="<%=index%>" id="<%=id%>_accordion_<%=index%>_header" style="">'
								+'<span class="nex-accordion-title-text">'
									+'<% if( icon !== "" || iconCls !== "" ) {%>'
									+'<span class="title-icon <%=iconCls%>" style=" <%=icon === "" ? "" : "background:url("+icon+")"%> "></span>'
									+'<% } %>'
									+'<%=title%></span><div class="nex-accordion-tools"></div>'
								+'</div>'
								+'<div class="nex-accordion-body <%=bodyCls%>" itemindex="<%=index%>" id="<%=id%>_accordion_<%=index%>_body"></div>'
							+'</div>'		
		}
	});
	accordion.setOptions(function(){
		return {
			prefix : 'nexaccordion-',
			autoRecovery : false,
			autoResize : true,
			containerCls : [baseConf.containerCls,'nex-accordion'].join(' '),
			autoScrollCls : [baseConf.autoScrollCls,'nex-accordion-auto-scroll'].join(' '),
			autoScroll : false,
			itemHeaderSelectionable : false,
			showCollapseIcon : true,
			border : true,
			borderCls : 'nex-accordion-border',
			collapseIcon : 'accordion-collapse',
			collapseCallBack : null,
			animateShow : true,//开启动画方式切入accordion
			easing : 'easeOutCirc',
			animate : null,//可自定义切换函数
			animateTime : 300,
			expandOnEvent : 1,//0 mouseover 1 click 2 dblclick
			items : [],
			_item : function(){
				return {
					title : '',
					padding : 0,//body padding
					autoScroll : true,
					expand : false,//默认是否展开
					icon : '',
					iconCls : '',
					items : [],
					html : [],
					toolsItems : [],//更自由的自定义组件显示
					toolsIcons : [],//自定义图标显示 {icon:'abc',text:'',callBack:func}
					cls : '',
					bodyCls : ''	
				}
			},
			renderTo : document.body,
			width : 'auto',
			height : '100%',
			singleSelect : true,
			autoItemHeight : false,//选项卡item不设置高度
			/*maxWidth : function(){
				var renderTo = this.C('renderTo');	
				return $(renderTo).width();
			},
			maxHeight : function(){
				var renderTo = this.C('renderTo');	
				return $(renderTo).height();
			},*/
			events : {
				onStart : $.noop,
				onCreate : $.noop,
				onDestroy : $.noop
			}
		};	
	});
	accordion.fn.extend({
		_init : function(opt) {
			var self = this;
			self.setContainer()
				.setAccordionItems()
			    .initAccordion();
		},
		setContainer : function(){
			var self = this;
			var opt = self.C();
			Nex.html.fn.setContainer.apply( self,arguments );
			var container = opt.views['container'];
			if( opt.border && opt.borderCls !== '' ) {
				container.addClass( opt.borderCls );	
			}
			return self;
		},
		_sysEvents : function(){
			var self = this;
			var opt = self.configs;
			
			Nex.html.fn._sysEvents.apply(self,arguments);
			
			if( opt.expandOnEvent == 1 ) {
				self.bind('onItemClick',self._toggleItem);
			} else if( opt.expandOnEvent == 0 ) {
				self.bind('onItemMouseEnter',self._toggleItem);	
			} else {
				self.bind('onItemDblClick',self._toggleItem);	
			}
			self.bind('onSizeChange',self._refreshExpandItem);
			self.bind('onCreate',self._setExpandItem);
			return self;
		},
		setAccordionItems : function(){
			var self = this,
				undef,
				opt = self.configs,
				container = opt.views['container'],
				_item = opt._item;
			
			var items = $.isArray( opt.items ) ? opt.items : [ opt.items ];
		
			$.each( items , function(index,item){
				var item = $.extend( {},_item.call(self),item );
				item.index = index;
				item.id = opt.id;
				var tpl = $(self.tpl( 'accordion_item',item ));	
				container.append( tpl );
				var bd = $('>.nex-accordion-body',tpl);
				bd.css( "padding",item.padding );
				
				var tools = $('>.nex-accordion-header .nex-accordion-tools',tpl);
				/*add toolIcons*/
				if( item.toolsItems.length ) {
					self.addComponent( tools,opt.toolsItems );
				}
				if( opt.showCollapseIcon ) {
					item.toolsIcons.push({
						icon : opt.collapseIcon,
						callBack : opt.collapseCallBack
					});	
				}
				var len = item.toolsIcons.length;
				
				for( var i=0;i<len;i++ ) {
					var __d = {
						icon : '',
						text : '',
						callBack : null
					};
					var iconData = 	item.toolsIcons[i];
					iconData = $.extend( __d,iconData );
					
					if( !$._isPlainObject( iconData ) ) {
						continue;	
					}
					var _icon = $('<a class="nex-accordion-icon '+iconData.icon+'" hideFocus=true href="javascript:void(0)">'+iconData.text+'</a>');
					tools.append( _icon );
					(function(cdata){
						_icon.click(function(e){
							if( $.isFunction( cdata.callBack ) ) {
								var r = cdata.callBack.call( self,_icon,index,item,e );	
								if( r === false ) return r;
							}					 
						});	
					})(iconData);
				}
				
				self.fireEvent('onAccordionItemCreate',[tpl,opt]);
			} );
			
			var _items = $('>.nex-accordion-item',container);
			
			_items.each(function(){
				var item = $(this);
				var h = $('>.nex-accordion-header',item)._outerHeight();
				item.height( h );
			});
			
			self.bindAccordionItemsEvent( _items );
			
			if( !opt.itemHeaderSelectionable ) {
				$('>.nex-accordion-header',_items).disableSelection();	
			}
			
			self.fireEvent('onAccordionCreate',[_items,opt]);
			return self;	
		},
		bindAccordionItemsEvent : function(items){
			var self = this,
				undef,
				opt = self.configs,
				list = opt.items;
			var callBack = function(type,e){
				var index = $(this).attr('itemindex');
				var r = self.fireEvent(type,[ this,index,list[index],e,opt ]);
				if( r === false ) {
					e.stopPropagation();
					e.preventDefault();
				}
			};
			var hds = $('>.nex-accordion-header',items);	
			hds.bind({
				'click' : function(e) {
					callBack.call(this,'onItemClick',e);
				},
				'dblclick' : function(e) {
					callBack.call(this,'onItemDblClick',e);
				},
				'mouseenter' : function(e){
					callBack.call(this,'onItemMouseEnter',e);
				},
				'mouseleave' : function(e){
					callBack.call(this,'onItemMouseLeave',e);
				},
				'mouseover' : function(e){
					callBack.call(this,'onItemMouseOver',e);
				},
				'mouseout' : function(e){
					callBack.call(this,'onItemMouseOut',e);
				},
				'mousedown' : function(e) {
					callBack.call(this,'onItemMouseDown',e);
				},
				'mouseup' : function(e) {
					callBack.call(this,'onItemMouseUp',e);
				},
				'contextmenu' : function(e){	
					callBack.call(this,'onItemContextMenu',e);
				}
			});		
		},
		onViewSizeChange : function(func){
			var self = this,
				undef,
				opt = self.configs;
			self.setAccordionItemsSize();	
			Nex.html.fn.onViewSizeChange.apply(self,arguments);
		},
		setAccordionItemsSize : function(){
			var self = this,
				undef,
				opt = self.configs,
				container = opt.views['container'];	
			var width,height;
			
			var items = $('.nex-accordion-item',container);
			if( !items.size() )	return self;

			if( opt.realWidth !== 'auto' ) {
				width = container.width();
				items.each(function(){
					var item = $(this);
					item._outerWidth( width );	
					var w = item.width();
					$('>.nex-accordion-body',item)._outerWidth( w );
				});
			}
			if( !opt.autoItemHeight ) {
				height = container.height();
				var h = 0;
				items.each(function(){
					var item = $(this);
					var diffH = item.outerHeight() - item.height();
					h += $('>.nex-accordion-header',item)._outerHeight() + diffH;
				});
				items.each(function(){
					var item = $(this);
					$('>.nex-accordion-body',item)._outerHeight( height - h );
				});
			}
			return self;
		},
		_setExpandItem : function(){
			var self = this,
				undef,
				opt = self.configs,
				container = opt.views['container'],
				items = opt.items;
			var ids = [];	
			$.each(items,function(index,item){
				if( !$.isPlainObject(item) ) return;
				if( item.expand ) {
					ids.push( index );	
				}
			});	
			var _animate = opt.animateShow;
			opt.animateShow = false;
			if( opt.singleSelect ) {
				self.expandItem( ids.pop() );	
			} else {
				$.each( ids,function(i,index){
					self.expandItem( index );		
				} );	
			}
			opt.animateShow = _animate;
		},
		_refreshExpandItem : function(){
			var self = this,
				undef,
				opt = self.configs,
				container = opt.views['container'];	
			var collapses = $('>.nex-accordion-collapse',container);
			collapses.each( function(){
				var index = $(this).attr( 'itemindex' );
				self.expandItem( index,true );	
			} );			
		},
		_toggleItem : function( item,e,opt ){
			var self = this,
				undef,
				opt = self.configs,
				container = opt.views['container'];	
			
			var index = $(item).attr('itemindex');
			
			var item = $('#'+opt.id+'_accordion_item_'+index);
			if( !item.size() ) return; 	
			
			if(  item.hasClass('nex-accordion-collapse') ) {
				self.collapseItem( index );
			} else {
				self.expandItem( index );	
			}
		},
		expandItem : function( index,m ){
			var self = this,
				undef,
				m = m === undef ? false : true,
				opt = self.configs,
				container = opt.views['container'];		
			var item = $('#'+opt.id+'_accordion_item_'+index);
			if( !item.size() ) return false; 
			if( !m ) {
				if(  item.hasClass('nex-accordion-collapse') ) return true;
			}
			if( opt.singleSelect ) {
				var collapses = $('>.nex-accordion-collapse',container);
				collapses.each( function(){
					var index = $(this).attr( 'itemindex' );
					self.collapseItem( index );	
				} );
			}
			item.addClass('nex-accordion-collapse');	
			item.addClass('nex-accordion-active');	
			item.removeClass('nex-accordion-expand');
			
			var callBack = function(){
				self.fireEvent('onItemExpand',[index,item,opt]);
			};
			var hd = $( '>.nex-accordion-header',item );
			var bd = $( '>.nex-accordion-body',item );
			var h = hd._outerHeight() + bd.outerHeight();
			if( opt.animateShow ) {
				if( $.isFunction( opt.animate ) ) {
					opt.animate.apply( self,[ index,item,callBack,'expand' ] );	
				} else {
					item.stop(true)
					.animate({
						height : h
					},
					opt.animateTime,
					opt.easing,function(){
						callBack();	
					});	
				}
			} else {
				item.height( h );	
				callBack();	
			}
		},
		collapseItem : function( index , m ){
			var self = this,
				undef,
				opt = self.configs,
				container = opt.views['container'];		
			var item = $('#'+opt.id+'_accordion_item_'+index);
			if( !item.size() ) return false; 
			
			if(  item.hasClass('nex-accordion-expand') ) return true;
			
			item.addClass('nex-accordion-expand');	
			item.removeClass('nex-accordion-active');
			item.removeClass('nex-accordion-collapse');
			
			var callBack = function(){
				self.fireEvent('onItemCollapse',[index,item,opt]);
			};
			
			var hd = $( '>.nex-accordion-header',item );
			var h = hd.outerHeight();
			if( opt.animateShow ) {
				if( $.isFunction( opt.animate ) ) {
					opt.animate.apply( self,[index,item,callBack,'collapse'] );	
				} else {
					item.stop(true)
					.animate({
						height : h
					},
					opt.animateTime,
					opt.easing,function(){
						callBack();		
					});
				}
			} else {
				item.height( h );	
				callBack();	
			}
		},
		refreshItemContent : function( index ){
			var self = this,undef;	
			self._appendContent( index );	
		},
		_appendContent : function( index ){
			var self = this,undef;
			var opt = self.C();	
			var container = opt.views['container'];
			var items = opt.items;
			var _item = opt._item;
			var list
			if( index !== undef ) {
				list = $('#'+opt.id+'_accordion_item_'+index);	
			} else {
				list = $(">.nex-accordion-item",container);
			}
			list.each(function(){
				var $this = $(this);
				var index = $this.attr('itemindex');
				var lbody = $('>.nex-accordion-body',$this);
				lbody.empty();
				var d = items[index];
				if( !d ) return;
				d = $.extend( _item.call(self),d );
				var _items = d['html'];
				self.addComponent( lbody,_items );
				var _items = d['items'];
				self.addComponent( lbody,_items );
			});
			
			return container;
		},
		initAccordion : function(){
			var self = this,
				undef,
				opt = self.configs;
				
			Nex.html.fn.initComponent.apply(self,arguments);
				
		}
	});
})(jQuery);