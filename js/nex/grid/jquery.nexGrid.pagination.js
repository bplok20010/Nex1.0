/*
jquery.extGrid.pagination.js
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
						  pagination:false,
						  pagerToolBar:false,
						  pageList : [10,20,30,40,50],
						  pagerMsg:'当前显示 {start} 到 {end} 条，共 {total} 条'
						 });
	//事件
	$.nexGrid.addExtEvent({
						   onPagerCreate:$.noop,
						   onPageChange:$.noop,
						   onPageSizeChange:$.noop,
						   onPageItemSelect:$.noop
						 });
	//事件名映射
	$.nexGrid.addEventMaps({
						   onSelectPage:'onPageItemSelect',
						   onChangePageSize:'onPageSizeChange'
						 });
	//模板
	$.nexGrid._Tpl['pager'] = '<div class="datagrid-pager pagination" id="<%=id%>_pager">'
								+' <table cellspacing="0" cellpadding="0" border="0">'
									+'<tbody>'
										+'<tr>'
											+'<td><select class="pagination-page-list">'
											+'<% var s = ""; for(var i=0;i<pageList.length;i++) {%>'
												+'<% if(pageList[i] == pageSize) {%>'
												+'<% s="selected";%>'
												+'<% } else {s="";} %>'
											+'<option value="<%=pageList[i]%>" <%=s%> ><%=pageList[i]%></option>'
											+'<% } %>'
											+'</select></td><td><div class="pagination-btn-separator"></div></td>'
											+'<td><a href="javascript:void(0)" class="pagination-first-btn p-plain <%=(pageNumber <= 1 )?"p-btn-disabled":""%>"><span class="pagination-first  p-btn">&nbsp;</span></a></td>'
											+'<td><a href="javascript:void(0)" class="pagination-prev-btn p-plain <%=(pageNumber <= 1 )?"p-btn-disabled":""%>"><span class="pagination-prev  p-btn">&nbsp;</span></a></td>'
											+'<td><div class="pagination-btn-separator"></div></td>'
											+'<td><span style="padding-left:6px;" class="pager-text">第</span></td>'
											+'<td><input class="pagination-num" type="text" value="<%=pageNumber%>" size="2"></td>'
											+'<td><span style="padding-right:6px;"  class="pager-text">页 共 <%=pages%> 页</span></td>'
											+'<td><div class="pagination-btn-separator"></div></td>'
											+'<td><a href="javascript:void(0)" class="pagination-next-btn p-plain <%=(pageNumber >= pages)?"p-btn-disabled":""%>"><span class="pagination-next p-btn">&nbsp;</span></a></td>'
											+'<td><a href="javascript:void(0)" class="pagination-last-btn p-plain <%=(pageNumber >= pages)?"p-btn-disabled":""%>"><span class="pagination-last p-btn ">&nbsp;</span></a></td>'
											+'<td><div class="pagination-btn-separator"></div></td>'
											+'<td><a href="javascript:void(0)" class="pagination-load-btn p-plain"><span class="pagination-load p-btn">&nbsp;</span></a></td>'
											+'<td id="pagination-toolbar-<%=id%>"></td>'
										+'</tr>'
									+'</tbody>'
								+'</table>'
								+'<div class="pagination-info"><%=pagerMsg%></div>'
								+'<div style="clear:both;"></div>'
							+'</div>';
	$.nexGrid.puglins.push(function(){
		var self = this,
			opt = self.configs;
		//防止重复绑定	
		self.unbind("onBeforeShowContainer.pagination");
		self.unbind("onBeforeShowGrid.pagination");
		self.unbind("onSuccessAddRow.pagination");
		self.unbind("onAfterDeleteRow.pagination");
		
		//事件绑定
		self.bind("onBeforeShowContainer.pagination",function(){
			this.setPager(true);													  
		});
		self.bind("onBeforeShowGrid.pagination",self.setPager);
		self.bind("onSuccessAddRow.pagination",self.refreshPager);
		self.bind("onAfterDeleteRow.pagination",self.refreshPager);
	});
	$.nexGrid.fn.extend({
		refreshPager : function(){
			var self = this;
			var opt = self.configs;	
			self.setPager();
		},
		addPagerEvent : function(){
			var self = this;
			var opt = self.configs;
			var obj = opt.views['pager'];
			//var e = opt.events;
			obj.find("a.pagination-first-btn").click(function(){
				if($(this).hasClass("p-btn-disabled")) return;
				
				var r = self.fireEvent('onPageChange',[1,opt]);
				if(r === false) return false;
				
				opt.pageNumber = 1;
				
				self.refreshData();	
			});
			obj.find("a.pagination-prev-btn").click(function(){
				if($(this).hasClass("p-btn-disabled")) return;
				var pageNumber = opt.pageNumber - 1;
				pageNumber = pageNumber<=0 ? 1 : pageNumber;	
				
				var r = self.fireEvent('onPageChange',[pageNumber,opt]);
				if(r === false) return false;
				
				opt.pageNumber = pageNumber;
				
				self.refreshData();											 
			});
			obj.find("a.pagination-next-btn").click(function(){
				if($(this).hasClass("p-btn-disabled")) return;																				
				var total = opt.total || opt.data.length;
				var pages = Math.ceil( parseInt(total)/parseInt(opt.pageSize) );
				var pageNumber = opt.pageNumber + 1;
				pageNumber = pageNumber>pages ? pages : pageNumber;	
				
				var r = self.fireEvent('onPageChange',[pageNumber,opt]);
				if(r === false) return false;
				
				opt.pageNumber = pageNumber;
				
				self.refreshData();	
			});
			obj.find("a.pagination-last-btn").click(function(){
				if($(this).hasClass("p-btn-disabled")) return;
				var total = opt.total || opt.data.length;
				var pages = Math.ceil( parseInt(total)/parseInt(opt.pageSize) );
				
				var r = self.fireEvent('onPageChange',[pages,opt]);
				if(r === false) return false;
				
				opt.pageNumber = pages;
				
				self.refreshData();	
			});
			obj.find("a.pagination-load-btn").click(function(){
				if($(this).hasClass("p-btn-disabled")) return;
				self.refreshData();											 
			});
			obj.find(".pagination-page-list").change(function(){
				var total = opt.total || opt.data.length;
				var pageSize = $(this).val();
				var pages = Math.ceil( parseInt(total)/parseInt(pageSize) );
				var pageNumber = opt.pageNumber;
				
				if( opt.pageNumber>pages ) {
					pageNumber = pages;		
				}
				
				var r = self.fireEvent('onPageSizeChange',[pageSize]);
				if(r === false) return false;
				
				var r = self.fireEvent('onPageItemSelect',[pageSize]);
				if(r === false) return false;
				
				opt.pageSize = pageSize;
				
				var xr = self.fireEvent('onPageChange',[pageNumber,opt]);
				if(xr === false) return false;
		
				opt.pageNumber = pageNumber;		
		
				self.refreshData();	
			});
			obj.find(".pagination-num").keydown(function(e){
				if(e.keyCode === 13) {
					var pageNumber;
					pageNumber = parseInt( obj.find(".pagination-num").val() );	
					pageNumber = self.isNumber( pageNumber ) ? pageNumber : 1;
					
					pageNumber = pageNumber<=0 ? 1 : pageNumber;	
					
					var total = opt.total || opt.data.length;
					var pages = Math.ceil( parseInt(total)/parseInt(opt.pageSize) );
					pageNumber = pageNumber>pages ? pages : pageNumber;	
					
					var r = self.fireEvent('onPageChange',[pageNumber,opt]);
					if(r === false) return false;
					
					opt.pageNumber = pageNumber;
					
					self.refreshData();	
				}
			});
			return self;
		},
		setPager : function(init) {

			var self = this;
			var opt = self.configs;
			var init = self._undef(init,false);
			if( !opt.pagination ) return self;
			//计算分页
			var data = {};
			data.id = opt.id;
			data.total = opt.total || opt.data.length;
			data.pageSize = opt.pageSize;
			data.pageNumber = opt.pageNumber;
			data.pageList = opt.pageList;
			data.pages = Math.ceil( parseInt(data.total)/parseInt(data.pageSize) );
			//检查pageNumber的合法性
			opt.pageNumber = opt.pageNumber > data.pages ? data.pages : opt.pageNumber;
			opt.pageNumber = opt.pageNumber<=0 ? 1 : opt.pageNumber;
			data.pageNumber = opt.pageNumber;
			
			data.start = (data.pageNumber*data.pageSize - data.pageSize + 1)<0 ? 0 : (data.pageNumber*data.pageSize - data.pageSize + 1);
			data.end = data.pageNumber*data.pageSize;
			
			data.pagerMsg = opt.pagerMsg.replace("{start}",data.start).replace("{end}",data.end).replace("{total}",data.total);

			var _pager = $("#"+opt.id+"_pager");

			var tpl = self.tpl("pager",data);
			
			if(!_pager.size()) {
				opt.views['pager'] = $(tpl);
			} else {
				opt.views['pager'] = $(tpl);
				_pager.after( opt.views['pager'] );
				_pager.remove();
			}
			
			//是否初始化
			if(init === true) {
				return self;	
			}

			self.addPagerEvent();
			
			if( $.isArray( opt.pagerToolBar ) && opt.pagerToolBar.length ) {
				$("#pagination-toolbar-"+opt.id).append( self.getTools( opt.pagerToolBar ) );
			}

			self.fireEvent("onPagerCreate",[opt.views['pager']]);
	
			self.methodCall('setPager');
			
			return self;	
		}					 
	}); 
})(jQuery);