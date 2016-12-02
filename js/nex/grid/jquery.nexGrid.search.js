/*
jquery.extGrid.search.js
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
						 //开启后支持正则
						  _regexp			: true
						 });
	//事件
	$.nexGrid.addExtEvent({
						   onSearch:$.noop
						 });
	$.nexGrid.fn.extend({
		searchData : function(text,field,async,data){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var text = self._undef(text,null);	
			if(text == null) return self;
			
			//清空上一次的搜索缓存
			self.clearSearch(false);
			
			//字段进行检测 是否存在
			var field = self._undef(field,false);	
			//var index = false;
			var index = field;
			
			//var fields = self.getColumns();
			var fields = opt.columns;
			if(field !== false) {
				var _field = false;
				var len = fields.length;
				for(var i=0;i<len;i++) {
					if( fields[i]['field'] == field ) {
						_field = field;
						index = fields[i]['index'];
						break;	
					}
				}
				field = _field;
			}
			
			
			//BUG 修正 2013.9.10
			//var async = self._undef(async,true);
			if( typeof async == 'undefined' ) {
				var async = self.getAsync();
			}
			
			
			opt.cacheData['searchAsync'] = async;
			//BUG 修正 2013.9.10
			var data = self._undef(data,opt.cacheData['searchData'] || opt.cacheData['source'] || opt.data);	
			opt.cacheData['searchData'] = opt.cacheData['searchData'] || data;//存储元数据
			//本地搜索
			if( async ) {
				
				if(opt.cacheData['searched'] != true) {
					opt.cacheData['_url'] = opt.url;
					opt.cacheData['_pageNumber'] = opt.pageNumber;
					opt.cacheData['_data'] = opt.data;
				
					opt.url = "";
					opt.pageNumber = 1;
				 }
				var _data = [];
				var dlen = data.length;
				for(var i=0;i<dlen;i++) {
					if(field !== false)	{
						if( !opt._regexp ) {
							if(data[i][index].toString().indexOf(text) != -1 ) {
								_data.push(data[i]);	
							}
						} else {
							var re = new RegExp( text );
							if( !re.test( data[i][index].toString() ) ) continue;
							_data.push(data[i]);
						}
					} else {//全局搜索
						var slen = fields.length;
						for(var s=0;s<slen;s++) {
							
							index =  fields[s]['index'];
							if( !opt._regexp ) {
								if(data[i][ fields[s]['index'] ].toString().indexOf(text) != -1 ) {
									_data.push(data[i]);
									break;
								}
							} else {
								var re = new RegExp( text );
								if( !re.test( data[i][ fields[s]['index'] ].toString() ) ) continue;
								_data.push(data[i]);
								break;
							}
						}	
					}
				}
				self.setGridData(_data,true);
				self.showGrid(function(){
						//opt.events.onSearch.call(self,_data);
						self.fireEvent('onSearch',[_data]);
						self.setGridBody();
				},$.noop,true);
			} else {//服务器搜索
				if(opt.cacheData['searched'] != true) {
					opt.cacheData['_pageNumber'] = opt.pageNumber;
					opt.pageNumber = 1;
				}
				opt.queryParams.searchText = text;	
				//opt.queryParams.searchField = field;
				opt.queryParams.searchField = index;
				
				self.showGrid(function(){
					//opt.events.onSearch.call(self,opt.data);
					self.fireEvent('onSearch',[opt.data]);
					self.setGridBody();						  
				});
			}
			
			opt.cacheData['searched'] = true;
			return self;
		},
		//_refresh true 则 清除查询结果并刷新表格; false 不刷新表格
		clearSearch : function( _refresh ){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			
			if(opt.cacheData['searched'] !== true) {
				return self;	
			}
			var _refresh = self._undef( _refresh,true );
			
			opt.cacheData['searched'] = false;
			
			self.setGridData(opt.cacheData['searchData']);
			
			opt.url = opt.cacheData['_url'] || opt.url;
			opt.pageNumber = opt.cacheData['_pageNumber'] || opt.pageNumber;
			opt.data = opt.cacheData['_data'] || opt.data;
			
			try{
			delete opt.cacheData['_url'];
			} catch(e){}
			try{
			delete opt.cacheData['_pageNumber'];
			} catch(e){}
			try{
			delete opt.cacheData['searchData'];
			} catch(e){}
			try{
			delete opt.cacheData['_data'];
			} catch(e){}
			
			try{
			delete opt.queryParams['searchText'];
			} catch(e){}
			try{
			delete opt.queryParams['searchField'];
			} catch(e){}
			
			if( !opt.cacheData['searchAsync'] ){//if(opt.url != "") 
				delete opt.cacheData['source'];
			}
			
			if( _refresh ) {
				if(opt.cacheData['searchAsync']) {
					self.refreshDataCache();
				} else {
					self.refreshData();	
				}
			}
			delete opt.cacheData['searchAsync'];
			
			return self;
		}		 
	}); 
})(jQuery);