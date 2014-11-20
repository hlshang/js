function Game(){
	var that = this;
	this.lastTime = 0;
	this.INTERVAL_TIME = 90;
	// this.lastFrameTime = 0;
	// json cells 缓存
	this.jsonCells = {},
	// 最后一个骰子中设置
	this.diceStartFlag = false;
	// 骰子最终数
	this.diceOneNum = 0;
	this.diceTwoNum = 0;
	this.pauseGame = true;
	// 假定屏幕高为10m
	this.canvasPresumeHeight = 10;
	// pix/meter
	this.pixPerMeter = canvas.height/this.canvasPresumeHeight;
	// 骰子的初始水平速度
	this.xStartSpeed = 12;
	// 骰子的初始垂直速度
	this.yStartSpeed = 1;
	this.commonFps = 60;

	this.grasslandX = Math.ceil(canvas.width/Config.grassWidth);
	this.grasslandY = Math.ceil(canvas.height/Config.grassHeight);

	this.diceOnePaintBehaivor = {
		lastAdvance:0,
		lastAdvanceTime:0,
		changeFrequencyTime:100,
		updateAdvance:function(sprite){
			if(sprite.painter.cellsIndex < 6){
				sprite.painter.cellsIndex = 6;
			}else{
				if(this.lastAdvance === 6){
					this.lastAdvance = -1;
				}
				sprite.painter.cellsIndex = ++this.lastAdvance;
			}
		},
		execute:function(sprite,context,time){
			if(!that.diceStartFlag) return;

			if(sprite.diceAnimationTimer.isExpired()){
				// 确定骰子数
				sprite.painter.cellsIndex = that.diceOneNum;
				sprite.diceAnimationTimer.stop();
				return false;
			}
			if(this.lastAdvanceTime === 0){
				this.lastAdvanceTime = time;
			}
			if(time - this.lastAdvanceTime > this.changeFrequencyTime--){
				this.updateAdvance(sprite);
				this.lastAdvanceTime = time;
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
			}
		}
	};
	this.diceOneBehaivor = [this.diceOnePaintBehaivor,this.diceOneMoveBehaivor];

	this.diceTwoPaintBehaivor = {
		lastAdvance:0,
		lastAdvanceTime:0,
		changeFrequencyTime:150,
		updateAdvance:function(sprite){
			if(sprite.painter.cellsIndex < 6){
				sprite.painter.cellsIndex = 6;
			}else{
				if(this.lastAdvance === 6){
					this.lastAdvance = -1;
				}
				sprite.painter.cellsIndex = ++this.lastAdvance;
			}
		},
		execute:function(sprite,context,time){
			if(!that.diceStartFlag) return;

			if(sprite.diceAnimationTimer.isExpired()){
				sprite.painter.cellsIndex = that.diceTwoNum;
				sprite.diceAnimationTimer.stop();
				that.diceStartFlag = false;
				return false;
			}
			if(this.lastAdvanceTime === 0){
				this.lastAdvanceTime = time;
			}
			if(time - this.lastAdvanceTime > (this.changeFrequencyTime-=2)){
				this.updateAdvance(sprite);
				this.lastAdvanceTime = time;
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
			if(that.pauseGame) return;
			that.diceStartFlag = true;
			that.diceOne.diceAnimationTimer.start();
			that.diceTwo.diceAnimationTimer.start();
			that.diceOneNum = Math.floor(Math.random() * 6);
			that.diceTwoNum = Math.floor(Math.random() * 6);
		},false)
	},
	start:function(){
		var that = this;
		this.createSprites();
		this.clearPause();
		this.startDice();
		window.requestAnimationFrame(function(time){
			that.animate.call(that,time);
		});
	},
	animate:function(time){
		var that = this;
		if(this.pauseGame){
			setTimeout(function(){
				window.requestAnimationFrame(function(time){
					that.animate.call(that,time);
				})
			},100)
		}else{
			this.drawSprites(time);
			this.commonFps = this.fps(time);
			window.requestAnimationFrame(function(time){
				that.animate.call(that,time);
			});
		}
	},
	drawSprites:function(time){
		context.clearRect(0,0,canvas.width,canvas.height);

		this.drawEnclosure();
		this.drawStaticEmbelish();

		this.diceOne.paint(context);
		this.diceOne.update(context,time);

		this.diceTwo.paint(context);
		this.diceTwo.update(context,time);

		this.windmill.paint(context);
		this.windmill.update(context,time);
	},

	createSprites:function(){
		// sprites list
		this.diceOne = new Sprite("diceThree",new SpriteSheets(Config.imgSource[0],
																this.findCellData("diceThree",Config.jsonObj["dice"])),
																this.diceOneBehaivor);
		this.diceTwo = new Sprite("diceTwo",new SpriteSheets(Config.imgSource[0],
																this.findCellData("diceTwo",Config.jsonObj["dice"])),
																this.diceTwoBehaivor);
		this.windmill = new Sprite("windmill",new SpriteSheets(Config.imgSource[1],
																this.findCellData("windmill",Config.jsonObj["dynamic-embellish"])),
																[this.windmillTwoBehavior]);
		this.windmill.left = 15;
		this.windmill.top = canvas.height - 160;

		this.diceOne.diceAnimationTimer = new AnimationTimer(800,AnimationTimer.makeEaseInOutTransducer());
		this.diceTwo.diceAnimationTimer = new AnimationTimer(1000,AnimationTimer.makeEaseInTransducer(1.1));

		// 放到canvas外面
		this.diceOne.left = -96;
		this.diceTwo.left = -96;
	},
	drawGround:function(){
		this.grassland = new Sprite("grassland",new SpriteSheets(Config.imgSource[2],
																this.findCellData("grassland",Config.jsonObj["static-embellish"])))
		for(var i = 0;i < this.grasslandY;i++){
			for(var j = 0;j < this.grasslandX;j++){
				this.grassland.left = j * Config.grassWidth;
				this.grassland.top = i * Config.grassHeight;
				this.grassland.paint(context);
			}
		}
	},
	// 围栏
	drawEnclosure:function(){
		// 水平围栏
		this.enclosureHorizontal = new Sprite("enclosure-horizontal",new drawStaticImage(Config.imgSource[2],
																				Config.jsonObj["static-embellish"]["enclosure-horizontal"]));
		for(var i = 0;i < 8;i++){
			this.enclosureHorizontal.left = i * 132 + 11;
			this.enclosureHorizontal.paint(context);

		}
		for(var i = 0;i < 8;i++){
			this.enclosureHorizontal.left = i * 132 + 11;
			this.enclosureHorizontal.top = canvas.height - 30;
			this.enclosureHorizontal.paint(context);
		}
		// 垂直围栏
		this.enclosureVertical = new Sprite("enclosure-vertical",new drawStaticImage(Config.imgSource[2],
																				Config.jsonObj["static-embellish"]["enclosure-vertical"]));
		for(var i = 0;i< 4 ;i++){
			this.enclosureVertical.top = i * 170; 
			this.enclosureVertical.paint(context);
		}
		for(var i = 0;i< 4 ;i++){
			this.enclosureVertical.top = i * 170;
			this.enclosureVertical.left = canvas.width - 15;
			this.enclosureVertical.paint(context);
		}
	},
	drawStaticEmbelish:function(){
		// 大树1
		this.tree1 = new Sprite("tree1",new drawStaticImage(Config.imgSource[2],Config.jsonObj["static-embellish"]["tree-1"]));
		this.tree1.paint(context);
		// 大树2
		this.tree2 = new Sprite("tree2",new drawStaticImage(Config.imgSource[2],Config.jsonObj["static-embellish"]["tree-2"]));
		this.tree2.left = canvas.width - 128;
		this.tree2.top = canvas.height - 180;
		this.tree2.paint(context);
		// 帐篷
		this.tent = new Sprite("tent",new drawStaticImage(Config.imgSource[2],Config.jsonObj["static-embellish"]["tent"]));
		this.tent.left = canvas.width - 160;
		this.tent.paint(context);
		// 柴火（两堆）
		this.firewood = new Sprite("firewood",new drawStaticImage(Config.imgSource[2],Config.jsonObj["static-embellish"]["firewood"]));
		this.firewood.top = 160;
		for(var i = 0;i < 2;i++){
			this.firewood.left = canvas.width - 32 * 2 * (i+1);
			this.firewood.paint(context);
		}
		// 木桶（两堆）
		this.cask = new Sprite("cask",new drawStaticImage(Config.imgSource[2],Config.jsonObj["static-embellish"]["cask"]));
		this.cask.top = 120;
		for(var i = 0;i < 2;i++){
			this.cask.left = (i+1) * 60;
			this.cask.paint(context);
		}
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
		// jsonCells中存在，则直接返回
		if(name in this.jsonCells){
			return this.jsonCells[name];
		}
		for(var i in jsonObj){
			if(i.indexOf(name) !== -1){
				cellDatas.push(jsonObj[i]);
			}
		}
		this.jsonCells[name] = cellDatas;
		return cellDatas;
	},
	clearPause:function(){
		var that = this;
		document.addEventListener("keydown",function(e){
			var code = e.keyCode;
			if(code === 13){
				that.pauseGame = false;
			}
		})
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
