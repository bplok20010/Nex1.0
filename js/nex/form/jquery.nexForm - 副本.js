/*
jquery.extGrid.js
http://www.extgrid.com/form.ui
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱

每个组件都应该提供或实现的接口 不提供则调用默认函数
组件名+Start
组件名+Create 必须
组件名+BindEvent 必须
组件名+Tpl
组件名+GetValue
组件名+SetValue
组件名+ValueChange
组件名+Extend
组件名+SizeChange
组件名+Disabled
组件名+Enable
组件名+Destroy
*/

;(function($){
	"use strict";
	var form = Nex.widget('form');

	$.nexForm = $.nexForm = form;
	
	form.extend({
		version : '1.0', 
		list : {},
		get : function(name,group){
			var self = this;
			
			var group = self._undef( group , 'default' );
			
			var ls = [];
			
			var list = self.list;
			if( group in list ) {
				for( var x=0;x<list[group].length;x++ ) {	
					var l = list[group][x];
					
					if( l === null ) continue;
					
					//同时判断当前对象是否存在
					if( !$( "#"+l.self.C('id') ).length ) {
						l.self._destroy();
						list[group][x] = null;
						continue;
					}
					
					if( l.name == name ) {
						ls.push(l.self);	
					}
				}
			}
			return ls.length == 1 ? ls[0] : ls;
		},
		getVal : function(name,group){
			var self = this;
			var obj = self.get.apply(self,arguments);
			var val = [];
			if( $.isArray(obj) ) {
				$.each(obj,function(){
					var _val = this.val();
					if( _val != '' ) {
						val.push( _val );	
					}
				});
				return val.join(",");	
			} else {
				return obj.val();		
			}
			return null;
		},
		setVal : function(value,name,group){
			var self = this;
			var obj = self.get.apply(self,[arguments[1],arguments[2]]);
			var val = [];
			if( $.isArray(obj) ) {
				$.each(obj,function(){
					this.val(value);
				});
				return true;
			} else {
				obj.val(value);		
				return true;
			}
			return null;
		},
		//获取某分组下的所有值
		getGroupVal : function(group){
			var self = this;
			var group = self._undef( group , 'default' );	
			var list = self.list;
			var data = {};
			if( group in list ) {
				for( var x=0;x<list[group].length;x++ ) {
					var l = list[group][x];
					if( l === null ) continue;
					data[ l.name ] = $.nexForm.getVal( l.name,group );
				}	
			}	
			return data;
		},
		//验证是否通过，并返回错误的字段name
		checkGroup : function(group) {
			var self = this;
			var group = self._undef( group , 'default' );	
			var list = self.list;
			var errorList = [];
			var r;
			if( group in list ) {
				//for( var x in list[group] ) {
				for( var x=0;x<list[group].length;x++ ) {
					var l = list[group][x];
					if( l === null ) continue;
					r = l.self.checkVal();
					if( r === false ) {
						errorList.push(l.name);	
					}
				}	
			}
			return errorList.length ? errorList : true;
		},
		//验证是否通过
		valid : function(group){
			var self = this;
			var r = self.checkGroup(group);
			return r === true ? true : false;
		},
		//验证某一元素
		checkElement : function( name,group ){
			var self = this;
			var obj = self.get.apply( self,arguments );
			if( $.isArray(obj) ) {
				obj = obj[0];
			}
			return obj.checkVal();
		},
		getDefaults : function(opt){
			var _opt = {
				prefix : 'nexform',
				padding : 4,
				label : '',
				labelCls : '',
				display : 'inline-block',
				group : 'default',//分组
				name : '',
				value : '',
				url : '',//支持远程创建 返回数据格式  json
				dataType : 'json',
				method : 'get',
				parames : {},
				validator : Nex.formValid || {},
				rules : [],
				messages : {},
				error : 'valid-error',
				items : [],//{cls:'',name:'abs',value:'45',readOnly:false,disabled:false,selected:true,attrs:''} or '|' ',' ';'
				_item :　{
					cls:'',
					name:'',
					value:'',
					readOnly:false,
					disabled:false,
					selected:false,
					attrs:''
				},
				leftText : '',
				rightText : '',
				width : 150,
				height : 60,//textarea
				step : 1,//spinner,
				smax : null,//spinner,
				smin : null,//spinner,
				type : 'text',
				onCheck : ['onBlur','onPaste'],//什么时候进行数据验证
				disabled : false,
				readOnly : false,
				cls : '',
				attrs : '',//用户自定义属性
				_oldVal : '',
				events : {
					onStart : $.noop,
					onCreate : $.noop,
					onSizeChange : $.noop,
					onClick : $.noop,
					onFocus : $.noop,
					onBlur : $.noop,
					onKeyDown : $.noop,
					onKeyUp : $.noop,
					onKeyPress : $.noop,
					onMouseOver : $.noop,
					onMouseOut : $.noop,
					onPaste : $.noop,
					onSpinnerUp : $.noop,
					onSpinnerDown : $.noop,
					onBeforeSet : $.noop,
					onAfterSet : $.noop,
					onBeforeGet : $.noop,
					onAfterGet : $.noop,
					onChange : $.noop,
					onValidError : $.noop,
					onValidSuccess : $.noop,
					onDestroy : $.noop
				}
			};
			
			var _opt = this.extSet(_opt);
			
			return $.extend({},_opt,opt);
		}
		
	});
	$.nexForm.fn.extend({
		_init : function(opt) {
			var self = this;
			opt.type = opt.type.toLowerCase();
			
			if( opt.url ) {
				self.getConf();//获取远程配置后创建
			} else {
				self.create();
			}
			
		},
		addList : function(){
			var self = this;
			var opt = self.configs;
			var list = $.nexForm.list;
			if( opt.group in list ) {
				list[ opt.group ].push( {
					name : opt.name,
					'self' : self
				} );	
				
			} else {
				list[ opt.group ] = [];
				list[ opt.group ].push( {
					name : opt.name,
					'self' : self
				} );
			}
		},
		//获取周围可显示空间
		getShowSpace : function(){
			var self = this;
			var opt = self.configs;
			//需要获取的对象
			var obj = $("#"+opt.id);
			
			//获取窗口显示区域大小
			var cw = $(window).width();
			var ch = $(window).height();
			
			var offset = obj.offset();
			
			//获取滚位置
			var sLeft = $(window).scrollLeft();
			var sTop = $(window).scrollTop();
			
			var space = {
				top : offset.top - sTop,
				left : offset.left - sLeft
			};
			space.bottom = ch - space.top - obj.outerHeight();
			space.right = cw - space.left - obj.outerWidth();
			return space;
			
		},
		
		_sysEvents : function(){
			var self = this;
			var opt = self.configs;
			
			
			self.bind("onCreate",self.onCreate,self);
			self.bind("onCreate",self.addList,self);
			//self.bind("onCreate",self.loadPuglins,self);
			self.bind("onCreate",self.onDisabled,self);
			
			self.bind("onMouseOver",self.onMouseOver,self);
			self.bind("onMouseOut",self.onMouseOut,self);
			self.bind("onBeforeGet",self.onBeforeGet,self);
			self.bind("onAfterGet",self.onBeforeGet,self);
			self.bind("onBeforeSet",self.onBeforeSet,self);
			self.bind("onAfterSet",self.onAfterSet,self);
			self.bind("onChange",self.onChange,self);
			self.bind("onValidError",self.onValidError,self);
			self.bind("onValidSuccess",self.onValidSuccess,self);
			for(var i=0;i<opt.onCheck.length;i++ ) {
				var s = self.bind(opt.onCheck[i],self.onCheck,self);	
			}
			return self;
		},
		
		
		onValidError : function(){
			var self = this;
			var opt = self.configs;
			$("#"+opt.id).removeClass(opt.error);
			$("#"+opt.id).addClass(opt.error);
		},
		onValidSuccess : function(){
			var self = this;
			var opt = self.configs;
			$("#"+opt.id).removeClass(opt.error);
		},
		onCreate : function(){
			var self = this;
			var opt = self.configs;
			var method = opt.type + 'Extend';
			if( method in self ) {
				self[method].call(self);
			}
		},
		onStart : function(){
			var self = this;
			var opt = self.configs;
			
			opt.cls += ' form-'+opt.type+'-ui form-'+opt.group+'-ui ';
			
			if(opt.disabled){
				opt.attrs += 'disabled';
			}
			if(opt.readOnly){
				opt.attrs += ' readOnly ';
			}
			if(opt.display != 'inline-block'){
				opt.display = ' display:'+opt.display+'; ';
			}
			
			var method = opt.type + 'Start';
			if( method in self ) {
				self[method].call(self);
			}
		},
		onDisabled : function(){
			var self = this;
			var opt = self.configs;
			if( opt.disabled ) {
				self.disabled();
				$("#"+opt.id).addClass('form-'+opt.type+'-ui-disabled');
			}
		},
		//自动销毁时调用
		_destroy : function(){
			var self = this;
			var opt = self.configs;
			
			var method = opt.type+'Destroy';
			if( method in self ) {
				self[method].apply(self,[]);
			}
			self.fireEvent("onDestroy");
			return self;
		},
		setSize : function(w,h){
			var self = this;
			var opt = self.configs;
			var w = self._undef(w,opt.width);
			var h = self._undef(h,opt.height);
			
			opt.width = w;
			
			/*var method = opt.type+'SetSize';
			if( method in self ) {
				self[method].apply(self,[w,h]);
				return;
			}*/
			
			var text = $("#"+opt.id+"_text");
			var input = $("#"+opt.id+"_input");
			var buttons = $(">span.ui-form-buttons",text).first();
			text._outerWidth( w );
			var lw = 0;
			if( buttons.length ) {
				lw = buttons._outerWidth();
			}
			input._outerWidth( w - lw );
			
			$("#"+opt.id)._outerHeight( $("#"+opt.id+"_box")._outerHeight() );
			
			self.fireEvent("onSizeChange",[w,h,opt]);
		},
		resize : function(w,h){
			var self = this;
			var opt = self.configs;
			self.setSize(w,h);
		},
		onMouseOver : function(t,e){
			var self = this;
			var opt = self.configs;
			if( opt.disabled || opt.readOnly ) {
				return;	
			}
			$(t).closest("span.ui-form-input")
			.addClass('ui-form-over');
		},
		onMouseOut : function(t,e){
			var self = this;
			var opt = self.configs;
			if( opt.disabled || opt.readOnly ) {
				return;	
			}
			$(t).closest("span.ui-form-input")
			.removeClass('ui-form-over');
		},
		onBeforeGet : function(){
				
		},
		onAfterGet : function(){
			
		},
		onBeforeSet : function(){
			var self = this;
			var opt = self.configs;
			opt._oldVal = opt._oldVal === null ? self.val() : opt._oldVal;
		},
		onAfterSet : function(){
			var self = this;
			var opt = self.configs;
			var newVal = self.val();
			if( opt._oldVal != newVal && opt._oldVal!==null ) {
				opt._oldVal = null;
				self.fireEvent('onChange',[]);	
			}
		},
		onCommonChange : function(){
			var self = this;
			var opt = self.configs;
			var input = $("#"+opt.id+"_input");
			if( !input.length || !input.is(":input") ) {
				return self;	
			}
			
			var input_key = $("#"+opt.id+"_input_key");
			if( !input_key.length || !input_key.is(":input") ) {
				return self;	
			}
			
			input_key.val( input.val() );
			return self;	
		},
		onChange : function(){
			var self = this;
			var opt = self.configs;
			var method = opt.type+'ValueChange';
			if( method in self ) {
				self[method].apply(self,[]);	
			} else {
				self.onCommonChange.apply(self,[]);
			}
		},
		onCheck :　function(){
			var self = this;
			var opt = self.configs;	
			self.checkVal();
		},
		commonDisabled : function(){
			var self = this;
			var opt = self.configs;
			var input = $("#"+opt.id+"_input");
			if( !input.length ) {
				var text = $("#"+opt.id+"_text");
				var obj = text.find("input[name="+opt.name+"]");
				//radio
				if( obj.is(":radio") ) {
					obj.each(function(){
						$(this).attr('disabled',true);	  
					});
				} else if( obj.is(":checkbox") ) {//checkbox
					obj.each(function(){
						$(this).attr('disabled',true);	  
					});
				}
				
			} else {
				input.attr('disabled',true);	  
			}
			return self;	
		},
		disabled : function(){
			var self = this;
			var opt = self.configs;
			var method = opt.type + 'Disabled';
			if( method in self ) {
				self[method].call(self);
			} else {
				self.commonDisabled();
			}
		},
		commonEnable : function(){
			var self = this;
			var opt = self.configs;
			var input = $("#"+opt.id+"_input");
			if( !input.length ) {
				var text = $("#"+opt.id+"_text");
				var obj = text.find("input[name="+opt.name+"]");
				//radio
				if( obj.is(":radio") ) {
					obj.each(function(){
						$(this).attr('disabled',false);	  
					});
				} else if( obj.is(":checkbox") ) {//checkbox
					obj.each(function(){
						$(this).attr('disabled',false);	  
					});
				}
				
			} else {
				input.attr('disabled',false);	  
			}
			return self;	
		},
		enable : function(){
			var self = this;
			var opt = self.configs;
			var method = opt.type + 'Enable';
			if( method in self ) {
				self[method].call(self);
			} else {
				self.commonEnable();
			}	
			$("#"+opt.id).removeClass('form-'+opt.type+'-ui-disabled');
		},
		commonReadOnly : function( flag ){
			var self = this;
			var opt = self.configs;
			var input = $("#"+opt.id+"_input");
			if( !input.length ) {
				var text = $("#"+opt.id+"_text");
				var obj = text.find("input[name='"+opt.name+"']");
				//radio
				if( obj.is(":radio") ) {
					obj.each(function(){
						$(this).attr('readonly',flag);	  
					});
				} else if( obj.is(":checkbox") ) {//checkbox
					obj.each(function(){
						$(this).attr('readonly',flag);	  
					});
				}
				
			} else {
				input.attr('readonly',flag);	  
			}
			return self;	
		},
		readOnly : function( flag ){
			var self = this;
			var opt = self.configs;
			
			var flag = typeof flag == 'undefined' ? true : flag;
			
			var method = opt.type + 'ReadOnly';
			if( method in self ) {
				self[method].call(self,flag );
			} else {
				self.commonReadOnly( flag  );
			}	
			$("#"+opt.id).removeClass('form-'+opt.type+'-ui-readonly');
		},
		getInput : function(){
			var self = this;
			var opt = self.configs;
			var input = $("#"+opt.id+"_input");
			return input;
		},
		getInputKey : function(){
			var self = this;
			var opt = self.configs;
			var input = $("#"+opt.id+"_input_key");
			return input;
		},
		"focus" : function(){
			var self = this;
			self.getInput().focus();
		},
		"select" : function(){
			var self = this;
			self.getInput().select();
		},
		"blur" : function(){
			var self = this;
			self.getInput().blur();
		},
		checkVal : function(){
			var self = this;
			var opt = self.configs;
			var r = true;
			var rules = opt.rules;
			var validator = opt.validator;
			var rule;
			var value = self.val();
			//var value = $.nexForm.getVal( opt.name,opt.group );
			var checkList = {};//验证函数
			if( $.isArray( rules ) && rules.length ) {
				for( var x=0;x<rules.length;x++ ) {
					rule = rules[x];
					if( $.isFunction(rule) ) {
						//r = rule.call(self,value);
						checkList[x] = rule;
					} else if( $.isPlainObject(rule) ){
						for(var i in rule ) {
							if( $.isFunction( rule[i] ) ) {
								//r = rule[i].call(self,value);
								checkList[i] = rule[i];
							}else if( i in validator.methods ) {
								//r = validator.methods[i].call(self,value,rule[i]);
								checkList[i] = { method : i,params : rule[i] };
							}
						}
					} else {
						if( rule in validator.methods ) {
							//r = validator.methods[rule].call(self,value);
							checkList[rule] = rule;
						}
					}
				}
			} else if( typeof rules == 'string' ) {
				if( rule in validator.methods ) {
					//r = validator.methods[rule].call(self,value);
					checkList[rule] = rule;
				}	
			}
			for( rule in checkList ) {
				if( $.isFunction( checkList[rule] ) ) {
					r = checkList[rule].call( self,value );
					if( r === false) break;
				} else if( $.isPlainObject(checkList[rule]) ) {
					if( checkList[rule].method in validator.methods ) {
						r = validator.methods[ checkList[rule].method ].call(self,value,checkList[rule].params);
						if( r === false) break;
					}	
				} else {
					if( rule in validator.methods ) {
						//r = validator.methods[rule].call(self,value);
						r = validator.methods[rule].call(self,value);
						if( r === false) break;
					}	
				}
			}
			
			if( r === false ) {
				var errorMsg = opt.messages[rule] || validator.messages[rule] || rule;
				self.fireEvent("onValidError",[errorMsg]);	
			} else {
				self.fireEvent("onValidSuccess",[]);		
			}
			
			return r;
		},
		//获取数据
		val : function(){
			var self = this;
			var opt = self.configs;
			
			//设置当前值
			if( arguments.length ) {
				self.fireEvent('onBeforeSet',[]);	
				var method = opt.type+'SetValue';
				if( method in self ) {
					self[method].apply(self,arguments);	
				} else {
					self.commonSetValue.apply(self,arguments);
				}
				self.fireEvent('onAfterSet',[]);	
				return self;
			}
			
			var value = '';
			
			self.fireEvent('onBeforeGet',[]);	
			
			var method = opt.type+'GetValue';
			if( method in self ) {
				value = self[method].call(self);	
			} else {
				value = self.commonGetValue();
			}
			
			self.fireEvent('onAfterGet',[]);	
			
			return value;
		},
		//根据type创建控件
		create : function(){
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
				}
			} else {
				self.commonCreaet();
				if( bindEvent in self ) {
					self[bindEvent].call(self);
				} else {
					self.commonEvent();
				}
			}
			self.setSize();
			self.fireEvent('onCreate',[opt.helper]);
			return true;
		},
		commonCreaet : function(){
			var self = this;
			var opt = self.configs;
			
			var target = opt.helper;
			
			var render = $(opt.renderTo);
			
			var wraper = $( self.tpl(opt.type.toString()+'Tpl',opt) );
			
			if( render.length ) {
				render.append( wraper );
			} else {
				target.after( wraper ).remove();
			}
			opt.helper = wraper;	
		},
		commonEvent : function(){
			var self = this;
			var opt = self.configs;
			
			var events = {
				'click' : function(e) {
					
					var r = self.fireEvent('onClick',[ this,e ]);	
					if( r === false ) return false;
					
				},
				'focus' : function(e) {
					
					$(this).closest("span.ui-form-input")
						   .addClass('ui-form-focus');
					
					var r = self.fireEvent('onFocus',[ this,e ]);	
					if( r === false ) return false;
					
				},
				'blur' : function(e) {
					var val = $(this).val();
					
					$(this).closest("span.ui-form-input")
						   .removeClass('ui-form-focus');
					
					var r = self.fireEvent('onBlur',[ this,e ]);	
					if( r === false ) return false;
					
				},
				'keydown' : function(e) {
					opt._oldVal = opt._oldVal === null ? $(this).val() : opt._oldVal;
					
					var r = self.fireEvent('onKeyDown',[ this,e ]);	
					if( r === false ) return false;
					
				},
				'keyup' : function(e) {
					var val = $(this).val();
					if( opt._oldVal != val && opt._oldVal!==null ) {
						
						var r = self.fireEvent('onChange',[ this,opt._oldVal,val,e ]);	
						opt._oldVal =null;
						if( r === false ) return false;
					}
					
					var r = self.fireEvent('onKeyUp',[ this,e ]);	
					if( r === false ) return false;
					
					
				},
				'keypress' : function(e){
					
					var r = self.fireEvent('onKeyPress',[ this,e ]);	
					if( r === false ) return false;
					
				},
				'mouseenter' : function(e){
					
					var r = self.fireEvent('onMouseOver',[ this,e ]);	
					if( r === false ) return false;
					
				},
				'mouseleave' : function(e){
					
					var r = self.fireEvent('onMouseOut',[ this,e ]);	
					if( r === false ) return false;
				
				},
				'change' : function(e){
					var r = self.fireEvent('onChange',[ this,e ]);	
					if( r === false ) return false;	
				},
				'paste' : function(e){
					var r = self.fireEvent('onPaste',[ this,e ]);	
					if( r === false ) return false;
				}
			};
			
			var input = $("#"+opt.id+"_input");
			
			input.bind(events);
			
			var text = $("#"+opt.id+"_text");
			
			text.bind("click",function(){
				//return false;						   
			});
			
			$(">span.ui-form-buttons",text).bind({
				click : function(e){
					var r = self.fireEvent('onClick',[ input,e ]);	
					if( r === false ) return false;
				},
				'mouseenter' : function(e){
					
					var r = self.fireEvent('onMouseOver',[ input,e ]);	
					if( r === false ) return false;
					
				},
				'mouseleave' : function(e){
					
					var r = self.fireEvent('onMouseOut',[ input,e ]);	
					if( r === false ) return false;
				
				}							 
			});
			
		},
		//通用获取
		commonGetValue : function(){
			var self = this;
			var opt = self.configs;
			var input = $("#"+opt.id+"_input_key");
			
			var value = '';
			
			if( !input.length ) {
				input = $("#"+opt.id+"_input");	
			}
			
			if( !input.length ) {
				var text = $("#"+opt.id+"_text");
				var obj = text.find("input[name='"+opt.name+"']");
				//radio
				if( obj.is(":radio") ) {
					value = text.find(":radio[name='"+opt.name+"']:checked").val();
				} else if( obj.is(":checkbox") ) {//checkbox
					value = [];
					text.find(":checkbox[name='"+opt.name+"']:checked").each(function(){ 
						value.push( $(this).val() ); 
					})
					value = value.join(",");
				}
				
			} else {
				if( input.is(":input") )
					value = input.val();	
			}
			return $.trim(value);
		},
		//通用设置
		commonSetValue : function(){
			var self = this;
			var opt = self.configs;
			var input = $("#"+opt.id+"_input");
			var input_key = $("#"+opt.id+"_input_key");	
			
			input.val(arguments[0]);
			input_key.val(arguments[0]);
			
			return self;
		},
		textTpl :　function(d){
			if( !d ) return "";
			var self = this,
				opt = self.configs;
			var text = [];
			text.push('<span ui-form-group="'+d.group+'" style="'+d.display+'" class="ui-form-wraper '+d.cls+'" id="'+d.id+'">');
				text.push('<label for="'+d.id+'_input" class="ui-form-label '+d.labelCls+'">'+d.label+'</label>');
				text.push('<span class="ui-form-span ui-form-left-text">'+d.leftText+'</span>');
				text.push('<span class="ui-form-box" id="'+d.id+'_box">');
					text.push('<span class="ui-form-input ui-form-text" id="'+d.id+'_text" style=" width:0px;">');
						text.push('<input  style=" width:0px" '+d.attrs+' id="'+d.id+'_input"  type="text" value="'+d.value+'" />');
						text.push('<span class="ui-form-buttons"></span>');
					text.push('</span>');
				text.push('</span>');
				text.push('<span class="ui-form-span ui-form-right-text">'+d.rightText+'</span>');
				text.push('<span class="ui-form-clear"></span>');
			text.push('</span>');
			return text.join("");
		},
		comboTpl :　function(d){
			if( !d ) return "";
			var self = this,
				opt = self.configs;
			var text = [];
			text.push('<span ui-form-group="'+d.group+'" style="'+d.display+'" class="ui-form-wraper '+d.cls+'" id="'+d.id+'">');
				text.push('<label for="'+d.id+'_input" class="ui-form-label '+d.labelCls+'">'+d.label+'</label>');
				text.push('<span class="ui-form-span ui-form-left-text">'+d.leftText+'</span>');
				text.push('<span class="ui-form-box" id="'+d.id+'_box">');
					text.push('<span class="ui-form-input ui-form-text" id="'+d.id+'_text" style=" width:0px;">');
						text.push('<input style=" width:0px" '+d.attrs+'  id="'+d.id+'_input" type="text" value="'+d.value+'" /><input type="hidden" name="'+opt.name+'" id="'+d.id+'_input_key" value="'+d.value+'" />');
						text.push('<span class="ui-form-buttons">');
							text.push('<span class="ui-form-buttons-'+d.type+'">');
								text.push('<span class="ui-form-buttons-'+d.type+'-icon"></span>');			
							text.push('</span>');	
						text.push('</span>');
					text.push('</span>');
				text.push('</span>');
				text.push('<span class="ui-form-span ui-form-right-text">'+d.rightText+'</span>');
				text.push('<span class="ui-form-clear"></span>');
			text.push('</span>');
			return text.join("");
		},
		spinnerTpl : function(d){
			if( !d ) return "";
			var self = this,
				opt = self.configs;
			var text = [];
			text.push('<span ui-form-group="'+d.group+'" style="'+d.display+'" class="ui-form-wraper '+d.cls+'" id="'+d.id+'">');
				text.push('<label for="'+d.id+'_input" class="ui-form-label '+d.labelCls+'">'+d.label+'</label>');
				text.push('<span class="ui-form-span ui-form-left-text">'+d.leftText+'</span>');
				text.push('<span class="ui-form-box" id="'+d.id+'_box">');
					text.push('<span class="ui-form-input ui-form-text" id="'+d.id+'_text" style=" width:0px;">');
						text.push('<input style=" width:0px" '+d.attrs+' id="'+d.id+'_input" type="text" value="'+d.value+'" /><input type="hidden" name="'+opt.name+'" id="'+d.id+'_input_key" value="'+d.value+'" />');
						text.push('<span class="ui-form-buttons">');
						
							text.push('<span class="ui-form-buttons-'+d.type+'">');
								text.push('<span class="ui-form-buttons-'+d.type+'-icon">');
									text.push('<span class="ui-form-'+d.type+'-up"></span>');	
									text.push('<span class="ui-form-'+d.type+'-down"></span>');	
								text.push('</span>');
							text.push('</span>');		
								
						text.push('</span>');
					text.push('</span>');
				text.push('</span>');
				text.push('<span class="ui-form-span ui-form-right-text">'+d.rightText+'</span>');
				text.push('<span class="ui-form-clear"></span>');
			text.push('</span>');
			return text.join("");
		
		},
		spinnerBindEvent : function(){
			var self = this,
				opt = self.configs;
			self.commonEvent();
			var text = $("#"+opt.id+"_text");
			$("span.ui-form-spinner-up",text).bind({
				click : function(e){
					self.fireEvent('onSpinnerUp',[]);
					self.fireEvent('onChange',[]);
					return false;
				},
				'mouseenter' : function(e){
					
					$(this).addClass('ui-form-spinner-up-over');
					
				},
				'mouseleave' : function(e){
					
					$(this).removeClass('ui-form-spinner-up-over');
				
				}	
			});
			$("span.ui-form-spinner-down",text).bind({
				click : function(e){
					self.fireEvent('onSpinnerDown',[]);
					self.fireEvent('onChange',[]);
					return false;
				},
				'mouseenter' : function(e){
					
					$(this).addClass('ui-form-spinner-down-over');
					
				},
				'mouseleave' : function(e){
					
					$(this).removeClass('ui-form-spinner-down-over');
				
				}	
			});
			return self;
		},
		radioSetValue : function(val){
			var self = this;
			var opt = self.configs;
			
			if( !arguments.length )  return self;
			
			var text = $("#"+opt.id+"_text");
			$(":radio[name='"+opt.name+"']",text).each(function(){
				$(this).removeAttr("checked");
				if( val == $(this).val() ) {
					$(this).attr("checked",'true');	
				}
			});
			
			return self;
		},
		radioTpl : function(d){
			if( !d ) return "";
			var self = this,
				opt = self.configs;
			var text = [];
			text.push('<span ui-form-group="'+d.group+'" style="'+d.display+'" class="ui-form-wraper '+d.cls+'" id="'+d.id+'">');
				text.push('<label for="'+d.id+'_input" class="ui-form-label '+d.labelCls+'">'+d.label+'</label>');
				text.push('<span class="ui-form-span ui-form-left-text">'+d.leftText+'</span>');
				text.push('<span class="ui-form-box" id="'+d.id+'_box">');
					text.push('<span class="ui-form-input ui-form-text" id="'+d.id+'_text" style=" width:0px;">');
						var items = opt.items;
						for(var i=0;i<items.length;i++) {
							if( !$.isPlainObject( items[i] ) ) {
								if( self.inArray( items[i] , [ '|',',',';' ] )!=-1 ) {
									text.push('<span class="ui-form-clear"></span>');	
								}
								continue;
							}
							items[i] = $.extend(true,{},opt._item,items[i]);
							if(items[i].disabled){
								items[i].attrs += 'disabled';
							}
							if(items[i].readOnly){
								items[i].attrs += ' readOnly ';
							}
							if(items[i].selected){
								items[i].attrs += ' checked ';
							}
							var str = '<span class=" ui-form-radio '+items[i].cls+'"><input id="'+opt.id+'_'+i+'" type="radio" value="'+items[i].name+'" name="'+opt.name+'" '+items[i].attrs+' ><label class = " ui-form-radio-label " for="'+opt.id+'_'+i+'">'+items[i]['value']+'</label></span>';
							text.push(str);
						}
						text.push('<span class="ui-form-buttons"></span>');
					text.push('</span>');
				text.push('</span>');
				text.push('<span class="ui-form-span ui-form-right-text">'+d.rightText+'</span>');
				text.push('<span class="ui-form-clear"></span>');
			text.push('</span>');
			return text.join("");
		},
		radioBindEvent : function(){
			var self = this;
			var opt = self.configs;
			var text = $("#"+opt.id+"_text");
			var radios = text.find(":radio[name='"+opt.name+"']");
			if( !radios.length ) {
				return self;
			}
			var events = {
				click : function(e) {
					var r = self.fireEvent('onClick',[ this,e ]);	
					if( r === false ) return false;
				}	
			};
			radios.bind(events);
		},
		radioCreate : function(){
			var self = this;
			var opt = self.configs;
			var target = opt.helper;
			
			var wraper = $( self.tpl(opt.type,opt) );
			
			var render = $(opt.renderTo);
			if( render.length ) {
				render.append( wraper );
			} else {
				target.after( wraper ).remove();
			}
			
			opt.helper = wraper;
		},
		checkboxSetValue : function(val){
			var self = this;
			var opt = self.configs;
			
			if( !arguments.length )  return self;
			
			var text = $("#"+opt.id+"_text");
			
			val = val.split(",");
			
			$(":checkbox[name='"+opt.name+"']",text).each(function(){
				$(this).removeAttr("checked");
				if( self.inArray( $(this).val(),val ) != -1 ) {
					$(this).attr("checked",'true');	
				}
			});
			
			return self;
		},
		checkboxTpl : function(d){
			if( !d ) return "";
			var self = this,
				opt = self.configs;
			var text = [];
			text.push('<span ui-form-group="'+d.group+'" style="'+d.display+'" class="ui-form-wraper '+d.cls+'" id="'+d.id+'">');
				text.push('<label for="'+d.id+'_input" class="ui-form-label '+d.labelCls+'">'+d.label+'</label>');
				text.push('<span class="ui-form-span ui-form-left-text">'+d.leftText+'</span>');
				text.push('<span class="ui-form-box" id="'+d.id+'_box">');
					text.push('<span class="ui-form-input ui-form-text" id="'+d.id+'_text" style=" width:0px;">');
						var items = opt.items;
						for(var i=0;i<items.length;i++) {
							if( !$.isPlainObject( items[i] ) ) {
								if( self.inArray( items[i] , [ '|',',',';' ] )!=-1 ) {
									text.push('<span class="ui-form-clear"></span>');	
								}
								continue;
							}
							items[i] = $.extend(true,{},opt._item,items[i]);
							if(items[i].disabled){
								items[i].attrs += 'disabled';
							}
							if(items[i].readOnly){
								items[i].attrs += ' readOnly ';
							}
							if(items[i].selected){
								items[i].attrs += ' checked ';
							}
							var str = '<span class=" ui-form-checkbox '+items[i].cls+'"><input id="'+opt.id+'_'+i+'" type="checkbox" value="'+items[i].name+'" name="'+opt.name+'" '+items[i].attrs+' ><label class = " ui-form-radio-label " for="'+opt.id+'_'+i+'">'+items[i]['value']+'</label></span>';
							text.push(str);
						}
						text.push('<span class="ui-form-buttons"></span>');
					text.push('</span>');
				text.push('</span>');
				text.push('<span class="ui-form-span ui-form-right-text">'+d.rightText+'</span>');
				text.push('<span class="ui-form-clear"></span>');
			text.push('</span>');
			return text.join("");
		},
		checkboxBindEvent : function(){
			var self = this;
			var opt = self.configs;
			var text = $("#"+opt.id+"_text");
			var checkbox = text.find(":checkbox[name='"+opt.name+"']");
			if( !checkbox.length ) {
				return self;
			}
			var events = {
				click : function(e) {
					self.fireEvent('onChange',[]);	
					var r = self.fireEvent('onClick',[ this,e ]);	
					if( r === false ) return false;
				}	
			};
			checkbox.bind(events);
		},
		checkboxCreate : function(){
			var self = this;
			var opt = self.configs;
			var target = opt.helper;
			
			var wraper = $( self.tpl(opt.type.toString(),opt) );
			
			var render = $(opt.renderTo);
			if( render.length ) {
				render.append( wraper );
			} else {
				target.after( wraper ).remove();
			}
			
			opt.helper = wraper;
		},
		textareaTpl : function(d){
			if( !d ) return "";
			var self = this,
				opt = self.configs;
			var text = [];
			text.push('<span ui-form-group="'+d.group+'" style="'+d.display+'" class="ui-form-wraper '+d.cls+'" id="'+d.id+'">');
				text.push('<label for="'+d.id+'_input" class="ui-form-label '+d.labelCls+'">'+d.label+'</label>');
				text.push('<span class="ui-form-span ui-form-left-text">'+d.leftText+'</span>');
				text.push('<span class="ui-form-box" id="'+d.id+'_box">');
					text.push('<span class="ui-form-input ui-form-text" id="'+d.id+'_text" style=" width:0px;">');
						text.push('<textarea id="'+d.id+'_input"  style=" width:0px; height:'+parseFloat(opt.height)+'px;" '+d.attrs+' name="'+opt.name+'">'+d.value+'</textarea>');
					text.push('</span>');
				text.push('</span>');
				text.push('<span class="ui-form-span ui-form-right-text">'+d.rightText+'</span>');
				text.push('<span class="ui-form-clear"></span>');
			text.push('</span>');
			return text.join("");
		},
		textareaBindEvent : function(){
			var self = this;
			self.commonEvent();
		},
		textareaCreate : function(){
			var self = this;
			var opt = self.configs;
			var target = opt.helper;
			
			var wraper = $( self.tpl(opt.type.toString(),opt) );
			
			var render = $(opt.renderTo);
			if( render.length ) {
				render.append( wraper );
			} else {
				target.after( wraper ).remove();
			}
			
			opt.helper = wraper;
		},
		getConf : function(){
			var self = this,
				opt = self.configs;
			var success = function(data){
						if( $.isPlainObject( data ) ) {
							opt = $.extend(opt,data);	
						}
						self.create();
					};
			var error = function(xmlHttp){
						self.create();
					};
			if( $.isFunction(opt.url) ) {
				opt.url.call(self,success,error);
			} else {
				$.ajax({
					url : opt.url,
					type : opt.method,
					dataType : opt.dataType,
					data : opt.queryParams,
					success : success,
					error : error
				});
			}
		},
		//清空
		reLoad :　function(){
			var self = this,
				opt = self.configs;
			//清空注册事件
			var events = opt.events;
			for( var x in events ) {
				events[x] = $.noop;	
			}
			self.init.call(self,opt);
			return self;
		}
	});
	

	
	$.fn.extform = function(_opt){
		if(this.size()<=0){
			//alert('容器不正确');
			return false;
		}
		var list = [];
		this.each(function(i){
			var self = $(this);
			
			var attrs = {
				type : $(this).attr('type'),	
				value : $(this).attr('value'),
				name : $(this).attr('name'),
				//width : $(this).attr('width'),
				//height : $(this).attr('height'),
				cls : $(this).attr('class'),
				rules : eval($(this).attr('rules') || '[]'),
				attrs : $(this).attr('attrs') || '',
				label : $(this).attr('label') || '',
				display : $(this).attr('display') || 'inline-block',
				group : $(this).attr('group') || 'default',
				disabled : $(this).attr('disabled'),
				readOnly : $(this).attr('readOnly')
			};
			var attrs2 = {};
			if( $(this).attr('data-options') ) {
				var attrs2 = eval('({'+$(this).attr('data-options')+'})');
			}
			
			var opt = $.extend(true,{},attrs,attrs2,_opt);

			opt.selector = self.selector;
			opt.helper = self;
			
			var extform = new $.nexForm(opt);
			
			list.push(extform);
		});
		
		if( this.size() == 1 ) {
			return list[0];
		} else {
			return list	;
		}
	};
	
})(jQuery);