/*
jquery.nexMenu.js
http://www.extgrid.com/menu
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱

*/

;(function($){
	"use strict";
	var menu = Nex.widget('menu');
	//Nex.menuzIndex = 99997;
	$.nexMenu = $.extMenu = menu;
	menu.extend({
		version : '1.0',
		getDefaults : function(opt){
			var _opt = {
				prefix : 'nexmenu-',
				renderTo : document.body,
				width : 0,
				height : 0,
				maxWidth : 0,
				minWidth : 120,
				minHeight : 0,
				maxHeight : 0,
				isIE : !!window.ActiveXObject,
				url : '',//无效 不支持支持远程创建 返回数据格式  json
				cache : true,
				dataType : 'json',
				queryParams : {},
				method : 'get',
				parames : {},
				data : [],
				splitChr : ['-',',',';','|'],
				cls : '',
				delay : 0,//延迟毫秒数 ms
				_t_delay : 0,
				IEVer : Nex.IEVer,
				border :　false,
				borderCls : 'nex-menu-border',
				showShadow : true,
				hideToRemove : true,
				showMenuVLine : false,//显示节点线条
				showMenuIcon : true,//显示节点图标
				showMenuMore : true,//如果列表过多 显示上下 btn
				_speedTime : 10,
				_speedNum : 5,
				_data : {},
				_childrens : {},
				_levelData : {},//level=>[]
				_firstNodes : {},// 0:node1,1:node2 k=>v k表示第几级
				_lastNodes : {},// 0:node1,1:node2 k=>v k表示第几级
				clickToHide : true,
				expandOnEvent : 0,//0 mousover 1 click 
				simpleData : false,
				root : '0',//simpleData下可不用设置且只在初始化时有效，初始化后会用showRowId代替
				showRootId : '0',//请设置对应的顶层ID 非simpleData下可不用设置
				iconField : 'icon',//图标字段 样式
				iconClsField : 'iconCls',//图标字段 样式
				idField : 'id',
				textField : 'text',
				openField : 'open',
				levelField : '_level',
				parentField : 'pid',
				sortField : 'order',
				childField : 'items',
				disabledField : 'disabled',
				groupNode : false,//开启后会对叶子和节点进行分类
				showConf : {xAlign:'right',yAlign:'bottom',zAlign:'x'},
				events : {
					onStart : $.noop,
					onCreate : $.noop,
					onSizeChange : $.noop,
					onClick : $.noop,
					onDblClick : $.noop,
					onFocus : $.noop,
					onBlur : $.noop,
					onKeyDown : $.noop,
					onKeyUp : $.noop,
					onKeyPress : $.noop,
					onMouseOver : $.noop,
					onMouseOut : $.noop,
					onPaste : $.noop,
					onMouseDown : $.noop,
					onMouseUp : $.noop,
					onDestroy : $.noop
				}
			};
			
			var _opt = this.extSet(_opt);
			
			return $.extend({},_opt,opt);
		}
	});
	$.nexMenu.fn.extend({
		_init : function(opt) {
			var self = this;
			
			self._mapTree(opt.data);
			
			//self.show();
		},
		_sysEvents : function(){
			var self = this;
			var opt = self.configs;
			self.bind("onMouseOver.over",self.onMouseOver,self);
			self.bind("onMouseOut.over",self.onMouseOut,self);
			self.bind("onClick.click",self._clickItem,self);
			self.bind(opt.expandOnEvent == 0 ? "onMouseOver.over" : "onClick.over",self._displayMenu,self);
			
			return self;
		},
		_clickItem : function(li,tid,node,e){
			var self = this,
				opt=this.configs;
				
			if( node[opt.disabledField] ) {
				return;
			}
			if( $.isFunction( node['callBack'] ) )
				node['callBack'].apply(self,[li,tid,node,e]);
			if( self.isLeaf( tid ) && opt.clickToHide ) {
				self.hideAllMenu(opt.root,1);
			}
			
		},
		onMouseOver : function(li,tid,node,e){
			var self = this,
				opt=this.configs;
			if( node[opt.disabledField] ) {
				return;	
			}
			$(li).addClass("nex-menu-item-over");
		},
		onMouseOut : function(li,tid,node,e){
			var self = this,
				opt=this.configs,
				undef;
			if( node[opt.disabledField] ) {
				return;	
			}
			$(li).removeClass("nex-menu-item-over");	
		},
		_displayMenu : function(div,tid,node,e){
			var self = this,
				opt=this.configs,
				undef;
			self.hideAllMenu(tid);
			
			if( node[opt.disabledField] ) {
				return;	
			}
			
			var menu = self.createMenu(tid);
			
			self._showAt( menu,div,opt.showConf );
		},
		_getNode : function(tid,pro){
			var self = this,
				opt=this.configs,
				undef;	
			//var node = opt._data[ opt._tfix+tid ];
			var node = opt._data[ tid ];
			
			if( node === undef ) {
				return false;	
			}
	
			return pro===undef ? node : node[pro];
		},
		_getParentID : function(tid){
			var self = this,
				opt=this.configs,
				undef;	
			var pid = 	self._getNode(tid,opt.parentField);
			return pid === opt.root ? opt.root : 	pid;
		},
		_parseSimpleData : function(data,pid){
			var self = this,
				opt=this.configs;	
			var undef;
			var _ids = {};
			for( var i=0;i<data.length;i++ ) {
				var node = data[i];
				
				if( self.inArray( node,opt.splitChr ) !== -1 ) {
					node = {
						splitLine : true
					};	
				}
				
				if( node[opt.parentField] === undef ) {
					node[opt.parentField] = pid === undef ? opt.root : pid;
					node[opt.levelField] = pid === undef ? 0 : self._getNode(pid,opt.levelField)+1;
				} else {
					node[opt.levelField] = 	self._getNode(node[opt.parentField],opt.levelField)+1;
				}
				if( !(opt.idField in node) ) {
					node[opt.idField] = 'menu_'+self.unique();	
				} else{
					if(node[opt.idField].toString().length<=0) {
						node[opt.idField] = 'menu_'+self.unique();		
					}
				}
				
				opt._data[ node[opt.idField] ] = node; 
				
				var _pid = node[opt.parentField];
				opt._childrens[ _pid ] = opt._childrens[ _pid ] === undef ? [] : opt._childrens[ _pid ];
				var childs = opt._childrens[ _pid ];
				childs.push(node);
				//levelData
				var _lv = node[opt.levelField];
				opt._levelData[ _lv ] = opt._levelData[ _lv ] === undef ? [] : opt._levelData[ _lv ];
				var levels = opt._levelData[ _lv ];
				levels.push(node);
				
				_ids[_pid] = true;
				
			}	

			for( var nid in _ids ) {
				//self.groupNodes( nid );
				self.updateLastNodes( nid );
			}
		},
		//解析数据
		_mapTree : function(data,pid){
			var self = this,
				opt=this.configs;	
			var undef;
			if( opt.simpleData ) {
				self._parseSimpleData(data,pid);
				return self;
			}
			for( var i=0;i<data.length;i++ ) {
				var node = data[i];
				
				if( self.inArray( node,opt.splitChr ) !== -1 ) {
					node = {
						splitLine : true
					};	
				}
				
				node[opt.levelField] = pid === undef ? 0 : self._getNode(pid,opt.levelField)+1;
				node[opt.parentField] = pid === undef ? opt.root : pid;
				
				if( !(opt.idField in node) ) {
					node[opt.idField] = 'menu_'+self.unique();	
				}
				
				opt._data[ node[opt.idField] ] = node; 
				
				var _pid = node[opt.parentField];
				opt._childrens[ _pid ] = opt._childrens[ _pid ] === undef ? [] : opt._childrens[ _pid ];
				var childs = opt._childrens[ _pid ];
				childs.push(node);
				//levelData
				var _lv = node[opt.levelField];
				opt._levelData[ _lv ] = opt._levelData[ _lv ] === undef ? [] : opt._levelData[ _lv ];
				var levels = opt._levelData[ _lv ];
				levels.push(node);
				
				if( ( opt.childField in node ) && node[opt.childField].length ) {
					self._mapTree(node[opt.childField],node[opt.idField]);
				}
				
				if( (i+1) === data.length ) {
					//self.groupNodes( _pid );
					self.updateLastNodes( _pid );
				}
				
			}	
			return self;
		},
		/*
		* 对当前级的数据进行节点和叶子分类
		*/
		groupNodes : function(pid){
			var self = this,
				opt=this.configs,
				undef;
			
			var pid = pid === undef ? opt.root : pid;
			var _d = opt._childrens[ pid ];
			
			if( !opt.groupNode ) return _d;
			
			var nodes=[],leafs=[];
			var len = _d.length;
			for( var i=0;i<len;i++ ) {
				if(self.isLeaf( _d[i] )) {
					leafs.push( _d[i] );	
				} else {
					nodes.push( _d[i] );		
				}
			}
			opt._childrens[ pid ] = nodes.concat(leafs);
			
			return opt._childrens[pid];
		},
		/*
		*更新 第一个节点和最后一个节点的索引
		*/
		updateLastNodes : function(pid){
			var self = this,
				opt=this.configs,
				undef;
			var pid = pid === undef ? opt.root : pid;	
			var chlids = opt._childrens[pid];
			if( chlids.length ) {
				opt._firstNodes[pid] = chlids[0];
				opt._lastNodes[pid] = chlids[chlids.length-1];
			}
		},
		addChildren : function(tid,data){
			var self = this,
				opt=this.configs,
				undef;	
			var d = !$.isArray( data ) ? [data] : data;	
			self._mapTree(d,tid);
		//	self.refreshMenu(tid);
		},
		isSplitLine : function( node ){
			var self = this
				,opt=this.configs
				,undef;	
			if( node.splitLine ) return true;
			return false;
		},
		isLeaf : function(node){
			var self = this
				,opt=this.configs
				,undef;
			if( node === opt.root ) return false;
			var tnode = $.isPlainObject(node) ? node : self._getNode(node);
			if( tnode === false && !self._isRoot(node) ) return true;
			if( self._isRoot(node) ) return false;
			if( tnode.leaf === undef ) {
				var tid = tnode[opt.idField];
				var childrens = self.getChildrens(tid);
				if( childrens.length ) {
					return false;	
				}
				if( (opt.childField in tnode) && tnode[opt.childField].length ) {
					return false;	
				}
				return true;	
			} else {
				return !!tnode.leaf;	
			}
		},
		getAllChildrens : function(pid) {
			var self = this
				,opt=this.configs
				,undef;
			var childs = [];
			var pid = self._undef(pid,opt.root);
			var getChilds = function(pid){
				var _childs = self.getChildrens(pid);
				if( _childs.length ) {
					childs = childs.concat(_childs);
					for( var i=0;i<_childs.length;i++ ) {
						getChilds(_childs[i][opt.idField]);
					}
				}
			}
			getChilds(pid);
			return childs;
		},
		/*
		*获取子级
		*/
		getChildrens : function(pid){
			var self = this
				,opt=this.configs
				,undef;
			
			var pid = pid === undef ? opt.root : pid;
			
			return opt._childrens[pid] === undef ? [] : opt._childrens[pid];
		},
		_getParentsList : function(tid){
			var self = this
				,opt=this.configs
				,root=opt.root
				,pids = [];
			var node = $.isPlainObject(tid) ? tid : self._getNode(tid);	
			if( node===false ) return [];
			var id = node[opt.idField];
			var pid = self._getParentID(id);
			while( 1 ) {
				if( !(pid in opt._data) ) break;
				pids.push( pid );	
				pid = self._getParentID(pid);
				if( pid === opt.root ) break;
			}
			return pids.reverse();
		},
		_isFirstNode : function(tid){
			var self = this
				,opt=this.configs;
			var _pid = self._getParentID(tid);
			return opt._firstNodes[_pid][opt.idField] === tid ? true : false;
		},
		_isLastNode : function(tid){
			var self = this
				,opt=this.configs;
			var _pid = self._getParentID(tid);
			return opt._lastNodes[_pid][opt.idField] === tid ? true : false;
		},
		getMenuItem : function(tnode){
			var self = this
				,opt=this.configs
				,spacers = [];
				
			var node = $.isPlainObject(tnode) ? tnode : self._getNode(tnode);
			if( node===false ) return '';
			
			if( self.isSplitLine( node ) ) {
				return '<div class="nex-menu-item-separator"><div class="nex-menu-line-h"></div></div>';	
			}
			
			var tid = node[opt.idField];
				
			var menuID = [opt.id,'_',node[opt.idField]].join("");
			
			var _pid = self._getParentID(tid);
			var liCls='';
			if( opt._firstNodes[_pid][opt.idField] === tid ) {
				liCls = 'nex-menu-first';	
				if( opt._firstNodes[opt.root][opt.idField] === tid ) {
					liCls+=' nex-menu-first-all';
				}
			}
			if( opt._lastNodes[_pid][opt.idField] === tid ) {
				liCls = 'nex-menu-last';	
			}
			
			if( node[opt.disabledField] ) {
				liCls += ' nex-menu-item-disabled';		
			}
			
			var isLeaf = self.isLeaf(tid);
			
			self.fireEvent('onBeforeCreateItem',[ tid,liCls ]);
			
			var _s = [];
			var _bg = '';
			if( tnode[opt.iconField] ) {
				_bg = "background-image:url("+tnode[opt.iconField]+")";
			}
			
			_s.push(['<div id="',menuID,'_item" menuid="',tid,'" class="nex-menu-item ',liCls,'">'].join(""));
			if( opt.showMenuIcon ) {
				_s.push(['<span class="nex-menu-icon ',tnode[opt.iconClsField],'" style="',_bg,'"></span>'].join(''));	
			}
			_s.push(['<span class="nex-menu-title">',node[opt.textField],'</span>'].join(''));
			if( !isLeaf ) {
				_s.push(['<span class="nex-menu-arrow">&nbsp;</span>'].join(''));
			}
			_s.push('</div>');
			
			self.fireEvent('onCreateItem',[ tid,_s ]);
			
			return _s.join('');
		},
		_isRoot : function(tid){
			var self = this
				,opt=this.configs;	
			return (tid === opt.root) ? true : false;
		},
		_bindUpBtnEvent : function( up,menu ){ 
			var self = this
				,opt=this.configs;	
			var menu = menu || down.parent();	
			var wraper = $('>.nex-menu-items-wraper',menu);
			var down = $('>.nex-menu-down',menu);
			
			up.bind({
				mouseenter : function(){
					var i = parseInt(wraper.css( 'margin-top' ));
					var tid = $(this).attr('menuid');
					self.hideAllMenu2( tid );
					down.show();
					if( opt._t_down ) {
						clearInterval( opt._t_down );		
					}
					opt._t_down = setInterval(function(){
													   
						i = i+opt._speedNum;
						i = Math.min(i,0);
						wraper.css({
							'margin-top' : i								  
						});		
						
						if( i>=0 ) {
							up.hide();
							clearInterval( opt._t_down );	
						}
						
					},opt._speedTime);	
				},
				mouseleave : function(){
					clearInterval( opt._t_down );	
				}		  
			});
			
			
		},
		_bindDownBtnEvent : function( down,menu ){ 
			var self = this
				,opt=this.configs;	
			var menu = menu || down.parent();	
			var up = $('>.nex-menu-up',menu);
			var wraper = $('>.nex-menu-items-wraper',menu);
			var h1 = $(menu).height(),
				h2 = wraper.outerHeight();
			var diff = h2 - h1;
			down.bind({
				mouseenter : function(){
					var i = -parseInt(wraper.css( 'margin-top' ));
					var tid = $(this).attr('menuid');
					self.hideAllMenu2( tid );
					up.show();
					if( opt._t_down ) {
						clearInterval( opt._t_down );		
					}
					opt._t_down = setInterval(function(){
													   
						i = i+opt._speedNum;
						i = Math.min(i,diff);
						wraper.css({
							'margin-top' : -i								  
						});		
						
						if( i>=diff ) {
							down.hide();
							clearInterval( opt._t_down );	
						}
						
					},opt._speedTime);	
				},
				mouseleave : function(){
					clearInterval( opt._t_down );	
				}		  
			});
			
			
		},
		_checkMenuHeight : function( tid,menu ){
			var self = this
				,opt=this.configs;	
			if( !menu ) return false;
			var h1 = $(menu).height(),
				h2 = $('>.nex-menu-items-wraper',menu).outerHeight();
			if( h2 <= h1 ) return false;

			var up = $('<div class="nex-menu-up" menuid="'+tid+'"></div>'),
				down = $('<div class="nex-menu-down" menuid="'+tid+'"></div>');
			
			menu.append( up );	
			menu.append( down );
			
			up.hide();
			
			self._bindUpBtnEvent(up,menu);
			self._bindDownBtnEvent(down,menu);
			
			self.fireEvent('onMenuScrollBtnCreate',[tid,up,down,opt]);
			
		},
		/*
		*事件绑定 注：并没有阻止事件冒泡
		*/
		_bindMenuEvent : function(lis){
			var self = this
				,opt=this.configs;	
			var menus = opt._data;
			var callBack = function(type,e){
				var tid = $(this).attr('menuid');
				var node = self._getNode(tid);
				var r = true;
				if( (type in node) && $.isFunction(node[type]) ) {
					r = node[type].apply(self,[this,tid,menus[tid],e]);
				}
				if( r!==false ) {
					r = self.fireEvent(type,[ this,tid,menus[tid],e ]);
				}
				if( r === false ) {
					e.stopPropagation();
					e.preventDefault();
				}
			};
			var events = {
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
			
			lis.bind(events);
			
			self.fireEvent('onBindMenuEvents',[ lis,events,opt ]);
		},
		bindMenuEvent : function(menu){
			var returnfalse = function(){return false;};
			$(menu).bind({
				'mousedown' : returnfalse,
				'mouseover' : returnfalse,
				contextmenu : returnfalse,
				click : returnfalse
			});
			this._bindMenuEvent($(">.nex-menu-item",menu));	
		},
		/*
		*创建Tree但不显示
		*/
		_bulidMenu : function(tid){
			var self = this
				,opt=this.configs;	
			var tid = self._undef(tid,opt.root);
			if( self.isLeaf( tid ) ) {
				return false;	
			}
			
			var node = self._getNode(tid);
			
			var menuID = [opt.id,'_',tid].join("");
			var menu = $("#"+menuID);
			var r = self.fireEvent('onBeforeBulidMenu',[ menu,tid,opt ]);
			if( r === false ) return false;
			
			var createMenu = function(){
				var childrens = self._undef(opt._childrens[ tid ],[]);;
				var menuCls = ['nex-menu'];
				if( opt.border ) {
					menuCls.push( opt.borderCls );	
				}
				menuCls.push( opt.cls );
				
				Nex.zIndex = Nex.zIndex + 2;
				
				var menu = ['<div id="',menuID,'" style="z-index:',Nex.zIndex,'" class="',menuCls.join(' '),'">'];
				menu.push('<div class="nex-menu-items-wraper" id="'+opt.id+'_items_wraper">')
				menu.push(opt.showMenuVLine ? '<div class="nex-menu-line-v"></div>' : '');
				for( var i=0;i<childrens.length;i++ ) {
					menu.push( self.getMenuItem(childrens[i]) );
				}
				menu.push('</div></div>');
				menu = $(menu.join(""));
				
				var render = $(opt.renderTo);
				render.append(menu);
				
				opt.height = menu._outerHeight();
				opt.width = node.width ? node.width : menu._outerWidth();
				
				var maxWidth = opt.maxWidth,maxHeight = opt.maxHeight;
				var mh = render.is('body') ? $(window) : render;
				if(!opt.maxWidth) {
					maxWidth = mh.width();	
				}
				if(!opt.maxHeight) {
					maxHeight = mh.height();	
				}
				
				if( opt.minWidth>0 ) {
					opt.width = Math.max(opt.width,opt.minWidth);
				}
				if( opt.minHeight>0 ) {
					opt.height = Math.max(opt.height,opt.minHeight);
				}
				if( maxWidth>0 ) {
					opt.width = Math.min(opt.width,maxWidth);
				}
				if( maxHeight>0 ) {
					opt.height = Math.min(opt.height,maxHeight);
				}
				
				var cutH = self._getCutHeight(),
					cutW = self._getCutWidth();
				opt.height -= cutH;
				opt.width -= cutW;
				
				menu._outerHeight(opt.height);
				menu._outerWidth(opt.width);
				
				return menu;
			};
			
			if( !menu.length ) {
				menu = createMenu();
				
				menu.bind('selectstart.menu',function(){return false;});	
				
				self.fireEvent('onBulidMenu',[ menu,tid,opt ]);
				
				self.bindMenuEvent($('>.nex-menu-items-wraper',menu));
				
				if( opt.showMenuMore ) {
					self._checkMenuHeight( tid,menu );	
				}
				
			}
			
			return menu;
		},
		_createMenu : function(tid){
			var self = this
				,opt=this.configs
				,undef
				,pids = [];	
			if( tid === undef ) return false;
			
			var node = self._getNode(tid);
			if( node === false && !self._isRoot(tid) ) return false ;
			
			var tree = self._bulidMenu(tid);
			if( tree === false ) return false;
			if( node ) {
				node[opt.openField] = true;
			}
			//$("#"+opt.id+'_'+tid+'_wraper').addClass("nex-tree-open");
			
			self.fireEvent('onCreateMenu',[tid,opt]);
			
			return tree;
		},
		showMenu : function(tid,m){//m == true 默认显示 m==false 不显示
			var self = this
				,opt=this.configs
				,undef;	
			var tid = self._undef(tid,opt.root);		
			var m = m === undef ? true : m;
			
			if( self.isLeaf(tid) ) {
				return false;	
			}
			
			var r = self.fireEvent('onBeforeShowMenu',[tid,opt]);//CreateMenu
			if( r === false ) return false;
			
			var menu = self._createMenu(tid);
			
			if( m ) {
				menu.show();	
			}
			
			if( menu ) {
				$("#"+opt.id+"_"+tid+"_item").addClass("nex-menu-item-active");
			}
			self.fireEvent('onShowMenu',[tid,opt]);
			return menu;
		},
		createMenu : function(tid){
			return this.showMenu(tid,0);	
		},
		hideMenu : function(menuid){
			var self = this,
				opt=this.configs,	
				undef;		
			if( menuid === undef ) return true;
			var treeID = [opt.id,'_',menuid].join("");
			
			var r = self.fireEvent('onBeforeHideMenu',[menuid,opt]);
			if( r === false ) return false;
			
			if( opt.hideToRemove ) {
				$("#"+treeID).remove();
			} else {
				$("#"+treeID).hide();
			}
			
			$("#"+treeID+'_shadow').remove();
			
			$("#"+opt.id+"_"+menuid+"_item").removeClass("nex-menu-item-active");	
			
			self.fireEvent('onHideMenu',[menuid,opt]);
			
			return true;
		},
		hideAllMenu2 : function(pid,m){
			var self = this,
				opt=this.configs;	
			var pid = self._undef(pid,opt.root);

			var allChilds = self.getAllChildrens(pid);
			
			for( var i=0;i<allChilds.length;i++ ) {
				var tid = allChilds[i][opt.idField];
				var isLeaf = self.isLeaf(tid);
				if( !isLeaf ) {
					self.hideMenu(tid);
				}	
			}
		},
		/*
		* 隐藏当前同级item列表下所有的contextmenu
		*/
		hideAllMenu : function(pid,m){
			var self = this,
				opt=this.configs;	
			var pid = self._undef(pid,opt.root);
			pid = self._isRoot( pid ) ? pid : self._getParentID(pid);
			var allChilds = self.getAllChildrens(pid);
			if( m ) {
				self.hideMenu(pid);
			}
			for( var i=0;i<allChilds.length;i++ ) {
				var tid = allChilds[i][opt.idField];
				var isLeaf = self.isLeaf(tid);
				if( !isLeaf ) {
					self.hideMenu(tid);
				}	
			}
		},
		hideRoot : function(){
			this.hideAllMenu(undefined,1);
		},
		hideLeveMenu : function(level){
			var self = this,
				opt=this.configs,
				undef;	
			if( level === undef ) return true;
			var menus = opt._levelData[ level ];
			for( var i=0;i<menus.length;i++ ) {
				self.hideMenu( menus[i][opt.idField] );	
			}
			return true;
		},
		/*
		*IE9以下版本不支持shadow 属性 所以用其他方法实现
		*/
		_setShadow : function(source){
			var self = this,
				opt=this.configs,
				undef;	
			/*if( !opt.IEVer || opt.IEVer>=9 ) {
				return true;	
			}*/
			var shadowid = $(source).attr('id') + '_shadow';
			$("#"+shadowid).remove();
			var shadow = $('<div class="nex-menu-shadow" id="'+shadowid+'"><iframe class="nex-menu-shadow-iframe" frameborder="0"></iframe></div>');
			shadow.appendTo(opt.renderTo);
			shadow.width( $(source)._outerWidth() );
			shadow.height( $(source)._outerHeight() );
			shadow.css( $(source).offset() );
			shadow.css( "zIndex",$(source).css('z-index') - 1 );	
			return true;
		},
		_showAt : function(source,target,conf,animate){
			var self = this,
				opt=this.configs,
				undef;	
			var confs = {};
			var animate = animate === undef ? true : animate;
			$.extend( confs,opt.showConf,conf,{el:target} );
			if( !source ) {
				return ;
			}
			if( animate && opt.delay>0 ) {
				if( opt._t_delay ) {
					clearTimeout( opt._t_delay );
					opt._t_delay = 0;
				}
				opt._t_delay = setTimeout(function(){
					$(source).showAt(confs);
					if( opt.showShadow ) {
						self._setShadow( source );
					}	
				},opt.delay);	
			} else {
				$(source).showAt(confs);
				if( opt.showShadow ) {
					self._setShadow( source );
				}
			}
		},
		//显示根节点的时候 调用
		showAt : function(source,target,conf){
			this._showAt(source,target,conf,false);	
		}
	});
})(jQuery);