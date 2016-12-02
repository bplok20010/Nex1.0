/*
jquery.nexButton.js
http://www.extgrid.com/button
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱

*/

;(function($){
	"use strict";
	var button = Nex.widget('button');
	$.nexButton = $.extButton = button;
	button.extend({
		version : '1.0',
		getDefaults : function(opt){
			var _opt = {
				prefix : 'nexbutton-',
				renderTo : document.body,
				width : 0,
				height : 0,
				isIE : !!window.ActiveXObject,
				url : '',//无效 不支持支持远程创建 返回数据格式  json
				cache : true,
				autoFocus : false,
				dataType : 'json',
				queryParams : {},
				method : 'get',
				parames : {},
				type : 'button',// type button file
				name : '',//file时使用
				splitBtn : false,
				toggleBtn : false,
				pressed : false,
				plain : false,
				skin : 'nex-btn-skin-default',//按钮主题
				cls : '',
				pressedCls : '',
				activeCls : '',
				overCls : '',
				focusCls : '',
				disabledCls : '',
				cssText : '',
				iconCls : '',
				disabled : false,
				callBack : $.noop,
				toggleHandler : $.noop,
				icon : '',
				text : '',
				views : {},
				menuConf : {},
				menu : [],
				events : {
					onStart : $.noop,
					onCreate : $.noop,
					onSizeChange : $.noop,
					onDestroy : $.noop
				}
			};
			
			var _opt = this.extSet(_opt);
			
			return $.extend({},_opt,opt);
		}
	});
	$.nexButton.fn.extend({
		_init : function(opt) {
			var self = this;
			
			self.createButton();
			
			self.fireEvent('onCreate');
		},
		createButton : function(){
			var self = this;
			var opt = self.configs;
			
			var method = opt.type+'Create';
			var bindEvent = opt.type+'BindEvent';
			
			var tpl = '';
			
			if( method in self ) {
				var r = self[method].call(self);
				if( r === false ) return false;
			
				if( bindEvent in self ) {
					self[bindEvent].call(self);
				} else {
					self.commonEvent();
				}
			} else {
				self.commonCreaet();
				if( bindEvent in self ) {
					self[bindEvent].call(self);
				} else {
					self.commonEvent();
				}
			}
			self.fireEvent('onCreate',[]);
			return true;
		},
		commonCreaet : function(){
			var self = this;
			var opt = self.configs;
			
			var render = $(opt.renderTo);
			
			var method = opt.type + 'Tpl';
			
			var _bg = '';
			if( opt.icon ) {
				_bg = "background-image:url("+opt.icon+")";
			}
			var icon = [];
			if( opt.icon || opt.iconCls ) {
				icon = ['<span class="nex-btn-inner nex-btn-icon ',opt.iconCls,'" style="',_bg,'"></span>'];
			}
			var text = [];
			if( opt.text != '' ) {
				text = ['<span class="nex-btn-inner nex-btn-text" style="">',opt.text,'</span>'];
			}
			var sep = [];
			if( opt.splitBtn ) {
				sep = ['<span class="nex-btn-inner nex-btn-sep"></span>'];		
			}
			var arrow = [];
			if( opt.menu.length || opt.splitBtn ) {
				arrow=['<span class="nex-btn-inner nex-btn-arrow"></span>'];
			}
			//hidefocus="true"
			var buttons = [
				'<span class="nex-btn ',opt.skin,' ','nex-btn-',opt.type,' ',opt.plain ? 'nex-btn-plain' : '',arrow.length>0?' nex-btn-split' : ' ',' ',opt.cls,'" id="',opt.id,'"','href="javascript:void(0);" ','><span class="nex-btn-wraper">',
				icon.join(""),
				text.join(""),
				sep.join(""),
				arrow.join(""),
				'</span></span>'
			];
			
			var btn = $(buttons.join(""));
			opt.views['button'] = btn;
			render.append( btn );
		},
		commonEvent : function(){
			var self = this;
			var opt = self.configs;
			var callBack = function(type,e){
				var r = true;
				r = self.fireEvent(type,[ this,e ]);
				if( r === false ) {
					e.stopPropagation();
					e.preventDefault();
				}
			};
			var events = {
				'focus' : function(e) {
					callBack.call(this,'onFocus',e);
				},
				'blur' : function(e) {
					callBack.call(this,'onBlur',e);
				},
				'click' : function(e) {
					callBack.call(this,'onClick',e);
				},
				'dblclick' : function(e) {
					callBack.call(this,'onDblClick',e);
				},
				'keydown' : function(e) {
					callBack.call(this,'onKeyDown',e);
				},
				'keyup' : function(e) {
					callBack.call(this,'onKeyUp',e);
				},
				'keypress' : function(e){
					callBack.call(this,'onKeyPress',e);
				},
				'mouseenter' : function(e){
					callBack.call(this,'onMouseOver',e);
				},
				'mouseleave' : function(e){
					callBack.call(this,'onMouseOut',e);
				},
				'mousedown' : function(e) {
					callBack.call(this,'onMouseDown',e);
				},
				'mouseup' : function(e) {
					callBack.call(this,'onMouseUp',e);
				},
				'contextmenu' : function(e){	
					callBack.call(this,'onContextMenu',e);
				}
			};
			
			var input = opt.views['button'];//$("#"+opt.id);
			
			input.attr( {
				tabIndex : Nex.aid++	//可触发onFocus		   
			} );
			
			input.bind(events);
			
			if( opt.splitBtn ) {
				$(".nex-btn-arrow",input).bind({
					'click' : function(e){
						if( opt.disabled ) return false;
						self.fireEvent('onSplitBtnClick',[ this,e ]);	
						return false;
					},
					'mousedown' : function(e){
					//	return false;	
					}
				});
			}
		},
		focus : function(){
			var self = this,
				opt = self.configs;
			var btn = opt.views['button'];
			btn.focus();
		},
		blur : function(){
			var self = this,
				opt = self.configs;
			var btn = opt.views['button'];
			btn.blur();
		},
		_setFocus : function(){
			var self = this,
				opt = self.configs;
			if( opt.autoFocus ) {
				clearTimeout( opt._ft );
				opt._ft = setTimeout(function(){
					self.focus();	
				},0);
			}
		},
		_setFoucsCls : function(btn){
			var self = this,
				opt = self.configs,
				btn = $(btn);
			btn.addClass("nex-btn-focus");
			$('>.nex-btn-wraper',btn).addClass("nex-btn-wraper-focus");	
			if( opt.focusCls ) {
				btn.addClass( opt.focusCls );	
			}
		},
		_unsetFoucsCls : function(btn){
			var self = this,
				opt = self.configs,
				btn = $(btn);
			btn.removeClass("nex-btn-focus");
			$('>.nex-btn-wraper',btn).removeClass("nex-btn-wraper-focus");		
			if( opt.focusCls ) {
				btn.removeClass( opt.focusCls );	
			}
		},
		_sysEvents : function(){
			var self = this;
			var opt = self.configs;
			self.bind("onCreate.file",self._setFile,self);
			self.bind("onCreate.over",self._setFocus,self);
			self.bind("onCreate.over",self.toggleBtnCls,self);
			self.bind("onCreate.over",self._onCreate,self);
			self.bind("onFocus.focus",self._setFoucsCls,self);
			self.bind("onBlur.focus",self._unsetFoucsCls,self);
			self.bind("onMouseDown.focus",self._setFoucsCls,self);
			self.bind("onMouseUp.focus",self._unsetFoucsCls,self);
			self.bind("onMouseOver.over",self.onMouseOver,self);
			self.bind("onMouseOut.over",self.onMouseOut,self);
			self.bind("onClick.click",self._click,self);
			self.bind("onClick.menu",self._showMenu,self);
			self.bind("onSplitBtnClick.menu",self._showSplitMenu,self);
			return self;
		},
		getFileName : function(){
			var self = this;
			var opt = self.C();	
			return $('#'+opt.id+'-btn-file').val();
		},
		_setFile : function(){
			var self = this;
			var opt = self.C();	
			if( opt.type.toLowerCase() != 'file' ) return;
			var btn = opt.views['button'];//self.getDom();
			var name = opt.name == '' ? opt.id+'_file' : opt.name;
			$('#'+opt.id+'-btn-file').remove();
			var file = $('<input id="'+opt.id+'-btn-file" hideFocus=true class="nex-btn-file-input" type="file" size="1" name="'+name+'" />');
			var wrap = btn.find('>span.nex-btn-wraper');
			
			var isIE67 = function(){
				if(navigator.userAgent.indexOf("MSIE 6.0")>0) 
				{ 
					return true;
				} 
				else if(navigator.userAgent.indexOf("MSIE 7.0")>0)  
				{ 
					return true;
				} 
				return false;
			}
			if( isIE67() ) {
				wrap.height( wrap._height() );
			}
			
			wrap.append( file );
			file.height( wrap._outerHeight() );
			file.bind( 'change',function(e){
				self.fireEvent('onFileChange',[ this,$(this).val(),e ]);	
			} );
		},
		_showMenu : function(btn,e){
			var self = this;
			var opt = self.configs;
			var btn = $(btn);
			if( opt.menu.length && !opt.splitBtn ) {
				
				if( btn.hasClass('nex-btn-active') ) {
					btn.removeClass('nex-btn-active');
					if( opt.activeCls ) {
						btn.removeClass(opt.activeCls);	
					}
					if( self._menu ) {
						self._menu.hideRoot();	
					}	
				} else {
					btn.addClass('nex-btn-active');
					if( opt.activeCls ) {
						btn.addClass(opt.activeCls);	
					}
					self._menu = new Nex.menu($.extend(opt.menuConf,{data:opt.menu},{
						onClick : function(obj,tid,data,e){
							btn.removeClass('nex-btn-active');		
							self.fireEvent('onItemClick',[ obj,tid,data,e ]);	
						}								   
					}));	
					var _menu = self._menu.createMenu();
					$(_menu).showAt({ el:btn,xAlign:'left',yAlign:'bottom' });
					setTimeout(function(){
						$(document).one("mousedown",function(){
							btn.removeClass('nex-btn-active');								 
							self._menu.hideRoot();								 
						});					
					},0);
				}
			}
		},
		_showSplitMenu : function(btn,e){
			var self = this;
			var opt = self.configs;
			var _btn = opt.views['button'];//$("#"+opt.id);
			
			if( !opt.splitBtn ) return;
			
			var splitBtn = $('.nex-btn-arrow',_btn);
			if( splitBtn.hasClass('nex-btn-arrow-active') ) {
				splitBtn.removeClass('nex-btn-arrow-active');
				_btn.removeClass('nex-btn-active');
				if( opt.activeCls ) {
					_btn.removeClass(opt.activeCls);	
				}
				if( self._menu ) {
					self._menu.hideRoot();	
				}
			} else {
				splitBtn.addClass('nex-btn-arrow-active');
				_btn.addClass('nex-btn-active');
				if( opt.activeCls ) {
					_btn.addClass(opt.activeCls);	
				}
				self._menu = new Nex.menu($.extend(opt.menuConf,{data:opt.menu},{
					onClick : function(obj,tid,data,e){
						splitBtn.removeClass('nex-btn-arrow-active');
						_btn.removeClass('nex-btn-active');
						if( opt.activeCls ) {
							_btn.removeClass(opt.activeCls);	
						}	
						self.fireEvent('onItemClick',[ obj,tid,data,e ]);	
					}								   
				}));
				var _menu = self._menu.createMenu();	
				$(_menu).showAt({ el:_btn,xAlign:'left',yAlign:'bottom' });	
				setTimeout(function(){
					$(document).one("mousedown",function(){
						splitBtn.removeClass('nex-btn-arrow-active');
						_btn.removeClass('nex-btn-active');
						if( opt.activeCls ) {
							_btn.removeClass(opt.activeCls);	
						}								 
						self._menu.hideRoot();								 
					});					
				},0);
			}
		},
		_onCreate : function(){
			this.disabled( this.C('disabled') );	
		},
		onMouseOver : function(btn,e){
			var self = this,
				opt=this.configs;
			var btn = $(btn);
			btn.addClass("nex-btn-over");
			$('>.nex-btn-wraper',btn).addClass("nex-btn-wraper-over");
			if( opt.overCls ) {
				btn.addClass( opt.overCls );	
			}
		},
		onMouseOut : function(btn,e){
			var self = this,
				opt=this.configs;
			var btn = $(btn);
			btn.removeClass("nex-btn-over");
			$('>.nex-btn-wraper',btn).removeClass("nex-btn-wraper-over");
			if( opt.overCls ) {
				btn.removeClass( opt.overCls );	
			}
		},
		toggleBtnCls : function(){
			var self = this,
				opt=this.configs;	
			var btn = opt.views['button'];//$("#"+opt.id);
			if( opt.pressed ) {
				btn.addClass("nex-btn-pressed");
				$('>.nex-btn-wraper',btn).addClass("nex-btn-wraper-pressed");
				if( opt.pressedCls ) {
					btn.addClass( opt.pressedCls );	
				}
			} else {
				btn.removeClass("nex-btn-pressed");
				$('>.nex-btn-wraper',btn).removeClass("nex-btn-wraper-pressed");	
				if( opt.pressedCls ) {
					btn.removeClass( opt.pressedCls );	
				}
			}	
		},
		_click : function(btn,e){
			var self = this,
				opt=this.configs;
			if( opt.disabled ) {
				return;	
			}
			
			opt.callBack.call(self,btn,e);
			
			if( opt.toggleBtn ) {
				opt.pressed = !opt.pressed;
				self.toggleBtnCls();
				opt.toggleHandler.call(self,opt.pressed,opt);	
			}
			
		},
		disabled : function(m){
			var self = this,
				opt=this.configs,
				undef;
			var m = m === undef ? false : m;
			var btn = opt.views['button'];//$("#"+opt.id);
			opt.disabled = !!m;
			if( m ) {
				btn.addClass('nex-btn-disabled');
				$('>.nex-btn-wraper',btn).addClass("nex-btn-wraper-disabled");
				if( opt.disabledCls ) {
					btn.addClass(opt.disabledCls);	
				}
			} else {
				btn.removeClass('nex-btn-disabled');	
				$('>.nex-btn-wraper',btn).removeClass("nex-btn-wraper-disabled");
				if( opt.disabledCls ) {
					btn.removeClass(opt.disabledCls);	
				}
			}
			return true;
		}
	});
	/*
	*添加xtype
	*/
	if( Nex.Manager ) {
		/*Nex.Manager.addXtype('button',function(opt){
			new Nex.button(opt);									   
		});	*/
	}
})(jQuery);