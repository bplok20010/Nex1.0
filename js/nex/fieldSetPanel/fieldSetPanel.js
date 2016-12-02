/*
author:nobo
fieldSet
*/
;(function($,window){
	var fieldSetPanel = Nex.extend('fieldSetPanel','panel');
	fieldSetPanel.setOptions(function(){
		return {
			title : "查询输入控件面板",
			hideHeader : true,
			autoScroll : true,
			cls : 'nex-fieldset-panel',
			padding : 5
		};	
	});
	fieldSetPanel.fn.extend({
		setContainerSize : function(w,h){
			var self = this;
			var opt = self.configs;	
			var render = $(opt.renderTo);
			var container = opt.views['container'];
			
			var size = self.getResizeWH();
			
			opt.width = w || size.width;
			opt.height = h || size.height;
			
			var wh = self.checkSize( opt.width,opt.height );
			opt.width = wh.width;
			opt.height = wh.height;
			
			//container._outerWidth(opt.width);
			//container._outerHeight(opt.height);
			return self;
		},
		resetViewSize : function(){
			var self = this,
				opt=this.configs,
				undef;
			var bd = opt.views['body'];
			//bd._outerWidth(opt.width-opt.diffW);
			//bd._outerHeight(opt.height-opt.diffH);
			
			//self.fireEvent('onViewSizeChange',[ opt ]);
		},
		setFieldSetEvent : function(){
			var self = this;
			var opt = self.configs;	
			var bd = opt.views['body'];
			var legend = $('#'+opt.id+'_legend .nex-legend-icon');
			$('#'+opt.id+'_legend').bind({
				"click" : function(e){
					if( self.isAnim ) return;
					var isCollapse = bd.hasClass('legend-close');
					if( !isCollapse ) {
						self.isAnim = true;
						bd._height = bd._outerHeight();
						bd.stop().animate({height:0},500,function(){
							self.isAnim = false;
							bd.addClass('legend-close')	;
							legend.removeClass('fieldset-legend-collapse fieldset-legend-expand').addClass('fieldset-legend-expand');
						});
					} else {
						self.isAnim = true;
						bd.stop().animate({height:bd._height},500,function(){
							self.isAnim = false;
							bd.removeClass('legend-close')	;
							bd._outerHeight( bd._height );
							legend.removeClass('fieldset-legend-collapse fieldset-legend-expand').addClass('fieldset-legend-collapse');
						});
					}
				}	
			});
		},
		setBody : function(){
			var self = this;
			var opt = self.configs;	
			var container = opt.views['container'];
			var bd = '<fieldset class="nex-fieldset" id="'+opt.id+'_fieldset">'
					 	+'<legend class="nex-fieldset-legend" id="'+opt.id+'_legend">'
							+'<div class="nex-legend-inner" style="">'
								+'<span class="nex-legend-text" style="">'+opt.title+'</span><span class="nex-legend-icon fieldset-legend-collapse"></span>'
							+'</div>'
						+'</legend>'
						+'<div id="'+opt.id+'_body" class="nex-panel-body nex-fieldset-body '+opt.bodyCls+'">'
						+'</div>'
					+'</fieldset>';
			bd = $( bd );
			container.append(bd);
			bd = bd.find(">.nex-panel-body");
			opt.views['body'] = bd;
			bd.css('padding',opt.padding);
			bd.css(opt.style);
			self.setFieldSetEvent();
			self.fireEvent("onBodyCreate",[bd,opt]);
			return self;
		}	
	});
})(jQuery,window);
