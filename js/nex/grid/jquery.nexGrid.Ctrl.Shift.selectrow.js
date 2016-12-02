/*
jquery.extGrid.Ctrl.Shift.selectrow.js
http://www.extgrid.com
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱
+----------------------------------------------------------------------------------------------------------------------------+
*/

//nexGrid扩展功能
/*
按Ctrl Shift时 选择行扩展
默认单选模式时 不可用，但可以开启onlySingle:false 来设置单选模式下也生效
*/
;(function($){
	"use strict";
	//参数
	$.nexGrid.addExtConf({
						 onlySingle : true,
						 isShiftKey : false,
						 isCtrlKey : false,
						 firstIndex : 0,
						 lastIndex : 0,
						 _singleSelect : null
						 });
	//事件
	$.nexGrid.addExtEvent({
						 //...
						 });
	function _extSelectRow() {
		var self = this,opt = this.configs;
		
	}
	$.nexGrid.puglins.push(function(){
		var self = this;
		var opt = self.configs;
		//记录初始状态
		opt._singleSelect = opt._singleSelect === null ? opt.singleSelect : opt._singleSelect;
		//设置单选 或多选
		var setMultiSelect = function(m){
			if( m ) {
				if( !opt._singleSelect || (opt._singleSelect && !opt.onlySingle) ) {
					opt.singleSelect = !m;
				}
			} else {
				opt.singleSelect = opt._singleSelect;	
				//opt.firstIndex = opt.lastIndex = null;
			}
		};
		//当松开Ctrl时 如果当前模式处于单选状态则取消其他行的选中
		self.bind("onClickRow.selectrow",function(tr,rid){
			
			if( !opt.isShiftKey && !opt.isCtrlKey && opt.singleSelect && !opt.onlySingle ) {
				var selectRows = self.getSelectRows();
				for( var i=0;i<selectRows.length;i++ ) {
					if( selectRows[i] == rid ) continue;
					self.unselectRow( selectRows[i] );
				}
			}				
		});
		//记录最后一次的选中行id
		self.bind("onClickRow.selectrow",function(tr,rid){
			if( !opt.isShiftKey ) opt.firstIndex = rid;
		});
		self.bind("onSelect.selectrow",function(tr,rid){
			if( !opt.isShiftKey ) opt.firstIndex = rid;
		});
		self.bind("onUnselect.selectrow",function(tr,_rid){
			if( opt.isShiftKey ) {									  
				if( _rid == opt.lastIndex ) return false;	
			}
		});
		//当按下/松开Shift
		self.bind("onClickRow.selectrow",function(tr,rid){								 
			if( opt.isShiftKey ) {
				opt.lastIndex = rid;
				var selectRows_old = self.getSelectRows();
				//self.unselectAllRows();
				var selectRows_new = {};
				var start = Math.min(opt.firstIndex,opt.lastIndex);	
				var end = Math.max(opt.firstIndex,opt.lastIndex);	
				
				for( var i=start;i<=end;i++ ) {
					selectRows_new[i] = true;
				}
				for( var j=0;j<selectRows_old.length;j++ ) {
					var _r = selectRows_old[j];
					if( !selectRows_new[_r] ) {
						self.unselectRow(_r);	
					}
				}
				for( var i=start;i<=end;i++ ) {
					if( i == rid ) continue;
					self.selectRow(i);
				}
			}				
		});
		
		$(document).unbind("keydown.selectrow");
		$(document).unbind("keyup.selectrow");
		$(document).bind("keydown.selectrow",function(e){
			opt.isCtrlKey = e.ctrlKey ? true : opt.isCtrlKey;		
			opt.isShiftKey = e.shiftKey ? true : opt.isShiftKey;		
			if( e.ctrlKey || e.shiftKey ) {
				setMultiSelect(true);	
				$(document.body).bind("selectstart.selectrow", function(e){
					return false;
				});
			}
		});
		$(document).bind("keyup.selectrow",function(e){
			opt.isCtrlKey = (e.keyCode===17) ? false : opt.isCtrlKey;		
			opt.isShiftKey = (e.keyCode===16) ? false : opt.isShiftKey;		
			if( (e.keyCode===17) || (e.keyCode===16) ) {
				setMultiSelect(false);	
				$(document.body).unbind("selectstart.selectrow");
			}
		});			
		_extSelectRow.call(self);
	});
})(jQuery);