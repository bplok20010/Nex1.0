/*
jquery.nexTree.checkbox.js
http://www.extgrid.com
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱
+----------------------------------------------------------------------------------------------------------------------------+
*/

;(function($){
	"use strict";
	$.fn.toTree = function(cfg){//如果url='' 只能处理简单的table比如 表头不会包含的合并之类
		var undef;
		cfg = Nex.tree._undef(cfg,{});
		var list = [];
		var _tree = new Nex.tree();
		var ifield = _tree.C();
		var list = [];
		this.each(function(i){
						   
			if( $(this).attr( 'data-options' ) ) {
				var opt = "{"+ $(this).attr( 'data-options' ) +"}";
				opt = eval("("+opt+")");
			} else {
				var opt = {};	
			}
			$.extend(opt,cfg);
			opt.cls = $(this).attr("class");
			var _attrs = $.extend({},ifield,opt);
			var fields = {};
			for( var _p in _attrs ) {
				if(/[a-zA-z0-9]Field$/.test(_p)) {
					fields[_p] = _attrs[_p];	
				}	
			}
			var nodes = [];
			//遍历ul
			var map_node = function(ul,parent){
				$(">li",$(ul)).each(function(i){
					var d = {};
					var li = $(this);
					for( var f in fields ) {
						if( f === 'childrenField' ) continue;
						var field = fields[f];
						if( li.attr(field) === undef || !li.attr(field).toString().length ) continue;
						d[fields[f]] = li.attr(fields[f]);
					}
					d[fields['textField']] = $.trim(li.find(">span").html());
					
					if( parent !== undef ) {
						parent.children = parent.children === undef ? [] : parent.children;
						parent.children.push(d);
					}
					var _ul = $(">ul",li);
					if( _ul.length ) {
						map_node(_ul,d);	
					}
					if( parent === undef ) {
						nodes.push(d);	
					}
				});
				
			};
			map_node( $(this) );
			opt.data = nodes;
			if( opt.renderTo && $(opt.renderTo).length ){
				var tree = $(opt.renderTo).nexTree(opt);
				$(this).remove();
			} else {
				var wid = 'wtree'+Nex.aid++;
				var wraper = $("<div id='"+wid+"'></div>").appendTo(document.body);
				var tree = wraper.nexTree(opt);
				list.push(tree);
				$(this).after(wraper);
				$(this).remove();
				$("#"+tree.C('id')).unwrap();
			}
		});
		return list.length === 1? list[0] : list;
	};
})(jQuery);