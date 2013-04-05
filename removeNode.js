// \v1判断浏览器 \v1为false则为IE
var removeNode = !+"\v1" ? function(){
  var d;
  return function(node){
    // ie直接删除会内存泄露
    var d;
    if(node && node.tagName !== "body"){
      d = d || document.createElement("div");
      d.appendChild(node);
      d.innerHTML = ""
    }
  }
}() : function(node){
  if(node && node.parentNode && node.tagName !== "body"){
    node.parentNode.removeChild(node)
  }
};
