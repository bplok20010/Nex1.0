/*
Nex.base
http://www.extgrid.com
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱
v1.0
1.
*/
var Nex = Nex || (function(win,$){
	"use strict";	
	var uaMatch = /msie ([\w.]+)/.exec( navigator.userAgent.toLowerCase() ) || [];
	/*如果是IE浏览器 加上各版本样式*/
	$(document).ready(function(){
		if( Nex.isIE && Nex.IEVer ) {
			var cls = ['nex-ie'];
			var bd = $(document.body);
			cls.push( 'nex-ie'+Nex.IEVer );
			/*for( var _ver = 6;_ver<=Nex.IEVer;_ver++ ) {
				cls.push( 'nex-ie'+_ver );
			} 	*/
			bd.addClass( cls.join(' ') );
			//$('html').addClass( cls.join(' ') );
		}
	});
	return {
		aid : 1,
		ajax : $.ajax,
		zIndex : 99999,
		scrollbarSize : false,
		resizeOnHidden : true,
		isIE : uaMatch.length ? true : false,
		IEVer : parseFloat( uaMatch[ 1 ], 10 ), //如果非IE 会是NaN
		isIE6 : parseFloat( uaMatch[ 1 ], 10 ) === 6, 
		isIE7 : parseFloat( uaMatch[ 1 ], 10 ) === 7, 
		isIE8 : parseFloat( uaMatch[ 1 ], 10 ) === 8, 
		isIE9 : parseFloat( uaMatch[ 1 ], 10 ) === 9, 
		template : {
			cache : {},
			helper : $.noop,//兼容用
			ltag : '<%',//不能修改
			rtag : '%>',//不能修改
			compile : function(str, data){
				var fn = this.cache[str] ? this.cache[str] :
				 new Function("obj",
				"var p=[],print=function(){p.push.apply(p,arguments);};" +
				"with(obj){p.push('" +
				str
				  .replace(/[\r\t\n]/g, " ")
				  .split(this.ltag).join("\t")
				  .replace(new RegExp("((^|"+this.rtag+")[^\t]*)'","g"), "$1\r")
				  .replace(new RegExp("\t=(.*?)"+this.rtag,"g"), "',$1,'")
				  .split("\t").join("');")
				  .split(this.rtag).join("p.push('")
				  .split("\r").join("\\'")
			  + "');}return p.join('');");
				this.cache[str] = fn;
				return data ? fn( data ) : fn;
			}
		},
		widget : function(name){
			var base = function( opt ){
				var opt = opt || {};
				this.init(opt);	
			};	
			
			if( name ) {
				Nex[name] = base;	
			}
			
			/*
			*添加xtype
			*/
			if( Nex.Manager ) {
				Nex.Manager.addXtype(name,function(opt){
					return new Nex[name](opt);									   
				});	
			}
			
			base.fn = base.prototype = {};
			base.fn.extend = function(obj){
				$.extend(this,obj);
			};
			base.extend = function(obj){
				$.extend(this,obj);	
			};
			
			//原型设置
			base.constructor = base.prototype.constructor = base;
			base.prototype.superclass = null;
			base.fn = base.prototype;
			
			base.extend({
				puglins : [],
				puglinsConf : {},
				puglinsEvent : {},
				defaults : {},
				eventMaps : {},//事件名映射或者别名 别名:映射名
				addExtConf : function(conf){
					var d = {};
					if( $.isFunction( conf ) ) {
						var d = conf.call( this ) || {};	
					} else {
						d = conf;	
					}
					$.extend( this.puglinsConf,d );
				},
				addExtEvent : function(events){	
					var d = {};
					if( $.isFunction( events ) ) {
						var d = events.call( this ) || {};	
					} else {
						d = events;	
					}
					$.extend( this.puglinsEvent,d );
				},
				addEventMaps : function(maps){	
					var d = {};
					if( $.isFunction( maps ) ) {
						var d = maps.call( this ) || {};	
					} else {
						d = maps;	
					}
					$.extend( this.eventMaps,d );
				},
				_optionsList : [],
				setOptions : function( options ){
					if( $.isPlainObject( options ) || $.isFunction( options ) ) {
						this._optionsList.push( options );
					}
				},
				getOptions : function(self){
					var list = this._optionsList;
					var opt = {};
					for( var i=0;i<list.length;i++ ) {
						var o = list[i];
						$.extend( opt, $.isFunction( o ) ? o(self||this) : o  );	
					}
					return opt;
				},
				_def : function(self){ 
					var self = self || this;
					return {
						_base : this.constructor,
						prefix : 'nex_',
						id : '',
						_isInit : false,
						_isResize : false,
						stopOnFalse : true,
						autoRecovery : false,//自动回收 回收后通过Nex.get获取不到组件
						autoSetResize : false,//是否根据用户的width height 自动设置autoResize
						autoResize : false,
						autoScroll : false,
						resizeOnHidden : Nex.resizeOnHidden,//作废
						cls : '',
						cutHeight : 0,
						cutWidth : 0,
						autoSize : false,
						width : '100%',
						height : '100%',
						maxWidth : 0,
						maxHeight : 0,
						minHeight : 0,
						minWidth : 0,
						realWidth : null,//实际 ,width=auto时 如果max min width height 没起作用那么realWidth = auto
						realHeight : null,//实际
						_width : null,//和realWidth 不同的是 _width是一个数值
						_height : null,
						__width : 0,
						__height : 0,
						tpl : {},
						template : typeof template === 'undefined' ? Nex.template : template,//模板引擎对象
						scrollbarSize : false,
						noop : $.noop,
						self : null,
						init : $.noop,//初始化调用
						renderTo : null,//helper
						views : {},
						items : [],
						isEscape : false,
						cacheData : {},
						_childrenList : [],//当前组件下的之组件，并不严禁， 一般做清除用
						_boxModel : true,
						eventMaps : {},
						events : {}//事件组合 	
					};
				},
				extSet : function( opt,self ){
					
					var opt = $.extend( {},this._def(self),opt );
					//扩展事件
					$.extend( opt.events,this.puglinsEvent );	
					//事件名映射扩展
					$.extend( opt.eventMaps,this.eventMaps );	
					
					return $.extend({},this.puglinsConf,opt);
				},
				getDefaults : function(opt,self){
					var _opt = {};
					var _opt = this.extSet(_opt,self);
					
					return $.extend({},_opt,opt);
				},
				_undef : function (val, defaultVal) {
					return val === undefined ? defaultVal : val;
				},
				_Tpl : {}
				
			});
			base.fn.extend({
				init : function(options) {
					var self = this;
					self.initEvents(options);//初始化用户自定义事件
					
					self._isNex = true;
					
					var constructor = self.constructor;
					self.configs = 	$.extend({},constructor.getDefaults( constructor.getOptions(self),self ),options);
					var opt = self.configs;
					opt.self = self;
		
					self._eventLocks = {};
		
					opt.id = opt.id || self.getId();
					
					opt._isInit = true;
					
					$.support.boxModel = $.support.boxModel === null ? opt._boxModel : $.support.boxModel;
					
					//系统初始化调用
					opt.init.call(self,opt);
					
					//系统事件绑定
					self.sysEvents();
					
					self._onStart(opt);//设置用户自定义事件
					
					self.fireEvent("onStart",[opt]);
					
					opt.cls = 'nex-component-item '+opt.cls;
					
					//addManager
					if( Nex.Manager ) {
						Nex.Manager.components[opt.id] = self;
					}
					if( Nex.Manager && opt.autoResize ) {
						Nex.Manager.addCmp( opt.id,self );	
						opt.cls += ' nex-resize-auto'; 
					}
					//保存初始设置值
					opt.__width = opt.width;
					opt.__height = opt.height;
					
					if( '_init' in self ) {
						self._init( opt );
					}
					
				},
				/*
				* @m default=false true(更新层级关系)
				*/
				enableAutoResize : function( m ){
					var self = this,undef;
					var opt = self.configs;		
					opt.autoResize = true;
					if( Nex.Manager ) {
						Nex.Manager.addCmp( opt.id,self );
					}
					var dom = self.getDom();
					if( !dom.hasClass('nex-resize-auto') ) {
						dom.addClass('nex-resize-auto');	
					}
					if( m ) {
						Nex.Manager.mapCmp2();	
					}
				},
				/*
				* @m default=false true(更新层级关系)
				*/
				disabledAutoResize : function( m ){
					var self = this,undef;
					var opt = self.configs;	
					opt.autoResize = false;
					if( Nex.Manager ) {
						Nex.Manager.removeCmp( opt.id );
					}
					var dom = self.getDom();
					if( dom.hasClass('nex-resize-auto') ) {
						dom.removeClass('nex-resize-auto');	
					}
					if( m ) {
						Nex.Manager.mapCmp2();	
					}
				},
				//数组移动算法
				// pos 要移动的元素
				array_move : Nex.array_move,
				/*
				*删除数组元素 index 为下标或者下表数组 或者回调函数 回调返回true即可
				*/
				array_splice : Nex.array_splice,
				/*				
				*数组插入 index 需要插入的位置 arr源数组,_arr需要插入的值可以是数组,t 0后面  1前面
				*/
				array_insert : Nex.array_insert,
				array_clear : Nex.array_clear,
				array_copy : Nex.array_copy,
				//解决数组迭代时使用splice问题方案,在迭代之前应该使用copyArray复制出来
				copyArray : Nex.copyArray,
				//copy只是对数组或对象只是增加一个引用计数，并不是深复制
				copy : Nex.copy,
				str_number : Nex.str_number,
				_undef : function (val, d) {
					return val === undefined ? d : val;
				},
				distArr : function( arr ){
					var obj={},temp=[];
					for(var i=0;i<arr.length;i++){
						if(!obj[arr[i]]){
							temp.push(arr[i]);
							obj[arr[i]] =true;
						}
					}
					return temp;	
				},
				//只接受 字符串 number 
				inArray : function(elem,arr){
					if( $.type( elem ) === 'number' ) {
						elem = elem+'';	
					}
					if ( arr ) {
						var len = arr.length;
						var i = 0;
						for ( ; i < len; i++ ) {
							// Skip accessing in sparse arrays
							var v = arr[ i ];
							if( $.type( v ) === 'number' ) {
								v = v+'';	
							}
							if ( i in arr && (v === elem) ) {
								return i;
							}
						}
					}
					return -1;
				},
				/*判断是否出现滚动条*/
				hasScroll: function( el, a ) {
					
					var el = $(el)[0];//el 是dom
					
					//If overflow is hidden, the element might have extra content, but the user wants to hide it
					if ( $( el ).css( "overflow" ) === "hidden") {
						return false;
					}
					var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
						has = false;
					if ( el[ scroll ] > 0 ) {
						return true;
					}
					// TODO: determine which cases actually cause this to happen
					// if the element doesn't have the scroll set, see if it's possible to
					// set the scroll
					el[ scroll ] = 1;
					has = ( el[ scroll ] > 0 );
					el[ scroll ] = 0;
					return has;
				},
				/*
				* 获取浏览器滚动条大小
				*/
				getScrollbarSize: function () {
					var self = this,
						opt = self.configs;
					if( Nex.scrollbarSize ) {//全局缓存
						opt.scrollbarSize = Nex.scrollbarSize;
					}	
					if (!opt.scrollbarSize) {
						var db = document.body,
							div = document.createElement('div');
		
						div.style.width = div.style.height = '100px';
						div.style.overflow = 'scroll';
						div.style.position = 'absolute';
		
						db.appendChild(div); 
						
						opt.scrollbarSize = {
							width: div.offsetWidth - div.clientWidth,//竖
							height: div.offsetHeight - div.clientHeight//横
						};
						opt.scrollbarSize.x = opt.scrollbarSize.width;
						opt.scrollbarSize.y = opt.scrollbarSize.height;
						
						db.removeChild(div);
						
						Nex.scrollbarSize = opt.scrollbarSize;
					}
					return opt.scrollbarSize;
				},
				resize : function(){
					var self = this;
					var opt = self.configs;
					if( Nex.Manager ) {
						setTimeout(function(){
							Nex.Manager.fireEvent("onResize",[opt.id]);		
						},0);
					}	
				},
				//计算 max/min/cut width height 
				__getCalcSize : function( size,t ){
					var self = this,
						undef,
						opt = this.configs;	
					if( $.isFunction( size ) ) {
						size = size.call( self );	
					}
					if( size === undef ) size = 0;
					//暂不提供百分比支持
					size = parseInt(size);
					return 	isNaN(size)?0:size;	
				},
				_getCutWidth : function(){
					var self = this,
						opt = this.configs;	
					//var pw = opt.pWidth;
					var size = opt.cutWidth;
					return 	self.__getCalcSize(size,0);
				},
				_getCutHeight : function(){
					var self = this,
						opt = this.configs;	
					var size = opt.cutHeight;
					return 	self.__getCalcSize(size,1);
				},
				_getMinWidth : function(){
					var self = this,
						opt = this.configs;	
					var size = opt.minWidth;
					return 	self.__getCalcSize(size,0);
				},
				_getMaxWidth : function(){
					var self = this,
						opt = this.configs;	
					var size = opt.maxWidth;
					return 	self.__getCalcSize(size,0);	
				},
				_getMinHeight : function(){
					var self = this,
						opt = this.configs;	
					var size = opt.minHeight;
					return 	self.__getCalcSize(size,1);		
				},
				_getMaxHeight : function(){
					var self = this,
						opt = this.configs;	
					var size = opt.maxHeight;
					return 	self.__getCalcSize(size,1);			
				},
				C : function(key,value){
					if( typeof key == 'undefined') {
						return this.configs;	
					}
					if( typeof value == 'undefined') {
						return this.configs[key];
					}
					this.configs[key] = value;
					return this;
				},
				/**
				 * 模板处理函数(用户自定义模版级别最高,其次模板函数,最后_Tpl中的模版)
				 *  @tpl {String,Function} 模板内容
				 *  @data {Object} 模板数据 如果tpl是Function data不一定需要Object
				 *  @return {String} 模板内容
				 */
				tpl : function(tpl,data){
					
					var self = this;
					var opt = self.configs;
					var constructor = self.constructor;
					if( typeof tpl == 'undefined' ) tpl = "";
					if( typeof data == 'undefined' ) data = {};
					
					var _tpl_ = {};
					if( typeof opt.cacheData['_tpl_'] == 'undefined' ) {
						opt.cacheData['_tpl_'] = {};
						_tpl_ = opt.cacheData['_tpl_'];
					} else {
						_tpl_ = opt.cacheData['_tpl_'];
					}
					
					var argvs = [];
					var len = arguments.length;
					for( var i=2;i<len;i++ ) {
						argvs.push( arguments[i] );	
					}
					var argvs = [data].concat( argvs );
					
					var html = "";
					
					if( !opt.template ) {
						if( $.isFunction(tpl) ){
							html = tpl.apply(self,argvs);
						} else if( tpl in self ) {
							html = self[tpl].apply(self,argvs);
						} else {
							html = 	tpl;
						}
						return html;
					}
					
					opt.template.isEscape = opt.isEscape;
					
					if( $.isFunction(tpl) ){
						html = tpl.apply(self,argvs);
					}else if( tpl in opt.tpl && opt.tpl[tpl] ) {
						if( opt.tpl[tpl] in _tpl_ ) {
							var render = _tpl_[ opt.tpl[tpl] ];
							html = render.apply(self,argvs);
						} else {
							var render = opt.template.compile( opt.tpl[tpl] );
							
							_tpl_[ opt.tpl[tpl] ] = render;
							
							html = render.apply(self,argvs);		
						}
					} else if( tpl in self ) {
						html = self[tpl].apply(self,argvs);
					} else if( tpl in constructor._Tpl && constructor._Tpl[tpl] ) {
						if( constructor._Tpl[tpl] in _tpl_ ) {
							var render = _tpl_[ constructor._Tpl[tpl] ];
							html = render.apply(self,argvs);
						} else {
							var render = opt.template.compile( constructor._Tpl[tpl] );
							
							_tpl_[ constructor._Tpl[tpl] ] = render;
							
							html = render.apply(self,argvs);		
						}
					} else {
						if( tpl.toString() in _tpl_ ) {
							var render = _tpl_[ tpl.toString() ];
							html = render.apply(self,argvs);
						} else {
							var render = opt.template.compile( tpl.toString() );
							
							_tpl_[ tpl.toString() ] = render;
							
							html = render.apply(self,argvs);		
						}
					}
					return html;
				},
				/*
				* 不触发被调用API里的事件(部分函数除外 例如setGridBody,因为里面通过计时器触发)
				*  @param1 {String} 需要调用的API
				*  @param2~N 被调用的API参数(可选)
				*/
				denyEventInvoke : function(){//method,arg1,arg2....
					var self = this;
					var r;
					if( arguments.length ){
						var argvs = [];
						for( var i=0;i<arguments.length;i++ ) {
							argvs.push(arguments[i]);	
						}
						var method = argvs[0];
						if( method in self ) {
							self._denyEvent = true;
							argvs.splice(0,1);
							r = self[method].apply(self,argvs);
							self._denyEvent = false;
						}
					}
					return r;
				},
				/*
				* API调用管理,作用在于通过该函数调用的会过滤被锁定的函数
				*  @param1 {String} 需要调用的API
				*  @param2~N 被调用的API参数(可选)
				*/
				methodInvoke : function(){//method,arg1,arg2....
					var self = this;
					var r;
					
					var methodLocks = self._methodLocks || {};
					
					if( arguments.length ){
						var argvs = [];
						for( var i=0;i<arguments.length;i++ ) {
							argvs.push(arguments[i]);	
						}
						var method = argvs[0];
						
						if( methodLocks[method] ) {
							return;	
						}
						
						if( method in self ) {
							argvs.splice(0,1);
							r = self[method].apply(self,argvs);
						}
					}
					return r;
				},
				/*
				* 事件绑定
				*  @eventType {String} 事件名
				*  @func      {Function} 事件回调
				*  @scope     {Object} this对象(可选)
				*  @return    {int} 事件ID or false
				*/
				bind : function(eventType,func,scope){
					if( typeof eventType == "undefined" ) {
						return false;	
					}
					var _f = func;
					var func = func || $.noop;
					var self = this;
					var opt = self.configs;
					var event = opt.events;
					//批量绑定支持
					if( $.type( eventType ) === 'object' ) {
						var ids = [];
						for( var ev in eventType ) {
							var _i = self.bind( ev,eventType[ev],_f );	
							ids.push( _i );
						}
						return ids;
					} else {//字符串 但是没有做检查 
						var _ev = [ eventType ].join('').split(' ');	
						if( _ev.length>1 ) {
							var len = _ev.length;
							var ids = [];
							for( var _e=0;_e<len;_e++ ) {
								if( !_ev[_e] ) continue;
								ids.push( self.bind( _ev[_e],func,scope ) );
							}
							return ids;
						}					
					}
					
					var _type = eventType.split(".");
					eventType = _type[0];
					var ext = _type.length == 2 ? _type[1] : '';
					
					//事件名映射处理
					//eventMaps
					if( eventType in opt.eventMaps ) {
						eventType = opt.eventMaps[eventType];
					}
					
					event[eventType] = self._undef(event[eventType],[]);
					
					if( $.isFunction( event[eventType] ) ) {
						event[eventType] = [];
					}
					
					var _e = {
							scope : !!scope ? scope : self,
							func : func,
							ext : ext
						};
					
					var id = event[eventType].push(_e);
				
					return id-1;
				},
				/*
				*同bind 区别在于只执行一次
				*/
				one : function(eventType,func,scope){
					if( typeof eventType == "undefined" ) {
						return false;	
					}
					var func = func || $.noop;
					var self = this;
					var scope = !!scope ? scope : self;
					
					var _ = function(){
							self.unbind(eventType,_.id);
							var r = func.apply(scope,arguments);
							return r;
						},
						id = null;
						
					id = self.bind( eventType,_,scope );
					_.id = id;
					return id;
				},
				/*
				* 取消事件绑定
				*  @eventType {String} 事件名
				*  @id        {int} 事件ID(可选)
				*/
				unbind : function(eventType,id){
					var self = this;
					var opt = self.configs;
					var event = opt.events;
					var id = self._undef(id,false);
					
					var _type = eventType.split(".");
					eventType = _type[0];
					var ext = _type.length == 2 ? _type[1] : '';
					
					if( eventType === '' && ext !== '' ) {
						for( var tp in event ) {
							self.unbind( [tp,ext].join('.') );	
						}
						return self;	
					}
					
					//事件名映射处理
					//eventMaps
					if( eventType in opt.eventMaps ) {
						eventType = opt.eventMaps[eventType];
					}
					
					if( !(eventType in event) ) {
						return self;	
					}
					
					if( $.isFunction( event[eventType] ) ) {
						event[eventType] = [];
						return self;
					}
					
					if(id === false) {
						if( ext === '' ) {
							event[eventType] = [];
						} else {
							
							var j = 0;//用于splice
							for(var i=0;i<event[eventType].length;i++) {
								var _e = event[eventType][i];
								if( $.isPlainObject( _e ) && _e.ext === ext ) {
									event[eventType][i] = null;	
									j++;
								}
							}
						}
					} else {
						event[eventType][id] = null;	
					}
					return self;
				},
				/*
				* 锁定API
				*  @method {String} API名
				*/
				lockMethod : function(method){
					var self = this;	
					//事件锁
					var methodLocks = self._methodLocks || {};
					methodLocks[method] = true;
					self._methodLocks = methodLocks;
					return true;	
				},
				/*
				* 取消锁定API
				*  @method {String} API名
				*/
				unLockMethod : function(method){
					var self = this;	
					//事件锁
					var methodLocks = self._methodLocks || {};
					methodLocks[method] = false;
					self._methodLocks = methodLocks;
					return true;	
				},
				/*
				* 锁定事件
				*  @eventType {String} 事件名
				*/
				lockEvent : function(eventType){
					var self = this;	
					//事件锁
					var eventLocks = self._eventLocks || {};
					eventLocks[eventType] = true;
					self._eventLocks = eventLocks;
					return true;
				},
				/*
				* 取消锁定事件
				*  @eventType {String} 事件名
				*/
				unLockEvent : function(eventType){
					var self = this;	
					//事件锁
					var eventLocks = self._eventLocks || {};
					eventLocks[eventType] = false;
					self._eventLocks = eventLocks;
					return true;
				},
				/*
				* 事件触发
				*  @eventType {String} 事件名
				*  @data      {Array} 事件参数(可选)
				*/
				fireEvent : function(eventType,data){
					var self = this;
					
					if( self._denyEvent ) {
						return;	
					}
					var opt = self.configs;
					
					var events = opt.events[eventType];
					var data = self._undef(data,[]);
					
					//判断data 是否 arguments
					if( $.isArray( data ) ) {
						data = data;	
					} else if( $.type( data ) === 'object' ){
						if( 'callee' in data && 'length' in data ) {
							data = data	
						} else {
							data = [data];	
						}
					} else {
						data = [data];
					}
					//data = $.isArray( data ) ? data : [data];
					
					//添加事件锁
					var eventLocks = self._eventLocks || {};
					if( eventLocks[eventType] ) {
						return;	
					}
					eventLocks[eventType] = true;
					
					var r = true;
					if($.isArray(events) ) {
						var len = events.length;
						for(var i=0;i<len;i++) {
							var _e = events[i];
							if( $.isPlainObject( _e ) ) {
								r = _e.func.apply(_e.scope,data);
							} else if( $.isFunction( _e ) ){
								r = _e.apply(self,data);
							}
							if( opt.stopOnFalse ) {
								if(r === false) break;	
							}
						}	
						
					} else if($.isFunction(events)) {
						r = events.apply(self,data);
					}
					//取消事件锁
					eventLocks[eventType] = false;
					
					return r;
				},
				loadPuglins : function(){
					var self = this;
					var constructor = self.constructor;
					$.each( constructor.puglins,function(i){
						if( $.isFunction( this ) )
							this.call(self);									
					} );
				},
				initEvents : function(opt){
					var self = this;
					var e = opt.events ? opt.events : {};
					if( $.isPlainObject(e) && !$.isEmptyObject(e) ) {
						for(var i in e){
							if( $.isFunction(e[i]) && e[i] !== $.noop ) {
								e[i] = [ e[i] ];	
							}	
						}
					}
				},
				sysEvents : function(){
					var self = this;
					var opt = self.configs;
					//系统事件 注意：顺序不可随意更改
					if( '_sysEvents' in self ) {
						self._sysEvents();
					}
					
					self.bind("onStart",self.loadPuglins);	
				},
				generateMixed : function(n){
					var n = n || 6;
					var chars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
					var res = "";
					 for(var i = 0; i < n ; i ++) {
						 var id = Math.ceil(Math.random()*35);
						 res += chars[id];
					 }
					 return res;	
				},
				getId : function(){
					var aid = Nex.aid++;
					var self = this;
					var opt = self.configs;
					return opt.prefix + aid;	
				},
				getDom : function(){
					var self = this;
					return $('#'+self.C('id'));
				},
				unique : function(n){
					var str = this.generateMixed(n||6);
					var aid = str+'-'+Nex.aid++;
					return aid;	
				},
				isNumber : function(value) {
					return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value) ? true : false;	
				},
				/*
				*系统事件
				*/
				_onStart : function(){
					var self = this;
					var opt = self.configs;
					var e = opt.events ? opt.events : {};
					var reg = /^on[A-Z][\w|\.]*$/;
					for(var x in opt ) {
						if( reg.test(x) && $.isFunction(opt[x]) && opt[x] !== $.noop ) {
							self.bind(x,opt[x],self);	
						}
					}
				},
				/*判断当前对象是否属于nex对象*/
				isNex : function(obj){
					return  $.type(obj) === 'object' && ('_isNex' in obj)  ? true : false;
				},
				/*
				* 判断当前对象是否是 xtype 
				*/
				isXtype : function(obj){
					return ( $._isPlainObject( obj ) && ('xtype' in obj ) )	? true : false;
				},
				/*
				*
				*/
				isjQuery : function(obj){
					return $.type(obj) === 'object' && ('_outerWidth' in obj) ? true :　false;	
				},
				/*解析xtype 到容器*/
				parseItems : function(renderTo,items){
					var self = this;
					var opt = self.configs;
					if( $.isFunction( items ) ) {
						items = items.call( self,renderTo );
					}
					var items = $.isArray( items ) ? items : [items];
					if( renderTo && items.length ) {
						for( var i=0;i<items.length;i++ ) {
							var _item = items[i];
							if( _item === '' ) continue;
							if( $.isFunction( _item ) ) {
								_item = _item.call(self,renderTo);	
								if( _item === '' || $.type( _item ) === 'boolean' || $.type( _item ) === 'undefined' ) {
									continue;	
								}
							}
							if( self.isNex( _item ) ) {
								$( renderTo ).append( _item.getDom() );
								
								self.addChildCmpList( _item );
							
							} else if( self.isXtype( _item ) ){
								if( !Nex.Create ) continue;
								var cmp = Nex.Create( $.extend( _item,{renderTo:renderTo,superclass:self} ) );	
								self.addChildCmpList( cmp );
							} else if( self.isjQuery( _item ) ) {
								$( renderTo ).append( _item );	
							} else {
								var html = $._parseHTML( _item.toString() );//修正相同字符 不创建bug
								$( renderTo ).append( $(html).clone() );				
							}	
						}
					}
				},
				addComponent :　function( renderTo,items ){
					this.parseItems( renderTo,items );
				},
				addChildCmpList :　function(obj){
					var self = this;
					var opt = self.configs;
					opt._childrenList.push( obj );
				},
				//m @true 默认删除本身, false 删除子元素
				removeCmp :  function(m){
					var self = this,undef;
					var m = m === undef ? true : m;
					var opt = self.configs;
					if( Nex.Manager ) {
						if( m ) {
							Nex.Manager.removeCmp( opt.id );
						}
						var list = opt._childrenList;
						for( var i=0;i<list.length;i++ ) {
							if( list[i].removeCmp )
								list[i].removeCmp( list[i] );	
						}
					}
				},
				_setBodyOverflowHidden : function(){
					var self = this;
					var opt = self.configs;
					if( !opt.resizeOnHidden ) {
						return;
					}	
					/*
					会有无限调用问题，2014.06.01撤销，原因:
					如果某个容器宽高 导致浏览器出现滚动条，那么在IE下会无限调用
					因为IE出现滚动条时会触发resize事件
					*/
					/*
					var _body = $(document.body);
					var render = $(opt.renderTo);
					render.addClass('nex-overflow-hidden');
					_body.addClass('nex-overflow-hidden');
					setTimeout(function(){
						_body.removeClass('nex-overflow-hidden');	
						render.removeClass('nex-overflow-hidden');	
					},0);
					*/
				}
			});
			return base;
		}	,
		//数组移动算法
		// pos 要移动的元素
		array_move : function(iarr,pos,target,t) {//t 代表是前还是后 1 代表前 0 代表后

			if(pos == target) return iarr;
			var __arr = iarr;
			//支持字符下标
			var _iarr = iarr = [].concat(__arr);
			iarr = [];
			var j=0,
				len = _iarr.length;
			for(;j<len;j++) {
				var _i = iarr.push(j);
				if( j == pos) {
					pos = _i-1;
				} else if( j == target ) {
					target = _i-1;
				}
			}
			//core
			var _p = iarr[pos];//记录元副本
			if( pos>target ) {
				if(!t) {
					target++;
				}
				for(var i=pos;i>=0;i--) {
					if(i == target) {
						iarr[i] = _p;
						break;
					}
					iarr[i] = iarr[i-1];
				}
			} else if( pos<target ) {
				if(t) {
					target--;
				}
				for(var i=pos;i<=target;i++) {
					
					if( i == target ) {
						iarr[i] = _p;
					} else {
						iarr[i] = iarr[i+1];
					}	
				}
			}
			//字符下标
			
			var new_arr = __arr;
			new_arr.length = 0;
			//new_arr.push.apply(new_arr,_iarr); //不建议用 因为 _iarr 会有长度限制 63444
			var k=0,
				len = iarr.length;
			for( ;k<len;k++ ) {
				new_arr.push( _iarr[ iarr[k] ] );
			}
			iarr = new_arr;
			return iarr;
		},
		/*
		*删除数组元素 index 为下标或者下标数组 或者回调函数 回调返回true即可
		*/
		array_splice : function(index,arr){
			var self = this,undef;
			if( !$.isArray( arr ) ) return arr;
			
			var call = index;
			
			if( $.isArray( index ) && index.length<=1 ) {
				index = index[0];
			}
			
			if( index === undef ) return arr;
			
			//如果index 不是数组或者不是回调时 直接调用splice;
			if( !$.isArray( index ) && !$.isFunction(index) ) {
				if( isNaN( parseInt( index ) ) ) return arr;
				arr.splice( parseInt(index),1 );
				return arr;
			}
			
			var _arr = self.copy( arr );
			var index = $.isArray( index ) ? index : ($.isFunction(index) ? [] : [index]);
			var _index = {};
			$.each(index,function(i,v){
				_index[v] = true;	
			});
			
			arr.length = 0;
			
			$.each( _arr,function(i,v){
				if( $.isFunction( call ) ) {
					var r = call.call(v,i,v);	
					if( r === true ) {
						_index[i] = true;	
					}
				}
				if( !(i in _index) ) {
					arr.push(v);	
				}	
			} );
			
			return arr;
		},
		/*				
		*数组插入 index 需要插入的位置 arr源数组,_arr需要插入的值可以是数组,t 0后面  1前面 _arr 长度不要超过6W+
		*/
		array_insert : function(index,_arr,arr,t){
			var self = this,
				undef,
				t = t === undef ? 0 : t;
			if( !$.isArray( arr ) ) return arr;
			
			var call = index;
			
			if( !$.isArray( _arr ) ) _arr = [ _arr ];
			
			if( index === undef ) return arr;
			
			var len = arr.length;
			if( index<len ) {
				if( t )	{
					_arr = _arr.concat( [ arr[index] ] );	
				} else {
					_arr = [ arr[index] ].concat( _arr );
				}
			}
			_arr = [index,1].concat( _arr );
			arr.splice.apply(arr,_arr);
			return arr;
		},
		array_clear : function(arr){
			arr.length = 0;
			return arr;
		},
		array_copy : function(arr){
			var _ = [];
			return _.concat( arr );	
		},
		//解决数组迭代时使用splice问题方案,在迭代之前应该使用copyArray复制出来
		copyArray : function(arr){
			var _ = [];
			return _.concat( arr );
		},
		//copy只是对数组或对象只是增加一个引用计数，并不是深复制
		copy : function(data){
			if( $.isArray( data ) ) {
				return  [].concat(data);	
			} else if( $.isPlainObject(data) ) {
				return $.extend({},data);
			} else {
				return data;	
			}
		},
		str_number : function(num,elc){//elc 截取的小数位
			var num = num + '';
			if( $.type( num ) === 'string' ) {
				var n = num.split('.');
				if( n.length>1 ) {
					var ext = n[1].substring(0,elc);	
					if( ext !== '' ) {
						num = [n[0],ext].join('.');	
					} else {
						num = n[0];
					}
				}	
			}
			return Number(num);
		},
		//继承组件
		//subclass，superClass，overrides
		extend : function(subclass,superClass,overrides){
			var undef,F = function(){};
			if( subclass === undef ) return F;
			var superClass = superClass === undef ? false : superClass;
			var overrides = overrides === undef ? {} : overrides;
			
			//如果不存在superClass 直接返回
			if( !superClass ) {
				return 	Nex.widget(subclass);
			}
			
			//检查是否没设置overrides
			if( $._isPlainObject( superClass ) ) {
				overrides = superClass;	
				superClass = false;
			}
			
			if( superClass && (superClass in Nex) ) {
				
				superClass = Nex[superClass];
				
			} else {
				superClass = false;	
			}
			
			subclass = Nex.widget(subclass);
			//只复制数组和(浅复制)对象
			var copy = function(data){
				if( $.isArray( data ) ) {
					return  [].concat(data);	
				} else if( $.isPlainObject(data) ) {
					return $.extend({},data);
				} else {
					return data;	
				}
			};
			
			if( superClass ) {
			
				for( var k in superClass ) {
					subclass[k] = copy(superClass[k]);	
				}
				var prototype = superClass['prototype'];
				for( var p in prototype ) {
					subclass.prototype[p] = copy(prototype[p]);		
				}
				subclass.prototype.superclass = superClass;
			}
			
			for( var m in overrides ) {
				subclass.prototype[m] = overrides[m];	
			}
			
			subclass.prototype.constructor = subclass;
			subclass.constructor = subclass;
			//兼容
			subclass.fn = subclass.prototype;
			
			return subclass;
		}
	};
})(window,jQuery);
//Nex Manager
Nex._Manager = Nex.widget('_manager');
Nex._Manager.fn.extend({
	compRoot : 'root',
	//所有组件列表				   
	components : {},				   
	//需要自动resize的组件				   
	cmps : [],
	//组件ID和组件的对应hash
	_cmps : {},
	//组件树形 hanh
	_cmpsTree : {},
	//组件层级对应
	_maps : [],//[ [cmp,cmp],[..] ]
	//组件ID的所有可resize的父级组件
	_pcmps : {},//{cmpid:{pcmpid:cmp,...}}
	_init :　function(opt){
		var self = this;
		$(window).unbind("resize.Manager");
		$(window).bind("resize.Manager",function(){
			self.fireEvent("onResize");									 
		});
	},
	_sysEvents : function(){
		var self = this;
		self.bind("onResize.manager",self._listen,self);
		return self;
	},
	getComp : function(id){
		return this.components[id];	
	},
	addCmp : function(id,cmp){
		//this.cmps.push(id);
		this.components[id] = cmp;
		this._cmps[id] = cmp;
	},
	removeCmp : function(id){
		this._cmps[id] = null;
		this.components[id] = null;
		delete this._cmps[id];
	},
	isExists : function(id){
		var self = this;
		var cmp = self._cmps[id];
		
		if( cmp && cmp.getDom().size() ) {
			return true;	
		}
		//autoRecovery 如果清除dom后组件就不再用，autoRecovery设置为true autoResize 应该也是为true的
		//这里可能存有bug 例如window按关闭后会销毁dom但是window组件还是存在的  --components
		//self._cmps[id] = null;//不再设置为null，而是获取dom是否存在
		if( cmp && cmp.C('autoRecovery') ) {
			self.removeCmp(id);	
		}
		return false;
	},
	//更新指定dom下的组件大小
	resizeDom : function(el){
		var el = $(el);
		if( !el.size() ) return this;
		var self = this	
			,undef
			,rlist = []
			,cmp = el.closest('.nex-component-item')
			,pid;
			
		pid = cmp.size() ? cmp.attr('id') : self.compRoot;
		
		var list = (pid in self._cmpsTree) ? self._cmpsTree[pid] : [];

		for( var i=0;i<list.length;i++ ) {
			var _item = list[i]['cmp'];
			var dom = _item.getDom();
			if( dom.closest(el).size() ) {
				rlist.push( _item )	;
			}	
		}
		
		for( var i=0;i<rlist.length;i++ ) {
			rlist[i].resize();	
		}
		return self;
	},
	_listen : function( cid ){
		var self = this;
		self.listen( cid );	//遍历组件后刷新大小
	},
	//更新所有组件大小 如果指定cid 只更新指定组件下的所有组件的大小
	resize : function( cid ){
		this._listen( cid );	
	},
	/*
	*遍历组件之间的层级关系 所有组件
	*/
	mapCmp : function(){
		this.mapCmp2();
	},
	/*
	*遍历组件之间的层级关系 
	*/
	mapCmp2 : function(){
		var self = this,undef;
		var list = self._cmps;
		
		//缓存机制 防止快速改变浏览器大小而过多的遍历
		if( self.mapCmpCache===true ) {
			return;	
		}
		
		self._cmpsTree = {};

		for( var id in list ) {
			var cmp = self._cmps[id];
			if( id && self.isExists( id ) && cmp ) {
				
				var parent = $("#"+id).parents(".nex-component-item:first");
				var pid;
				if( !parent.length ) {
					pid = self.compRoot;
				} else {
					pid = parent.attr('id');	
				}
				var data = {
					id : id,
					cmp : list[id],
					pid : pid
				};
				
				self._cmpsTree[pid] = self._cmpsTree[pid] === undef ? [] : self._cmpsTree[pid];
				self._cmpsTree[pid].push( data );
			} else {
				//self.cmps[i] = false;
				//delete self._cmps[id];
			}	
		}
		
		self.mapCmpCache = true;
		setTimeout(function(){
			self.mapCmpCache = false;							   
		},500);
		
	},
	/*
	*更新当前id下的组件大小  强制更新当前ID下子组件大小
	*/
	_resize : function( cid,m ){
		this._resize2(cid,m);
	},
	/*
	*更新当前id下 autoResize=true的子组件大小
	*/
	_resize2 : function( cid,m ){
		var self = this,undef;
		var cid = cid === undef ? self.compRoot : cid;
		var m = m === undef ? false : m;
		if( m ) {
			self.mapCmp2();
		}
		var list = self._cmpsTree[cid];
		if( !$.isArray( list ) ) return;
		
		for( var i=0;i<list.length;i++ ) {
			var cmp = list[i]['cmp'];
			if( cmp.C('autoResize') ) {
				cmp.resize();
			}
		}
		
		
	},
	listen : function( cid ){
		var self = this,undef;
		//self.mapCmp();
		/*if( cid === undef ) {
			self.mapCmp2();
		}*/
		self.mapCmp2();
		//console.log( self._cmpsTree );
		self._resize2( cid );
	},
	xtypes : {},
	addXtype : function(xtype,func){
		this.xtypes[xtype] = func;	
	},
	create : function(){
		var self = this;
		var argus = arguments.length;
		if( argus == 2 ) {
			if( (arguments[0] in self.xtypes) && $.isFunction( self.xtypes[ arguments[0] ] ) )
				return self.xtypes[ arguments[0] ]( arguments[1] );	
		} else {
			if( typeof arguments[0] === 'string' ) {
				arguments[0] = {
					xtype : arguments[0]	
				};		
			}
			if( 'xtype' in arguments[0] ){
				if( (arguments[0]['xtype'] in self.xtypes) && $.isFunction( self.xtypes[ arguments[0]['xtype'] ] ) )
					return self.xtypes[ arguments[0]['xtype'] ]( arguments[0] );	
			}	
		}
	}
});
Nex.Manager = new Nex._Manager();
Nex.Create = function(){
	return Nex.Manager.create.apply(Nex.Manager,arguments);
}; 
Nex.get = function(id){
	return 	Nex.Manager.getComp(id);
};
Nex.resize = function(id,m){
	var undef;
	var m = m === undef ? false : m;
	if( m ) {
		Nex.Manager.mapCmp2();	
	}
	Nex.Manager._resize2();
};

