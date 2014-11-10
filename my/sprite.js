// sprites

function Sprite(name,painter,behaviors){
	this.name = name || '';
	this.painter = painter || undefined;
	this.behaviors = behaviors || [];

	this.left = 0;
	this.top = 0;
	this.width = 0;
	this.height = 0;
	this.velocityX = 0;
	this.velocityY = 0;
	this.animating = true;
	this.visible = true;

	return this;
}

Sprite.prototype = {
	paint:function(context){
		if(this.visible && this.painter){
			this.painter.paint(context,this);
		}
	},
	update:function(context,time){
		for(var i = this.behaviors.length;i > 0;--i){
			this.behaviors[i - 1].execute(this,context,time);
		}
	}
}
