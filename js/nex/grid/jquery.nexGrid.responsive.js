/*
自适应插件
jquery.extgrid.responsive.js
v1.0
开启参数 : responsive=true|false,默认false 

http://www.extgrid.com
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱
*/

;(function($){
	"use strict";
	//参数
	$.nexGrid.addExtConf({
						 responsive : false,
						 responsiveWin : false
						 });
	//事件
	$.nexGrid.addExtEvent({
						 //...
						 });
	function _responsive() {
		var self = this;
		var responsive = self.C("responsive");
		var target = self.configs.renderTo;
		if( responsive ) {
			//修正IE6下overflow:visible 无效问题
			//http://aspektas.com/blog/ie6-overflowvisible-bug/
			var isIE=!!window.ActiveXObject;
			var isIE6=isIE&&!window.XMLHttpRequest;
			if( isIE6 ) {
				target.css("overflow","hidden");
			}
			if( target.is("body") || self.C("responsiveWin") ) {
				$(window).resize(function(e){
					self.resize();					  
				});	
				setTimeout(function(){
					$(window).resize();				
				},0);
			} else {
				var t;
				t = setInterval(function(){
					self.resize();	
				},100);
			}
		}
	}
	function responsive(){
		var self = this;
		self.unbind("onFinish.responsive");
		self.bind("onFinish.responsive",_responsive,self);
	}
	$.nexGrid.puglins.push(responsive);
})(jQuery);