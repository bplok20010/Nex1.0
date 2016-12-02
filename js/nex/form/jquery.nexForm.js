/*
jquery.nexForm.js
http://www.extgrid.com/form
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱

每个组件都应该提供或实现的接口 不提供则调用默认函数
组件名+Start
组件名+Init
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

	$.nexForm = $.extForm = form;
	
	form.extend({
		version : '1.0', 
		list : {},
		isExists : function(id){
			if( !$( "#"+id ).length ) {
				return false;
			}	
			return true;
		},
		get : function(name,group){
			var self = this;
			
			var group = self._undef( group , 'default' );
			
			var ls = [];
			
			var list = self.list;
			if( group in list ) {
				
				var fields = list[ group ];
				
				$.each(fields,function(id,l){
					if( l === null ) return;
					//同时判断当前对象是否存在
					if( !self.isExists( l.self.C('id') ) ) {
						l.self._destroy();
						l = null;
						return;
					}
					
					if( l.name+'' === name+'' ) {
						ls.push(l.self);	
					}
				});
				
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
					if( _val !== '' ) {
						val.push( _val );	
					}
				});
				var _v = {};
				var _s = false;
				$.each( val,function(i,value){
					if( $._isPlainObject( value ) ) {
						_s = true;
						$.each( value,function(k,v){
							_v[k] = _v[k] || [];
							_v[k].push( v );					   
						} );	
					} else {
						_v[name] = _v[name] || [];
						_v[name].push( value );
					}			 
				} );
				if( !_s ) {
					val = _v[name].join(',');		
				} else {
					val = _v;	
				}
				return val;	
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
		getGroup : function(group,m){
			var self = this;
			var group = self._undef( group , 'default' );	
			var m = self._undef( m , false );	
			var list = self.list;
			var inputs = [];
			if( group in list ) {
				var fields = list[ group ];
				$.each(fields,function(id,l){
					if( l === null ) return;
					//同时判断当前对象是否存在
					if( !self.isExists( l.self.C('id') ) ) {
						l.self._destroy();
						l = null;
						return;
					}
					
					var isDisabled = l.self.C('disabled');
					if( !m && isDisabled ) {
						return;	
					}
					
					inputs.push( l.self );
				});
			}	
			return 	inputs;
		},
		//获取某分组下的所有值
		/*
		*m 是否获取disabled 字段 默认不获取 false
		*/
		getGroupVal : function(group,m){
			var self = this;
			var group = self._undef( group , 'default' );	
			var m = self._undef( m , false );	
			var list = self.list;
			var data = {};
			if( group in list ) {
				var fields = list[ group ];
				$.each(fields,function(id,l){
					if( l === null ) return;
					//同时判断当前对象是否存在
					if( !self.isExists( l.self.C('id') ) ) {
						l.self._destroy();
						l = null;
						return;
					}
					
					var isDisabled = l.self.C('disabled');
					if( !m && isDisabled ) {
						return;	
					}
					
					var value = Nex.form.getVal( l.name,group );
					if( $._isPlainObject( value ) ) {
						$.extend( data,value );	
					} else {
						data[ l.name ] = value;	
					}
				});
			}	
			return data;
		},
		//验证是否通过，并返回错误的字段name
		/*
		*m 是否验证disabled 字段 默认不验证 false
		*/
		checkGroup : function(group,m) {
			var self = this;
			var group = self._undef( group , 'default' );	
			var m = self._undef( m , false );	
			var list = self.list;
			var errorList = [];
			var r;
			if( group in list ) {
				var fields = list[ group ];
				$.each(fields,function(id,l){
					if( l === null ) return;
					//同时判断当前对象是否存在
					if( !self.isExists( l.self.C('id') ) ) {
						l.self._destroy();
						l = null;
						return;
					}
					
					var isDisabled = l.self.C('disabled');
					if( !m && isDisabled ) {
						return;	
					}
					
					r = l.self.checkVal();
					if( r === false ) {
						errorList.push(l.name);	
					}
				});
			}
			return errorList.length ? errorList : true;
		},
		//验证是否通过
		/*
		*m 是否验证disabled 字段 默认不验证 false
		*/
		valid : function(group,m){
			var self = this;
			var r = self.checkGroup(group,m);
			return r === true ? true : false;
		},
		//验证某一元素
		checkElement : function( name,group ){
			var self = this;
			var obj = self.get.apply( self,arguments );
			obj = $.isArray( obj ) ? obj : [obj];
			var re = true;
			$.each(obj,function(i,input){
				if( !input.checkVal() ) {
					re = false;
				}
			});
			return re;
		},
		getDefaults : function(opt){
			var _opt = {
				prefix : 'nexform-',
				multiSplit : ',',
				labelAlign : 'left',//left top bottom right
				labelText : '',
				renderTo : document.body,
				labelWidth : 80,
				labelCls : '',
				placeholder : '',
				autocomplete : 'off',
				display : 'inline-block',
				group : 'default',//分组
				name : '',
				value : '',
				formater : null,//数据自定义格式 显示作用
				getFormater : null,//数据获取最终控制
				setFormater : null,//数据获取最终控制
				isShiftKey : false,
				isCtrlKey : false,
				_firstIndex : null,
				_lastIndex : null,
				renderer : {},
				_renderer : {},//反renderer
				rendererDef : '_default_',
				isIE : !!window.ActiveXObject,
				url : '',//支持远程创建 返回数据格式  json
				dataType : 'json',
				method : 'get',
				parames : {},
				validator : Nex.formValid || {},
				rules : [],
				messages : {},
				error : 'nex-form-valid-error',//已经移除 无效
				errorCls : 'nex-form-valid-error',
				items : [],//{cls:'',text:'年龄',value:'45',readOnly:false,disabled:false,selected:true,attrs:''} or '|' ',' ';'
				_multiItems : [],//multi缓存数据
				_item :　{
					cls:'',
					text:'',
					value:'',
					readOnly:false,
					disabled:false,
					selected:false,
					title : '',//multiSelect
					attrs:'',
					display : 'inline-block'
				},
				showAt : {},
				listFilter : null,// callback select multiselect @return false 则过滤当前項
				leftText : '',
				rightText : '',
				width : 150,
				height : 60,//textarea multselect
				step : 1,//spinner,
				poll1 : 300,
				poll2 : 50,
				smax : null,//spinner,
				smin : null,//spinner,
				type : 'text',
				singleSelect : false,//mulitselect 是否只能单选
				multiSelect : false,//select 单选多选 , 无效
				selectListMaxHeight : 0,
				selectListMaxWidth : 0,
				selectReadOnly : true,//控制select 不可写
				emptyOnShowAll : true,//如果查询输入框为空 则显示所有
				onCheck : ['onChange','onBlur','onPaste'],//什么时候进行数据验证
				disabled : false,
				readOnly : false,
				cls : '',
				overCls : '',
				focusCls : '',
				disabledCls : '',
				readonlyCls : '',
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
					onMouseDown : $.noop,
					onMouseUp : $.noop,
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
	form.fn.extend({
		_init : function(opt) {
			var self = this;
			opt.type = opt.type.toLowerCase();
			opt._value = opt.value;
			
			var method = opt.type + 'Init';
			if( method in self ) {
				self[method].call(self,opt);
			}
			
			if( opt.url ) {
				self.getConf();//获取远程配置后创建
			} else {
				self.create();
			}
			
		},
		create : function(){
			var self = this;
			var opt = self.configs;
			
			var method = opt.type+'Create';
			var bindEvent = opt.type+'BindEvent';
			
			var tpl = '';
			
			if( opt.name === '' ) {
				opt.name = 'form_name_'+self.unique();	
			}
			
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
			
			self.fireEvent('onCreate',[opt.helper]);	
			
			self.setSize(opt.width,opt.height,function(){
				self.fireEvent('onInitSetSize',[opt.helper]);										   
			});
			
			return true;
		},
		addList : function(){
			var self = this;
			var opt = self.configs;
			var list = Nex.form.list;
			if( opt.group in list ) {
				list[ opt.group ][opt.id] = {
					name : opt.name,
					'self' : self
				};	
			} else {
				list[ opt.group ] = {};
				list[ opt.group ][opt.id] = {
					name : opt.name,
					'self' : self
				};
			}
		},
		_getOffset : function(el){
			var self = this;
			var opt = self.configs;	
			var offset = $(el).offset();
			var sLeft = $(window).scrollLeft();
			var sTop = $(window).scrollTop();
			return !offset ? {left:sLeft,top:sTop} : offset;
		},
		//获取周围可显示空间
		_getShowSpace : function(el){
			var self = this;
			var opt = self.configs;
			var el = self._undef(el,self.getInput());
			//需要获取的对象
			var obj = $(el);
			
			//获取窗口显示区域大小
			var cw = $(window).width();
			var ch = $(window).height();
			
			var offset = $._isPlainObject(el) ? el : self._getOffset(obj);
			
			//获取滚位置
			var sLeft = $(window).scrollLeft();
			var sTop = $(window).scrollTop();
			
			var space = {
				top : offset.top - sTop,
				left : offset.left - sLeft
			};
			space.bottom = ch - space.top - ( $._isPlainObject(el) ? 0 : obj._outerHeight() );
			space.right = cw - space.left - ( $._isPlainObject(el) ? 0 : obj._outerWidth() );
			return space;
		},
		_sysEvents : function(){
			var self = this;
			var opt = self.configs;
			
			self.bind("onStart",self._initCof,self);
			
			self.bind("onCreate",self.onCreate,self);
			self.bind("onCreate",self.addList,self);
			self.bind("onCreate",self.onDisabled,self);
			self.bind("onCreate",self.onReadOnly,self);
			self.bind("onCreate",self._setValue,self);
			self.bind("onCreate",function(){
				this.lockMethod('setSize');
				this.setLabelText();	
				this.unLockMethod('setSize');						  
			},self);
			
			self.bind("onMouseOver",self.onMouseOver,self);
			self.bind("onMouseOut",self.onMouseOut,self);
			
			self.bind("onFocus",self._setFocusCls,self);
			self.bind("onBlur",self._unsetFocusCls,self);
			
			
			self.bind("onBeforeSet",self.onBeforeSet,self);
			self.bind("onAfterSet",self.onAfterSet,self);
			self.bind("onChange",self.onChange,self);
			self.bind("onBlur",self.refreshFormater,self);//refreshFormater
			self.bind("onBlur",self.refreshRenderer,self);
			
			self.bind("onValidError",self.onValidError,self);
			self.bind("onValidSuccess",self.onValidSuccess,self);
			for(var i=0;i<opt.onCheck.length;i++ ) {
				var s = self.bind(opt.onCheck[i],self.onCheck,self);	
			}
			return self;
		},
		
		_setValue : function(){
			var self = this;
			var opt = self.configs;
			self.lockEvent("onBeforeSet");
			self.lockEvent("onAfterSet");
			
			self.val( opt.value );
			
			self.unLockEvent("onBeforeSet");
			self.unLockEvent("onAfterSet");
		},
		onValidError : function(){
			var self = this;
			var opt = self.configs;
			$("#"+opt.id).removeClass(opt.errorCls);
			$("#"+opt.id).addClass(opt.errorCls);
		},
		onValidSuccess : function(){
			var self = this;
			var opt = self.configs;
			$("#"+opt.id).removeClass(opt.errorCls);
		},
		onCreate : function(){
			var self = this;
			var opt = self.configs;
			var method = opt.type + 'Extend';
			if( method in self ) {
				self[method].call(self);
			}
		},
		_initCof : function(){
			var self = this;
			var opt = self.configs;
			
			opt.cls += ' nex-form-display-'+opt.display+' nex-form-'+opt.group+'-wraper nex-form-'+opt.type+'-wraper ';
			
			if(opt.disabled){
				opt.attrs += 'disabled';
			}
			if(opt.readOnly){
				opt.attrs += ' readOnly ';
			}
		
			
			var method = opt.type + 'Start';
			if( method in self ) {
				self[method].call(self);
			}
		},
		onDisabled : function(){
			var self = this;
			var opt = self.configs;
			if( opt.disabled )
				self.disabled();
		},
		onReadOnly : function(){
			var self = this;
			var opt = self.configs;
			if( opt.readOnly ) {
				self.readOnly();
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
		destroy : function(){
			this._destroy();
		},
		setSize : function(w,h,cb){
			var self = this;
			var opt = self.configs;
			var w = self._undef(w,opt.width);
			var h = self._undef(h,opt.height);
			var call = self._undef(cb,null);
			opt.width = w;
			opt.height = h;
			
			var method = opt.type+'SetSize';
			
			var rsize = function(){
				if( method in self ) {
					self[method].apply(self,[w,h]);
				} else {
					self.commonSetSize(w,h);	
				}
				self.fireEvent("onSizeChange",[w,h,opt]);
				if($.isFunction( call )) {
					call();	
				}
			};
			/*if( Nex.isIE6 || Nex.isIE7 ) {
				setTimeout(rsize,0);	
			} else {
				rsize()	;
			}*/
			setTimeout(rsize,0);	
		},
		resize : function(w,h){
			var self = this;
			var opt = self.configs;
			self.setSize(w,h);
		},
		_setFocusCls : function(t,e){
			var self = this;
			var opt = self.configs;
			if( opt.disabled || opt.readOnly ) {
				return;	
			}
			var field = $("#"+opt.id);
			if( opt.focusCls ) {
				field.addClass(opt.focusCls);	
			}	
		},
		_unsetFocusCls : function(t,e){
			var self = this;
			var opt = self.configs;
			if( opt.disabled || opt.readOnly ) {
				return;	
			}
			var field = $("#"+opt.id);
			if( opt.focusCls ) {
				field.removeClass(opt.focusCls);	
			}	
		},
		onMouseOver : function(t,e){
			var self = this;
			var opt = self.configs;
			if( opt.disabled || opt.readOnly ) {
				return;	
			}
			var field = $("#"+opt.id);
			field.addClass('nex-form-wraper-over');
			$('>.nex-form-item',field).addClass('nex-form-item-over');
			if( opt.overCls ) {
				field.addClass(opt.overCls);	
			}
		},
		onMouseOut : function(t,e){
			var self = this;
			var opt = self.configs;
			if( opt.disabled || opt.readOnly ) {
				return;	
			}
			var field = $("#"+opt.id);
			field.removeClass('nex-form-wraper-over');
			$('>.nex-form-item',field).removeClass('nex-form-item-over');
			if( opt.overCls ) {
				field.removeClass(opt.overCls);	
			}
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
			opt.value = self.val() ;
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
			if( opt._ct ) {
				clearTimeout( opt._ct )
			}
			opt._ct = setTimeout(function(){
				self.checkVal();
				opt._ct = 0;	
			},0);
		},
		commonDisabled : function(){
			var self = this;
			var opt = self.configs;
			var input = $("#"+opt.id+"-input");
			
			input.attr('disabled',true);	 
			
			return self;	
		},
		hidden : function(){
			var self = this;
			var opt = self.configs;
			$("#"+opt.id).hide();
		},
		show : function(){
			var self = this;
			var opt = self.configs;
			$("#"+opt.id).show();	
		},
		disabled : function(){
			var self = this;
			var opt = self.configs;
			var method = opt.type + 'Disabled';
			
			opt.disabled = true;
			
			if( method in self ) {
				self[method].call(self);
			} else {
				self.commonDisabled();
			}
			self.fireEvent("onDisabled",[opt]);	
			
			var field = $("#"+opt.id);
			field.addClass('nex-form-disabled');
			$('>.nex-form-item',field).addClass('nex-form-item-disabled');
			if( opt.disabledCls ) {
				field.addClass(opt.disabledCls);	
			}
		},
		commonEnable : function(){
			var self = this;
			var opt = self.configs;
			
			var input = $("#"+opt.id+"-input");
			
			input.attr('disabled',false);	
			
			return self;	
		},
		enable : function(){
			var self = this;
			var opt = self.configs;
			
			opt.disabled = false;
			
			var method = opt.type + 'Enable';
			if( method in self ) {
				self[method].call(self);
			} else {
				self.commonEnable();
			}	
			self.fireEvent("onEnable",[opt]);	
			var field = $("#"+opt.id);
			field.removeClass('nex-form-disabled');
			$('>.nex-form-item',field).removeClass('nex-form-item-disabled');
			if( opt.disabledCls ) {
				field.removeClass(opt.disabledCls);	
			}
		},
		commonReadOnly : function( flag ){
			var self = this,undef;
			var opt = self.configs;
			var flag = flag === undef ? true : flag;
			var input = self.getInput();
			input.attr('readonly',flag);	
			return self;	
		},
		readOnly : function( flag ){
			var self = this;
			var opt = self.configs;
			
			var flag = typeof flag == 'undefined' ? true : flag;
			
			opt.readOnly = flag;
			
			var method = opt.type + 'ReadOnly';
			
			if( method in self ) {
				self[method].call(self,flag );
			} else {
				self.commonReadOnly( flag  );
			}
			var field = $("#"+opt.id);
			if( flag ) {
				self.fireEvent("onReadOnly",[opt]);	
				field.addClass('nex-form-readonly');
				$('>.nex-form-item',field).addClass('nex-form-item-readonly');
				if( opt.readonlyCls ) {
					field.addClass(opt.readonlyCls);	
				}
			} else {
				self.fireEvent("onUnReadOnly",[opt]);		
				field.removeClass('nex-form-readonly');
				$('>.nex-form-item',field).removeClass('nex-form-item-readonly');
				if( opt.readonlyCls ) {
					field.removeClass(opt.readonlyCls);	
				}
			}
		},
		getInput : function(){
			var self = this;
			var opt = self.configs;
			var input = $("#"+opt.id+"-input");
			return input;
		},
		getInputKey : function(){
			var self = this;
			var opt = self.configs;
			var input = $("#"+opt.id+"-input-key");
			return input;
		},
		"focus" : function(){
			var self = this;
			try{
				self.getInput().focus();
			}catch(e){};
		},
		"select" : function(){
			var self = this;
			try{
				self.getInput().select();
			}catch(e){};
		},
		selectText : function(start, end){
			var self = this,
				opt = self.configs,
				v = self.val(),
				undef,
				el = self.getInput().get(0),
				range;
	
			if (v.length > 0) {
				start = start === undef ? 0 : start;
				end = end === undef ? v.length : end;
				if (el.setSelectionRange) {
					el.setSelectionRange(start, end);
				}
				else if(el.createTextRange) {
					range = el.createTextRange();
					range.moveStart('character', start);
					range.moveEnd('character', end - v.length);
					range.select();
				}
				
			}
			self.focus();
		},
		"blur" : function(){
			var self = this;
			try{
				self.getInput().blur();
			} catch(e){}
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
						checkList['checklist_'+x] = rule;
					} else if( $.isPlainObject(rule) ){
						for(var i in rule ) {
							if( $.isFunction( rule[i] ) ) {
								//r = rule[i].call(self,value);
								checkList['checklist_'+i] = rule[i];
							}else if( i in validator.methods ) {
								//r = validator.methods[i].call(self,value,rule[i]);
								checkList['checklist_'+i] = { method : i,params : rule[i] };
							}
						}
					} else {
						if( rule in validator.methods ) {
							//r = validator.methods[rule].call(self,value);
							checkList['checklist_'+rule] = rule;
						}
					}
				}
			} else if( typeof rules == 'string' ) {
				if( rules in validator.methods ) {
					//r = validator.methods[rule].call(self,value);
					checkList['checklist_'+rules] = rules;
				}	
			}
			for( rule in checkList ) {
				var _rule = checkList[ rule ];
				var m_rule = rule.replace('checklist_','');

				if( $.isFunction( checkList[rule] ) ) {
					m_rule = opt.name;
					r = checkList[rule].call( self,value );
					if( r === false) break;
				} else if( $.isPlainObject(checkList[rule]) ) {
					if( checkList[rule].method in validator.methods ) {
						r = validator.methods[ checkList[rule].method ].call(self,value,checkList[rule].params);
						if( r === false) break;
					}	
				} else {
					if( _rule in validator.methods ) {
						//r = validator.methods[rule].call(self,value);
						r = validator.methods[_rule].call(self,value);
						if( r === false) break;
					}	
				}
			}
			
			if( r === false ) {
				var errorMsg = '';
				if( $.isPlainObject( opt.messages ) ) {
					errorMsg = opt.messages[m_rule] || validator.messages[m_rule] || m_rule;
				} else {
					errorMsg = 	opt.messages;
				}
				self.fireEvent("onValidError",[errorMsg,m_rule]);	
			} else {
				self.fireEvent("onValidSuccess",[]);		
			}
			
			return r;
		},
		isValid : function(){
			return this.checkVal();	
		},
		"reset" : function(){
			var self = this;
			var opt = self.configs;
			opt.value = opt._value;
			self._setValue();
			self.blur();
			clearTimeout( opt._ct );//取消验证
			self.onValidSuccess();	
		},
		//获取数据 ,一般作为内部使用
		val : function(){
			var self = this,undef;
			var opt = self.configs;
			
			//设置当前值
			if( arguments.length ) {
				self.fireEvent('onBeforeSet',[]);	
				var method = opt.type+'SetValue';
				var argvs = arguments;
				
				if( $.isFunction( opt.setFormater ) ) {
					var val = opt.setFormater.apply( self,arguments );
					if( val !== undef ) {
						if( !$.isArray( argvs ) ) {
							argvs = [ val ];	
						}
					}
				}
				
				if( method in self ) {
					self[method].apply(self,argvs);	
				} else {
					self.commonSetValue.apply(self,argvs);
				}
				self.fireEvent('onAfterSet',[]);	
				//opt.value = arguments[0];
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
			
			if( $.isFunction( opt.getFormater ) ) {
				var val = opt.getFormater.call( self,value );
				value = val === undef ? value : val;
			}
			
			return value;
		},
		//一般作为外部使用 又val 区别在于可做最终数据处理
		getValue : function(){
			return this.val();	
		},
		setValue : function(){
			return this.val.apply(this,arguments);	
		},
		//根据type创建控件
		commonCreaet : function(){
			var self = this;
			var opt = self.configs;
			
			var target = opt.helper;
			
			var render = $(opt.renderTo);
			
			var method = opt.type + 'Tpl';
			
			if( method in self ) {
				var wraper = $( self.tpl(opt.type.toString()+'Tpl',opt) );
			} else {
				var wraper = $( self.commonCreateTpl(opt) );	
			}
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
					if( opt.disabled || opt.readOnly ) {
						return false;	
					}
					var r = self.fireEvent('onClick',[ this,e ]);	
					if( r === false ) return false;
				},
				'focus' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return false;	
					}
					var input = $('#'+opt.id+"-input");
					input.addClass('nex-form-focus');
					$('#'+opt.id+"").addClass('nex-form-wraper-focus');
					
					if( input.hasClass("nex-form-empty-field") && opt.isIE ) {
						input.removeClass("nex-form-empty-field")
						input.val('');
					}
					
					var r = self.fireEvent('onFocus',[ this,e ]);	
					if( r === false ) return false;
				},
				'blur' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var input = $('#'+opt.id+"-input");
					input.removeClass('nex-form-focus');
					
					$('#'+opt.id+"").removeClass('nex-form-wraper-focus');
					
					if( (input.val() === '') && opt.isIE && ( opt.placeholder !== '' )  ) {
						input.addClass("nex-form-empty-field");
						input.val(opt.placeholder);
					}
					
					var r = self.fireEvent('onBlur',[ this,e ]);	
					if( r === false ) return false;
				},
				'keydown' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					opt._oldVal = opt._oldVal === null ? $(this).val() : opt._oldVal;
					var r = self.fireEvent('onKeyDown',[ this,e ]);	
					if( r === false ) return false;
					
				},
				'keyup' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var val = $(this).val();
					if( opt._oldVal !== val && opt._oldVal!==null ) {
						var r = self.fireEvent('onChange',[ this,opt._oldVal,val,e ]);	
						opt._oldVal =null;
						if( r === false ) return false;
					}
					var r = self.fireEvent('onKeyUp',[ this,e ]);	
					if( r === false ) return false;
				},
				'keypress' : function(e){
					if( opt.disabled || opt.readOnly ) {
						return;		
					}
					var r = self.fireEvent('onKeyPress',[ this,e ]);	
					if( r === false ) return false;
					
				},
				'mouseenter' : function(e){
					if( opt.disabled || opt.readOnly ) {
						return;		
					}
					var r = self.fireEvent('onMouseOver',[ this,e ]);	
					if( r === false ) return false;
					
				},
				'mouseleave' : function(e){
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onMouseOut',[ this,e ]);	
					if( r === false ) return false;
				},
				'change' : function(e){
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onChange',[ this,e ]);	
					if( r === false ) return false;	
				},
				'paste' : function(e){
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onPaste',[ this,e ]);	
					if( r === false ) return false;
				},
				'mousedown' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onMouseDown',[ this,e ]);	
					if( r === false ) return false;
				},
				'mouseup' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onMouseUp',[ this,e ]);	
					if( r === false ) return false;
				}
			};
			
			var input = $("#"+opt.id+"-input");
			
			input.bind(events);
		},
		refreshFormater : function(){
			var self = this,undef;
			var opt = self.C();	
			if( $.isFunction( opt.formater ) ) {
				var value = self.val();
				var _value = opt.formater.call( self,value );
				value = _value === undef ? value : _value;
				self.val( value );
			}	
		},
		/*
		*映射 只有使用api val() 才有效
		*/
		refreshRenderer : function( input,e ){
			var self = this;
			var opt = self.C();	
			if( $.isPlainObject( opt.renderer ) && $.isEmptyObject( opt.renderer ) ) {
				return ;	
			}
			var value = self.val();
			self.val( value );
		},
		/*
		* 映射
		*/
		rendererEncode : function(str){
			var self = this;
			var opt = self.C();	
			var renderer = opt.renderer;
			var value = '';
			
			if( $.isPlainObject( opt.renderer ) && $.isEmptyObject( opt.renderer ) ) {
				return str;	
			}
			
			if( $.isFunction( opt.renderer ) ) {
				value = self.tpl( renderer , str );	
			} else if( $._isPlainObject( renderer ) ) {
				if( str in renderer ) {
					value = self.tpl( renderer[str] , str );		
				} else if( opt.rendererDef in renderer ) {
					value = self.tpl( renderer[opt.rendererDef] , str );			
				} else {
					value = str;	
				}
			} else {
				value = str;	
			}
			opt._renderer[ value ] = str;
			return value;
		},
		/*
		*反映射
		*/
		rendererDecode : function(str){
			var self = this;
			var opt = self.C();	
			
			if( $.isPlainObject( opt.renderer ) && $.isEmptyObject( opt.renderer ) ) {
				return str;	
			}
			
			var value = '';
			if( str in opt._renderer ) {
				value = opt._renderer[str];	
			}else {
				value = str;	
			}
			return value;
		},
		//通用获取
		commonGetValue : function(){
			var self = this;
			var opt = self.configs;
			var input = $("#"+opt.id+"-input");
			
			var value = '';
			
			if( input.hasClass("nex-form-empty-field") && opt.isIE ) {
				value = '';	
			} else {
				value = input.val();		
			}
			
			return $.trim( self.rendererDecode(value) );
		},
		//通用设置
		commonSetValue : function(){
			var self = this,undef;
			var opt = self.C();
			var input = $("#"+opt.id+"-input");
			
			if( opt.isIE && ( opt.placeholder !== '' ) ) {
				if( arguments[0]+'' === '' ) {
					input.addClass("nex-form-empty-field");	
					arguments[0] = opt.placeholder;
				} else {
					input.removeClass("nex-form-empty-field");		
				}
			}
			
			var value = arguments[0];
			
			if( $.isFunction( opt.formater ) ) {
				var _value = opt.formater.call( self,value );
				value = _value === undef ? value : _value;
			}
			
			input.val( self.rendererEncode(value) );
			
			return self;
		},
		commonSetSize : function(width,height){
			var self = this;
			var opt = self.configs;
			
			var $table = $("#"+opt.id+"-item");
			
			var $input = $("#"+opt.id+"-input");
			
			$("#"+opt.id)._outerWidth( width );
			
			var lw = 0;
			$("#"+opt.id+"-inputRow >td.nex-form-label-cell").each(function(){
				lw += $(this)._outerWidth();																
			});
			$("#"+opt.id+"-inputRow >td.nex-form-button-cell").each(function(){
				lw += $(this)._outerWidth();																
			});
			
			$table._outerWidth( width );
			
			$input._outerWidth( width - lw );		
		},
		commonCreateTpl : function(d){
			if( !d ) return "";
			var self = this,
				opt = self.configs;
			var text = [];
			text.push('<div class="nex-form-wraper '+d.cls+' nex-field-'+d.group+'" style="" id="'+d.id+'">');
				text.push('<table id="'+d.id+'-item" class="nex-field nex-form-item" cellspacing="0" cellpadding="0"><tbody>');
				text.push('<tr id="'+d.id+'-inputRow">');
					text.push('<td class="nex-form-item-body" id="'+d.id+'-body" style="width: 100%;">');	
						text.push('<input '+d.attrs+' id="'+d.id+'-input" placeholder="'+d.placeholder+'" type="'+d.type+'"  name="'+d.name+'" value="" style="width:0px;" class="nex-form-field nex-form-text" autocomplete="'+d.autocomplete+'" />');
					text.push('</td>');
				text.push('</tr>');
			text.push('</tbody></table></div>');
			return text.join("");	
		},
		setLabelText : function(text,m,width){
			var self = this;
			var opt = self.configs;
			var d = opt;
			
			d.labelText = self._undef( text , d.labelText );
			
			var labelAlign = self._undef( m , d.labelAlign );
			
			d.labelWidth = self._undef( width , d.labelWidth );
			
			if( d.labelText === '' || d.labelWidth<=0 ) return false;
			
			var inputRow = $("#"+opt.id+"-inputRow");
			
			var td = [];
			if( self.inArray(labelAlign,['left','right']) != -1 ) {
				td.push('<td valign="top" halign="left" class="nex-form-label-cell">');	
						td.push('<label id="'+d.id+'-labelText-'+(Nex.aid++)+'" for="'+d.id+'-input" class="nex-form-item-label nex-form-item-label-'+labelAlign+'">'+d.labelText+'</label>');
				td.push('</td>');
			} else {
				td.push('<tr><td valign="top" halign="left" colspan='+$(">td",inputRow).size()+' class="nex-form-label-cell">');	
						td.push('<label id="'+d.id+'-labelText-'+(Nex.aid++)+'" for="'+d.id+'-input" class="nex-form-item-label nex-form-item-label-'+labelAlign+'">'+d.labelText+'</label>');
				td.push('</td></tr>');	
			}
			
			var td = $(td.join(""));
			
			td.find(">label")._outerWidth( opt.labelWidth );
			
			if( labelAlign === 'left' ) {
				$("#"+opt.id+"-body").before(td);
			} else if( labelAlign === 'right' ) {
				$(">td:last",inputRow).after(td);
			} else if( labelAlign === 'top' ) {
				inputRow.before(td);
			} else {
				inputRow.after(td);	
			}
			
			//self.setSize();
			self.methodInvoke('setSize');
			
			return td;
		},
		removeLabelText : function(td){
			var self = this;
			td.remove();
			self.setSize();
		},
		addItemButton : function(msg,w){
			var self = this;
			var opt = self.configs;
			var d = opt;
			
			//var w = self._undef( w , 17 );
			var w = self._undef( w , false );
			
			var td = [];
			
			td.push('<td valign="top" align="left" class="nex-form-button-cell">');	
					td.push('<div id="'+d.id+'-button-'+(Nex.aid++)+'" class="nex-form-item-button"></div>');
			td.push('</td>');	
			var td = $(td.join(""));
			
			var itemBtnTd = $("#"+opt.id+"-inputRow td:last");
			itemBtnTd.after(td);
			var itemBtn = td.find(">div");
			if( w ) {
				itemBtn._outerWidth( w );
			}
			
			self.addComponent( itemBtn,msg );
			
			self.setSize();
			return td;	
		},
		/*
		*@m true 返回数据 默认 false返回索引
		*/
		getItemData : function(value,m){
			var self = this,
				undef,
				opt = self.configs,
				m = m === undef ? true : m,
				items = opt.items || [];	
			var _v = value;	
			if( value === undef ) return null;
			if( $.type( value ) === 'string' ) {
				value = value.split( opt.multiSplit );	
				if( value.length>1 ) {
					_v = value;	
				}
			} else if( $.type( value ) !== 'array' ) {
				value = [ value ];	
			}
			var d = {};
			$.each( value,function(i,v){
				d[v] = true;					   
			} );
			var list = [];
			$.each( items , function(i,v){
				if( !$.isPlainObject( v ) ) return;
				var value = v['value'];
				if( value in d ) {
					list.push( m?v:i );	
				}
			} );
			
			if( list.length === 1 && $.type( _v ) !== 'array' ) {
				return list[0];	
			} else {
				return list;	
			}
		},
		getItemIndex : function(value){
			return this.getItemData( value,false );
		},
		removeItemButton : function(){
			this.removeLabelText();
		},
		hiddenInit : function(opt){
			var self = this;
			self.one("onCreate",function(){
				self.hidden();  
			});	
		},
		displayGetValue : function(){
			var self = this;
			var opt = self.configs;
			var input = $("#"+opt.id+"-input");
			
			var value = input.html();
			
			return $.trim( self.rendererDecode(value) );
		},
		displaySetValue : function(){
			var self = this,undef;
			var opt = self.configs;
			var input = $("#"+opt.id+"-input");
			
			var value = arguments[0];
			
			if( $.isFunction( opt.formater ) ) {
				var _value = opt.formater.call( self,value );
				value = _value === undef ? value : _value;
			}
			
			input.html( self.rendererEncode(value) );
			
			//input.html(arguments[0]);
			
			return self;
		},
		displayTpl :　function(d){
			if( !d ) return "";
			var self = this,
				opt = self.configs;
			var text = [];
			text.push('<div class="nex-form-wraper '+d.cls+' nex-field-'+d.group+'" style="" id="'+d.id+'">');
				text.push('<table id="'+d.id+'-item" class="nex-field nex-form-item" cellspacing="0" cellpadding="0"><tbody>');
				text.push('<tr id="'+d.id+'-inputRow">');
					text.push('<td class="nex-form-item-body" id="'+d.id+'-body" style="width: 100%;">');	
						text.push('<div '+d.attrs+' id="'+d.id+'-input" style="width:0px;" class="nex-form-field nex-form-display"></div>');
					text.push('</td>');
				text.push('</tr>');
			text.push('</tbody></table></div>');
			return text.join("");
		},
		textSetSize : function(width,height){
			this.commonSetSize(width,height);
		},
		textTpl :　function(d){
			return this.commonCreateTpl(d);
		},
		passwordSetSize : function(width,height){
			this.commonSetSize(width,height);
		},
		passwordTpl : function(d){
			return this.commonCreateTpl(d);
		},
		textareaSetSize : function(width,height){
			var self = this;
			var opt = self.configs;
			
			var $table = $("#"+opt.id+"-item");
			
			var $input = $("#"+opt.id+"-input");
			
			$("#"+opt.id)._outerWidth( width );
			
			var lw = 0;
			$("#"+opt.id+"-inputRow >td.nex-form-label-cell").each(function(){
				lw += $(this)._outerWidth();																
			});
			$("#"+opt.id+"-inputRow >td.nex-form-button-cell").each(function(){
				lw += $(this)._outerWidth();																
			});
			
			$table._outerWidth( width );
			
			$input._outerWidth( width - lw );	
			$input._outerHeight( height );	
		},
		textareaTpl :　function(d){
			if( !d ) return "";
			var self = this,
				opt = self.configs;
			var text = [];
			text.push('<div class="nex-form-wraper '+d.cls+' nex-field-'+d.group+'" style="" id="'+d.id+'">');
				text.push('<table id="'+d.id+'-item" class="nex-field nex-form-item" cellspacing="0" cellpadding="0"><tbody>');
				text.push('<tr id="'+d.id+'-inputRow">');
					text.push('<td class="nex-form-item-body" id="'+d.id+'-body" style="width: 100%;">');	
						text.push('<textarea '+d.attrs+' id="'+d.id+'-input" placeholder="'+d.placeholder+'"  name="'+d.name+'" style="width:0px;" class="nex-form-field nex-form-text nex-form-textarea" autocomplete="'+d.autocomplete+'"></textarea>');
					text.push('</td>');
				text.push('</tr>');
			text.push('</tbody></table></div>');
			return text.join("");
		},
		comboBindEvent : function(){
			var self = this;
			var opt = self.configs;
			self.commonEvent();
			
			var input = $("#"+opt.id+'-input');
			var combo = $("#"+opt.id+"-combo");
			var events = {
				'click' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onComboClick',[ input.get(0),e ]);	
					if( r === false ) return false;
					var r = self.fireEvent('onClick',[ input.get(0),e ]);	
					if( r === false ) return false;
				},
				'mouseenter' : function(e){
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onComboMouseOver',[ input.get(0),e ]);	
					if( r === false ) return false;
					var r = self.fireEvent('onMouseOver',[ input.get(0),e ]);	
					if( r === false ) return false;
					combo.addClass("nex-form-combo-over");
				},
				'mouseleave' : function(e){
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onComboMouseOut',[ input.get(0),e ]);	
					if( r === false ) return false;
					var r = self.fireEvent('onMouseOut',[ input.get(0),e]);	
					if( r === false ) return false;
					combo.removeClass("nex-form-combo-over");
				},
				'mousedown' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onComboMouseDown',[ input.get(0),e ]);	
					if( r === false ) return false;
					var r = self.fireEvent('onMouseDown',[ input.get(0),e]);	
					if( r === false ) return false;
					combo.addClass("nex-form-combo-click");
					$(document.body).mouseup(function(){
						combo.removeClass("nex-form-combo-click");								  
					});
				},
				'mouseup' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;		
					}
					var r = self.fireEvent('onComboMouseUp',[ input.get(0),e ]);	
					if( r === false ) return false;
					var r = self.fireEvent('onMouseUp',[ input.get(0),e]);	
					if( r === false ) return false;
					combo.removeClass("nex-form-combo-click");
				}
			};
			
			combo.bind( events );
			
		},
		comboSetSize : function(width,height){
			var self = this;
			var opt = self.configs;
			
			var $table = $("#"+opt.id+"-item");
			
			var $input = $("#"+opt.id+"-input");
			
			$("#"+opt.id)._outerWidth( width );
			
			var lw = 0;
			$("#"+opt.id+"-inputRow >td.nex-form-label-cell").each(function(){
				lw += $(this)._outerWidth();																
			});
			$("#"+opt.id+"-inputRow >td.nex-form-combo-cell").each(function(){
				lw += $(this)._outerWidth();																
			});
			$("#"+opt.id+"-inputRow >td.nex-form-button-cell").each(function(){
				lw += $(this)._outerWidth();																
			});
			
			$table._outerWidth( width );
			
			$input._outerWidth( width - lw );	
		},
		comboTpl : function(d){
			if( !d ) return "";
			var self = this,
				opt = self.configs;
			var text = [];
			text.push('<div class="nex-form-wraper '+d.cls+' nex-field-'+d.group+'" style="" id="'+d.id+'">');
				text.push('<table id="'+d.id+'-item" class="nex-field nex-form-item" cellspacing="0" cellpadding="0"><tbody>');
				text.push('<tr id="'+d.id+'-inputRow">');
					text.push('<td class="nex-form-item-body" id="'+d.id+'-body" style="width: 100%;">');	
						text.push('<input '+d.attrs+' id="'+d.id+'-input" placeholder="'+d.placeholder+'" type="text"  name="'+d.name+'" value="" style="width:0px;" class="nex-form-field nex-form-text" autocomplete="'+d.autocomplete+'" />');
					text.push('</td>');
					text.push('<td class="nex-form-combo-cell nex-form-'+d.type+'-cell" id="'+d.id+'-combo-cell">');	
						text.push('<div class="nex-form-combo nex-form-'+d.type+'-combo" id="'+d.id+'-combo"></div>');
					text.push('</td>');
				text.push('</tr>');
			text.push('</tbody></table></div>');
			return text.join("");	
		},
		dateBindEvent : function(){
			this.comboBindEvent();
		},
		dateSetSize : function(width,height){
			this.comboSetSize(width,height);	
		},
		dateTpl : function(d){
			return this.comboTpl(d);	
		},
		/*
		*创建List
		*/
		selectCreateList : function(lists){
			var self = this;
			var opt = self.configs;
			
			var r = self.fireEvent("onBeforeSelectListCreate",[self._undef(lists,opt.items),opt]);
			if( r === false ) {
				return r;	
			}
			
			var list = [];
			//创建
			list.push('<div id="'+opt.id+'_list" class="nex-form-select-list" tabindex="-1" style="display:none;">');
				list.push('<div id="'+opt.id+'_list_body" class="nex-form-select-list-body" tabindex="-1" style="">');
					var items = self._undef(lists,opt.items);
					for( var x=0;x<items.length;x++ ) {
						items[x] = $.extend({},opt._item,items[x]);
						var item = items[x];
						item.value = self._undef( item.value,item.text );
						item.text = self._undef( item.text,item.value );
						var icls = [];
						if( items[x]['disabled'] ) {
							icls.push('nex-form-select-list-item-disabled');	
						}
						if( items[x]['selected'] ) {
							icls.push('nex-form-select-list-item-selected');	
						}
						if( $.isFunction( opt.listFilter ) ) {
							var r = opt.listFilter.call( self,items[x] );
							if( r === false ) continue;
						}
						var r = self.fireEvent("onSelectListItemCreate",[items[x],list,opt]);
						if( r === false ) continue;//value="'+items[x]['value']+'"
						list.push('<div  itemindex="'+x+'" class="nex-form-select-list-item '+items[x]['cls']+' '+icls.join(' ')+'" id="'+opt.id+'_'+x+'_item">'+self.tpl(items[x]['text'],items[x])+'</div>');	
					}
				list.push('</div>');
			list.push('</div>');
			
			var list = $( list.join("") );
			
			var _itemList = $('.nex-form-select-list-item',list);
			
			_itemList.each(function(){
				var index = $(this).attr( 'itemindex' );
				var item = items[index];
				$(this).attr('value',item['value'])
					   .data('itemData',item);
			});
			
			list.appendTo(document.body);
			
			//设置大小
			var input = self.getInput();
			var space = self._getShowSpace( input );
			var h = list._outerHeight();
			var w = list._outerWidth();
			//selectListMinHeight : 50
			var minWidth = $('#'+opt.id+'-body')._outerWidth() + $('#'+opt.id+'-combo-cell')._outerWidth();
			w = Math.max( w,minWidth );
			w = Math.min( w,$(window).width() );
			h = Math.min( h,Math.max(space.bottom,space.top) );
			//selectListMaxHeight
			//selectListMaxWidth
			//最后计算大小
			if( opt.selectListMaxWidth>0 ) {
				if( opt.selectListMaxWidth > minWidth ) {
					w = Math.min( w,opt.selectListMaxWidth );	
				}
			}
			if( opt.selectListMaxHeight>0 ) {
				h = Math.min( h,opt.selectListMaxHeight );
			}
			
			list._outerWidth( w );
			list._outerHeight( h );
			
			/*创建一个shadow*/
			var shadow = $('<div id="'+opt.id+'_list_shadow" class="nex-form-select-shadow"><iframe style="width:99%;height:99%;"></iframe><div>');
			shadow.appendTo( document.body );
			shadow._width( w );
			shadow._height( h );
			
			//事件绑定
			var events = {
				selectstart : function(e){
					return false;	
				},
				mouseenter : function(e){
					self.fireEvent("onSelectItemOver",[this,e]);
					if( $(this).hasClass('nex-form-select-list-item-disabled') ) return;
					$(this).addClass("nex-form-select-list-item-over");
				},
				mouseleave : function(e){
					self.fireEvent("onSelectItemOut",[this,e]);
					if( $(this).hasClass('nex-form-select-list-item-disabled') ) return;
					$(this).removeClass("nex-form-select-list-item-over");
				},
				click : function(e) {
					self.fireEvent("onSelectItemClick",[this,e]);
					if( $(this).hasClass('nex-form-select-list-item-disabled') ) return false;
					var value = $(this).attr('value');
					var text = $(this).html();
					opt.multiSelect = self._undef(opt.multiSelect,false);
					if( !opt.multiSelect ) {//单选
						self.val(value);
						//self.selectUpdateValue();		
						self.selectHideList();
						//return false;//事件冒泡
					} else {//多选
						
						//return false;
					}
					
				}
			};
			_itemList.bind(events);
			
			self.fireEvent("onSelectListCreate",[list,opt]);
				
			return list;
		},
		/*
		*销毁selectList
		*/
		selectHideList : function(){
			var self = this,undef;
			var opt = self.C();
			var list = $('#'+opt.id+'_list');
			//if( opt.selectReadOnly ) {
				//self.blur();
			//}
			list.remove();
			//shadow
			var shadow = $('#'+opt.id+'_list_shadow');
			shadow.remove();
			//$(document).unbind("click.selectList"+opt.id);	
			//self.unbind('onBlur.selectList');
			$(document).unbind('mousedown.selectList'+opt.id);
			$(document).unbind('contextmenu.selectList'+opt.id);
			$(document).unbind('mousewheel.selectList'+opt.id);
			$(document).unbind("keydown.selectList"+opt.id);	
			$(window).unbind("resize.selectList"+opt.id);	
			self.fireEvent("onSelectListHide",[opt]);
		},
		/*
		*滚动到指定item
		*/
		scrollToItem : function(val){
			var self = this;
			var opt = self.configs;	
			var menus = opt.items;
			for( var i=0;i<menus.length;i++ ) {
				if( menus[i]['value']+'' === val+'' ) {
					break;
				}	
			}
			
			var body = $("#"+opt.id+"_list");
			
			if( !body.length ) {
				return self;	
			}
			
			var offset = body.offset();
			var h = body._outerHeight();
			
			var f = $("#"+opt.id+"_"+i+"_item");
			if( !f.length ) {
				return self;	
			}
			
			var fo = f.offset();
			var fh = f._outerHeight();
			
			var outerHeight = 0;
			if( offset.top > fo.top ) {
				outerHeight = offset.top - fo.top;
			} else if( (offset.top+h) < (fo.top+fh) ) {
				outerHeight = (offset.top+h) - (fo.top+fh);
			}
			
			var sTop = 0;
			
			sTop = body.scrollTop() - outerHeight;
			
			body.scrollTop( sTop );
			
			return self;
		},
		/*
		*创建并显示 select 下拉框
		*/
		selectShowList : function( lists ){
			var self = this,undef;
			var opt = self.C();
			var list = $('#'+opt.id+'_list');
			if( list.size() ) {
				self.selectHideList();	
			} else {
				setTimeout(function(){
					self.getInput().addClass('nex-form-focus');
					$('#'+opt.id).addClass('nex-form-wraper-focus');					
				},0);		
				var zIndex = Nex['zIndex']+2;
				Nex['zIndex'] = zIndex;
				//创建list
				list = self.selectCreateList(lists);	
				list.css('zIndex',zIndex);
				if( opt.showAt.at ) {
					opt.showAt.el = opt.showAt.at;
				}
				list.showAt( $.extend({el:self.getInput(), xAlign:'left',yAlign:'bottom',offsetY:-1 },opt.showAt) );
				//滚动到所选item
				self.scrollToItem( list.find('.nex-form-select-list-item-selected').attr('value') );
				//shadow
				var shadow = $('#'+opt.id+'_list_shadow');
				shadow.css( list.offset() )
					  .css( 'zIndex',zIndex-1 );
				//显示后绑定 关闭功能
				$(document).bind('mousewheel.selectList'+opt.id+' contextmenu.selectList'+opt.id+' mousedown.selectList'+opt.id,function(e){
					var target = e.target || e.srcElement;
					if( $(target).is( '#'+opt.id ) 
						|| $(target).is( '#'+opt.id+'_list' ) 
						|| $(target).parents('#'+opt.id+'_list,#'+opt.id).size() 
					) {
						//
					} else {
						self.selectHideList();		
					} 
				});
				$(window).bind('resize.selectList'+opt.id,function(){
					self.selectHideList();			
				});
				//不可设置
				/*self.bind('onBlur.selectList',function(){
					self.selectHideList();		
				});*/
				//支持上下键选择
				$(document).bind("keydown.selectList"+opt.id,function(e){
					var sbody = $("#"+opt.id+"_list_body");
					var s = sbody.find(".nex-form-select-list-item-over:last");
					if( !s.size() ) {
						s = sbody.find(">div.nex-form-select-list-item-selected:last");
						if( !s.size() ) {
							s = sbody.find(".nex-form-select-list-item:first");	
						}
					}
					
					if( !s.size() ) return;
					var it = s;
					switch( e.keyCode ) {
						case 38 : //up
							sbody.find(">div.nex-form-select-list-item").removeClass("nex-form-select-list-item-over");
							var prev = s.prev();
							if( prev.size() ) {
								it = prev;
								prev.addClass("nex-form-select-list-item-over");	
							} else {
								s.addClass("nex-form-select-list-item-over");		
							}
							self.scrollToItem( it.attr('value') );
							break;
						case 40 : //down
							sbody.find(">div.nex-form-select-list-item").removeClass("nex-form-select-list-item-over");
							var next = s.next();
							if( next.size() ) {
								it = next;
								next.addClass("nex-form-select-list-item-over");	
							} else {
								s.addClass("nex-form-select-list-item-over");		
							}
							self.scrollToItem( it.attr('value') );
							break;
						case 13:
							sbody.find(">div.nex-form-select-list-item-over").click();
							//键盘触发 并不会触发是输入框失去焦点
							self.blur();
							break;
					}
					
				});	
				
				self.fireEvent("onSelectListShow",[list,opt]);
			}
		},
		selectInit : function(){
			var self = this,undef;
			var opt = self.configs;
			self.bind('onClick.select',function(input,e){
				self.selectShowList();
				self.focus();
				//if( opt.selectReadOnly ) {
					//self.blur();
				//}
				//setTimeout(function(){
					//self.getInput().addClass('nex-form-focus');
					//$('#'+opt.id).addClass('nex-form-wraper-focus');					
				//},0);
			});
		},
		selectBindEvent : function(width,height){
			var self = this;
			self.comboBindEvent();
		},
		selectGetText : function( val ){
			var self = this;
			var opt = self.configs;	
			var menus = opt.items;
			for( var i=0;i<menus.length;i++ ) {
				if( menus[i]['value']+'' === val+'' ) {//不建议用全等于
					return  menus[i]['text'];
				}	
			}
			return undefined;
		},
		unSelectItem : function(val){
			var self = this;
			var opt = self.configs;	
			var menus = opt.items;
			for( var i=0;i<menus.length;i++ ) {
				if( menus[i]['value']+'' === val+'' ) {
					menus[i]['selected'] = false;
					$('#'+opt.id+'_'+i+'_item').removeClass('nex-form-select-list-item-selected');
				}	
			}	 
		},
		/*
		*只适合单选,而且只是选择下拉框的选中状态
		*/
		selectItem : function( val ){
			var self = this;
			var opt = self.configs;	
			var lbody = $("#"+opt.id+"_list_body");
			lbody.find(">div.nex-form-select-list-item")
				 .removeClass("nex-form-select-list-item-selected");
			var menus = opt.items;
			for( var i=0;i<menus.length;i++ ) {
				if( menus[i]['value']+'' === val+'' ) {
					menus[i]['selected'] = true;
					$('#'+opt.id+'_'+i+'_item').addClass('nex-form-select-list-item-selected');
					self.scrollToItem( val );
				} else {
					menus[i]['selected'] = false;	
				}
			}	 
		},
		selectGetValue : function(){
			var self = this;
			var opt = self.configs;	
			
			self.commonGetValue.apply( self, arguments );
			
			var key = self.getInputKey();
			return key.val();
		},
		selectSetValue : function(val,stext){
			var self = this,undef;
			var opt = self.configs;
			
			self.commonSetValue.apply( self, arguments );
			
			opt.multiSelect = self._undef(opt.multiSelect,false);
			if( !arguments.length )  return self;
			var menus = opt.items;
			if( !opt.multiSelect ) {//单选
				var text = self.selectGetText( val );
				if( text === undef ) {
					text = val;
				}
				if( stext !== undef ) {
					text = stext;	
				}
				var input = self.getInput();
				var key = self.getInputKey();
				input.val( text );
				key.val( val );
				self.selectItem( val );
			} else {//多选
					
			}
			return self;	
		},
		selectSetSize : function(width,height){
			this.comboSetSize(width,height);	
		},
		selectTpl : function(d){
			if( !d ) return "";
			var self = this,
				opt = self.configs;
			var text = [];
			text.push('<div class="nex-form-wraper '+d.cls+' nex-field-'+d.group+'" style="" id="'+d.id+'">');
				text.push('<table id="'+d.id+'-item" class="nex-field nex-form-item" cellspacing="0" cellpadding="0"><tbody>');
				text.push('<tr id="'+d.id+'-inputRow">');
					text.push('<td class="nex-form-item-body" id="'+d.id+'-body" style="width: 100%;">');	
						text.push('<input '+d.attrs+' id="'+d.id+'-input" '+( opt.selectReadOnly ? 'readonly' : '' )+' placeholder="'+d.placeholder+'" type="text"  name="'+d.name+'_text" value="" style="width:0px;" class="nex-form-field nex-form-text" autocomplete="'+d.autocomplete+'" />');
						text.push('<input id="'+d.id+'-input-key" type="hidden"  name="'+d.name+'" value="" />');
					text.push('</td>');
					text.push('<td class="nex-form-combo-cell nex-form-'+d.type+'-cell" id="'+d.id+'-combo-cell">');	
						text.push('<div class="nex-form-combo nex-form-'+d.type+'-combo" id="'+d.id+'-combo"></div>');
					text.push('</td>');
				text.push('</tr>');
			text.push('</tbody></table></div>');
			return text.join("");	
		},
		/*多选框*/
		multiselectClearItemSelected : function(){
			var self = this,undef,
				opt = self.configs,
				input = self.getInput();
			$('>.nex-form-multiselect-list-item',input).removeClass('nex-form-multiselect-list-item-selected');
			var key = self.getInputKey();
			key.val('');
			return self;
		},
		multiselectItemUnSelected : function(v){
			var self = this,undef,
				opt = self.configs,
				sDot = opt.multiSplit;	
			if( v === undef ) return false;	
			if( $.type( v ) === 'string' ) {
				v = v.split( sDot );	
			} else if( $.type( v ) !== 'array' ) {
				v = [ v ];	
			}
			var value = self.val();
			value = value.split( sDot );
			var dels = {};
			$.each(v,function(i,vv){
				dels[vv] = true;					  
			});
			self.array_splice( function(i,val){
				if( val in dels ) return true;	
			},value );
			self.multiselectItemSelected(value);
			return true;
		},
		multiselectItemSelected : function( v,m ){
			var self = this,undef,
				opt = self.configs,
				sDot = opt.multiSplit,
				m = m === undef ? false : m,//m=false 单选
				input = self.getInput();
			if( v === undef ) return false;	
			if( $.type( v ) === 'string' ) {
				v = v.split( sDot );	
			} else if( $.type( v ) !== 'array' ) {
				v = [ v ];	
			}
			//单选
			if( opt.singleSelect ) {
				m =  false;	
				if( self.inArray( opt._firstIndex,v ) === -1 ) {
					v = [v.pop()];	
				} else {
					v = [opt._firstIndex];
				}
			}
			
			if( !m ) {
				self.multiselectClearItemSelected();
			}
			var values = [];
			var sv = null;
			$('>.nex-form-multiselect-list-item',input).each(function(){
				var item = $(this);
				if( item.hasClass('nex-form-multiselect-list-item-disabled') ) return;
				var value = item.attr('value');
				var data = self.getItemData( value );
				if( self.inArray( value,v ) !== -1 ) {
					if( item.hasClass( 'nex-form-multiselect-list-item-selected' ) && opt.isCtrlKey && !opt.isShiftKey ) {
						var r = self.fireEvent('onItemUnSelected',[item,data,opt]);
						if( r !== false ) {
							item.removeClass('nex-form-multiselect-list-item-selected');
						}
					} else {
						var r = self.fireEvent('onItemSelected',[item,data,opt]);
						if( r !== false ) {
							item.addClass('nex-form-multiselect-list-item-selected');	
						}
					}
					sv = value;
				}
				if( item.hasClass( 'nex-form-multiselect-list-item-selected' ) ) {
					values.push( value );	
				}
			});
			
			self.multiselectScrollToItem(sv);
			
			var key = self.getInputKey();
			key.val( values.join(sDot) );
			return true;
		},
		_multiselectItemSelected : function(item,e){
			var self = this,
				undef,
				opt = self.configs,
				items = opt.items || [];	
			if( item === undef || e === undef ) return false;
			
			var value = $(item).attr('value');
			opt._firstIndex = value;
			opt._lastIndex = opt._lastIndex === null ? opt._firstIndex : opt._lastIndex;
			
			if( opt.isShiftKey ) {
				if( opt._firstIndex !== opt._lastIndex ) {
					//取得索引位置
					var _start,_end;
					$.each( items,function(i,v){
						if( v.value+'' === opt._firstIndex+'' ) {
							_start = i;	
						}	
						if( v.value+'' === opt._lastIndex+'' ) {
							_end = i;	
						}	
						if( _start !== undef && _end !== undef ) {
							return false;	
						}
					} );
					
					var start = Math.min( _start,_end );
					var end = Math.max( _start,_end );
					var size = Math.abs( end-start ) + 1 + start;

					var list = items.slice( start,size );

					value = [];
					for( var i=0;i<list.length;i++ ) {
						value.push( list[i]['value'] );	
					}
				}	
			}  else {
				opt._lastIndex = opt._firstIndex;	
			}
			
			if( opt.isShiftKey && opt.isCtrlKey ) {
				opt.isCtrlKey = false;	
			}
			
			self.val( value,opt.isCtrlKey );	
		},
		/*
		*滚动到指定item
		*/
		multiselectScrollToItem : function(val){
			var self = this;
			var opt = self.configs;	
			
			var body = self.getInput();
			
			if( !body.length ) {
				return self;	
			}
			
			var offset = body.offset();
			var h = body._outerHeight();
			
			var f = $('>.nex-form-multiselect-list-item[value='+val+']',body);
			if( !f.length ) {
				return self;	
			}
			
			var fo = f.offset();
			var fh = f._outerHeight();
			
			var outerHeight = 0;
			if( offset.top > fo.top ) {
				outerHeight = offset.top - fo.top;
			} else if( (offset.top+h) < (fo.top+fh) ) {
				outerHeight = (offset.top+h) - (fo.top+fh);
			}
			
			var sTop = 0;
	
			sTop = body.scrollTop() - outerHeight;
			
			body.scrollTop( sTop );
			
			return self;
		},
		multiselectGetValue : function(){
			var self = this;
			var opt = self.configs;	
			
			var key = self.getInputKey();
			return key.val();
		},
		//m=true 不清空已选择 m=false清空之前选择 默认
		multiselectSetValue : function(val,m){
			var self = this,undef;
			var opt = self.configs;
			
			self.multiselectItemSelected( val,m );
			
			return self;	
		},
		multiselectInit : function(){
			var self = this,undef;
			var opt = self.configs;
			var input = self.getInput();
			self.bind('onKeyDown.multiselect',function(input,e){
				opt.isCtrlKey = e.ctrlKey ? true : opt.isCtrlKey;		
				opt.isShiftKey = e.shiftKey ? true : opt.isShiftKey;
				if( e.keyCode===38 || e.keyCode===40 ) {
					opt.isCtrlKey = false;
					var index = opt._firstIndex;
					var ac = e.keyCode===38?'prev':'next';
					do {
						var item = $('>.nex-form-multiselect-list-item[value='+index+']',input)[ ac ]('.nex-form-multiselect-list-item');
						if( !item.size() ) break;
						index = item.attr('value');
						if( !item.hasClass('nex-form-multiselect-list-item-disabled') ) {
							//item.click();
							self._multiselectItemSelected( item,e );
							break;
						}
					} while(1);
				}
			});
			self.bind('onKeyUp.multiselect',function(input,e){
				opt.isCtrlKey = (e.keyCode===17) ? false : opt.isCtrlKey;		
				opt.isShiftKey = (e.keyCode===16) ? false : opt.isShiftKey;		
			});
		},
		multiselectBindItemsEvent : function(list){
			var self = this,
				undef,
				opt = self.configs,
				input = self.getInput(),
				items = opt._multiItems,
				list = list === undef ? $(">.nex-form-multiselect-list-item",input) : list;
					
			//事件绑定
			var events = {
				selectstart : function(e){
					return false;	
				},
				mouseenter : function(e){
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var value = $(this).attr( 'value' );
					var data = self.getItemData( value );
					var r = self.fireEvent("onItemOver",[this,data,e]);
					if( r === false ) return false;
					if( $(this).hasClass('nex-form-multiselect-list-item-disabled') ) return;
					$(this).addClass("nex-form-multiselect-list-item-over");
				},
				mouseleave : function(e){
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var value = $(this).attr( 'value' );
					var data = self.getItemData( value );
					var r = self.fireEvent("onItemOut",[this,data,e]);
					if( r === false ) return false;
					if( $(this).hasClass('nex-form-multiselect-list-item-disabled') ) return;
					$(this).removeClass("nex-form-multiselect-list-item-over");
				},
				click : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var value = $(this).attr( 'value' );
					var data = self.getItemData( value );
					var r = self.fireEvent("onItemClick",[this,data,e]);
					if( r === false ) return false;
					if( $(this).hasClass('nex-form-multiselect-list-item-disabled') ) return;
					
					self._multiselectItemSelected(this,e);
					
				},
				'mousedown' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var value = $(this).attr( 'value' );
					var data = self.getItemData( value );
					var r = self.fireEvent("onItemMouseDown",[this,data,e]);
					if( r === false ) return false;
					if( $(this).hasClass('nex-form-multiselect-list-item-disabled') ) return;
				},
				'mouseup' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var value = $(this).attr( 'value' );
					var data = self.getItemData( value );
					var r = self.fireEvent("onItemMouseUp",[this,data,e]);
					if( r === false ) return false;
					if( $(this).hasClass('nex-form-multiselect-list-item-disabled') ) return;
				},
				'dblclick' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var value = $(this).attr( 'value' );
					var data = self.getItemData( value );
					var r = self.fireEvent("onItemDblClick",[this,data,e]);
					if( r === false ) return false;
					if( $(this).hasClass('nex-form-multiselect-list-item-disabled') ) return;
				},
				'contextmenu' : function(e){	
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var value = $(this).attr( 'value' );
					var data = self.getItemData( value );
					var r = self.fireEvent("onItemContextMenu",[this,data,e]);
					if( r === false ) return false;
					if( $(this).hasClass('nex-form-multiselect-list-item-disabled') ) return;
				}
			};
			list.bind(events);
			list.each(function(){
				var $this = $(this);
				var index = $this.attr('itemindex');
				var item = items[index];
				$this.attr('value',item['value'])
					 .data('itemData',item);
			});
		},
		multiselectBindEvent : function(){
			var self = this,undef;
			var opt = self.configs;
			var input = self.getInput();
			
			var events = {
				'click' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return false;	
					}
					var r = self.fireEvent('onClick',[ this,e ]);	
					if( r === false ) return false;
				},
				'focus' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return false;	
					}
					var input = $('#'+opt.id+"-input");
					input.addClass('nex-form-focus');
					$('#'+opt.id+"").addClass('nex-form-wraper-focus');
					
					var r = self.fireEvent('onFocus',[ this,e ]);	
					if( r === false ) return false;
				},
				'blur' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var input = $('#'+opt.id+"-input");
					input.removeClass('nex-form-focus');
					
					$('#'+opt.id+"").removeClass('nex-form-wraper-focus');
					
					var r = self.fireEvent('onBlur',[ this,e ]);	
					if( r === false ) return false;
				},
				'keydown' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onKeyDown',[ this,e ]);	
					if( r === false ) return false;
				},
				'keyup' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onKeyUp',[ this,e ]);	
					if( r === false ) return false;
				},
				'keypress' : function(e){
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onKeyPress',[ this,e ]);	
					if( r === false ) return false;
				},
				'mouseenter' : function(e){
					if( opt.disabled || opt.readOnly ) {
						return;		
					}
					var r = self.fireEvent('onMouseOver',[ this,e ]);	
					if( r === false ) return false;
					
				},
				'mouseleave' : function(e){
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onMouseOut',[ this,e ]);	
					if( r === false ) return false;
				},
				'mousedown' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onMouseDown',[ this,e ]);	
					if( r === false ) return false;
				},
				'mouseup' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onMouseUp',[ this,e ]);	
					if( r === false ) return false;
				}
			};
			
			input.bind(events);
			
			self.multiselectBindItemsEvent();
			
		},
		multiselectSetSize : function(width,height){
			this.textareaSetSize(width,height);	
		},
		multiselectSearchItem : function(text,m){
			var self = this,
				undef,
				m = m === undef ? true : m,
				text = text === undef ? '' : text,
				opt = self.configs;
			var list = [];	
			var eid = self.bind('onMulitSelectItemCreate',function(item){
				var data = item[ m?'text':'value' ]+'';
				if( text === '' ) {
					list.push(item);	
					return true;
				};
				if( $.type(text) === 'regexp' ) {
					if( !text.test( data ) ) {
						return false;	
					}
				} else {
					
					if( data.indexOf( text.toString() ) === -1 ) {
						return false;	
					}	
				}
				list.push(item);	
			});
			self.multiselectRefreshList();
			self.unbind( 'onMulitSelectItemCreate',eid );
			return list;
		},
		//刷新
		multiselectRefreshSelected : function(){
			var self = this,
				undef,
				opt = self.configs,
				values = self.val();	
			self.val( values );		
		},
		multiselectMoveUpItem : function(value,step){
			var self = this,
				undef,
				opt = self.configs,
				step = step === undef ? 0 : (isNaN(parseInt(step)) ? 0 : parseInt(step)) ,
				items = opt.items || [],
				input = self.getInput();	
				
			if( value === undef ) return false;	
			
			var r = self.fireEvent("onItemBeforeMoveUp",[value,opt]);
			if( r === false ) return r;
				
			var index = self.getItemData( value,false );	
			
			var index = $.isArray( index ) ? index : [index];
			var len = items.length;
		
			$.each(index,function(i,index){
				var _step = index - step;
				_step = _step<0 ? 0 : _step;
				
				var _v1 = items[index]['value'];
				var _v2 = items[_step]['value'];
				
				self.array_move( items,index,_step,1 );
				
				if( index !== _step ) {
					var item1 = $('>.nex-form-multiselect-list-item[value='+_v1+']',input);
					var item2 = $('>.nex-form-multiselect-list-item[value='+_v2+']',input);
					item2.before( item1 );
				}
			});
			
			self.fireEvent("onItemMoveUp",[value,opt]);
			
			return true;
		},
		multiselectMoveDownItem : function(value,step){
			var self = this,
				undef,
				opt = self.configs,
				step = step === undef ? 0 : (isNaN(parseInt(step)) ? 0 : parseInt(step)) ,
				items = opt.items || [],
				input = self.getInput();	
				
			if( value === undef ) return false;	
			
			var r = self.fireEvent("onItemBeforeMoveDown",[value,opt]);
			if( r === false ) return r;
				
			var index = self.getItemData( value,false );	
			
			var index = $.isArray( index ) ? index : [index];
			var len = items.length;
		
			$.each(index,function(i,index){
				var _step = index + step;
				_step = _step>=len ? len-1 : _step;
				
				var _v1 = items[index]['value'];
				var _v2 = items[_step]['value'];
				
				self.array_move( items,index,_step,0 );
				if( index !== _step ) {
					var item1 = $('>.nex-form-multiselect-list-item[value='+_v1+']',input);
					var item2 = $('>.nex-form-multiselect-list-item[value='+_v2+']',input);
					item2.after( item1 );
				}
			});
			
			self.fireEvent("onItemMoveDown",[value,opt]);
			
			return true;
		},
		multiselectAddItem : function(data,after,m){
			var self = this,
				undef,
				opt = self.configs,
				after = after === undef ? true : after,
				m = m === undef ? false : m,
				items = opt.items || [],
				input = self.getInput();	
			var data = $.isArray( data ) ? data : [ data ];
			var text = [];
			var values = [];
			
			var r = self.fireEvent("onItemBeforeAdd",[data,opt]);
			if( r === false ) return r;
			
			$.each(data,function(i,item){
				if( !$.isPlainObject( item ) ) return;
				text.push( self.multiselectGetItemTpl(item) );
				if( item.selected ) {
					values.push( item.value );	
				}
			});
			
			var list = $( text.join('') );
			
			var ac = after ? 'append' : 'prepend';
			
			input[ac](list);
			
			self.multiselectBindItemsEvent(list);
			
			self.val( values.join( opt.multiSplit ),m );
			
			if( !after ) {
				data.reverse();	
			}
			$.each( data,function(i,v){
				items[ after?'push':'unshift' ]( v );					  
			} );
			
			opt.items = items;
			
			self.fireEvent("onItemAdd",[data,opt]);
			
			return true;
		},
		multiselectRemoveItem : function(value){
			var self = this,
				undef,
				opt = self.configs,
				sDot = opt.multiSplit,
				items = opt.items || [],
				input = self.getInput();	
			if( value === undef ) return false;	
			if( $.type( value ) === 'string' ) {
				value = value.split( sDot );	
			} else if( $.type( value ) !== 'array' ) {
				value = [ value ];	
			}	
			
			var r = self.fireEvent("onItemBeforeRemove",[value,opt]);
			if( r === false ) return r;
			
			var dels = {};
				
			$.each( value,function(i,v){
				var value;
				if( $.isPlainObject( v ) ) {
					if( 'value' in v ) {
						value = v.value;	
					}	
				} else {
					value = v;
				}
				if( value !== undef ) {
					dels[ value ] = true;	
				}
				$('>.nex-form-multiselect-list-item[value='+value+']',input).remove();
			} );
			
			self.array_splice( function(i,v){
				if( v.value in dels ) return true;	
			},items );
			
			self.fireEvent("onItemRemove",[value,opt]);
			
			return true;
		},
		multiselectDisabledItem : function(value){
			var self = this,
				undef,
				opt = self.configs,
				sDot = opt.multiSplit,
				input = self.getInput();
				
			var values = self.getItemData( value );	
			
			values = $.isArray( values ) ? values : [values];
			
			var r = self.fireEvent("onItemBeforeDisabled",[values,opt]);
			if( r === false ) return r;	
			
			$.each(values,function(i,v){
				var value = v.value;
				var item = $('>.nex-form-multiselect-list-item[value='+value+']',input);
				if( !item.length ) return false;
				item.removeClass('nex-form-multiselect-list-item-selected')
				.addClass('nex-form-multiselect-list-item-disabled');
				v.disabled = true;	
			});
			
			self.multiselectRefreshSelected();
			
			self.fireEvent("onItemDisabled",[values,opt]);
			
			return true;
		},
		multiselectEnableItem : function(value){
			var self = this,
				undef,
				opt = self.configs,
				sDot = opt.multiSplit,
				input = self.getInput();
				
			var values = self.getItemData( value );	
			
			values = $.isArray( values ) ? values : [values];
			
			var r = self.fireEvent("onItemBeforeEnable",[values,opt]);
			if( r === false ) return r;	
			
			$.each(values,function(i,v){
				var value = v.value;
				var item = $('>.nex-form-multiselect-list-item[value='+value+']',input);
				if( !item.length ) return false;
				item.removeClass('nex-form-multiselect-list-item-disabled');
				v.disabled = false;	
					
			});
			
			self.fireEvent("onItemEnable",[values,opt]);
			
			return true;
		},
		multiselectRefreshList : function( items ){
			var self = this,
				undef,
				opt = self.configs,
				items = $.isArray( items ) ? items :  (opt.items || []),
				text = [],
				input = self.getInput();	
			opt._multiItems.length = 0;	
			for( var x=0;x<items.length;x++ ) {
				text.push( self.multiselectGetItemTpl( items[x] ) );	
			}
			input.html( text.join('') );
			self.multiselectBindItemsEvent();
			self.multiselectRefreshSelected();
			
			self.fireEvent("onRefreshList",[opt]);
			
			return true;
		},
		multiselectGetItemTpl : function(item){
			var self = this,
				undef,
				opt = self.configs;	
			if( item === undef || $.type(item) !== 'object' ) return '';
			item = $.extend({},opt._item,item);
			item.value = self._undef( item.value,item.text );
			item.text = self._undef( item.text,item.value );
			var icls = [];
			if( item['disabled'] ) {
				icls.push('nex-form-multiselect-list-item-disabled');	
			}
			/*if( item['selected'] ) {
				icls.push('nex-form-multiselect-list-item-selected');	
			}*/
			
			var index = opt._multiItems.push( item ) - 1;//value="'+item['value']+'" 
			
			if( $.isFunction( opt.listFilter ) ) {
				var r = opt.listFilter.call( self,item );
				if( r === false ) return '';
			}
			var r = self.fireEvent("onMulitSelectItemCreate",[item,opt]);
			if( r === false ) return'';
			return '<div itemindex='+index+' '+item['attrs']+' '+ ( 'title' in item ? ('title="'+item.title+'"') : ""  ) +' class="nex-form-multiselect-list-item '+item['cls']+' '+icls.join(' ')+'">'+self.tpl(item['text'],item)+'</div>';	
		},
		multiselectTpl : function(d){
			if( !d ) return "";
			var self = this,
				opt = self.configs;
			var text = [];
			opt._multiItems.length = 0;	
			text.push('<div class="nex-form-wraper '+d.cls+' nex-field-'+d.group+'" style="" id="'+d.id+'">');
				text.push('<table id="'+d.id+'-item" class="nex-field nex-form-item" cellspacing="0" cellpadding="0"><tbody>');
				text.push('<tr id="'+d.id+'-inputRow">');
					text.push('<td class="nex-form-item-body" id="'+d.id+'-body" style="width: 100%;">');
						text.push('<div '+d.attrs+' id="'+d.id+'-list" class="nex-form-multiselect-list">');
							text.push('<div id="'+d.id+'-input" style="height:'+opt.height+'" class="nex-form-multiselect-list-body" tabindex="-1">');
								var items = self._undef(opt.items,[]);
								for( var x=0;x<items.length;x++ ) {
									text.push( self.multiselectGetItemTpl( items[x] ) );	
								}
							text.push('</div>');
						text.push('</div>');
						text.push('<input id="'+d.id+'-input-key" type="hidden"  name="'+d.name+'" value="" />');
					text.push('</td>');
				text.push('</tr>');
			text.push('</tbody></table></div>');
			return text.join("");		
		},
		/*
		*搜索输入框
		*/
		searchGetValue : function(){
			var self = this,undef;
			return self.selectGetValue();	
		},
		searchSetValue : function(val,stext){
			var self = this,undef;	
			self.selectSetValue.apply(self,arguments);
			return self;
		},
		searchResult : function( text ){
			var self = this,undef;
			var opt = self.configs;
			var items = opt.items;
			var input = self.getInput();
			var list = [];
			var text = text === undef ? input.val() : text;
			if( text === '' && opt.emptyOnShowAll ) {
				return items;
			}
			for( var i=0;i<items.length;i++ ) {
				var item = items[i];	
				item.text = item.text === undef ? '' : item.text+'';
				if( item.text.indexOf( text ) !== -1 ) {
					list.push(item);	
				}
			}
			return list;	
		},
		searchShowResult : function( list ){
			var self = this,undef;
			var opt = self.configs;	
			self.selectHideList();
			self.selectShowList( list || self.searchResult() );
		},
		searchSetSize : function(width,height){
			this.comboSetSize(width,height);	
		},
		searchBindEvent : function(width,height){
			var self = this;
			var opt = self.C();
			self.comboBindEvent();
			var input = self.getInput();
			var events = {
				'keydown.2' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					opt._oldVal2 = opt._oldVal2 === null ? input.val() : opt._oldVal2;
				},
				'keyup.2' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var val = input.val();
					if( opt._oldVal2 !== val && opt._oldVal2!==null ) {
						opt._oldVal2 =null;
						if( e.keyCode !== 13 ) {
							var r = self.fireEvent('onSearchChange',[ this,opt._oldVal2,val,e ]);	
							if( r === false ) return false;
						}
					}
				}
			};
			input.bind(events);
		},
		searchInit : function(){
			var self = this,undef;
			var opt = self.configs;
			opt.selectReadOnly = false;
			self.bind('onComboClick.search',function(input,e){
				self.searchShowResult( opt.items );
				self.focus();
			});
			self.bind('onClick.search',function(input,e){
				var list = $('#'+opt.id+'_list');
				if( !list.size() ) {
					self.searchShowResult(  );
				}
			});
			self.bind('onSearchChange.search',function(input,e){
				if( self._seachDelay ) {
					clearTimeout( self._seachDelay );	
				}
				self._seachDelay = setTimeout(function(){
					self.searchShowResult();	
				},50);
			});
		},
		searchTpl : function(d){
			var self = this,
				opt = self.configs;
			return self.selectTpl(d);
		},
		spinnerBindEvent : function(){
			var self = this;
			var opt = self.configs;
			self.commonEvent();
			
			var input = $("#"+opt.id+'-input');
			var _sup = $("#"+opt.id+"-spinner-up");
			var _sdown = $("#"+opt.id+"-spinner-down");
			var _supEvents = {
				'click' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onSpinnerUpClick',[ input.get(0),e ]);	
					if( r === false ) return false;
					var r = self.fireEvent('onClick',[ input.get(0),e ]);	
					if( r === false ) return false;
				},
				'mouseenter' : function(e){
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onSpinnerUpOver',[ input.get(0),e ]);	
					if( r === false ) return false;
					var r = self.fireEvent('onMouseOver',[ input.get(0),e ]);	
					if( r === false ) return false;
					_sup.addClass("nex-form-spinner-up-over");
				},
				'mouseleave' : function(e){
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onSpinnerUpOut',[ input.get(0),e ]);	
					if( r === false ) return false;
					var r = self.fireEvent('onMouseOut',[ input.get(0),e]);	
					if( r === false ) return false;
					_sup.removeClass("nex-form-spinner-up-over");
					//
					//_sup.removeClass("nex-form-spinner-up-click");	
					//self.fireEvent('onSpinnerUpMouseUp',[ input.get(0),e ]);	
					//self.fireEvent('onMouseUp',[ input.get(0),e]);
				},
				'mousedown' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onSpinnerUpMouseDown',[ input.get(0),e ]);	
					if( r === false ) return false;
					var r = self.fireEvent('onMouseDown',[ input.get(0),e]);	
					if( r === false ) return false;
					_sup.addClass("nex-form-spinner-up-click");
					$(document).mouseup(function(){
						_sup.removeClass("nex-form-spinner-up-click");	
						self.fireEvent('onSpinnerUpMouseUp',[ input.get(0),e ]);	
						self.fireEvent('onMouseUp',[ input.get(0),e]);	
					});
				},
				'mouseup' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onSpinnerUpMouseUp',[ input.get(0),e ]);	
					if( r === false ) return false;
					var r = self.fireEvent('onMouseUp',[ input.get(0),e]);	
					if( r === false ) return false;
					_sup.removeClass("nex-form-spinner-up-click");
				}
			};
			var _sdownEvents = {
				'click' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onSpinnerDownClick',[ input.get(0),e ]);	
					if( r === false ) return false;
					var r = self.fireEvent('onClick',[ input.get(0),e ]);	
					if( r === false ) return false;
				},
				'mouseenter' : function(e){
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onSpinnerDownOver',[ input.get(0),e ]);	
					if( r === false ) return false;
					var r = self.fireEvent('onMouseOver',[ input.get(0),e ]);	
					if( r === false ) return false;
					_sdown.addClass("nex-form-spinner-down-over");
				},
				'mouseleave' : function(e){
					if( opt.disabled || opt.readOnly ) {
						return;		
					}
					var r = self.fireEvent('onSpinnerDownOut',[ input.get(0),e ]);	
					if( r === false ) return false;
					var r = self.fireEvent('onMouseOut',[ input.get(0),e]);	
					if( r === false ) return false;
					_sdown.removeClass("nex-form-spinner-down-over");
					//
					//_sdown.removeClass("nex-form-spinner-down-click");	
					//self.fireEvent('onSpinnerDownMouseUp',[ input.get(0),e ]);	
					//self.fireEvent('onMouseUp',[ input.get(0),e]);	
				},
				'mousedown' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onSpinnerDownMouseDown',[ input.get(0),e ]);	
					if( r === false ) return false;
					var r = self.fireEvent('onMouseDown',[ input.get(0),e]);	
					if( r === false ) return false;
					_sdown.addClass("nex-form-spinner-down-click");
					$(document).mouseup(function(){
						_sdown.removeClass("nex-form-spinner-down-click");	
						self.fireEvent('onSpinnerDownMouseUp',[ input.get(0),e ]);	
						self.fireEvent('onMouseUp',[ input.get(0),e]);	
					});
				},
				'mouseup' : function(e) {
					if( opt.disabled || opt.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onSpinnerDownMouseUp',[ input.get(0),e ]);	
					if( r === false ) return false;
					var r = self.fireEvent('onMouseUp',[ input.get(0),e]);	
					if( r === false ) return false;
					_sdown.removeClass("nex-form-spinner-down-click");
				}
			};
			_sup.bind( _supEvents );
			_sdown.bind( _sdownEvents );
			
		},
		spinnerSetSize : function(width,height){
			var self = this;
			var opt = self.configs;
			
			var $table = $("#"+opt.id+"-item");
			
			var $input = $("#"+opt.id+"-input");
			
			$("#"+opt.id)._outerWidth( width );
			
			var lw = 0;
			$("#"+opt.id+"-inputRow >td.nex-form-label-cell").each(function(){
				lw += $(this)._outerWidth();																
			});
			$("#"+opt.id+"-inputRow >td.nex-form-spinner-cell").each(function(){
				lw += $(this)._outerWidth();																
			});
			$("#"+opt.id+"-inputRow >td.nex-form-button-cell").each(function(){
				lw += $(this)._outerWidth();																
			});
			
			$table._outerWidth( width );
			
			$input._outerWidth( width - lw );	
		},
		spinnerTpl : function(d){
			if( !d ) return "";
			var self = this,
				opt = self.configs;
			var text = [];
			text.push('<div class="nex-form-wraper '+d.cls+' nex-field-'+d.group+'" style="" id="'+d.id+'">');
				text.push('<table id="'+d.id+'-item" class="nex-field nex-form-item" cellspacing="0" cellpadding="0"><tbody>');
				text.push('<tr id="'+d.id+'-inputRow">');
					text.push('<td class="nex-form-item-body" id="'+d.id+'-body" style="width: 100%;">');	
						text.push('<input '+d.attrs+' id="'+d.id+'-input" placeholder="'+d.placeholder+'" type="text"  name="'+d.name+'" value="" style="width:0px;" class="nex-form-field nex-form-text" autocomplete="'+d.autocomplete+'" />');
					text.push('</td>');
					text.push('<td class="nex-form-spinner-cell nex-form-'+d.type+'-cell" id="'+d.id+'-spinner-cell">');	
						text.push('<div class="nex-form-spinner nex-form-'+d.type+'-spinner nex-form-spinner-up nex-form-'+d.type+'-spinner-up" id="'+d.id+'-spinner-up"></div>');
						text.push('<div class="nex-form-spinner nex-form-'+d.type+'-spinner nex-form-spinner-down nex-form-'+d.type+'-spinner-down" id="'+d.id+'-spinner-down"></div>');
					text.push('</td>');
				text.push('</tr>');
			text.push('</tbody></table></div>');
			return text.join("");	
		},
		numberInit : function(){
			var self = this,undef;
			var opt = self.configs;
			self.bind("onSpinnerUpMouseDown",function(el,e){
				clearTimeout( opt.pollTid1 );
				clearInterval( opt.pollTid2 );
				opt.pollTid1 = setTimeout(function(){			
					opt.pollTid2 = setInterval(function(){
						self.fireEvent("onSpinnerUpClick",[el,e]);
					},opt.poll2);
				},opt.poll1);									  
			});
			self.bind("onSpinnerUpMouseUp",function(){	
				clearTimeout( opt.pollTid1 );
				clearInterval( opt.pollTid2 );
			});
			self.bind("onSpinnerUpOut",function(){	
				clearTimeout( opt.pollTid1 );
				clearInterval( opt.pollTid2 );
			});
			self.bind("onSpinnerDownMouseDown",function(el,e){
				clearTimeout( opt.pollTid1 );
				clearInterval( opt.pollTid2 );
				opt.pollTid1 = setTimeout(function(){			
					opt.pollTid2 = setInterval(function(){
						self.fireEvent("onSpinnerDownClick",[el,e]);
					},opt.poll2);
				},opt.poll1);									  
			});
			self.bind("onSpinnerDownOut",function(){	
				clearTimeout( opt.pollTid1 );
				clearInterval( opt.pollTid2 );
			});
			self.bind("onSpinnerDownMouseUp",function(){	
				clearTimeout( opt.pollTid1 );
				clearInterval( opt.pollTid2 );
			});
			self.bind("onSpinnerUpClick",function(){
				var value = self.val();
				value = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
				self.val( value + opt.step );
			});
			self.bind("onSpinnerDownClick",function(){
				var value = self.val();
				value = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
				self.val( value - opt.step );								 
			});
		},
		numberSetValue : function(num){
			var self = this,
				opt = this.configs;	
				
			var num = isNaN(parseFloat(num)) ? 0 : parseFloat(num);
			if( opt.smin !== null ) {
				num = Math.max( num,opt.smin );
			}
			if( opt.smax !== null ) {
				num = Math.min( num,opt.smax );
			}
			
			var fix = opt.step.toString();
			var fix=fix.split(".");
			if( fix.length == 2 ) {
				fix = fix[1].toString().length;
			} else {
				fix = 0;	
			}
			if( num.toString().split(".").length>=2 ) {
				self.commonSetValue(num.toFixed(fix));
			} else {
				self.commonSetValue(num);	
			}
			return self;
		},
		numberBindEvent : function(){
			this.spinnerBindEvent();
		},
		numberSetSize : function(width,height){
			this.spinnerSetSize(width,height);
		},
		numberTpl : function(d){
			return this.spinnerTpl(d);	
		},
		radioSetSize : function(width,height){
			var self = this;
			var opt = self.configs;
			
			var $table = $("#"+opt.id+"-item");
			
			var $input = $("#"+opt.id+"-radio-wraper");
			
			$("#"+opt.id)._outerWidth( width );
			
			var lw = 0;
			$("#"+opt.id+"-inputRow >td.nex-form-label-cell").each(function(){
				lw += $(this)._outerWidth();																
			});
			$("#"+opt.id+"-inputRow >td.nex-form-button-cell").each(function(){
				lw += $(this)._outerWidth();																
			});
			
			$table._outerWidth( width );
			
			$input._outerWidth( width - lw );	
		},
		radioReadOnly : function(){},
		radioDisabled : function(){
			var self = this;
			var opt = self.configs;
			var text = $("#"+opt.id+"-radio-wraper");
			$(":radio[name='"+opt.name+"']",text).each(function(){
				$(this).attr("disabled",'true');	
			});
		},
		radioEnable : function(){
			var self = this;
			var opt = self.configs;
			var text = $("#"+opt.id+"-radio-wraper");
			$(":radio[name='"+opt.name+"']",text).each(function(){
				$(this).removeAttr("disabled");	
			});	
		},
		radioSetValue : function(val){
			var self = this;
			var opt = self.configs;
			
			if( !arguments.length )  return self;
			val = val + '';
			
			var text = $("#"+opt.id+"-radio-wraper");
			$(":radio[name='"+opt.name+"']",text).each(function(){
				//$(this).removeAttr("checked");
				this.checked = false;
				if( $(this).val() === val ) {
					//$(this).attr("checked",'true');	
					this.checked = true;
				}
			});
			return self;
		},
		radioGetValue : function(){
			var self = this;
			var opt = self.configs;
			var text = $("#"+opt.id+"-radio-wraper");
			var obj = text.find("input[name='"+opt.name+"']");
			var value = '';
			//radio
			if( obj.is(":radio") ) {
				value = text.find(":radio[name='"+opt.name+"']:checked").val();
			}
			return $.trim(value);
		},
		radioBindEvent : function(){
			var self = this;
			var opt = self.configs;
			var text = $("#"+opt.id+"-radio-wraper");
			var radios = text.find(":radio[name='"+opt.name+"']");
			if( !radios.length ) {
				return self;
			}
			var events = {
				click : function(e) {
					var value = $(this).val();
					if( opt.value != value ) {
						self.fireEvent('onChange',[]);		
					}
					var r = self.fireEvent('onClick',[ this,e ]);	
					if( r === false ) return false;
				}	
			};
			radios.bind(events);
		},
		radioTpl : function(d){
			if( !d ) return "";
			var self = this,
				opt = self.configs;
			var text = [];
			text.push('<div class="nex-form-wraper '+d.cls+' nex-field-'+d.group+'" style="" id="'+d.id+'">');
				text.push('<table id="'+d.id+'-item" class="nex-field nex-form-item" cellspacing="0" cellpadding="0"><tbody>');
				text.push('<tr id="'+d.id+'-inputRow">');
					text.push('<td class="nex-form-item-body" id="'+d.id+'-body" style="width: 100%;">');	
						text.push('<div id="'+d.id+'-radio-wraper" class="nex-form-radio-wraper">');
							var items = opt.items;
							for(var i=0;i<items.length;i++) {
								if( !$.isPlainObject( items[i] ) ) {
									continue;
								}
								var _item = items[i] = $.extend({},opt._item,items[i]);
								_item.value = self._undef( _item.value,_item.text );
								_item.text = self._undef( _item.text,_item.value );
								
								if(_item.disabled){
									_item.attrs += 'disabled';
									_item.cls +=' nex-form-disabled-radio';
								}
								if(_item.readOnly){
									_item.attrs += ' readOnly ';
									_item.cls +=' nex-form-readonly-radio';
								}
								
								var str = '<div class="nex-form-radio-item '+_item.cls+'" ><input '+_item.attrs+' type="radio" id="'+d.id+'-input-'+i+'" value="'+_item.value+'" name="'+opt.name+'" class="nex-form-field nex-form-radio" ><label id="'+d.id+'-label-input-'+i+'" class="nex-form-cb-label nex-form-cb-label-after" for="'+d.id+'-input-'+i+'">'+_item.text+'</label></div>';
								text.push(str);
								if( _item.display == 'block' ) {
									text.push('<div class="nex-clear"></div>');	
								}
							}
							text.push('<div class="nex-clear"></div>');	
						text.push('</div>');
					text.push('</td>');
				text.push('</tr>');
			text.push('</tbody></table></div>');
			return text.join("");
		},
		checkboxSetSize : function(width,height){
			var self = this;
			var opt = self.configs;
			
			var $table = $("#"+opt.id+"-item");
			
			var $input = $("#"+opt.id+"-checkbox-wraper");
			
			$("#"+opt.id)._outerWidth( width );
			
			var lw = 0;
			$("#"+opt.id+"-inputRow >td.nex-form-label-cell").each(function(){
				lw += $(this)._outerWidth();																
			});
			$("#"+opt.id+"-inputRow >td.nex-form-button-cell").each(function(){
				lw += $(this)._outerWidth();																
			});
			
			$table._outerWidth( width );
			
			$input._outerWidth( width - lw );	
		},
		checkboxReadOnly : function(){},
		checkboxDisabled : function(){
			var self = this;
			var opt = self.configs;
			var text = $("#"+opt.id+"-checkbox-wraper");
			$(":checkbox[name='"+opt.name+"']",text).each(function(){
				$(this).attr("disabled",'true');	
			});
		},
		checkboxEnable : function(){
			var self = this;
			var opt = self.configs;
			var text = $("#"+opt.id+"-checkbox-wraper");
			$(":checkbox[name='"+opt.name+"']",text).each(function(){
				$(this).removeAttr("disabled");	
			});	
		},
		checkboxSetValue : function(val){
			var self = this;
			var opt = self.configs;

			if( !arguments.length )  return self;
			
			var text = $("#"+opt.id+"-checkbox-wraper");
			var val = val+'';
			val = val.split(opt.multiSplit);
			
			$(":checkbox[name='"+opt.name+"']",text).each(function(){
				//$(this).removeAttr("checked");
				this.checked = false;
				if( self.inArray( $(this).val(),val ) != -1 ) {
					//$(this).attr("checked",'true');	
					this.checked = true;
				}
			});
			return self;
		},
		checkboxGetValue : function(){
			var self = this;
			var opt = self.configs;
			var text = $("#"+opt.id+"-checkbox-wraper");
			var obj = text.find("input[name='"+opt.name+"']");
			//checkbox
			var value = "";
			if( obj.is(":checkbox") ) {
				value = [];
				text.find(":checkbox[name='"+opt.name+"']:checked").each(function(){ 
					value.push( $(this).val() ); 
				})
				value = value.join( opt.multiSplit );
			}
			return $.trim(value);
		},
		checkboxBindEvent : function(){
			var self = this;
			var opt = self.configs;
			var text = $("#"+opt.id+"-checkbox-wraper");
			var checkboxs = text.find(":checkbox[name='"+opt.name+"']");
			if( !checkboxs.length ) {
				return self;
			}
			var events = {
				click : function(e) {
					self.fireEvent('onChange',[]);	
					var r = self.fireEvent('onClick',[ this,e ]);	
					if( r === false ) return false;
				}	
			};
			checkboxs.bind(events);
		},
		checkboxTpl : function(d){
			if( !d ) return "";
			var self = this,
				opt = self.configs;
			var text = [];
			text.push('<div class="nex-form-wraper '+d.cls+' nex-field-'+d.group+'" style="" id="'+d.id+'">');
				text.push('<table id="'+d.id+'-item" class="nex-field nex-form-item" cellspacing="0" cellpadding="0"><tbody>');
				text.push('<tr id="'+d.id+'-inputRow">');
					text.push('<td class="nex-form-item-body" id="'+d.id+'-body" style="width: 100%;">');	
						text.push('<div id="'+d.id+'-checkbox-wraper" class="nex-form-checkbox-wraper">');
							var items = opt.items;
							for(var i=0;i<items.length;i++) {
								if( !$.isPlainObject( items[i] ) ) {
									continue;
								}
								var _item = items[i] = $.extend(true,{},opt._item,items[i]);
								_item.value = self._undef( _item.value,_item.text );
								_item.text = self._undef( _item.text,_item.value );
								
								if(_item.disabled){
									_item.attrs += 'disabled';
									_item.cls +=' nex-form-disabled-checkbox';
								}
								if(_item.readOnly){
									_item.attrs += ' readOnly ';
									_item.cls +=' nex-form-readonly-checkbox';
								}
								
								var str = '<div class="nex-form-checkbox-item '+_item.cls+'" ><input '+_item.attrs+' type="checkbox" id="'+d.id+'-input-'+i+'" value="'+_item.value+'" name="'+opt.name+'" class="nex-form-field nex-form-checkbox" ><label id="'+d.id+'-label-input-'+i+'" class="nex-form-cb-label nex-form-cb-label-after" for="'+d.id+'-input-'+i+'">'+_item.text+'</label></div>';
								text.push(str);
								if( _item.display == 'block' ) {
									text.push('<div class="nex-clear"></div>');	
								}
							}
							text.push('<div class="nex-clear"></div>');	
						text.push('</div>');
					text.push('</td>');
				text.push('</tr>');
			text.push('</tbody></table></div>');
			return text.join("");
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
		}
	});
	

	
	$.fn.nexform = function(_opt){
		if(this.size()<=0){
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
				labelText : $(this).attr('label') || '',
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
			
			var extform = new Nex.form(opt);
			
			list.push(extform);
		});
		
		if( this.size() == 1 ) {
			return list[0];
		} else {
			return list	;
		}
	};
	$.fn.extform = $.fn.nexform;
})(jQuery);