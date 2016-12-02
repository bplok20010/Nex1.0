/*
jquery.extGrid.sort.js
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
						 	sortName : '',
							sortOrder : 'asc'
						 });
	//事件
	$.nexGrid.addExtEvent({
						   onBeforeSortColumn:$.noop,
						   onSortData:$.noop,
						   onSortColumn:$.noop
						 });
	
	$.nexGrid.puglins.push(function(){
		var self = this,
			opt = self.configs;
		//防止重复绑定	
		self.unbind("onColumnClick.sort");
		self.unbind("onGetGridData.sort");
		self.unbind("onHeaderCreate.sort");
		
		//事件绑定
		self.bind("onColumnClick.sort",self._sortColumn);
		self.bind("onHeaderCreate.sort",self._setSortIcon);
		self.bind("onGetGridData.sort",self._sortData);
	});
	$.nexGrid.fn.extend({
		_sortColumn : function(field,td,e){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var field = field || false;
			if(field == false) return;
			//设置列是否可排序
			var sortable = self.getColumnData(field,'sortable');
			if( !sortable ) {
				return;
			} else {
				var _s = $(".datagrid-sort-icon",td);
				if( !_s.size() ) {
					$("div.datagrid-cell",td).append($('<span class="datagrid-sort-icon">&nbsp;</span>'));
				}
			}
			
			opt.sortName = field;
			
			var v2 = $('#view2-datagrid-header-inner-htable-tbody-'+opt.id).find("div.datagrid-cell");
			var v1 = $('#view1-datagrid-header-inner-htable-tbody-'+opt.id).find("div.datagrid-cell");
			var hcell = $("div.datagrid-cell",td);
			 if( hcell.hasClass('datagrid-sort-asc') ) {
				v2.removeClass('datagrid-sort-desc datagrid-sort-asc');
				v1.removeClass('datagrid-sort-desc datagrid-sort-asc');
				hcell.addClass('datagrid-sort-desc');
				opt.sortOrder = 'desc';
			 } else {
				v2.removeClass('datagrid-sort-desc datagrid-sort-asc');
				v1.removeClass('datagrid-sort-desc datagrid-sort-asc');
				hcell.addClass('datagrid-sort-asc');	 
				opt.sortOrder = 'asc';
			 };
			 
			 self.refreshData();
		},
		_sortData : function( successBack,errorBack,async ){
			var self = this,
				opt = self.configs;
			if( opt.sortName=='' ) {
				return;
			}
			var sortField = opt.sortName;
			var _c = self.getColumnData(sortField);
			if( _c === null ) {
				opt.sortName = '';
				return;
			}
			var sortable = _c['sortable'];
			if( !sortable ) return;
			var index = _c['index'];
			
			var data = self.getData();
			var r = self.fireEvent("onBeforeSortColumn",[sortField,data,opt.sortOrder,successBack,errorBack,async]);
			if( r === false ) return r;
			
			if(async) {
				opt.cacheData['source'] = self.sortData();		
			} else {
				opt.queryParams.sortName = index;
				opt.queryParams.sortOrder = opt.sortOrder;	
			}	
			self.fireEvent("onSortColumn",[sortField,data,opt.sortOrder]);
		},
		_setSortIcon : function(){
			var self = this,
				opt = self.configs;	
			if( opt.sortName=='' ) {
				return;
			}
			var sortField = opt.sortName;
			
			var _c = self.getColumnData(sortField);
			if( _c === null ) {
				opt.sortName = '';
				return;
			}
			
			var sortable = _c['sortable'];
			if( !sortable ) return;
			//设置默认排序列
			var hcell = $("#view2-datagrid-header-inner-htable-tbody-"+opt.id).find(">tr.datagrid-header-row td[field='"+sortField+"']")
																  			  .find("div.datagrid-cell");
				var _s = $(".datagrid-sort-icon",hcell);
				if( !_s.size() ) {
					hcell.append($('<span class="datagrid-sort-icon">&nbsp;</span>'));
				}
				hcell.addClass('datagrid-sort-'+opt.sortOrder.toLowerCase());
		},
		//清空排序缓存
		clearSort : function(){
			var self = this,
				opt = self.configs;		
			opt.sortName = '';
			delete opt.queryParams.sortName;
			delete opt.queryParams.sortOrder;
		},
		//对数据进行排序,返回排序后的结果，不支持中文排序 可对没显示字段进行排序
		sortData : function(field,data,type) {//对field列进行排序 type = asc type= desc
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var field = self._undef(field,opt.sortName);
			if( field == '' ) return self;
			
			var fields = opt.columns;
			var _field = false;
			var index = false;
			
			for(var i=0;i<fields.length;i++) {
				if( fields[i]['field'] == field ) {
					_field = field;
					index = fields[i]['index'];
					break;	
				}
			}
			if( _field === false ) return self;
			//排序处理
			opt.cacheData['source'] = opt.cacheData['source'] || opt.data;
			var data = self._undef(data,opt.cacheData['source']);
			var type = self._undef(type,opt.sortOrder);
			var isAsc = type == "asc" ? true : false;
			
			data.sort(function(a,b){
				a[index] = self._undef(a[index],"");
				b[index] = self._undef(b[index],"");
				if( a[index] >  b[index] ) {
					return isAsc ? 1 : -1;
				} if( a[index] === b[index] ){
					return -1;
				} else {
					return isAsc ? -1 : 1;
				}
				/*if( a[index] >=  b[index]) return isAsc ? 1 : -1;
				return isAsc ? -1 : 1;*/
			});
			
			self.fireEvent("onSortData",[index,data,type]);
			
			return data;
		}				 
	}); 
})(jQuery);