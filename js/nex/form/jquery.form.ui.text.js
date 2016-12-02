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
	var textInit = function(){
		var self = this;
		var opt = self.configs;
		var isText = opt.helper.is(":text");
		if( isText ) {
			opt.type='text';		
		}
	};
	$.extForm.puglins.push(textInit);
})(jQuery);