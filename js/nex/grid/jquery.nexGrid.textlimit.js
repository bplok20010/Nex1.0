/*
jquery.extGrid.search.js
http://www.extgrid.com
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱

+----------------------------------------------------------------------------------------------------------------------------+
*/

;(function($){
	"use strict";
	$.nexGrid.fn.extend({	 
		textLimit : function(text,width,fontSize) {
			var self = this;
			var opt = self.configs;
			var text = $.nexGrid._undef(text,"");
			if(text == "") return text;
			text = new String(text);
			var _t = $("<div style='position:absolute;left:-1000px;'></div>");
			_t.appendTo(document.body);
			_t.css({'fontSize':fontSize});
			
			var len = text.length;
			var _text = "";
			var _i = 0;
			for(var i=1;i<=len;i++) {
				_text = text.substr(0,i);
				_t.html( _text + opt.textLimitDef );
				if( parseFloat(_t.width()) < parseFloat(width) ) {
					_i = i;
				} else {
					break;	
				}
			}
			
			_t.remove();
			
			if(_i == 0) {
				text = text.substr(0,1) + opt.textLimitDef;
			} else if(_i == len) {
				text = text;	
			} else {
				text = text.substr(0,_i) + opt.textLimitDef;
			}
			return text.toString();
		},
		setGridHeaderTextLimit : function(){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var render = gid;
			
			if(!opt.textLimit) 
				return false;
			
			var fields = opt.columns;	
			
			var i = 0,
				len = fields.length;
			for(;i<len;i++) {
				if(fields[i]['textLimit'] === false) continue;
				var f = $(render).find(".datagrid-header-row td[field='"+fields[i]['field']+"']").find("div.datagrid-cell");
				var w = f.width(); // 注意 此处的width 包含了sort 图标,如果需要精确 那么就要减掉 sort-icon 大概12px
				var fs = f.css("fontSize");
				var text = self.getColumnData( fields[i]['field'],'title' );
				text = self.textLimit( text , w , fs );
				f.find("span").first().html( text );
			}	
		},
		setGridBodyTextLimit : function(field,data){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var render = gid;
			
			if(!opt.textLimit) 
				return false;
			
			if(typeof field === 'undefined') {
				var data = opt.data;
				var fields = opt.columns;
				var i = 0,
					len = fields.length;
				for(;i<len;i++) {
					if(fields[i]['textLimit'] === false) continue;
					
					var f = $(render).find(".datagrid-view2 .datagrid-body td[field='"+fields[i]['field']+"']");//.find("div.datagrid-cell");
					
					f.each(function(idx){
						var rid = $(this).parent().attr("datagrid-rid");
						var data = self.getRowData(rid);
						var value = $(this).find("div.datagrid-cell").html();
						
						if( typeof data[ fields[i]['index'] ] === 'undefined' ) {
							self.setRowData(rid,fields[i]['index'],value);
						}
						//value = data[ fields[i]['field'] ];//注意
						value = data[ fields[i]['index'] ];
						
						var w = $(this).find("div.datagrid-cell").width();
						var fs = $(this).find("div.datagrid-cell").css("fontSize");
						var text = value;
						
						text = self.textLimit( text , w , fs );
						
						$(this).find("div.datagrid-cell").html( text );
						
					});
				}
			} else if( arguments.length == 2 ){//
				var tr = field;
				var fields = opt.columns;
				var textLimitFields = [];//那些字段需要字符剪切
				var rowId = tr.attr('datagrid-rid');
				var data = data;
				var value = '';
				var i = 0,
					len = fields.length;
				for(;i<len;i++) {
					if(fields[i]['textLimit'] === false) continue;
					//value = $.dataGrid._undef(data[ fields[i]['field'] ],"");
					value = $.nexGrid._undef(data[ fields[i]['index'] ],"");
					if(value == "") continue;
					var td_cell = tr.find("td[field='"+fields[i]['field']+"'] div.datagrid-cell");
					var w = td_cell.width();
					var fs = td_cell.css("fontSize");
					var text = value;
					
					text = self.textLimit( text , w , fs );
						
					td_cell.html( text );
				}
			} else {
				var textLimit = self.getColumnData(field,'textLimit');
				if( textLimit ) {
					var f = $(render).find("tr.datagrid-row td[field='"+field+"']");//.find("div.datagrid-cell");
					
					var index = self.getColumnData(field,'index');
					
					f.each(function(idx){
						var rid = $(this).parent().attr("datagrid-rid");
						var data = self.getRowData(rid);
						var value = $(this).find("div.datagrid-cell").html();
						
						if( typeof data[ index ] === 'undefined' ) {
							self.setRowData(rid,index,value);
						}
						//value = data[ field ];//注意
						value = data[ index ];//注意
						
						var w = $(this).find("div.datagrid-cell").width();
						var fs = $(this).find("div.datagrid-cell").css("fontSize");
						var text = value;
						
						text = self.textLimit( text , w , fs );
						
						$(this).find("div.datagrid-cell").html( text );
						
					});	
				}
			}
		}
	}); 
})(jQuery);