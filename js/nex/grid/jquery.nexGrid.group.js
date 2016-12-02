/*
jquery.extGrid.group.js
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
	$.nexGrid.addExtConf({
						  groupBy:false,
						  showGroupRow : true,
						  groupList:false,
						  groupListCallBack:$.noop,
						  _groupListData:[]
						 });
	//事件
	$.nexGrid.addExtEvent({
						   onShowGroup:$.noop,
						   onHideGroup:$.noop
						 });
	$.nexGrid.puglins.push(function(){
		var self = this,
			opt = self.configs;
		//防止重复绑定	
		self.unbind("onBeforeShowGrid.group");
		self.unbind("onShowGrid.group");
		self.unbind("onFieldWidthChange.group");
		self.unbind("onForceFitColumn.group");
		self.unbind("onShowColumn.group");
		self.unbind("onHideColumn.group");
		self.unbind("showGroup.group");
		
		if( opt.lazyLoadRow ) {
			opt.showGroupRow = false;	
		}
		
		self.bind("onBeforeShowGrid.group",function(){
			if( opt.groupBy ) {
				this.groupByField();		
			}					  
		});
		self.bind("onShowGrid.group",function(){
			if( opt.groupBy && opt.showGroupRow ) {								  
				this.addGroupRow(true);	
			}
		});
		self.bind("onFieldWidthChange.group",self.setGroupRowSize);
		self.bind("onForceFitColumn.group",self.setGroupRowSize);
		self.bind("onShowColumn.group",self.setGroupRowSize);
		self.bind("onHideColumn.group",self.setGroupRowSize);
		//兼容IE 67 事件 当打开分组时应该重新设置列宽
		self.bind("onShowGroup.group",self.fixIEHack);
		
		//self.bind("onAfterLockColumn.expandrow",self._resetRowNumber);
		self.bind("onAfterLockColumn.group",self.setGroupRowSize);
		//self.bind("onAfterUnLockColumn.expandrow",self._resetRowNumber);
		self.bind("onAfterUnLockColumn.group",self.setGroupRowSize);
	});
	$.nexGrid.fn.extend({
		fixIEHack : function(){
			var self = this,
				opt = self.configs;	
			
			var check = function(regex){
				return regex.test(navigator.userAgent.toLowerCase());
			},
			isOpera = check(/opera/),
			docMode = document.documentMode,
			isIE = !isOpera && check(/msie/),
			isIE7 = isIE && ((check(/msie 7/) && docMode != 8 && docMode != 9) || docMode == 7),
			isIE6 = isIE && check(/msie 6/);
			if( isIE7 || isIE6 ) {
				var last = opt.columns[ opt.columns.length-1 ];
				if( !last ) return;
				var _w = last['width'];
				var w = $("#view2-datagrid-header-inner-htable-tbody-"+opt.id).find(">.datagrid-header-row .datagrid-cell-header-"+last.field)._outerWidth();
				self._setFieldWidth(last['field'],w+1);
				setTimeout(function(){
					self._setFieldWidth(last['field'],w);
					last['width'] = _w;
					//alert(opt.columns[0]['width']);
				},0);
			}
		},
		//对数据按指定的grouplist字段分类，并重新设置configs的data数据，途中会修改configs的 groupBy  groupList
		groupByField : function(field,data,groupList){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			
			var field = self._undef(field,opt.groupBy);	
			var data = self._undef(data,opt.data);
			var groupList = self._undef(groupList,opt.groupList);
			opt._groupList = self._undef(opt._groupList,opt.groupList);
			
			if(field === false) {
				return self;
			}
			
			//字段检测
			//var fields = self.getColumns();
			var fields = opt.columns;
			var index = false;//数据索引 默认 == field
			var _field = false;
			for(var i=0;i<fields.length;i++) {
				if( fields[i]['field'] == field ) {
					_field = field;
					index = fields[i]['index'];
					break;	
				}
			}
			if( _field === false ) {
				opt.groupBy = _field;
				return self;
			}
			field = _field;
			opt.groupBy = field;
			//data数据分类
			var _data = [];
			if(opt._groupList === false) {
				groupList = [];
				var len = data.length;
				for(var i=0;i<len;i++) {
					if( self.inArray(data[i][index] , groupList ) === -1 ) {
						groupList.push(data[i][index]);	
					}
				}	
			}
			opt.groupList = groupList;
			var slen = groupList.length;
			var dlen = data.length;
			for(var j=0;j<slen;j++) {
				var _d = [];
				for(var t=0;t<dlen;t++) {
					if( data[t][index] == groupList[j] ) {
						data[t]['_groupid_'] = j;
						_d.push(data[t]);	
					}
				}
				_data[j] = _d;
				_d = [];

			}
			opt._groupListData = _data;
			
			data = [];//清空原有数据
			var k = 0,
				klen = _data.length;
			for(;k<klen;k++) {
				var sklen = _data[k].length;
				for(var n=0;n<sklen;n++) {
					data.push( _data[k][n] );
				}	
			}
			opt.data = data;
			return self;
		},
		showGroup : function(groupId,type){
			var self = this,
				opt = self.configs,
				gid = opt.gid;	
			if(!opt.groupBy || !opt.showGroupRow ) return;		
			var render = gid+" .datagrid-view2";	
			var render1 = gid+" .datagrid-view1";
			var type = self._undef(type,'show');
			if( typeof groupId == 'undefined') return self;
			var g1 = $(render).find("tr[datagrid-group-id='"+groupId+"']");
			var g2 = $(render1).find("tr[datagrid-group-id='"+groupId+"']");
			g1[type]();
			g2[type]();
			
			//expand 的自动展现问题 每次展开group 都会重置expand
		 	g1.each(function(i){
				var indexid = $(this).attr('datagrid-rid');
				/*
				var _d = self.getRowData( indexid );
				_d['_openExpand'] = self._undef(_d['_openExpand'],false);
				if( _d['_openExpand'] ) {
					self.expandRow(indexid,_d['_expand']);
				}*/
				if(type == 'hide') {
					self._hideExpandRow(indexid);	
				}
			});
			if(type == 'show') {//datagrid_22768-group-row-0
				$(render).find("#"+opt.id+"-group-row-"+groupId).find(".datagrid-group-cell").addClass("datagrid-group-cell-select");
				$(render1).find("#"+opt.id+"-group-view1-row-"+groupId).find(".datagrid-group-cell-rownumber").addClass("datagrid-group-cell-rownumber-select");
			} else {
				
				$(render).find("#"+opt.id+"-group-row-"+groupId).find(".datagrid-group-cell").removeClass("datagrid-group-cell-select");
				$(render1).find("#"+opt.id+"-group-view1-row-"+groupId).find(".datagrid-group-cell-rownumber").removeClass("datagrid-group-cell-rownumber-select");
			}
			//rownumber位置刷新
			//opt.gbody.scrollLeft(opt.sLeft);
			//opt.gbody.scrollTop(opt.sTop);
			//opt.gbody.scroll();
			
			if(type == 'show') {
				self.fireEvent('onShowGroup',[groupId]);
			} else {
				self.fireEvent('onHideGroup',[groupId]);	
			}
			
			//self.fireEvent('onScroll',[true]);
			self.onScroll(true);
			//self.fireEvent('onViewSizeChange',[]);
			self.methodInvoke("resetViewSize");
			
			return self;
		},
		hideGroup : function(groupId){
			var self = this;
			return 	self.showGroup(groupId,'hide');
		},
		addGroupRow : function(isFirst){//isFirst = true 隐藏所有行
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var render = gid+" .datagrid-view2";	
			var render1 = gid+" .datagrid-view1";
			if( !opt.groupBy  || !opt.showGroupRow) return false;
			var isFirst = self._undef(isFirst,false);
			//隐藏
			if(isFirst) {
				$("#view2_"+opt.id).find(".datagrid-row").hide();
				$("#view1_"+opt.id).find(".datagrid-row").hide();
			}
			
			var grw = $(render).find(".datagrid-header-row").width();
			
			//var rowNumber = parseFloat(opt.rowNumbersWidth);
			var cls = '';
			if(opt.rowNumbersWidth !== false) {
				cls = 'datagrid-group-cell-rownumber';	
			}
			
			//$(render).find(".datagrid-group-row").remove();
			//$(render1).find(".datagrid-group-row-view1").remove();
			//锁定的列
			var columns = opt.lockColumns;
			var cosp = 0;
			var i = 0,
				len = columns.length;
			for(;i<len;i++) {
				if(columns[i] != null)  cosp++;
			}
			var i = 0,
				len = opt.groupList.length;
			for(;i<len;i++) {
				opt._groupListData[i] = self._undef(opt._groupListData[i],[]);
				var group_row = self.tpl( self.getTpl("group_row") , {'gid':i,w:parseFloat(grw),'id':opt.id,'colspan':opt.columns.length-cosp,"html":opt.groupList[i],"num":opt._groupListData[i].length} );
				var d = $(render).find(".datagrid-body tr[datagrid-group-id='"+i+"']");//.datagrid-body 兼容行锁
				//if( d.size() <= 0 ) {
					//d = $(render).find(".datagrid-header .datagrid-header-outer .datagrid-locktable tr[datagrid-group-id='"+i+"']");	
				//}
				
				var d1 = $(render1).find(".datagrid-body tr[datagrid-group-id='"+i+"']");
				var tpl = "<tr id='"+opt.id+"-group-view1-row-"+i+"' datagrid-group-row-id='"+i+"' class='datagrid-group-row-view1'><td colspan='"+(cosp+1)+"'><div class='"+cls+"'></div></td></tr>";
				var g = $(group_row);
				var _g = $(tpl);
				if( $("#"+opt.id+"-group-row-"+i).size() ) {//重复调用
					$("#"+opt.id+"-group-row-"+i).replaceWith( g );
					$("#"+opt.id+"-group-view1-row-"+i).replaceWith( _g );
					//列锁需要 判断当前Group 是否打开状态
					if( !d.first().is(":hidden") ) {
						_g.find(".datagrid-group-cell-rownumber").addClass("datagrid-group-cell-rownumber-select");//
					}
				} else if(d.size()) {
					g.insertBefore(d.first());
					_g.insertBefore( d1.first() );
					
					//列锁需要
					if( !d.first().is(":hidden") ) {
						_g.find(".datagrid-group-cell-rownumber").addClass("datagrid-group-cell-rownumber-select");//
					}
				} else {
					//如果当前分组没有数据
					for(var j=i-1;j>=0;j--) {
						var _d = $(render).find("tr[datagrid-group-id='"+i+"']");
						var _d1 = $(render1).find("tr[datagrid-group-id='"+i+"']");
						if( _d.size() ) {
							g.insertAfter(_d.last());	
							_g.insertAfter( _d1.first() );
							break;
						}
					}
					if(j<0) {
						
						//var $theader2 = $("#view2-datagrid-body-btable-tbody-header-"+opt.id);
						//var $theader1 = $("#view1-datagrid-body-btable-tbody-header-"+opt.id);
						var $tfooter2 = $("#view2-datagrid-body-btable-tbody-footer-"+opt.id);
						var $tfooter1 = $("#view1-datagrid-body-btable-tbody-footer-"+opt.id);
						$tfooter2.before(g);
						$tfooter1.before(_g);
						//g.appendTo( $(render).find(".datagrid-body .datagrid-btable tbody") );
						//_g.appendTo( $(render1).find(".datagrid-body .datagrid-btable tbody") );
					}
				}
				
				var h = g.height();
				_g.height(h);
				//修正ie 6 7多出1px问题
				if(h != _g.height()) {
					_g.height(h-1);
				}
				opt.groupListCallBack.call(self,g.find(".datagrid-group-cell"),opt.groupList[i],opt._groupListData[i]);
				
			}
			
			self.setGroupEvent();
		},
		//当行的宽度改变时 group row的大小也要随之改变
		setGroupRowSize : function(){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			
			if(!opt.groupBy || !opt.showGroupRow ) return;	
			var render = gid+" .datagrid-view2";
			$("#view1-datagrid-body-btable-tbody-"+opt.id).find(">.datagrid-group-row-view1 >td").attr("colspan",opt.lockColumns.length + 1);
			var w = $("#view2-datagrid-header-inner-htable-tbody-"+opt.id).find(">.datagrid-header-row:first")._outerWidth();
			$("#view2-datagrid-body-btable-tbody-"+opt.id)
				.find(".datagrid-group-row >td")
				.attr("colspan",self.getColumnList().length-opt.lockColumns.length)
				._outerWidth(w);
		},
		setGroupEvent : function(){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
				
			//self.addGroupRow();
			
			var render = gid+" .datagrid-view2";	
			var render1 = gid+" .datagrid-view1";
			//事件绑定
			var i = 0,
				len = opt.groupList.length;
			for(;i<len;i++) {
				
				$(render).find("#"+opt.id+"-group-row-"+i).click(function(){
					var groupId = $(this).attr("datagrid-group-row-id");
					var gcell = $(this).find(".datagrid-group-cell");
					if(gcell.hasClass("datagrid-group-cell-select")) {
						self.hideGroup(groupId);
					} else {
						self.showGroup(groupId);
					}
				});
				$(render1).find("#"+opt.id+"-group-view1-row-"+i).click(function(){
					var groupId = $(this).attr("datagrid-group-row-id");
					var gcell = $(this).find(".datagrid-group-cell-rownumber");
					if(gcell.hasClass("datagrid-group-cell-rownumber-select")) {
						self.hideGroup(groupId);
					} else {
						self.showGroup(groupId);
					}
				});
			}
		}
	}); 
})(jQuery);