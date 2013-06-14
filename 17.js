if (!document.getElementsByClassName) {
	document.getElementsByClassName = function(className, element) {
		var children = (element || document).getElementsByTagName('*');
		var elements = [];
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
	// ÊÂ¼þ´¦Àí
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
		// num = null Ê± È¡È«²¿
		// num < 0 Ê± È¡×îºóÒ»¸ö
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

/*
*test
*ÔÚjsÖÐ£¬ËùÓÐ¹ØÏµ¶¼¿ÉÒÔ×÷Îª¶ÔÏóµÄÒ»¸ö¹ØÁªÊý×é¶ø´æÔÚ ¶¼ÊÇ¶ÔÏó
*/ 
/*window.name = "1a";
var object = {
	name : "1b",
	run : function(word){
		console.log(this.name + word)
	}
}

function bind(context,fn){
	var args = slice.call(arguments,2);
	return args.length === 0 ? function(){
		return fn.apply(context,arguments)
	} : function(){
		var a = args.concat.apply(args,arguments).toString();
		return fn.apply(context,a)
	}
}
var pb = bind(window,object.run,["a","sd"])
pb(" is a shift!");*/

// 深度拷贝
var deepExtend = function(destination, source) {
	for (var property in source) {
		if (source[property] && source[property].constructor && source[property].constructor === Object) {
			destination[property] = destination[property] || {}
			arguments.callee(destination[property], source[property])
		} else {
			destination[property] = source[property]
		}
	}
	return destination
}
