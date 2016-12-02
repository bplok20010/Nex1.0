/*
Nex.base
http://www.extgrid.com
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱
*/
var Nex = Nex || (function(win,$){
	"use strict";					   
	return {
		aid : 1,
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
				  .replace(/((^|%>)[^\t]*)'/g, "$1\r")
				  .replace(/\t=(.*?)%>/g, "',$1,'")
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
			
			base.fn = base.prototype = {};
			base.fn.extend = function(obj){
				$.extend(base.fn,obj);
			};
			base.extend = function(obj){
				$.extend(base,obj);	
			};
			base.extend({
				puglins : [],
				puglinsConf : {},
				puglinsEvent : {},
				defaults : {},
				eventMaps : {},//事件名映射或者别名 别名:映射名
				addExtConf : function(conf){
					$.extend( this.puglinsConf,conf );
				},
				addExtEvent : function(events){	
					$.extend( this.puglinsEvent,events );
				},
				addEventMaps : function(maps){	
					$.extend( this.eventMaps,maps );
				},
				_def : {
					_base : base,
					prefix : 'nex_',
					id : '',
					tpl : {},
					template : typeof template === 'undefined' ? Nex.template : template,//模板引擎对象
					noop : $.noop,
					self : null,
					init : $.noop,//初始化调用
					renderTo : null,//helper
					isEscape : false,
					cacheData : {},
					eventMaps : {},
					events : {}//事件组合 	
				},
				extSet : function( opt ){
					
					var opt = $.extend( {},this._def,opt );
					//扩展事件
					$.extend( opt.events,this.puglinsEvent );	
					//事件名映射扩展
					$.extend( opt.eventMaps,this.eventMaps );	
					
					return $.extend({},this.puglinsConf,opt);
				},
				getDefaults : function(opt){
					var _opt = {};
					var _opt = this.extSet(_opt);
					
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
					
					self.configs = 	$.extend({},base.getDefaults(base.defaults),options);
					var opt = self.configs;
					opt.self = self;
		
					self._eventLocks = {};
		
					opt.id = opt.id || self.getId();
					
					//系统初始化调用
					opt.init.call(self,opt);
					
					//系统事件绑定
					self.sysEvents();
					
					self._onStart();//设置用户自定义事件
					
					self.fireEvent("onStart",[opt]);
					
					if( '_init' in self ) {
						self._init( opt );
					}
					
				},
				//解决数组迭代时使用splice问题方案,在迭代之前应该使用copyArray复制出来
				copyArray : function(arr){
					var _ = [];
					if( arr ) {
						var len = arr.length;
						for( var i=0;i<len;i++ ) {
							if ( i in arr ) {
								_.push( arr[i] );
							}	
						}
					}
					return _;
				},
				//copy只是对数组或对象只是增加一个引用计数，并不是深复制
				copy : function(t){
					if( $.isArray( t ) ) {
						return this.copyArray(t);	
					} else {
						var _ = t;
						return _;	
					}	
				},
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
				inArray : function(elem,arr){
					if ( arr ) {
						var len = arr.length;
						var i = 0;
						for ( ; i < len; i++ ) {
							// Skip accessing in sparse arrays
							if ( i in arr && arr[ i ] == elem ) {
								return i;
							}
						}
					}
					return -1;
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
				 *  @data {Object} 模板数据
				 *  @return {String} 模板内容
				 */
				tpl : function(tpl,data){
					
					var self = this;
					var opt = self.configs;
					if( typeof tpl == 'undefined' ) tpl = "";
					if( typeof data == 'undefined' ) data = {};
					
					var _tpl_ = {};
					if( typeof opt.cacheData['_tpl_'] == 'undefined' ) {
						opt.cacheData['_tpl_'] = {};
						_tpl_ = opt.cacheData['_tpl_'];
					} else {
						_tpl_ = opt.cacheData['_tpl_'];
					}
					
					var html = "";
					
					if( !opt.template ) {
						if( $.isFunction(tpl) ){
							html = tpl.call(self,data);
						} else if( tpl in self ) {
							html = self[tpl](data);
						} else {
							html = 	tpl;
						}
						return html;
					}
					
					opt.template.isEscape = opt.isEscape;
					
					if( $.isFunction(tpl) ){
						html = tpl.call(self,data);
					}else if( tpl in opt.tpl && opt.tpl[tpl] ) {
						if( opt.tpl[tpl] in _tpl_ ) {
							var render = _tpl_[ opt.tpl[tpl] ];
							html = render(data);
						} else {
							var render = opt.template.compile( opt.tpl[tpl] );
							
							_tpl_[ opt.tpl[tpl] ] = render;
							
							html = render(data);		
						}
					} else if( tpl in self ) {
						html = self[tpl](data);
					} else if( tpl in base._Tpl && base._Tpl[tpl] ) {
						if( base._Tpl[tpl] in _tpl_ ) {
							var render = _tpl_[ base._Tpl[tpl] ];
							html = render(data);
						} else {
							var render = opt.template.compile( base._Tpl[tpl] );
							
							_tpl_[ base._Tpl[tpl] ] = render;
							
							html = render(data);		
						}
					} else {
						if( tpl.toString() in _tpl_ ) {
							var render = _tpl_[ tpl.toString() ];
							html = render(data);
						} else {
							var render = opt.template.compile( tpl.toString() );
							
							_tpl_[ tpl.toString() ] = render;
							
							html = render(data);		
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
					var func = func || $.noop;
					var self = this;
					var opt = self.configs;
					var event = opt.events;
					
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
						if( ext == '' ) {
							event[eventType] = [];
						} else {
							
							var j = 0;//用于splice
							for(var i=0;i<event[eventType].length;i++) {
								var _e = event[eventType][i];
								if( $.isPlainObject( _e ) && _e.ext == ext ) {
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
							if(r === false) break;	
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
					$.each( base.puglins,function(i){
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
				getId : function(){
					var aid = Nex.aid++;
					var self = this;
					var opt = self.configs;
					return opt.prefix + aid;	
				},
				unique : function(){
					var aid = Nex.aid++;
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
				/*
				* 获取浏览器滚动条大小
				*/
				getScrollbarSize: function () {
					var self = this,
						opt = self.configs;
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
		
						db.removeChild(div);
					}
		
					return opt.scrollbarSize;
				}
			});
			return base;
		}	
	};
})(window,jQuery);
$.fn._outerWidth = function(_e){
	if(_e==undefined){
		if(this[0]==window){
			return this.width()||document.body.clientWidth;
		}
		return this.outerWidth()||0;
	}
	var isIE=!!window.ActiveXObject;
	return this.each(function(){
		if(!$.support.boxModel&&isIE){
			$(this).width(_e);
		}else{
			var _w = _e-($(this).outerWidth()-$(this).width());
			_w = _w<0?0:_w;
			$(this).width(_w);
		}
	});
};  
$.fn._outerHeight = function(_f){
	if(_f==undefined){
		if(this[0]==window){
			return this.height()||document.body.clientHeight;
		}
		return this.outerHeight()||0;
	}
	var isIE=!!window.ActiveXObject;
	return this.each(function(){
		if(!$.support.boxModel&&isIE){
			$(this).height(_f);
		}else{
			var _h = _f-($(this).outerHeight()-$(this).height());
			_h = _h<0?0:_h;
			$(this).height(_h);
		}
	});
};  