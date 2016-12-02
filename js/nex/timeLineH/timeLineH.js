/*
author:nobo
timeLineH
时间轴横向插件
*/
;(function($,window){
	var timeLineH = Nex.extend('timeLineH','html');
	var baseConf = Nex.html.getDefaults( Nex.html.getOptions() );
	timeLineH.setOptions(function(){
		return {
			prefix : 'nextimeline-h-',
			autoRecovery : false,
			autoResize : true,
			border : false,
			borderCls : [baseConf.borderCls,'nex-timeline-h-border'].join(' '),
			containerCls : [baseConf.containerCls,'nex-timeline'].join(' '),
			autoScrollCls : [baseConf.autoScrollCls,'nex-timeline-h-auto-scroll'].join(' '),
			_initMethod : ['setTimeWrap'],
			showScrollBtn : true,//是否显示左/右滚动按钮
			itemWidth : 110,
			scrollStep : 220,
			itemTopHeight : 130,
			itemCenterHeight : 40,
			itemBottomHeight : 60,
			timeLineSize : 2,//时间线大小
			circleBorder : true,//是否显示外圆边框
			circlePadding : 3,//时间节点中心内边距
			circleSize : 5, //中心圆大小
			items : [] //{ topHtml:'',bottomHtml:'html',size:5,width:110,isStart:false,isEnd : false }
		};	
	});
	timeLineH.extend({
		version : '1.0',
		_Tpl : {
			time_inner : '<% if( showScrollBtn ) { %>'
						  +'<div id="<%=id%>_item_left" class="nex-timeline-item-left">'
								+'<div class="nex-timeline-item-top"></div>'
								+'<div class="nex-timeline-item-center nex-timeline-left-icon"></div>'
								+'<div class="nex-timeline-item-bottom"></div>'
						  +'</div>'
						  +'<% } %>'
						  +'<div id="<%=id%>_item_wraper" class="nex-timeline-item-wraper">'
						  		+'<div id="<%=id%>_item_inner" class="nex-timeline-item-inner"></div>'
						  +'</div>'
						  +'<% if( showScrollBtn ) { %>'
						  +'<div id="<%=id%>_item_right" class="nex-timeline-item-right">'
								+'<div class="nex-timeline-item-top"></div>'
								+'<div class="nex-timeline-item-center nex-timeline-right-icon"></div>'
								+'<div class="nex-timeline-item-bottom"></div>'
						  +'</div>'	
						  +'<% } %>',
			 _item :  '<div class="nex-timeline-item <%=isStart ? "nex-timeline-item-start" : ""%> <%=isEnd ? "nex-timeline-item-end" : ""%>">'
                            + '<div class="nex-timeline-item-top"><%=topHtml%></div>'
                              +  '<div class="nex-timeline-item-center">'
                             +      '<div class="nex-timeline-line"></div>'
                             +      '<div class="nex-timeline-circle-wraper">'
                               +         '<div class="nex-timeline-circle nex-timeline-circle1" style="width:<%=size%>px;height:<%=size%>px;padding:<%=padding%>px">'
                               +             '<div class="nex-timeline-circle nex-timeline-circle2"  style="width:<%=size%>px;height:<%=size%>px;"></div>'
                              +          '</div>'
                              +      '</div>'
                             +   '</div>'
                             +   '<div class="nex-timeline-item-bottom"><%=bottomHtml%></div>'
                      + '</div>'
		}	
	});
	timeLineH.fn.extend({
		_appendContent : function(){
			var self = this
				,opt = self.C();
			self._addTimeItem( opt.items );	
		},
		setItemHeight : function( item ){
			var self = this
				,opt = self.C()
				,container = opt.views['container']
				,undef;	
			if( !item ) return false;
			$('>.nex-timeline-item-top',item)._outerHeight( opt.itemTopHeight );		
			$('>.nex-timeline-item-center',item)._outerHeight( opt.itemCenterHeight );		
			$('>.nex-timeline-item-bottom',item)._outerHeight( opt.itemBottomHeight );	
			return true;	
		},
		/*设置 位置以及高度*/
		setTimePos : function(){
			var self = this
				,opt = self.C()
				,container = opt.views['container']
				,undef;	
			var left = 0;	
			if( opt.showScrollBtn )	{
				var tl = $('#'+opt.id+'_item_left');
				var tr = $('#'+opt.id+'_item_right');
				self.setItemHeight( tl );
				self.setItemHeight( tr );
				left = tl.outerWidth();
				/*绑定滚动事件*/
				$('.nex-timeline-item-center',tl).click( function(){
					if( tl.hasClass('nex-timeline-item-disabled') ) {
						return;	
					}
					self.scrollLeft();	
				} );
				$('.nex-timeline-item-center',tr).click( function(){
					if( tr.hasClass('nex-timeline-item-disabled') ) {
						return;	
					}
					self.scrollRight();	
				} );
			}
			var wraper = $('#'+opt.id+'_item_wraper');
			wraper.css( 'left',left );
			wraper._outerHeight( opt.itemTopHeight + opt.itemCenterHeight + opt.itemBottomHeight );
			$('#'+opt.id+'_item_inner').height( wraper.height() );
		},
		setTimeWrap :　function(){
			var self = this
				,opt = self.C()
				,container = opt.views['container']
				,undef;
			var tpl = self.tpl( 'time_inner',opt );
			container.html( tpl );
			//设置位置
			self.setTimePos();
		},
		resetViewSize : function(){
			var self = this
				,opt = self.C()
				,container = opt.views['container'];
			var w = 0;
			if( opt.showScrollBtn )	{
				var tl = $('#'+opt.id+'_item_left');
				var tr = $('#'+opt.id+'_item_right');
				w = tl.outerWidth() + tr.outerWidth();
			}	
			var wraper = $('#'+opt.id+'_item_wraper');
			wraper._outerWidth( opt._width - w );
		},
		onViewSizeChange : function(func){
			var self = this;
			var opt = self.C();	
			self.resetViewSize();	
			Nex.html.fn.onViewSizeChange.apply(self,arguments);
		},
		_getItemEl : function( item ){
			var self = this
				,opt = self.C();
			var _item = {
				topHtml:'',bottomHtml:'',size:opt.circleSize,padding:opt.circlePadding,width:opt.itemWidth,isStart:false,isEnd : false	
			};	
			var item = $.extend( _item,item );
			var tpl = self.tpl( '_item',item );
			var el = $(tpl);
			el._outerWidth( item.width );
			$('>.nex-timeline-item-top',el)._outerHeight( opt.itemTopHeight );		
			$('>.nex-timeline-item-center',el)._outerHeight( opt.itemCenterHeight );		
			$('>.nex-timeline-item-bottom',el)._outerHeight( opt.itemBottomHeight );	
			$('.nex-timeline-line',el).height( opt.timeLineSize ).css( 'marginTop',(opt.timeLineSize/2)*-1 );
			var circle = $('.nex-timeline-circle1',el);
			var circleCt = $('.nex-timeline-circle-wraper',el);
			var w=circle.outerWidth(),h=circle.outerHeight();
			circleCt.css( {
				marginTop:(h/2).toFixed(0)*-1,
				marginLeft : (w/2).toFixed(0)*-1	
			} );
			return el;
		},
		bindItemEvents : function(el){
			var self = this
				,opt = self.C();
			var callBack = function(type,e){
				var r = self.fireEvent(type,[ this,e,opt ]);
				if( r === false ) {
					e.stopPropagation();
					e.preventDefault();
				}
			};
			var events = {
				'click' : function(e) {
					callBack.call(this,'onCircleClick',e);
				},
				'dblclick' : function(e) {
					callBack.call(this,'onCircleDblClick',e);
				},
				'mouseenter' : function(e){
					callBack.call(this,'onCircleMouseEnter',e);
					$(this).addClass('nex-timeline-circle-over');
				},
				'mouseleave' : function(e){
					callBack.call(this,'onCircleMouseLeave',e);
					$(this).removeClass('nex-timeline-circle-over');
				},
				'mouseover' : function(e){
					callBack.call(this,'onCircleMouseOver',e);
				},
				'mouseout' : function(e){
					callBack.call(this,'onCircleMouseOut',e);
				},
				'mousedown' : function(e) {
					callBack.call(this,'onCircleMouseDown',e);
				},
				'mouseup' : function(e) {
					callBack.call(this,'onCircleMouseUp',e);
				},
				'contextmenu' : function(e){	
					callBack.call(this,'onCircleContextMenu',e);
				}
			};
			$('.nex-timeline-circle-wraper',el).bind(events);		
		},
		/*
		* items 可以是对象也可以是 数组 , m 默认是true往后添加, false 往前添加
		*/
		_addTimeItem : function( items , m ){
			var self = this
				,undef
				,opt = self.C();
			var m = m === undef ? true : m;	
			if( !$.isArray( items ) ) {
				items = [ items ];	
			}	
			var wraper = $('#'+opt.id+'_item_inner');
			$.each( items,function(i,item){
				var el = self._getItemEl(item);
				if( el ) {
					if( m ) {
						wraper.append( el );
					} else {
						wraper.prepend( el );
						wraper.css( {
							left : function(i,l){
								return ( Math.abs(parseFloat(l))+el.outerWidth())*-1;
							}	
						} );
					}
					self.bindItemEvents( el );
				}
			} );
		},
		addTimeItem :　function( items,m ){
			var self = this
				,undef
				,opt = self.C();
			var m = m === undef ? true : m;	
			if( !$.isArray( items ) ) {
				items = [ items ];	
			}	
			var r = self.fireEvent('onBeforeAddTimeItem',[ items,opt ]);
			if( r === false )  return r;
			self._addTimeItem( items,m );
			opt.items = m ? opt.items.concat( items ) : items.concat( opt.items );
			self.fireEvent('onAddTimeItem',[ items,opt ]);
			return true;
		},
		/*
		*滚动到最右边
		*/
		scrollRightEnd : function(t){
			var self = this
				,undef
				,opt = self.C();
			var t = t === undef ? true : t;	
			var wraper0 = $('#'+opt.id+'_item_wraper');
			var wraper = $('#'+opt.id+'_item_inner');
			var last = 	$('.nex-timeline-item',wraper).last();
			if( !last.length ) return false;
			var left = last.position().left + last.outerWidth();
			var _w = wraper0.width();
			var sLeft = left - _w;
			if( sLeft>0 ) {
				self.fireEvent( 'onScrollRightEnd',[opt] );	
				if( t ) {
					wraper.animate( {
						'left' : sLeft*-1	
					},500,'easeInCirc' );
				} else {
					wraper.css( 'left',sLeft*-1 )	
				}
			}
			return true;
		},
		/*
		*滚动到最左边
		*/
		scrollLeftEnd : function(t){
			var self = this
				,undef
				,opt = self.C();
			var t = t === undef ? true : t;	
			var wraper = $('#'+opt.id+'_item_inner');
			
			self.fireEvent( 'onScrollLeftEnd',[opt] );	
			
			if( t ) {
				wraper.animate( {
					left : 0	
				},500,'easeInCirc' );
			} else {
				wraper.css( 'left',0 )	
			}
		
			return true;
		},
		scrollLeft : function(){
			var self = this
				,undef
				,opt = self.C();
			var wraper = $('#'+opt.id+'_item_inner');
			var sLeft = parseFloat( wraper.css( 'left' ) );
			sLeft += opt.scrollStep;
			sLeft = Math.min( sLeft,0 );
			if( sLeft == 0 ) {
				self.fireEvent( 'onScrollLeftEnd',[opt] );	
			}
			wraper.animate( {
				left : sLeft
			},200,'easeInCubic' );		
		},
		scrollRight : function(){
			var self = this
				,undef
				,opt = self.C();
			var wraper0 = $('#'+opt.id+'_item_wraper');	
			var wraper = $('#'+opt.id+'_item_inner');
			var last = 	$('.nex-timeline-item',wraper).last();
			var _w = wraper0.width();
			if( last.length ) {
				_w = last.position().left + last.outerWidth();
			}
			var _t = wraper0.width() - _w;
			var sLeft = parseFloat( wraper.css( 'left' ) );
			sLeft -= opt.scrollStep;
			sLeft = Math.max( sLeft,_t );
			if( sLeft == _t ) {
				self.fireEvent( 'onScrollRightEnd',[opt] );	
			}
			wraper.animate( {
				left : sLeft
			},200,'easeInCubic' );			
		}
	});
})(jQuery,window);
