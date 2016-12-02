/*
author:nobo
timeLineV
时间轴横向插件
*/
;(function($,window){
	var timeLineV = Nex.extend('timeLineV','html');
	var baseConf = Nex.html.getDefaults( Nex.html.getOptions() );
	timeLineV.setOptions(function(){
		return {
			prefix : 'nextimeline-h-',
			autoRecovery : false,
			autoResize : true,
			border : false,
			borderCls : [baseConf.borderCls,'nex-timeline-h-border'].join(' '),
			containerCls : [baseConf.containerCls,'nex-timeline'].join(' '),
			autoScrollCls : [baseConf.autoScrollCls,'nex-timeline-h-auto-scroll'].join(' '),
			_initMethod : ['setTimeWrap'],
			showScrollBtn : false,//是否显示左/右滚动按钮
			scrollStep : 220,
			itemHeight : 160,
			itemLeftWidth : 150,
			itemCenterWidth : 20,
			itemRightWidth : 150,
			timeLineSize : 2,//时间线大小
			circleBorder : true,//是否显示外圆边框
			circlePadding : 3,//时间节点中心内边距
			circleSize : 5, //中心圆大小
			items : [] //{ leftHtml:'',rightHtml:'html',size:5,height:150,isStart:false,isEnd : false }
		};	
	});
	timeLineV.extend({
		version : '1.0',
		_Tpl : {
			time_inner : '<div id="<%=id%>_item_wraper" class="nex-timeline-item-wraper-v">'
						  		+'<div id="<%=id%>_item_inner" class="nex-timeline-item-inner-v"></div>'
						  +'</div>',
			 _item :  '<div class="nex-timeline-item-v <%=isStart ? "nex-timeline-item-start-v" : ""%> <%=isEnd ? "nex-timeline-item-end-v" : ""%>">'
                            + '<div class="nex-timeline-item-left-v"><%=leftHtml%></div>'
                              +  '<div class="nex-timeline-item-center-v">'
                             +      '<div class="nex-timeline-line-v"></div>'
                             +      '<div class="nex-timeline-circle-wraper-v">'
                               +         '<div class="nex-timeline-circle-v nex-timeline-circle1-v" style="width:<%=size%>px;height:<%=size%>px;padding:<%=padding%>px">'
                               +             '<div class="nex-timeline-circle-v nex-timeline-circle2-v"  style="width:<%=size%>px;height:<%=size%>px;"></div>'
                              +          '</div>'
                              +      '</div>'
                             +   '</div>'
                             +   '<div class="nex-timeline-item-right-v"><%=rightHtml%></div>'
                      + '</div>'
		}	
	});
	timeLineV.fn.extend({
		_appendContent : function(){
			var self = this
				,opt = self.C();
			self._addTimeItem( opt.items );	
		},
		setTimePos : function(){
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
		_getItemEl : function( item ){
			var self = this
				,opt = self.C();
			var _item = {
				leftHtml:'',rightHtml:'',size:opt.circleSize,padding:opt.circlePadding,isStart:false,isEnd : false	
			};	
			var item = $.extend( _item,item );
			var tpl = self.tpl( '_item',item );
			var el = $(tpl);
			el._outerHeight( opt.itemHeight );
			$('>.nex-timeline-item-left-v',el)._outerWidth( opt.itemLeftWidth );		
			$('>.nex-timeline-item-center-v',el)._outerWidth( opt.itemCenterWidth ).css('left',opt.itemLeftWidth);		
			$('>.nex-timeline-item-right-v',el)._outerWidth( opt.itemRightWidth ).css( 'left',opt.itemLeftWidth+opt.itemCenterWidth );	
			$('.nex-timeline-line-v',el).width( opt.timeLineSize ).css( 'marginLeft',(opt.timeLineSize/2)*-1 );
			var circle = $('.nex-timeline-circle1-v',el);
			var circleCt = $('.nex-timeline-circle-wraper-v',el);
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
			$('.nex-timeline-circle-wraper-v',el).bind(events);		
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
						/*wraper.css( {
							left : function(i,l){
								return ( Math.abs(parseFloat(l))+el.outerWidth())*-1;
							}	
						} );*/
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
		}
	});
})(jQuery,window);
