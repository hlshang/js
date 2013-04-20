if (!document.getElementsByClassName) {
	document.getElementsByClassName = function(className, element) {
		var children = (element || document).getElementsByTagName('*');
		var elements = new Array();
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			var classNames = child.className.split(' ');
			for (var j = 0; j < classNames.length; j++) {
				if (classNames[j] == className) {
					elements.push(child);
					break;
				}
			}
		}
		return elements;
	};
}
var leba = {
	init: function() {
		this.history();
	},
	// 事件处理
	addHandler: function(el, type, handler) {
		var el = el || this;
		if (el.addEventListener) {
			el.addEventListener(type, handler, false)
		} else if (el.attachEvent) {
			el.attachEvent("on" + type, handler)
		} else {
			el["on" + type] = handler
		}
	},
	removeHandler: function(el, type, handler) {
		if (el.removeEventListener) {
			el.remvoveEventListener(type, handler, false)
		} else if (el.detachEvent) {
			el.detachEvent("on" + type, handler)
		} else {
			el["on" + type] = null
		}
	},
	// index
	inArray:function(el,array){
		if(array.indexOf){
			return array.indexOf(el)
		}
		for(var i = 0,length = array.length;i < length;i++){
			if(array[i] === el){
				return i
			}
		}
		return -1;
	},
	history: function() {
		var page = document.getElementsByClassName("page");
		index = window.location.href.replace("http://www.17leba.com/page/","");
		var index = index == "http://www.17leba.com/" ? 1 : index;
		index = parseInt(index)-1;
		this.addHandler(page[index],"click",function(){
			history.pushState(index,document.title,page[]);
		})
	}
};
// init
leba.init()