//解决display:none下 width height 获取不正确问题
$.fn._display = function(_e){
	var f = this[0];
	var p = _e;
	p.each(function(i){
		if( $(this).css('display') === 'none' ) {
			$(this).css('display','block');
			$(this).data('_display_',true); 
			var hidden = $(this).css('visibility');
			$(this).data('_visibility_',hidden); 
			$(this).css('visibility','hidden');
		}
	});
};
$.fn._hidden = function(_e){
	var f = this[0];
	var p = _e;
	p.each(function(i){
		if( $(this).data('_display_') ) {
			$(this).css('display','none');
			$(this).removeData('_display_');
		}
		var visibility = $(this).data('_visibility_');
		if( visibility ) {
			$(this).css('visibility',visibility);
			$(this).removeData('_visibility_');
		}
	});
};
$.fn._width = function(_e){
	if(_e==undefined){
		var f = this[0];
		if(f==window || f==document || f==document.body ){
			return this.width()||document.body.clientWidth;
		}
		var p = {};
		var isHidden = $(f).is(":hidden");
		if( isHidden ) {
			p = $(f).parents(":hidden");
			$(f)._display(p);
		}
		var w = $(f).width();
		if( isHidden ) {
			/*
			//不要这样，不然会隐藏无法复原问题
			setTimeout(function(){
				$(f)._hidden(p);					
			},0);
			*/
			$(f)._hidden(p);	
		}
		return w||0;
	}
	return this.width(_e);
};
$.fn._height = function(_e){
	if(_e==undefined){
		var f = this[0];
		if(f==window || f==document || f==document.body ){
			return this.height()||document.body.clientHeight;
		}
		var p = {};
		var isHidden = $(f).is(":hidden");
		if( isHidden ) {
			p = $(f).parents(":hidden");
			$(f)._display(p);
		}
		var h = $(f).height();
		if( isHidden ) {
			/*
			//不要这样，不然会隐藏无法复原问题
			setTimeout(function(){
				$(f)._hidden(p);					
			},0);
			*/
			$(f)._hidden(p);	
		}
		return h||0;
	}
	return this.height(_e);
}; 
$.fn._outerWidth = function(_e){
	if(_e==undefined || _e === false || _e === true){
		var f = this[0];
		if(f==window || f==document || f==document.body ){
			return this.width()||document.body.clientWidth;
		}
		var p = {};
		var isHidden = $(f).is(":hidden");
		if( isHidden ) {
			p = $(f).parents(":hidden");
			$(f)._display(p);
		}
		var w = this.outerWidth(!!_e)||0;
		if( isHidden ) {
			/*
			//不要这样，不然会隐藏无法复原问题
			setTimeout(function(){
				$(f)._hidden(p);					
			},0);
			*/
			$(f)._hidden(p);	
		}
		return w;
	}
	var isIE= Nex.isIE;
	return this.each(function(){
		if( !$.support.boxModel ){
			$(this).width(_e);
		}else{
			var f = this;
			var p = {};
			var isHidden = $(f).is(":hidden");
			if( isHidden ) {
				p = $(f).parents(":hidden");
				$(f)._display(p);
			}
			var _w = _e-($(this).outerWidth()-$(this).width());
			_w = _w<0?0:_w;
			$(this).width(_w);
			if( isHidden ) {
				/*
				//不要这样，不然会隐藏无法复原问题
				setTimeout(function(){
					$(f)._hidden(p);					
				},0);
				*/
				$(f)._hidden(p);	
			}
		}
	});
};  
$.fn._outerHeight = function(_f){
	if(_f==undefined || _f === false || _f === true){
		var f = this[0];
		if(f==window || f==document || f==document.body ){
			return this.height()||document.body.clientHeight;
		}
		var p = {};
		var isHidden = $(f).is(":hidden");
		if( isHidden ) {
			p = $(f).parents(":hidden");
			$(f)._display(p);
		}
		var h = this.outerHeight(!!_f)||0;
		if( isHidden ) {
			/*
			//不要这样，不然会隐藏无法复原问题
			setTimeout(function(){
				$(f)._hidden(p);					
			},0);
			*/
			$(f)._hidden(p);	
		}
		return h;
	}
	var isIE= Nex.isIE;
	return this.each(function(){
		if( !$.support.boxModel ){
			$(this).height(_f);
		}else{
			var f = this;
			var p = {};
			var isHidden = $(f).is(":hidden");
			if( isHidden ) {
				p = $(f).parents(":hidden");
				$(f)._display(p);
			}
			var _h = _f-($(this).outerHeight()-$(this).height());
			_h = _h<0?0:_h;
			$(this).height(_h);
			if( isHidden ) {
				/*
				//不要这样，不然会隐藏无法复原问题
				setTimeout(function(){
					$(f)._hidden(p);					
				},0);
				*/
				$(f)._hidden(p);	
			}
		}
	});
}; 
$.fn._show = function(){
	this.removeClass('nex-hidden');	
}
$.fn._hide = function(){
	this.addClass('nex-hidden');	
}

