function Game(){
	var that = this;
	// json cells 缓存
	this.jsonCells = {};

	this.canvasWidth = canvas.width;
	this.canvasHeight = canvas.height;
	// 假定屏幕高为10m
	this.canvasPresumeHeight = 10;
	this.canvasHalfPersumeHeight = this.canvasPresumeHeight / 2;
	// pix/meter
	this.pixPerMeter = this.canvasHeight / this.canvasPresumeHeight;
	// 骰子的时间
	this.diceOneAniTime = 900;
	this.diceTwoAniTime = 1000;
	// 骰子下落到屏幕一半（5m）所需的初始垂直速度（m/s）
	this.diceOneYStartSpeed = (this.canvasHalfPersumeHeight - 0.5 * Config.GRAVITY_FORCE * Math.pow(this.diceOneAniTime / 1000,2)) / (this.diceOneAniTime / 1000);
	this.diceTwoYStartSpeed = (this.canvasHalfPersumeHeight - 0.5 * Config.GRAVITY_FORCE * Math.pow(this.diceTwoAniTime / 1000,2)) / (this.diceTwoAniTime / 1000);
	// 骰子水平每秒移动像素
	this.diceOnePixPerSec = (this.canvasWidth / 2) / (this.diceOneAniTime / 1000) + 100;
	this.diceTwoPixPerSec = (this.canvasWidth / 2) / (this.diceTwoAniTime / 1000);
	// 骰子是否结束转动
	this.oneEndRotate = false;
	this.twoEndRotate = false;
	// 开始丢骰子
	this.startShakeOneDice = false;
	this.startShakeTwoDice = false;
	// 骰子最终数
	this.diceOneNum = 0;
	this.diceTwoNum = 0;
	// 骰子总数
	this.diceTotal = 0;
	// 掷骰子跳跃进行时
	this.allRunning = false;

	// 行走地图倾斜角度
	this.slopeAngle = Config.slopeAngle * Config.deg;
	// 行走地图的真实高度和宽度（比行走图多一格）
	this.mapRealHorizontal = 65 * (6 + 0.5) * Math.cos(this.slopeAngle);
	this.mapRealVertical = 65 * (6 + 0.5) * Math.sin(this.slopeAngle);
	// 行走地图宽度和高度（1/2）
	this.mapHorizontal = 65 * 6 * Math.cos(this.slopeAngle);
	this.mapVertical = 65 * 6 * Math.sin(this.slopeAngle);
	// 行走地图在画布中的位置（水平垂直居中）
	this.walkMapLeft = this.canvasWidth / 2;
	this.walkMapTop = this.canvasHeight / 2 - this.mapRealVertical;
	// 人物初始位置
	this.runnweInitialLeft = this.canvasWidth / 2 - 50 / 2;
	this.runnweInitialTop = this.walkMapTop + this.mapVertical * 2 - 84 + 0.5 * Math.sin(this.slopeAngle);
	// 人物水平每一步走多少像素
	this.runnerHorizontalPace = Math.floor(this.mapHorizontal / 6);
	
	// 每一步的时间
	this.runnerMoveAniTime = 300;
	// 跳跃和下降的时间，为移动时间的一半
	this.runnerJumpAniTime = this.runnerMoveAniTime / 2;
	// 每两格中心点间的高度(px)
	this.runnerGridHPix = this.runnerHorizontalPace * Math.tan(this.slopeAngle);
	// 每两格中心点间的高度(m)
	this.runnerGridMeter = this.runnerGridHPix * this.canvasHalfPersumeHeight / (this.canvasHeight / 2);
	// 每秒水平移动多少像素
	this.runnerPixEverySec = Math.floor(this.runnerHorizontalPace / (this.runnerMoveAniTime / 1000));
	// 人物向上/下跳动的垂直速度
	// 跳跃高度为1.5倍的两格中心点的高度
	// 根据 vt + 0.5 * gt² = s (加速度方向为负)公式求出：
	this.runnerVerticalUpSpeed = (this.runnerGridMeter * 1.5 + 0.5 * Config.GRAVITY_FORCE * Math.pow(this.runnerJumpAniTime / 1000,2)) / (this.runnerJumpAniTime / 1000);
	this.runnerVerticalDownSpeed = (this.runnerGridMeter * 0.5 + 0.5 * Config.GRAVITY_FORCE * Math.pow(this.runnerJumpAniTime / 1000,2)) / (this.runnerJumpAniTime / 1000);
	// 开始跳跃
	this.startJump = false;
	// 开始移动
	this.startMove = false;
	// 人物是否在跑动
	this.running = false;
	// 人物是否在跳动
	this.jumping = false;
	// 人物结束跑动
	this.endRun = false;
	// 人物跳动到哪个格子
	this.currentPointer = 0;
	// 掷完筛子后人物跳到哪个格子上
	this.lastPointer = 0;
	
	this.pauseGame = true;
	this.commonFps = 60;
	this.resumeArr = [];

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
			if(!that.startShakeOneDice) return;

			if(sprite.diceAnimationTimer.isExpired()){
				that.startShakeOneDice = false;
				// 确定骰子数
				sprite.painter.cellsIndex = that.diceOneNum;
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
				sprite.velocityX = that.diceOnePixPerSec * framePerSecond;
				sprite.velocityY = (that.diceOneYStartSpeed + Config.GRAVITY_FORCE * (sprite.diceAnimationTimer.getElapsedTime() / 1000)) * that.pixPerMeter * framePerSecond;
				sprite.left += sprite.velocityX;
				sprite.top += sprite.velocityY;
			}
			if(sprite.diceAnimationTimer.isExpired()){
				sprite.diceAnimationTimer.stop();
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
		startJumpMove:function(){
			that.currentPointer++;
			that.runner.jumpTimer.start();
			that.runner.moveTimer.start();
			that.startJump = true;
			that.startMove = true;
		},
		execute:function(sprite,context,time){
			var self = this;
			if(!that.startShakeTwoDice) return;
			if(sprite.diceAnimationTimer.isExpired()){
				that.startShakeTwoDice = false;
				sprite.painter.cellsIndex = that.diceTwoNum;
				// 这儿应该有一个显示骰子数的方法 todo
				var timeOut = setTimeout( function(){
					self.startJumpMove();
					that.diceLocReset();
					clearTimeout(timeOut);
				},800)

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
				sprite.velocityX = that.diceTwoPixPerSec * framePerSecond;
				sprite.velocityY = (that.diceTwoYStartSpeed + Config.GRAVITY_FORCE * (sprite.diceAnimationTimer.getElapsedTime() / 1000)) * that.pixPerMeter * framePerSecond;
				sprite.left += sprite.velocityX;
				sprite.top += sprite.velocityY;
			}
			if(sprite.diceAnimationTimer.isExpired()){
				sprite.diceAnimationTimer.stop();
			}
		}
	};
	this.diceTwoBehaivor = [this.diceTwoPaintBehaivor,this.diceTwoMoveBehaivor];

	this.runnerJumpFallBehavior = {
		direction:"up",
		runnerVerticalSpeed : 0,
		jumpDirection:function(){
			if(that.currentPointer > 12 && that.currentPointer < 25){
				this.direction = "down";
				this.runnerVerticalSpeed = that.runnerVerticalDownSpeed;
			}else{
				this.direction = "up";
				this.runnerVerticalSpeed = that.runnerVerticalUpSpeed;
			}
		},
		execute:function(sprite,context,time){
			if(!that.startJump) return;
			if(sprite.jumpTimer.isRunning()){
				// 确认方向
				this.jumpDirection();

				if(!sprite.jumpTimer.isExpired()){
					var framePerSecond = 1/that.commonFps;
					sprite.velocityY = (that.runnerVerticalSpeed - Config.GRAVITY_FORCE * (sprite.jumpTimer.getElapsedTime() / 1000)) * that.pixPerMeter * framePerSecond;
					this.direction === "up" ? sprite.top -=  sprite.velocityY : sprite.top += sprite.velocityY ;
				}else{
					sprite.jumpTimer.stop();
					sprite.fallTimer.start();
				}
			}else if(sprite.fallTimer.isRunning()){
				if(!sprite.fallTimer.isExpired()){
					var framePerSecond = 1/that.commonFps;
					sprite.velocityY = (that.runnerVerticalSpeed + Config.GRAVITY_FORCE * (sprite.fallTimer.getElapsedTime() / 1000)) * that.pixPerMeter * framePerSecond;
					sprite.top +=  sprite.velocityY;
					// var distanceY = 0.5 * Config.GRAVITY_FORCE * Math.pow(sprite.fallTimer.getElapsedTime() / 1000,2);
					// if(distanceY > that.runnerGridMeter/2 && this.direction === "up"){
					// 	// 下降高度大于二分之一的格子高度时，则自动停止此次跳跃，开始下一次。
					// 	sprite.fallTimer.stop();
					// 	sprite.jumpTimer.start();
					// }
				}else{
					if(that.startMove){
						sprite.jumpTimer.start();
					}else{
						sprite.fallTimer.stop();
						that.startJump = false;
					}
				}
			}
		}
	};
	
	this.runnerMoveBehavior = {
		execute:function(sprite,context,time){
			if(!that.startMove) return;

			if(sprite.moveTimer.isRunning()){
				var framePerSecond = 1/that.commonFps;
				sprite.velocityX = that.runnerPixEverySec * framePerSecond;
				if(that.currentPointer > 6 && that.currentPointer < 19){
					sprite.left +=  sprite.velocityX;
				}else{
					sprite.left -=  sprite.velocityX;
				}
			}
			if(sprite.moveTimer.isExpired()){
				if(--that.diceTotal){
					// 确定每一跳后的位置
					that.currentRunnerLoc();
					sprite.moveTimer.start();
				}else{
					sprite.moveTimer.stop();
					that.startMove = false;
					// 人物开始动作
					// 显示相应的结果
					that.showResult(that.currentPointer);
				}
			}
		}
	};
	this.runnerBehavior = [this.runnerMoveBehavior,this.runnerJumpFallBehavior];

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
	startShakeDice:function(){
		var that = this;
		pb.init("roll-dice").addEventListener("click",function(){
			if(that.pauseGame) return;
			that.diceRotateReset();
			that.diceOneNum = Math.floor(Math.random() * 6);
			that.diceTwoNum = Math.floor(Math.random() * 6);
			that.diceTotals();
			// 确定每次掷完筛子后人物的位置
			that.lastRunnerLoc();
			that.diceStartRotate()
		},false)
	},
	diceStartRotate:function(){
		this.startShakeOneDice = true;
		this.startShakeTwoDice = true;
		// 开始计时
		this.diceOne.diceAnimationTimer.start();
		this.diceTwo.diceAnimationTimer.start();
	},
	diceLocReset:function(){
		this.diceOne.left = -96;
		this.diceTwo.left = -96;
		this.diceOne.top = -96;
		this.diceTwo.top = -96;
	},
	diceRotateReset:function(){
		this.oneEndRotate = false;
		this.twoEndRotate = false;
	},
	start:function(){
		var that = this;
		this.clearPause();
		this.createSprites();
		this.createResumeLoc();
		this.startShakeDice();
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
			this.drawMap();
			this.runnerJump(time);
			this.commonFps = this.fps(time);
			window.requestAnimationFrame(function(time){
				that.animate.call(that,time);
			});
		}
	},
	runnerJump:function(time){
		this.runner.paint(context);
		this.runner.update(context,time);
	},
	drawMap:function(){
		context.save();
		context.translate(this.walkMapLeft,this.walkMapTop);
		context.rotate(45 * Config.deg);
		context.transform(1,-this.slopeAngle,-this.slopeAngle,1,0,0);

		for(var i = 0;i < 24;i++){
			if(i < 6){
				if(this.resumeArr.indexOf(i) !== -1){
					context.fillStyle = "red";
					context.fillRect(65 * (6 - i),65*24/4,65,65);
				}else{
					context.fillStyle = "green";
					context.fillRect(65 * (6 - i),65*24/4,65,65);
				}
			}		
			context.fillStyle = "green";
			
			if(i >= 6 && i < 12){
				if(this.resumeArr.indexOf(i) !== -1){
					context.fillStyle = "blue";
					context.fillRect(0,65*(12 - i),65,65);
				}else{
					context.fillStyle = "green";
					context.fillRect(0,65*(12 - i),65,65);
				}
			}
			context.fillStyle = "green";
			if(i >= 12 && i < 18){
				if(this.resumeArr.indexOf(i) !== -1){
					context.fillStyle = "white";
					context.fillRect(65 * (i - 12),0,65,65);
				}else{
					context.fillStyle = "green";
					context.fillRect(65 * (i - 12),0,65,65);
				}
			}
			context.fillStyle = "green";
			if(i >= 18 && i < 24){
				if(this.resumeArr.indexOf(i) !== -1){
					context.fillStyle = "yellow";
					context.fillRect(65 * 6,65*(i - 18),65,65);
				}else{
					context.fillStyle = "green";
					context.fillRect(65 * 6,65*(i - 18),65,65);
				}
			}
			context.fillStyle = "green";
		}

		// for(var i = 0;i < 6;i++){
		// 	context.fillRect(65*i,0,65,65);
		// }
		// for (var i = 0;i < 6;i++) {
		// 	context.fillRect(0,65*i+65,65,65);
 		// 	}
		// for(var i = 0;i < 6;i++){
		// 	context.fillRect(65*i+65,65*6,65,65);
		// }
		// for(var i = 0;i < 6;i++){
		// 	context.fillRect(65*6,65*i,65,65);
		// }

		context.restore();
	},
	drawSprites:function(time){
		context.clearRect(0,0,this.canvasWidth,this.canvasHeight);
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
		this.windmill.top = this.canvasHeight - 160;

		this.diceOne.diceAnimationTimer = new AnimationTimer(this.diceOneAniTime);
		this.diceTwo.diceAnimationTimer = new AnimationTimer(this.diceTwoAniTime);

		// 放到canvas外面
		this.diceLocReset();

		this.runner = new Sprite("runner",{
			paint:function(sprite,context){
				context.drawImage(document.getElementById("jump-runner"),0,0,50,84,sprite.left,sprite.top,50,84);
			}
		},this.runnerBehavior);

		this.runner.top = this.runnweInitialTop;
		this.runner.left = this.runnweInitialLeft;
		this.runner.jumpTimer = new AnimationTimer(this.runnerJumpAniTime);
		this.runner.fallTimer = new AnimationTimer(this.runnerJumpAniTime);
		this.runner.moveTimer = new AnimationTimer(this.runnerMoveAniTime);
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
			this.enclosureHorizontal.top = this.canvasHeight - 30;
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
			this.enclosureVertical.left = this.canvasWidth - 15;
			this.enclosureVertical.paint(context);
		}
	},
	drawStaticEmbelish:function(){
		// 大树1
		this.tree1 = new Sprite("tree1",new drawStaticImage(Config.imgSource[2],Config.jsonObj["static-embellish"]["tree-1"]));
		this.tree1.paint(context);
		// 大树2
		this.tree2 = new Sprite("tree2",new drawStaticImage(Config.imgSource[2],Config.jsonObj["static-embellish"]["tree-2"]));
		this.tree2.left = this.canvasWidth - 128;
		this.tree2.top = this.canvasHeight - 180;
		this.tree2.paint(context);
		// 帐篷
		this.tent = new Sprite("tent",new drawStaticImage(Config.imgSource[2],Config.jsonObj["static-embellish"]["tent"]));
		this.tent.left = this.canvasWidth - 160;
		this.tent.paint(context);
		// 柴火（两堆）
		this.firewood = new Sprite("firewood",new drawStaticImage(Config.imgSource[2],Config.jsonObj["static-embellish"]["firewood"]));
		this.firewood.top = 160;
		for(var i = 0;i < 2;i++){
			this.firewood.left = this.canvasWidth - 32 * 2 * (i+1);
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
	showResult:function(index){
		switch(index){
			case this.resumeArr[0]:
			this.showResume("one","/resume-json/one.json",this.resumeOne);
			break;
			case this.resumeArr[1]:
			this.showResume("two","/resume-json/two.json",this.resumeTwo);
			break;
			case this.resumeArr[2]:
			this.showResume("three","/resume-json/three.json",this.resumeThree);
			break;
			case this.resumeArr[3]:
			this.showResume("four","/resume-json/four.json",this.resumeFour);
			break;
			case 2:
			break;
			case 6:
			break;
			case 12:
			break;
			case 18:
			break;
			default:break;
		}
	},
	showResume:function(name,url,callback){
		// name 只是个标识
		var xmlHttp = new XMLHttpRequest() || new ActiveXObject("Microsoft.XMLHTTP");
		xmlHttp.onreadystatechange = function(){
			if(xmlHttp.readyState === 4){
				if(xmlHttp.status === 200){
					callback(xmlHttp);
				}else{
				}
			}
		}
		xmlHttp.open("GET",url,true);
		xmlHttp.setRequestHeader("Content-Type","application/json");
		xmlHttp.send(null);
	},
	resumeOne:function(res){},
	resumeTwo:function(res){},
	resumeThree:function(res){},
	resumeFour:function(res){},
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
	diceTotals:function(){
		this.diceTotal = this.diceOneNum + this.diceTwoNum + 2;
		console.log(this.diceTotal)
	},
	currentRunnerLoc:function(){
		this.currentPointer++;
		if(this.currentPointer === 24){
			// 因会有少许误差
			// 转完一圈回到起点时，修正位置。
			this.runner.left = this.runnweInitialLeft;
			this.runner.top = this.runnweInitialTop;
		}
		if(this.currentPointer === 25){
			this.currentPointer = 1;
		}
	},
	lastRunnerLoc:function(){
		this.lastPointer = this.lastPointer !== 25 ? (this.lastPointer + this.diceTotal) : 1;
	},
	createResumeLoc:function(){
		var	resumeCur;
		for(var i = 0;i < 4;i++){
			resumeCur = Math.floor(Math.random() * 24);
			// 去拐角
			if(resumeCur % 6 === 0){
				resumeCur++;
			}
			// 去重和2
			if(this.resumeArr.indexOf(resumeCur) !== -1 || resumeCur === 2){
				i--;
				continue;
			}
			this.resumeArr.push(resumeCur);
		}
	},
	// 帧速率
	fps:function(time){
		var fps;
		if(!this.lastFrameTime){
			fps = 60;
		}else{
			fps = 1000 / (time - this.lastFrameTime);
		}
		this.lastFrameTime = time;
		return fps; 
	}
}
