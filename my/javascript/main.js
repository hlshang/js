function Game(){
	var that = this;
	// json cells 缓存
	this.jsonCells = {};

	// 角色 boy or girl or runner 默认为boy
	this.role = "girl";
	// 角色分类 两种 jumper and runner
	this.currentRole = "jumper";
	// 跳跃者是否开始动作 不跳跃时有动作
	this.roleActionStart = true;
	// 倒计时 默认为3s
	this.cutDownTime = 3;
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
	// 矩阵倾斜角度
	this.matrixSlope = 45 * Config.deg - Config.slopeAngle * Config.deg;

	// 行走地图的真实高度和宽度（比行走图多一格）
	this.mapRealEdgeLength = 65 * (6 + 0.5) / Math.cos(this.matrixSlope);
	this.mapRealHorizontal = this.mapRealEdgeLength * Math.cos(this.slopeAngle);
	this.mapRealVertical = this.mapRealEdgeLength * Math.sin(this.slopeAngle);

	this.mapEdgeLength = 65 * 6 / Math.cos(this.matrixSlope);
	
	// 行走地图宽度和高度（1/2）
	this.mapHorizontal = this.mapEdgeLength * Math.cos(this.slopeAngle);
	this.mapVertical = this.mapEdgeLength * Math.sin(this.slopeAngle);

	// 行走地图在画布中的位置（水平垂直居中）
	this.walkMapLeft = this.canvasWidth / 2;
	this.walkMapTop = this.canvasHeight / 2 - this.mapRealVertical;
	// 人物初始位置
	this.rolesInitialLeft = this.canvasWidth / 2 - 100;
	this.rolesInitialTop = this.walkMapTop + this.mapVertical * 2 - 180 + 0.5 * Math.sin(this.slopeAngle);
	// 一格的长度
	this.horizontalPacePix = Math.floor(this.mapHorizontal / 6);
	// 一格的高度
	this.verticalPacePix = Math.floor(this.horizontalPacePix * Math.tan(this.slopeAngle));
	// 每一步的时间
	this.jumperMoveAniTime = 300;
	// 跳跃和下降的时间，为移动时间的一半
	this.jumperJumpAniTime = this.jumperMoveAniTime / 2;
	// 每两格中心点间的高度(m)
	this.jumperGridMeter = this.verticalPacePix * this.canvasHalfPersumeHeight / (this.canvasHeight / 2);
	// 每秒水平移动多少像素
	this.jumperPixEverySec = Math.floor(this.horizontalPacePix / (this.jumperMoveAniTime / 1000));
	// 人物向上/下跳动的垂直速度
	// 跳跃高度为1.5倍的两格中心点的高度
	// 根据 vt + 0.5 * gt² = s (加速度方向为负)公式求出：
	this.jumperVerticalUpSpeed = (this.jumperGridMeter * 2 + 0.5 * Config.GRAVITY_FORCE * Math.pow(this.jumperJumpAniTime / 1000,2)) / (this.jumperJumpAniTime / 1000);
	this.jumperVerticalDownSpeed = (this.jumperGridMeter * 1 + 0.5 * Config.GRAVITY_FORCE * Math.pow(this.jumperJumpAniTime / 1000,2)) / (this.jumperJumpAniTime / 1000);
	this.jumperJumpUpSpeed = (this.jumperGridMeter * 2.3 - 0.5 * Config.GRAVITY_FORCE * Math.pow(this.jumperJumpAniTime / 1000,2)) / (this.jumperJumpAniTime / 1000);
	this.jumperJumpDownSpeed = (this.jumperGridMeter * 1 - 0.5 * Config.GRAVITY_FORCE * Math.pow(this.jumperJumpAniTime / 1000,2)) / (this.jumperJumpAniTime / 1000);

	// 跑步者每一格的时间
	this.runnerAniTime = 400;
	// 跑步者水平速度（每秒水平移动多少像素）
	this.runnerHPixEverySec = Math.floor(this.horizontalPacePix / (this.runnerAniTime / 1000));
	this.runnerVPixEverySec = this.runnerHPixEverySec * Math.tan(this.slopeAngle);
	// 开始跳跃
	this.startJump = false;
	// 开始移动
	this.startMoveAll = false;
	// 每一步的移动
	this.startMovePer = false;
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
	
	// 音效
	//开始音效
	this.startSound = Config.mediaSource[0];
	// 骰子音效
	this.diceSound = Config.mediaSource[1];
	// 跳跃音效
	this.jumperSound = Config.mediaSource[2]
	// 跑步者音效
	this.runnerSound = Config.mediaSource[3];
	// resume sound
	this.resumeSound = Config.mediaSource[4];

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
			that.currentRunnerLoc();
			if(that.currentRole === "runner"){
				that.runner.runTimer.start();
			}else{
				that.jumper.jumpTimer.start();
				that.jumper.moveTimer.start();
			}
			that.startJump = true;
			that.startMoveAll = true;
			// play jumper sound
			that.playSound(that.jumperSound);
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

	this.jumperJumpFallBehavior = {
		originTop:0,
		distanceGap:0,
		distanceGapB:0,
		direction:"up",
		runnerVerticalSpeed : 0,
		jumpDirection:function(){
			if(that.currentPointer > 12 && that.currentPointer < 25){
				this.direction = "down";
				this.jumperVerticalUpSpeed = that.jumperVerticalDownSpeed;
				this.jumperVerticalDownSpeed = that.jumperJumpUpSpeed;
			}else{
				this.direction = "up";
				this.jumperVerticalUpSpeed = that.jumperVerticalUpSpeed;
				this.jumperVerticalDownSpeed = that.jumperJumpDownSpeed;
			}
		},
		execute:function(sprite,context,time){
			if(!that.startJump) return;
			if(!this.originTop){
				this.originTop = sprite.top;
			}
			if(sprite.jumpTimer.isRunning()){
				// 确认方向
				this.jumpDirection();

				if(!sprite.jumpTimer.isExpired()){
					var framePerSecond = 1/that.commonFps;
					sprite.velocityY = (this.jumperVerticalUpSpeed - Config.GRAVITY_FORCE * (sprite.jumpTimer.getElapsedTime() / 1000)) * that.pixPerMeter * framePerSecond;
					sprite.top -=  sprite.velocityY
				}else{
					sprite.jumpTimer.stop();
					sprite.fallTimer.start();
				}
			}else if(sprite.fallTimer.isRunning()){
				if(!sprite.fallTimer.isExpired() && !that.startMovePer){
					var framePerSecond = 1/that.commonFps;
					sprite.velocityY = (this.jumperVerticalDownSpeed + Config.GRAVITY_FORCE * (sprite.fallTimer.getElapsedTime() / 1000)) * that.pixPerMeter * framePerSecond;
					sprite.top +=  sprite.velocityY;
					// 修正垂直距离差
					// this.distanceGap = that.verticalPacePix * 1.05 - Math.abs(sprite.top - this.originTop);
					// if(this.distanceGap > 0){
					// 	this.originTop = 0;
					// 	if(that.currentPointer > 12 && that.currentPointer < 25){
					// 		// sprite.left -= this.distanceGap;
					// 		sprite.top += this.distanceGap
					// 	}else{
					// 		sprite.top -= this.distanceGap;
					// 	}
					// }
				}else{
					that.startMovePer = false;
					if(that.startMoveAll){
						sprite.jumpTimer.start();
					}else{
						sprite.fallTimer.stop();
						that.startJump = false;
					}
				}
			}
		}
	};
	
	this.jumperMoveBehavior = {
		distanceGap:0,
		originLeft:0,
		execute:function(sprite,context,time){
			if(!that.startMoveAll) return;

			that.roleActionStart = false;

			if(!this.originLeft){
				this.originLeft = sprite.left;
			}
			if(sprite.moveTimer.isRunning()){
				var framePerSecond = 1/that.commonFps;
				sprite.velocityX = that.jumperPixEverySec * framePerSecond;

				if(that.currentPointer > 6 && that.currentPointer < 19){
					sprite.left +=  sprite.velocityX;
				}else{
					sprite.left -=  sprite.velocityX;
				}
				// 修正平移距离差
				this.distanceGap= Math.abs(sprite.left - this.originLeft) - that.horizontalPacePix;
				if(this.distanceGap > 0){
					this.originLeft = 0;
					if(that.currentPointer > 6 && that.currentPointer < 19){
						sprite.left -= this.distanceGap;
					}else{
						sprite.left += this.distanceGap;
					}
				}
			}
			
			if(sprite.moveTimer.isExpired()){
				if(that.currentPointer === 24){
					that.jumper.top = that.rolesInitialTop;
					that.jumper.left = that.rolesInitialLeft;
				}
				that.startMovePer = true;
				if(--that.diceTotal){
					// 确定每一跳后的位置
					that.currentRunnerLoc();
					// jumper sound
					that.playSound(that.jumperSound);

					sprite.moveTimer.start();
				}else{
					sprite.moveTimer.stop();
					that.startMoveAll = false;
					that.roleActionStart = true;
					// 人物开始动作
					// 显示相应的结果
					that.showResult(that.currentPointer);
				}
			}
		}
	};
	this.jumperActionBehavior = {
		lastAdvanceTime:0,
		changeFrequencyTime:250,
		execute:function(sprite,context,time){
			if(!that.roleActionStart) return;

			if(this.lastAdvanceTime === 0){
				this.lastAdvanceTime = time;
			}
			if(time - this.lastAdvanceTime > this.changeFrequencyTime){
				sprite.painter.advance();
				this.lastAdvanceTime = time;
			}
		}
	};
	this.jumperBehavior = [this.jumperJumpFallBehavior,this.jumperMoveBehavior,this.jumperActionBehavior];

	this.runnerRunActionBehavior = {
		lastAdvanceTime:0,
		changeFrequencyTime:150,
		updateAdvance:function(sprite){
			if(that.currentPointer >= 0 && that.currentPointer < 6){
				if(sprite.painter.cellsIndex >= 7){
					sprite.painter.cellsIndex = 0;
				}
			}
			if(that.currentPointer >= 6 && that.currentPointer < 12){
				if(sprite.painter.cellsIndex >= 14 || sprite.painter.cellsIndex < 7){
					sprite.painter.cellsIndex = 7;
				}
			}
			if(that.currentPointer >= 12 && that.currentPointer < 18){
				if(sprite.painter.cellsIndex >= 21 || sprite.painter.cellsIndex < 14){
					sprite.painter.cellsIndex = 14;
				}
			}
			if(that.currentPointer >= 18 && that.currentPointer < 24){
				if(sprite.painter.cellsIndex >= 28 || sprite.painter.cellsIndex < 21){
					sprite.painter.cellsIndex = 21;
				}
			}
		},
		execute:function(sprite,context,time){
			if(this.lastAdvanceTime === 0){
				this.lastAdvanceTime = time;
			}
			if(time - this.lastAdvanceTime > this.changeFrequencyTime){
				// sprite.painter.advance();
				this.updateAdvance(sprite);
				this.lastAdvanceTime = time;
			}
		}
	};
	this.runnerLingerActionBehavior = {
		lastAdvanceTime:0,
		changeFrequencyTime:100,
		execute:function(sprite,context,time){
			// if(!that.roleActionStart) return;

			// if(this.lastAdvanceTime === 0){
			// 	this.lastAdvanceTime = time;
			// }
			// if(time - this.lastAdvanceTime > this.changeFrequencyTime){
			// 	sprite.painter.advance();
			// 	this.lastAdvanceTime = time;
			// }
		}
	};
	this.runnerMoveBehavior = {
		execute:function(sprite,context,time){
			if(that.roleActionStart) return;

			if(sprite.runTimer.isRunning()){
				var framePerSecond = 1/that.commonFps;
				sprite.velocityX = that.runnerVPixEverySec * framePerSecond;
				sprite.velocityY = that.runnerHPixEverySec * framePerSecond;
				if(that.currentPointer < 6){
					sprite.left -= sprite.velocityX;
					sprite.top -= sprite.velocityY
				}else if(that.currentPointer >= 6 && that.currentPointer < 12){
					sprite.left += sprite.velocityX;
					sprite.top -= sprite.velocityY;
				}else if(that.currentPointer >= 12 && that.currentPointer < 18){
					sprite.left += sprite.velocityX;
					sprite.top += sprite.velocityY;
				}else{
					sprite.left -= sprite.velocityX;
					sprite.top += sprite.velocityY;
				}
			}
			if(sprite.runTimer.isExpired()){
				if(that.currentPointer === 24){
					that.runner.top = that.rolesInitialTop;
					that.runner.left = that.rolesInitialLeft;
				}
				if(--that.diceTotal){
					// 确定每一步后的位置
					that.currentRunnerLoc();
					// runner sound
					that.playSound(that.runnerSound);

					sprite.runTimer.start();
				}else{
					sprite.runTimer.stop();
					that.runnerActionStart = true;
					// 人物开始动作
					// 显示相应的结果
					that.showResult(that.currentPointer);
				}
			}
		}
	};
	this.runnerBehavior = [this.runnerRunActionBehavior,this.runnerLingerActionBehavior,this.runnerMoveBehavior];

	this.sprites = [];
}

