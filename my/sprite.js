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
	this.globalCompositeOperation = "lighter";
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
			frame = cells.frame,
			x = frame.x,
			y = frame.y;
		sprite.width = frame.w,
		sprite.height = frame.h;
		context.drawImage(this.spriteSheet,x,y,sprite.width,sprite.height,sprite.left,sprite.top,sprite.width,sprite.height);
	}
}
// static
function drawStaticImage(img,cell){
	this.img = img;
	this.cell = cell;
	this.globalCompositeOperation = "lighter";
}
drawStaticImage.prototype = {
	paint:function(img,context){
		var cell = this.cell,
			frame = cell.frame,
			x = frame.x,
			y = frame.y;
		img.width = frame.w;
		img.height = frame.h;
		context.drawImage(this.img,x,y,img.width,img.height,img.left,img.top,img.width,img.height);
	}
}