/*
jquery.nexTree.checkbox.js
http://www.extgrid.com
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱
+----------------------------------------------------------------------------------------------------------------------------+
*/

;(function($){
	"use strict";
	//参数
	$.nexTree.addExtConf(function(){
		return {
		  showCheckbox : false,//开启checkbox
		  simpleSelect : false,//单选or多选 开启后必须关闭 checkRecursive
		  checkedField : 'checked',
		  showRaidoButton : false,
		  showParentCheckBoxButton : true,
		  checkRecursive : true,//是否联动选择父子节点。比如选中父节点，自动全选子节点。
		  //autoCheckParent : false,//是否自动选择父节点。比如选中子节点，将父节点也自动选中。	
		  checkedNodes : {}
	   };	
	});
	//事件
	$.nexTree.addExtEvent(function(){
		return {
		 onBeforeSetChceckboxIcon:$.noop,
		 onSetChceckboxIcon:$.noop,
		 onSortData:$.noop,
		 onSortColumn:$.noop
	   };	
	});
	
	$.nexTree.puglins.push(function(){
		var self = this,
			opt = self.configs;
		//防止重复绑定	
		self.unbind("onStart.checkbox");
		self.unbind("onBeforeCreateItem.checkbox");
		self.unbind("onClick.checkbox");
		//self.unbind("onBulidTree.checkbox");
		//事件绑定
		self.bind("onBeforeCreateItem.checkbox",self._setCheckboxNode);
		self.bind("onClick.checkbox",self.toCheckedClick);
		
		if( opt.simpleSelect ) opt.checkRecursive = false;		
	});
	$.nexTree.fn.extend({
		toCheckedClick : function(li,tid,d,e){
			var self = this,
				opt=this.configs;
			var target = e.srcElement ? e.srcElement : e.target;
			if( $(target).hasClass('nex-tree-checkbox') ) {
				var r = self.fireEvent('onChceckboxClick',[ target,tid,e ]);
				if( r === false ) return r;
				self.toggleChecked(tid);
			}
		},
		toggleChecked : function(tid){
			var self = this,
				opt=this.configs;
			var t = "#"+opt.id+"_"+tid+'_wraper';
			var ck = $(">span.nex-tree-checkbox",$(t));
			if( ck.hasClass('nex-tree-checkbox1') ) {
				self.setNodeUnChecked(tid);
			} else {
				self.setNodeChecked(tid);	
			}
			return self;
		},
		_setNodeChecked : function(tid){
			var self = this,
				opt=this.configs;
			var r = self.fireEvent('onBeforeNodeChecked',[ tid ]);	
			if( r===false ) return r;
			if( opt.simpleSelect ) {
				for( var id in opt.checkedNodes ) {
					if( opt.checkedNodes[id] )	self._setNodeUnChecked(id);
				}	
			}
			var t = "#"+opt.id+"_"+tid+'_wraper';
			$(">span.nex-tree-checkbox",$(t))
			.removeClass("nex-tree-checkbox0 nex-tree-checkbox1 nex-tree-checkbox2")
			.addClass('nex-tree-checkbox1');
			var node = self._getNode(tid);
			node[opt.checkedField] = true;
			opt.checkedNodes[tid] = true;
			self.fireEvent('onNodeChecked',[ tid ]);
		},
		setNodeChecked : function(tid){
			var self = this,
				opt=this.configs;
			if( self.isLeaf(tid) || !opt.checkRecursive ) {
				self._setNodeChecked(tid);
				self.checkParentChecked(tid);
			} else {
				self.setAllNodeChecked(tid);	
			}
		},
		setAllNodeChecked : function(tid){
			var self = this,
				opt=this.configs;
				
			self._setNodeChecked(tid);	
			if( !opt.simpleSelect ) {
				var childs = self.getAllChildrens(tid);
				for( var i=0;i<childs.length;i++  ) {
					self._setNodeChecked(childs[i][opt.idField]);	
				}
			}
			self.checkParentChecked(tid);
		},
		_setNodeUnChecked : function(tid){
			var self = this,
				opt=this.configs;
			var r = self.fireEvent('onBeforeUnNodeChecked',[ tid ]);	
			if( r===false ) return r;	
			var t = "#"+opt.id+"_"+tid+'_wraper';
			$(">span.nex-tree-checkbox",$(t))
			.removeClass("nex-tree-checkbox0 nex-tree-checkbox1 nex-tree-checkbox2")
			.addClass('nex-tree-checkbox0');
			var node = self._getNode(tid);
			node[opt.checkedField] = false;
			opt.checkedNodes[tid] = false;
			self.fireEvent('onNodeUnChecked',[ tid ]);
		},
		setNodeUnChecked : function(tid){
			var self = this,
				opt=this.configs;
			if( self.isLeaf(tid) || !opt.checkRecursive  ) {
				self._setNodeUnChecked(tid);
				self.checkParentChecked(tid);
			} else {
				self.setAllNodeUnChecked(tid);	
			}
		},
		setAllNodeUnChecked : function(tid){
			var self = this,
				opt=this.configs;
			var childs = self.getAllChildrens(tid);
			self._setNodeUnChecked(tid);	
			for( var i=0;i<childs.length;i++  ) {
				self._setNodeUnChecked(childs[i][opt.idField]);	
			}
			self.checkParentChecked(tid);
		},
		setParentCheck2 : function(tid){
			var self = this,
				opt=this.configs;
			var t = "#"+opt.id+"_"+tid+'_wraper';
			$(">span.nex-tree-checkbox",$(t))
			.removeClass("nex-tree-checkbox0 nex-tree-checkbox1 nex-tree-checkbox2")
			.addClass('nex-tree-checkbox2');
		},
		checkParentChecked : function(tid){
			var self = this,
				opt=this.configs;
			if( !opt.checkRecursive ) return;	
			var pids = self._getParentsList(tid);
			pids.reverse();
			for( var i=0;i<pids.length;i++ ) {
				var _pid = pids[i];
				var childs = self.getAllChildrens(_pid);
				var t = 0;
				for( var j=0;j<childs.length;j++ ) {
					if( childs[j][opt.checkedField] ) {
						t++;	
					}	
				}
				if( t >= childs.length ) {
					self._setNodeChecked(_pid);	
				} else if( t>0 ) {
					self.setParentCheck2(_pid);		
				} else {
					self._setNodeUnChecked(_pid);			
				}
			}
		},
		_getCheckBoxIcon : function(tid){
			var self = this,
				opt=this.configs;
			if( self._getNode(tid,opt.checkedField) ) {
				opt.checkedNodes[tid] = true;
				return 'nex-tree-checkbox1';		
			} else {
				var childs = self.getAllChildrens(tid);
				for( var i=0;i<childs.length;i++  ) {
					if( childs[i][opt.checkedField] ) {
						return 	'nex-tree-checkbox2';	
					}
				}	
			}
			return 'nex-tree-checkbox0';	 
		},
		_setCheckboxNode : function(tid,liCls,spacers){
			var self = this,
				opt=this.configs;
			//nex-tree-icon icon-folder icon-file
			if( opt.showCheckbox ) {
				var r = self.fireEvent('onBeforeSetChceckboxIcon',[ tid,liCls,spacers ]);
				if( r===false ) return;
				if( !opt.showParentCheckBoxButton && !self.isLeaf(tid) ) {
					return;	
				}
				var icons = ['nex-tree-icon','nex-tree-checkbox'];
				icons.push( self._getCheckBoxIcon(tid) );	
				self.fireEvent('onSetChceckboxIcon',[ tid,liCls,spacers,icons ]);
				spacers.push( icons.join(' ') );
			}	
		}			 
	}); 
})(jQuery);