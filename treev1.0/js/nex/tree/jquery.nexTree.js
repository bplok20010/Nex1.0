/*
jquery.nexTree.js
http://www.extgrid.com/tree
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱

*/

;(function($){
	"use strict";
	var tree = Nex.widget('tree');

	$.nexTree = $.extTree = tree;
	
	tree.extend({
		version : '1.0',
		getDefaults : function(opt){
			var _opt = {
				prefix : 'nextree-',
				renderTo : document.body,
				isIE : !!window.ActiveXObject,
				url : '',//支持远程创建 返回数据格式  json
				cache : true,
				dataType : 'json',
				queryParams : {},
				method : 'get',
				parames : {},
				data : [],
				cls : '',
				showTreeLines : true,//显示节点线条
				showTreeIcon : true,//显示节点图标
				animate : true,//展开 收缩节点时的动画效果
				animateTime : 100,
				_animateTime : {},
				_data : {},
				_childrens : {},
				_levelData : {},//level=>[]
				_firstNodes : {},// 0:node1,1:node2 k=>v k表示第几级
				_lastNodes : {},// 0:node1,1:node2 k=>v k表示第几级
				expandOnEvent : 2,//0 不开启 1单击展开 2双击展开
				expandOnLoad : false,
				simpleData : false,
				root : '0',//simpleData下可不用设置且只在初始化时有效，初始化后会用showRowId代替
				showRootId : '0',//请设置对应的顶层ID 非simpleData下可不用设置
				iconField : 'icon',//图标字段 样式
				idField : 'id',
				textField : 'text',
				openField : 'open',
				levelField : '_level',
				parentField : 'pid',
				sortField : 'order',
				groupNode : true,//开启后会对叶子和节点进行分类
				singleSelect : true,
				_selectNodes : {},//选择的行
				allowDrag : false,//是否允许拖拽节点
				allowDrop : false,//是否允许投放节点
				//removeOnCollapse : true,//收缩节点被删除。极大提升性能。
				//_tfix : 'tree.',
				
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
	$.nexTree.fn.extend({
		_init : function(opt) {
			var self = this;
			
			self._mapTree(opt.data);
			
			self.show();
		},
		_sysEvents : function(){
			var self = this;
			var opt = self.configs;
			self.bind("onMouseOver.over",self.onMouseOver,self);
			self.bind("onMouseOut.over",self.onMouseOut,self);
			self.bind("onClick.select",self._selectNode,self);
			self.bind("onClick.expand",self.toExpandClick,self);
			self.bind("onDblClick.expand",self.toExpandDblClick,self);
			//处理用户多选 单选 和其他图标
			self.bind("onBeforeCreateItem.icon",self._setNodeIcon,self);
			
			return self;
		},
		toExpandClick : function(li,tid,tree,e){
			var self = this,
				opt=this.configs;
			var target = e.srcElement ? e.srcElement : e.target;
			
			if( opt.expandOnEvent === 1 ) {
				self.toggleNode(tid);
			} else if( $(target).hasClass(opt.showTreeLines?'nex-tree-expander':'nex-tree-expander-nl') || $(target).hasClass('nex-tree-expander-end') ) {
				self.toggleNode(tid);
			}
			
		},
		toExpandDblClick : function(li,tid){
			var self = this,
				opt=this.configs;
			if( opt.expandOnEvent === 2 ) {
				self.toggleNode(tid);
			}
		},
		_setNodeIcon : function(tid,liCls,spacers){
			var self = this,
				opt=this.configs;
			var icon = self._getNode(tid,opt.iconField);
			//nex-tree-icon icon-folder icon-file
			if( opt.showTreeIcon ) {
				var icons = ['nex-tree-icon'];
				if( self.isLeaf( tid ) ) {
					icons.push( icon ? icon : 'nex-tree-file' );	
				} else {
					icons.push( icon ? icon : 'nex-tree-folder' );		
				}
				spacers.push( icons.join(' ') );
			}	
		},
		onMouseOver : function(li,tid){
			$(">div.nex-tree-item-wraper",li).addClass("nex-tree-item-over");
		},
		onMouseOut : function(li,tid){
			$(">div.nex-tree-item-wraper",li).removeClass("nex-tree-item-over");	
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
				
				if( node[opt.parentField] === undef ) {
					node[opt.parentField] = pid === undef ? opt.root : pid;
					node[opt.levelField] = pid === undef ? 0 : self._getNode(pid,opt.levelField)+1;
				} else {
					node[opt.levelField] = 	self._getNode(node[opt.parentField],opt.levelField)+1;
				}
				if( !(opt.idField in node) ) {
					node[opt.idField] = 'tree_'+self.unique();	
				} else{
					if(node[opt.idField].toString().length<=0) {
						node[opt.idField] = 'tree_'+self.unique();		
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
				self.groupNodes( nid );
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
				node[opt.levelField] = pid === undef ? 0 : self._getNode(pid,opt.levelField)+1;
				node[opt.parentField] = pid === undef ? opt.root : pid;
				
				if( !(opt.idField in node) ) {
					node[opt.idField] = 'tree_'+self.unique();	
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
				
				if( ( 'children' in node ) && node['children'].length ) {
					self._mapTree(node['children'],node[opt.idField]);
				}
				
				if( (i+1) === data.length ) {
					self.groupNodes( _pid );
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
			self.refreshTree(tid);
		},
		_selectNode : function(li,tid,d,e){
			var self = this
				,opt=this.configs
				,undef;
			self.selectNode(tid);	
		},
		unSelectNode : function(tid){
			var self = this
				,opt=this.configs
				,undef;
			if( tid === undef ) return false;	
			var r = self.fireEvent("onBeforeUnSelectNode",[tid,opt]);
			if( r === false ) return false;
			$("#"+opt.id+'_'+tid+'_wraper').removeClass("nex-tree-item-selected");
			opt._selectNodes[tid] = false;
			self.fireEvent("onUnSelectNode",[tid,opt]);
		},
		selectNode : function(tid){
			var self = this
				,opt=this.configs
				,undef;
			if( tid === undef ) return false;
			var r = self.fireEvent("onBeforeSelectNode",[tid,opt]);
			if( r === false ) return false;
			for( var i in opt._selectNodes ) {
				if(opt._selectNodes[i] && opt.singleSelect) {
					self.unSelectNode(i);	
				}
			}
			$("#"+opt.id+'_'+tid+'_wraper').addClass("nex-tree-item-selected");
			opt._selectNodes[tid] = true;
			self.fireEvent("onSelectNode",[tid,opt]);
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
				if( ('children' in tnode) && tnode['children'].length ) {
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
		getTreeItemSpacer : function(tnode){
			var self = this
				,opt=this.configs
				,pids = [];
			var node = $.isPlainObject(tnode) ? tnode : self._getNode(tnode);
			if( node === false ) return [];
			//console.log(node);
			var n = node;
			var cpid = node[opt.idField];
			//pids.push(cpid);
			pids = self._getParentsList( cpid );
			//console.log(pids);
			var spacer = [];
			
			for( var i=0;i<pids.length;i++ ) {
				//是否最后一个节点
				var pid = pids[i];
				if( self._isRoot(pid) ) continue;
				if( self._isLastNode(pid) ) {
					spacer.push('nex-tree-empty');	
				} else {
					spacer.push(opt.showTreeLines ? 'nex-tree-line' : 'nex-tree-empty');
				}
			}	
			
			if( self.isLeaf(cpid) ) {
				var d = opt._data;
				var j=0;
				for( var x in d ) {
					j++;
					if( j>=2 ) break;
				}
				if(j>1) {
					if( self._isLastNode(cpid) ) {
						spacer.push(opt.showTreeLines ? 'nex-tree-elbow-end':'nex-tree-empty');
					} else {
						spacer.push(opt.showTreeLines ? 'nex-tree-elbow':'nex-tree-empty');
					}
				} else {
					spacer.push('nex-tree-empty');//如果树形只有一条记录 可以显示nex-tree-empty nex-tree-elbow-end		 
				}
			} else {
				//spacer.push('nex-tree-expander');	
				if( self._isLastNode(cpid) ) {
					spacer.push(opt.showTreeLines ? 'nex-tree-expander-end':'nex-tree-expander-nl');
				} else {
					spacer.push(opt.showTreeLines ? 'nex-tree-expander' : 'nex-tree-expander-nl');
				}
			}
			self.fireEvent('onGetSpacers',[ cpid,spacer ]);
			return spacer;
		},
		getTreeItem : function(tnode){
			var self = this
				,opt=this.configs
				,spacers = [];
			var node = $.isPlainObject(tnode) ? tnode : self._getNode(tnode);
			if( node===false ) return '';
			
			var tid = node[opt.idField];
				
			var spacers = self.getTreeItemSpacer(node);
			var treeID = [opt.id,'_',node[opt.idField]].join("");
			
			var _pid = self._getParentID(tid);
			var liCls='';
			if( opt._firstNodes[_pid][opt.idField] === tid ) {
				liCls = 'nex-tree-first';	
				if( opt._firstNodes[opt.root][opt.idField] === tid ) {
					liCls+=' nex-tree-first-all';
				}
			}
			if( opt._lastNodes[_pid][opt.idField] === tid ) {
				liCls = 'nex-tree-last';	
			}
			
			
			self.fireEvent('onBeforeCreateItem',[ tid,liCls,spacers ]);
			
			var _s = [];
			
			_s.push(['<li id="',treeID,'" class="nex-tree-item" treeid="',tid,'"><div id="',treeID,'_wraper" class="nex-tree-item-wraper ',liCls,'">'].join(""));
			for( var i=0;i<spacers.length;i++ ) {
				_s.push(['<span class="nex-tree-indent ', spacers[i] ,'"></span>'].join(''));	
			}
			_s.push(['<span class="nex-tree-title">',node[opt.textField],'</span>'].join(''));
			_s.push('</div></li>');
			
			self.fireEvent('onCreateItem',[ tid,_s ]);
			
			return _s.join('');
		},
		_isRoot : function(tid){
			var self = this
				,opt=this.configs;	
			return (tid === opt.root) ? true : false;
		},
		/*
		*事件绑定 注：并没有阻止事件冒泡
		*/
		_bindTreeEvent : function(lis){
			var self = this
				,opt=this.configs;	
			var trees = opt._data;
			var callBack = function(type,e){
				var target = e.srcElement ? e.srcElement : e.target;
				var el = $(target).closest("li.nex-tree-item");
				var tid = $(el).attr('treeid');
				var _tid = $(this).attr('treeid');
				if( tid !== _tid ) return;
				var node = self._getNode(tid);
				var r = true;
				if( (type in node) && $.isFunction(node[type]) ) {
					r = node[type].apply(self,[this,tid,trees[tid],e]);
				}
				if( r!==false ) {
					r = self.fireEvent(type,[ this,tid,trees[tid],e ]);
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
				'mouseover' : function(e){
					callBack.call(this,'onMouseOver',e);
				},
				'mouseout' : function(e){
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
			
			self.fireEvent('onBindTreeEvents',[ lis,events,opt ]);
		},
		bindTreeEvent : function(tree){
			this._bindTreeEvent($(">li",tree));	
		},
		/*
		*创建Tree但不显示
		*/
		_bulidTree : function(tid){
			var self = this
				,opt=this.configs;	
			var tid = self._undef(tid,opt.root);
			if( self.isLeaf( tid ) ) {
				return false;	
			}
			var isRoot = self._isRoot(tid);
			var treeID = isRoot ? opt.id : [opt.id,'_',tid,'_child'].join("");
			var tree = $("#"+treeID);
			
			var r = self.fireEvent('onBeforeBulidTree',[ tree,tid,opt ]);
			if( r === false ) return false;
			
			var createTree = function(){
				var childrens = self._undef(opt._childrens[ tid ],[]);;
				var treeCls = isRoot ? 'nex-tree '+opt.cls : '';
				var tree = ['<ul id="',treeID,'" class="',treeCls,'">'];
				for( var i=0;i<childrens.length;i++ ) {
					tree.push( self.getTreeItem(childrens[i]) );
				}
				tree.push('</ul>');
				tree = $(tree.join(""));
				tree.hide();
				var render = isRoot ? $(opt.renderTo) : $("#"+opt.id+'_'+tid);
				render.append(tree);	
				//tree.slideDown();	
				return tree;
			};
			
			if( !tree.length ) {
				tree = createTree();
				self.bindTreeEvent(tree);
				if( isRoot ) {
					tree.bind('selectstart.tree',function(){return false;});	
				}
				self.fireEvent('onBulidTree',[ tree,tid,opt ]);
			}
			
			return tree;
		},
		showLoading : function(tid){
			var self = this,
				opt = self.configs;	
			$("#"+opt.id+'_'+tid+'_wraper').addClass('nex-tree-loading');
		},
		hideLoading : function(tid){
			var self = this,
				opt = self.configs;	
			$("#"+opt.id+'_'+tid+'_wraper').removeClass('nex-tree-loading');
		},
		jsonFilter : function(data){
			return data;	
		},
		/*
		* 设置ajax返回的数据
		* @json  {Array} 数据集
		*/
		metaData : function( tid,json ){
			var self = this,
				opt = self.configs;
			
			var d = json || {};
			
			var data = $.isArray(d) ? {data:d} : d;
			
			if( !('data' in data) ) {
				data['data'] = [];	
			}
			
			for( var c in data ) {
				opt[c] = data[c];
			}
			
			self._mapTree(opt.data,tid);
		},
		_loadSuccess : function(tid,data,successBack){
			var self = this,
				opt = self.configs;
			
			var dataType = opt.dataType.toLowerCase();
			
			var filter = dataType+'Filter';
			
			var data = data;
			
			if( filter in self ) {
				if( $.isFunction( self[filter] ) ) {
					data = self[filter].call(self,data);
				}
			} else if( filter in opt ) {
				if( $.isFunction( opt[filter] ) ) {
					data = opt[filter].call(self,data);
				}	
			} else if( filter in window ) {
				if( $.isFunction( window[filter] ) ) {
					data = window[filter].call(window,data);
				}	
			}
						
			self.fireEvent('onLoadSuccess',[tid,data,successBack,opt]);
			
			//json
			self.metaData(tid,data);
			
			self.hideLoading(tid);	
			
		},
		_loadError : function(tid,msg,errorBack,xmlHttp){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			
			self.hideLoading(tid);	
			
			self.fireEvent('onLoadError',[tid,msg,errorBack,xmlHttp,opt]);

		},
		loadTreeData : function(tid,successBack,errorBack){
			var self = this
				,opt=this.configs
				,undef;	
			var successBack = successBack || $.noop;
			var errorBack = errorBack || $.noop;
			var beforeSend = function(){
					var r = self.fireEvent('onBeforeLoad',[tid,opt]);
					if( r === false ) return false;
					self.showLoading(tid);	
				};
			var success = function(data){
				
				self._loadSuccess(tid,data,successBack);
				
				successBack.call(self);
				
			};
			var error = function(xmlHttp){
						//e.onLoadError.call(self,xmlHttp.responseText);
				var xmlHttp = $.isPlainObject( xmlHttp ) ? xmlHttp : {responseText:xmlHttp};
				
				self._loadError(tid,xmlHttp.responseText,errorBack,xmlHttp);
				
				errorBack.call(self,xmlHttp.responseText);
			};
			opt.queryParams[opt.idField] = tid;
			if( $.isFunction( opt.url ) ) {
				
				var _r = beforeSend();
				
				if( _r === false ) return;
				
				var data = opt.url.call(self,opt.queryParams,success,error);
				if( data !== undef ) {
					success(data);	
				}
				
			} else {
				$.ajax({
					url : opt.url,
					type : opt.method,
					cache : opt.cache,
					dataType : opt.dataType,
					data : opt.queryParams,
					beforeSend : beforeSend,
					success : success,
					error : error
				});	
			}	
		},
		toggleNode : function(tid){
			var self = this
				,opt=this.configs
				,undef;
			if( tid === undef ) return false;
			
			var node = self._getNode(tid);
			if( node === false ) return false;
			
			if( node[opt.openField] ) {
				self.collapseNode(tid);
			} else {
				self.expandNode(tid);	
			}
		},
		_expandNode : function(tid){
			var self = this
				,opt=this.configs
				,undef
				,pids = [];	
			if( tid === undef ) return false;
			
			var node = self._getNode(tid);
			if( node === false && !self._isRoot(tid) ) return false ;
			if( opt._animateTime[tid] ) {
				return false;	
			}

			pids = self._getParentsList( tid );
	
			for( var i=0;i<pids.length;i++ ) {
				var _tid = pids[i];
				var _node = self._getNode(_tid);
				//if( self._isRoot( _tid ) ) continue;
				if( _node !== false ) _node[opt.openField] = true;
				
				var tree = self._bulidTree(_tid);
				if( tree === false ) continue;
				tree.show();
				$("#"+opt.id+'_'+_tid+'_wraper').addClass("nex-tree-open");
			}
			
			var tree = self._bulidTree(tid);
			if( tree === false ) return false;
			if( node )
				node[opt.openField] = true;
			
			if( opt.animate ) {
				opt._animateTime[tid] = true;	
				tree.slideDown(opt.animateTime,function(){
					opt._animateTime[tid] = false;										
				});	
			} else {
				tree.show();	
			}
			$("#"+opt.id+'_'+tid+'_wraper').addClass("nex-tree-open");
			
			self.fireEvent('onExpandNode',[tid,opt]);
			
			return true;
		},
		expandNode : function(tid){
			var self = this
				,opt=this.configs
				,undef;	
			var tid = self._undef(tid,opt.root);		
			if( self.isLeaf(tid) ) {
				return false;	
			}
			
			var r = self.fireEvent('onBeforeExpandNode',[tid,opt]);
			if( r === false ) return false;
			
			if( self.isEmptyData(tid) && opt.url ) {
				self.unbind("onLoadSuccess.url");
				self.bind("onLoadSuccess.url",function(tid,data){
					setTimeout(function(){
						var childrens = self.getAllChildrens(tid);
						for( var i=0;i<childrens.length;i++ ) {
							if( childrens[i][opt.openField] )
								self.expandNode(childrens[i][opt.idField]);	
						}
					},0);
				});
				self.loadTreeData(tid,function(){
					self._expandNode(tid);						   
				});
			} else {
				self._expandNode(tid);
			}
		},
		_collapseNode : function(tid){
			var self = this
				,opt=this.configs
				,undef;	
			if( tid === undef ) return false;
			var node = self._getNode(tid);
			if( node === false || self._isRoot(tid) ) return false;
			if( opt._animateTime[tid] ) {
				return false;	
			}
			
			var isRoot = self._isRoot(tid);
			if( isRoot ) return false;
			var treeID = [opt.id,'_',tid,'_child'].join("");
			var tree = $("#"+treeID);
			if( opt.animate ) {
				opt._animateTime[tid] = true;	
				tree.slideUp(opt.animateTime,function(){
					opt._animateTime[tid] = false;										
				});
			} else {
				tree.hide();	
			}
			$("#"+opt.id+'_'+tid+'_wraper').removeClass("nex-tree-open");
			node[opt.openField] = false;
			self.fireEvent('onCollapseNode',[tid,opt]);
			return true;
		},
		collapseNode : function(tid){
			var self = this,opt=this.configs;
			var tid = self._undef(tid,opt.root);	
			var r = self.fireEvent('onBeforeCollapseNode',[tid,opt]);
			if( r === false ) return false;
			self._collapseNode(tid);
		},
		/*
		*打开当前节点的子节点
		*/
		expandChildrens : function(pid){
			var self = this,
				opt=this.configs;
			var pid = self._undef(pid,opt.root);	
			var childs = self.getChildrens(pid);
		
			for(var i=0;i<childs.length;i++) {
				if( self.isLeaf( childs[i] ) ) continue;
				//console.log(childs[i]);
				self.expandNode( childs[i][opt.idField] );	
			}
		},
		/*
		*打开当前节点下的所有子节点
		*/
		expandAll : function(pid){
			var self = this,
				opt=this.configs;	
			var pid = self._undef(pid,opt.root);
			var isRoot = self._isRoot(pid);
			//开启Url情况下 在 获取新值后自动展开
			if( opt.url ) {
				self.unbind("onLoadSuccess.expandAll");
				self.bind("onLoadSuccess.expandAll",function(tid,data){
					setTimeout(function(){
						self.expandAll(tid);					
					},0);
				});
			}
			var allChilds = self.getAllChildrens(pid);
			self.expandNode(pid);
			for( var i=0;i<allChilds.length;i++ ) {
				var tid = allChilds[i][opt.idField];
				var isLeaf = self.isLeaf(tid);
				if( !isLeaf ) {
					self.expandNode(tid);
				}	
			}
			/*for(var tid in opt._data) {
				
				if( !isLeaf && isRoot ) {
					self.expandNode(tid);
				} else if( !isLeaf ) {
					var pids = self._getParentsList(tid);
					if( self.inArray(pid,pids) !== -1 ) {
						self.expandNode(tid);	
					}
				}
			}*/
			
		},
		collapseChildrens : function(pid){
			var self = this,
				opt=this.configs;
			var pid = self._undef(pid,opt.root);	
			var childs = self.getChildrens(pid);
		
			for(var i=0;i<childs.length;i++) {
				if( self.isLeaf( childs[i] ) ) continue;
				//console.log(childs[i]);
				self.collapseNode( childs[i][opt.idField] );	
			}
		},
		collapseAll : function(pid){
			var self = this,
				opt=this.configs;	
			var pid = self._undef(pid,opt.root);
			
			var allChilds = self.getAllChildrens(pid);
			self.collapseNode(pid);
			for( var i=0;i<allChilds.length;i++ ) {
				var tid = allChilds[i][opt.idField];
				var isLeaf = self.isLeaf(tid);
				if( !isLeaf ) {
					self.collapseNode(tid);
				}	
			}
		
			/*for(var tid in opt._data) {
				var isLeaf = self.isLeaf(tid);
				if( !isLeaf && isRoot ) {
					self.collapseNode(tid);
				} else if( !isLeaf ) {
					var pids = self._getParentsList(tid);
					if( self.inArray(pid,pids) !== -1 ) {
						self.collapseNode(tid);	
					}
				}
			}	*/
		},
		isEmptyData : function(pid){
			var self = this,
				opt=this.configs,
				undef;
			var pid = self._undef(pid,opt.root);
			
			var childs = self.getChildrens(pid);
			
			return childs.length ? false : true;
		},
		
		/*
		*刷新某节点
		*/
		refreshTree : function(pid){
			var self = this,
				opt=this.configs;	
			var pid = self._undef(pid,opt.root);
			var r = self.fireEvent('onBeforeRefreshTree',[pid,opt]);
			if( r === false ) return false;
			if( self._isRoot(pid) ) {
				$("#"+opt.id).remove();
				self.show();	
			} else {
				var _anmiate = 	opt.animate;
				opt.animate = false;
				var node = self._getNode(pid);
				if( node === false ) return false;
				var newItem = $(self.getTreeItem(pid)).html();
				$("#"+opt.id+'_'+pid).html(newItem);
				if( node[opt.openField] ) {
					self.expandNode(pid);	
					var allChilds = self.getAllChildrens(pid);
					for( var i=0;i<allChilds.length;i++ ) {
						if( allChilds[i][opt.openField] ) {
							self.expandNode(allChilds[i][opt.idField]);	
						}	
					}
				} else {
				}
				opt.animate = _anmiate;
			}
			self.fireEvent('onRefreshTree',[pid,opt]);
		},
		show : function(){
			var self = this,
				opt=this.configs;	
			var _anmiate = 	opt.animate;
			opt.animate = false;
			opt.root = opt.showRootId;
			if( opt.expandOnLoad ) {
				self.expandAll(opt.root);	
			} else {
				self.expandNode(opt.root);
				for(var tid in opt._data) {
					if( opt._data[tid][opt.openField] ) {
						self.expandNode(tid);
					}	
				}
			}
			opt.animate = _anmiate;
		}
	});
	$.fn.nexTree = function(conf){
		var undef,opt;
		var conf = conf === undef ? {} : conf;
		opt = 	conf;
		var list = [];
		this.each(function(){
			opt.renderTo = $(this);
			var o = new Nex.tree(opt);
			list.push(o);
			$(this).data('nex.tree',o);
		});
		return list.length === 1 ? list[0] : list;
	};
	$.fn.extTree = $.fn.nexTree;
})(jQuery);