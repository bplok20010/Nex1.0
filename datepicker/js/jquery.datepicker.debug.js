/*
jquery.datepicker.js
http://www.extgrid.com
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱
+-----------+
v1.0        |
+-----------+
*/

;(function($){
	"use strict";
	$.datepicker = function(options){
		this.init(options);
	};
	$.datepicker.fn = {};
	$.datepicker.fn.extend = function(obj){
		$.extend($.datepicker.prototype,obj);
	};
	$.datepicker.extend = function(obj){
		$.extend($.datepicker,obj);	
	};
	$.datepicker.extend({
		version : '1.0', 
		padding : 8,//单元格padding占用的宽度
		puglins : [],//调用插件初始化函数 参数 self
		getDefaults : function(opt){
			var _opt = {
				self : null,
				init : $.noop,//初始化调用
				title : '',//为空不显示标题
				iconCls : '',//datepicker 标题的icon样式
				toolBars : false,// [{'text':'添加',cls:'样式',callBack,disabled:false}]
				_toolItem : {text : '',cls : '',callBack : $.noop,disabled:false},//tool 属性
				ltText : '',//leftTopText
				rowNumbersWidth : '0px',//左侧数字列表 一般设为24px 注:false情况下rowNumber不会创建,同时列锁会无效,提升展示速度可以考虑设置false
				rowNumbersExpand: false,// false : 索引 ,auto : 当前显示数据的索引 , 字符串时 自定义模版
				rowNumbers2Row : true,//开启当rowNumbers2Row click的时候 选择当前行
				rowTpl : '',//grid 自定义行模板 可以是选择器 模版类型不能出现类似 abc<div>ef</div>a
				showHeader : true,//显示header
				headerTpl : '',//自定义 header 列模板 可以是选择器 模版类型不能出现类似 abc<div>ef</div>a
				containerCss : 'datepicker-container-border',
				border : true,
				leftBorder : 1, //gird边框大小 注意grid不会生成边框，而是根据你自己在css中定义的边框大小， 系统默认的是1px
				rightBorder : 1,
				topBorder : 1,
				bottomBorder : 1,
				padding : $.datepicker.padding,
				width : 150,
				height : 250,
				checkBox : false,//是否显示checkbox列 开启后 ck 将是系统列
				checkBoxWidth : '28px',
				checkBoxTitle : '<input type="checkbox">',
				checkBoxFit : false,
				editColumn : false,//是否显示edit列 [{'text':'添加',cls:'样式',callBack,disabled:false}]  开启后 ed 将是系统列
				editColumnTitle : '操作',
				editColumnFit : true,
				editCellW : 63,//每个操作按钮的大小
				columns : [],//
				moveColumnTm : 500,//按下多少秒后开始移动列
				moveColumns : true,
				_columnMetaData : {
					field : '',
					index : '',//数据索引，默认==field
					title : '',
					width : '120px',//默认的列宽
					align : 'left',
					_expand : false,//自定义列内容
					callBack : $.noop,
					hcls : '',//header cell自定义css
					bcls : '',//body cell自定义css
					fcls : '',//footer cell自定义css
					sortable : false, 
					textLimit : false,//当处理大数据的时候 性能消耗比较厉害，
					fitColumn : true,
					disabled : false//当前列不可用
				},
				textLimit : false,//文字溢出总开关
				textLimitDef : '...',
				groupBy : false,//'year'  
				groupList : false,//['2012','2013','2014']
				groupListCallBack : $.noop,//group row的回调 
				_groupListData : [],//数据缓存
				autoScrollToField : true,
				autoScrollToRow : true,
				scrollbarSize : false,//获取滚动条大小
				sTop : 0,//初始滚动位置
				sLeft : 0,
				_lTime : 0,//v1.0旧 数据显示后 相隔这个时间继续显示下一个 废弃
				_lStart : 0,//采用预先加载的数据时 开始显示位置 eg offset _lStart limit _lSize
				_lSize : 0,//关闭分页显示 用于一页显示大数据时 采用一次性预先加载的数据
				fitColumns : true,//移动列总开关
				data : [],//列表数据 含有_expand的将作为扩展列 如果有 _openExpand=true 则会自动展开
				emptyGridMsg : '',//grid数据为空是的显示数据 可以是模板 opt 作为参数
				showEmptyGridMsg : true,
				pk : '_pk',//主键名称
				lockRows : [],//已经锁定的行
				lockColumns : [],//已经锁定的列
				hideColumns : [],//已经隐藏的列
				selectRows : [],//已经选中的行
				isCreate : false,//废弃
				isShow : false,
				views : {},
				method : 'post',
				url : '',
				loadMsg : '加载中,请稍后...',
				cache : true,//缓存
				cacheData : [],
				pagination : false,//pager栏目
				pagerToolBar : false,//pager栏目 工具栏
				pagerMsg : '当前显示 {start} 到 {end} 条，共 {total} 条',
				pageNumber : 1,
				pageSize : 10,
				dataType : 'json',
				pageList : [10,20,30,40,50],
				queryParams : {},
				singleSelect : false,//是否可以多选
			//	selectOnCheck : true,
			//	checkOnSelect : true,
				sortName : '',
				sortOrder : 'asc',
				rowStyler : "",//行style 字符串作为 class function(rowid,rowdata)
				rowCallBack : $.noop,
				tpl : {},
				methodCall : {},//内部函数的回调函数
				template : template,//模板引擎对象
				isEscape : false,//是否开启模板转义
				noop : $.noop,
				denyRowEvents : false,//禁止触发的事件
				//fastest : false,//开启急速模式 该模式下 部分功能失效  待开启
				events : {
					onStart : $.noop,//创建开始 1
					onViewCreate :$.noop,
					onFinish : $.noop,//创建结束 1
					onColumnValueChange : $.noop//列信息改变是触发
				},//事件组合 
				_Tpl : {}
				
			};
			return $.extend(_opt,opt);
		},
		_undef : function (val, defaultVal) {
			return val === undefined ? defaultVal : val;
		}
	});
	//core
	$.datepicker.fn.extend({
		init : function(options) {},
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
		//用户自定义模版级别最高,其次模板函数,最后_Tpl中的模版
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
			
			template.isEscape = opt.isEscape;
			
			var html = "";
			if( tpl in opt.tpl && opt.tpl[tpl] ) {
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
			} else if( tpl in $.datepicker._Tpl && $.datepicker._Tpl[tpl] ) {
				if( $.datepicker._Tpl[tpl] in _tpl_ ) {
					var render = _tpl_[ $.datepicker._Tpl[tpl] ];
					html = render(data);
				} else {
					var render = opt.template.compile( $.datepicker._Tpl[tpl] );
					
					_tpl_[ $.datepicker._Tpl[tpl] ] = render;
					
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
		//添加事件
		bind : function(eventType,func,scope){
			if( typeof eventType == "undefined" ) {
				return this;	
			}
			var func = func || $.noop;
			var self = this;
			var event = self.configs.events;
			
			event[eventType] = $.datepicker._undef(event[eventType],[]);
			
			if( $.isFunction( event[eventType] ) ) {
				event[eventType] = [];
			}
			
			var _e = {
					scope : !!scope ? scope : self,
					func : func
				};
			
			var id = event[eventType].push(_e);
		
			return id-1;
		},
		unbind : function(eventType,id){
			var self = this;
			var event = self.configs.events;
			var id = $.datepicker._undef(id,false);
			if(id === false) {
				event[eventType] = $.noop;
			} else {
				//event[eventType][id] = $.noop;
				event[eventType].splice(id,1) = $.noop;
			}
			return self;
		},
		fireEvent : function(eventType,data){
			var self = this;
			var events = self.configs.events[eventType];
			//var scope = $.datepicker._undef(scope,self);
			var data = $.datepicker._undef(data,[]);
			var r = true;
			if($.isArray(events) ) {
				
				for(var i=0;i<events.length;i++) {
					var _e = events[i];
					if( $.isPlainObject( _e ) ) {
						r = _e.func.apply(_e.scope,data);
						if(r === false) break;	
					} else if( $.isFunction( _e ) ){
						r = _e.apply(self,data);
						if(r === false) break;	
					}
				}	
				
			} else if($.isFunction(events)) {
				r = events.apply(self,data);
			}
			return r;
		},
		loadPuglins : function(){
			var self = this;
			$.each( $.datepicker.puglins,function(i){
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
			//绑定自定义事件
			for( var x in e ) {
				if( x in opt ) {
					if( $.isFunction(opt[x]) && opt[x] !== $.noop ) {
						self.bind(x,opt[x],self);	
					}
				}	
			}
		},
		sysEvents : function(){
			var self = this;
			var opt = self.configs;
			//自动展示_expand
			self.bind("onShowGrid",self.autoExpand);
			//单击展示_expand
			self.bind("onClickRow",self.setExpandEvent);
			//绑定checkBox
			self.bind("onUnselectAll",function(){this.checkCk(false)});
			self.bind("onSelectAll",function(){this.checkCk(true)});
			self.bind("onUnselect",function(){this.checkCk(false)});
			self.bind("onShowGrid",function(){this.checkCk(false)});
			//系统事件
			self.bind("onViewCreate",self.onInitFieldWidth);
			self.bind("onLoadSuccess",self.onLoadSuccess);//ajax数据成功返回后的操作
			self.bind("onLoadError",self.onLoadError);//ajax数据返回错误后的操作
			self.bind("onSetPk",self.setPk);
			self.bind("onViewSizeChange",self.onViewSizeChange);
			self.bind("onSizeChange",self.onSizeChange);
			self.bind("onSizeChange",self.onFinishFieldWidth);
			self.bind("onShowGrid",self.resetHeader);
			//self.bind("onShowGrid",self.resetFieldWidth);
			self.bind("onShowGrid",self.onLockRow);
			self.bind("onShowGrid",self.onLockColumn);
			self.bind("onScroll",self.onScroll);
			self.bind("onAfterLockRow",self.onAfterLockRow);
			self.bind("onAfterLockColumn",self.onAfterLockColumn);
			self.bind("onDataChange",self.onDataChange);
			self.bind("onOverRow",self.onOverRow);
			self.bind("onOutRow",self.onOutRow);
			self.bind("onShowGrid",self.onDisplayField);
			self.bind("onViewSizeChange",self.isEmptyGrid);
			self.bind("onHeaderCreate",self.onHeaderCreate);
			self.bind("onColumnMove",self.onColumnMove);
			//self.bind("onFinish",self.onFinishFieldWidth);
			self.bind("onFinish",self.loadPuglins);
			self.bind("onColumnValueChange",self.onColumnValueChange);
			self.bind("onBeforeAddRow",self.refreshPager);
			self.bind("onAfterAddRow",self.checkToRow);//锁行
			self.bind("onAfterDeleteRow",self.refreshPager);
			
			//本地操作时开启 记录选择的行 尚未去实现 可通过二次开发实现
			self.bind("onSelect",self.addSelectRecode);
			self.bind("onUnselect",self.removeSelectRecode);
		},
		getId : function(){
			return 'contentmenu_' + Math.floor(Math.random() * 99999);	
			//return 'extgrid_' + Math.floor(Math.random() * 99999);	
		},
		unique : function(){
			return 'unique_'+ Math.floor(Math.random() * 100) +'_'+ Math.floor(Math.random() * 1000000);		
		},
		isNumber : function(value) {
			return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value) ? true : false;	
		},
		textLimit : function(text,width,fontSize) {
			var self = this;
			var opt = self.configs;
			var text = $.datepicker._undef(text,"");
			if(text == "") return text;
			text = new String(text);
			var _t = $("<div style='position:absolute;left:-1000px;'></div>");
			_t.appendTo(document.body);
			_t.css({'fontSize':fontSize});
			
			var len = text.length;
			var _text = "";
			var _i = 0;
			for(var i=1;i<=len;i++) {
				_text = text.substr(0,i);
				_t.html( _text + opt.textLimitDef );
				if( parseFloat(_t.width()) < parseFloat(width) ) {
					_i = i;
				} else {
					break;	
				}
			}
			
			_t.remove();
			
			if(_i == 0) {
				text = text.substr(0,1) + opt.textLimitDef;
			} else if(_i == len) {
				text = text;	
			} else {
				text = text.substr(0,_i) + opt.textLimitDef;
			}
			return text.toString();
		},
		getTpl : function(tpl) { //兼容函数
			return tpl;
		},
		//设置参数
		C : function(key,value){
			if( typeof key == 'undefined') {
				return this.configs;	
			}
			if( typeof value == 'undefined') {
				return this.configs[key];
			}
			this.configs[key] = value;
			return this;
		}
	});
	
	$.datepicker.fn.extend({
		init : function(options) {
			var self = this;
			
			self.initEvents(options);//初始化用户自定义事件
			
			self.configs = 	$.extend({},$.datepicker.getDefaults(),options);
			var opt = self.configs;
			opt.self = self;


			opt.id = opt.id || self.getId();
			
			//系统初始化调用
			opt.init.call(self,opt);
			
			//系统事件绑定
			self.sysEvents();
			
			//e.onStart.call(self);
			self.fireEvent("onStart",[opt]);
			
			self.setContainer() //setContainer必须
				.setTitle()
				.setToolBar()
				.setGrid()
				.setPager(true)
				.show();
			
		},
		dateAdd = function(type, number, idate) {
            number = parseInt(number);
            var date;
            if (typeof (idate) == "string") {
                date = idate.split(/\D/);
                eval("var date = new Date(" + date.join(",") + ")");
            }
            if (typeof (idate) == "object") {
                date = new Date(idate.toString());
            }
            switch (type) {
                case "y": date.setFullYear(date.getFullYear() + number); break;
                case "m": date.setMonth(date.getMonth() + number); break;
                case "d": date.setDate(date.getDate() + number); break;
                case "w": date.setDate(date.getDate() + 7 * number); break;
                case "h": date.setHours(date.getHours() + number); break;
                case "n": date.setMinutes(date.getMinutes() + number); break;
                case "s": date.setSeconds(date.getSeconds() + number); break;
                case "l": date.setMilliseconds(date.getMilliseconds() + number); break;
            }
            return date;
        },
		dateDiff : function(type, d1, d2) {
            switch (type) {
                case "d": //date
                case "w":
                    d1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
                    d2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
                    break;  //w
                case "h":
                    d1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), d1.getHours());
                    d2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), d2.getHours());
                    break; //h
                case "n":
                    d1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), d1.getHours(), d1.getMinutes());
                    d2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), d2.getHours(), d2.getMinutes());
                    break;
                case "s":
                    d1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), d1.getHours(), d1.getMinutes(), d1.getSeconds());
                    d2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), d2.getHours(), d2.getMinutes(), d2.getSeconds());
                    break;
            }
            var t1 = d1.getTime(), t2 = d2.getTime();
            var diff = NaN;
            switch (type) {
                case "y": diff = d2.getFullYear() - d1.getFullYear(); break; //y
                case "m": diff = (d2.getFullYear() - d1.getFullYear()) * 12 + d2.getMonth() - d1.getMonth(); break;    //m
                case "d": diff = Math.floor(t2 / 86400000) - Math.floor(t1 / 86400000); break;
                case "w": diff = Math.floor((t2 + 345600000) / (604800000)) - Math.floor((t1 + 345600000) / (604800000)); break; //w
                case "h": diff = Math.floor(t2 / 3600000) - Math.floor(t1 / 3600000); break; //h
                case "n": diff = Math.floor(t2 / 60000) - Math.floor(t1 / 60000); break; //
                case "s": diff = Math.floor(t2 / 1000) - Math.floor(t1 / 1000); break; //s
                case "l": diff = t2 - t1; break;
            }
            return diff;
        }
	});
})(jQuery);