/*
jquery.extGrid.js
http://www.extgrid.com
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱
+-----------+
v1.0        |
			|
+-----------+
+-------------------------------------------+
v1.0.1        								|
修正 不同jquery版本出现的返回字符问题			|
+-------------------------------------------+
+--------------------------------------------------------+
v 1.2+       								   			 |
修正核心函数 提升数据展示速度，修正部分函数性能                 |
	1.新增 denyRowEvents : false,//禁止或使用自定义事件      |
	2.新增 onOverCell onOutCell                           |
+--------------------------------------------------------+
+--------------------------------------------------------+
v 1.2.1       								   			 |
1.新增 column中index 数据索引参数                    |
2.修正某些函数重复调用getColumns问题                         |
3.修正IE下刷新空白问题                                      |
4.修正v1.2版本_lSize没清0导致的BUG                          |
+--------------------------------------------------------+
+--------------------------------------------------------+
v 1.2.2      								   			 |
1.修正列锁情况下 Loading 出现的header问题            |
2.修正resize line 边框样式写死                        |
3.修正对数据排序后 出现的大小改变问题               |
+--------------------------------------------------------+
+-----------------------------------------------------------------------------------+
v 1.2.3	 									   			 							|
1.修正大数据下 导致深复制出现的问题												|
2.分页工具栏按钮优化																|
3.提高核心函数模板生成的性能													|
4.新增showHeader 开关 可控制是否显示header 对应的api: showHeader hideHeader		|
5.新增数据为空时 滚动条不出现问题（可选择性开启）								|
6.新增API updateGrid(data);  用户可自己设置显示数据 方便二次开发				|
7.新增参数emptyGridMsg 当grid数据为空是 显示在grid里的数据					|
8.showEmptyGridMsg:true 当设置为true emptyGridMsg则开启,否则关闭					|
	注:开启后 显示内容的宽度和gridHeader一样,也就是说超出宽度时会显示滚动条	|
9.修正showLoading时事件传递问题													|
10.提升分页栏性能																	|
+-----------------------------------------------------------------------------------+
+-----------------------------------------------------------------------------------+
v 1.2.4 									   			 							|
1.修改事件处理函数 																|
2.分页工具栏优化																	|
3.修正单元格事件返回false不阻止事件传递										|
4.新增事件 和修改部分事件名													|
5.新增 $.extGrid.puglins:[]插件队列，系统会调用里面的自定义插件函数			|
6.修正ajax 获取数据后调用不同的数据解析函数 eg jsonFilter						|
7.修正v1.2.3下分页工具栏出现js报错问题											|
8.修正列锁后被锁列事件缺失问题													|
9.新增触发单元格事件时检测当前对象是否单元格													|
10.新增API scrollToField,scrollToRow和配置参数 autoScrollToField/Row  |
+-----------------------------------------------------------------------------------+
+---------------------------------------------------------------------------------------------------------------------------+
v 1.2.5									   			 							
1.修正searchData存在的BUG																
2.修正严格模式下部分函数出现的语法错误													
3.修正rowNumbersWidth的默认参数原本为false改为'0px'										
4.新增rowNumbersExpand的参数 : false|auto|string|function								
5.添加分页输入框数据验证															
6.新增参数url 可接受一个回调函数,grid会传入查询条件（data）和success,error 2个回调函数 
	json_data格式 {total:"255",rows:[{},{},..] [,pageSize:50,pageNumber:1,columns:[{}]]} pageSize,pageNumber,columns是可选
	注 :
		success,error 这2个回调函数，一定有一个需要调用，不然grid会一直处于loading状态
		success 接受 josn_data格式数据 数据格式参考上面.
		error 可接受xmlHttp对象 或 一个字符串
	eg:
	function getGridData(data,success,error){
		data.status = 1;
		$.ajax({
			url : 'list.php',
			data : data,
			success : function( json_data ){
				success(json_data);    
			},
			error : function(xmlHttp){
				error(xmlHttp)
			}
		});
	}
	...extgrid( {url:getGridData} )..
7.一次性实例多个gird时data丢失问题修正(v1.2.3修改后留下的BUG)
8.当grid首次创建在隐藏元素里时,grid高度问题获取不正确问题修正
9.新增metaData方法，可直接调用该方法传递json_data格式的数据
10.修正 scrollToField/Row 出现的误差值
11.新增setFieldWidth 设置列宽 支持百分比
12.把原本直接对元素设置宽度的方法改成用CSS样式控制,方便操作.
注：
1).当定义了行模板时 不要去拖动列交换位置，否则列表的列并不会交换
2).rowTpl 建议不用，用rowCallBack or 单元格回调
13.新增addRow() @return rid,updateRow,deleteRow函数
14.修改默认主键名为'_pk'
15.新增minWidth:20配置参数
+----------------------------------------------------------------------------------------------------------------------------+
*/
/*
+----------------------------------------------------------------------------------------------------------------------------+
v 1.2.6		
1.新增事件onHideExpandRow,onBeforeCellEdit
2.新增maxWidth:null 默认
3.事件可通过参数直接绑定 
	eg:
		{
			title : 'extGrid',
			onClickRow : func,
			...
		}
4.tpl(参数1,参数2) 参数1可以是回调函数：eg：_columnMetaData._expand可是是函数
5.修正多表头在低版本jquery中出现使用field无效问题
6.修正手动调用列锁，隐藏列的时候 再新增行数据时列锁和隐藏列都无效问题
7.取消leftBorder,rightBorder,topBorder,bottomBorder参数边框大小都由CSS控制
8.修正expandRow 宽度设置
9.新增事件 onShowColumn,onHideColumn
10.修正headerTpl使用data-options时部分参数无效问题 
11.新增公用配置$.extGrid.defaults = {}
12.修正initFieldWidth 时 minWidth,maxWidth 无效
13.新增column.reader 映射参数 column._expand 定义后 column.reader会无效
14.新增事件onFieldWidthChange
15.新增API:moveColumn 
16.新增参数:forceFit: true false(默认) 设置 列宽自动调整
17.新增API:forceFitColumn  作用是实现forceFit
18.新增事件 onShowGroup,onHideGroup 
19.新增参数autoHeight 以及API: autoHeight
20.优化forceFitColumn
21.新增API:unAutoHeight ,如果想取消autoHeight 应该调用unAutoHeight()
22.新增API:unForceFitColumn ,如果想取消forceFit 应该调用unForceFitColumn()
23.fireEvent中添加事件锁,防止事件循环
24.新增footer行,对应的控制参数和事件:
	footerTpl : '',
	footerData : [],//footer数据 参数可以是 模版或者 函数
	footerRowStyler 
	footerRowCallBack
	footerRowNumbersExpand : '',
	onOverFooterRow : $.noop,
	onOutFooterRow : $.noop,
	onDblClickFooterRow : $.noop,
	onFooterRowContextMenu : $.noop,
	onClickFooterRowNumber : $.noop,
	onClickFooterCell : $.noop,
	onDblClickFooterCell : $.noop,
	onOverFooterCell : $.noop,
	onOutFooterCell : $.noop,
	onFooterCellContextMenu : $.noop
25.优化事件处理，以及事件依赖
26.新增API:updateFooterData
27.优化部分细节问题
28.新增API:denyEventInvoke 
29.支持大数据加载,参数lazyLoadRow
30.优化scrollToField/Row不合理的触发onScroll 
31.优化获取行数据时考虑当前行是否创建而考虑直接获取data[rid]
32.优化footerRow显示方式，已经修正原先的显示方式而出现滚动问题
33.修正onMoveColumn触发方式
34.重写selectRow部分
35.新增API updateFooterRow,updateHeaderRow, 分别会触发onUpdateFooterRow,onUpdateHeaderRow
36.取消setFieldWidth 触发onScroll事件
37.优化核心函数 事件绑定解绑支持扩展辨别 eg onClickRow.ab
38.取消_autoHeight 事件的同时触发
39.开启大数据支持请不要开启 autoHeight,和groupBy参数
40.新增API width,height
41.新增API resetExpandRowHeight
42.新增API onScrollEnd
43.修正参数名
44.修正_loadRows不删除通过addRrow(_insert) 方式添加的行
45.新增API getRowId
46.修正fireEvent 返回false BUG
47.新增事件绑定API one() 
48.修正ajax获取数据时不检查主键问题
49.新增grid宽高 最小限制参数 minWidth,minHeight
50.onSizeChange 优化，如果大小没有更改会返回false,第三个参数可设为true 来强制更改大小
51.修正setFieldWidth在刷新grid后不重新设置列宽大小问题
52.优化togrid
53.新增事件映射(别名)
54.新增扩展参数,扩展事件
55.修正rowNumbersWidth设为false 还会多出1px宽度问题
56.优化resetViewSize 的调用次数
57.新增事件onBeforeSortColumn
58.优化resetViewSize,onScroll,setGridBody,优化展示速度
59.新增API addFooterItems
60.修正forceFitColumn 传的是对象而不是字符问题
61.新增模板引擎,可选引入artTemplate 也可选择不引入。
62.新增API page()
63.修正大数据开启下 moveColumn时行锁出现的问题
64.优化selectRow 性能
65.selectRows 可设置默认选择的行,如果singleSelect 开启只会选择当前数组中的第一个rid
+----------------------------------------------------------------------------------------------------------------------------+
*/
/*
+----------------------------------------------------------------------------------------------------------------------------+
v 1.2.7
1.修正setFieldValue 和 column.callBack(...这里调用setFieldValue会出问题...) 的循环调用问题，
并且callBack修改为初始创建单元格时才会调用
2.新增API setFieldText 和 setFieldValue 区别在于只会设置单元格的显示文本，而不会设置单元格的实际值,且不触发任何事件
3.autoHeight 开启后如果容器不设置宽度会出现首次渲染时只适应高度不正确
4.判断isEmptyGrid事件位置调整
5.新增API setRowHeight(rid,height)
6.修正IE 下autoHeight overflow hidden 时scrollWidth 获取不正确
7.修正z-index的大小 1 0 1
8.新增cutHeight cutWidth
9.新增onBeforeAjaxCreate事件
10.新增ajaxSend作为扩展
11.修正grid大小改变时抖动问题
12.render优化 可支持函数
13.优化metaData
14.新增参数 ajaxSend 可替换api ajaxSend
15.新增参数 stripeRows 可开启隔行变色
16.css文件新增隔行变色样式
17.添加行事件 onMouseEnter onMouseLeave
18.重新开启 callBack,callBack里一定不要调用setFieldValue
19.getRealField 当列没设置时返回null BUG
20.新增editColumnSetter 扩展函数可自定义编辑列内容
21.#2306 修正columns不设置field是 field为空而导致不能修改列宽的bug
22.多表头功能实现 新增参数multiColumns 可控制
23.优化moveColumn 体验
24.#2740 多表头实现中发现 getTD 里中间行使用的是field作为名称显示 已经修改成title
25.关于多表头多个不同行出现的不对其问题，应该使用onHeaderCreate 后 对header里的table都设置一个相同的高度就OK 待解决
26.当field出现@#￥*（）等字符是 或出现很多问题 比如jquery选择器不能呢个带有( ) 会报错 待解决
+----------------------------------------------------------------------------------------------------------------------------+
*/
;(function($){
	"use strict";
	var dataGrid = Nex.widget('grid');
	//Nex.grid = dataGrid;
	$.extGrid = $.nexGrid = dataGrid;
	
	dataGrid.extend({
		version : '1.2.7', 
		getDefaults : function(opt){
			var _opt = {
				prefix : 'datagrid_',
				autoResize : true,
				title : '',//为空不显示标题
				cls : '',//自定义CSS
				iconCls : '',//datagrid 标题的icon样式
				toolBars : false,// [{'text':'添加',cls:'样式',callBack,disabled:false}]
				_toolItem : {text : '',cls : '',callBack : $.noop,disabled:false},//tool 属性
				ltText : '',//leftTopText
				rowNumbersWidth : false,//左侧数字列表 一般设为24px 
				rowNumbersExpand: false,// false : 索引 ,auto : 当前显示数据的索引 , 字符串时 自定义模版
				rowNumbers2Row : true,//开启当rowNumbers2Row click的时候 选择当前行
				rowTpl : '',//grid 自定义行模板
				showHeader : true,//显示header
				showFooter : false,
				headerTpl : '',//自定义 header 列模板
				containerCss : 'datagrid-container-border',
				clsOverRow : 'datagrid-row-over',
				clsSelectRow : 'datagrid-row-selected',
				stripeRows : false,//开启隔行变色
				clsSingleRow : 'datagrid-row-single',
				clsDoubleRow : 'datagrid-row-double',
				border : true,//开启后会 给grid添加 containerCss 的样式
				lazyLoadRow : false,//开启后 不要使用groupBy
				pageTotal : 0,//pageTotal可用来控制lazyLoadRow显示行数,是一个虚拟值,与total 不同的是 total是用来控制分页工具栏和当前页的实际显示数,某些情况下这2个值应该相等
				lazyMaxRow : 0,
				lazyRows : [],
				lazyTopRows : 5,
				lazyBottomRows : 5,
				showLazyLoading : true,
				_trHeight : -1,
				_lazyEdge : 80,//距离边缘多少时 开始加载
				_csTop : 0,
				_loadRowing : false,
				_tq : 0,
				_initLazy : true,
				padding : 8,
				multiColumns : true,
				autoHeight : false,//如果为 true height参数无效，并且grid高度会自动调整高度
				minAutoHeight : 50,//开启autoHeight时 视图部分最小高度
				maxAutoHeight : 0,//开启autoHeight时 视图部分最大高度 0表示不限制
				width : 0,
				height : 0,
				minWidth : 0,
				minHeight : 0,
				maxWidth : 0,
				maxHeight : 0,
				checkBox : false,//是否显示checkbox列 开启后 ck 将是系统列
				checkBoxWidth : '28px',
				checkBoxForceFit : false,
				checkBoxTitle : '<input type="checkbox">',
				checkBoxFit : false,
				editColumn : false,//是否显示edit列 [{'text':'添加',cls:'样式',callBack,disabled:false}]  开启后 ed 将是系统列
				editColumnTitle : '操作',
				editColumnFit : true,
				editColumnForceFit : false,
				editCellW : 63,//每个操作按钮的大小
				editColumnSetter : null,//自定义 列内容内置，默认使用getTools
				columns : [],//
				_columnsHash : {},//field=>column 这里包含所有的 会通过getColumns填充
				moveColumnTm : 500,//按下多少秒后开始移动列
				moveColumns : true,
				forceFit:false,//自动设置列宽
				_columnMetaData : {
					field : '',
					index : '',//数据索引，默认==field
					title : '',
					width : '120px',//默认的列宽,
					minWidth : 20,//默认最小宽度
					maxWidth : null,
					align : 'left',
					_expand : false,//自定义列内容
					callBack : $.noop,
					hcls : '',//header cell自定义css
					bcls : '',//body cell自定义css
					fcls : '',//footer cell自定义css
					sortable : false, 
					textLimit : false,//当处理大数据的时候 性能消耗比较厉害， 不建议开启了
					fitColumn : true,//改变列大小
					casePerChange : true,//如果当前列设置的是百分比大小，手动修改列大小后 设置为true:grid刷新会失去百分比作用,false:grid刷新时不会失去百分比作用，而是失去手动修改后的宽度
					reader : {},//映射
					forceFit : true,//接受forceFit开启时自动设置列大小 checkbox edit 列会设置为false
					disabled : false//当前列不可用
				},
				readerDef : '_default_',
				textLimit : false,//文字溢出总开关 已经改用CSS控制，请不要设置
				textLimitDef : '...',
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
				hideColumns : [],//已经隐藏的列
				selectRows : [],//设置默认选中的行
				_selectRows : {},//选择的行
				isCreate : false,//废弃
				isShow : false,
				views : {},
				method : 'post',
				url : '',
				loadMsg : '加载中,请稍后...',
				loadErrorMsg : '数据加载错误！',
				showErrorTime : 2000,
				_lmt : 0,//loadMsg 计时器id
				cache : true,//缓存,
				pageNumber : 1,
				pageSize : 10,
				ajaxSend : null,//自定义ajax发送函数
				dataType : 'json',
				queryParams : {},
				singleSelect : false,//是否可以多选
				rowStyler : "",//行style 字符串作为 class function(rowid,rowdata)
				rowCallBack : $.noop,
				methodCall : {},//内部函数的回调函数
				denyRowEvents : false,//禁止触发的事件
				eventMaps : {},
				events : {
					onStart : $.noop,//创建开始 1
					onViewCreate : $.noop,
					onShowContainer : $.noop,
					onFinish : $.noop,//创建结束 1
					onBeforeLoad : $.noop,//调用远程数据开始 ，如果返回false讲取消本次请1求
					onLoadSuccess : $.noop,//调用远程数据成功1
					onLoadError : $.noop,//调用远程数据失败1
					onClickRow : $.noop,//当用户点击一行时触发1
					onColumnOver : $.noop,//当用户mouseover row
					onColumnOut : $.noop,//当用户mouseout row
					onOverCell : $.noop,//当用户mouseover cell
					onOutCell : $.noop,//当用户mouseout cell
					onOverRow : $.noop,//当用户mouseover row
					onOutRow : $.noop,//当用户mouseout row
					onDblClickRow : $.noop,//当用户双击一行时触发1
					onClickCell : $.noop,//当用户单击一个单元格时触发1
					onDblClickCell : $.noop,//当用户双击一个单元格时触发1
					onResizeColumnStart : $.noop,//当用户调整列的尺寸时触发1
					onResizeColumn : $.noop,//当用户调整列的尺寸时触发1
					onResizeColumnStop : $.noop,//当用户调整列的尺寸时触发1
					onAfterResize : $.noop,//当用户调整列大小后触发,如果onResizeColumnStop 返回false 那么不会执行
					onSelect : $.noop,//用户选中一行时触发1
					onUnselect : $.noop,//当用户取消选择一行时触发1
					onSelectAll : $.noop,//当用户选中全部行时触发1
					onUnselectAll : $.noop,//当用户取消选中全部行时触发1
					onHeaderContextMenu : $.noop,//当 datagrid 的头部被右键单击时触发1
					onHeaderCreate : $.noop,//当 grid-header 创建完成时调用
					onToolBarCreate: $.noop,//排序触发1
					onRowContextMenu : $.noop,//当右键点击行时触发1
					onCellContextMenu : $.noop,
					onBeforeRefresh : $.noop,//1
					onRefresh : $.noop,//1
					onShowGriding : $.noop,// grid数据显示中的时候调用
					onShowGrid : $.noop,// grid 每次刷新都会调用
					onBeforeShowGrid : $.noop, 
					onGetData : $.noop,//1 grid 数据变动都会调用
					onClickRowNumber : $.noop,//1
					onShowColumn : $.noop,//隐藏/显示列触发
					onHideColumn : $.noop,
					onBeforeHideColumn : $.noop,
					onBeforeShowColumn : $.noop,
					onViewSizeChange : $.noop,
					onSizeChange : $.noop,
					onFieldWidthChange : $.noop,
					onScroll : $.noop,
					onScrollBar : $.noop,//手动拖动滚动条时触发
					onScrollEnd : $.noop,
					onDataChange : $.noop,//数据有变更
					onBeforeCellEdit : $.noop,//单元格数据有变更调用
					onCellEdit : $.noop,//单元格数据有变更调用
					onBeforeAddRow : $.noop,//添加行
					onAfterAddRow : $.noop,//添加行
					onBeforeUpdateRow : $.noop,//修改行
					onAfterUpdateRow : $.noop,//修改行
					onBeforeDeleteRow : $.noop,//删除改行
					onAfterDeleteRow : $.noop,//删除改行
					onAdd : $.noop,//添加数据
					onUpdate : $.noop,//更新数据
					onDelete : $.noop,//删除数据
					onAjaxAdd : $.noop,//远程添加数据 需要自定义
					onAjaxUpdate : $.noop,//远程更新数据 需要自定义
					onAjaxDelete : $.noop,//远程删除数据 需要自定义
					onColumnMove : $.noop,
					onColumnMoving : $.noop,
					onBeforeColumnMove : $.noop,
					onAutoColumnResize : $.noop,//开启forceFit 如果列自适应会触发此事件
					onShowLazyRows : $.noop,
					onLazyRowHide : $.noop,
					onUpdateHeaderRow : $.noop,
					onUpdateFooterRow : $.noop,
					onLazyRowShow : $.noop,
					onColumnValueChange : $.noop//列信息改变是触发
				}//事件组合 
				
			};
			
			var _opt = this.extSet(_opt);
			
			return $.extend({},_opt,opt);
		},
		//table转换成gird时的设置参数
		getToGridOptions : function(cfg){
			var opt = {
				options_from : 'data-options',
				columns_from : 'thead th',
				data_from : 'tbody tr',
				footdata_from : 'tfoot tr'
			}
			return $.extend(true,opt,cfg);
		},
		_Tpl : {
			'container' : '<div class="datagrid-container <%=cls%> <%=border?containerCss:""%>" id="<%=id%>" style=" position:relative; overflow:hidden; width:<%=width%>px; height:<%=height%>px;"></div>',
			'title' : '<div class="datagrid-title <%=iconCls%>" id="title_<%=id%>"><%=title%></div>',
			'toolbar' : '<div class="datagrid-toolbar" id="toolbar_<%=id%>"></div>',
			'grid' : '<div class="datagrid-view" id="view_<%=id%>" style="width:1px; height:1px;"></div>',
			'group_row' : '<tr id="<%=id%>-group-row-<%=gid%>"  datagrid-group-row-id="<%=gid%>" class="datagrid-group-row"><td style="width:<%=w%>px" colspan="<%=colspan%>"><div  class="datagrid-group-cell"><%=html%>(<%=num%>)</div></td></tr>',
			'view1' : '<div class="datagrid-view1" id="view1_<%=id%>" style="width:<%=parseFloat(rowNumbersWidth)%>px;height:100%;">'
							+'<div  class="datagrid-header" id="view1-datagrid-header-<%=id%>" style="width: 100%; z-index:1; position:relative;">'
								+'<div class="datagrid-header-inner" id="view1-datagrid-header-inner-<%=id%>">'
									+'<div class="datagrid-header-inner-wraper" id="datagrid-view1-header-inner-wraper-<%=id%>">'
										+'<table class="datagrid-htable" id="view1-datagrid-header-inner-htable-<%=id%>" border="0" cellspacing="0" cellpadding="0">'
											+'<tbody id="view1-datagrid-header-inner-htable-tbody-<%=id%>">'
											+'</tbody>'
										+'</table>'
									+'</div>'
								+'</div>'
								+'<div class="datagrid-header-outer" id="view1-datagrid-header-outer-<%=id%>">'
									+'<div class="datagrid-header-outer-wraper" id="datagrid-view1-header-outer-wraper-<%=id%>">'
										+'<table class="datagrid-locktable" id="view1-datagrid-header-outer-locktable-<%=id%>" border="0" cellspacing="0" cellpadding="0">'
											+'<tbody id="view1-datagrid-header-outer-locktable-tbody-<%=id%>">'
											+'</tbody>'
										+'</table>'
									+'</div>'
								+'</div>'
							+'</div>'
							+'<div class="datagrid-body-wrap" id="view1-datagrid-body-wrap-<%=id%>" style="width: 100%; height:0px; overflow:hidden;zoom:1; ">'
								+'<div class="datagrid-body" id="view1-datagrid-body-<%=id%>" style="width: 100%;float:left;z-index:0;position:relative;">'
									+'<table class="datagrid-btable" id="view1-datagrid-body-btable-<%=id%>" cellspacing="0" cellpadding="0" border="0">'
										+'<tbody id="view1-datagrid-body-btable-tbody-<%=id%>">'
										+'</tbody>'
									+'</table>'
								+'</div>'
							+'</div>'
							+'<div class="datagrid-footer" id="view1-datagrid-footer-<%=id%>" style="width: 100%; height:0px; overflow:hidden;position:relative;z-index:1;"><div id="view1-datagrid-footer-inner-<%=id%>"  class="datagrid-footer-inner"></div></div>'
						+'</div>',
			'view2' : '<div class="datagrid-view2" id="view2_<%=id%>" style="width:1px;height:100%;">'
							+'<div  class="datagrid-header" id="view2-datagrid-header-<%=id%>" style="width: 100%;">'
								+'<div class="datagrid-header-inner" id="view2-datagrid-header-inner-<%=id%>">'
									+'<div class="datagrid-header-inner-wraper" id="datagrid-view2-header-inner-wraper-<%=id%>">'
										+'<table class="datagrid-htable" id="view2-datagrid-header-inner-htable-<%=id%>" border="0" cellspacing="0" cellpadding="0">'
											+'<tbody id="view2-datagrid-header-inner-htable-tbody-<%=id%>">'
											+'</tbody>'
										+'</table>'
									+'</div>'
								+'</div>'
								+'<div class="datagrid-header-outer" id="view2-datagrid-header-outer-<%=id%>">'
									+'<div class="datagrid-header-outer-wraper" id="datagrid-view2-header-outer-wraper-<%=id%>">'
										+'<table class="datagrid-locktable" id="view2-datagrid-header-outer-locktable-<%=id%>" border="0" cellspacing="0" cellpadding="0">'
											+'<tbody id="view2-datagrid-header-outer-locktable-tbody-<%=id%>">'
											+'</tbody>'
										+'</table>'
									+'</div>'	
								+'</div>'
							+'</div>'
							+'<div class="datagrid-body" id="view2-datagrid-body-<%=id%>" style="width: 100%;height:0px;">'
								+'<table class="datagrid-btable" id="view2-datagrid-body-btable-<%=id%>" cellspacing="0" cellpadding="0" border="0">'
									+'<tbody id="view2-datagrid-body-btable-tbody-<%=id%>">'
									+'</tbody>'
								+'</table>'
							+'</div>'
							+'<div class="datagrid-footer" id="view2-datagrid-footer-<%=id%>" style="width: 100%; height:0px; "><div id="view2-datagrid-footer-inner-<%=id%>"  class="datagrid-footer-inner"></div></div>'
					+'</div>',
			'pager' : '',
			'view1_header_inner_row' : '<tr class="datagrid-header-row">'
											+'<% if( rowNumbersWidth !== false ) {%>'
											+'<td align="center" class="datagrid-td-rownumber" style=""><div class="datagrid-header-rownumber" style="width:<%=parseFloat(rowNumbersWidth)%>px;"><%=ltText%></div></td>'
											+'<% } %>'
									   +'</tr>',	
			'view1_header_outer_row' : '',	
			'view2_header_inner_row' : '',//改用模版函数代替
			'view2_header_inner_row_bak' : '<tr class="datagrid-header-row">'
											+'<% var i=0;len = fields.length;  for(;i<len;i++) {%>'
											+'<td field="<%=fields[i]["field"]%>" align="<%=fields[i]["align"]%>">'
												+'<div class="datagrid-header-wrap" field="<%=fields[i]["field"]%>" >'
													+'<div class="datagrid-cell datagrid-cell-<%=fields[i]["field"]%> datagrid-cell-header-<%=fields[i]["field"]%> <%=fields[i]["hcls"]%>" >'
														+'<span><%=fields[i]["title"]%></span>'
													+'</div>'
												+'</div>'
											+'</td>'
											+'<% } %>'
										+'</tr>',							
			'view2_header_outer_row' : '',
			'view1_row' : '',//改用模版函数代替
			'view2_row' : ''//改用模版函数代替
		}
		
	});
	dataGrid.fn.extend({
		_init : function( opt ) {
			var self = this;
			//模版引擎设置
			opt.template.isEscape = opt.isEscape;
			opt.template.helper('parseInt', parseInt);
			opt.template.helper('parseFloat', parseFloat);

			opt.gid = opt.gid || "#view_"+opt.id;
			
			opt.renderTo = $(opt.renderTo);

			//保存初始设置值
			opt.__width = opt.width;
			opt.__height = opt.height;
			
			self.setContainer() //setContainer必须
				.setTitle()
				.setToolBar()
				.setGrid()
				.show();
		},
		_sysEvents : function(){
			var self = this;
			var opt = self.configs;
			//绑定checkBox
			self.bind("onUnselectAll",function(){this.checkCk(false,0)});
			self.bind("onSelectAll",function(){this.checkCk(true,0)});
			self.bind("onUnselect",function(){this.checkCk(false,1)});
			
			self.bind("onBeforeShowGrid",function(){this.checkCk(false,2)});
			//core
			self.bind("onViewCreate",self.onInitFieldWidth);
			
			self.bind("onSetPk",self.setPk);
			
			self.bind("onSizeChange",self.onFinishFieldWidth);
			self.bind("onShowGrid",self.resetHeader);
			
			self.bind("onScrollBar",self.onScrollBar);
			self.bind("onScroll",self.loadRows);
			
			self.bind("onDataChange",self.onDataChange);
			self.bind("onMouseEnter",self.onOverRow);
			self.bind("onMouseLeave",self.onOutRow);
			self.bind("onShowGrid",self.onDisplayField);
			
			self.bind("onHeaderCreate",self.onHeaderCreate);
			
			self.bind("onColumnValueChange",self.onColumnValueChange);
			
			self.bind("onAfterAddRow",self.onDisplayField);//隐藏列
			
			//emptyGrid
			self.bind("onAfterAddRow",self.removeEmptyDiv);
			
			self.bind("onFieldWidthChange",self.setForceFitColumn);
			
			self.bind("onViewSizeChange",self._autoHeight);
			self.bind("onViewSizeChange",self.onFitColumn);
			self.bind("onViewSizeChange",self.isEmptyGrid);
			self.bind("onShowLazyRows",self.onDisplayField);//隐藏列
			
			self.bind("onUpdateHeaderRow",self.onDisplayField);//隐藏列
			
			//self.bind("onUpdateFooterRow",self.onDisplayField);//隐藏列
			//_loadRows
			self.bind("onSizeChange",function(){
				this.loadRows(true);							  
			});
			self.bind("onLazyRowShow",self._selectLazyRows);
			//selectRows = []
			self.bind("onShowGrid",self._selectDefRows);
		},
		
		showLoading : function(msg,render){
			var self = this;	
			var opt = self.configs;
			var msg = typeof msg === 'undefined' ? opt.loadMsg : msg;
			
			if( opt._lmt ) {
				clearTimeout(opt._lmt);	
			}
			
			var render = "#"+opt.id;
			//self.hideLoading(render);
			var isExists = $("#"+opt.id+"_datagrid-mask-wraper");
			if( isExists.length ) {
				var maskMsg = $("#"+opt.id+"_datagrid-mask-msg");
				maskMsg.html( msg );
				
				isExists.show();	
				
				var w = maskMsg.outerWidth(true);
				maskMsg.css("marginLeft",-w/2+"px");
				
				return self;
			}
			
			var maskWraper = $('<div id="'+opt.id+'_datagrid-mask-wraper" class="datagrid-mask-wraper"><div id="'+opt.id+'_datagrid-mask" class="datagrid-mask"></div><div id="'+opt.id+'_datagrid-mask-spacer" class="datagrid-mask-spacer"></div><div id="'+opt.id+'_datagrid-mask-msg" class="datagrid-mask-msg" style=" left: 50%;">'+msg+'</div><div>');
			$(render).append(maskWraper);
			var maskMsg = $("#"+opt.id+"_datagrid-mask-msg");
			var w = maskMsg.outerWidth(true);
			maskMsg.css("marginLeft",-w/2+"px");
			maskWraper.click(function(e){
					e.stopPropagation();
					e.preventDefault();											 
				});
			return self;
		},
		hideLoading : function(render){
			var self = this;
			var opt = self.configs;
			//$("#"+opt.id+"_datagrid-mask-wraper").hide();
			opt._lmt = setTimeout(function(){
				$("#"+opt.id+"_datagrid-mask-wraper").hide();					
			},0);
			
			return self;
		},
		methodCall : function(method){
			var method = method || "";
			var self = this;
			var opt = self.configs;
			if( method!="" && method in opt.methodCall && $.isFunction(opt.methodCall[method]) ) {
				opt.methodCall[method].call(self);	
			}
			
			return self;
		},
		/*
		* 获取当前grid列信息,数组方式返回
		*/
		getColumnMap : function(){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var fields = opt.columns;
			return fields;
		},
		/*
		* 获取当前grid的列名,数组方式返回
		*/
		getColumnList : function(){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var fields = self.getColumnMap();
			var list = [];
			var i = 0,
				len = fields.length;
			for(;i<len;i++) {
				list.push(fields[i]['field']);	
			}
			return list;
		},
		/*
		* 获取/设置列信息(部分参数设置后会刷新grid表格)
		* 可触发事件onColumnValueChange
		*  @columnName {String} 列名
		*  @proto      {String} 参数(可选)
		*  @value      {String} 参数值(可选)
		*/
		getColumnData : function(columnName,proto,value){
			var self = this;
			var opt = self.configs;
			
			var columnName = self._undef(columnName,false);	
			var proto = self._undef(proto,false);	
			
			if(columnName === false ) return self;
			
			//var fields = self.getColumns(true);//获取columns元数据 ？？ 想不起为啥以前要获取元数据了
			//var fields = opt.columns;
			//统一使用getColumnMap 接口获取列
			var fields = self.getColumnMap();
			
			var i=0,len = fields.length;
			for(;i<len;i++) {
				if(fields[i]['field']+'' === columnName+'') {
					if(proto === false) {
						return fields[i];
					} else {
						if(typeof value === 'undefined') {
							return fields[i][proto];
						} else {
							fields[i][proto] = value;
							
							//址引用 不必重新设置
							//opt.columns = fields;//设置后必须调用getColumns 。setGridHeader会调用getColumns
							

							self.fireEvent("onColumnValueChange",[fields[i],proto,value,opt]);
				
							//self.setGridHeader();//重新生成
							//self.refreshDataCache();
							return self;
						}
					}
				}	
			}
			return null;
		},
		/*
		*同getColumnData
		*/
		setColumnData : function(columnName,proto,value){
			var self = this;
			return self.getColumnData(columnName,proto,value);
		},
		/*
		*系统事件
		*/
		onColumnValueChange : function(column,proto,value){
			var self = this;
			var opt = self.configs;
			switch(proto) {
				case 'width' : 
					self.setFieldWidth(column.field,value);
					break;
				case 'title' : 
					$(".datagrid-cell-header-"+column.field+" >span:first",$("#"+opt.id)).html(value);
					break;
				case 'field' :
					self.setFieldWidth(value,column[value].width);
					self.setGridHeader();//重新生成
					self.refreshDataCache();	
					break;
				default : 
					self.setGridHeader();//重新生成
					self.refreshDataCache();	
			}
		},
		/*
		* 获取当前grid数据集
		*  @return {Object} 数据集
		*/
		getData : function(){
			var self = this;
			var opt = self.configs;
			var async = self.getAsync();
			if( async ) {
				opt.cacheData['source'] = opt.cacheData['source'] || opt.data;
				return opt.cacheData['source'];
			} else {
				return opt.data;
			}
		},
		textLimit : function(text,width,fontSize) {},
		getTpl : function(tpl) { //兼容函数
			return tpl;
		},
		/*如果width height 设置的是百分比那么将返回百分比值，只对resize和初始创建时有效*/
		getResizeWH : function(){
			var self = this;
			var opt = self.C();	
			var width =  $(opt.renderTo)._width();
			var height =  $(opt.renderTo)._height();	
			opt.__pWidth = width;
			opt.__pHeight = height;

			var w = opt.__width === 0 ? width : opt.__width
				,h = opt.__height === 0 ? height : opt.__height;
			if( opt.__width.toString().indexOf("%") != -1 ) {
				w = parseFloat(opt.__width)*width/100;
			}
			if( opt.__height.toString().indexOf("%") != -1 ) {
				h = parseFloat(opt.__height)*height/100;
			}

			return {width:w,height:h};
		},
		/*
		*返回组件的最终宽高
		*/
		checkSize : function(width,height){
			var self = this;
			var opt = self.configs;	
			
			height -= isNaN(parseFloat(opt.cutHeight)) ? 0 : opt.cutHeight;
			width -= isNaN(parseFloat(opt.cutWidth)) ? 0 : opt.cutWidth;
			
			if( opt.minWidth>0 ) {
				width = Math.max(width,opt.minWidth);
			}
			if( opt.minHeight>0 ) {
				height = Math.max(height,opt.minHeight);
			}
			if( opt.maxWidth>0 ) {
				width = Math.min(width,opt.maxWidth);
			}
			if( opt.maxHeight>0 ) {
				height = Math.min(height,opt.maxHeight);
			}
			
			return {
					width : width,
					height : height
				};
		},
		/*
		* 设置grid容器宽高
		*  @width  {int} 宽
		*  @height {int} 高
		*/
		resizeContainer : function(width,height){
			var self = this;
			var opt = self.configs;
			
			var container = $("#"+opt.id);
			
			var size = self.getResizeWH();
			
			opt.width = self._undef(width,size.width);
			opt.height = self._undef(height,size.height);
			
			//检查自定义setWH 是否使用百分比做为单位
			if( opt.width.toString().indexOf("%") != -1 ) {
				opt.width = parseFloat(opt.width)*opt.__pWidth/100;
			}
			if( opt.height.toString().indexOf("%") != -1 ) {
				opt.height = parseFloat(opt.height)*opt.__pHeight/100;
			}
			
			/*opt.height -= isNaN(parseFloat(opt.cutHeight)) ? 0 : opt.cutHeight;
			opt.width -= isNaN(parseFloat(opt.cutWidth)) ? 0 : opt.cutWidth;
			
			if( opt.minWidth>0 ) {
				opt.width = Math.max(opt.width,opt.minWidth);
			}
			if( opt.minHeight>0 ) {
				opt.height = Math.max(opt.height,opt.minHeight);
			}
			if( opt.maxWidth>0 ) {
				opt.width = Math.min(opt.width,opt.maxWidth);
			}
			if( opt.maxHeight>0 ) {
				opt.height = Math.min(opt.height,opt.maxHeight);
			}*/
			var wh = self.checkSize( opt.width,opt.height );
			opt.width = wh.width;
			opt.height = wh.height;
			
			var width=opt.width,height=opt.height;
			//2014-03-13  取消
			width -= (container._outerWidth() - container._width());
			height -= (container._outerHeight() - container._height());
			//直接使用width height
			//width = container._width();
			//height = container._height();
			
			container.css({
				width : width,
				height : height
			});
			return {
				width : width,
				height : height
			};
		},
		setContainer : function(opt) {
			var opt = opt || {};
			var self = this;
			//var opt = $.extend({},self.configs,opt);
			var opt = self.configs;
			var tpl = self.tpl("container",opt);
			
			opt.renderTo.append($(tpl));
			//__SIZE__ 用于 _setGridWH
			opt.__SIZE__ = self.resizeContainer();
			
			return self;
		},
		setTitle : function(title) {
			var self = this;
			var opt = self.configs;
			opt.title = typeof title === 'undefined' ?  opt.title : title;
			if(opt.title==="") return self;
			var tpl = self.tpl("title",opt);
			self.configs.views['title'] = $(tpl);
			return self;
		},
		/*
		* 获取工具列表
		*  @items  {Array} 工具按钮
		*  @return  {Object} 创建好的工具对象dom
		*/
		getTools : function(items){
			var self = this;
			var opt = self.configs;
			
			
			if( $.isPlainObject(items) ) {
				var items = [ items ];	
			}
			if( !$.isArray(items) && !$.isPlainObject(items) ) {
				return $(items);	
			}
			var _item = opt._toolItem;
			var container = '<table cellspacing="0" cellpadding="0" border="0"><tbody><tr>{$tools}</tr></tbody></table>';
			var h = '';
			var i=0,
				len = items.length;
			for(;i<len;i++) {
				if( $.isPlainObject(items[i]) ) {
					items[i] = $.extend({},_item,items[i]);
					if(items[i]['cls'] != '') {
						items[i]['cls'] += " l-btn-icon-left";		
					}
					var isDisabled = items[i]['disabled'] ? "l-btn-disabled" : "";
					h += '<td><a href="javascript:void(0)" class="l-btn l-btn-plain '+isDisabled+'" indexid="'+i+'"><span class="l-btn-left"><span class="l-btn-text '+items[i]['cls']+'">'+items[i]['text']+'</span></span></a></td>';
				} else if( items[i]==='|' || items[i]==='-' || items[i]===';' || items[i]===',' ) {
					h += '<td><div class="datagrid-btn-separator"></div></td>';	
				} else {
					h += '<td>'+items[i]+'</td>';		
				}
			}
			container = container.replace('{$tools}',h);
			var container = $(container);
			container.find(".l-btn").each(function(i){
				$(this).click(function(e){
					var indexid = $(this).attr("indexid");
					items[indexid]['callBack'].call(self,this,items[indexid]);
					e.stopPropagation();
					e.preventDefault();
				});									   
			});
			return container;
		},
		setToolBar : function() {
			var self = this;
			var opt = self.configs;
			if(opt.toolBars===false) return self;
			var tpl = self.tpl("toolbar",opt);
			self.configs.views['toolbar'] = $(tpl);
			var tool = self.getTools(opt.toolBars);
			if( tool !== false ) {
				self.configs.views['toolbar'].append(tool);	
			}
			self.fireEvent('onToolBarCreate',[self.configs.views['toolbar'],opt.toolBars,opt]);
			self.methodCall('setToolBar');
			
			return self;
		},
		//初步设置gridView高度和宽度
		_setGridWH : function(){
			var self = this;
			var opt = self.configs;
			var views = opt.views;
			var grid = views['grid'];
			
			var h = 0;
			for(var i in views) {
				if(i === 'grid') continue;
				h += views[i]._outerHeight(true);
			}
			//var g = $("#"+opt.id);
			var size = opt.__SIZE__;
			
			grid._outerHeight( size.height - h );
			grid._outerWidth( size.width );
			//解决IE下 $().width() 耗时问题
			//grid.data('_width',grid.width());
			//grid.data('_height',grid.height());
		},
		setGrid : function () {
			//setView
			var self = this;
			var opt = self.configs;
			var views = opt.views;
			if(!views['grid']) {
				var tpl = self.tpl("grid",opt);
				self.configs.views['grid'] = $(tpl);
			}
			self.methodCall('setGrid');
			return self;
		},
		//autoExpand : function(){},
		checkCk : function(type,t){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var render = gid;
			var type = self._undef(type,false);
			var t = self._undef(t,0);
			if( t == 1 ) {
				if( opt.lazyLoadRow ) {
					return;
				}	
			}
			//view2-datagrid-header-inner-htable-tbody-datagrid_57036
			$("#view2-datagrid-header-inner-htable-tbody-"+opt.id).find(">.datagrid-header-row td[field='ck']").find("input:checkbox").each(function(i){
				this.checked = type ? true : false;																					   
			});
		},
		//setExpandEvent : function(t,rowId,rowData){},
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
        },
		/*
		* 滚动到指定列
		*  @field {String} 列名
		*/
		scrollToField : function(field){
			var self = this;
			var opt = self.configs;
			var header = $("#view2-datagrid-header-"+opt.id);
			
			if( !header.length ) {
				return self;	
			}
			
			var columns = self.getColumnList();
			
			if( self.inArray( field,columns ) == -1 ) {
				return self;		
			}
			
			//检测当前列是否已经隐藏
			if( self.inArray( field,opt.hideColumns ) != -1 ) {
				return self;		
			}
			
			var r = self.fireEvent("onBeforeScrollToField",[field,opt]);
			if( r === false ) {
				return r;	
			}
			
			var scrollbarSize = self.getScrollbarSize();
			
			var offset = header.offset();
			var w = header._outerWidth();
			//判断是否出现了垂直滚动条
			//这里在某些情况下有可能存在BUG, 可参见autoHeight 对判断是否出现滚动条问题的解决
			var body = $("#view2-datagrid-body-"+opt.id);
			var sh = body.get(0).scrollHeight;
			if( sh > body._outerHeight() ) {
				w -= scrollbarSize.width;//-滚动条大小
			}
			
			var f = $(">tr.datagrid-header-row td[field='"+field+"']","#view2-datagrid-header-inner-htable-tbody-"+opt.id);
			
			if( !f.length ) return self;
			
			var fo = f.offset();
			var fw = f._outerWidth();
			
			var outerWidth = 0;
			if( offset.left > fo.left ) {
				outerWidth = offset.left - fo.left;
			} else if( (offset.left+w) < (fo.left+fw) ) {
				outerWidth = (offset.left+w) - (fo.left+fw);
			}
			var sLeft = 0;
			
			sLeft = opt.sLeft - outerWidth;
			
			opt.sLeft = sLeft;

			//self.fireEvent("onScroll",[true]);
			
			self.onScroll(true);
			
			self.fireEvent("onAfterScrollToField",[field,opt]);

			return self;
		},
		/*
		* 滚动到指定行
		*  @rid {int} 行id
		*/
		scrollToRow : function(rid){
			var self = this;
			var opt = self.configs;
	
			var r = self.fireEvent("onBeforeScrollToRow",[rid,opt]);
			if( r === false ) {
				return r;	
			}
			
			if( opt.lazyLoadRow && self.inArray( rid,opt.lazyRows ) == -1 ) {
				opt.sTop = opt._trHeight*rid;
				self.fireEvent("onScroll",[]);
				return self;
			}
			
			var body = $("#view2-datagrid-body-"+opt.id);
			
			if( !body.length ) {
				return self;	
			}
			
			var scrollbarSize = self.getScrollbarSize();
			
			var offset = body.offset();
			var h = body._outerHeight();
			//判断是否出现了水平滚动条
			//这里在某些情况下有可能存在BUG, 可参见autoHeight 对判断是否出现滚动条问题的解决
			var sw = body.get(0).scrollWidth;
			if( sw > body._outerWidth() ) {
				h -= scrollbarSize.height;//-滚动条大小
			}
			
			var f = $("#"+opt.id+"-row-"+rid);
			if( !f.length ) {
				return self;	
			}
			
			var fo = f.offset();
			var fh = f._outerHeight();
			
			var outerHeight = 0;
			if( offset.top > fo.top ) {
				outerHeight = offset.top - fo.top;
			} else if( (offset.top+h) < (fo.top+fh) ) {
				outerHeight = (offset.top+h) - (fo.top+fh);
			}
			
			var sTop = 0;
			
			sTop = opt.sTop - outerHeight;
			
			opt.sTop = sTop;

			//self.fireEvent("onScroll",[true]);
			self.onScroll(true);
			
			self.fireEvent("onAfterScrollToRow",[rid,opt]);
			
			return self;
		},
		//refreshPager : function(){},
		//addPagerEvent : function(){},
		//setPager : function(init) {},
		_autoHeight : function(){
			var self = this;
			var opt = self.configs;
			if( opt.autoHeight ) {
				self.autoHeight();	
			}
		},
		/*
		* 只适应高度
		*  大数据开启下不建议使用这个
		*/
		autoHeight : function(){
			var self = this;
			var opt = self.configs;
			var grid = $("#"+opt.id);
			var view = $("#view_"+opt.id);
			
			var scrollbarSize = self.getScrollbarSize();
			
			$("#view2-datagrid-body-"+opt.id).css("overflow-y","hidden");	
			
			//var h = grid.outerHeight() - view.outerHeight();//2014-03-03 取消 
			var rv = $("#view2-datagrid-header-"+opt.id)._outerHeight();
			var rh = $("#view2-datagrid-body-btable-"+opt.id)._outerHeight();
			var rf = $("#view2-datagrid-footer-"+opt.id)._outerHeight();
			var _min = opt.minAutoHeight;
			var _max = opt.maxAutoHeight;
			rh = Math.max( rh,_min );
			if( _max>0 ) {
				
				if( rh > _max ) {
					$("#view2-datagrid-body-"+opt.id).css("overflow-y","auto");	
				}
				
				rh = Math.min( rh,_max );	
			}
			var _f = 0;
			if( !opt.forceFit ) {
				//判断是否出现了水平滚动条
				/*
				//bug fix IE下scrollWidth在overflow hidden下不正确
				var header = $("#datagrid-view2-header-inner-wraper-"+opt.id);
				if( header.get(0).scrollWidth>header.outerWidth() ) {
					_f = scrollbarSize.height;
				}
				*/
				var header = $("#view2-datagrid-header-"+opt.id);
				var headerInner = $("#view2-datagrid-header-inner-htable-"+opt.id);
				if( headerInner._outerWidth()>header._outerWidth() ) {
					_f = scrollbarSize.height;
				}
			}
			var height = rv + rh + rf + _f;//取消 +h 
			
			//bug : grid.outerHeight()-grid.height()
			//如果容器高度为0时 则 grid.outerHeight()会是一个0或者2 grid.outerHeight()-grid.height() 的值就是错误的
			//fix 2014-3-3
			//以上问题出现在于grid不在$.ready里创建 ,$.boxModel还没设置
			var views = opt.views;
			var h = grid._outerHeight()-grid._height();
			for(var i in views) {
				if(i == 'grid') continue;
				h += views[i]._outerHeight(true);
			}

			self.onSizeChange( opt.width,height+h );
			self.onViewSizeChange();
			
			self.fireEvent("onAutoHeight",[opt]);
		},
		unAutoHeight : function(){
			var self = this;
			var opt = self.configs;	
			opt.autoHeight = false;
			$("#view2-datagrid-body-"+opt.id).css("overflow-y","auto");
		},
		/*
		* 设置grid宽,高
		*  触发onSizeChange事件
		*  @width  {int} 宽
		*  @height {int} 高
		*  @m      {boolean} true:强制更新,false:大小都没变化时不更新大小返回false 默认(可选)
		*/
		resetGridSize : function(width,height,m){
			var self = this;
			var opt = self.configs;	
			var m = self._undef(m,false);
			var width = self._undef(width,opt.width);
			var height = self._undef(height,opt.height);
			//如果不需要设置会返回false
			var r = self.onSizeChange(width,height,m);
			if( r === false ) return r;
			
			//self.resetViewSize();
			self.methodInvoke('resetViewSize',function(){
				self.fireEvent("onSizeChange",[opt]);								   
			});
			//因为resetViewSize有延迟，所以必须要把事件触发放到resetViewSize里
			//self.fireEvent("onSizeChange",[opt]);	
		},
		setGridSize : function(w,h,m){
			this.resetGridSize(w,h,m);
		},
		onSizeChange : function(width,height,m){
			var self = this;
			var opt = self.configs;
			
			var m = self._undef(m,false);
			//m:true 强制更新宽高
			if( !m ) {
				var w = self._undef(width,opt.width);
				var h = self._undef(height,opt.height);
				var  wh = self.checkSize( w,h );
				if( wh.width == opt.width && wh.height == opt.height ) return false;
			}
			
			opt.width = self._undef(width,opt.width);
			opt.height = self._undef(height,opt.height);

			var container = $("#"+opt.id);
			
			var size = self.resizeContainer(opt.width,opt.height);
			//计算grid高度
			var views = opt.views;
			var grid = views['grid'];
			var h = 0;
			for(var i in views) {
				if(i == 'grid') continue;
				h += views[i]._outerHeight(true);
			}
			grid._outerWidth( size.width );
			grid._outerHeight(size.height - h);
			
			self.fireEvent("onSetGridSize",[opt]);
			//解决IE下耗时问题 方案1
			//grid.data('_width',grid.width());
			//grid.data('_height',grid.height());
		},
		/*
		* 更新grid视图部分宽高
		*  触发onViewSizeChange事件
		*/
		resetViewSize : function (func){
			var self = this;
			var opt = self.configs;
			if( opt.__svt ) {
				clearTimeout(opt.__svt);	
			}
			opt.__svt = setTimeout(function(){
				self.onViewSizeChange();
				self.fireEvent("onViewSizeChange",[opt]);
				opt.__svt = 0;
				if( func && $.isFunction(func) ) {
					func();
				}
			},0);
			
		}, 
		setViewSize : function(){
			var self = this;
			self.methodInvoke('resetViewSize');
			//this.resetViewSize();
		},
		onViewSizeChange : function( roll ){
			//var s = $.now();
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var roll = self._undef( roll,true );
			var grid = $(gid);
			var w = grid._width();//列太多，会导致获取时间成正比
			var	h = grid._height();
			
			//var w = grid.data('_width');
//			var h = grid.data('_height');
//			w = typeof w == 'undefined' ? grid.width() : w;
//			h = typeof h == 'undefined' ? grid.height() : h;
			
			
			//判断是否隐藏状态
			/*if( opt.renderTo.is(":hidden") ) {
				var x = $("<div></div>").appendTo(document.body);
				x.css({
					  position:'absolute',
					  top : -9999
					  });
				x.append($("#"+opt.id));
			}*/
			
			var view1 = $("#view1_"+opt.id);
			var view2 = $("#view2_"+opt.id);
			
			//设置宽度	
			var view1_w = $("#view1-datagrid-header-inner-htable-"+opt.id)._outerWidth();
			view1.width(view1_w);
			var v1_w = view1._outerWidth();
			//设置绝对显示位置
			view2.css('left',v1_w);
			var _v2 = w - v1_w;
			view2._outerWidth( _v2 );
			//设置高度
			var view2_header_h = $("#view2-datagrid-header-inner-htable-"+opt.id)._height();//datagrid-view2-header-inner-wraper-datagrid_1
			//左右高度一样
			$("#view1-datagrid-header-inner-htable-"+opt.id).height( view2_header_h );
			//设置 datagrid-header-inner
			//view2_header_h = view2_header_h - 1;
			//view2_header_h = view2_header_h < 0 ? 0 : view2_header_h; 
			//隐藏header
			if( !opt.showHeader ) {
				view2_header_h = 0;	
			}
			
			$("#view1-datagrid-header-inner-"+opt.id)._outerHeight( view2_header_h );
			$("#view2-datagrid-header-inner-"+opt.id)._outerHeight( view2_header_h );
			//设置datagrid-header-outer
			var view2_header_outer_h = $("#datagrid-view2-header-outer-wraper-"+opt.id)._height();
			$("#view1-datagrid-header-outer-"+opt.id).height( view2_header_outer_h );
			$("#view2-datagrid-header-outer-"+opt.id).height( view2_header_outer_h );
			//设置datagrid-header
			var header_h =  $("#view2-datagrid-header-inner-"+opt.id)._outerHeight() + $("#view2-datagrid-header-outer-"+opt.id)._outerHeight();
			
			$("#view1-datagrid-header-"+opt.id).height( header_h );
			$("#view2-datagrid-header-"+opt.id).height( header_h );
			//隐藏footer
			if( !opt.showFooter ) {
				opt.gfooter.height( 0 );
				$("#view1-datagrid-footer-"+opt.id).height( 0 );
			} else {
				var fh = 0;
				var nodes = $("#view2-datagrid-footer-inner-"+opt.id).children();
				nodes.each(function(){
					fh += $(this)._outerHeight();				
				});
				opt.gfooter.height( fh );	
				$("#view1-datagrid-footer-"+opt.id).height( fh );
			}
			
			var bodyH = view2._height() - opt.gheader._outerHeight() - opt.gfooter._outerHeight();
			opt.gbody._outerHeight( bodyH );
			$("#view1-datagrid-body-wrap-"+opt.id)._outerHeight( bodyH );
			//开启显示footer后,如果数据过少会导致不粘合在一起问题,觉得不需要
			if( opt.showFooter ) {}
			
			if( roll ) {
				self.onScroll(true);
			}
			
			/*if( opt.renderTo.is(":hidden") ) {
				opt.renderTo.append($("#"+opt.id));
				x.remove();
			}*/
			self.fireEvent("onSetGridViewSize",[opt]);
			//console.log($.now() -s);
		},
		//数组移动算法
		// pos 要移动的元素
		array_sort : function(iarr,pos,target,t) {//t 代表是前还是后 1 代表前 0 代表后

			if(pos == target) return iarr;
			//支持字符下标
			var _iarr = iarr;
			iarr = [];
			var j=0,
				len = _iarr.length;
			for(;j<len;j++) {
				var _i = iarr.push(j);
				if( j == pos) {
					pos = _i-1;
				} else if( j == target ) {
					target = _i-1;
				}
			}
			//core
			var _p = iarr[pos];//记录元副本
			if( pos>target ) {
				if(!t) {
					target++;
				}
				for(var i=pos;i>=0;i--) {
					if(i == target) {
						iarr[i] = _p;
						break;
					}
					iarr[i] = iarr[i-1];
				}
			} else if( pos<target ) {
				if(t) {
					target--;
				}
				for(var i=pos;i<=target;i++) {
					
					if( i == target ) {
						iarr[i] = _p;
					} else {
						iarr[i] = iarr[i+1];
					}	
				}
			}
			//字符下标
			var new_arr = [];
			var k=0,
				len = iarr.length;
			for( ;k<len;k++ ) {
				new_arr.push( _iarr[ iarr[k] ] );
			}
			iarr = new_arr;
			return iarr;
		},
		/*
		@moveField : field 需要移动的列
		@moveToField : field 需要移动到目的列
		@moveToFieldPos : 1,0(1=>移动到moveToField之前,0=>之后)	
		*/
		moveColumn : function( moveField,moveToField,moveToFieldPos ){
			var self = this,
				opt = self.configs;
			self.onColumnMove( moveField,moveToField,moveToFieldPos );
			return self;
		},
		onColumnMove : function(moveField,moveToField,moveToFieldPos){
			var self = this,
				opt = self.configs;
			//var fields = opt.columns;
			//统一使用getColumnMap 接口获取列
			var fields = self.getColumnMap();
			var pos = 0;
			var target = 0;
			var t = moveToFieldPos || opt.moveToFieldPos;
			opt.moveField = moveField || opt.moveField;
			opt.moveToField = moveToField || opt.moveToField;
			if( opt.moveField == opt.moveToField ) return;
			
			var _r = self.fireEvent("onBeforeSwitchColumn",[opt.moveField,opt.moveToField,opt.moveToFieldPos,opt]);
			if( _r === false ) {
				return _r;	
			}
			
			var i=0,
				len = fields.length;
			for(;i<len;i++) {
				if( fields[i]['field'] == opt.moveField ) {
					pos  = i;	
				}
				if( fields[i]['field'] == opt.moveToField ) {
					target  = i;	
				}
			}
			//移动列
			fields = opt.columns =self.array_sort(fields,pos,target,t);
			//数组去重
			var disArr = self.distArr;
			
			//移动单元格数据
			if( t ) {//移动到目标元素前
				var pos = $("#view2-datagrid-header-inner-htable-tbody-"+opt.id).find("td[field='"+opt.moveField+"']");
				var target = $("#view2-datagrid-header-inner-htable-tbody-"+opt.id).find("td[field='"+opt.moveToField+"']");
				target.before( pos );
				if( opt.lazyLoadRow ) {
					var rows = [];
					rows = rows.concat(opt.lazyRows,opt.lockRows);
					rows = disArr(rows);
					var j = 0,
						len = rows.length;
					for(;j<len;j++) {
						var rid = rows[j];
						pos = $("#"+opt.id+"-row-"+rid).find("td[field='"+opt.moveField+"']");
						target = $("#"+opt.id+"-row-"+rid).find("td[field='"+opt.moveToField+"']");	
						target.before( pos );
					}
				} else {
					var j = 0,
						len = opt.data.length;
					for(;j<len;j++) {
						pos = $("#"+opt.id+"-row-"+j).find("td[field='"+opt.moveField+"']");
						target = $("#"+opt.id+"-row-"+j).find("td[field='"+opt.moveToField+"']");	
						target.before( pos );
					}
				}
				
			} else {//移动到目标元素后
				var pos = $("#view2-datagrid-header-inner-htable-tbody-"+opt.id).find("td[field='"+opt.moveField+"']");
				var target = $("#view2-datagrid-header-inner-htable-tbody-"+opt.id).find("td[field='"+opt.moveToField+"']");
				target.after( pos );
				if( opt.lazyLoadRow ) {
					var rows = [];
					rows = rows.concat(opt.lazyRows,opt.lockRows);
					rows = disArr(rows);
					var j = 0,
						len = rows.length;
					for(;j<len;j++) {
						var rid = rows[j];
						pos = $("#"+opt.id+"-row-"+rid).find("td[field='"+opt.moveField+"']");
						target = $("#"+opt.id+"-row-"+rid).find("td[field='"+opt.moveToField+"']");	
						target.after( pos );
					}	
				} else {
					var j = 0,
						len = opt.data.length;
					for(;j<len;j++) {
						pos = $("#"+opt.id+"-row-"+j).find("td[field='"+opt.moveField+"']");
						target = $("#"+opt.id+"-row-"+j).find("td[field='"+opt.moveToField+"']");	
						target.after( pos );
					}	
				}
				
			}
			
			self.fireEvent("onColumnMove",[opt.moveField,opt.moveToField,t,opt]);
		},
		setView : function(){
			var self = this,
				opt = self.configs,
				tpl_view1 = self.tpl(self.getTpl("view1"),opt),
				tpl_view2 = self.tpl(self.getTpl("view2"),opt),
				gid = opt.gid;
				$(gid).html('');//防止重复调用
				$(tpl_view1).appendTo(gid);
				$(tpl_view2).appendTo(gid);
				opt.gheader = $("#view2-datagrid-header-"+opt.id);
				opt.gbody = $("#view2-datagrid-body-"+opt.id);
				opt.gfooter = $("#view2-datagrid-footer-"+opt.id);
				// 滚动条事件绑定
				opt.gbody.scroll(function(){
					self.onScroll();
					self.fireEvent('onScroll',[]);
					self.fireEvent("onScrollBar",[]);
					//console.log(3);
				});
		},
		/*
		* 获取指定行数据
		*  获取失败会返回false
		*  @rid {int} 行id或者主键
		*  @isPK {boolean} 默认false,true代表根据主键获取数据(可选)
		*/
		getRowData : function (rid,isPK){
			var self = this;
			var opt = self.configs;
			
			var isPK = self._undef(isPK,false);
			
			var data = isPK ? self.getData() : opt.data;
			
			if(!isPK) {
				var tr = $("#"+opt.id+"-row-"+rid);
				if( tr.size() ) {
					return tr.data('rowData');	
				} else {
					return data[rid];	
				}
				
			} else {
				var pk = opt.pk;
				var i=0,
					len = data.length;
				for(;i<len;i++) {
					if(data[i][pk] == rid) {
						return data[i];
					}	
				}
			}
			return false;
		},
		/*
		* 获取指定主键的行id
		*  设置不成功会返回falsee
		*  @pk   {int,String,Object,Array} 
		*  @return {int,Array} 失败返回false,否则如果传入的是数组则返回数组，其他则直接返回id
		*/
		getRowId : function(pk){
			var self = this,
				opt = self.configs;	
			if( typeof pk == 'undefined' ) return false;
			var pks = [];
			if( $.isArray( pk ) ) {
				for( var i=0;i<pk.length;i++ ) {
					if( $.isPlainObject( pk[i] ) && (opt.pk in pk[i]) ) {
						pks.push( pk[i][opt.pk] );	
					} else {
						pks.push( pk[i] );	
					}
				}	
			} else {
				if( $.isPlainObject( pk ) && (opt.pk in pk) ) {
					pks.push( pk[opt.pk] );	
				} else {
					pks.push( pk );	
				}
			}
			
			var rids = [];
			
			$("#view2-datagrid-header-outer-locktable-tbody-"+opt.id+",#view2-datagrid-body-btable-tbody-"+opt.id).find(">tr.datagrid-row").each(function(i){
				var rowData = $(this).data('rowData');
				var rid = $(this).attr("datagrid-rid");
				if( rowData && (opt.pk in rowData) ) {
					if( self.inArray( rowData[opt.pk],pks ) != -1 ) {
						rids.push(rid);	
					}	
				}
				
			});
			return rids.length == 1 ? rids[0] : rids;
		},
		/*
		* 设置指定行下指定列的值
		*  field应该是通过getRealField处理过的,或者改做setFieldValue
		*  设置不成功会返回false,否则返回true
		*  @rid   {int} 行id
		*  @field {String} 列名
		*  @value {String} 值
		*/
		setRowData : function (rid,field,value){
			var self = this,
				opt = self.configs;	
			
			var tr = $("#"+opt.id+"-row-"+rid);
			var data;
			if( tr.size() ) {
				data = tr.data('rowData');
			} else {
				data = opt.data[rid];	
			}
			
			if( !data ) return false;	
			
			data[field] = value;
			//同时修改元数据
			var _d = false;
			
			if( typeof data[opt.pk] != "undefined" ) {
				_d = self.getRowData( data[opt.pk],true);
				if( _d )
					_d[field] = value;
			}
			
			return true;
		},
		/*
		* 获取当前Field 和 data数据的真实索引
		*  @field {String} 列名
		*  @return {String} 索引名
		*/
		getRealField : function(field){
			var self = this,
				opt = self.configs;	
			if( typeof field == 'undefined' ) {
				return null;	
			}
			var _field = field;
			var field = self.getColumnData(field,'index');
			
			if( field === null ) return _field;
			
			field = field=="" ? _field : field;
			return field;
		},
		/*
		* 获取指定单元格内容
		*  不要直接用 rowData[rid][field] 获取数据 而应该用getFieldValue
		*  @rid {int} 行id
		*  @field {String} 列名
		*  @mod {boolean} false:获取经过映射后的值,true:源数据 默认（可选）
		*/
		getFieldValue : function (rid,field,mod){
			var self = this,
				opt = self.configs;	
			
			var mod = self._undef(mod,true);
				
			field = self.getRealField(field);
			
			var data = this.getRowData(rid);
			
			if( typeof data == 'undefined' )
				return "";
			if( typeof data[field] == 'undefined' )
				return "";
			
			return mod?data[field]:self._cellReader( data[field], self.getColumnData(field,'reader') ,data );
		},
		/*
		* 设置指定单元格内容
		*  不要直接用 rowData[rid][field],setRowData 来设置 而应该用setFieldValue
		*  成功设置后会返回当前行数据，否则返回false
		*  @rid   {int} 行id
		*  @field {String} 列名
		*  @value {String} 值
		*/
		setFieldValue : function(rid,field,value){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			
			var _field = self.getRealField(field);//
			
			var rowData = self.getRowData(rid);
			if( !rowData ) {
				return false;	
			}
			//判断是否内容是否改动
			rowData[_field] = typeof rowData[_field] == 'undefined' ? "" : rowData[_field];
			if( rowData[_field] === value ) {
				return false;	
			}

			var rc = self.fireEvent('onBeforeCellEdit',[rid,field,value,rowData,opt]);
			if( rc === false ) {
				return false;	
			}

			self.setRowData(rid,_field,value);
			
			var t = $("#"+opt.id+"_"+field+"_row_"+rid+"_cell");
			if( !t.size() ) {
				var rows = "#"+opt.id+"-row-"+rid+",#"+opt.id+"-view1-row-"+rid;
				var t = $(rows).find("td[field='"+field+"'] div.datagrid-cell");
			}
			if( t.size() ) {
				var _expand = self.getColumnData(field,'_expand');
				_expand = _expand === null ? false : _expand;
				
				var value = _expand !== false ? self.tpl(_expand,rowData) : self._cellReader( value , self.getColumnData(field,'reader') , rowData );//value;
				
				t.html(value)
				 .addClass("datagrid-cell-edit");
				 
				 //取消2014-02-26
				 //重新开启， callBack 请不要调用setFieldValue
				var callBack = self.getColumnData(field,"callBack");
				if( callBack!=null && $.isFunction(callBack) &&  callBack != opt.noop) {
					callBack.call(self,t,rid,field,rowData);	//field['callBack'].call(self,t,rowId,field,rowData)
				}
			}
			
			self.fireEvent('onCellEdit',[t,rid,field,rowData[_field],rowData,opt]);

			return rowData;
		},
		setFieldText : function(rid,field,value){
			var self = this,
				opt = self.configs;	
			var t = $("#"+opt.id+"_"+field+"_row_"+rid+"_cell");
			if( !t.size() ) {
				var rows = "#"+opt.id+"-row-"+rid+",#"+opt.id+"-view1-row-"+rid;
				var t = $(rows).find("td[field='"+field+"'] div.datagrid-cell");
			}	
			if( t.size() ) {
				t.html(value);
			} else {
				return false;	
			}
			return true;
		},
		/*
		* 获取选择行id或数据
		*  @d   {boolean} true:返回选择行数据,false:返回行id 默认 (可选)
		*/
		getSlectRows : function( d ){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var $list = opt._selectRows;
			var list = [];
			
			for( var rid in $list ) {
				if( $list[rid] === true ) {
					list.push( rid );	
				}	
			}
			
			var d = self._undef(d,false);
			
			var _list = [];
			if( d ) {
				var j=0,
					len = list.length;
				for(;j<len;j++)	{
					if( !opt.data[ list[j] ] ) continue;
					_list.push( opt.data[ list[j] ] );	
				}
				return _list;
			} 
			return list;
		},
		/*
		*同getSlectRows
		*/
		getSelectRows : function( d ) {
			var self = this;
			return self.getSlectRows(d);
		},
		//行列锁
		//onLockRow : function(){},
		//onAfterLockRow : function(rowId){},
		//onLockColumn : function(){},
		//onAfterLockColumn : function(field){},
		//lockRow : function(rowId){},
		//unLockRow : function(rowId){},
		//unLockColumn : function(field){},
		//lockColumn : function(field){},
		//_lockRow : function(rowId) {},
		//_unLockRow : function(rowId){},
		//_getFooterRowNumber : function(rowId) {},
		_getRowNumber : function(rowId) {
			var self = this,
				opt = self.configs,
				data = opt.data,
				gid = opt.gid;
			var view1_tr = $("#"+opt.id+"-view1-row-"+rowId);
			var isNew = false;
			var _d = {};
			if( !view1_tr.size() ) {//添加行
				isNew = true;
				var view1_row = self.getTpl("view1_row");
				_d = {
					i : rowId,
					id : opt.id,
					rowNumbersExpand : opt.rowNumbersExpand,
					data : data[rowId],
					//groupBy : opt.groupBy,
					rowNumbersWidth : opt.rowNumbersWidth,
					opt : opt
				};
				var ltr = $( self.tpl(view1_row,_d) );
				self.bindRowEvent(false,ltr);
				view1_tr = ltr;

			}
			return {
					isNew : isNew,
					node : view1_tr
				};
		},
		//_lockColumn : function(field) {},
		//_unLockColumn : function(field) {},
		
		getCheckBoxColumn : function(columns) {
			var self = this,
			opt = self.configs;
			var r = $.extend({},opt._columnMetaData);
			
			r.field = 'ck';
			r.title = opt.checkBoxTitle;
			r._expand = '<input type="checkbox">';
			r.hcls = 'datagrid-header-check';
			r.bcls = 'datagrid-cell-check';
			r.width = opt.checkBoxWidth;
			r.forceFit = opt.checkBoxForceFit;
			r.fitColumn = opt.checkBoxFit;
			r.align = 'center';
			r.callBack = function(t,rowId,field,rowData){
				var self = this;
				$(t).find("input:checkbox").click(function(e){
					if( this.checked ) {
						self.selectRow(rowId);	
					} else {
						self.unselectRow(rowId);
					}
					e.stopPropagation();
				});
			};
			return r;
		},
		geteditColumn : function(columns) {
			var self = this,
			opt = self.configs;
			var r = $.extend({},opt._columnMetaData);
			var j = 0;
			var k = 0;
			if( $.isArray(opt.editColumn) ) { 
				$.each(opt.editColumn,function(i,n){
					if( $.isPlainObject(this) ) {
						opt.editColumn[i] = $.extend({},opt._toolItem,opt.editColumn[i]);
						j++;	
					} else {
						k++;	
					}						   
				});
			} else {
				opt.editColumn = [];
			}

			var str = '';
			r.field = 'ed';
			r.title = (opt.editColumnTitle === '' || opt.editColumnTitle === false ) ? ' ' : opt.editColumnTitle;
			r._expand = str;
			r.forceFit = opt.editColumnForceFit;
			r.hcls = 'datagrid-header-edit';
			r.bcls = 'datagrid-cell-edit';
			r.width = ( j * opt.editCellW + k * 4 )+'px';
			r.fitColumn = opt.editColumnFit;
			r.align = 'center';
			r.callBack = function(t,rowId,field,rowData){
				var self = this;
				var _item = opt._toolItem;
				var tools = [];
				var tool = {};
				var i = 0,
					len = opt.editColumn.length;
				for(;i<len;i++) {
					
					if( $.isPlainObject(opt.editColumn[i]) ) {
						tool = $.extend(true,{},_item,opt.editColumn[i]);
						tool.callBack = function(t,_item_){
							var indexid = $(t).attr("indexid");
							opt.editColumn[indexid]['callBack'].call(self,t,rowId,field,rowData,_item_);	
						}
						
						tools.push(tool);	
					}  else {
						tools.push(opt.editColumn[i]);	
					}
				};
				if( !$.isFunction( opt.editColumnSetter ) ) {
					var _tool = self.getTools(tools);
					t.append(_tool);
				} else {
					opt.editColumnSetter.call( self,tools,t,rowId,field,rowData );	
				}
			}
			
			return r;
		},
		/*
		*系统事件,设置grid列宽
		*/
		onInitFieldWidth : function(){
			var self = this,
			opt = self.configs;
			self._initFieldWidth();
			return self;
		},
		/*
		*系统事件,设置grid中含有百分比的列宽
		*/
		onFinishFieldWidth : function(){
			var self = this,
			opt = self.configs;
			
			var columns = opt.columns;
			$.each(columns,function(i,column){
				if( column.width.toString().indexOf("%") != -1 ) {
					self.setFieldWidth( column.field,column.width );
				}
			});
			return self;
		},
		//初始化宽度
		_initFieldWidth : function(){
			var self = this,
			opt = self.configs;	
			//console.log('^^1',opt.columns);
			var columns = self.getColumns();
			//opt.columns = columns;
			
			//取得grid 显示区域宽度
			var w = 0;
			var gridWidth = $("#"+opt.id)._width();
			var view1_w = $("#view1-datagrid-header-inner-htable-"+opt.id)._outerWidth(); 
			w = gridWidth - parseFloat( view1_w );
			/*
			//目前应该不需要判断是否出现滚动条
			var scrollbarSize = self.getScrollbarSize();
			//判断是否出现了垂直滚动条
			var body = $("#view2-datagrid-body-"+opt.id);
			w = body.outerWidth();
			var sh = body.get(0).scrollHeight;
			if( sh > body.outerHeight() ) {
				w -= scrollbarSize.width;//减滚动条宽度
			}
			*/
			$("#"+opt.id+"_css").remove();
			var style = [];
			style.push('<style type="text/css" id="'+opt.id+'_css">');
			for(var i=0;i<columns.length;i++) {
				var width = columns[i]['width'];
				var field = columns[i]['field'];
				//初始化宽度
				if( width.toString().indexOf("%") != -1 ) {
					width = parseFloat(width)*w/100;
				} else {
					width = parseFloat(width);
				}
				//maxWidth
				var maxWidth = columns[i]['maxWidth'];
				if( maxWidth !== null ) {
					maxWidth = 	parseFloat(maxWidth);
					width = Math.min(maxWidth,width);
				}
				
				var minWidth = columns[i]['minWidth'];
				width = width>=minWidth ? width : minWidth;
				
				width -= opt.padding;
			
				width = Math.floor(width);
				
				var css = '#'+opt.id+' .datagrid-cell-'+columns[i]['field']+'{width:'+width+'px;}';	
				style.push(css);
			}
			style.push('</style>');
			style = style.join("\n");
			$("#"+opt.id).before(style);
			
			return self;
		},
		//ie6 7 下动态添加的css对 隐藏元素无效
		_setFieldWidth : function(field,width,real){
			var self = this,
			opt = self.configs;
			
			var real = self._undef(real,false);
			var width = self._undef(width,120);
			//self._setFieldWidth(field,width,real);
			if( width.toString().indexOf("%") != -1 ) {
				var w = 0;
				var scrollbarSize = self.getScrollbarSize();
				//判断是否出现了垂直滚动条
				var body = $("#view2-datagrid-body-"+opt.id);
				w = body._outerWidth();
				var sh = body.get(0).scrollHeight;
				if( sh > body._outerHeight() ) {
					w -= scrollbarSize.width;//减滚动条宽度
				}
				width = parseFloat(width)*w/100;
			} else {
				width = parseFloat(width);
			}
			//maxWidth
			var maxWidth = self.getColumnData(field,'maxWidth');
			if( maxWidth !== null ) {
				maxWidth = 	parseFloat(maxWidth);
				width = Math.min(maxWidth,width);
			}
			
			var minWidth = parseFloat(self.getColumnData(field,'minWidth'));
			width = width>=minWidth ? width : minWidth;
			
			var changeWidth = width;
			
			if( !real ) {
				width -= opt.padding;
			}
			width = Math.floor(width);
			
			var cellSelector = "#"+opt.id+" .datagrid-cell-"+field;
			
			var style = $("#"+opt.id+'_css').get(0);
			if( !style ) return false;
			var styleSheet = style.styleSheet?style.styleSheet:(style.sheet||document.styleSheets[document.styleSheets.length-1]);
			var rules = styleSheet.cssRules || styleSheet.rules;
			var isRule = false;//判断是否存在当前设置
			//解决IE下 width = NaN的情况
			width = isNaN( width ) ? 0 : width;
			for(var i=0;i<rules.length;i++) {
				if( rules[i].selectorText.toLowerCase() == cellSelector.toLowerCase() ) {
					rules[i]['style']['width'] = width+'px';
					isRule = true;
					break;
				}
			}
			if( !isRule ) {
				var addRule = styleSheet.addRule || styleSheet.insertRule;
				if( styleSheet.addRule ) {
					styleSheet.addRule(cellSelector,"width:"+width+"px");	
				} else {
					styleSheet.insertRule(cellSelector+"{width:"+width+"px}",rules.length);	
				}
				
			}
			return changeWidth;
		},
		/*
		* 设置列宽度(支持百分比)
		*  必须要等到grid创建好才可调用
		*  @field {String} 列名
		*  @width {String,int} 列宽
		*  @real {boolean} true:真实宽度,false:需要对当前设置的宽度处理 默认(可选)
		*/
		setFieldWidth : function(field,width,real){
			var self = this,
			opt = self.configs;

			var _c = self.getColumnData(field);
			if( _c === null ) return width;
			
			var changeWidth = self._setFieldWidth(field,width,real);

			//self.onScroll(true);
			var w = _c['width'];
			if( width.toString().indexOf("%") != -1 ) {
				self.setColumnValue(field,'width',width);	
			} else {
				if( w.toString().indexOf("%") != -1 ) {	
					if( _c.casePerChange ) {
						self.setColumnValue(field,'width',changeWidth);	
					}
				} else {
					self.setColumnValue(field,'width',changeWidth);	
				}
			}
			
			self.fireEvent("onFieldWidthChange",[field,changeWidth,width,w,opt]);

			self.lockEvent("onScroll");
			//self.resetViewSize();
			self.methodInvoke('resetViewSize');
			self.unLockEvent("onScroll");

			/*检查文字是否超出边界*/
			self.setGridHeaderTextLimit();
			self.setGridBodyTextLimit(field);
			
			return changeWidth;
		},
		setForceFitColumn : function( field,w ){
			var self = this,
			opt = self.configs;	
			
			var column = self.getColumnData(field);
			if( opt.forceFit && column.forceFit ) {
				self.onFitColumn( field,w );
			}
		},
		onFitColumn : function( field,w ){
			var self = this,
			opt = self.configs;
			if( opt.forceFit ) {
				self.forceFitColumn( field,w );
				self.fireEvent("onAutoColumnResize",[opt]);
			}
		},
		/*
		* 列宽度只适应
		* fields {Array} 不需要自适应的列(可选)
		* _w {int} 当前fields改变后的宽度(可选)
		*/
		forceFitColumn : function( fields,_w ){//平均设置列宽大小，如果传入field则传入的filed 大小不会改变
			var self = this,
			opt = self.configs;	
			var columns = opt.columns;
			
			var fields = typeof fields == 'undefined' ? [] : fields;
			
			fields = $.isArray( fields ) ? fields : [ fields ];
			
			var scrollbarSize = self.getScrollbarSize();
			
			$("#view2-datagrid-body-"+opt.id).css("overflow-x","hidden");
			
			var header = $("#view2-datagrid-header-"+opt.id);
			var w = header._outerWidth();
			
			var body = $("#view2-datagrid-body-"+opt.id);
			var sh = body.get(0).scrollHeight;
			var sw = body.get(0).scrollWidth;
			if( sh > body._outerHeight() ) {
				w -= scrollbarSize.width;
			//} else if( sw > body.outerWidth() ){
				//w -= scrollbarSize.height;	
			} else {
				w -= 0;	
			}
			
			var _clw = {};
			var _mw = {};//获取最小宽度
			var _wt = 0;//总宽
			var border = 0;
			//获取每个列宽
			$("#view2-datagrid-header-inner-htable-tbody-"+opt.id).find(">tr.datagrid-header-row td[field]").each(function(){	
				var tw = $(this)._outerWidth();
				var field = $(this).attr('field');
				if( !border ) {
					border = $(this)._outerWidth() - $(this)._width();	
				}
				for( var x=0;x<columns.length;x++ ) {
					if( columns[x]['field'] == field && self.inArray( field,opt.hideColumns )==-1 ) {
						if( columns[x]['forceFit'] && self.inArray( field,fields )==-1 ) {
							_clw[ field ] = tw;
							_mw[ field ] = columns[x]['minWidth'];
							_wt += tw;
						} else {
							w -= tw;	
						}
						break;
					}
				}
			});
			var dw = 0;//超出宽度
			for( var f in _clw ) {
				_clw[f] =  (w*Math.floor( _clw[f]*10000/_wt )/10000) - border;	//Number(_clw[f]).toFixed(0);
				
				if( _clw[f] < _mw[f] ) {
					dw += (_mw[f]-_clw[f]);
				}
				self._setFieldWidth(f,_clw[f]);
			}
			if( dw && fields.length==1 ) {
				self._setFieldWidth(fields[0]['field'],_w-dw);	
			}

			self.fireEvent("onForceFitColumn",[opt]);
			return self;
		},
		unForceFitColumn : function(){
			var self = this,
			opt = self.configs;	
			opt.forceFit = false;
			$("#view2-datagrid-body-"+opt.id).css("overflow-x","auto");
		},
		_columnsMap : function( columns ){
			var self = this
				,undef
				,opt = self.configs
				,columns = columns === undef ? opt.columns : columns
			;
			var fields = columns;
			var list = [];
			
			/*递归遍历*/
			var listMap = function( column,pid ){
				
				if( pid === undef || pid === null ) {
					  pid = null;	
				} else {
					pid = $.isPlainObject( pid ) && (pid.field !== undef) ? pid.field : null;
				}
				//设置默认值
				column = $.extend({},opt._columnMetaData,column);
				
				if( column.disabled===true  ) return;
				
				opt._columnsHash['nsort'+column.field] = column;
				column.__pid = column.__pid===undef ?  pid : column.__pid;
				
				if( ('columns' in column) && $.isArray( column.columns ) && column.columns.length ) {
					var ls = column.columns;
					for( var i=0;i<ls.length;i++ ) {
						listMap( ls[i],column );	
					}
				} else {
					//console.log( column.field );
					list.push( column );	
				}
			}
			var i = 0,
				len = fields.length;
			for(;i<len;i++) {
				listMap( fields[i],null );
			}	
			
			return list;
		},
		addColumn : function( column ){
			var self = this,
			opt = self.configs;
			opt.columns.push( column );
			self._initFieldWidth();
			self.setGridHeader();
			self.refreshDataCache();
			return self;
		},
		/*
		* 获取当前grid的列信息
		* s {boolean} true:返回源数据,false:返回经过处理后的数据 默认(可选)
		*/
		getColumns : function(s){
			var self = this,
			opt = self.configs;
			var xcolumns = opt.columns;
			//console.log(xcolumns,xcolumns.length);
			var s = self._undef(s,false);
			//初始调用时保存副本
			opt.cacheData['columns'] = self._undef(opt.cacheData['columns'],xcolumns);//cacheData
			//获取副本
			if(s) {
				return 	opt.cacheData['columns'];
			}
			
			//检测是否设置了 列 否则用data的key作为列名
			if(xcolumns.length<=0) {
				if(opt.data.length>0) {
					
					if( $.isPlainObject( opt.data[0] ) ) {
					
						for(var i in opt.data[0]) {
							xcolumns.push({'field':i});
						}
					}
				}
			}
			
			//对多级列进行处理 初次用时有效
			var columns = self._columnsMap(xcolumns);
			
			//var _columns = [];
			var _hasSetCk = false,
				_hasSetEd = false;
			var i = 0,
				len = columns.length;
			for(;i<len;i++) {
				
				//columns[i] = $.extend({},opt._columnMetaData,columns[i]);
				
				if( columns[i]['disabled'] === true ) continue;
				
				//if(typeof columns[i]['width'] == 'number') columns[i]['width'] += 'px';
				columns[i]['field'] = columns[i]['field'] === "" ?  i : columns[i]['field'];
				columns[i]['title'] = columns[i]['title'] === "" ?  columns[i]['field'] : columns[i]['title'];
				columns[i]['index'] = columns[i]['index'] === "" ?  columns[i]['field'] : columns[i]['index'];
				
				//判断是否开启ck ed字段
				if( opt.checkBox !== false && columns[i]['field']=="ck" && _hasSetCk===false ) {
					columns[i] = self.getCheckBoxColumn();
					_hasSetCk = true;
				}
				if( opt.editColumn !== false  && columns[i]['field']=="ed" && _hasSetEd===false ) {
					columns[i] = self.geteditColumn();
					_hasSetEd = true;
				}
				
				//opt._columnsHash[ columns[i]['field'] ] = columns[i];
				//_columns.push(columns[i]);
			}
			
			//columns = _columns;
			
			//检测是否使用checkbox
			var ck = [],
				ed = [];
			if( opt.checkBox !== false && _hasSetCk===false ) {
				var copt = self.getCheckBoxColumn();
				if( copt !== false) {
					ck = [ copt ];
					opt._columnsHash[ 'nsort'+copt['field'] ] = copt;
					//$.merge(ck,columns);
					columns = ck.concat( columns );
					//columns = ck;
				}
			}
			
			if( opt.editColumn !== false && _hasSetEd===false) {
				if(self.geteditColumn() !== false) {
					ed = [ self.geteditColumn() ];
					opt._columnsHash[ 'nsort'+ed[0]['field'] ] = ed[0];
					//$.merge(columns,ed);
					columns = columns.concat( ed );
				}
			}
			//opt.columns.length = 0;
			opt.columns = columns;
			
			return opt.columns;
		},
		//页面刷新的时候调用
		onDisplayField : function(){
			var self = this,
				opt = self.configs,
				_columns = opt.hideColumns,
				gid = opt.gid;
			if(_columns.length <= 0) return;
			var i = 0,
				len = _columns.length;
			for(;i<len;i++) {
				if( _columns[i] == null ) continue;
				self.hideColumn(_columns[i]);
			}
		},
		displayColumn : function( field , type ) {
			
			var self = this,
				opt = self.configs,
				_columns = opt.hideColumns,
				gid = opt.gid;
			var fields = self.getColumnList();

			
			if( self.inArray(field,fields) == -1 ) return false;
			
			var isDisplay = (type == "show") ? true : false;
			if( isDisplay  ) { //&& self.inArray( field,_columns )
				var i = 0,
				len = _columns.length;
				for(;i<len;i++) {
					if(_columns[i] == field) _columns[i] = null;
				}
			} else {
				if( self.inArray( field,_columns ) == -1 )
					_columns.push( field );
			}
			$(gid).find("td[field='"+field+"']")[type]();
			
			var eventType = isDisplay ? 'onShowColumn' : 'onHideColumn';

			self.fireEvent(eventType,[field,opt]);

			self.methodInvoke('resetViewSize');
			
			return true;
		},
		/*
		* 显示指定列
		*  field {String} 列名
		*/
		showColumn : function( field ){
			var self = this;
			var r = self.fireEvent('onBeforeShowColumn',[field,opt]);
			if( r === false ) {
				return r;	
			}
			return self.displayColumn( field ,"show");
		},
		/*
		* 隐藏指定列
		*  field {String} 列名
		*/
		hideColumn : function( field ){
			var self = this;
			var r = self.fireEvent('onBeforeHideColumn',[field,opt]);
			if( r === false ) {
				return r;	
			}
			return self.displayColumn( field , "hide");
		},
		/*
		* 对指定列排序
		*  field {String} 列名
		*/
		sortColumn : function(field){},
		/*
		* 显示列头
		*/
		showHeader : function(){
			var self = this,
				opt = self.configs;
				opt.showHeader = true;
			//self.resetViewSize();
			self.methodInvoke('resetViewSize');
		},
		/*
		* 隐藏列头
		*/
		hideHeader : function(){
			var self = this,
				opt = self.configs;
				opt.showHeader = false;
			//self.resetViewSize();
			self.methodInvoke('resetViewSize');
		},
		setGridHeaderEvent : function(tr,ltr){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
				
			var fields = self.getColumnMap();	
			//设置列 是否可以改变大小 参数
			if(opt.fitColumns) {
				var o = $.extend({},opt);
				o.self = self;
				o.stop = function(e,cfg){
					var r = self.fireEvent('onResizeColumnStop',[cfg,opt]);
					if(r === false) return r;
					
					self.cStop(cfg);
				};
				
			}
			
			var tds = tr.find("td[field]").each(function(){
				
				var field = $(this).attr("field");
				//设置列是否可改变大小
				if(opt.fitColumns) {
					
					var fitColumn = self.getColumnData(field,'fitColumn');
					
					if( fitColumn ) {
						$(".datagrid-cell",this)._resize(o);
					}	
				}
				/*//设置列是否可排序
				var sortable = self.getColumnData(field,'sortable');
				if( sortable ) {
					self.sortColumn(field);	
				} else {
					$("div.datagrid-cell >.datagrid-sort-icon",this).hide();
				}
				//设置默认排序列
				if( opt.sortName && opt.sortName == field ) {
					$("div.datagrid-cell",this).addClass('datagrid-sort-'+opt.sortOrder.toLowerCase());	
				}*/
			
			});
			//拖动列
			if( opt.moveColumns ) {
				tds.moveColumn(opt);//tr.find("td[field]").moveColumn(opt)
			}
			
			tds.bind("click",function(e){
									  
				var field = $(this).attr("field");
				if( opt.autoScrollToField ) {
					self.scrollToField(field);	
				}
				var r = self.fireEvent('onColumnClick',[field,this,e]);
				if( r === false ) return r;
			});
			
			tds.bind({
				mouseenter : function(e){
					var field = $(this).attr("field");
					$(this).addClass("datagrid-header-over");
					var r = self.fireEvent('onColumnOver',[field,this,e]);	
					if( r === false ) return r;
				},	
				mouseleave : function(e){
					var field = $(this).attr("field");
					$(this).removeClass("datagrid-header-over");
					var r = self.fireEvent('onColumnOut',[field,this,e]);	
					if( r === false ) return r;
				},	
				dblclick : function(e){
					var field = $(this).attr("field");
					var r = self.fireEvent('onColumnDblClick',[field,this,e]);	
					if( r === false ) return r;
				},
				contextmenu : function(e){
					var field = $(this).attr("field");
					var r = self.fireEvent('onColumnContextMenu',[field,this,e]);	
					if( r === false ) return r;
				}
			});
			//设置contentmenu
			tr.bind("contextmenu",function(ev){
				//触发单击行事件
				var r = self.fireEvent('onHeaderContextMenu',[this,ev]);
				if(r == false) return false;
			});
			/*检查文字是否超出边界*/
			self.setGridHeaderTextLimit();
			/*checkbox绑定*/
			if(opt.checkBox) {
				var cks = tr.find("td[field='ck']");
				//cks.find(".datagrid-sort-icon").hide();
				cks.find("input:checkbox").click(function(){
						if(opt.singleSelect) {
							this.checked = false;
							return false;
						}
						if(this.checked) {
							self.selectAllRows();
						} else {
							self.unselectAllRows();
						}
					});
			}
			
			self.fireEvent("onSetGridHeaderEvent",[tr,tds,opt]);
			
		},
		/*检查文字是否超出边界*/
		setGridHeaderTextLimit : function(){},
		updateHeaderRow : function(w){
			var self = this,
				opt = self.configs;
			var w = self._undef( w,false );
			self.setGridHeader();
			if( w ) {
				self.onInitFieldWidth();
			}
			self.fireEvent("onUpdateHeaderRow",[opt]);
		},
		/*
		*多表头实现
		*/
		view2_header_inner_row : function( data ){ 
			var self = this
				,undef
				,opt = self.configs;
			var hlist = [];
			var hhash = {};
			
			if( !opt.multiColumns ) {
				return self.tpl('view2_header_inner_row_bak',data);	
			}
			
			//更新_columnsHash
			//self._columnsMap();
			var columns = opt._columnsHash;
			/*
			 *最终单元格模版
			*/
			var tdTpl = '<td field="<%=field%>" align="<%=align%>">'
							+'<div class="datagrid-header-wrap" field="<%=field%>" >'
								+'<div class="datagrid-cell datagrid-cell-<%=field%> datagrid-cell-header-<%=field%> <%=hcls%>" >'
									+'<span><%=title%></span>'
								+'</div>'
							+'</div>'
						+'</td>';
			var getTopParent = function(name){
				var name = 'nsort'+name;
				if( name in columns ) {
					var column = columns[name];
					if( column.__pid !== null ) {
						return getTopParent( column.__pid );	
					} else {
						return column;	
					}	
				}	
			}			
			var sortColumns = function( columns ){
				return columns;	
			}
			var getRoot = function(){
				var list = [];
				for( var key in columns ) {
					var field = columns[key];	
					if( field.__pid === null || field.__pid===undef ) {
						list.push( field );
					}	
				}	
				return list;	
			}
			var getChildrens = function(name){
				var list = [];
				if( name === undef || name === null ) {
					return sortColumns(getRoot());	
				}
				for( var key in columns ) {
					var field = columns[key];	
					if( field.__pid === name ) {
						list.push( field );
					}		
				}		
				return sortColumns(list);
			}
			var isRoot = function(field){
				return field.__pid === null || 	field.__pid===undef ? true : false;
			}
			var isLeaf = function( name ){
				var list = getChildrens( name );
				return list.length ? false : true;
			}
			
			var getTD = function( field ){
				var name = field.field;
				var fieldText = field.title === undef ? field.field : field.title ;
				field.title = fieldText;
				if( isLeaf( name ) ) {
					return self.tpl( tdTpl,field );
				} else {
					var childs = getChildrens( name );
					var itd = ['<td class="datagrid-noborder" valign="bottom">'];
					itd.push('<table cellpadding="0" cellspacing="0" style="height:100%;">');
						itd.push('<tr class="datagrid-header-middle-row">');
							itd.push('<td colspan="'+childs.length+'" class="datagrid-td-noborder" align="center">'+fieldText+'</td>');
						itd.push('</tr>');
						itd.push('<tr>');
							for( var i=0;i<childs.length;i++ ) {
								itd.push( getTD( childs[i] ) );	
							}
						itd.push('</tr>');
					itd.push('</table>');
					itd.push('</td>');
					return itd.join('');
				}
			}
			
			/*
			* 排列顺序，但是只曾对顶成field有效，
			*/
			var fields = self.getColumnMap();//getColumnMap 是 相当于直接使用opt.columns 只是封装接口而已
			var _flist = {};
			for( var t=0;t<fields.length;t++ ) {
				var tf = getTopParent( fields[t]['field'] );
				if( tf === undef ) continue;
				_flist[ tf.field+'_mf_nsort' ] = tf;
			}
			var mfields = [];
			for( var k in _flist ) {
				mfields.push( _flist[k] )	
			}
			//直接调用getChildrens会有顺序问题
			//var fields = getChildrens(null);
			
			var tds = ['<tr class="datagrid-header-row">'];
			for( var i=0;i<mfields.length;i++ ) {
				var field = mfields[i];
				var td = getTD( field );
				tds.push(td);
			}
			tds.push('</tr>');
			
			return tds.join('');
		},
		/*
		* 重新设置列头 当前会执行2次 待检查
		*/
		setGridHeader : function(){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			//console.log('^^2',opt.columns);
			//var fields = opt.columns;
			var fields = self.getColumns();
			//self.C('columns',fields);
			//console.log('^^22',fields);
			var view1_header_row = self.getTpl("view1_header_inner_row");
			var view2_header_row = opt.headerTpl ? opt.headerTpl : self.getTpl("view2_header_inner_row");
			
			var $view2_header_inner_wraper = $("#datagrid-view2-header-inner-wraper-"+opt.id);
			var $view1_header_inner_wraper = $("#datagrid-view1-header-inner-wraper-"+opt.id);
			var $view2_header_outer_wraper = $("#datagrid-view2-header-outer-wraper-"+opt.id);
			var $view1_header_outer_wraper = $("#datagrid-view1-header-outer-wraper-"+opt.id);
			
			//datagrid-header-inner-wraper
			var view1_header_inner_wraper = ['<table class="datagrid-htable" id="view1-datagrid-header-inner-htable-'+opt.id+'" border="0" cellspacing="0" cellpadding="0"><tbody id="view1-datagrid-header-inner-htable-tbody-'+opt.id+'">'];
			var view2_header_inner_wraper = ['<table class="datagrid-htable" id="view2-datagrid-header-inner-htable-'+opt.id+'" border="0" cellspacing="0" cellpadding="0"><tbody id="view2-datagrid-header-inner-htable-tbody-'+opt.id+'">'];
			//datagrid-header-outer-wraper
			var view1_header_outer_wraper = ['<table class="datagrid-locktable" id="view1-datagrid-header-outer-locktable-'+opt.id+'" border="0" cellspacing="0" cellpadding="0"><tbody id="view1-datagrid-header-outer-locktable-tbody-'+opt.id+'"></tbody></table>'];
			var view2_header_outer_wraper = ['<table class="datagrid-locktable" id="view2-datagrid-header-outer-locktable-'+opt.id+'" border="0" cellspacing="0" cellpadding="0"><tbody id="view2-datagrid-header-outer-locktable-tbody-'+opt.id+'"></tbody></table>'];
			
			var ltr = self.tpl(view1_header_row,opt);
			var tr = self.tpl(view2_header_row,{'fields':fields,opt:opt});
			//console.log('xx2.3',opt.columns)
			view1_header_inner_wraper.push(ltr);
			view2_header_inner_wraper.push(tr);
			
			view1_header_inner_wraper.push('</tbody></table>');
			view2_header_inner_wraper.push('</tbody></table>');
			
			$view1_header_inner_wraper.html( view1_header_inner_wraper.join("") );
			$view2_header_inner_wraper.html( view2_header_inner_wraper.join("") );
			$view1_header_outer_wraper.html( view1_header_outer_wraper.join("") );
			$view2_header_outer_wraper.html( view2_header_outer_wraper.join("") );
			
			ltr = $("> tr.datagrid-header-row",'#view1-datagrid-header-inner-htable-tbody-'+opt.id);
			tr = $("> tr.datagrid-header-row",'#view2-datagrid-header-inner-htable-tbody-'+opt.id);
			
			self.setGridHeaderEvent(tr,ltr);
			
			self.methodCall('setGridHeader');
			
			self.fireEvent('onHeaderCreate',[tr,ltr,opt]);
			
			return true;
		},
		onHeaderCreate : function(){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			if( !opt.headerTpl ) return -1;
			var fields = opt.columns;	
			var headerBody = $("#view2-datagrid-header-inner-htable-tbody-"+opt.id);
			var _columns = [];
			var _thex = dataGrid.getToGridOptions();
			//jquery 1.4.4出现不能寻找tr下多级th td问题
			headerBody.find("td[field],th[field],td["+_thex.options_from+"],th["+_thex.options_from+"]").each(function(i){
				var field = $(this).attr("field");
				var _d = $(this).attr(_thex.options_from);
				if( _d ) {
					_d = eval("({"+_d+"})")	
				} else {
					_d = {};	
				}
				if(!field) {
					field = _d.field ?  _d.field : 'field_'+Nex.aid++;
				}
				
				var _d2 = {};
				_d2.title = $(this).html();
				if( _d2.title === '' ) {
					_d2 = {};	
				}
				
				var _d3 = {};
				var j = 0,
				len = fields.length;
				for(;j<len;j++) {
					if( fields[j]['field'] == field ) {
						_d3 = fields[j];
						break;
					}
				}
				if( $.isEmptyObject( _d3 ) ) {
					_d3.field = field;
				}
				
				var _d4 = $.extend(true,{},_d3,_d,_d2);
				
				_d4.align = _d4.align ? _d4.align : ($(this).attr("align") ? $(this).attr("align") : opt._columnMetaData.align);
				_d4.hcls = _d4.hcls ? _d4.hcls : opt._columnMetaData.hcls;
				_d4.title = _d4.title === '' ? _d4.field : _d4.title;
				_d4.width = _d4.width ? _d4.width : $(this)._width();

				var $this = this;
				
				if( $(this).is("th") ) {
					$this = $('<td field="'+_d4.field+'" align="'+_d4.align+'"></td>');
					$(this).replaceWith($this);
				} else {
					$(this).attr("field",_d4.field);
					$(this).attr("align",_d4.align);
				}
				
				$($this).html('<div class="datagrid-header-wrap" field="'+_d4.field+'"><div class="datagrid-cell datagrid-cell-'+_d4.field+' datagrid-cell-header-'+_d4.field+' '+_d4.hcls+'" ><span>'+_d4.title+'</span></div></div>');//style="width:'+parseFloat(_d4.width)+'px"
				
				_columns.push(_d4);
				
			});
			opt.columns = _columns;
			//添加系统必要的参数
			headerBody.find(">tr").addClass('datagrid-header-row');
			
			self.getColumns();
			//因为自定义header可能会不设置列信息，所以需要重新设置列宽，但是这个会给设置htpl的 带来每次刷新的问题,以下是解决判断
			opt._headerTpl = self._undef( opt._headerTpl,'' );
			if( opt._headerTpl != opt.headerTpl ) {
				self.onInitFieldWidth();
			}
			
			return headerBody.find(">tr");
		},
		/*
		* 同setColumnData,不同在于不会触发事件和刷新表格
		*/
		setColumnValue : function(field,key,value){
			var self = this;
			var fields = self.getColumns();
			var i = 0,
				len = fields.length;
			for(;i<len;i++) {
				if(fields[i]['field'] == field) {
					fields[i][key] = value;
					continue;
				}	
			}
		},
		cStop : function(cfg){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var glist = $(gid).find("td[field='"+cfg.field+"']:first").find("div.datagrid-cell");
			
			if(!glist.size()) return;
			
			var w = parseFloat(glist._width());
			
			w = w + cfg.offsetX;
			
			w += opt.padding;//真实宽度
			
			var w = self.setFieldWidth( cfg.field,w );
			
			//self.setColumnValue(cfg.field,'width',w);//可省略

			self.fireEvent("onAfterResize",[cfg.field,w,cfg]);
		},
		//当行的宽度改变时 group row的大小也要随之改变
		//setGroupRowSize : function(){},
		//changeExpandPos : function(){},
		//当行的宽度改变时expand row的大小也要随之改变
		//setExpandRowSize : function(){},
		//resetExpandRowHeight : function(rid){},
		isRowHidden : function(rowId) {
			var self = this,
				opt = self.configs,
				gid = opt.gid;
				if(rowId === undefined) return true;
				return ($("#"+opt.id+"-row-"+rowId).size() && !$("#"+opt.id+"-row-"+rowId).is(":hidden") ) ? false : true;
		},
		_selectDefRows : function(){
			var self = this,
				opt = self.configs;
			var rows = opt.selectRows;
			//因为开启lazyLoadRows时 默认被锁的行是在_selectDefRows调用后才生成，而当前事件绑定没有绑定最后执行事件的功能.
			//只能通过计时器来实现
			setTimeout(function(){
				for( var i=0;i<rows.length;i++ ) {
					self.selectRow(rows[i]);	
					if( opt.singleSelect ) break;
				}						
			},0);
		},
		//destroyExpandRow : function(rowId){},
		//updateExpandRow : function(rowId,html){},
		/*
		* 选择所有行
		*/
		selectAllRows : function(){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			//var e = opt.events;	
			if(opt.singleSelect) return self; //singleSelect 模式下无效
			//var r = e.onSelectAll.call(self);
			var r = self.fireEvent('onSelectAll',[opt]);
			if(r === false) return self;
			if( opt.lazyLoadRow ) {
				self._clearSelectRows();
				var i = 0,
					len = opt.data.length;
				for(;i<len;i++) {
					opt._selectRows[i] = true;	
				}
			}
			$(">tr.datagrid-row",$("#view2-datagrid-header-outer-locktable-tbody-"+opt.id)).each(function(idx){
				self.selectRow($(this).attr("datagrid-rid"));									
			});
			$(">tr.datagrid-row",$("#view2-datagrid-body-btable-tbody-"+opt.id)).each(function(idx){
				self.selectRow($(this).attr("datagrid-rid"));									
			});

			return self;
		},
		/*
		* 取消选择所有行
		*/
		unselectAllRows : function(){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var e = opt.events;	
			//var r = e.onUnSelectAll.call(self);
			var r = self.fireEvent('onUnselectAll',[opt]);
			if(r === false) return self;
			
			$(">tr.datagrid-row",$("#view2-datagrid-header-outer-locktable-tbody-"+opt.id)).each(function(idx){
				self.unselectRow($(this).attr("datagrid-rid"));									
			});
			$(">tr.datagrid-row",$("#view2-datagrid-body-btable-tbody-"+opt.id)).each(function(idx){
				self.unselectRow($(this).attr("datagrid-rid"));									
			});
			
			self._clearSelectRows();
			return self;
		},
		_clearSelectRows : function(){
			var self = this,
				opt = self.configs;
			opt._selectRows = {};
		},
		/*
		* 选择指定行
		*/
		selectRow : function(rowId){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var e = opt.events;	
			var render = gid;
			var rowId = typeof rowId === 'undefined' ? false : rowId;
			if(rowId === false) return self;

			var rowData = self.getRowData(rowId);

			var obj1 = $("#"+opt.id+"-row-"+rowId);
			var obj2 = $("#"+opt.id+"-view1-row-"+rowId);
			var obj = $(obj1).add(obj2);

			if( !obj.size() ) {
				var r = self.fireEvent('onSelect',[obj,rowId,rowData,opt]);
				if(r === false) return r;	
			} else {
				if( obj1.hasClass(opt.clsSelectRow) ) {
					return self;	
				}	
				var r = self.fireEvent('onSelect',[obj,rowId,rowData,opt]);
				if(r === false) return r;
			}		

			opt._selectRows[rowId] = true;	
			
			if( obj.size() ) {
				obj1.addClass(opt.clsSelectRow);
				obj2.addClass(opt.clsSelectRow);
			}
			
			if( opt.checkBox && obj.size() ){
				var ck = obj.find("td[field='ck'] .datagrid-cell-check input:checkbox");

				if(ck.length)
					ck.get(0).checked = true;
			}
			
			if( opt.singleSelect) {
				//var selects = opt.selectRows;
				var selects = self.getSlectRows();
				var _dr = [];
				for(var si=0;si<selects.length;si++){
					if(selects[si] == rowId) continue;
					_dr.push( selects[si] );
				}
				for(var si=0;si<_dr.length;si++){
					self.unselectRow(_dr[si]);
				}	
				
				self._clearSelectRows();
				opt._selectRows[rowId] = true;	
			}
			return self;
		},
		/*
		* 取消选择指定行
		*/
		unselectRow : function(rowId){
			var self = this,
				opt = self.configs,
				gid = opt.gid;

			var rowId = typeof rowId === 'undefined' ? false : rowId;
			if(rowId === false) return self;
			var rowData = self.getRowData(rowId);

			var obj1 = $("#"+opt.id+"-row-"+rowId);
			var obj2 = $("#"+opt.id+"-view1-row-"+rowId);
			var obj = $(obj1).add(obj2);
			
			if( !obj.size() ) {
				var r = self.fireEvent('onUnselect',[obj,rowId,rowData,opt]);
				if(r === false) return r;	
			} else {
				if( !obj1.hasClass(opt.clsSelectRow) ) {
					return self;	
				}	
				var r = self.fireEvent('onUnselect',[obj,rowId,rowData,opt]);
				if(r === false) return r;
			}		
			
			opt._selectRows[rowId] = false;
			
			if( obj.size() ) {
				obj1.removeClass(opt.clsSelectRow);
				obj2.removeClass(opt.clsSelectRow);
			}
			//obj.find("td[field='ck'] .datagrid-cell-check input:checkbox").get(0).checked = false;
			if( opt.checkBox && obj.size() ){
				var ck = obj.find("td[field='ck'] .datagrid-cell-check input:checkbox");

				if(ck.length)
					ck.get(0).checked = false;
			}
			return self;
		},
		//showGroup : function(groupId,type){},
		//hideGroup : function(groupId){},
		//addGroupRow : function(isFirst){},
		//setGroupEvent : function(){},
		//对数据按指定的grouplist字段分类，并重新设置configs的data数据，途中会修改configs的 groupBy  groupList
		//groupByField : function(field,data,groupList){},
		//searchData : function(text,field,async,data){},
		//_refresh true 则 清除查询结果并刷新表格; false 不刷新表格
		//clearSearch : function( _refresh ){},
		onOverRow : function(tr,rowId){
			var self = this,
				opt = self.configs,
				gid = opt.gid;	
			if( opt.clsOverRow ) {
				$("#"+opt.id+"-view1-row-"+rowId).addClass(opt.clsOverRow);
				$(tr).addClass(opt.clsOverRow);
			}
		},
		onOutRow : function(tr,rowId){
			var self = this,
				opt = self.configs,
				gid = opt.gid;	
			if( opt.clsOverRow ) {	
				$("#"+opt.id+"-view1-row-"+rowId).removeClass(opt.clsOverRow);
				$(tr).removeClass(opt.clsOverRow);
			}
		},
		setGridBodyTextLimit : function(field,data){},
		bindRowEvent : function( tr,ltr ){
			var self = this,
				opt = self.configs,
				data = opt.data,
				gid = opt.gid;
				
			if( typeof tr === "undefined" ) {
				tr = false;	
			}
			if( typeof ltr === "undefined" ) {
				ltr = false;	
			}
			var fields = opt.columns;
			
			var tr_events = {
				'click' : function(ev){
					var rowId = $(this).attr("datagrid-rid");
					var rowData = self.getRowData(rowId);
					//自动显示当前行隐藏部分
					if( opt.autoScrollToRow ) {
						self.scrollToRow(rowId);	
					}
					//触发单元格事件
					var cr = self.cellEvents(rowId,ev);
					if(cr === false) return false;
					
					var r = self.fireEvent('onClickRow',[this,rowId,rowData,ev]);
					if(r === false) return false;
					//触发行 是否选择事件
					var isSelect = $(this).hasClass(opt.clsSelectRow);
					var selects = self.getSlectRows();
					if( isSelect ) {
						if(opt.singleSelect) {
							if(selects.length==1 && selects[0] != rowId) {
								self.unselectRow(rowId);	
							}
						} else {
							self.unselectRow(rowId);
						}
					} else {
						self.selectRow(rowId);
					}
					
				},
				'mouseenter' : function(e){
					var rowId = $(this).attr("datagrid-rid");	
					var rowData = self.getRowData(rowId);
					//触发单元格事件
					var cr = self.cellEvents(rowId,rowData,e);	
					if(cr === false) return false;
					
					self.fireEvent("onMouseEnter",[this,rowId,rowData,e]);	
				},
				'mouseover' : function(e){//mouseenter
					var rowId = $(this).attr("datagrid-rid");	
					var rowData = self.getRowData(rowId);
					//触发单元格事件
					var cr = self.cellEvents(rowId,rowData,e);	
					if(cr === false) return false;
					
					self.fireEvent("onOverRow",[this,rowId,rowData,e]);
				},
				'mouseleave' : function(e){
					var rowId = $(this).attr("datagrid-rid");	
					var rowData = self.getRowData(rowId);
					//触发单元格事件
					var cr = self.cellEvents(rowId,e);	
					if(cr === false) return false;
					
					self.fireEvent("onMouseLeave",[this,rowId,rowData,e]);	
				},
				'mouseout' : function(e){//mouseleave
					var rowId = $(this).attr("datagrid-rid");	
					var rowData = self.getRowData(rowId);
					//触发单元格事件
					var cr = self.cellEvents(rowId,e);	
					if(cr === false) return false;
					
					self.fireEvent("onOutRow",[this,rowId,rowData,e]);
				},
				'dblclick' : function(e){
					var rowId = $(this).attr("datagrid-rid");
					var rowData = self.getRowData(rowId);

					//触发单元格事件
					var cr = self.cellEvents(rowId,e);
					if(cr === false) return false;
					
					var r = self.fireEvent('onDblClickRow',[this,rowId,rowData,e]);
					if(r == false) return false;
				},
				'contextmenu' : function(e){
					var rowId = $(this).attr("datagrid-rid");
					var rowData = self.getRowData(rowId);
					
					//触发单元格事件
					var cr = self.cellEvents(rowId,e);
					if(cr === false) return false;
					
					var r = self.fireEvent('onRowContextMenu',[this,rowId,rowData,e]);
					if(r == false) return false;
				}
			};
			
			if(tr) {
				tr.bind(tr_events);
				tr.each(function(){
					var tr = $(this);
					var rowId = $(this).attr("datagrid-rid");
					var rowData = self.getRowData(rowId);
					//行回调
					if( $.isFunction(opt.rowCallBack) && opt.rowCallBack != $.noop ) {
						opt.rowCallBack.call(self,tr,rowId,rowData);
					}
					if( opt.rowStyler ) {
						if( $.isFunction(opt.rowStyler) ) {
							var rstyle = opt.rowStyler.call(self,tr,rowId,rowData);
							if( typeof rstyle == 'string' ) {
								tr.addClass(rstyle);	
							}
						} else if( typeof opt.rowStyler == 'string' ) {
							tr.addClass(opt.rowStyler);	
						}	
					}
					//单元格回调
					var field = [];
					var j = 0,
						len = fields.length;
					for(;j<len;j++) {
						field = fields[j];
						if( !$.isFunction(field['callBack']) || field['callBack'] == opt.noop ) {
							//是否有单元格回调
							continue;	
						}
						
						var t = $("#"+opt.id+'_'+field["field"]+'_row_'+rowId+'_cell');
						field['callBack'].call(self,t,rowId,field,rowData);
					}
					
					//检测文字是否超出
					self.setGridBodyTextLimit(tr,rowData);
					
				});
			}
			
			if( ltr ) {
				
					var ltr_events = {
					'click' : function(e){
						var rowId = $(this).attr("datagrid-rid");
						var rowData = self.getRowData(rowId);
						var rid = rowId;
						
						var target = e.srcElement ? e.srcElement : e.target;
						
						//触发单元格事件
						var cr = self.cellEvents(rowId,e);	
						if(cr === false) return false;	
						//var tr = $("#"+opt.id+"-row-"+rowId).get(0);
						self.fireEvent('onClickRowNumber',[this,rid,rowData,e]);
						if( opt.rowNumbers2Row !== false ) {
							//self.selectRow(rid);
							$("#"+opt.id+"-row-"+rid).trigger('click');
						}
					},
					'mouseover' : function(e){
						var rowId = $(this).attr("datagrid-rid");
						var rowData = self.getRowData(rowId);
						//触发单元格事件
						var cr = self.cellEvents(rowId,e);	
						if(cr === false) return false;	
						var tr = $("#"+opt.id+"-row-"+rowId).get(0);
						self.fireEvent("onOverRow",[tr,rowId,rowData,e])
						
					},
					'mouseout' : function(e){
						
						var rowId = $(this).attr("datagrid-rid");
						var rowData = self.getRowData(rowId);
						//触发单元格事件
						var cr = self.cellEvents(rowId,e);	
						if(cr === false) return false;	
						var tr = $("#"+opt.id+"-row-"+rowId).get(0);
						self.fireEvent("onOutRow",[tr,rowId,rowData,e]);
					},
					'dblclick' : function(e){
						var rowId = $(this).attr("datagrid-rid");
						var rid = rowId;
						//触发单元格事件
						var cr = self.cellEvents(rowId,e);	
						if(cr === false) return false;	
						if( opt.rowNumbers2Row !== false ) {
							$("#"+opt.id+"-row-"+rid).trigger('dblclick');
						}
						
					},
					'contextmenu' : function(ev){
					}
				};
				//view1 行事件绑定
				ltr.bind(ltr_events);
			}
			self.fireEvent("onSetRowEvent",[tr,ltr,opt]);
		},
		isCell : function(o){
			
			if( !$(o).length )
				return false;
			
			//检测是否rowNumber
			if( $(o).is('td') && $(o).hasClass('datagrid-td-rownumber') ) {
				return false;
			}	
			if( $(o).is('tr') && $(o).hasClass('datagrid-row') ) {
				return false;	
			}
			//检测是否有datagrid-cell
			if( !$(o).hasClass("datagrid-cell") ) {
				var cell = $(o).closest("tr.datagrid-row div.datagrid-cell");	
				if( !cell.length ) {
					return false;
				}
			}
			
			return true;
		},
		cellEvents : function(rowId,e) {
			var self = this,
				opt = self.configs;
			var target = e.srcElement ? e.srcElement : e.target;
			
			//检测当前是否对象是否单元格
			if( !self.isCell(target) ) {
				return true;	
			}
			
			var cell = $(target);
			
			var field = cell.parent("td").attr("field");

			var value = self.getFieldValue(rowId,field);
			
			var r = true;
			
			switch( e.type ) {
				case 'click' :
					//自动显示当前行隐藏部分
					if( opt.autoScrollToField ) {
						self.scrollToField(field);	
					}
				
					r = self.fireEvent('onClickCell',[cell.eq(0),rowId,field,value,e]);
					break;
				case 'dblclick' :
					r = self.fireEvent('onDblClickCell',[cell.eq(0),rowId,field,value,e]);
					break;
				case 'mouseenter' : //case 'mouseenter' : 
					r = self.fireEvent('onMouseEnterCell',[cell.eq(0),rowId,field,value,e]);
					break;
				case 'mouseover' : //case 'mouseenter' : 
					r = self.fireEvent('onOverCell',[cell.eq(0),rowId,field,value,e]);
					break;
				case 'mouseleave' :
					r = self.fireEvent('onMouseLeaveCell',[cell.eq(0),rowId,field,value,e]);
					break;
				case 'mouseout' :
					r = self.fireEvent('onOutCell',[cell.eq(0),rowId,field,value,e]);
					break;
				case 'contextmenu' :
					r = self.fireEvent('onCellContextMenu',[cell.eq(0),rowId,field,value,e]);
					break;
			}
			return r;
		},
		//checkToRow : function(rid){}, 
		/*
		* 动态添加一行数据
		*  @rid {int} 行id
		*  @d   {Object} 行数据(可选)
		*  @ai  {boolean} true:直接插入到最后 默认,false:会根据rid选择合适的位置插入(可选)
		*  @return {Object} 
		*/
		_insert : function(rid,d,ai){
			var self = this,
				opt = self.configs,
				data = opt.data,
				gid = opt.gid;
			var fields = opt.columns;
			
			var rid = self._undef(rid,0);
			//判断当前行是否已经存在
			var isExists = false;
			var _tr = $("#"+opt.id+"-row-"+rid);
			if( _tr.size() ){
				isExists = true;
			}

			var i = rid;
			
			var ai = self._undef(ai,true);
			var d = self._undef(d,{});
			
			var view1_row_tpl = self.getTpl("view1_row");
			var view2_row_tpl = opt.rowTpl ? opt.rowTpl : self.getTpl("view2_row");

			var view2_tbodyId = $("#view2-datagrid-body-btable-tbody-"+opt.id);
			var view1_tbodyId = $("#view1-datagrid-body-btable-tbody-"+opt.id);	
			
			var $theader2 = $("#view2-datagrid-body-btable-tbody-header-"+opt.id);
			var $theader1 = $("#view1-datagrid-body-btable-tbody-header-"+opt.id);
			var $tfooter2 = $("#view2-datagrid-body-btable-tbody-footer-"+opt.id);
			var $tfooter1 = $("#view1-datagrid-body-btable-tbody-footer-"+opt.id);
			
			if( !isExists ) {
				
				var _d = {
						i : i,
						id : opt.id,
						fields : fields	,
						rowNumbersExpand : opt.rowNumbersExpand,
						data : d,
						isCreate : opt.isCreate,
						//groupBy : opt.groupBy,
						rowNumbersWidth : opt.rowNumbersWidth,
						opt : opt
					};
				
				var tr = $(self.tpl(view2_row_tpl,_d));
				
				var ltr = false;

				ltr = $(self.tpl(view1_row_tpl,_d));
				
			} else {
				var tr = _tr;
				var ltr = false;
				ltr = $("#"+opt.id+"-view1-row-"+rid);
			}
			
			if( ai ) {
			
				$tfooter2.before( tr );
				if( ltr!==false ) {
					
					$tfooter1.before( ltr );
				}
			} else {
				
				var rows = $(">tr.datagrid-row","#view2-datagrid-body-btable-tbody-"+opt.id);
				var rids = [];
				rows.each(function(i,t){
					rids.push( Number($(t).attr("datagrid-rid")) );				   
				});
				rids.push(rid);
				rids.sort(function(a,b){
					return a>=b?1:-1; 
				});
				var index = self.inArray(rid,rids);
				if( !index ) {//第一行数据
					$theader2.after(tr);
					if( ltr!==false ) {
						$theader1.after(ltr);	
					}	
				} else {
					var prid = rids[index-1];
					$("#"+opt.id+"-row-"+prid).after(tr);
					if( ltr!==false ) {
						$("#"+opt.id+"-view1-row-"+prid).after(ltr);	
					}	
				}
				
			}
			
			if( opt.rowTpl ) {
				self.parseRowTpl(tr,rid,d);	
			}
			//绑定该行数据
			tr.data("rowData",d);
			
			self.fireEvent("onAfterAddRow",[rid,d,opt]);
			//self.resetViewSize();
			self.methodInvoke('resetViewSize');
			
			return {tr:tr,ltr:ltr,isNew:!isExists};
		},
		/*
		* 动态添加一行数据
		*  @d   {Object} 行数据(可选)
		*  @ai  {boolean} true:自动识别是否超过pageSize超过pageSize则不创建直接添加到数据集 默认,false:不识别pageSize,直接创建一行(可选)
		*  @return {int}  rid
		*/
		addRow : function(d,ai){
			var self = this,
				opt = self.configs,
				data = opt.data,
				gid = opt.gid;
			var fields = opt.columns;
			var rid = data.length;
			var i = rid;
			
			var ai = self._undef(ai,true);
			
			var d = self._undef(d,{});
			
			//本地
			if( self.getAsync() ) {
				data.push( d );
				var datas = self.getData();
				datas.push( d );
			} else {
				data.push( d );	
			}
			
			opt.total++;

			var pk = opt.pk;
			
			if( !d[pk] ) {
				d[pk] = self.unique();	
			}
			
			var r = self.fireEvent("onBeforeAddRow",[d,opt]);
			if( r === false ) {
				return false;	
			}
			
			self.fireEvent("onSuccessAddRow",[rid,d,opt]);
			
			if( ai && (rid >= opt.pageSize) ) {
				return true;	
			}

			var tr_row = self._insert(rid,d);
			if( tr_row.isNew ) {
				//行事件绑定
				if( opt.denyRowEvents === false ) {
					self.bindRowEvent(tr_row.tr,tr_row.ltr);
				} else if( $.isFunction(opt.denyRowEvents) ) {
					opt.denyRowEvents.call(self,tr_row.tr,tr_row.ltr);	
				}
			}
			
			return rid;
		},
		/*
		* 更新指定行和数据
		*  @rid   {int} 行id
		*  @d   {Object} 行数据(可选)
		*  @return {boolean}
		*/
		updateRow : function(rid,d){
			var self = this,
				opt = self.configs,
				data = opt.data,
				gid = opt.gid;	
				
			var d = self._undef(d,{});
			
			var r = self.fireEvent("onBeforeUpdateRow",[rid,d,opt]);
			if( r === false ) {
				return false;	
			}
			
			var fieldList = self.getColumnList();
			
			var editList = [];
			
			for(var f in d) {
				if( self.inArray(f,fieldList)!=-1 ) {
					var ed = self.setFieldValue(rid,f,d[f]);	
					if( ed !== false ) {
						editList.push(f);
					}
				}	
			}
			//editList:修改过的单元格
			self.fireEvent("onAfterUpdateRow",[rid,d,editList,opt]);
			return true;
		},
		/*
		* 删除指定行和数据
		*  @rid   {int} 行id
		*  @m   {boolean} true:删除行和数据 默认,false:删除行不删除数据(可选)
		*  @return {boolean} 
		*/
		deleteRow : function(rid,m){
			
			var self = this,
				opt = self.configs,
				data = opt.data,
				gid = opt.gid;
			var m = self._undef(m,true);	
			var r = self.fireEvent("onBeforeDeleteRow",[rid,opt]);
			if( r === false ) {
				return false;	
			}
			
			var tr = $("#"+opt.id+"-row-"+rid);
			/*if( !tr.size() ) {
				return false;	
			}*/
			
			var ltr = $("#"+opt.id+"-view1-row-"+rid);
			
			var data = tr.size() ? tr.data('rowData') : opt.data[rid,opt];
			if( !data ) return false;
			if( !data[opt.pk] ) {
				return false;	
			}
			
			if( m ) {
				for( var i=0;i<opt.data.length;i++ ) {
					if( opt.data[i][opt.pk] == data[opt.pk] ) {
						opt.data.splice(i,1);//删除	
						break;
					}	
				}
				if( self.getAsync() ) {
					var datas = self.getData();
					for( var i=0;i<datas.length;i++ ) {
						if( datas[i][opt.pk] == data[opt.pk] ) {
							datas.splice(i,1);//删除
							break;
						}	
					}
				}
				opt.total--;
			}
			
			tr.remove();
			ltr.remove();
			//self.destroyExpandRow(rid);
			
			self.fireEvent("onAfterDeleteRow",[rid,opt]);
			self.methodInvoke('resetViewSize');
			
			return true;
			
		},
		//解析用户自定义行
		parseRowTpl : function(tr,rid,d){
			var self = this,
				opt = self.configs,
				data = opt.data,
				gid = opt.gid;
			var fields = opt.columns;
			
			var i = rid,
				rowId = rid;
			
			var d = self._undef(d,false);
			
			if( !d ) {
				d = data[i] ? data[i] : {};
			}
			
			tr.find(">td,>th").each(function(f){
				var tdId = opt.id+'_'+fields[f]['field']+'_row_'+rowId+'_td';
				var cellId = opt.id+'_'+fields[f]['field']+'_row_'+rowId+'_cell';
				var $this = this;
				if( $(this).is("th") ) {
					$this = $("<td id='"+tdId+"' field='"+fields[f]['field']+"' align='"+fields[f]['align']+"'><div  id='"+cellId+"'  class='datagrid-cell datagrid-cell-"+fields[f]['field']+" ' >"+$(this).html()+"</div></td>");//style='width:"+fields[f]['width']+";'
					$(this).replaceWith( $this );
				} else {
					$(this).attr("field",fields[f]['field'])
						   .attr("align",fields[f]['align'])
						   .attr("id",tdId)
						   .html("<div  id='"+cellId+"' class='datagrid-cell datagrid-cell-"+fields[f]['field']+" ' >"+$(this).html()+"</div>");//style='width:"+fields[f]['width']+";'
				}						 
			});
			var modelTr = opt.stripeRows ? ((rid+1)%2 ? opt.clsSingleRow : opt.clsDoubleRow) : '';
			tr.addClass("datagrid-row "+modelTr)
			  .attr("id",opt.id+"-row-"+i)
			  .attr("datagrid-rid",i);
			if( typeof d["_groupid_"] != 'undefined') {
				tr.attr("datagrid-group-id",d["_groupid_"]);
			}
		},
		//行 生成
		setRow : function(n,_func){
			var self = this,
				opt = self.configs,
				data = opt.data,
				gid = opt.gid;
			var fields = opt.columns;
			
			var view1_row_tpl = self.getTpl("view1_row");
			var view2_row_tpl = opt.rowTpl ? opt.rowTpl : self.getTpl("view2_row");
			var _d = {};
			var view2_tbodyId = $("#view2-datagrid-body-"+opt.id);
			var view1_tbodyId = $("#view1-datagrid-body-"+opt.id);
			var _func = self._undef(_func,$.noop);
			var n = self._undef(n,0);
			
			var j = opt._lSize;
			var pos = 1;
			var rows_view1 = ['<table class="datagrid-btable" id="view1-datagrid-body-btable-'+opt.id+'" cellspacing="0" cellpadding="0" border="0"><tbody id="view1-datagrid-body-btable-tbody-'+opt.id+'"><tr class="datagrid-row-header" id="view1-datagrid-body-btable-tbody-header-'+opt.id+'" style="height:0px;"></tr>'];
			var rows_view2 = ['<table class="datagrid-btable" id="view2-datagrid-body-btable-'+opt.id+'" cellspacing="0" cellpadding="0" border="0"><tbody id="view2-datagrid-body-btable-tbody-'+opt.id+'"><tr class="datagrid-row-header" id="view2-datagrid-body-btable-tbody-header-'+opt.id+'" style="height:0px;"></tr>'];
			
			var rowIds = [];
			
			if(  !$.isArray(data) ) {
				data = [];	
			}
			var len = data.length;
			for(var i=n;i<len;i++){
				//只显示某部分数据
				if(j>0) {
					if(pos>j) {
						break;
					}
					pos++;
					opt._lStart = pos;
				}
				
				rowIds.push(i);
				
				_d = {
					i : i,
					id : opt.id,
					fields : fields	,
					rowNumbersExpand : opt.rowNumbersExpand,
					data : data[i],
					isCreate : opt.isCreate,
					//groupBy : opt.groupBy,
					rowNumbersWidth : opt.rowNumbersWidth,
					opt : opt
				};
				
				var tr = self.tpl(view2_row_tpl,_d);
				
				rows_view2.push(tr);
				
				var ltr = false;
				
				ltr = self.tpl(view1_row_tpl,_d);
				rows_view1.push(ltr);
				
			}
			
			rows_view2.push('<tr class="datagrid-row-footer" id="view2-datagrid-body-btable-tbody-footer-'+opt.id+'" style="height:0px;"></tr></tbody></table>');
			rows_view1.push('<tr class="datagrid-row-footer" id="view1-datagrid-body-btable-tbody-footer-'+opt.id+'" style="height:0px;"></tr></tbody></table>');
			
			view2_tbodyId.html(rows_view2.join(""));
			view1_tbodyId.html( rows_view1.join("") );
			
			var tr = false;
			var ltr = false;
			//如果自定义opt.rowTpl 那么就添加系统必要的元素
			if( opt.rowTpl ) {
				tr = $(">tr:not(.datagrid-row-header,.datagrid-row-footer)","#view2-datagrid-body-btable-tbody-"+opt.id);
				tr.each(function(t){
					var tr = $(this);
					var rowId = rowIds[t];
					var i = rowId;
					
					self.parseRowTpl(tr,rowId);
									 
				});
			} else {
				tr = $(">tr.datagrid-row","#view2-datagrid-body-btable-tbody-"+opt.id);	
			}

			tr.each(function(i){//2000 140ms
				var rid = $(this).attr("datagrid-rid"); 
				$(this).data("rowData",data[rid]);
			});
			
			ltr = $(">tr.datagrid-row","#view1-datagrid-body-btable-tbody-"+opt.id);
			
			if( opt.denyRowEvents === false ) {
				self.bindRowEvent(tr,ltr);
			} else if( $.isFunction(opt.denyRowEvents) ) {
				opt.denyRowEvents.call(self,tr,ltr);	
			}
			
			_func();
			
			self.afterGridShow();
			
		},
		//单元格内容映射检测
		_cellReader : function(val,maps,data){
			var self = this,
				opt = self.configs;	
			var val = self._undef(val,'');
			var maps = self._undef(maps,{});
			var data = self._undef(data,{});
			if( $.isFunction( maps ) ) {
				 return self.tpl( maps , val );	
			} else if( val in maps ) {
				return self.tpl(maps[val],data);	
			} else if( opt.readerDef in maps  ) {
				return self.tpl(maps[opt.readerDef],data);		
			}
			return val;
		},
		//模版函数
		view2_row : function(d){
			
			if( !d ) return "";
			var self = this,
				opt = self.configs,
				data = opt.data,
				gid = opt.gid;
			//var  group_id = ( typeof d.data["_groupid_"] != "undefined" )? "datagrid-group-id="+d.data["_groupid_"] : "";
			if( typeof d.data[opt.pk] == "undefined" ) {
				d.data[opt.pk] = self.unique();
			}
			
			var group_id = [];
			if( typeof d.data["_groupid_"] != "undefined" ) {
				group_id.push('datagrid-group-id=');
				group_id.push(d.data["_groupid_"]);
			}
			group_id = group_id.join("");
			//var modelTr = opt.stripeRows ? ((rid+1)%2 ? opt.clsSingleRow : opt.clsDoubleRow) : '';
			var modelTr = opt.stripeRows ? ((d.i+1)%2 ? opt.clsSingleRow : opt.clsDoubleRow) : '';
			//var tr = ['<tr id="'+d.id+'-row-'+d.i+'" '+group_id+' datagrid-rid="'+d.i+'" datagrid-row-select="0" class="datagrid-row '+modelTr+'">'];
			var tr = [];
			tr.push('<tr id="');
			tr.push(d.id);
			tr.push('-row-');
			tr.push(d.i);
			tr.push('" ');
			tr.push(group_id);
			tr.push(' datagrid-rid="');
			tr.push(d.i);
			tr.push('" class="datagrid-row ');
			tr.push(modelTr);
			tr.push('">');
			
			var j = 0,
				len = d.fields.length;
			for(;j<len;j++) {
				//var tdId = opt.id+'_'+d.fields[j]["field"]+'_row_'+d.i+'_td';
				var tdId = [];
				tdId.push(opt.id);
				tdId.push('_');
				tdId.push(d.fields[j]["field"]);
				tdId.push('_row_');
				tdId.push(d.i);
				tdId.push('_td');
				tdId = tdId.join("");
				
				//var cellId = opt.id+'_'+d.fields[j]["field"]+'_row_'+d.i+'_cell';
				var cellId = [];
				cellId.push(opt.id);
				cellId.push('_');
				cellId.push(d.fields[j]["field"]);
				cellId.push('_row_');
				cellId.push(d.i);
				cellId.push('_cell');
				cellId = cellId.join("");
				
				var field = d.fields[j]["field"];
				var index = d.fields[j]["index"];
				var _expand = d.fields[j]["_expand"] !== false ? opt.self.tpl(d.fields[j]["_expand"],d.data) : self._cellReader(d.data[index],d.fields[j]["reader"],d.data);//d.data[index]
				
				//tr.push('<td field="'+field+'" id="'+tdId+'" align="'+d.fields[j]["align"]+'">');
				tr.push('<td field="');
				tr.push(field);
				tr.push('" id="');
				tr.push(tdId);
				tr.push('" align="');
				tr.push(d.fields[j]["align"]);
				tr.push('">');
				
				//tr.push('<div id="'+cellId+'" class="datagrid-cell datagrid-cell-c1-'+field+' '+d.fields[j]["bcls"]+'" style="width:'+d.fields[j]["width"]+';" >'+_expand+'</div></td>');
				tr.push('<div id="');
				tr.push(cellId);
				tr.push('" class="datagrid-cell datagrid-cell-')
				tr.push(field);
				//tr.push(' datagrid-cell-c1-');
				//tr.push(field);
				tr.push(' ');
				tr.push(d.fields[j]["bcls"]);
				tr.push('" >');
				//tr.push('" style="width:');
				//tr.push(d.fields[j]["width"]);
				//tr.push(';" >');
				tr.push(_expand);
				tr.push('</div></td>');
			}
			tr.push('</tr>');
			
			return tr.join("");
		},
		//模版函数
		view1_row : function(d){
			if( !d ) return "";
			var self = this,
				opt = self.configs,
				data = opt.data,
				gid = opt.gid;
			//var  group_id = ( typeof d.data["_groupid_"] != "undefined" )? "datagrid-group-id="+d.data["_groupid_"] : "";
			var group_id = [];
			if( typeof d.data["_groupid_"] != "undefined" ) {
				group_id.push('datagrid-group-id=');
				group_id.push(d.data["_groupid_"]);
			}
			group_id = group_id.join("");
			
			var modelTr = ((d.i+1)%2 ? "datagrid-row-single" : "datagrid-row-double");
			//var tdId = opt.id+'_row_'+d.i+'_td_rownumber';
			var tdId = [];
				tdId.push(opt.id);
				tdId.push('_row_');
				tdId.push(d.i);
				tdId.push('_td_rownumber');
				tdId = tdId.join("");
			
			//var cellId = opt.id+'_row_'+d.i+'_cell_rownumber';
			var cellId = [];
				cellId.push(opt.id);
				cellId.push('_row_');
				cellId.push(d.i);
				cellId.push('_cell_rownumber');
				cellId = cellId.join("");
			
			//var tr = ['<tr id="'+d.id+'-view1-row-'+d.i+'" '+group_id+' datagrid-rid="'+d.i+'" datagrid-row-select="0" class="datagrid-row datagrid-row-view1 '+modelTr+'">'];
			var tr = [];
			tr.push('<tr id="');
			tr.push(d.id);
			tr.push('-view1-row-');
			tr.push(d.i);
			tr.push('" ');
			tr.push(group_id);
			tr.push(' datagrid-rid="');
			tr.push(d.i);
			tr.push('" class="datagrid-row datagrid-row-view1 ');
			tr.push(modelTr);
			tr.push('">');
			if( opt.rowNumbersWidth!==false ) {
				//tr.push('<td id="'+tdId+'" align="center" class="datagrid-td-rownumber"><div id="'+cellId+'" class="datagrid-cell-rownumber" style="width:'+parseFloat(d.rowNumbersWidth)+'px;">'+(d.rowNumbersExpand === false ? ++d.i : opt.self.tpl(d.rowNumbersExpand,d.data))+'</div></td>');//--
				tr.push('<td id="');
				tr.push(tdId);
				tr.push('" align="center" class="datagrid-td-rownumber"><div id="');
				tr.push(cellId);
				tr.push('" class="datagrid-cell-rownumber" style="width:');
				tr.push(parseFloat(d.rowNumbersWidth));
				tr.push('px;">');
				var _expand_Num = "";
				if( d.rowNumbersExpand === false ) {
					_expand_Num = (opt.pageNumber-1)*opt.pageSize + ( ++d.i );
				} else if( d.rowNumbersExpand == 'auto' ) {
					_expand_Num = ++d.i;
				} else if( $.isFunction( d.rowNumbersExpand ) ) {
					_expand_Num	= d.rowNumbersExpand.call(self,d.data);
				} else {
					_expand_Num = opt.self.tpl(d.rowNumbersExpand,d.data);	
				}
				//var _expand_Num = d.rowNumbersExpand === false ? ++d.i : opt.self.tpl(d.rowNumbersExpand,d.data);
				tr.push( _expand_Num );
				tr.push('</div></td>');
			}
			
			tr.push('</tr>');

			return tr.join("");
		},
		//该函数 需要用到加载lockrow or lockcolumn才有效
		resetHeader : function(){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			if( ('lockColumns' in opt) && opt.lockColumns.length) {
				var j = 0,
					len = opt.lockColumns.length;
				for(;j<len;j++) {
					if(opt.lockColumns[j] != null) {
						self.setGridHeader();
						return;
					}	
				}	
			}
			if( ('lockRows' in opt) && opt.lockRows.length) {
				var j = 0,
					len = opt.lockRows.length;
				for(;j<len;j++) {
					if(opt.lockRows[j] != null) {
						self.setGridHeader();
						return;
					}	
				}	
			}
		},
		_selectLazyRows : function(rid){
			var self = this,
				opt = self.configs;			
			if( opt.lazyLoadRow ) {
				var selectRows = self.getSlectRows();
				if( self.inArray( rid,selectRows ) != -1 ) {
					//self.denyEventInvoke('selectRow',[rid]);	
					self.selectRow(rid);
				}	
			}					
		},
		//已知bug:如果 加载一条虚拟行,即opt.data中不存在改条数据时,如果在大于第一页的情况下rowNumber实际会比rid 大 pageNumber*pageSize
		//可设置rowNumbersExpand = auto 来修正
		/*
		* 动态加载一行 类似_insert addRow
		*  @rid   {int} 行id
		*  @m   {boolean} 同_insert的@ai
		*  @return {boolean} 
		*/
		_loadRow : function( rid,m ){
			var self = this,
				opt = self.configs,
				data = opt.data;
			var len = opt.pageTotal || data.length;	
			//if( !len || !data[rid] ) return;
			if( !len ) return;
			
			var m = self._undef(m,true);
			var tr_row = self.denyEventInvoke('_insert',rid,data[rid],m);	

			if( tr_row.isNew ) {
				//行事件绑定
				if( opt.denyRowEvents === false ) {
					self.bindRowEvent(tr_row.tr,tr_row.ltr);
				} else if( $.isFunction(opt.denyRowEvents) ) {
					opt.denyRowEvents.call(self,tr_row.tr,tr_row.ltr);	
				}
				self.fireEvent("onLazyRowShow",[rid,tr_row,opt]);
			}
		},
		/*
		*刷新当前滚动条所在位置的行
		*/
		_loadRows : function(){
			
			var self = this,
				opt = self.configs,
				data = opt.data;
			var len = opt.pageTotal || data.length;
			
			if( !opt.lazyLoadRow || !len ) return;
			
			var vh = $("#view2-datagrid-body-"+opt.id)._height();
			//console.log(opt.sTop);
			opt.__vh = vh;
			
			var totalRow = (opt.lazyMaxRow ? opt.lazyMaxRow : Math.ceil(vh/opt._trHeight)) + opt.lazyTopRows + opt.lazyBottomRows;
			var start = Math.ceil(opt.sTop/opt._trHeight) - opt.lazyTopRows;
			start = start>0 ? start : 1;
			var end = totalRow + start;
			end = end<=len ? end : len;
			if( start >= len ) {
				end = len;	
				start = end - totalRow;
				start = start>0 ? start : 1;
			}
			
			var r = self.fireEvent("onBeforeLazyLoadRow",[start,end,totalRow,data,opt]);
			if( r === false ) return false;
			
			var vheader = (start-1)*opt._trHeight;
			var vfooter = (len-end)*opt._trHeight;
			
			$("#view2-datagrid-body-btable-tbody-header-"+opt.id).height(vheader);
			$("#view1-datagrid-body-btable-tbody-header-"+opt.id).height(vheader);
			
			$("#view2-datagrid-body-btable-tbody-footer-"+opt.id).height(vfooter);
			$("#view1-datagrid-body-btable-tbody-footer-"+opt.id).height(vfooter);
		
			self.lockMethod('resetViewSize');
			
			var _dr = [];
			
			//添加行时如果不把rid 加入lazyRows 则会出现新添加的行会删除不了问题
			$("#view2-datagrid-body-btable-tbody-"+opt.id).find(">tr.datagrid-row").each(function(i){
				var rid = $(this).attr("datagrid-rid");
				if( self.inArray( rid,opt.lazyRows ) == -1 ) {
					opt.lazyRows.push(rid);	
				}
			});
			
			for( var x=0;x<opt.lazyRows.length;x++ ) {
				
				if( opt.lazyRows[x]>=(start-1) && opt.lazyRows[x]<=(end-1) ) {
					continue;
				}
				var rid = opt.lazyRows[x];
				
				//if( self.inArray( rid,opt.lockRows )!=-1 ) continue;
				var lr = self.fireEvent("onBeforeLazyRowHide",[rid,opt]);
				if( lr === false ) {
					continue
				}
				
				self.denyEventInvoke('deleteRow',rid,false);
				
				self.fireEvent("onLazyRowHide",[rid,opt]);
				
				_dr.push(rid);
			}
			
			for( var _de=0;_de<_dr.length;_de++ ) {
				var drid = _dr[_de];
				var _ix = self.inArray( drid,opt.lazyRows );
				if( _ix != -1 ) {
					opt.lazyRows.splice(_ix,1);		
				}
			}

			var $lazyRows = opt.lazyRows;
			
			for(var i=start;i<=end;i++ ) {
				var rid = i-1;
				if( self.inArray( rid,$lazyRows ) != -1 ) {
					continue;	
				}
				//if( self.inArray( rid,opt.lockRows )!=-1 ) continue;
				var lr = self.fireEvent("onBeforeLazyRowShow",[rid,opt]);
				if( lr === false ) {
					continue
				}
				
				var tr_row = self.denyEventInvoke('_insert',rid,data[rid],false);	
				
				if( tr_row.isNew ) {
					//行事件绑定
					if( opt.denyRowEvents === false ) {
						self.bindRowEvent(tr_row.tr,tr_row.ltr);
					} else if( $.isFunction(opt.denyRowEvents) ) {
						opt.denyRowEvents.call(self,tr_row.tr,tr_row.ltr);	
					}
				}
				
				opt.lazyRows.push(rid);
						
				self.fireEvent("onLazyRowShow",[rid,tr_row,opt]);
				
			}
			
			opt.lazyRows.sort(function(a,b){
				return a>=b ? 1 : -1;						   
			});
			
			self.unLockMethod('resetViewSize');
			
		},
		/*
		* 刷新当前滚动条所在位置的行
		*  @m {boolean} true:强制刷新,false:不强制刷新 默认(可选)
		*/
		loadRows : function(m){
			var self = this,
				opt = self.configs;
			var len = opt.pageTotal || opt.data.length;

			if( !opt.lazyLoadRow ) return;
			
			var m = self._undef(m,false);
			
			var tq= opt._tq;
			if( tq ) {
				clearTimeout(tq);
			}

			var _func = function(){
				var initLazy = opt._initLazy;
				opt._initLazy = false;
				
				if( opt._trHeight<=0 ) {
					self.lockMethod('resetViewSize');
					self.denyEventInvoke('_insert',0,{},false);	
					opt._trHeight = $("#"+opt.id+"-row-0")._outerHeight();
					self.denyEventInvoke('deleteRow',0,false);
					self.unLockMethod('resetViewSize');
				}
				
				opt._hc = Math.min(opt.lazyBottomRows,opt.lazyTopRows) * opt._trHeight - opt._lazyEdge;
				
				var needLoad = false;
				if( !initLazy ) {
					if( Math.abs(opt.sTop-opt._csTop)<=opt._hc && !m  ) {
						return;	
					} else {
						//计算相差值 如果太多则显示loading
						opt.__vh = opt.__vh || $("#view2-datagrid-body-"+opt.id)._height();
						if( Math.abs(opt.sTop-opt._csTop)>= opt.__vh ) {
							needLoad = true;	
						}
						
						opt._csTop = opt.sTop;	
					}	
				} else {
					opt.lazyRows = [];
					opt._csTop = opt.sTop;
				}
				
				self.lockEvent('onScroll');
				if( (needLoad || initLazy) && opt.showLazyLoading ) {
					self.showLoading();	
				}
				setTimeout(function(){
									
					self._loadRows();
					
					if( (needLoad || initLazy) && opt.showLazyLoading ) {
						self.hideLoading();	
					}
					self.lockMethod('resetViewSize');
					self.fireEvent('onShowLazyRows',[opt.lazyRows,opt]);
					self.unLockMethod('resetViewSize');
					if( initLazy ) {
						//code
						self.afterGridShow(true);
					} else {
						self.onScroll(true);//必须	
					}
					self.unLockEvent('onScroll');
					
				},0);	
			};
			
			var t;
			t = setTimeout(function(){
				self.lockMethod('resetViewSize');
				self.fireEvent('onBeforeShowLazyRows',[opt]);
				self.unLockMethod('resetViewSize');
				_func();
			},50);
			opt._tq = t;
		},
		lazyLoadRow : function(){
			var self = this,
				opt = self.configs,
				data = opt.data;
			
			var len = opt.pageTotal || opt.data.length;
			
			var fields = opt.columns;
			
			var view2_tbodyId = $("#view2-datagrid-body-"+opt.id);
			var view1_tbodyId = $("#view1-datagrid-body-"+opt.id);
			
			var rows_view1 = ['<table class="datagrid-btable" id="view1-datagrid-body-btable-'+opt.id+'" cellspacing="0" cellpadding="0" border="0"><tbody id="view1-datagrid-body-btable-tbody-'+opt.id+'"><tr class="datagrid-row-header" id="view1-datagrid-body-btable-tbody-header-'+opt.id+'" style="height:0px;"></tr>'];
			var rows_view2 = ['<table class="datagrid-btable" id="view2-datagrid-body-btable-'+opt.id+'" cellspacing="0" cellpadding="0" border="0"><tbody id="view2-datagrid-body-btable-tbody-'+opt.id+'"><tr class="datagrid-row-header" id="view2-datagrid-body-btable-tbody-header-'+opt.id+'" style="height:0px;"></tr>'];
			
			if(  !$.isArray(data) ) {
				data = [];	
			}
			
			rows_view2.push('<tr class="datagrid-row-footer" id="view2-datagrid-body-btable-tbody-footer-'+opt.id+'" style="height:0px;"></tr></tbody></table>');
			rows_view1.push('<tr class="datagrid-row-footer" id="view1-datagrid-body-btable-tbody-footer-'+opt.id+'" style="height:0px;"></tr></tbody></table>');
			
			view2_tbodyId.html(rows_view2.join(""));
			view1_tbodyId.html( rows_view1.join("") );
			
			//取得行高
			if( opt._trHeight<=0 ) {
				self.lockMethod('resetViewSize');
				self.denyEventInvoke('_insert',0,{},false);	
				opt._trHeight = $("#"+opt.id+"-row-0")._outerHeight();
				self.denyEventInvoke('deleteRow',0,false);
				self.unLockMethod('resetViewSize');
			}
			var vh = opt._trHeight*len;
			
			$("#view2-datagrid-body-btable-tbody-header-"+opt.id).height( vh );
			$("#view1-datagrid-body-btable-tbody-header-"+opt.id).height( vh );
			
		},
		_clearBeforeShow : function(){
			var self = this,
				opt = self.configs;
			self._clearSelectRows();
		},
		setGridBody : function(render,func){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			//self.showLoading();	
			//刷新gridHeader 数据
			
			/*
			ajax 下 如果不设置columns则会出现列宽问题，解决方法:
			1.判断列是否手动设置
			2.如果没有则调用getColumns
			3.调用onInitFieldWidth
			已知BUG ,如果开启checkbox editcolumn 后，一定要手动设置columns
			*/
			var _sc = true;
			if( !opt.columns.length ) {
				_sc = false;
			}
			//console.log('^^3',opt.columns);
			self.getColumns();
			
			if( !_sc ) {
				self.setGridHeader();
				self.onInitFieldWidth();	
			}
			
			var func = func || $.noop;
			self._clearBeforeShow();
			var br = self.fireEvent('onBeforeShowGrid',[opt]);
			if( br === false ) {
				return false;	
			}
			
			if( opt.lazyLoadRow ) {
				opt._initLazy = true;
				
				var sLeft = opt.sLeft;
				var sTop = opt.sTop;
				//修正FF下 刷新grid 滚动条回到原点问题，修正chrome下水平滚动条回归原点
				self.one("onShowGrid.lazy",function(){
					opt.sLeft = sLeft;	
					opt.sTop = sTop;
				});

				self.lazyLoadRow();
				self.onViewSizeChange(false);
				self.fireEvent('onScroll',[]);
		
				self.hideLoading();
				return true;
			}
				
			//修正IE 下刷新白屏问题
			setTimeout(function(){
				
				var data = opt.data;
				//记录当前滚动条位置
				//self.setRow(0,func);//grid 生成
				var sLeft = opt.sLeft;
				var sTop = opt.sTop;
				
				self.onViewSizeChange(false);
				
				self.setRow(0,function(){
					func();	
					opt.sLeft = sLeft;
					opt.sTop = sTop;
				});
				
				self.hideLoading();
			},0);
			
			return true;
		},
		//setRow 结束后需要处理的问题
		afterGridShow : function(lazy){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			
			var lazy =  self._undef(lazy,false);	
			
			self.methodCall('setGridBody');
			
			self.lockMethod('resetViewSize');
			self.fireEvent('onShowGrid',[opt]);
			self.unLockMethod('resetViewSize');

			self.methodInvoke('resetViewSize');

			//是否初始加载
			self.onFinishDone = self.onFinishDone || false;
			if(!self.onFinishDone) {
				self.onFinishDone = true;
				self.fireEvent('onFinish',[opt]);
			}
			
		},
		removeEmptyDiv : function(){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			
			if( !opt.showEmptyGridMsg ) {
				return;	
			}
			
			var obj = $("#"+opt.id+"_empty-grid-msg");
			if( obj.size() ) {
				obj.remove();
			}
			return true;
		},
		isEmptyGrid : function(){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			
			if( !opt.showEmptyGridMsg ) {
				return;	
			}
			
			if( !opt.showHeader ) {
				$("#"+opt.id+"_empty-grid-msg").remove();	
			}

			if( opt.data.length>=1 || !opt.showHeader ) return;
			var w = $("#view2-datagrid-header-inner-htable-"+opt.id)._outerWidth();
			var vbody = $("#view2-datagrid-body-"+opt.id)
			var h = vbody._height();
			if( w>vbody._width() ) {
				var sbar = self.getScrollbarSize();
				h -= sbar.width;
			}
			var obj = $("#"+opt.id+"_empty-grid-msg");

			if( obj.size() ) {
				obj._outerWidth( w );
				obj._outerHeight( h );
				return;
			}
			//
			var dom = $('<div class="empty-grid-msg" id="'+opt.id+'_empty-grid-msg" style="height:100%;">'+self.tpl( opt.emptyGridMsg,opt )+'</div>');
			$("#view2-datagrid-body-"+opt.id).append( dom );
			dom._outerWidth( w );
			dom._outerHeight( h );
		},
		//footerCellEvents : function(rowId,e) {},
		//bindFooterRowEvent : function( tr,ltr ){},
		//解析用户自定义行
		//parseFooterTpl : function(tr,rid,d){},
		//模版函数
		//view2_footer_row : function(d){},
		//模版函数
		//view1_footer_row : function(d){},
		//showFooter : function(){},
		//hideFooter : function(){},
		//行 生成
		//setFooterRow : function(){},
		//updateFooterData : function( data ){},
		//updateFooterRow : function( data ){},
		//setGridFooter : function(){},
		addFooterItems : function(elem1,elem2){
			var self = this,
				opt = self.configs;
			var $footer2 = $("#view2-datagrid-footer-inner-"+opt.id);
			var $footer1 = $("#view1-datagrid-footer-inner-"+opt.id);
			$footer1.append(elem1);
			$footer2.append(elem2);
			self.methodInvoke('resetViewSize');
		},
		//未完成
		onScroll : function(auto){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var render = render || gid+" .datagrid-view2";
			var render1 = gid+" .datagrid-view1";
			auto = self._undef(auto,false);	
			if(auto) { // IE 下 300ms ++
				if( opt.sLeft>=0 )
					opt.gbody.scrollLeft(opt.sLeft);
				if( opt.sTop>=0 )
					opt.gbody.scrollTop(opt.sTop);
			}
			
			//if(!auto) {
				opt.sLeft = opt.gbody._scrollLeft();
				opt.sTop = opt.gbody._scrollTop();
			//}
			
			//$(render+" .datagrid-header .datagrid-header-inner .datagrid-header-inner-wraper")._scrollLeft( opt.sLeft );
			$("#datagrid-view2-header-inner-wraper-"+opt.id)._scrollLeft( opt.sLeft );
			//$(render+" .datagrid-header .datagrid-header-outer .datagrid-header-outer-wraper")._scrollLeft( opt.sLeft );
			$("#datagrid-view2-header-outer-wraper-"+opt.id)._scrollLeft( opt.sLeft );
			
			//footer
			$("#view2-datagrid-footer-inner-"+opt.id)._scrollLeft( opt.sLeft );
			
			//$(render1+" .datagrid-body")._scrollTop( opt.sTop );
			$("#view1-datagrid-body-"+opt.id)._scrollTop( opt.sTop );

		},
		onScrollBar : function(){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			
			//计算是否滚动到底
			var tbody = $("#view2-datagrid-body-"+opt.id);
			
			var sw = 0;
			
			if( tbody[0].scrollWidth>tbody._width() ) {
				sw = self.getScrollbarSize().width;	
			}
			
			var scrollHeight = tbody[0].scrollHeight;
			
			if( (opt.sTop + tbody.innerHeight() - sw)>=scrollHeight ) {
				self.fireEvent('onScrollEnd');
			}
		},
		//统一使用该函数来实现表格展示
		showGrid : function(successBack,errorBack,async){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var render = render || gid+" .datagrid-view2";
			
			var successBack = successBack || $.noop;
			var errorBack = errorBack || $.noop;
			var async = self._undef(async,false);	

			
			self.getGridData(function(){
				self.fireEvent('onGetData',[opt.data,opt]);
				successBack.apply(this,arguments);	
			},function(){
				errorBack.apply(this,arguments);
			},async);
		},
		/*
		* 刷新表格数据
		*/
		refreshData : function(){
			var e = this.configs.events;
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var render = render || gid+" .datagrid-view2";
			//e.onBeforeRefresh.call(self);	
			self.fireEvent('onBeforeRefresh',[opt]);
			self.showGrid(function(){
				self.setGridBody(render,function(){
					//e.onRefresh.call(self);	
					self.fireEvent('onRefresh',[opt]);
				});						  
			});
		},
		/*
		* 更新当前分页表格数据
		* @data {Array} 当前页数据集
		*/
		updateGrid : function(data){
			var self = this,
				opt = self.configs;
			self.setGridData(data,false,true);
		},
		/*
		* 更新grid表格数据
		* @data {Array} 数据集
		*/
		updateGridData : function(data){
			var self = this,
				opt = self.configs;
			self.setGridData(data,true,true);
		},
		/*
		* 刷新表格数据(无ajax刷新)
		*/
		refreshDataCache : function(){
			var self = this;
			self.setGridBody();
		},
		/*
		*设置行高
		*/
		setRowHeight : function(rid,height){
			var self = this,
				opt = self.configs;
			$("#"+opt.id+"-view1-row-"+rid)._outerHeight( height );	
			$("#"+opt.id+"-row-"+rid)._outerHeight( height );	
			var t = self._undef( opt.__srh,0 );
			if( t ) {
				clearTimeout(t);	
			}
			opt.__srh = setTimeout(function(){
				opt.__srh = 0;	
				self.lockEvent("onScroll");
				self.methodInvoke('resetViewSize');
				self.unLockEvent("onScroll");
			},t);
			return self;
		},
		clearCache : function(){
			var opt = this.configs;
			//缓存清除
			opt.views = [];//清空视图缓存
			opt.isCreate = false;//已经废弃
			this.onFinishDone = false;
			opt.isShow = false;
			opt.pki = 0;
		},
		clearDataCache : function(){
			var opt = this.configs;
			opt.cacheData = {};
			return this;
		},
		//重新生成grid 慎用 setAll是否重置所有数据 否则保留source columns
		reLoadGrid : function(cfg,setAll/*废弃*/){
			//var setAll = self._undef(setAll,false);
			this.clearCache();
			this.clearDataCache();
			var _d = [];
			if(cfg.data) {
				_d = cfg.data ;
				cfg.data = [];
			}
			var opt = $.extend(true,{},cfg);
			opt.data = _d;
			cfg.data = _d;
			dataGrid.call(this,opt);
		},
		width : function(width){
			var self = this;
			var opt = self.configs;
			self.resetGridSize(width,opt.height);
			return self;	
		},
		height : function(height){
			var self = this;
			var opt = self.configs;
			self.resetGridSize(opt.width,height);
			return self;		
		},
		initWH : function(w,h){
			var self = this,
				opt = self.C();
			opt.__width = w;
			opt.__height = h;
			self.setWH(w,h);
		},
		setWH : function(width,height){
			var self = this;
			self.resetGridSize(width,height);
			return self;
		},
		/*
		* @m      {boolean} true:强制更新,false:大小都没变化时不更新大小返回false 默认(可选)
		*/
		resize : function(m){
			var self = this;	
			var opt = self.configs;
			
			//var render = $(opt.renderTo);
			//var _body = $(document.body);
			//_body.addClass('nex-overflow-hidden');
			//render.addClass('nex-overflow-hidden');
			setTimeout(function(){
				self._setBodyOverflowHidden();		
				var size = self.getResizeWH();
				self.resetGridSize(size.width,size.height,m);		
				//_body.removeClass('nex-overflow-hidden');
				//render.removeClass('nex-overflow-hidden');
			},0);
			
		},
		createGrid : function(render){
			
			var self = this,
				opt = self.configs,
				gid = opt.gid;
				
			
			var render = render || gid+" .datagrid-view2";
			
			self.setGridHeader(render);
			//opt.gbody = self.setGridBody(render);//grid数据列表
			self.showGrid(function(){
				self.setGridBody(render);
			});

			self.methodCall('createGrid');
			return self;
		}, 
		//对数据进行排序,返回排序后的结果，不支持中文排序 可对没显示字段进行排序
		sortData : function(field,data,type) {},
		//数据管理 addData 添加表格数据 updateData更新表格数据 removeData删除表格数据
		//如果是opt.url 存在则发送数据到服务器
		//如果async = true的话 就所有操作都在本地进行
		//最好通过自己的函数向服务器添加数据然后调用refreshData 如果本地的话就无所谓
		onDataChange : function(data){
			var self = this,
				opt = self.configs;	
			self.refreshData();
		},
		addData : function(data){
			var self = this,
				opt = self.configs;
				
			var async = self.getAsync();
			
			var datas = self._undef( datas , [] );
			datas = $.isPlainObject(datas) ? [datas] : datas;
			
			var pk = opt.pk;
			//本地添加
			if( async ) {
				var _d = self.getData();
				var len = datas.length;
				for(var n=0;n<len;n++) {
					var data = datas[n];
					data[pk] = self._undef( data[pk] , self.unique() );
					_d.push(data);
				}
				self.fireEvent("onAdd",[datas,true]);
				self.fireEvent("onDataChange",self,[datas]);
			} else {
				//远程处理		
				self.fireEvent("onAjaxAdd",[datas,function(){self.onDataChange(datas);}]);
			}
		},
		updateData : function(datas){
			var self = this,
				opt = self.configs;
				
			var async = self.getAsync();
			
			var datas = self._undef( datas , [] );
			datas = $.isPlainObject(datas) ? [datas] : datas;
			var pk = opt.pk;
			var setPk = false;
			//本地更新
			if( async ) {
				var len = datas.length;
				for(var n=0;n<len;n++) {
					var data = datas[n];
					if( !$.isPlainObject(data)) continue;
					setPk = self._undef( data[pk] , false );
					if(setPk === false) {
						continue;
					}
					
					var _d = self.getData();
					var i = 0;
					var xdlen = _d.length;
					for(;i<xdlen;i++) {
						if(_d[i][pk] == data[pk]) {
							_d[i] = data;
							break;
						}	
					}
				}
				self.fireEvent("onUpdate",[datas,true]);
				self.fireEvent("onDataChange",[datas]);
			} else {
				//远程处理	
				self.fireEvent("onAjaxUpdate",[datas,function(){self.onDataChange(datas);}]);
			}
		},
		deleteData : function(datas){
			var self = this,
				opt = self.configs;
				
			var async = self.getAsync();
			
			var datas = self._undef( datas , [] );
			datas = $.isPlainObject(datas) ? [datas] : datas;
			var pk = opt.pk;
			var setPk = false;
			//本地删除
			if( async ) {
				var _d = self.getData();
				var len = datas.length;
				for(var n=0;n<len;n++) {
					var data = datas[n];
					if( !$.isPlainObject(data)) continue;
					setPk = self._undef( data[pk] , false );
					if(setPk === false) {
						continue;
					}
					var i = 0,
						len = _d.length;
					for(;i<len;i++) {
						if(_d[i][pk] == data[pk]) {
							break;
						}	
					}
					var j = 0;
					var __d = [];//删除后的新数据
					for(;j<len;j++) {
						if( i == j ) continue;
						__d.push(_d[j]);	
					}
					_d = __d;
				}
				//opt.cacheData['source'] = __d;
				
				self.fireEvent("onDelete",[datas,true]);
				self.fireEvent("onDataChange",[datas]);
			} else {
				//远程处理	
				self.fireEvent("onAjaxDelete",[datas,function(){self.onDataChange(datas);}]);
			}
		},
		//判断当前的操作是 服务器还是本地 true 表示本地操作
		getAsync : function(){
			var self = this,
				opt = self.configs,
				gid = opt.gid;	
			return (opt.url == "" || opt.url===false)  ? true : false;
		},
		/*
		* 更新grid表格数据
		* @data  {Array} 数据集
		* @async {Boolean} 当前数据获取模式 true:本地,false:远程服务器(可选)
		* @s     {Boolean} true:刷新表格,false:不刷新表格 默认(可选)
		*/
		setGridData : function(data , async , s){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			var data = self._undef(data,false);	
			if( !data ) return false;
			var async = self._undef(async,null);	
			var s = self._undef(s,false);	
			if(async == null) {
				async = self.getAsync();
			}
			
			if( async ) {
				opt.cacheData['source'] = data;
			} else {
				opt.data = data;	
			}
			//数据重置后 PK值也的重置
			if(opt.pk == '_pk') {
				self.fireEvent("onSetPk",[data]);
			}
			
			//数据源改变时调用
			if( s ) {
				if( async )
					self.showGrid(function(){
						self.setGridBody();							   
					},$.noop,true);	
				else 
					self.refreshDataCache();
			}
			return true;
		},
		page : function( i ){
			var self = this,
				opt = self.configs;
			var i = self._undef(i,1);	
			opt.pageNumber = parseInt( i ) <= 0 ? 1 :  parseInt( i );
			self.refreshData();
		},
		/*
		* ajax返回数据过滤函数,可通过参数或者已知函数声明eg : xmlFilter,htmlFilter
		*/
		jsonFilter : function(data){
			return data;	
		},
		/*
		* 设置ajax返回的数据
		* @json  {Array} 数据集
		* @s     {Boolean} true:刷新表格,false:不刷新表格 默认(可选)
		*/
		metaData : function( json,s ){
			var self = this,
				opt = self.configs;
			
			var data = json || {};
			var s = self._undef(s,false);	
			//data.rows = data.rows || [];
			/*if( data.footer ) {
				opt.footerData = data.footer;
			}*/
			if( $.isArray(data.footer) ) {
				opt.footerData = data.footer;
			} else if( $.isPlainObject( data.footer ) ) {
				opt.footerData = [ data.footer ];
			} else {
				opt.footerData = [];	
			}
			
			if( $.isArray(data.rows) ) {
				opt.data = data.rows;
			} else if( $.isPlainObject( data.rows ) ) {
				opt.data = [ data.rows ];
			} else {
				opt.data = [];	
			}
			//opt.data = data.rows;
			opt.total = data.total || opt.data.length;
			opt.pageSize = self.isNumber( data.pageSize ) ? data.pageSize : opt.pageSize;
			opt.pageNumber = self.isNumber( data.pageNumber ) ? data.pageNumber : opt.pageNumber;
			
			//检查是否返回了column
			if(data.columns) {
				opt.columns = data.columns;
				self.setGridHeader();
			}
			
			for( var c in data ) {
				if( self.inArray( c,['footer','rows','total','pageSize','pageNumber','columns'] ) == -1 ) {
					opt[c] = data[c];
				}	
			}
			
			if( s )
				self.refreshDataCache();
		},
		_loadSuccess : function(data,successBack){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
			
			var dataType = opt.dataType.toLowerCase();
			
			var filter = dataType+'Filter';
			
			var data = data;
			
			if( filter in opt ) {
				if( $.isFunction( opt[filter] ) ) {
					data = opt[filter].call(self,data);
				}
			} else if( filter in self ) {
				if( $.isFunction( self[filter] ) ) {
					data = self[filter].call(self,data);
				}	
			} else if( filter in window ) {
				if( $.isFunction( window[filter] ) ) {
					data = window[filter].call(window,data);
				}	
			}
						
			self.fireEvent('onLoadSuccess',[data,successBack,opt]);
			
			//json
			self.metaData(data);
		},
		_loadError : function(msg,errorBack,xmlHttp){
			var self = this,
				opt = self.configs,
				gid = opt.gid;
				
			var emsg = '<div class="datagrid-error-msg" title="'+xmlHttp.status+':'+xmlHttp.statusText+'">'+opt.loadErrorMsg+'</div>';
			
			self.showLoading(emsg);
			
			self.fireEvent('onLoadError',[emsg,msg,errorBack,xmlHttp,opt]);
			
			setTimeout(function(){
				self.hideLoading();	
				self.refreshDataCache();
			},opt.showErrorTime);
		},
		//获取ajax返回的data数据
		getGridData : function(successBack,errorBack,async){
			var self = this,
				undef,
				opt = self.configs,
				gid = opt.gid;
			
			var successBack = successBack || $.noop;
			var errorBack = errorBack || $.noop;
			
			var render = gid+" .datagrid-view2";
			
			var async = self._undef(async,false);	
			if(async == false) {
				async = self.getAsync();
			}
			
			//ajax部分
			opt.queryParams.pageNumber = opt.pageNumber;
			opt.queryParams.pageSize = opt.pageSize;
			
			self.methodCall('getGridData');
			var _xr = self.fireEvent('onGetGridData',[successBack,errorBack,async]);
			if( _xr === false ) return;
			
			if(async) {
				//本地数据都会存储到source 只有显示部分才会放到data里 远程数据就都放在data 不会存放到source
				opt.cacheData['source'] = opt.cacheData['source'] || opt.data;
				
				self.fireEvent('onSetPk', [opt.cacheData['source']]);
				
				/*if(opt.sortName != '') {
					opt.cacheData['source'] = self.sortData();		
				}*/
				
				opt.total = opt.cacheData['source'].length;
				
				var start = (opt.pageNumber-1) * opt.pageSize;
				var end = opt.pageSize * opt.pageNumber;
				end = end>opt.total ? opt.total : end;
				var data = [];
				for(var i = start;i<end;i++){
					if( opt.cacheData['source'][i] )
						data.push(opt.cacheData['source'][i]);
				}
				opt.data = data;
				successBack.call(self,render);
				
				return;	
			}
			
			//ajax部分
			//opt.queryParams.pageNumber = opt.pageNumber;
			//opt.queryParams.pageSize = opt.pageSize;
			/*if(opt.sortName != '') {
				//opt.queryParams.sortName = opt.sortName;
				opt.queryParams.sortName = self.getColumnData(opt.sortName,'index');
				opt.queryParams.sortOrder = opt.sortOrder;
			}*/
			//var e = self.configs.events;
			var beforeSend = function(){
						var r = self.fireEvent('onBeforeLoad',[opt.queryParams,opt]);
						if( r === false ) return false;
						self.showLoading();	
					};
			var success = function(data){
				
						self._loadSuccess(data,successBack);
						
						self.fireEvent('onSetPk', [opt.data]);
						
						successBack.call(self);
						
					};
			var error = function(xmlHttp){
						//e.onLoadError.call(self,xmlHttp.responseText);
						var xmlHttp = $.isPlainObject( xmlHttp ) ? xmlHttp : {responseText:xmlHttp};
						
						self._loadError(xmlHttp.responseText,errorBack,xmlHttp);
						
						errorBack.call(self,xmlHttp.responseText);
					};
			if( $.isFunction( opt.url ) ) {
				
				var _r = beforeSend();
				
				if( _r === false ) return;
				
				var rdata = opt.url.call(self,opt.queryParams,success,error);
				if( rdata !== undef ) {
					success( rdata );	
				}
				
			} else {
				var ajaxOptions = {
					url : opt.url,
					type : opt.method,
					cache : opt.cache,
					dataType : opt.dataType,
					data : opt.queryParams,
					beforeSend : beforeSend,
					success : success,
					error : error
				};
				self.fireEvent('onBeforeCreateAjax',[ajaxOptions,opt]);
				self.ajaxSend(ajaxOptions);	
			}
			
		},
		ajaxSend : function(ajaxOptions){
			var self = this;
			var opt = self.configs;
			if( $.isFunction( opt.ajaxSend ) ) {
				opt.ajaxSend.call( self,ajaxOptions )	;
			} else {
				$.ajax(ajaxOptions);
			}
		},
		setPk : function(data) {//data 必须是数组 这里是引用
			var self = this;
			var opt = self.configs;
			if(opt.pk != '_pk') return;
			//opt.pki = 1;
			$.each(data,function(i,n){
				var aid = Nex.aid++;
				data[i][opt.pk] = aid;//opt.pki++;			 
			});
		},
		show : function (){
			var self = this;
			var opt = self.configs;
			var views = opt.views;
			var container = $("#"+opt.id);
			//防止重复调用
			if(opt.isShow) {
				return;	
			}
			opt.isShow = true;
			
			var r = self.fireEvent('onBeforeShowContainer',[views]);
			if( r === false ) return;
			
			for(var i in views) {
				container.append( views[i] );	
			}
			
			self._setGridWH();
			
			self.setView();// 显示grid的容器
			self.fireEvent("onViewCreate",[]);
			
			self.createGrid();//gird数据显示开始...
			
			self.methodCall('show');
			self.fireEvent('onShowContainer',[views]);
		}
	});
	
	$.fn._scrollLeft=function(_10){
		if(_10==undefined){
			return this.scrollLeft();
	
		}else{
			return this.each(function(){
				//$(this)._scrollLeft(_10);			  
				$(this).css("marginLeft",_10*-1);
			});
		}
	};
		
	$.fn._scrollTop=function(_10){
		if(_10==undefined){
			return this.scrollTop();
		}else{
			return this.each(function(){
				//$(this).scrollTop(_10);
				$(this).css("marginTop",_10*-1);
			});
		}
	};
	
	$.fn.grid = function(_opt){
		if(this.size()<=0){
			//alert('容器不正确');
			return false;
		}
		var list = [],_opt=_opt||{};
		var _d = [];
		if( _opt.data ) {
			_d = _opt.data;
			_opt.data = [];
		}
		
		this.each(function(i){
			var self = $(this);
			
			if( self.data('datagrid') ) {
				list.push(self.data('datagrid'));
				return; 	
			}
			
			var u = {};
			
			if( self.attr('data-options') ) {
				u = eval("({"+self.attr('data-options')+"})");	
			}
			
			var opt = $.extend(true,u,_opt);
			
			opt.selector = self.selector;
			opt.renderTo = self;
			
			
			//opt.width = dataGrid._undef(opt.width,self.width());
			//opt.height = dataGrid._undef(opt.height,self.height());
			
			if( _opt.data ) {
				opt.data = _d;
			}
			
			self.data('metaData',opt);	
			
			var grid = new dataGrid(opt);
			
			self.data('datagrid',grid);	
			
			list.push(grid);
		});
		
		if( this.size() == 1 ) {
			return this.data('datagrid');
		} else {
			return list	;
		}
	};
	$.fn.datagrid = $.fn.datagrid || $.fn.grid;
	$.fn.dataGrid = $.fn.dataGrid || $.fn.grid;
	$.fn.extGrid = $.fn.grid;
	$.fn.extgrid = $.fn.grid;
	$.fn.nexGrid = $.fn.grid;
	$.fn.nexgrid = $.fn.grid;
	//迁移到togrid.js
	$.fn.togrid = function(cfg,_cfg){};
	$.fn.toGrid = $.fn.togrid;
	//resizeable
	$.fn._resize = function(opt){
		var opt = opt || {};
		var opt = $.extend({},opt);
		
		var self = this;
		function start(e,opt) {
			$(document.body).css("cursor", "col-resize");
			//$(document.body).css("-moz-user-select", "none");
			//$(document.body).attr("unselectable", "on");
			opt.gheader.find(".datagrid-header-inner").css("cursor", "col-resize");
			opt.gheader.find("div.datagrid-cell").css("cursor", "col-resize");
			
			var line = $("<div class='datagrid-resize'></div>");
			var render = "#view_"+opt.id;
			$(render).append(line);
			var left = $(this).offset().left - $(render).offset().left;
			var height = $(render).height();
			var width = $(this).width();
			left = parseFloat(left)+parseFloat(width);
			line.css({
				position:'absolute',
				'top':0,
				'zIndex':9999,
				'height':parseFloat(height),
				'left':left
			});
			opt.line = line;
			opt.x = e.clientX;
			opt.left = left;
			
			opt.offsetX = 0;
			
			$(document.body).bind("selectstart._resize", function(e){
				return false;
			});
			
			$(document).bind("mousemove._resize", function(e){
				//var r = opt.events.onResizeColumn(e,opt);
				var r = opt.self.fireEvent('onResizeColumn',[opt,e]);
				if(r === false) return;
				resize(e,opt);
			});
			$(document).bind("mouseup._resize", function(e){
				var r = opt.stop(e,opt);
				//if(r === false) return;
				stop(e,opt);
			});
		}
		function resize(e,opt){
			
			var x = e.clientX;
			var left = opt.left + (x - opt.x);
			opt.offsetX = (x - opt.x);
			opt.line.css({
				'left':left
			});
		}
		function stop(e,opt){
			//opt.self.resizing = false;
			var render = "#view_"+opt.id;
			$(document).unbind("mousemove._resize");
			$(document).unbind("mouseup._resize");
			
			$(document.body).unbind("selectstart._resize");
			
			$(document.body).css("cursor",'default');
			//$(document.body).removeAttr("unselectable");
			
			opt.gheader.find(".datagrid-header-inner").css("cursor", "default");
			opt.gheader.find("div.datagrid-cell").css("cursor", "default");
			
			$(opt.line).remove();
		}
		self.each(function(idx){
			$("<div class='datagrid_resize'></div>")
				.appendTo($(this).parent())
				.bind("mousedown",function(e){
					//opt.self.resizing = true;
					opt.field = $(this).parent().attr("field");
					//var r = opt.events.onResizeColumnStart.call(this,e,opt);
					var r = opt.self.fireEvent('onResizeColumnStart',[this,opt,e]);
					if(r === false) return;
					start.call(this,e,opt);
					e.preventDefault();
					e.stopPropagation();
				});
		});
	};
	$.fn.moveColumn = function(opt) {
		var columns = this;
		var moving = false;
		columns.bind("mousedown.move",function(e){
			var self = this;
			var _t = setTimeout(function(){
				start.call(self,e);
				$(document.body).unbind("mousemove.wt");
			},opt.moveColumnTm);
			$(document.body).bind("mouseup.wt",function(e){
				clearTimeout(_t);
				$(document.body).unbind("mouseup.wt");
				$(document.body).unbind("mousemove.wt");
				$(document.body).unbind("selectstart.wt");
			});	
			$(this).one("mouseout.wt",function(e){
				  clearTimeout(_t);
			});		
			/*setTimeout(function(){
				$(document.body).bind("mousemove.wt",function(e){
					clearTimeout(_t);
					$(document.body).unbind("mousemove.wt");
				});		
			},0);*/
			
			$(document.body).bind("selectstart.wt", function(e){
				return false;
			});//代替e.preventDefault();
			//e.preventDefault();
			//e.stopPropagation();
		});
		columns.bind("mousemove.h",function(e){
			if(moving == false) return;
			var p = $("#"+opt.id).offset();
			var pt = p.top;
			var pl = p.left;
			
			var w = $(this).outerWidth();
			var h = $(this).height() - 2;
			
			var wt = $(this).offset().top - pt;
			var w1 = $(this).offset().left - pl - 2;
			
			var w2 = e.pageX;
			var w3 = w2 - $(this).offset().left;
			
			opt.moveToField = $(this).attr("field");

			
			if( w3<=w/2 ) {
				$("#"+opt.id+"_line").css({
					left : w1,
					top : wt,
					height : h
				});
			opt.moveToFieldPos = 1;
				//console.log("前面");
			} else {
				$("#"+opt.id+"_line").css({
					left : w1 + w,
					top : wt,
					height : h
				});
			opt.moveToFieldPos = 0;
				//console.log("后面");
			}
		});
		function start(e) {
			moving = true;
			opt.moveField = $(this).attr("field");
			
			var _r = opt.self.fireEvent("onBeforeColumnMove",[opt.moveField,opt]);
			if(_r === false) {
				return _r;	
			}
			
			var _target = $('<div class="column-move" id="'+opt.id+'_move" style="position:absolute;z-index:9999;">'+$(".datagrid-cell",this).html()+'</div>').appendTo("#"+opt.id);
			var line = $('<div class="column-move-line" id="'+opt.id+'_line" style="position:absolute;height:'+$(this).outerHeight()+'px;"></div>').appendTo("#"+opt.id);
			var pos = $("#"+opt.id).offset();
			_target.css({
				left : e.pageX - pos.left + 10,
				top : e.pageY- pos.top + 10
			 });
			$(document.body).bind("mousemove.move",function(e){
			 	 _target.css({
					left : e.pageX - pos.left + 10,
					top : e.pageY- pos.top + 10
				 });
				 
				//e.preventDefault();
				//e.stopPropagation();
				
				var r = opt.self.fireEvent("onColumnMoving",[_target,opt.moveField,opt.moveToField,opt]);
				if(r === false) {
					opt.moveToField = opt.moveField;
					return;	
				}
				
			});	
			$(document.body).bind("mouseup.move",function(e){
				moving = false;
				_target.remove();
				line.remove();
				$(document.body).unbind("mousemove.move mouseup.move");
				//opt.self.fireEvent("onColumnMove",[]);
				opt.self.moveColumn()
				//e.preventDefault();
				//e.stopPropagation();
			});
		}
	};
})(jQuery);