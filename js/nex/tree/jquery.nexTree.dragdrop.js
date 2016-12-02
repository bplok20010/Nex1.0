/*
jquery.nexTree.dragdrop.js  只支持tree与tree之间的拖拽
http://www.extgrid.com
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱
+----------------------------------------------------------------------------------------------------------------------------+
*/

;(function($){
	"use strict";
	//参数
	$.nexTree.addExtConf(function(){
		return {
		  dropField : 'droppable',
		  dragField : 'draggable',
		  dragDelay : 50,  // 延迟多少ms后执行拖拽
		  draggable : false,      //全局 是否节点可拖拽
		  droppable : false      //全局 是否接受drop
	   };	
	});					 
	//事件
	$.nexTree.addExtEvent(function(){
		return {
		 //onBeforeSetChceckboxIcon:$.noop,
	   };	
	});
	
	$.nexTree.puglins.push(function(){
		var self = this,
			opt = self.configs;
		//防止重复绑定	
		self.unbind(".dragdrop_tree");
		//事件绑定	
		self.bind("onMouseDown.dragdrop_tree",self._dragMouseDown);	
		self.bind("onMouseMove.dragdrop_tree",self._dragMouseMove);	
		self.bind("onMouseOut.dragdrop_tree",self._dragMouseOut);	
	});
	$.nexTree.extend({
		dragData : null,
		dropData : null,
		clone : null,
		line : null,
		startDrag : false,
		isDragging : false  //是否拖拽中...	
	});
	$.nexTree.fn.extend({
		dropNode : function( dragData,dropData ){
			var self = this
				,opt = self.configs
				,undef;
			if( !opt.droppable ) return false;
			var r = self.fireEvent('onBeforeDropNode',[ dragData,dropData,opt ]);
			if( r === false ) return r;
			
			if( dragData.dragTree === dropData.dropTree ) {//本身的拖拽
				if( dropData.pos === 'top' ) {
					self.moveNode( dragData.dragId,dropData.dropId,1 );
				} else if( dropData.pos === 'center' ) {
					self.moveNode( dragData.dragId,dropData.dropId,2 );	
				} else if( dropData.pos === 'bottom' ) {
					self.moveNode( dragData.dragId,dropData.dropId,3 );		
				}
			} else {//2颗树之间的拖拽
				if( dropData.pos === 'center' ) {
					var dtree = dropData.dropTree;
					var childrenField = dtree.C('childrenField');
					var pnode = $.extend( {},dragData.dragNode );
					pnode[ childrenField ] = dropData.dropId;
					var list = [pnode].concat(dragData.childrens);//dragNode
					$.each( list,function(i,node){
						list[i] = $.extend({},node);
						delete list[i][childrenField];	
					} );
					//console.log( list );
					dtree._parseSimpleData( list,dropData.dropId );
					dtree.refreshTree( dropData.dropId );
					//addChildren();	
				}
			}
			
			self.fireEvent('onDropNode',[ dragData,dropData,opt ]);
			
		},
		_dragMouseDown : function(li,tid,tnode,e){
			var self = this
				,opt = self.configs
				,undef;
			if( !opt.draggable || tnode[ opt.dragField ] === false ) return;
			var t = $('.nex-tree-item-wraper',$(li));
			var x = setTimeout( function(){
				$.nexTree.startDrag = true;
			},opt.dragDelay );
			
			$(document).bind("mouseup.dragdrop_tree",function(e){
				$.nexTree.startDrag = false;
				$(document).unbind(".dragdrop_tree");
				$(document).enableSelection();
				clearTimeout(x);
			});	
			$(document).disableSelection();
		},
		_dragMouseOut : function(li,tid,tnode,e){
			var self = this
				,opt = self.configs
				,undef;
			$.nexTree.dropData = null;
			var line = $.nexTree.line;
			if( line ) line.hide();
		},
		_dragMouseMove : function(li,tid,tnode,e){
			var self = this
				,opt = self.configs
				,undef;
			var tree = self;
			if($.nexTree.startDrag == false) return;
			var t = $('.nex-tree-item-wraper',$(li));
			if( $.nexTree.startDrag ) {
				$.nexTree.isDragging = true;
			}
		
			if( !$.nexTree.clone || !$.nexTree.line ) {
				start.call(t,e,tree);
			}
			
			var treeid = $(t).attr('treeid');
			var treeNode = tree._getNode( treeid );
			var pos = _checkNodeTopBottomEdge( t,e );
			
			$.nexTree.dropData = {
				dropId : treeid,
				dropNode : treeNode,
				dropTree : tree,
				pos : pos
			};
			
			var dragData = $.nexTree.dragData;
			var dropData = $.nexTree.dropData;
			//不能drop到本身
			if( (dragData.dragId === dropData.dropId) && ( dragData.dragTree === dropData.dropTree ) ) {
				pos = 'deny';	
			}
			
			var r = self.fireEvent('onDraggingOver',[ tid,tnode,dragData,dropData,opt ]);
			if( r === false ) {
				pos = 'deny';	
			}
			
			//判断当前节点是否可以drop
			if( tnode[ opt.dropField ] === false ) {
				pos = 'deny';		
			}
			
			if( pos !== 'deny' && (dragData.dragTree === dropData.dropTree) ) {//不能drop到子节点
				var childs = dragData.childrens || self.getAllChildrens( dragData.dragId );
				$.each( childs,function(i,node){
					if( node[ opt.idField ] == dropData.dropId ) {
						pos = 'deny';	
						return false;	
					}
				} );
			} 
			
			$.nexTree.dropData.pos = pos;
			
			var offset = $(t).offset();
			var width = $(t).outerWidth();
			var height = $(t).outerHeight();
			var clone = $.nexTree.clone;
			var line = $.nexTree.line;
			
			clone.removeClass('nex-tree-clone-top nex-tree-clone-center nex-tree-clone-bottom nex-tree-clone-deny');
			
			var droppable = opt.droppable;
			
			switch( pos ) {
				case 'top' : 
					if(droppable) {
						line.css({
							top : offset.top,
							left : offset.left,
							width : width	
						}).show();
					}
					clone.addClass('nex-tree-clone-top');
					break;
				case 'center' : 
					if(droppable) {
						line.hide();
					}
					clone.addClass('nex-tree-clone-center');
					break;
				case 'bottom' : 
					if(droppable) {
						line.css({
							top : offset.top+height,
							left : offset.left,
							width : width	
						}).show();
					}
					clone.addClass('nex-tree-clone-bottom');
					break;	
				default : 
					clone.addClass('nex-tree-clone-deny');
					if(droppable) {
						line.hide();	
					}
			}
			
		}
	}); 
	function start(e,tree) {
		var opt = tree.C();
		var treeid = $(this).attr('treeid');
		var treeNode = tree._getNode( treeid );
		$.nexTree.dragData = {
			dragId : treeid,
			dragNode : treeNode,
			dragTree : tree	,
			childrens : tree.getAllChildrens( treeid )
		};
		var _target = $('<div class="nex-tree-item-clone" id="'+opt.id+'_item_clone" style="position:absolute;z-index:'+(Nex.zIndex+2)+';">'+$('.nex-tree-title',this).html()+'</div>').appendTo(document.body);
		var _line = $('<div class="nex-tree-item-line" id="'+opt.id+'_item_line" style="position:absolute;z-index:'+(Nex.zIndex+3)+';"></div>').appendTo(document.body);
		
		_line.hide();
		
		var clone = $.nexTree.clone =_target;
		var line = $.nexTree.line = _line;
		
		$.nexTree.clone.css({
			left : e.pageX + 10,
			top : e.pageY + 15
		 });
	
		$(document).bind("mousemove.dragdrop_tree",function(e){
			 $.nexTree.clone.css({
				left : e.pageX + 10,
				top : e.pageY + 15
			 });
		});	
		$(document).bind("mouseup.dragdrop_tree",function(e){
			var dropData = $.nexTree.dropData;
			var dragData = $.nexTree.dragData;
			if( dropData && dropData.dropTree && dropData.pos !== 'deny' ) {
				var tree = 	dropData.dropTree;
				tree.dropNode( dragData,dropData );
			}
			$.nexTree.isDragging = false;
			$.nexTree.dragData = null;
			$.nexTree.dropData = null;
			if( $.nexTree.clone ) {
				clone.remove();
				$.nexTree.clone = null;
			}
			if( $.nexTree.line ) {
				line.remove();
				$.nexTree.line = null;
			}
			//$(document).unbind(".dragdrop_tree");
		});
	}
	function _checkNodeTopBottomEdge (helper,e){
		var self = this;
		var offset = $(helper).offset();
		var width = $(helper).outerWidth();
		var height = $(helper).outerHeight();
		var t = e.pageY - offset.top;
		var r = offset.left + width - e.pageX;
		var b = offset.top + height - e.pageY;
		var l = e.pageX - offset.left;
		var edge = 7;//设置上下 边缘是5
		if( t <= edge ) return 'top';
		if( b <= edge ) return 'bottom';
		return 'center';
		//return Math.min(t,r,b,l) < 5;
	}
})(jQuery);