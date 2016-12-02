/*
jquery.extGrid.lockcolumn.js
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
						  lockColumns			: []
						 });
	//事件
	$.nexGrid.addExtEvent({
						    onBeforeLockColumn      : $.noop,
							onAfterLockColumn 		: $.noop,
							onBeforeUnlockColumn	: $.noop,
							onAfterUnLockColumn   	: $.noop
						 });
	$.nexGrid.puglins.push(function(){
		var self = this,
			opt = self.configs;
		//防止重复绑定	
		self.unbind("onShowGrid.lockcolumn");
		self.unbind("onAfterLockRow.lockcolumn");
		self.unbind("onShowLazyRows.lockcolumn");
		self.unbind("onUpdateHeaderRow.lockcolumn");
		self.unbind("onUpdateFooterRow.lockcolumn");
		self.unbind("onAfterAddRow.lockcolumn");
		self.unbind("onBeforeScrollToField.lockcolumn");
		self.unbind("onBeforeColumnMove.lockcolumn");
		self.unbind("onColumnMoving.lockcolumn");
		self.unbind("onBeforeSwitchColumn.lockcolumn");
		
		//事件绑定
		self.bind("onShowGrid.lockcolumn",self.onLockColumn);
		//self.bind("onAfterLockRow.lockcolumn",self.onAfterLockColumn);
		self.bind("onAfterAddRow.lockcolumn",self.onLockColumn);//锁列
		self.bind("onShowLazyRows.lockcolumn",self.onLockColumn);//锁列
		self.bind("onUpdateHeaderRow.lockcolumn",self.onLockColumn);
		self.bind("onUpdateFooterRow.lockcolumn",self.onLockColumn);
		self.bind("onBeforeScrollToField.lockcolumn",self.checkScrollToField);
		self.bind("onBeforeColumnMove.lockcolumn",self.checkColumnMove);
		self.bind("onColumnMoving.lockcolumn",self.checkColumnMoving);
		self.bind("onBeforeSwitchColumn.lockcolumn",self.checkSwitchColumn);
	});
	$.nexGrid.fn.extend({
		checkColumnMoving : function(obj,field,toField){
			var self = this,
				opt = self.configs;
			//检测当前列是否被锁定
			var r = self.isFieldLocked( toField );
			if( r ) {
				obj.addClass("grid-locked-error");
			} else {
				obj.removeClass("grid-locked-error");	
			}	
		},						 
		checkColumnMove : function(field){
			var self = this,
				opt = self.configs;
			//检测当前列是否被锁定
			var r = self.isFieldLocked( field );
			if( r ) {
				return false;
			}	
		},	
		checkSwitchColumn : function(field,toField){
			var self = this,
				opt = self.configs;
			//检测当前列是否被锁定
			var r = self.isFieldLocked( field );
			if( r ) {
				return false;
			}
			var r = self.isFieldLocked( toField );
			if( r ) {
				return false;
			}
		},	
		checkScrollToField : function(field){
			var self = this,
				opt = self.configs;
			//检测当前列是否被锁定
			var r = self.isFieldLocked( field );
			if( r ) {
				return false;
			}	
		},	
		isFieldLocked : function(field){
			var self = this,
				opt = self.configs;
			//检测当前列是否被锁定
			if( self.inArray( field,opt.lockColumns ) != -1 ) {
				return true;
			}
			return false;
		},
		unLockColumn : function(field){
			var self = this,
				opt = self.configs;
			if( self._unLockColumn(field) ) {
				self.methodInvoke('resetViewSize');
				return true;
			}
			return false;
		},
		lockColumn : function(field){
			var self = this,
				opt = self.configs;
			if( self._lockColumn(field) ) {
				self.methodInvoke('resetViewSize');
				return true;
			}
			return false;
		},
		onLockColumn : function(){
			var self = this,
				opt = self.configs;
			var columns = opt.lockColumns;
			if( opt._olt ) {
				clearTimeout(opt._olt);	
			}
			
			var t = setTimeout(function(){
				var i = 0,
					len = columns.length;
				self.lockMethod('resetViewSize');	
				for(;i<len;i++) {
					if( !columns[i] ) continue;
					self.lockColumn(columns[i]);
					if( opt.lockColumns.length != len ) {
						len = opt.lockColumns.length;
						i -= 1;
					}
				}
				self.unLockMethod('resetViewSize');
				
				if( columns.length )
					self.methodInvoke('resetViewSize');
			},0);
			
			opt._olt = t;
		},
		_lockColumn : function(field) {
			var self = this,
				opt = self.configs,
				data = opt.data,
				gid = opt.gid;
			var render = gid;
			
			if( typeof field == 'undefined' ) return false;
			
			var r = self.fireEvent('onBeforeLockColumn',[field]);
			if(r === false) return false;
			
			var fields = self.getColumnList();
			
			if( self.inArray( field,opt.lockColumns ) == -1 ) {
				opt.lockColumns.push(field);
			};
			
			if( self.inArray( field,fields ) == -1 ) {
				var _pos = self.inArray( field,opt.lockColumns );
				if( _pos != -1 ) {
					opt.lockColumns.splice(_pos,1);	
				}
				return false;
			}
			
			var view1_header_hbody_id = "#view1-datagrid-header-inner-htable-tbody-"+opt.id;
			var view1_header_lockbody_id = "#view1-datagrid-header-outer-locktable-tbody-"+opt.id;
			
			var f = $("#view2-datagrid-header-inner-htable-tbody-"+opt.id).find(">.datagrid-header-row td[field='"+field+"']");
			
			$(view1_header_hbody_id).find(">tr.datagrid-header-row").append(f);
			
			$("#view2-datagrid-header-outer-locktable-tbody-"+opt.id).find(">.datagrid-row td[field='"+field+"']").each(function(i){
				var rowId = $(this).parent().attr("datagrid-rid");
				var getRn = self._getRowNumber(rowId);
				if( getRn.isNew ) {
					$("#view1-datagrid-header-outer-locktable-tbody-"+opt.id).append(getRn.node);
				}
				$(this).appendTo( getRn.node );
			});
			
			$("#view2-datagrid-body-btable-tbody-"+opt.id).find(">.datagrid-row td[field='"+field+"']").each(function(i){
				var rowId = $(this).parent().attr("datagrid-rid");
				var getRn = self._getRowNumber(rowId);
				if( getRn.isNew ) {
					$("#view1-datagrid-body-btable-tbody-"+opt.id).append(getRn.node);
				}
				$(this).appendTo( getRn.node );
			});
			
			self.fireEvent('onAfterLockColumn',[field]);
			return true;
		},
		_unLockColumn : function(field) {
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var render = gid;
			
			if( typeof field == 'undefined' ) return false;
			
			var r = self.fireEvent('onBeforeUnlockColumn',[field]);
			if(r === false) return false;
			
			var fields = self.getColumnList();
			
			//判断当前列是否已经不存在锁定
			if( self.inArray( field,opt.lockColumns ) == -1 ) return false;
			
			var pos = self.inArray( field,fields );
			if( pos == -1 ) return false;
			
			var _field = "";
			for( var i=pos;i>=-1;i-- ) {
				if( i < 0 ) break;
				if( self.inArray( fields[i],opt.lockColumns ) != -1 ) continue;
				_field = fields[i];
				break;
			}
			pos = i;
			
			//header
			var f = $("#view1-datagrid-header-inner-htable-tbody-"+opt.id).find(">.datagrid-header-row td[field='"+field+"']");
			if( pos < 0) {
				f.prependTo( $("#view2-datagrid-header-inner-htable-tbody-"+opt.id).find(">.datagrid-header-row") );
			} else {
				f.insertAfter( $("#view2-datagrid-header-inner-htable-tbody-"+opt.id).find(">.datagrid-header-row").find("td[field='"+_field+"']"));	
			}
			//移动单元格
			$("#view1-datagrid-header-outer-locktable-tbody-"+opt.id).find(">.datagrid-row td[field='"+field+"']").each(function(i){
				var tr = $(this).parent();
				var rowId = tr.attr("datagrid-rid");
				//$(this).appendTo( view.find("#"+opt.id+"-row-"+indexid) );
				var view2_tr = $("#"+opt.id+"-row-"+rowId);
				if( pos < 0) {
					view2_tr.prepend( $(this) );
				} else {
					view2_tr.find(">td[field='"+_field+"']").after( $(this) );	
				}
			});
			$("#view1-datagrid-body-btable-tbody-"+opt.id).find(">.datagrid-row td[field='"+field+"']").each(function(i){
				var tr = $(this).parent();
				var rowId = tr.attr("datagrid-rid");
				//$(this).appendTo( view.find("#"+opt.id+"-row-"+indexid) );
				var view2_tr = $("#"+opt.id+"-row-"+rowId);
				if( pos < 0) {
					view2_tr.prepend( $(this) );
				} else {
					view2_tr.find(">td[field='"+_field+"']").after( $(this) );	
				}
				
			});
			
			var _pos = self.inArray( field,opt.lockColumns );
			if( _pos != -1 ) {
				opt.lockColumns.splice(_pos,1);
			}
			self.fireEvent('onAfterUnLockColumn',[field,pos,_field]);
			
			return true;	
		}
	}); 
})(jQuery);