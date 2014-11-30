(function(window,undefined){
	var toString = Object.prototype.toString;
	var pb = {
		init:function(id){
			return document.getElementById(id);
		},
		// 检测是否为数组或者对象
		checkType:function(source){
			if(this.isArray(source) || this.isObject(source)){
				return true;
			}
			return false;
		},
		isArray:function(obj){
			return Array.isArray(obj) || toString.call(obj) === "[object Array]";
		},
		isObject:function(obj){
			return toString.call(obj) === "[object Object]";
		}
	};

	window.pb = pb;
})(window)

window.requestAnimationFrame = (function(){
	return 	window.requestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback,element){
				setTimeout(callback,1000/60);
			}
})()