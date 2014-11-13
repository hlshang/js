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
			this.painter.paint(this,context);
		}
	},
	update:function(context,time){
		for(var i = this.behaviors.length;i > 0;--i){
			this.behaviors[i - 1].execute(this,context,time);
		}
	}
}

// spriteSheets
function SpriteSheets(spriteSheet,cells){
	this.spriteSheet = spriteSheet;
	this.cells = cells;
	this.cellsIndex = 0;
}
SpriteSheets.prototype = {
	advance:function(){
		if(this.cellsIndex >= this.cells.length - 1){
			this.cellsIndex = 0;
		}else{
			this.cellsIndex++;
		}
	},
	paint:function(sprite,context){
		var cells = this.cells[this.cellsIndex],
			x = cells.frame.x,
			y = cells.frame.y;
		sprite.width = cells.frame.w,
		sprite.height = cells.frame.h;
		context.drawImage(this.spriteSheet,x,y,sprite.width,sprite.height,sprite.left,sprite.top,sprite.width,sprite.height);
	}
}