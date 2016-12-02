/*
jquery.extGrid.edit.js
http://www.extgrid.com
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱

新增 limitWidth属性
type 支持函数 注意应该返回editorProvider 而且需要定义val,checkVal,_destroy方法

所有编辑扩展事件：
	onBeforeCreateEditor 创建编辑单元格之前
	onCreateEditor  创建编辑单元格后
	onInsertEditorWrap 创建编辑单元格容器后
	onBeforeRemoveEditCell 在移除编辑单元格之前
	onRemoveEditCell	在移除编辑单元格后
	onBeforeEditRow	触发行编辑时
	onEditRow	触发行编辑后
	onBeforeSaveEditRow	在保存编辑状态行之前
	onRowEdit,onSaveEditRow 在保存编辑状态行之后
	onBeforeUnEditRow	在取消编辑之前
	onBeforeSaveEditCell 保存单元格之前
	onSaveEditCell 保存单元格后触发 该事件和onCellEdit基本一样只是少一个rowData参数,onCellEdit属於grid,onSaveEditCell只属於可编辑扩展事件
	onBeforeCheckEditCell 
	
修正 行锁列锁时出现的位置错乱问题	
*/

;(function($){
	"use strict";
	//参数
	$.nexGrid.addExtConf({
						  //...
						 });
	//事件
	$.nexGrid.addExtEvent({
						    onBeforeCreateEditor	: $.noop,
							onCreateEditor			: $.noop,
							onInsertEditorWrap		: $.noop,
							onResizeEditor			: $.noop,
							onBeforeRemoveEditCell	: $.noop,
							onRemoveEditCell		: $.noop,
							onShowEditCell			: $.noop,
							onHideEditCell			: $.noop,
							onBeforeCheckEditCell	: $.noop,
							onBeforeSaveEditCell	: $.noop,
							onSaveEditCell			: $.noop,
							onBeforeEditRow			: $.noop,
							onEditRow				: $.noop,
							onBeforeSaveEditRow		: $.noop,
							onSaveEditRow			: $.noop,
							onBeforeUnEditRow		: $.noop,
							onUnEditRow				: $.noop
						 });
	//事件名映射
	$.nexGrid.addEventMaps({
						   onCheckEditCell : 'onBeforeCheckEditCell',
						   onRowEdit       : 'onSaveEditRow'
						 });
	$.nexGrid.puglins.push(function(){
		var self = this;
		//刷新grid时,取消当前所有的编辑状态
		self.bind("onBeforeShowGrid",function(){
			self.unEditCell();									  
		});
		//列大小改变时，更新编辑列的大小
		self.bind("onViewSizeChange",function(){
			setTimeout(function(){
				self.resizeEditor();								
			},0);				  
		});
		
		self.bind("onResizeEditor",function(rid,field,editor,edit){
			if( edit.type == 'select' ) {
				//editor.editorProvider.hideSelect();
			}			  
		});
		
		self.bind("onColumnMove",function(){
			setTimeout(function(){
				self.resizeEditor();								
			},0);					  
		});
		
		self.bind("onShowColumn",function(field){
			setTimeout(function(){
				self.showEditField(field);		
				//self.resizeEditor();								
			},0);					  
		});
		self.bind("onHideColumn",function(field){
			setTimeout(function(){
				self.hideEditField(field);	
				//self.resizeEditor();								
			},0);					  
		});
		self.bind("onLazyRowHide",function(rid){
			//注意 此时 当前行 已经移除							   
			setTimeout(function(){
				self.hideEditRow(rid);							
			},0);					  
		});
		self.bind("onLazyRowShow",function(rid){
			setTimeout(function(){
				self.showEditRow(rid);	
				//self.resizeEditor();	//性能开销
			},0);					  
		});
	});
	var edits = {
		text : function(editor,value){
			editor.xtype = 'form';		
			//editor.type = 'text';			  
			var e = Nex.Create(editor);
			e.val(value);	 
			return e;
		},
		textarea : function(editor,value){
			editor.xtype = 'form';		
			//editor.type = 'text';			  
			var e = Nex.Create(editor);
			e.val(value);	 
			return e;
		},
		date : function(editor,value){
			editor.xtype = 'form';		
			//editor.type = 'text';			  
			var e = Nex.Create(editor);
			e.val(value);	 
			return e;
		},
		//on off
		checkbox : function(editor,value){
			editor.on = editor.on === undefined ? '' : editor.on;
			editor.off = editor.off === undefined ? '' : editor.off;
			editor.items = [ {"value":editor.on} ];
			editor.xtype = 'form';		
			//editor.type = 'text';		  
			var e = Nex.Create(editor);
			var _val = e.val;
			e.val = function(){
				var self = e;
				var value = _val.apply(self,arguments);
				if( !arguments.length ) {
					if( value == '' ) {
						return 	editor.off;
					} else {
						return 	editor.on;	
					}
				} else {
					return value;	
				}
			}
			e.val( value );
			return e;
		},
		radio : function(editor,value){
			editor.xtype = 'form';		
			//editor.type = 'text';			  
			var e = Nex.Create(editor);
			e.val(value);	 
			return e;
		},
		spinner : function(editor,value){
			editor.xtype = 'form';		
			//editor.type = 'text';			  
			var e = Nex.Create(editor);
			e.val(value);	 
			return e;
		},
		number : function(editor,value){
			editor.xtype = 'form';		
			//editor.type = 'text';			  
			var e = Nex.Create(editor);
			e.val(value);	 
			return e;
		},
		select : function(editor,value){
			editor.xtype = 'form';		
			//editor.type = 'text';			  
			var e = Nex.Create(editor);
			e.val(value);	
			return e;
		},
		search : function(editor,value){
			editor.xtype = 'form';		
			//editor.type = 'text';			  
			var e = Nex.Create(editor);
			e.val(value);	
			return e;
		},
		"default" : function(editor,value){
			editor.xtype = editor.xtype || 'form';
			console.log( editor );			  
			var e = Nex.Create(editor);
			e.val(value);	
			return e;	
		}
	};
	$.nexGrid.fn.extend({
		editors : [],
		//基于insertEditor扩展
		createEditor : function(rid,field){
			var self = this,
				opt = self.configs;
			
			var column = self.getColumnData(field);
			
			var edit = column.editor;
			
			var rs = self.fireEvent('onBeforeCreateEditor',[rid,field,edit]);
			if( rs === false ) return false;
			
			if( !edit || $.isEmptyObject( edit ) ) {
				return false;	
			}
			
			var type = edit.type || 'default';
			
			if( !$.isFunction(type) ) {
				var undef = type in edits ? false : true;
				if( undef ) {
					return false;	
				}
			}
			
			var editable = self.insertEditor( rid,field );
			
			if( !editable ) {
				return false;	
			}
			
			var value = self.getFieldValue(rid,field);
			
			var _colid = column._colid;
			
			var edit_cell = opt.id + "_"+rid+"_"+_colid+"_edit";
			var edit_cell_id = edit_cell+"_cell";

			var cellId = opt.id+"_"+_colid+"_row_"+rid+"_cell";
			var width = edit.limitWidth ? edit.limitWidth : $("#"+cellId).width();

			edit.name = opt.id+"_"+_colid+"_"+rid;
			//edit.width = Math.floor( Math.max( parseFloat(width),parseFloat(w) ) );
			edit.width = width;
			edit.renderTo = "#"+edit_cell_id;
			edit.group = opt.id;
			if( !$.isFunction(type) ) {
				var editorProvider = edits[type].call(self,$.extend({},edit),value);	
			} else {
				var editorProvider = type.call(self,edit,value);
				editorProvider = $.isPlainObject(editorProvider) ? editorProvider : {};
				editorProvider['val'] = !!editorProvider['val'] ? editorProvider['val'] : $.noop;
				editorProvider['checkVal'] = !!editorProvider['checkVal'] ? editorProvider['checkVal'] : $.noop;
				editorProvider['_destroy'] = !!editorProvider['_destroy'] ? editorProvider['_destroy'] : $.noop;
				editorProvider['fireEvent'] = !!editorProvider['fireEvent'] ? editorProvider['fireEvent'] : $.noop;
				editorProvider['C'] = !!editorProvider['C'] ? editorProvider['C'] : $.noop;
			}
			//修改对列
			var list = self.editors;
			for(var x=0;x<list.length;x++) {
				if( list[x].id == edit_cell ) {
					list[x].editorProvider = editorProvider;
					break;
				}
			}
			
			self.fireEvent('onCreateEditor',[rid,field,editorProvider,edit]);
			
			return list[x];
		},
		_getEditorCellPos : function(rid,field){
			var self = this,
				opt = self.configs;
			var isLockRow,isLockColumn,isHidden,render;
			isLockRow = self.inArray(rid,opt.lockRows) == -1 ? false : true;
			isLockColumn = self.inArray(field,opt.lockColumns) == -1 ? false : true;
			isHidden = self.inArray(field,opt.hideColumns) == -1 ? false : true;
			if( isHidden ) {
				return false;	
			}
			
			var _top = 0;
			var _left = 0;
			
			if( isLockRow && isLockColumn ) {
				render = "datagrid-view1-header-outer-wraper-"+opt.id;
			} else if( isLockRow ) {
				render = "datagrid-view2-header-outer-wraper-"+opt.id;
			} else if( isLockColumn ) {
				render = "view1-datagrid-body-"+opt.id;	
			} else {
				render = "view2-datagrid-body-"+opt.id;	
				_left = opt.sLeft;
				_top = opt.sTop;
			}
			var _colid = self.getColumnData(field,'_colid');
			render = $("#"+render);
			var tid = opt.id+"_"+_colid+"_row_"+rid+"_td";
			var tdOffset,bodyOffset,pos;
			var _tid = $("#"+tid);
			if( !_tid.size() ) return false;
			tdOffset = _tid.offset(); 
			bodyOffset = render.offset();
			pos = {
				render : render,
				left : 	tdOffset.left - bodyOffset.left + _left,
				top : tdOffset.top - bodyOffset.top + _top
			};
			return pos;
		},
		insertEditor : function(rid,field){//创建一个容器定位到指定单元格处
			var self = this,
				opt = self.configs;
			var column = self.getColumnData(field);
			if( column == null ) return false;
			if( column.disabled ) {
				return false;	
			}
			
			var pos = self._getEditorCellPos(rid,field);
			if( !pos ) return false;
			
			var render = pos.render;
			var _colid = column._colid;//self.getColumnData(field,'_colid');
			
			var tid = opt.id+"_"+_colid+"_row_"+rid+"_td";
			var td = $("#"+tid);
			var cellId = opt.id+"_"+_colid+"_row_"+rid+"_cell";
			var cell = $("#"+cellId);
			
			
			var edit_cell = opt.id + "_"+rid+"_"+_colid+"_edit";
			
			if( $("#"+edit_cell).length ) {
				return	$("#"+edit_cell);
			}
			
			var edit_cell_id = edit_cell+"_cell";
			var editor = $("<table cellpadding=0 cellspacing=0 id='"+edit_cell+"'><tr><td id='"+edit_cell_id+"' valign=\"middle\" align=\"center\" ></td></tr></table>");
			editor.click(function(e){
				//e.preventDefault();
				e.stopPropagation();
			});
			
			var edit = column.editor;
			var tw = edit.width ? parseFloat(edit.width) : 0;
			var th = edit.height ? parseFloat(edit.height) : 0;
			
			editor.addClass('edit-cell edit-cell-'+_colid);
			editor.css({
				//width : Math.max(tw,td.outerWidth()),
				width : td.outerWidth(),
				height : Math.max(th,td.outerHeight()),
				left : pos.left,
				position : 'absolute',
				top : pos.top
			});
			
			editor.appendTo(render);//显示editor
			//加入eidtor队列
			var q = {
				id : edit_cell,
				rid : rid,
				field : field,
				_colid : _colid,
				column : column,
				isShow : true,
				viewValue : cell.html(),//当前grid显示内容,不是实际的内容
				editor : editor
			}
			self.editors.push(q);
			self.fireEvent('onInsertEditorWrap',[rid,field,editor,edit_cell,edit_cell_id]);
			return editor;
		},
		/*
		*重新设置编辑单元格大小和位置
		*/
		resizeEditor : function(rid,field){
			var self = this,
				opt = self.configs;	
			var list = self.editors;
			var field = typeof field == 'undefined' ? false : field;
			
			if( !arguments.length ) {
				for( var i=0;i<list.length;i++ ) {
					var editor = list[i];
					var pos = self._getEditorCellPos(editor.rid,editor.field);
					if( !pos ) continue;
					pos.render.append( $("#"+editor.id) );
					var tid = opt.id+"_"+editor._colid+"_row_"+editor.rid+"_td";
					var td = $("#"+tid);
					var ctd = $("#"+editor.id);
					ctd._outerWidth( td.outerWidth() );
					ctd.css({
						left : pos.left,
						top : pos.top
					});
					var edit = editor.column.editor;
					var cellId = opt.id+"_"+editor._colid+"_row_"+editor.rid+"_cell";
					var width = edit.limitWidth ? edit.limitWidth : $("#"+cellId).width();
					editor.editorProvider.C('width',width);
					editor.editorProvider.setSize();//('onSizeChange',[]);
					self.fireEvent("onResizeEditor",[rid,field,editor,edit]);
				}
			} else if( arguments.length == 2 ) {
				var editor = self.getEditor( rid,field );
				if( !editor )  return false;
				var pos = self._getEditorCellPos(editor.rid,editor.field);
				
				if( !pos ) return false;
				pos.render.append( $("#"+editor.id) );
				var tid = opt.id+"_"+editor._colid+"_row_"+editor.rid+"_td";
				var td = $("#"+tid);
				var ctd = $("#"+editor.id);
				ctd._outerWidth( td.outerWidth() );
				ctd.css({
					left : pos.left,
					top : pos.top
				});
				var edit = editor.column.editor;
				var cellId = opt.id+"_"+editor._colid+"_row_"+editor.rid+"_cell";
				var width = edit.limitWidth ? edit.limitWidth : $("#"+cellId).width();
				editor.editorProvider.C('width',width);
				editor.editorProvider.setSize();//('onSizeChange',[]);	
				self.fireEvent("onResizeEditor",[rid,field,editor,edit]);
			}
			return true;
		},
		removeEditor : function(rid,field,_reset){//_reset: true | false,true:移除后设置原来的内容,false:移除编辑后不设置原来的内容
			var self = this,
				opt = self.configs;
			var _reset = _reset || false;
			var _colid = self.getColumnData(field,'_colid');//column._colid;//
			var edit_cell = opt.id + "_"+rid+"_"+_colid+"_edit";
			var edit_cell_id = edit_cell+"_cell";
			
			var viewValue = false;
			var isEditable = false;
			var sr = self.fireEvent("onBeforeRemoveEditCell",[rid,field,self.editors,edit_cell,edit_cell_id]);
			if( sr === false ) return false;
			//出列
			var list = self.editors;
			for(var x=0;x<list.length;x++) {
				if( list[x].id == edit_cell ) {
					list[x].editorProvider._destroy();
					viewValue = list[x].viewValue;
					list.splice(x,1);
					isEditable = true;//当前单元格是否处于编辑状态
					break;
				}
			}
			
			$("#"+edit_cell).remove();
			
			if( _reset && isEditable && (viewValue !== false) ) {
				var cellId = opt.id+"_"+_colid+"_row_"+rid+"_cell";
				var cell = $("#"+cellId);	
				if( cell.size() ) {
					cell.html( viewValue );	
				}
			}
			self.fireEvent("onRemoveEditCell",[rid,field,cell,viewValue]);
			return self;
		},
		getEditor :　function( rid,field ){
			var self = this,
				opt = self.configs;	
			var list = self.editors;
			var editor = false;
			for(var x=0;x<list.length;x++) {
				if( list[x].rid == rid && list[x].field == field ) {
					editor = list[x];
					break;
				}
			}
			return editor;			
		},
		getCellEditor : function( rid,field ){
			var self = this,
				opt = self.configs;	
			var list = self.editors;
			var editor = self.getEditor( rid,field );
			if( editor ) {
				return 	editor.editorProvider;
			}
			return editor;		
		},
		focus : function(rid,field){
			var self = this,
				opt = self.configs;		
			var editor = self.getCellEditor( rid,field );
			editor.getInput().focus();
			return true;
		},
		showEditCell : function(rid,field){
			var self = this,
				opt = self.configs;	
			var editor = self.getEditor( rid,field );
			if( !editor ) return false;
			if( editor.isShow ) return false;	
			$("#"+editor.id).show();
			editor.isShow = true;
			
			var _colid = self.getColumnData(field,'_colid');//column._colid;//
			
			var cellId = opt.id+"_"+_colid+"_row_"+rid+"_cell";
			var cell = $("#"+cellId);	
			if( cell.size() ) {
				editor.viewValue = cell.html();	
				cell.html('');	
			}
			self.fireEvent("onShowEditCell",[rid,field,editor,editor.editorProvider]);
		},
		showEditRow : function(rid){
			var self = this,
				opt = self.configs;	
			var list = self.editors;
			for(var x=0;x<list.length;x++) {
				if( list[x].rid == rid ) {
					self.showEditCell( rid,list[x]['field'] );
				}
			}
			
		},
		hideEditCell : function(rid,field){
			var self = this,
				opt = self.configs;	
			var editor = self.getEditor( rid,field );
			if( !editor ) return false;	
			if( !editor.isShow ) return false;	
			$("#"+editor.id).hide();
			editor.isShow = false;
			var viewValue = editor.viewValue;
			
			var _colid = self.getColumnData(field,'_colid');//column._colid;//
			
			var cellId = opt.id+"_"+_colid+"_row_"+rid+"_cell";
			var cell = $("#"+cellId);	
			if( cell.size() ) {
				cell.html( viewValue );	
			}
			self.fireEvent("onHideEditCell",[rid,field,editor,editor.editorProvider]);
			return true;
		},
		hideEditRow : function(rid){
			var self = this,
				opt = self.configs;	
			var list = self.editors;
			for(var x=0;x<list.length;x++) {
				if( list[x].rid == rid ) {
					self.hideEditCell( rid,list[x]['field'] );
				}
			}
		},
		hideEditField : function(field){
			var self = this,
				opt = self.configs;	
			var list = self.editors;
			for(var x=0;x<list.length;x++) {
				if( list[x].field == field ) {
					self.hideEditCell( list[x].rid,list[x]['field'] );
				}
			}
		},
		showEditField : function(field){
			var self = this,
				opt = self.configs;	
			var list = self.editors;
			for(var x=0;x<list.length;x++) {
				if( list[x].field == field ) {
					self.showEditCell( list[x].rid,list[x]['field'] );
				}
			}
		},
		getEditCellValue : function(rid,field){
			var self = this,
				opt = self.configs;	
			var editor = self.getCellEditor( rid,field );
			var value = "";
			if( editor ) {
				value = editor.val();
			}
			return value;	
		},
		setEditCellValue : function(rid,field,value){
			var self = this,
				opt = self.configs;	
			var editor = self.getCellEditor( rid,field );
			if( editor ) {
				value = editor.val( value );
			}
			return true;	
		},
		//验证当前编辑单元格输入内容是否正确
		checkEditCell : function(rid,field){
			var self = this,
				opt = self.configs;	
			var list = self.editors;
			var isValid = true;
			
			var editorProvider = self.getCellEditor(rid,field);
			
			if( !editorProvider ) {
				return true;	
			}
			
			var sr = self.fireEvent("onBeforeCheckEditCell",[rid,field,editorProvider]);
			if( sr === false ) return false;
			
			var r = editorProvider.checkVal();
			if( r === false ) {
				isValid = false;	
			} 
			return isValid;
		},
		//编辑单元格
		editCell : function(rid,field){
			var self = this,
				opt = self.configs;
				
			var _colid = self.getColumnData(field,'_colid');//column._colid;//
				
			var cellId = opt.id+"_"+_colid+"_row_"+rid+"_cell";
			var cell = $("#"+cellId);
			if( !cell.size() ) {
				return false	
			}
			
			if( self.getEditor( rid,field ) ){
				return false;	
			}
			
			var editable = self.createEditor(rid,field);
			
			if( !editable ) return false;
			
			cell.empty();//清空单元格内容
			return true;
		},
		//保存并验证指定正处于编辑状态单元格,不带参数则保存所有目前正处于编辑状态的单元格
		//返回成功保存的的单元格数组 eg [ {rid:1,field:'name'} ]
		saveEditCell :　function(rid,field){
			var self = this,
				opt = self.configs;
			var list = self.editors;
			var len = list.length;
			var valid = valid || false;
			var successSave = [];
			if( arguments.length == 2 ) {
				for(var x=0;x<len;x++){
					var editor = list[x];
					var sr = self.fireEvent("onBeforeSaveEditCell",[rid,field,editor,editor.editorProvider]);
					if( sr === false ) return successSave;
					if( editor.rid == rid && editor.field == field ) { 
					
						var isValid = editor.editorProvider.checkVal();
						
						var value = editor.editorProvider.val();
						
						self.removeEditor( editor.rid,editor.field,true );
						
						if( isValid === false ) {
							break;
						}
						
						var isSave = self.setFieldValue( editor.rid,editor.field,value );
						self.fireEvent("onSaveEditCell",[editor.rid,editor.field,value]);
						if( isSave !== false ) {
							successSave.push({
								rid : editor.rid,
								field : editor.field
							});	
						}
						break;
					}
				}
			} else {
				for(var x=0;x<len;){
					var editor = list[x];
					
					var sr = self.fireEvent("onBeforeSaveEditCell",[editor.rid,editor.field,editor,editor.editorProvider]);
					if( sr === false ) return successSave;
					
					var isValid = editor.editorProvider.checkVal();
					
					
					var value = editor.editorProvider.val();
					
					self.removeEditor( editor.rid,editor.field,true );
					len = list.length;//因为removeEditor会对List进行删减 所以len是个可变的
					
					if( isValid === false ) {
						continue;
					}
					var isSave = self.setFieldValue( editor.rid,editor.field,value );
					self.fireEvent("onSaveEditCell",[editor.rid,editor.field,value]);
					if( isSave !== false ) {
						successSave.push({
							rid : editor.rid,
							field : editor.field
						});	
					}
				}
			}
			return successSave;
		},
		//不做任何保存,取消编辑指定单元格,不带参数则取消编辑所有目前正处于编辑状态的单元格
		unEditCell : function(rid,field){
			var self = this,
				opt = self.configs;
			if( arguments.length == 2 ) {
				self.removeEditor(rid,field,true);	
			} else {
				var list = self.editors;
				var len = list.length;
				for(var x=0;x<len;){
					var editor = list[x];
					self.removeEditor( editor.rid,editor.field,true );
					len = list.length;//因为removeEditor会对List进行删减 所以len是个可变的
				}
			}
		},
		editRow : function(rid){

			var self = this,
				opt = self.configs;
			
			var r = self.fireEvent("onBeforeEditRow",[rid]);
			if( r === false ) return false;
			
			var columns = self.getColumns();
			$.each( columns,function(i,column){
				self.editCell(rid,column.field);					 
			} );
			self.fireEvent("onEditRow",[rid]);

		},
		checkEditRow : function(rid){
			var self = this,
				opt = self.configs;
			var list = self.editors;
			var successSave = [];
			var isValid = true;
			for(var x=0;x<list.length;x++) {
				if( list[x].rid != rid ) {
					continue;	
				}
				var r = self.checkEditCell( rid,list[x].field );
				if( r === false ) {
					isValid = r;
				}
			}
			return isValid;
		},
		saveEditRow : function(rid){
			var self = this,
				opt = self.configs;
			var list = self.editors;
			var successSave = [];
			var rowList = [];
			var r = self.fireEvent("onBeforeSaveEditRow",[rid]);
			if( r === false ) return false;
			for(var x=0;x<list.length;x++) {
				if( list[x].rid != rid ) {
					continue;	
				}
				rowList.push({
					rid : rid,
					field : list[x].field,
					_colid : list[x]._colid
				});
			}
			for( var i=0;i<rowList.length;i++ ) {
				var isSave = self.saveEditCell( rid,rowList[i].field );
				if( isSave.length ) {
					successSave.push( rowList[i].field );	
				}	
			}
			var rowData = self.getRowData(rid);
			//self.fireEvent("onRowEdit",[rid,rowData,successSave]);//兼容
			self.fireEvent("onSaveEditRow",[rid,rowData,successSave]);
		},
		unEditRow : function(rid){
			var self = this,
				opt = self.configs;
			var columns = self.getColumns();
			var rowData = self.getRowData(rid);
			var r = self.fireEvent("onBeforeUnEditRow",[rid,rowData]);
			if( r === false ) return false;
			$.each( columns,function(i,column){
				self.unEditCell(rid,column.field);					 
			} );	
			self.fireEvent("onUnEditRow",[rid,rowData]);
		}
	});
})(jQuery);