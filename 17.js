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
// var 
var toString = Object.prototype.toString,
	hasOwnProperty = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	slice = Array.prototype.slice,
	indexOf = Array.prototype.indexOf,
	rtrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;
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
	size:function(el){
		return el.length
	},
	toArray:function(el){
		return slice.call(el,0)
	},
	get:function(el,num){
		// num = null 时 取全部
		// num < 0 时 取最后一个
		return num == null ? this.toArray(el) : (num < 0 ? slice.call(el,el.length-1) : slice.call(el,num,++num))
	},
	trim:function(text){
		return (text || "").replace(rtrim,"")
	},
	history: function() {
		// todo
		var page = document.getElementsByClassName("page");
		index = window.location.href.replace("http://www.17leba.com/page/","");
		var index = index == "http://www.17leba.com/" ? 1 : index;
		index = parseInt(index)-1;
		this.addHandler(page[index],"click",function(){
		})
	}
};
// init
leba.init();
var a = "wo s";
alert(a)