Game.prototype = {
	start:function(){
		var that = this;
		that.showSelectRole();
		// 选择角色
		that.selectRole(function(){
			that.coverAni(document.querySelector(".select-role-wrap"),-that.canvasHeight,800,gameEasing.easeIn,function(){
				that.cutDownStart();
			})
		});
		that.clearPause();
	},
	startGame:function(){
		// start sound
		this.playSound(this.startSound);

		that.createSprites();
		that.createResumeLoc();
		that.startShakeDice();

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
			this.commonFps = this.fps(time);
			this.drawSprites(time);
			window.requestAnimationFrame(function(time){
				that.animate.call(that,time);
			});
		}
	},
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
	cutDown:function(time,callback){
		var cutInterVal,
			cur = time,
			$gameCutDown = document.querySelector(".game-cutdown");
		for(var i = 0;i <= time;i++){
			(function(i){
				cutInterVal = setTimeout(function(){
					$gameCutDown.innerHTML = cur;
					cur--;
					if(i === time){
						clearTimeout(cutInterVal);
						callback();
					}
				},i * 1000)
			})(i)
		}
	},
	cutDownStart:function(){
		this.cutDown(5,this.startGame);
	},
	drawSprites:function(time){
		context.clearRect(0,0,this.canvasWidth,this.canvasHeight);
		// embelish
		this.drawEmbelish();
		// walkMap
		this.drawWalkMap();
		// dice
		this.drawDice(time);
		// roles
		this.drawRoles(time);
	},
	createSprites:function(){
		// walkMap
		this.createWalkMap();
		// embelish
		this.createEmbelish();
		// dice
		this.createDice();
		// roles
		this.createRoles();
	},
	createWalkMap:function(){
		this.mapBlockLeft = new Sprite("map-block",new drawStaticImage(Config.imgSource[0],Config.jsonObj["main"]["map-block-left.png"]));
		this.mapBlockTop = new Sprite("map-block",new drawStaticImage(Config.imgSource[0],Config.jsonObj["main"]["map-block-top.png"]));
		this.mapBlockBottom = new Sprite("map-block",new drawStaticImage(Config.imgSource[0],Config.jsonObj["main"]["map-block-bottom.png"]));
		this.mapBlockRight = new Sprite("map-block",new drawStaticImage(Config.imgSource[0],Config.jsonObj["main"]["map-block-right.png"]));

		this.mapBlockBlue = new Sprite("map-block",new drawStaticImage(Config.imgSource[0],Config.jsonObj["main"]["block-blue.png"]));
		this.mapBlockRed = new Sprite("map-block",new drawStaticImage(Config.imgSource[0],Config.jsonObj["main"]["block-red.png"]));
		this.mapBlockGrey = new Sprite("map-block",new drawStaticImage(Config.imgSource[0],Config.jsonObj["main"]["block-grey.png"]));
		this.mapBlockWhite = new Sprite("map-block",new drawStaticImage(Config.imgSource[0],Config.jsonObj["main"]["block-white.png"]));
		this.mapBlockGreen = new Sprite("map-block",new drawStaticImage(Config.imgSource[0],Config.jsonObj["main"]["block-green.png"]));
		this.mapBlockWBlue = new Sprite("map-block",new drawStaticImage(Config.imgSource[0],Config.jsonObj["main"]["block-wblue.png"]));
	},
	createDice:function(){
		this.diceOne = new Sprite("diceThree",new SpriteSheets(Config.imgSource[0],
																this.findCellData("diceThree",Config.jsonObj["main"])),
																this.diceOneBehaivor);
		this.diceTwo = new Sprite("diceTwo",new SpriteSheets(Config.imgSource[0],
																this.findCellData("diceTwo",Config.jsonObj["main"])),
																this.diceTwoBehaivor);

		this.diceOne.diceAnimationTimer = new AnimationTimer(this.diceOneAniTime);
		this.diceTwo.diceAnimationTimer = new AnimationTimer(this.diceTwoAniTime);

		// dice放到canvas外面
		this.diceLocReset();
	},
	createRoles:function(){
		// jumpers
		this.jumper = new Sprite("jumper",new SpriteSheets(Config.imgSource[2],
																this.findCellData(this.role,Config.jsonObj["jumpers"])),this.jumperBehavior);
		this.jumper.top = this.rolesInitialTop;
		this.jumper.left = this.rolesInitialLeft;
		this.jumper.jumpTimer = new AnimationTimer(this.jumperJumpAniTime);
		this.jumper.fallTimer = new AnimationTimer(this.jumperJumpAniTime);
		this.jumper.moveTimer = new AnimationTimer(this.jumperMoveAniTime);

		// runners
		this.runner = new Sprite("runner",new SpriteSheets(Config.imgSource[3],
																this.findCellData(this.role,Config.jsonObj["runners"])),this.runnerBehavior);
		this.runner.left = this.rolesInitialLeft;
		this.runner.top = this.rolesInitialTop;
		this.runner.runTimer = new AnimationTimer(this.runnerAniTime);
	},
	createEmbelish:function(){
		// 水平围栏
		this.enclosureHorizontal = new Sprite("enclosure-horizontal",new drawStaticImage(Config.imgSource[1],
																				Config.jsonObj["embellish"]["enclosure-horizontal.png"]));
		// 垂直围栏
		this.enclosureVertical = new Sprite("enclosure-vertical",new drawStaticImage(Config.imgSource[1],
																				Config.jsonObj["embellish"]["enclosure-vertical.png"]));
		// 大树1
		this.tree1 = new Sprite("tree1",new drawStaticImage(Config.imgSource[1],Config.jsonObj["embellish"]["tree-1.png"]));
		// 大树2
		this.tree2 = new Sprite("tree2",new drawStaticImage(Config.imgSource[1],Config.jsonObj["embellish"]["tree-2.png"]));
		this.tree2.top = this.canvasHeight - 120;
		// 帐篷
		this.tent = new Sprite("tent",new drawStaticImage(Config.imgSource[1],Config.jsonObj["embellish"]["tent.png"]));
		this.tent.left = this.canvasWidth - 160;
		// 柴火（两堆）
		this.firewood = new Sprite("firewood",new drawStaticImage(Config.imgSource[1],Config.jsonObj["embellish"]["firewood.png"]));
		this.firewood.top = 160;
		// 木桶（两堆）
		this.cask = new Sprite("cask",new drawStaticImage(Config.imgSource[1],Config.jsonObj["embellish"]["cask.png"]));
		this.cask.top = 120;
		// chair
		this.chair = new Sprite("chair",new drawStaticImage(Config.imgSource[1],Config.jsonObj["embellish"]["chair.PNG"]));
		this.chair.left = 50;
		this.chair.top = 400;
	},
	drawWalkMap:function(){
		context.save();
		context.translate(this.walkMapLeft,this.walkMapTop);
		context.rotate(45 * Config.deg);
		context.transform(1,-this.matrixSlope,-this.matrixSlope,1,0,0);

		for(var i = 0;i < 24;i++){
			if(i < 6){
				this.mapBlockBlue.top = 60*24/4;
				this.mapBlockBottom.top = 60*24/4;
				if(this.resumeArr.indexOf(i) !== -1){
					this.mapBlockBlue.left = 60 * (6 - i);
					this.mapBlockBlue.paint(context)
				}else{
					this.mapBlockBottom.left = 60 * (6 - i);
					this.mapBlockBottom.paint(context)
				}
			}		
			if(i >= 6 && i < 12){
				this.mapBlockRed.left = 0;
				this.mapBlockRight.left = 0;
				if(this.resumeArr.indexOf(i) !== -1){
					this.mapBlockRed.top = 60*(12 - i);
					this.mapBlockRed.paint(context)
				}else{
					this.mapBlockRight.top = 60*(12 - i);
					this.mapBlockRight.paint(context)
				}
			}
			if(i >= 12 && i < 18){
				this.mapBlockWhite.top = 0;
				this.mapBlockBottom.top = 0;
				if(this.resumeArr.indexOf(i) !== -1){
					this.mapBlockWhite.left = 60 * (i - 12);
					this.mapBlockWhite.paint(context)
				}else{
					this.mapBlockBottom.left = 60 * (i - 12);
					this.mapBlockBottom.paint(context)
				}
			}
			if(i >= 18 && i < 24){
				this.mapBlockWBlue.left = 60 * 6;
				this.mapBlockRight.left = 60 * 6;
				if(this.resumeArr.indexOf(i) !== -1){
					this.mapBlockWBlue.top = 60*(i - 18);
					this.mapBlockWBlue.paint(context)
				}else{
					this.mapBlockRight.top = 60*(i - 18);
					this.mapBlockRight.paint(context)
				}
			}
		}
		context.restore();
	},
	drawDice:function(time){
		this.diceOne.paint(context);
		this.diceOne.update(context,time);

		this.diceTwo.paint(context);
		this.diceTwo.update(context,time);
	},
	drawRoles:function(time){
		this.currentRole === "jumper" ? this.drawJumper(time) : this.drawRunner(time);
	},
	drawJumper:function(time){
		this.jumper.paint(context);
		this.jumper.update(context,time);
	},
	drawRunner:function(time){
		this.runner.paint(context);
		this.runner.update(context,time)
	},
	drawEmbelish:function(){
		// 围栏
		this.enclosureHorizontal.top = 0;
		for(var i = 0;i < 8;i++){
			this.enclosureHorizontal.left = i * 132 + 11;
			this.enclosureHorizontal.paint(context);
		}
		this.enclosureHorizontal.top = this.canvasHeight - 30;
		for(var i = 0;i < 8;i++){
			this.enclosureHorizontal.left = i * 132 + 11;
			this.enclosureHorizontal.paint(context);
		}
		this.enclosureVertical.left = 0;
		for(var i = 0;i< 4 ;i++){
			this.enclosureVertical.top = i * 170; 
			this.enclosureVertical.paint(context);
		}
		this.enclosureVertical.left = this.canvasWidth - 15;
		for(var i = 0;i< 4 ;i++){
			this.enclosureVertical.top = i * 170;
			this.enclosureVertical.paint(context);
		}

		// 各种静态装饰物
		// 树1和树2
		this.tree1.paint(context);
		for(var i = 0;i < 2;i++){
			this.tree2.left = this.canvasWidth - 95 * (i+1);
			this.tree2.paint(context);
		}
		// 帐篷
		this.tent.paint(context);
		// 柴火
		for(var i = 0;i < 2;i++){
			this.firewood.left = this.canvasWidth - 32 * 2 * (i+1);
			this.firewood.paint(context);
		}
		// 木桶
		for(var i = 0;i < 2;i++){
			this.cask.left = (i+1) * 60;
			this.cask.paint(context);
		}
		// 椅子
		this.chair.paint(context);
	},
	selectRole:function(callback){
		var $roleObj = document.querySelectorAll(".role-list"),
			len = $roleObj.length,
			that = this;
		for(var i = 0;i < len;i++){
			(function(i){
				$roleObj[i].addEventListener("click",function(e){
					that.role = this.dataset.data("role");
					$roleObj[i].className += "";
					that.currentRole = that.role === "runner" ? "runner" : "jumper"; 
					callback();
				},false)
			})(i)
		}
	},
	showSelectRole:function(){
		var that = this,
			$gameCover = document.querySelector(".game-cover");
		document.querySelector(".start-game-btn").addEventListener("click",function(e){
			e.preventDefault();
			that.coverAni($gameCover,-that.canvasHeight,800,gameEasing.easeOut,function(){
				console.log("please select role!!")
			})
		},false)
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
		var $resumeDetail = document.querySelector(".game-resume-detail");
		$resumeDetail.className = "game-resume-detail animated zoomIn";
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
	closeResume:function(){
		var $resumeClose = document.querySelector(".game-resume-close");
		$resumeClose.addEventListener("click",function(){
			this.parentNode.className = "game-resume-detail animated zoomOut";
		},false)
	},
	getSprites:function(name){
		for(var i = 0;i < this.sprites.length;i++){
			if(name === this.sprites[i].name){
				return this.sprites[i];
			}
		}
		return null;
	},
	soundIsPlaying:function(sound){
		return !sound.ended && sound.currentTime > 0;
	},
	playSound:function(sound){
		if(!this.soundIsPlaying(sound)){
			sound.play();
		}else{
			sound.load();
			sound.play();
		}
	},
	findCellData:function(name,jsonObj){
		var cellDatas = [];
		// jsonCells中存在，则直接返回
		// if(name in this.jsonCells){
		// 	return this.jsonCells[name];
		// }
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
	},
	// 上下滑动
	coverAni:function(obj,lastTop,aniTime,aniWay,fn){
		var oldTop = obj.style.top ? parseInt(obj.style.top) : 0,
			changeTime = 16,
			lastTop = parseInt(lastTop),
			topGap = Math.abs(lastTop - oldTop),
			step = topGap / (aniTime/changeTime),
			precent,
			i = 1,
			coverInterVal;

		coverInterVal = setInterval(function(){
			var originTop = obj.style.top ? parseInt(obj.style.top) : 0,
				precent = step * i / topGap,
				currentTop = oldTop - (step * i) * (aniWay(precent) / precent);
			obj.style.top = currentTop + "px";
			i++;
			if(precent >= 1){
				clearInterval(coverInterVal);
				fn.call(obj);
				return;
			}
		},changeTime)
	}
	// drawGround:function(){
	// 	this.grassland = new Sprite("grassland",new SpriteSheets(Config.imgSource[1],
	// 															this.findCellData("grassland.png",Config.jsonObj["embellish"])))
	// 	for(var i = 0;i < this.grasslandY;i++){
	// 		for(var j = 0;j < this.grasslandX;j++){
	// 			this.grassland.left = j * Config.grassWidth;
	// 			this.grassland.top = i * Config.grassHeight;
	// 			this.grassland.paint(context);
	// 		}
	// 	}
	// },
}
var gameEasing = {
	liner:function(p){
		return p;
	},
	swing:function(p){
		return 0.5 - Math.cos( p*Math.PI ) / 2;
	},
	easeInOut:function(p){
		return p - Math.sin(p * 2 * Math.PI) / (2 * Math.PI);
	},
	easeOut:function(p){
		return 1 - Math.pow(1 - p,2);
	},
	easeIn:function(p){
		return Math.pow(p,2);
	}
}
