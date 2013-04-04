var scrollLoad = (function(options){
  var defaults = (arguments.length === 0) ? {src : "xsrc",time : 300} : {src : options.src || 'xsrc',time : options.time || 300};
  var camelize = function(s){
    // replace 在第二个参数是一个函数且只有一个匹配项的情况下，会向这个函数传递三个参数：模式的匹配项，模式匹配项在字符串中的位置和原始字符串。在正则表达式中定义了多个捕获组(pattern)的情况下,参数依次为模式的匹配项，第一个捕获组匹配项，第二个。。。但最后两个参数仍然分别是模式匹配项在字符串中的位置和原始字符串。
    // \w相当于[a-zA-Z0-9_]
    // margin-left => marginLeft
    return s.replace(/-(\w)/g,function(strMatch,p1){
      return p1.toUpperCase()
    })
  };
  this.getStyle = function(el,pro){
    if(arguments.length !== 2) return;
    var value = el.style[camelize(pro)];
    if(!value){
      if(document.defaultView && document.defaultView.getComputedStyle){
        //非IE
        var css = document.defaultView.getComputedStyle(el,null);
        value = css ? css.getPropertyValue(pro) : null;
      }else if(el.currentStyle){
        // IE
        value = el.currentStyle[camelize(pro)];
      }
    }
    return value == 'auto' ? '' : value;
  }
  var init = function(){
    var offsetPage = window.pageYOffset ? window.pageYOffset : window.document.documentElement.scrollTop,
        offsetWindow = offsetPage + Number(window.innerHeight ? window.innerHeight : document.documentElement.clientHeight),
        docImg = document.images,
        len = docImg.length;
    if(!len)return 0;
    for(var i = 0;i < len;i++){
      var attrSrc = docImg[i].getAttribute(defaults.src),
          o = docImg[i],tag = o.nodeName.toLowerCase();
      if(o){
        // getBoundingClientRect()返回一个矩形对象，给出了元素在页面中相对于视口的位置。其值不变
        postPage = o.getBoundingClientRect().top + window.document.documentElement.scrollTop + window.document.body.scrollTop;
        postWindow = postPage + Number(this.getStyle(o,'height').replace('px'),'');
        if((postPage > offsetPage && postPage < offsetWindow) || (postWindow > offsetPage && postWindow < offsetWindow)){
          if(tag === 'img' && attrSrc !== null){
            o.setAttribute("src",attrSrc)
          }
          o = null
        }
      }
    };
    window.onscroll = function(){
      setTimeout(function(){
        init();
      },defaults.time)
    }
  }
  return init()
})();