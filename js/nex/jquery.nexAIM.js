/*文件上传*/
Nex.AIM = {
	// eg: Nex.AIM.submit(formobj,{onStart:func1,onComplete:func2}); 不提交
	//eg: Nex.AIM.submitAuto(formobj,{onStart:function(){return true;},onComplete:func2(s){}}); 自动提交表格 
	//这个基本是 ajaxpost 的简洁版本 返回的数据是 xml 格式 <root>内容</root>
	frame : function(c) {

		var n = 'f' + Math.floor(Math.random() * 99999);
		var d = document.createElement('DIV');
		d.innerHTML = '<iframe style="display:none" src="about:blank" id="'+n+'" name="'+n+'" onload="Nex.AIM.loaded(\''+n+'\')"></iframe>';
		document.body.appendChild(d);

		var i = document.getElementById(n);
		if (c && typeof(c.onComplete) == 'function') {
			i.onComplete = c.onComplete;
		}

		return n;
	},

	form : function(f, name) {
		f.setAttribute('target', name);
	},

	submit : function(f, c) {
		this.form(f, this.frame(c));
		if (c && typeof(c.onStart) == 'function') {
			return c.onStart();
		} else {
			return true;
		}
	},
	
	submitAuto : function(f, c) {
		this.form(f, this.frame(c));
		if (c && typeof(c.onStart) == 'function') {
			if(c.onStart()) f.submit();
		} else {
			f.submit();
		}
		return false;
	},
	
	loaded : function(id) {
		var i = document.getElementById(id);
		var s = '';
		if (i.contentDocument) {
			var d = i.contentDocument;
		} else if (i.contentWindow) {
			var d = i.contentWindow.document;
		} else {
			var d = window.frames[id].document;
		}
		try {
				s = i.contentWindow.document.XMLDocument.text;
				
		} catch(e) {
			try {
				s = i.contentWindow.document.documentElement.firstChild.wholeText;
					
			} catch(e) {
				try {
					s = i.contentWindow.document.documentElement.firstChild.nodeValue;
						
				} catch(e) {
						s = '内部错误，无法显示此内容';//如果出现这个请检查域名是否相同 
				}
			}
		}
		if (d.location.href == "about:blank") {
			return;
		}

		if (typeof(i.onComplete) == 'function') {
			i.onComplete(s);
		}
	}
};