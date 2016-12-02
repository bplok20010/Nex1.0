/*
jquery.extGrid.expandrow.js
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
						  expandAble			: true,
						  ctrlKeyAble 			: false,
						  shiftKeyAle			: false,
						  autoExpand			: false
						 });
	//事件
	$.nexGrid.addExtEvent({
						    onExpandRow       : $.noop,
							onBeforeExpandRow : $.noop,
							onHideExpandRow   : $.noop
						 });
	$.nexGrid.puglins.push(function(){
		var self = this,
			opt = self.configs;
		//防止重复绑定	
		self.unbind("onShowGrid.expandrow");
		self.unbind("onClickRow.expandrow");
		self.unbind("onFieldWidthChange.expandrow");
		self.unbind("onForceFitColumn.expandrow");
		self.unbind("onShowColumn.expandrow");
		self.unbind("onHideColumn.expandrow");
		self.unbind("onAfterLockRow.expandrow");
		self.unbind("onAfterUnLockColumn.expandrow");
		self.unbind("onShowGroup.expandrow");
		self.unbind("onHideGroup.expandrow");
		self.unbind("onAfterDeleteRow.expandrow");
		self.unbind("onLazyRowHide.expandrow");
		
		//事件绑定
		self.bind("onShowGrid.expandrow",self.autoExpand);
		//单击展示_expand
		self.bind("onClickRow.expandrow",self.setExpandEvent);
		self.bind("onFieldWidthChange.expandrow",self.setExpandRowSize);
		self.bind("onForceFitColumn.expandrow",self.setExpandRowSize);
		self.bind("onShowColumn.expandrow",self.setExpandRowSize);
		self.bind("onHideColumn.expandrow",self.setExpandRowSize);
		
		self.bind("onAfterLockColumn.expandrow",self.setExpandRowSize);
		self.bind("onAfterUnLockColumn.expandrow",self.setExpandRowSize);
		
		self.bind("onAfterLockRow.expandrow",self.setExpandPos);
		self.bind("onAfterUnLockRow.expandrow",self.setExpandPos);
		
		self.bind("onAfterDeleteRow.expandrow",self.destroyExpandRow);
		self.bind("onLazyRowHide.expandrow",self.destroyExpandRow);
		
	});
	$.nexGrid.fn.extend({
		setExpandEvent : function(t,rowId,rowData,e){
			var self = this;
			var opt = self.configs;
			
			if( !$.isPlainObject(rowData) ) {
				return;	
			}
			if( !opt.ctrlKeyAble ) {
				if( e.ctrlKey ) {
					return;	
				}	
			}
			if( !opt.shiftKeyAble ) {
				if( e.shiftKey ) {
					return;	
				}	
			}
			
			if('_expand' in rowData) {
				if( !self.isExpandRowShow(rowId) )
					self.expandRow(rowId,rowData['_expand']);	
				else 
					self.hideExpandRow(rowId);	
			}
		},
		setExpandPos : function(rids,prid){//rid
			var self = this,
				opt = self.configs;	

			var _r = function(rid){
				var tr = $("#"+opt.id+"-row-"+rid);
				var ltr = $("#"+opt.id+"-view1-row-"+rid);
				if( tr.size() ) {
					var _tr = $("#"+opt.id+"-expand-row-"+rid);
					if( _tr.size() ) {
						tr.after( _tr );		
					}
				}
				if( ltr.size() ) {
					var _ltr = $("#"+opt.id+"-expand-view1-row-"+rid);
					if( _ltr.size() ) {
						ltr.after( _ltr );		
					}
				}
			}
			_r(rids);
			if( prid >= 0 ) {
				_r(prid);	
			}
		},
		//当行的宽度改变时expand row的大小也要随之改变
		setExpandRowSize : function(){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var render = gid+" .datagrid-view2";
			//var scolspan = self.getColumnList().length - opt.lockColumns.length;
			var scolspan = $("#view2-datagrid-header-inner-htable-tbody-"+opt.id).find('td[field]').size();
			var w = $("#view2-datagrid-header-inner-htable-tbody-"+opt.id).find(".datagrid-header-row")._outerWidth();
			$(render).find(".datagrid-row-expand").each(function(i){
				var rowId = $(this).attr("datagrid-expand-row-index");
				$(this).find(">td:first").attr("colspan",scolspan)._outerWidth(w);
				self._addExpandView1Row(rowId);
				self.resetExpandRowHeight(rowId);
			});
		},
		resetExpandRowHeight : function(rid){
			var self = this,
				opt = self.configs;	
			var _expand_id = $("#"+opt.id+"-expand-row-"+rid);
			var _expand_view1_id = $("#"+opt.id+"-expand-view1-row-"+rid);
			if( _expand_view1_id.size() ) {
				_expand_view1_id._outerHeight( _expand_id._outerHeight() );	
			}
		},
		isExpandRowShow : function(rowId){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var _expand_id = opt.id+"-expand-row-"+rowId;
			
			return ( $("#"+_expand_id).size() && !$("#"+_expand_id).is(":hidden") ) ? true : false;
		},
		_addExpandView1Row : function(rowId){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var obj1 = $("#"+opt.id+"-view1-row-"+rowId);
				
			var _expand_view1_id = opt.id+"-expand-view1-row-"+rowId;
			
			var td1 = "";
			if( opt.rowNumbersWidth !== false ) {
				td1 = "<td class='datagrid-td-rownumber'><div class='datagrid-cell-view1-expand'></div></td>";
			}
			
			//var tds = opt.lockColumns.length;
			var tds = $("#view1-datagrid-header-inner-htable-tbody-"+opt.id).find('td[field]').size();
			var td2 = "";
			if(tds) {
				td2 = '<td id="'+_expand_view1_id+'_td1" colspan="'+tds+'" class="datagrid-cell-rownumber-expand"></td>';
			}
			
			
			var _tr1 = 	$("#"+_expand_view1_id);
			if( _tr1.size() ) {
				var _td2 = $("#"+_expand_view1_id+"_td1");
				if( _td2.size() ) {
					//_td2.attr("colspan",opt.lockColumns.length);
					_td2.attr("colspan",tds);
				} else {
					if( td2 != "" ) {
						_tr1.append($(td2));	
					}
				}
				return _tr1;
			}
			
			var _tr1 = $("<tr id='"+_expand_view1_id+"' style='overflow:hidden;'  class='datagrid-row datagrid-row-view1' datagrid-expand-row-index='"+rowId+"'>"+td1+td2+"</tr>");
			obj1.after(_tr1);
			
			var _expand_id = opt.id+"-expand-row-"+rowId;
			//IE 6 7下还是无效 
			var h = $("#"+_expand_id).height();
			$("#"+_expand_view1_id).height(h);
			//修正ie 6 7多出1px问题
			if(h != $("#"+_expand_view1_id).height()) {
				var h = $("#"+_expand_view1_id).height();
				$("#"+_expand_view1_id).height( h-1 );
			}
			return _tr1;
		},
		//判断当前expandRow是否已经存在 如果不存在则重新创建,如果存在则显示
		expandRow : function(rowId,html){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
		
			var e = opt.events;
			var rowId = self._undef(rowId,false);
			if(rowId === false) return self;
			if( !opt.expandAble )  return self;
			var html = self._undef(html,"");
			var data = self.getRowData(rowId);
			html = self.tpl(html,data);//可以是模版
			var obj = $("#"+opt.id+"-row-"+rowId);
			var obj1 = $("#"+opt.id+"-view1-row-"+rowId);
			
			if(obj.size()<=0) return self;
			
			var _ep = self.fireEvent('onBeforeExpandRow',[rowId]);
			if( _ep === false ) return _ep;
			
			//var scolspan = self.getColumnList().length - opt.lockColumns.length;
			var scolspan = $("#view2-datagrid-header-inner-htable-tbody-"+opt.id).find('td[field]').size();
			
			var _expand_id = opt.id+"-expand-row-"+rowId;
			var _expand = $("#"+_expand_id);
			
			var w = $("#view2-datagrid-header-inner-htable-tbody-"+opt.id).find("tr.datagrid-header-row")._outerWidth();
			
			if( _expand.size() ) {
				var $_expand_id = $("#"+_expand_id);
				obj.after( $_expand_id );
				$_expand_id.find(">td:first").attr("colspan",scolspan)._outerWidth(w);
			} else {
				var _expand = $("<tr id='"+_expand_id+"' class='datagrid-row-expand' datagrid-expand-row-index='"+rowId+"'><td id='"+_expand_id+"_td' colspan='"+scolspan+"'><div class='datagrid-cell-expand' id='"+_expand_id+"_cell' style='overflow:hidden;'></div></td></tr>");
				//判断html是否纯文字或者是选择器or标签
				try {
					if( typeof html == 'object' ) {
						_expand.find("div.datagrid-cell-expand").append( $(html) );
					} else {
						_expand.find("div.datagrid-cell-expand").html( html );
					}
				} catch(e) {
					_expand.find("div.datagrid-cell-expand").html( html );	
				}
				obj.after(_expand);	
				_expand.find(">td:first")._outerWidth(w);
			}
			
			
			var _expand_view1 = self._addExpandView1Row(rowId);
			
			if( self.isRowHidden(rowId) ) {
				_expand.hide();
				_expand_view1.hide();
			} else {
				_expand.show();
				_expand_view1.show();
			}
			//var h = _expand.height();
			//_expand_view1.css({ height:h });
			
			self.fireEvent('onExpandRow',[rowId]);
			
			//self.fireEvent('onViewSizeChange',[]);
			//self.resetViewSize();
			self.methodInvoke("resetViewSize");
		},
		_hideExpandRow : function(rowId){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var rowId = typeof rowId === 'undefined' ? false : rowId;
			if(rowId === false) return self;
			
			var _expand_id = opt.id+"-expand-row-"+rowId;
			var _expand_view1_id = opt.id+"-expand-view1-row-"+rowId;
			
			//$("#"+_expand_id).remove();
			//$("#"+_expand_view1_id).remove();
			
			$("#"+_expand_id).hide();
			$("#"+_expand_view1_id).hide();
			
			self.fireEvent('onHideExpandRow',[rowId]);
		},
		hideExpandRow : function(rowId){
			var self = this;
			
			self._hideExpandRow(rowId);
			
			//self.fireEvent('onViewSizeChange',[]);
			self.resetViewSize();
		},
		destroyExpandRow : function(rowId){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var rowId = typeof rowId === 'undefined' ? false : rowId;
			if(rowId === false) return self;
			
			var _expand_id = opt.id+"-expand-row-"+rowId;
			var _expand_view1_id = opt.id+"-expand-view1-row-"+rowId;
			
			$("#"+_expand_id).remove();
			$("#"+_expand_view1_id).remove();
			
			//self.fireEvent('onViewSizeChange',[]);
			//self.resetViewSize();
			self.methodInvoke('resetViewSize');
		},
		updateExpandRow : function(rowId,html){
			var self = this;
			self.destroyExpandRow( rowId );
			self.expandRow( rowId,html );
		},
		changeExpandPos : function(){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			$("#view2-datagrid-body-btable-tbody-"+opt.id).find(".datagrid-row-expand").each(function(i){
				if( !$(this).is(":hidden") ) {
					var rowId = $(this).attr("datagrid-expand-row-index");
					self.expandRow(rowId,"");
				}
			});
		},
		//当数据中包含 _expand _openExpand=true的时候调用
		autoExpand : function(){
			var self = this;
			var opt = self.configs;
			
			if( !opt.autoExpand ) {
				return;	
			}
		
			var tr = $(">tr.datagrid-row","#view2-datagrid-body-btable-tbody-"+opt.id);	
			self.showLoading();
			setTimeout(function(){
				tr.each(function(){
					var data = $(this).data('rowData');	
					var rid = $(this).attr('datagrid-rid');	
					if( $.isPlainObject(data) && ('_expand' in data) && ('_openExpand' in data) && data['_openExpand'] ) {
						//self._denyEvent = true;
						self.lockMethod("resetViewSize")
						self.expandRow(rid,data['_expand']);
						self.unLockMethod("resetViewSize")
						//self._denyEvent = false;
						//self.denyEventInvoke("expandRow",[rid,html]);
	
					}
				});	
				self.hideLoading();
				if( tr.size() ) {
					self.methodInvoke("resetViewSize");
				}
			},0);
		}
	}); 
})(jQuery);