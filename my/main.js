function Game(){
	var that = this;
	this.lastTime = 0;
	this.INTERVAL_TIME = 90;
	this.lastFrameTime = 0;
	// 最后一个骰子中设置
	this.diceStartFlag = false;
	// 骰子最终数
	this.diceOneNum = 0;
	this.diceTwoNum = 0;
	this.pause = false;
	// 假定屏幕高为10m
	this.canvasPresumeHeight = 10;
	// pix/meter
	this.pixPerMeter = canvas.height/10;
	// 骰子的初始水平速度
	this.xStartSpeed = 10;
	// 骰子的初始垂直速度
	this.yStartSpeed = 2;
	this.commonFps = 60;

	this.diceOnePaintBehaivor = {
		lastAdvance:0,
		lastAdvanceTime:0,
		changeFrequencyTime:100,
		execute:function(sprite,context,time){
			if(!that.diceStartFlag) return;
			if(this.lastAdvanceTime === 0){
				this.lastAdvanceTime = time;
			}
			if(time - this.lastAdvanceTime > this.changeFrequencyTime--){
				if(sprite.painter.cellsIndex < 6){
					sprite.painter.cellsIndex = 6;
				}else{
					sprite.painter.cellsIndex = ++this.lastAdvance;
				}
				this.lastAdvanceTime = time;
			}
			if(sprite.diceAnimationTimer.isExpired()){
				// 确定骰子数
				sprite.painter.cellsIndex = that.diceOneNum;
			}
		}
	};
	this.diceOneMoveBehaivor = {
		execute:function(sprite,context,time){
			if(sprite.diceAnimationTimer.isRunning()){
				var framePerSecond = 1/that.commonFps;
				// 计算每一帧移动的像素数
				// 计算公式：
				// X/Y方向的速度（m/s）* 每米移动的像素数（pix/m）* 每一帧经过的秒数（s/frame）
				// 单位一消得到：pix/frame，即每一帧移动的像素数。
				sprite.velocityX = that.xStartSpeed * that.pixPerMeter;
				sprite.velocityY = (that.yStartSpeed + Config.GRAVITY_FORCE * (sprite.diceAnimationTimer.getElapsedTime()/1000)) * that.pixPerMeter;
				sprite.left += sprite.velocityX * framePerSecond;
				sprite.top += sprite.velocityY * framePerSecond;

				if(sprite.diceAnimationTimer.isExpired()){
					sprite.diceAnimationTimer.stop();
				}
			}
		}
	};
	this.diceOneBehaivor = [this.diceOnePaintBehaivor,this.diceOneMoveBehaivor];

	this.diceTwoPaintBehaivor = {
		lastAdvance:0,
		lastAdvanceTime:0,
		changeFrequencyTime:150,
		execute:function(sprite,context,time){
			if(!that.diceStartFlag) return;
			if(this.lastAdvanceTime === 0){
				this.lastAdvanceTime = time;
			}
			if(time - this.lastAdvanceTime > (this.changeFrequencyTime-=2)){
				if(sprite.painter.cellsIndex < 6){
					sprite.painter.cellsIndex = 6;
				}else{
					sprite.painter.cellsIndex = ++this.lastAdvance;
				}
				this.lastAdvanceTime = time;
			}
			if(sprite.diceAnimationTimer.isExpired()){
				// 确定骰子数
				sprite.painter.cellsIndex = that.diceTwoNum;
				that.diceStartFlag = false;
			}
		}
	};
	this.diceTwoMoveBehaivor = {
		execute:function(sprite,context,time){
			if(sprite.diceAnimationTimer.isRunning()){
				var framePerSecond = 1/that.commonFps;
				sprite.velocityX = that.xStartSpeed * that.pixPerMeter;
				sprite.velocityY = (that.yStartSpeed + Config.GRAVITY_FORCE * (sprite.diceAnimationTimer.getElapsedTime()/1000)) * that.pixPerMeter;
				sprite.left += sprite.velocityX * framePerSecond;
				sprite.top += sprite.velocityY * framePerSecond;

				if(sprite.diceAnimationTimer.isExpired()){
					sprite.diceAnimationTimer.stop();
				}
			}
		}
	};
	this.diceTwoBehaivor = [this.diceTwoPaintBehaivor,this.diceTwoMoveBehaivor];

	this.windmillTwoBehavior = {
		lastAdvanceTime:0,
		execute:function(sprite,context,time){
			if(this.lastAdvanceTime === 0){
				this.lastAdvanceTime = time;
			}
			if(time - this.lastAdvanceTime > 150){
				sprite.painter.advance();
				this.lastAdvanceTime = time;
			}
		}
	};
	this.sprites = [];
}
Game.prototype = {
	startDice:function(){
		var that = this;
		pb.init("roll-dice").addEventListener("click",function(){
			that.diceStartFlag = true;
			that.diceOne.diceAnimationTimer.start();
			that.diceTwo.diceAnimationTimer.start();
			that.diceOneNum = parseInt(Math.random() * 5);
			that.diceTwoNum = parseInt(Math.random() * 5);
		},false)
	},
	start:function(){
		var that = this;
		this.createSprites();
		this.startDice();
		window.requestAnimationFrame(function(time){
			that.animate.call(that,time);
		});
	},
	animate:function(time){
		var that = this;
		this.drawSprites(time);
		this.commonFps = this.fps(time);
		window.requestAnimationFrame(function(time){
			that.animate.call(that,time);
		});
	},
	drawSprites:function(time){
		context.clearRect(0,0,canvas.width,canvas.height);

		this.diceOne.paint(context);
		this.diceOne.update(context,time);

		this.diceTwo.paint(context);
		this.diceTwo.update(context,time);

		this.windmillTwo.paint(context);
		this.windmillTwo.update(context,time);
		this.windmillTwo.left = canvas.width - this.windmillTwo.width;
		this.windmillTwo.top = canvas.height - this.windmillTwo.height;
	},

	createSprites:function(){
		// sprites list
		this.diceOne = new Sprite("dice-one",new SpriteSheets(Config.imgSource[0],
																this.findCellData("dice-one",Config.jsonObj["dice"])),
																this.diceOneBehaivor);
		this.diceTwo = new Sprite("dice-two",new SpriteSheets(Config.imgSource[0],
																this.findCellData("dice-two",Config.jsonObj["dice"])),
																this.diceTwoBehaivor);
		this.windmillTwo = new Sprite("windmillTwo",new SpriteSheets(Config.imgSource[1],
																this.findCellData("windmillTwo",Config.jsonObj["dynamic-embellish"])),
																[this.windmillTwoBehavior]);
		
		this.diceOne.diceAnimationTimer = new AnimationTimer(1000,AnimationTimer.makeEaseInOutTransducer());
		this.diceTwo.diceAnimationTimer = new AnimationTimer(900,AnimationTimer.makeEaseInTransducer(1.1));

		// 放到canvas外面
		this.diceOne.left = -96;
		this.diceTwo.left = -96;
		// push sprites
		// this.sprites.push(this.diceOne);
		// this.sprites.push(this.diceTwo);
	},
	getSprites:function(name){
		for(var i = 0;i < this.sprites.length;i++){
			if(name === this.sprites[i].name){
				return this.sprites[i];
			}
		}
		return null;
	},
	findCellData:function(name,jsonObj){
		var cellDatas = [];
		for(var i in jsonObj){
			if(i.indexOf(name) !== -1){
				cellDatas.push(jsonObj[i]);
			}
		}
		return cellDatas;
	},
	// 帧速率
	fps:function(time){
		var fps;
		if(!this.lastFrameTime){
			fps = 60;
		}else{
			fps = 1000/(time - this.lastFrameTime);
		}
		this.lastFrameTime = time;
		return fps; 
	}
}
