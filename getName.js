window.onload = function(){
  var getName = function(callee){
// \s匹配任何空白符 \?匹配? /g全局匹配 否则之匹配第一个 *0或多次 []匹配其中任何一个
  var _callee = callee.toString().replace(/[\s\?]*/g,""),
      comb = _callee.length >= 50 ? 50 : callee.length;
  _callee = _callee.substring(0,comb); 
  // match查找字符串 并以数组返回结果　第一项是匹配整个模式的字符串 之后每一项保存着与正则表达式中的捕获组匹配的字符串  (pattern)捕获组
  var name = _callee.match(/^function([^\(]+?)\(/);
  if(name && name[1]){
    // 返回有名函数 靠
    return name[1]
  }

  // caller包含着调用当前函数的函数的引用 这个不是很懂
  var caller = callee.caller,
      caller = caller.toString().replace(/[\s\?]*/g,"");
  var last = caller.indexOf(_callee);
  str = caller.substring(last-50,last);
  name = str.match(/var([^\=]+?)\=/);
  if(name && name[1]){
    return name[1]
  }
  return "anonymous";
}
var pb = function(){
  var a = getName(arguments.callee);
  alert(a)
}
pb()

}