/*
jquery.extGrid.lockrow.js
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
	$.nexGrid.addExtConf({
						  lockRows			: []
						 });
	//事件
	$.nexGrid.addExtEvent({
						    onBeforeLockRow     : $.noop,
							onAfterLockRow 		: $.noop,
							onBeforeUnlockRow	: $.noop,
							onAfterUnLockRow   	: $.noop
						 });
	$.nexGrid.puglins.push(function(){
		var self = this,
			opt = self.configs;
		//防止重复绑定	
		self.unbind("onShowGrid.lockrow");
		self.unbind("onAfterLockRow.lockrow");
		self.unbind("onAfterAddRow.lockrow");
		self.unbind("onBeforeScrollToRow.lockrow");
		self.unbind("onBeforeLazyRowHide.lockrow");
		self.unbind("onBeforeLazyRowShow.lockrow");
		
		//事件绑定
		self.bind("onShowGrid.lockrow",self.onLockRow);
		self.bind("onBeforeLazyRowHide.lockrow",self.checkLazyHideRow);
		self.bind("onBeforeLazyRowShow.lockrow",self.checkLazyHideRow);
		self.bind("onAfterAddRow.lockrow",self.checkToRow);//锁行
		self.bind("onBeforeScrollToRow.lockrow",self.checkScrollToRow);
	});
	$.nexGrid.fn.extend({	
		checkLazyHideRow : function(rid){
			var self = this,
				opt = self.configs;
			if( self.inArray( rid,opt.lockRows )!=-1 ) return false;	
		},
		checkScrollToRow : function(rid){
			var self = this,
				opt = self.configs;
			//检测当前行是否被锁定
			if( self.inArray( rid,opt.lockRows ) != -1 ) {
				return false;		
			}
		},					 
		lockRow : function(rowId){
			var self = this,
				opt = self.configs;
			//lazyLoad
			if( opt.lazyLoadRow && self.inArray( rowId,opt.lazyRows ) == -1 ) {
				self._loadRow(rowId);
			}
			if( self._lockRow(rowId) ) {
				self.methodInvoke('resetViewSize');
			}
		},
		unLockRow : function(rowId){
			var self = this,
				opt = self.configs;
			if( self._unLockRow(rowId) ) {
				self.methodInvoke('resetViewSize');
			}
		},
		//行列锁
		onLockRow : function(){
			var self = this,
				opt = self.configs;
			var rows = opt.lockRows;
			self.lockMethod('resetViewSize');
			var i = 0,
				len = rows.length;
			for(;i<len;i++) {
				if(rows[i] == null) continue;
				
				self.lockRow(rows[i]);
			}	
			self.unLockMethod('resetViewSize');
			if( rows.length )
				self.methodInvoke('resetViewSize');
		},
		checkToRow : function(rid){
			var self = this;
			var opt = self.configs;
			if( self.inArray( rid,opt.lockRows ) != -1 ) {
				self.lockRow(rid);
			}
		},
		_lockRow : function(rowId) {
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var render = gid;
			
			var r = self.fireEvent('onBeforeLockRow',[rowId]);
			if(r === false) return false;
			
			if( self.inArray(rowId,opt.lockRows) == -1 ) {
				opt.lockRows.push(rowId);
			}
			
			var f = $("#"+opt.id+"-row-"+rowId);
			var f1 = $("#"+opt.id+"-view1-row-"+rowId);
			if( !f.length ) return false;
			//防止重复锁定 注：不可以开启，否则刷新表格收不会锁行
			//if( self.inArray( rowId,opt.lockRows ) != -1 ) return false;
			
			//移动行;
			$("#view2-datagrid-header-outer-locktable-tbody-"+opt.id).append(f);
			$("#view1-datagrid-header-outer-locktable-tbody-"+opt.id).append(f1);
			
			self.fireEvent('onAfterLockRow',[rowId]);
			
			return true;
		},
		_unLockRow : function(rowId){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var render = gid;
			
			//判断当前行是否已经锁定
			if( self.inArray( rowId,opt.lockRows ) == -1 ) return false;
			
			var r = self.fireEvent('onBeforeUnlockRow',[rowId]);
			if(r === false) return false;
			
			var _id = rowId;
			var f = $("#"+opt.id+"-row-"+rowId);
			var f1 = $("#"+opt.id+"-view1-row-"+rowId);
			if( !f.length ) return false;
			
			//修正当上一个元素也锁定的时 找出下一个没有锁定的元素
			//修正所有都锁定的时候 无法取消锁定问题
			//往上找
			for(var m=rowId-1;m>=-1;m--) {
				if( self.inArray( m,opt.lockRows ) == -1 ) {
					//判断该行是否存在
					if( $("#"+opt.id+"-row-"+m).size() ) {
						break;
					}
				}
			}
			rowId = m;
			
			var $theader2 = $("#view2-datagrid-body-btable-tbody-header-"+opt.id);
			var $theader1 = $("#view1-datagrid-body-btable-tbody-header-"+opt.id);
			
			//移动行
			if(rowId>=0) {
				//rowId -= 1;
				f.insertAfter("#"+opt.id+"-row-"+rowId);
				f1.insertAfter("#"+opt.id+"-view1-row-"+rowId);
			} else if( $theader2.size() && $theader1.size() ){ 
				f.insertAfter($theader2);
				f1.insertAfter($theader1);
			} else {
				//view2.find(".datagrid-body .datagrid-btable > tbody").first().prepend(f);
				$("#view2-datagrid-body-btable-tbody-"+opt.id).prepend(f);
				//view1.find(".datagrid-body .datagrid-btable > tbody").first().prepend(f1);	
				$("#view1-datagrid-body-btable-tbody-"+opt.id).prepend(f1);
			}
			
			var _pos = self.inArray( _id,opt.lockRows );
			if( _pos != -1 ) {
				opt.lockRows.splice(_pos,1);
			}
			self.fireEvent('onAfterUnLockRow',[_id,rowId]);
			
			return true;	
		}
	}); 
})(jQuery);