/*
jquery.extGrid.mergecell.js
http://www.extgrid.com
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱
//大数据不要使用单元格合并

*/

;(function($){
	"use strict";
	//参数
	$.nexGrid.addExtConf({
						  //...
						 });
	//事件
	$.nexGrid.addExtEvent({
						    onBeforeUnMergeCell : $.noop,
							onUnMergeCell 		: $.noop,
							onBeforeMergeCell	: $.noop,
							onMergeCell   		: $.noop
						 });
	$.nexGrid.puglins.push(function(){
		var self = this,
			opt = self.configs;
		
		self.unbind("onFieldWidthChange.mergecell");
		self.unbind("onForceFitColumn.mergecell");
		self.unbind("onBeforeShowColumn.mergecell");
		self.unbind("onBeforeHideColumn.mergecell");
		self.unbind("onBeforeLockColumn.mergecell");
		self.unbind("onBeforeUnlockColumn.mergecell");
		self.unbind("onBeforeLockRow.mergecell");
		self.unbind("onBeforeUnLockRow.mergecell");
		self.unbind("onBeforeColumnMove.mergecell");
		self.unbind("onBeforeSwitchColumn.mergecell");
		
			
		self.bind("onFieldWidthChange.mergecell",self.setMergeCellSize);
		self.bind("onForceFitColumn.mergecell",self.setMergeCellSize);
		
		self.bind("onBeforeShowColumn.mergecell",self.checkMergeField);
		self.bind("onBeforeHideColumn.mergecell",self.checkMergeField);
		
		self.bind("onBeforeColumnMove.mergecell",self.checkMergeField);
		self.bind("onBeforeSwitchColumn.mergecell",function(f1,f2){
			return self.checkMergeField(f2);														
		});
		
		self.bind("onBeforeLockColumn.mergecell",self.checkMergeField);
		self.bind("onBeforeUnlockColumn.mergecell",self.checkMergeField);
		self.bind("onBeforeLockRow.mergecell",self.checkMergeRow);
		self.bind("onBeforeUnLockRow.mergecell",self.checkMergeRow);
		
		self.bind("onBeforeExpandRow.mergecell",self.checkMergeRow);
	});
	
	$.nexGrid.fn.extend({
		mergeList : [],
		_checkMerge : function( field,v ){
			var self = this;
			var v = self._undef( v,'field' );
			
			var mergeList = this.mergeList;
			for( var i=0;i<mergeList.length;i++ ) {
				var merge = this.mergeList[i];
				if( merge[v] == field ) {
					return false;	
				}
				for( var k=0;k<merge.mCells.length;k++ ) {
					var mCell = merge.mCells[k];
					if( mCell[v] == field ) {
						return false;	
					}
				}
			}
			return true;
		},
		checkMergeField : function(field){
			return this._checkMerge( field );	
		},
		checkMergeRow : function(rid){
			return this._checkMerge( rid,'rid' );	
		},
		setMergeCellSize : function(){
			var self = this,
				opt = self.configs;
			for( var i=0;i<self.mergeList.length;i++ ) {
				var merge = self.mergeList[i];
				var $td = $("#view2-datagrid-header-inner-htable-tbody-"+opt.id+" >.datagrid-header-row");
				var tw = $("td[field='"+merge.field+"']",$td).width();
				var cell = $("#"+opt.id+"_"+merge._colid+"_row_"+merge.rid+"_cell");
				for( var j=0;j<merge.mCells.length;j++ ) {
					if( merge.mCells[j].rid == merge.rid ) {
						tw += $("td[field='"+merge.mCells[j].field+"']",$td).width();
					}
				}
				cell._outerWidth( tw );
			}
		},
		//检查当前单元格是否处于合并状态 @_m : true 返回合并对象,false 返回boolean 默认:false
		isMergeCell : function(rid,field,_m){
			var self = this;
			var opt = self.configs;	
			var _m = self._undef( _m,false );
			for( var m=0;m<self.mergeList.length;m++ ) {
				var _mlist = self.mergeList[m];
				if( _mlist.rid == rid && _mlist.field == field ) {
					return _m ? m : true;	
				}
				for( var y=0;y<_mlist.mCells.length;y++ ) {
					var _mc = _mlist.mCells[y];
					if( _mc.rid == rid && _mc.field == field ) {
						return _m ? m : true;	
					}
				}
			}
			return false;
		},
		unMergeCells : function( rid,field ){
			var self = this;
			var opt = self.configs;	
			var mergeID = self.isMergeCell( rid,field,true );
			var merge = self.mergeList[mergeID];
			if( !merge ) {
				return false;	
			}
			
			var r = self.fireEvent('onBeforeUnMergeCell',[merge]);
			if( r === false ) return r;
			
			var tid = $("#"+opt.id+"_"+merge._colid+"_row_"+merge.rid+"_td");
			var cell = $("#"+opt.id+"_"+merge._colid+"_row_"+merge.rid+"_cell");
			
			tid.attr({
				rowspan : 1,
				colspan : 1
			});
			
			cell.removeAttr('style');
			if( merge.style !== null ) {
				cell.attr("style",merge.style);	
			}
			
			for( var c=0;c<merge.mCells.length;c++ ) {
				var _mcell = merge.mCells[c];
				var mtid = 	$("#"+opt.id+"_"+_mcell._colid+"_row_"+_mcell.rid+"_td");
				$(mtid).show();
			}
			self.mergeList.splice(mergeID,1);
			
			self.fireEvent('onUnMergeCell',[merge]);
			
			return true;
		},
		/*
			@merge: object
				rid,field,rowspan,colspan
			@_col : true(如果合并过程中发现需要合并的单元格被其他合并单元格占用则取消被占用的单元格合并) | false 默认false	
		*/
		mergeCells : function( merge,_col ){
			var self = this;
			var opt = self.configs;
			var merge = self._undef( merge,{} );
			var _col = self._undef( _col,false );
			var _m = {
				rid : false,
				field : false,
				_colid : false,
				mCells : [],
				rowspan : 1,
				colspan : 1
			};
			if( !$.isPlainObject(merge) ) {
				return false;	
			}
			merge = $.extend(_m,merge);
			if( (merge.rid === false) || (merge.field === false) ) {
				return false;	
			}
			if( (merge.rowspan == 1) && (merge.colspan == 1) ) {
				return false;	
			}
			
			var r = self.fireEvent('onBeforeMergeCell',[merge]);
			if( r === false ) return r;
			
			merge._colid = self.getColumnData( merge.field,'_colid' );
			
			var columnList = self.getColumnList();
			var index = self.inArray(merge.field,columnList);
			if( index == -1 ) return false;
			
			if( self.isMergeCell( merge.rid,merge.field ) ){
				if( _col ) {
					self.unMergeCells( rid,field );
				} else {
					return false;		
				}
			}
			
			merge.mCells = [];//被合并的单元格
			for( var i=0;i<merge.rowspan;i++ ) {
				var rid = merge.rid + i;
				//检查行是否存在
				var trid = "#"+opt.id+"-row-"+rid;
				if( !$(trid).size() ) {
					if( opt.lazyLoadRow ) {
						self._loadRow(rid);	
					}	
					if( !$(trid).size() ) {
						continue;	
					}
				}
				
				for( var j=0;j<merge.colspan;j++ ) {
					var _j = index + j;
					if( _j>=columnList.length ) continue;
					var field = columnList[_j];
					//如果合并的单元格有被其他合并单元格占用则返回false
					if( self.isMergeCell( rid,field ) ){
						if( _col ) {
							var _o = self.unMergeCells( rid,field );
							if( _o === false ) return false;
						} else {
							return false;		
						}
					}
					
					if( (rid == merge.rid) && (field==merge.field) ) {
						continue;	
					}
					merge.mCells.push({rid:rid,field:field});		
				}
			}
			
			var cell = $("#"+opt.id+"_"+merge._colid+"_row_"+merge.rid+"_cell")
			var style = cell.attr("style");
			style = style ? style : null;
			merge.style = style;
			
			self.mergeList.push( merge );
			var tid = $("#"+opt.id+"_"+merge._colid+"_row_"+merge.rid+"_td");
			
			
			
			tid.attr({
				rowspan : merge.rowspan,
				colspan : merge.colspan
			});
			
			cell._outerWidth( tid.width() );
			
			for( var c=0;c<merge.mCells.length;c++ ) {
				
				var _mcell = merge.mCells[c];
				
				var mtid = 	$("#"+opt.id+"_"+_mcell._colid+"_row_"+_mcell.rid+"_td");
				$(mtid).hide();
			}
			
			self.fireEvent('onMergeCell',[merge]);
		}
	});
})(jQuery);