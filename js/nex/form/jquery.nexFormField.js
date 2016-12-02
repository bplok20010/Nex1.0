/*
jquery.nexFormField.js
*/

;(function($){
	"use strict";
	var textfield = Nex.extend( 'textfield','form' );
	textfield.setOptions({
		type : 'text'	
	});
	var textareafield = Nex.extend( 'textareafield','form' );
	textareafield.setOptions({
		type : 'textarea'	
	});
	var passwordfield = Nex.extend( 'passwordfield','form' );
	passwordfield.setOptions({
		type : 'password'	
	});
	var hiddenfield = Nex.extend( 'hiddenfield','form' );
	hiddenfield.setOptions({
		type : 'hidden'	
	});
	var displayfield = Nex.extend( 'displayfield','form' );
	displayfield.setOptions({
		type : 'display'	
	});
	var combofield = Nex.extend( 'combofield','form' );
	combofield.setOptions({
		type : 'combo'	
	});
	var datefield = Nex.extend( 'datefield','form' );
	datefield.setOptions({
		type : 'date'	
	});
	var selectfield = Nex.extend( 'selectfield','form' );
	selectfield.setOptions({
		type : 'select'	
	});
	var searchfield = Nex.extend( 'searchfield','form' );
	searchfield.setOptions({
		type : 'search'	
	});
	var multiselectfield = Nex.extend( 'multiselectfield','form' );
	multiselectfield.setOptions({
		type : 'multiselect'	
	});
	var spinnerfield = Nex.extend( 'spinnerfield','form' );
	spinnerfield.setOptions({
		type : 'spinner'	
	});
	var numberfield = Nex.extend( 'numberfield','form' );
	numberfield.setOptions({
		type : 'number'	
	});
	var radiofield = Nex.extend( 'radiofield','form' );
	radiofield.setOptions({
		type : 'radio'	
	});
	var checkboxfield = Nex.extend( 'checkboxfield','form' );
	checkboxfield.setOptions({
		type : 'checkbox'	
	});
	var singlecheckboxfield = Nex.extend( 'singlecheckboxfield','form' );
	singlecheckboxfield.setOptions({
		type : 'display',
		on : '',
		off : ''
	});
	singlecheckboxfield.fn.extend({
		displaySetSize : function(width,height){
			var self = this;
			var opt = self.configs;
			
			var $table = $("#"+opt.id+"-item");
			
			var $input = $("#"+opt.id+"-ckt");
			
			$("#"+opt.id)._outerWidth( width );
			
			var lw = 0;
			$("#"+opt.id+"-inputRow >td.nex-form-label-cell").each(function(){
				lw += $(this)._outerWidth();																
			});
			$("#"+opt.id+"-inputRow >td.nex-form-button-cell").each(function(){
				lw += $(this)._outerWidth();																
			});
			
			$table._outerWidth( width );
			
			$input._outerWidth( width - lw );		
		},
		displayTpl :　function(d){
			if( !d ) return "";
			var self = this,
				opt = self.configs;
			var text = [];
			text.push('<div class="nex-form-wraper '+d.cls+' nex-field-'+d.group+'" style="" id="'+d.id+'">');
				text.push('<table id="'+d.id+'-item" class="nex-field nex-form-item" cellspacing="0" cellpadding="0"><tbody>');
				text.push('<tr id="'+d.id+'-inputRow">');
					text.push('<td class="nex-form-item-body" id="'+d.id+'-body" style="width: 100%;">');	
						text.push('<div id="'+d.id+'-ckt" style="width:0px;" class="nex-form-field nex-form-display"><input '+d.attrs+' type="checkbox" id="'+d.id+'-input" /></div>');
					text.push('</td>');
				text.push('</tr>');
			text.push('</tbody></table></div>');
			return text.join("");
		},
		displayGetValue : function(){
			var self = this;
			var opt = self.configs;
			var input = $("#"+opt.id+"-input");
			var ck = input[0];
			
			var value =  ck.checked ? opt.on : opt.off;
			
			return $.trim( self.rendererDecode(value) );
		},
		displaySetValue : function(){
			var self = this,undef;
			var opt = self.configs;
			var input = $("#"+opt.id+"-input");
			var ck = input[0];
			
			var value = arguments[0];
			
			if( $.isFunction( opt.formater ) ) {
				var _value = opt.formater.call( self,value );
				value = _value === undef ? value : _value;
			}
			
			value = self.rendererEncode(value);
			if( value+'' === opt.on+'' ) {
				ck.checked = true;	
			} else {
				ck.checked = false;		
			}
			
			return self;
		}
	});
})(jQuery);