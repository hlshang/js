
function Game(){
	this.lastTime = 0;
	this.INTERVAL_TIME = 90;
	this.lastAdvance = 0;
	this.jsonObj = [];

	this.sprites = [];
}
Game.prototype = {
	start:function(){
		var that = this;
		this.createSprites();
		window.requestAnimationFrame(function(time){
			that.animate.call(that,time);
		});
	},
	animate:function(time){
		var that = this;
		this.drawSprites();
		window.requestAnimationFrame(function(time){
			that.animate.call(that,time);
		});
	},
	drawSprites:function(){
		context.clearRect(0,0,canvas.width,canvas.height);
		this.getSprites("dice-one").paint(context);
		this.getSprites("dice-two").paint(context);
		if(+new Date() - this.lastTime > this.INTERVAL_TIME){
			this.getSprites("dice-one").painter.advance();
			this.getSprites("dice-two").painter.advance();
			this.lastTime = +new Date();
		}
	},
	createSprites:function(){
		var	diceOne,diceTwo;
		this.nameJsonData("dice-one");
		this.nameJsonData("dice-two");
		diceOne = new Sprite("dice-one",new SpriteSheets(Config.imgSource[0],this.jsonObj["dice-one"]));
		diceTwo = new Sprite("dice-two",new SpriteSheets(Config.imgSource[0],this.jsonObj["dice-two"]));
		diceTwo.left = 100;

		this.sprites.push(diceOne);
		this.sprites.push(diceTwo);
		
	},
	getSprites:function(name){
		for(var i = 0;i < this.sprites.length;i++){
			if(name === this.sprites[i].name){
				return this.sprites[i];
			}
		}
		return null;
	},
	nameJsonData:function(name){
		var jsonList = Config.jsonSource,
			len = jsonList.length,
			jsonRes,
			jsonResFrame;
		this.jsonObj[name] = [];
		for(var i = 0;i < len;i++){
			jsonRes = JSON.parse(Config.jsonSource[i].responseText),
			jsonResFrame = jsonRes.frames;
			for(var j in jsonResFrame){
				if(j.indexOf(name) !== -1){
					this.jsonObj[name].push(jsonResFrame[j]);
				}
			}
		}
	}
}
