/*
jquery.extGrid.select.js
http://www.extgrid.com/form.ui
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱

maxHeight:number
maxWidth: number|'auto'
multi : false | true 多选

每个组件都应该提供或实现的接口
组件名+Start
组件名+Create 必须
组件名+BindEvent 必须
组件名+Tpl
组件名+GetValue
组件名+SetValue
组件名+ValueChange
组件名+Extend

*/

;(function($){
	"use strict";
	var radioInit = function(){
		var self = this;
		var opt = self.configs;
		var isRadio = opt.helper.is(":radio");
		if( isRadio ) {
			opt.type='radio';
			opt.onCheck.push("onChange");
			if( !opt.items.length ) {
				var items = [];
				var value = '';
				var label = $("label[for='"+opt.helper.attr("id")+"']");
				if( label.length ) {
					value = label.html();
					label.remove();
				} else if( typeof opt.helper.attr("label") != 'undefined' ) {
					value = opt.helper.attr("label");	
				}
				
				items.push({
					name : opt.helper.val(),
					value : value,
					disabled : opt.helper.attr("disabled"),
					selected : opt.helper.attr("checked"),
					readOnly : opt.helper.attr("readonly")
				});
				opt.width = 'auto';
				opt.items = items;
			}
		}
	};
	$.extForm.puglins.push(radioInit);
	$.extForm.fn.extend({
		radioSizeChange : function(width){
			var self = this;
			var opt = self.configs;
			
			var width = $.extForm._undef( width , opt.width );
			var text = $("#"+opt.id+"_text");
			
			text.width( width );
			
			$("#"+opt.id).height( $("#"+opt.id+"_box").outerHeight() );	
		}					
	});
})(jQuery);