$._isPlainObject = function(obj){
	var r = $.isPlainObject(obj);
	if( r && '_outerWidth' in obj ) {
		r = false;	
	}
	return r;
}
$._parseHTML = $.parseHTML = $.parseHTML || function( data, context, scripts ){
	var parsed,rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	if ( typeof context === "boolean" ) {
		scripts = context;
		context = 0;
	}
	context = context || document;

	// Single tag
	if ( (parsed = rsingleTag.exec( data )) ) {
		return [ context.createElement( parsed[1] ) ];
	}

	parsed = jQuery.buildFragment( [ data ], context, scripts ? null : [] );
	return jQuery.merge( [],parsed.fragment.childNodes );

}
jQuery.fn.extend({
	/*移除style属性*/
	_removeStyle : function(proto,m){
		var _proto = $.trim(proto.toString().toLowerCase());
		_proto = _proto.split(',');
		var proto = {};
		$.each( _proto,function(i,v){
			proto[v] = true;						
		} );
		return this.each(function(){
			var cssText = this.style.cssText;
			if( cssText ) {
				var css = cssText.split(';');
				var data = {};
				$.each( css , function(i,v){
					if( v ) {
						var d = v.split(':');
						if( d.length ) {
							data[$.trim(d[0].toLowerCase())] = $.trim(d[1]);
						}
					}
				} );
				var t = [];
				for( var k in data ) {
					if( m ) {
						if( k in proto ) continue;	
					} else {
						//if( k.indexOf(proto) === 0 ) continue;	
						var r = false;
						for( var key in proto ) {
							if( k.indexOf(key) === 0 ) r=true;	
						}
						if( r ) {
							continue;	
						}
					}
					t.push( k+":"+data[k]+';' );
				}
				this.style.cssText = t.join("");
			}
		});	
	}				 
});
jQuery.support.selectstart = false;
jQuery.fn.extend({
	disableSelection: function() {
		return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
			".nex-disableSelection", function( event ) {
				event.preventDefault();
			});
	},
	enableSelection: function() {
		return this.unbind( ".nex-disableSelection" );
	}
});
/*
兼容 jquery 1.9 以上 移除 $.support.boxMoal
*/
if( jQuery.support.boxModel === undefined ) {
	jQuery.support.boxModel = document.compatMode === "CSS1Compat";
}
/*
是否支持 onselectstart 检查
*/
jQuery(function() {
	var body = document.body,
		div = body.appendChild( div = document.createElement( "div" ) );
		
	$.support.selectstart = "onselectstart" in div;

	// set display to none to avoid a layout bug in IE
	// http://dev.jquery.com/ticket/4014
	body.removeChild( div ).style.display = "none";
});
