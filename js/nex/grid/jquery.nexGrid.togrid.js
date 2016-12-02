/*
jquery.extGrid.togrid.js
http://www.extgrid.com
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱
必须显示设置高度
+----------------------------------------------------------------------------------------------------------------------------+
*/

;(function($){
	"use strict";
	$.fn.togrid = function(cfg,_cfg){//如果url='' 只能处理简单的table比如 表头不会包含的合并之类的
		
		cfg = $.nexGrid._undef(cfg,{});
		var _cfg = $.nexGrid.getToGridOptions(_cfg);
		
		var list = [];
		
		this.each(function(i){
			$(this).css('display','block').show();
			
			//table options 获取
			if( $(this).attr( _cfg.options_from ) ) {
				var opt = "{"+ $(this).attr( _cfg.options_from ) +"}";
				opt = eval("("+opt+")");
			} else {
				var opt = {};	
			}
			
			var wh = {
					width : $(this).outerWidth(),
					height : $(this).outerHeight(),
					title : $(this).attr("title")
				};

			var columns = [];
			
			if( !$(this).find(_cfg.columns_from).size() ) {
				_cfg.columns_from = 'tr:first td,tr:first th';
			}
			
			var thead = $(this).find(_cfg.columns_from);
			var avg_w = 0;
			if( cfg.border !== false || opt.border !== false ) {
				avg_w = 2/thead.size();
			}
			thead.each(function(i){
				//忽略 ignore 的 th td
				if( $(this).attr("ignore") != undefined ) {
					return;	
				}
				//column options 获取
				if( $(this).attr( 'field' ) ){
					var column_a = {field:$(this).attr( 'field' )};	
				} else {
					var column_a = {};	
				}
				if( $(this).attr( _cfg.options_from ) ) {
					var column_b = "{"+$(this).attr( _cfg.options_from )+"}";	
					column_b = eval("("+ column_b +")");
				} else {
					var column_b = {};	
				}
				var column = $.extend({},column_b,column_a);
				column.title = $(this).html();
				column.field = column.field ? column.field : "field_"+Nex.aid++;//(Math.floor(Math.random() * 999999));
				column.width = column.width ? column.width : $(this).outerWidth()- 1 - 1;
				//column.width -= $.dataGrid.padding;
				if( $(this).attr('align') ) {
					column.align = $(this).attr('align') ;
				}
				if( column.field == "ck") {//系统字段
					opt.checkBox = 	true;
				}
				if( column.field == "ed") {//系统字段
					//wh.editColumn = true;
				}
				columns.push(column);
			});
			$(this).find(_cfg.columns_from).parent("tr").remove();
			
			if( !$(this).find(_cfg.data_from).size() ) {
				_cfg.data_from = 'tr';
			}
			opt.columns = columns;
			
			var $tfoot = $(this).find(_cfg.footdata_from);
			if( $tfoot.size() ) {
				opt.showFooter = true;	
			}
			
			opt = $.extend(true,wh,opt,cfg);
			
			if( $tfoot.size() ) {
				var footerData = [];
				$tfoot.each(function(i){
					var _d = {};
					$(this).find(">td,>th").each(function(i){
						var data = $(this).html();
						if( !$(this).attr("field") ) {
							if( opt.columns[i]['field'] )
								_d[ opt.columns[i]['field'] ] = data;
						} else {
							_d[ $(this).attr("field") ] = data;	
						}
					});
					footerData.push(_d);		
				});
				$tfoot.remove();
				opt.footerData = footerData;
			}
			
			//判断data数据的来源
			if(!opt.url) {//获取表格数据
				var data = [];
				$(this).find( _cfg.data_from ).each(function(i){
					var _d = {};
					$(this).find(">td,>th").each(function(i){
						var data = $(this).html();
						if( !$(this).attr("field") ) {
							if( opt.columns[i]['field'] )
								_d[ opt.columns[i]['field'] ] = data;
						} else {
							_d[ $(this).attr("field") ] = data;	
						}
					});
					data.push(_d);		
				});
				
				opt.data = data;
			}
			
			opt.renderTo = $("<div id='"+ ($(this).attr('id') ? $(this).attr('id') : '')+"' class='nex-datagrid-wraper "+ $(this).attr('class') +"'></div>");
			
			$(this).hide().after(opt.renderTo).remove();
			
			var grid = new $.nexGrid(opt);
			
			opt.renderTo.data('metaData',opt);	
			opt.renderTo.data("datagrid",grid);
			
			list.push(grid);
		});
		
		if( this.size() == 1 ) {
			return list[0];
		} else {
			return list	;
		}
	};
	$.fn.toGrid = $.fn.togrid;
})(jQuery);