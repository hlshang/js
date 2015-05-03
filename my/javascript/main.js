function Game(){
	var that = this;

	this.canvasWidth = canvas.width;
	this.canvasHeight = canvas.height;
	// json cells 缓存
	this.jsonCells = {};
	// 角色分类 两种 jumper and runner
	this.currentRole = "jumper";
	// 角色:boy or girl or runner
    // 默认为 boy
	this.role = "boy";
	// 角色的宽高
	this.roleWidth = 0;
	this.roleHeight = 0;
	// 倒计时 默认为3s
	this.cutDownTime = 3;
	// 当前是否进入了小黑屋
	this.entranceBlackRoom = false;
	// 逃离小黑屋需投掷的骰子次数
	this.fleeBlackRoom = 3;
	// 假定地图高为10m
	this.canvasPresumeHeight = 10;
	this.canvasHalfPersumeHeight = this.canvasPresumeHeight / 2;
	// pix/meter
	this.pixPerMeter = this.canvasHeight / this.canvasPresumeHeight;
	// 骰子的时间
	this.diceOneAniTime = 900;
	this.diceTwoAniTime = 1000;
	// 骰子下落到地图一半（5m）所需的初始垂直速度（m/s）
	this.diceOneYStartSpeed = (this.canvasHalfPersumeHeight - 0.5 * Config.GRAVITY_FORCE * Math.pow(this.diceOneAniTime / 1000,2)) / (this.diceOneAniTime / 1000);
	this.diceTwoYStartSpeed = (this.canvasHalfPersumeHeight - 0.5 * Config.GRAVITY_FORCE * Math.pow(this.diceTwoAniTime / 1000,2)) / (this.diceTwoAniTime / 1000);
	// 骰子水平每秒移动像素
	this.diceOnePixPerSec = (this.canvasWidth / 2) / (this.diceOneAniTime / 1000) + 100;
	this.diceTwoPixPerSec = (this.canvasWidth / 2) / (this.diceTwoAniTime / 1000);
	// 骰子是否停止投掷
	this.diceStopShake = true;
	// 摇骰子时鼠标的状态
	this.mousedown = false;
	this.mouseup = false;
	// 开始丢骰子
	this.startShakeOneDice = false;
	this.startShakeTwoDice = false;
	this.dicesIsHidden = true;
	// 骰子最终数
	this.diceOneNum = 0;
	this.diceTwoNum = 0;
	// 骰子总数
	this.diceTotal = 0;
	// 行走地图倾斜角度
	this.slopeAngle = Config.slopeAngle * Config.deg;
	// 矩阵倾斜角度
	this.matrixSlope = 45 * Config.deg - Config.slopeAngle * Config.deg;

	// 行走地图的真实高度和宽度（比行走图多一格）
	this.mapRealHorizontal = 60 * 7 * Math.cos(this.matrixSlope) / Math.cos(this.slopeAngle);
	this.mapRealVertical = this.mapRealHorizontal * Math.tan(this.matrixSlope); 

	// 行走地图宽度和高度（1/2）
	this.mapHorizontal = 60 * 6 * Math.cos(this.matrixSlope) / Math.cos(this.slopeAngle);
	this.mapVertical = this.mapHorizontal * Math.tan(this.matrixSlope);

	// 行走地图在画布中的离左上角的坐标（水平垂直居中）
	this.walkMapLeft = this.canvasWidth / 2  - this.mapRealHorizontal;
	this.walkMapTop = this.canvasHeight / 2 - this.mapRealVertical;
	
	// 一格的长度
	this.horizontalPacePix = Math.floor(this.mapHorizontal / 6);
	// 一格的高度
	this.verticalPacePix = Math.floor(this.mapVertical / 6);
	// 跳跃者每一步的时间
	this.jumperMoveAniTime = 300;
	// 跳跃和下降的时间，为移动时间的一半，减去些许误差时间
	this.jumperJumpAniTime = (this.jumperMoveAniTime - 20 )/ 2;
	// 每两格中心点间的高度(m)
	this.jumperGridMeter = this.verticalPacePix * this.canvasHalfPersumeHeight / (this.canvasHeight / 2);
	// 每秒水平移动多少像素
	this.jumperPixEverySec = Math.floor(this.horizontalPacePix / (this.jumperMoveAniTime / 1000));
	// 人物向上/下跳动的垂直速度
	// 跳跃高度为1.5倍的两格中心点的高度
	// 根据 vt + 0.5 * gt² = s (加速度方向为负)公式求出：
	// 向上跳跃时和下降时的初始速度（向上行走）
	this.jumperLeftUpSpeed = (this.jumperGridMeter * 2.0 + 0.5 * Config.GRAVITY_FORCE * Math.pow(this.jumperJumpAniTime / 1000,2)) / (this.jumperJumpAniTime / 1000);
	this.jumperLeftDownSpeed = (this.jumperGridMeter * 1.0 - 0.5 * Config.GRAVITY_FORCE * Math.pow(this.jumperJumpAniTime / 1000,2)) / (this.jumperJumpAniTime / 1000);
	// 向上跳跃时和下降时的初始速度（向下行走）
	this.jumperRightUpSpeed = (this.jumperGridMeter * 1.0 + 0.5 * Config.GRAVITY_FORCE * Math.pow(this.jumperJumpAniTime / 1000,2)) / (this.jumperJumpAniTime / 1000);
	this.jumperRightDownSpeed = (this.jumperGridMeter * 2.0 - 0.5 * Config.GRAVITY_FORCE * Math.pow(this.jumperJumpAniTime / 1000,2)) / (this.jumperJumpAniTime / 1000);

	// 跑步者每一格的时间
	this.runnerAniTime = 300;
	// 跑步者水平速度（每秒水平移动多少像素）
	this.runnerHPixEverySec = Math.floor(this.horizontalPacePix / (this.runnerAniTime / 1000));
	this.runnerVPixEverySec = this.runnerHPixEverySec * Math.tan(this.matrixSlope);
	// 角色是否正在移动
	this.roleIsMoving = false;
	// 人物跳动到哪个格子
	this.currentPointer = 0;
	// 掷完骰子后人物跳到哪个格子上
	this.lastPointer = 0;
	// 是否已经选择了扑克
	this.pokerSelect = false;

	// 是否正在快捷键查看简历
	this.shortCutView = false;
	this.coverSlideTime = 400;
	this.lastFrameTime = 0;
	this.lastFpsUpdateTime = 0;
	this.pauseGameTag = false;

	// 空格键触发暂停
	this.spaceTriggerPause = false;
	this.commonFps = 60;
	this.resumeArr = [];
	// selector
	this.fpsShow = document.getElementById("fps-show");
	this.selectRoleWrap = document.querySelector(".select-role-wrap");
	this.gameCutDown = document.querySelector(".game-cutdown");
	this.roleListAll = document.querySelectorAll(".role-list");
	this.gameCoverWrap = document.querySelector(".game-cover-wrap");
	this.gameCover = document.querySelector(".game-cover");
	this.precentWrap = document.querySelector(".load-precent-wrap");
	this.startGameBtn = document.querySelector(".start-game-btn");
	this.gameResumeDetail = document.querySelector(".game-resume-detail");
	this.gameResumeWrap = document.querySelector(".game-resume-wrap");
	this.gameResumeClose = document.querySelector(".game-resume-close");
	this.rollDiceWrap = document.querySelector(".roll-dice-wrap");
	this.rollBtn = document.getElementById("roll-dice-btn");
	this.rollCountSelect = document.querySelector(".roll-count-select");
	this.rollNumShow = document.querySelector(".roll-num-show");
	this.miniGameWrap = document.querySelector(".mini-game-wrap");
	this.pokerListBack = document.querySelectorAll(".poker-list-back");
	this.pokerList = document.querySelectorAll(".poker-list");
	this.pokerTipsWrap = document.querySelector(".poker-tips-wrap");
	this.gameBlackRoom = document.querySelector(".game-black-room");
	this.audioBtn = document.querySelector(".audio-btn");
	this.rulesWrap = document.querySelector(".rules-wrap");
	// cutDown sound
	this.cutSound = document.getElementById("mp3-cutdown");
	//开始音效
	this.startSound = document.getElementById("mp3-start");
	// 骰子音效
	this.diceSound = document.getElementById("mp3-dice");
	// 跳跃音效
	this.jumperSound = document.getElementById("mp3-jumper");
	// 跑步音效
	this.runnerSound = document.getElementById("mp3-runner");
	// resume sound
	this.resumeSound = document.getElementById("mp3-resume");

	this.diceOnePaintBehaivor = {
		lastAdvance:0,
		lastAdvanceTime:0,
		changeFrequencyTime:100,
		updateAdvance:function(sprite){
			if(sprite.painter.cellsIndex < 6){
				sprite.painter.cellsIndex = 6;
			}else{
				if(this.lastAdvance === 6){
					this.lastAdvance = 0;
				}
				sprite.painter.cellsIndex = this.lastAdvance++;
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
					this.lastAdvance = 0;
				}
				sprite.painter.cellsIndex = this.lastAdvance++;
			}
		},
		isInBlackRoom:function(){
			if(that.entranceBlackRoom){
				that.fleeBlackRoom--;
				// 投掷三次或者点数相同，则跳出小黑屋
				if(!that.fleeBlackRoom || that.diceOneNum === that.diceTwoNum){
					that.fleeBlackRoom = 3;
					that.entranceBlackRoom = false;
					return false;
				}
				return true;
			}
			return false;
		},
		roleStartMove:function(){
			that.currentRunnerLoc();
			that.roleIsAction = false;
			that.roleIsMoving = true;

			if(that.currentRole === "runner"){
				that.runner.runTimer.start();
			}else{
				that.jumper.jumpTimer.start();
				that.jumper.moveTimer.start();
			}
		},
		execute:function(sprite,context,time){
			var self = this;
			if(!that.startShakeTwoDice) return;

			if(sprite.diceAnimationTimer.isExpired()){
				that.startShakeTwoDice = false;
				sprite.painter.cellsIndex = that.diceTwoNum;
				// 显示骰子数
				that.diceNumShow(that.diceTotal);
				// 在小黑屋里面 直接返回
				if(this.isInBlackRoom()){
					that.rollDiceShow(true);
					setTimeout(function(){
						that.diceLocReset();
					},500)
					return;
				}
				var timeOut = setTimeout( function(){
					if(that.pauseGameTag){
						setTimeout(arguments.callee,200);
					}else{
						self.roleStartMove();
						that.diceLocReset();
						clearTimeout(timeOut);
					}
				},800)

				return false;
			}
			if(this.lastAdvanceTime === 0){
				this.lastAdvanceTime = time;
			}
			if(time - this.lastAdvanceTime > (this.changeFrequencyTime -= 2)){
				this.updateAdvance(sprite);
				this.lastAdvanceTime = time;
			}
		}
	};
	this.diceTwoMoveBehaivor = {
		execute:function(sprite,context,time){
			if(sprite.diceAnimationTimer.isRunning()){
				that.diceStopShake = false;
				var framePerSecond = 1/that.commonFps;
				sprite.velocityX = that.diceTwoPixPerSec * framePerSecond;
				sprite.velocityY = (that.diceTwoYStartSpeed + Config.GRAVITY_FORCE * (sprite.diceAnimationTimer.getElapsedTime() / 1000)) * that.pixPerMeter * framePerSecond;
				sprite.left += sprite.velocityX;
				sprite.top += sprite.velocityY;
			}
			if(sprite.diceAnimationTimer.isExpired()){
				that.diceStopShake = true;
				sprite.diceAnimationTimer.stop();
			}
		}
	};
	this.diceTwoBehaivor = [this.diceTwoPaintBehaivor,this.diceTwoMoveBehaivor];

	this.jumperJumpFallBehavior = {
		direction:"up",
		distanceTopGap:0,
		originTop:0,
		verticalAmend:function(sprite){
			this.distanceTopGap = (Math.abs(sprite.top - this.originTop) - that.verticalPacePix).toFixed(2) - 0;
			this.originTop = 0;
			
			if(this.distanceTopGap < 0){
				if(that.currentPointer > 12 && that.currentPointer < 25){
					sprite.top -= this.distanceTopGap;
				}else{
					sprite.top += this.distanceTopGap;
				}
			}else{
				if(that.currentPointer > 12 && that.currentPointer < 25){
					sprite.top -= this.distanceTopGap;
				}else{
					sprite.top += this.distanceTopGap;
				}
			}
		},
		jumpDirection:function(){
			if(that.currentPointer > 12 && that.currentPointer < 25){
				this.direction = "down";
				this.jumperVerticalUpSpeed = that.jumperRightUpSpeed;
				this.jumperVerticalDownSpeed = that.jumperRightDownSpeed;
			}else{
				this.direction = "up";
				this.jumperVerticalUpSpeed = that.jumperLeftUpSpeed;
				this.jumperVerticalDownSpeed = that.jumperLeftDownSpeed;
			}
		},
		execute:function(sprite,context,time){
			if(!that.roleIsMoving) return;

			if(!this.originTop){
				this.originTop = sprite.top;
			}
			var framePerSecond = 1/that.commonFps;
			if(sprite.jumpTimer.isRunning()){
				// 确认方向
				this.jumpDirection();

				sprite.velocityY = (this.jumperVerticalUpSpeed - Config.GRAVITY_FORCE * (sprite.jumpTimer.getElapsedTime() / 1000)) * that.pixPerMeter * framePerSecond;
				sprite.top -=  sprite.velocityY;

				if(sprite.jumpTimer.isExpired()){
					sprite.jumpTimer.stop();
					sprite.fallTimer.start();
				}
			}else if(sprite.fallTimer.isRunning()){
				sprite.velocityY = (this.jumperVerticalDownSpeed + Config.GRAVITY_FORCE * (sprite.fallTimer.getElapsedTime() / 1000)) * that.pixPerMeter * framePerSecond;
				sprite.top +=  sprite.velocityY;
				
				if(sprite.fallTimer.isExpired()){
					that.jumperFallEnd = true;

					// 修正垂直距离差
					this.verticalAmend(sprite);
				}
			}
		}
	};
	
	this.jumperMoveBehavior = {
		distanceLeftGap:0,
		originLeft:0,
		peakAmend:function(sprite){
			if(that.currentPointer === 12){
				that.jumper.top = that.rolesHalfTop;
				that.jumper.left = that.rolesHalfLeft;
			}
			if(that.currentPointer === 24){
				that.jumper.top = that.rolesInitialTop;
				that.jumper.left = that.rolesInitialLeft;
			}
		},
		horizontalAmend:function(sprite){
			this.distanceLeftGap = (Math.abs(sprite.left - this.originLeft) - that.horizontalPacePix).toFixed(2) - 0;
			this.originLeft = 0;

			// 一般都大于0
			if(this.distanceLeftGap > 0){
				if(that.currentPointer > 6 && that.currentPointer < 19){
					sprite.left -= this.distanceLeftGap;
				}else{
					sprite.left += this.distanceLeftGap;
				}
			}else{
				if(that.currentPointer > 6 && that.currentPointer < 19){
					sprite.left += this.distanceLeftGap;
				}else{
					sprite.left -= this.distanceLeftGap;
				}
			}
		},
		execute:function(sprite,context,time){
			if(!that.roleIsMoving) return;

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
			}
			if(sprite.moveTimer.isExpired()){
				that.jumperMoveEnd = true;
			}

			if(that.jumperFallEnd && that.jumperMoveEnd){
				that.jumperFallEnd = false;
				that.jumperMoveEnd = false;

				// 起点和顶点重新定位
				this.peakAmend(sprite);
				// 修正水平距离差
				this.horizontalAmend(sprite);

				if(--that.diceTotal){
					// 确定每一跳后的位置
					that.currentRunnerLoc();
					// jumper sound
					that.playSound(that.jumperSound);

					sprite.jumpTimer.start();
					sprite.moveTimer.start();
				}else{
					sprite.fallTimer.stop();
					sprite.moveTimer.stop();
					that.roleIsMoving = false;
					// 人物开始做动作
					that.roleIsAction = true;
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
			if(!that.roleIsAction) return;

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

	this.runnerActionBehavior = {
		lastAdvanceTime:0,
		changeFrequencyTime:100,
		updateAdvance:function(sprite){
			var currentPointer = that.currentPointer,
				spriteCellIndex = sprite.painter.cellsIndex;
			switch(true){
				case currentPointer >= 0 && currentPointer < 6 && spriteCellIndex >= 3:
					sprite.painter.cellsIndex = 0;
					break;
				case currentPointer >= 6 && currentPointer < 12 && spriteCellIndex >= 7:
					sprite.painter.cellsIndex = 4;
					break;
				case currentPointer >= 12 && currentPointer < 18 && spriteCellIndex >= 11:
					sprite.painter.cellsIndex = 8;
					break;
				case currentPointer >= 18 && currentPointer < 24 && spriteCellIndex >= 15:
					sprite.painter.cellsIndex = 12;
					break;
				default:break;
			}
		},
		execute:function(sprite,context,time){
			if(!that.roleIsMoving) return;

			if(this.lastAdvanceTime === 0){
				this.lastAdvanceTime = time;
			}
			if(time - this.lastAdvanceTime > this.changeFrequencyTime){
				sprite.painter.advance();
				this.updateAdvance(sprite);
				this.lastAdvanceTime = time;
			}
		}
	};
	this.runnerMoveBehavior = {
		execute:function(sprite,context,time){
			if(!that.roleIsMoving) return;

			if(sprite.runTimer.isRunning()){
				var framePerSecond = 1/that.commonFps;
				sprite.velocityX = that.runnerHPixEverySec * framePerSecond;
				sprite.velocityY = that.runnerVPixEverySec * framePerSecond;

				if(that.currentPointer > 6 && that.currentPointer < 19){
					sprite.left += sprite.velocityX;
				}else{
					sprite.left -= sprite.velocityX;
				}
				if(that.currentPointer > 0 && that.currentPointer < 13){
					sprite.top -= sprite.velocityY;
				}else{
					sprite.top += sprite.velocityY;
				}
			}
			if(sprite.runTimer.isExpired()){
				// 修正起点位置
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
					that.roleIsMoving = false;
					// 人物开始动作
					// 显示相应的结果
					that.showResult(that.currentPointer);
				}
			}
		}
	};
	this.runnerBehavior = [this.runnerActionBehavior,this.runnerMoveBehavior];
}

Game.prototype = {
	start:function(){
		var that = this;
		this.showStartBtn();
		this.showSelectRole();
		this.audioToggle();

		// 选择角色
		this.selectRole(function(){
			that.coverAni(that.selectRoleWrap,-that.canvasHeight,that.coverSlideTime,gameEasing.easeIn,function(){
				document.body.removeChild(that.gameCoverWrap);
				that.cutDown(that.cutDownTime,function(){
					// 开始游戏
					that.startGame();
				});
			});
		});
	},
	startGame:function(){
		var that = this;

		this.showRules();
		// start sound
		this.playSound(this.startSound);

		this.confirmRoleWH();
		this.pauseGame();
		this.createResumeLoc();
		this.rollDiceShow(true);

		this.createSprites();
		this.startShakeDice();
		this.closeResume();

		// window blur/focus
		this.windowFocus();

		window.requestAnimationFrame(function(time){
			that.animate.call(that,time);
		});
	},
	animate:function(time){
		var that = this;
		if(this.pauseGameTag){	
			this.togglePauseTimer();
			setTimeout(function(){
				window.requestAnimationFrame(function(time){
					that.animate.call(that,time);
				})
			},200)
		}else{
			this.togglePauseTimer();
			this.commonFps = this.fps(time);
			this.drawSprites(time);
			window.requestAnimationFrame(function(time){
				that.animate.call(that,time);
			});
		}
	},
	showStartBtn:function(){
		this.gameCover.removeChild(this.precentWrap);
		this.startGameBtn.className = "start-game-btn";
	},
	togglePauseTimer:function(){
		var diceOneAniTimer = this.diceOne.diceAnimationTimer,
			diceTwoAniTimer = this.diceTwo.diceAnimationTimer,
			runnerAniTimer = this.runner.runTimer,
			jumperTAniTimer = this.jumper.jumpTimer,
			jumperBAniTimer = this.jumper.fallTimer,
			jumperMAniTimer = this.jumper.moveTimer;
		if(this.pauseGameTag && !diceOneAniTimer.isPause()){
			// console.log(+new Date(),"pause time point");
			diceOneAniTimer.pause();
			diceTwoAniTimer.pause();
			jumperTAniTimer.pause();
			jumperMAniTimer.pause();
			jumperBAniTimer.pause();
			runnerAniTimer.pause();
		}
		if(!this.pauseGameTag && diceOneAniTimer.isPause()){
			// console.log(+new Date,"unpause time point");
			diceOneAniTimer.unpause();
			diceTwoAniTimer.unpause();
			jumperTAniTimer.unpause();
			jumperMAniTimer.unpause();
			jumperBAniTimer.unpause();
			runnerAniTimer.unpause();
		}
	},
	startShakeDice:function(){
		var that = this,
			rollCountInter,
			rollCountW,
			rollCountDirect = "right";
		this.rollBtn.addEventListener("mousedown",function(e){
			if(that.mousedown || that.pauseGameTag) return;
			that.mousedown = true;
			rollCountInter = setInterval(function(){
				rollCountW = that.rollCountSelect.style.width;
				rollCountW = rollCountW ? parseInt(rollCountW) : 0;
				if(rollCountDirect === "left"){
					that.rollCountSelect.style.width = rollCountW - 10 + "px";
				}else{
					that.rollCountSelect.style.width = rollCountW + 10 + "px";
				}
				if(rollCountW >= 190){
					rollCountDirect = "left";
				}else if(rollCountW <= 0){
					rollCountDirect = "right";
				}
			},16)
		},false)
		// 当按下且鼠标离开区域则触发
		this.rollBtn.addEventListener("mouseout",function(e){
			if(that.mousedown && !that.pauseGameTag){
				var event = document.createEvent("HTMLEvents");
  				event.initEvent("mouseup", true, false);
  				this.dispatchEvent(event);
			}
		},false)
		this.rollBtn.addEventListener("mouseup",function(){
			if(that.mouseup || that.pauseGameTag) return;
			that.mouseup = true;

			clearInterval(rollCountInter);
			that.playSound(that.diceSound);
			that.convertRoll(rollCountW);
			that.diceDetailNum(that.diceTotal);
			that.rollDiceShow();
			// 确定每次掷完骰子后人物的位置
			that.lastRunnerLoc();
			that.diceStartRotate()
		},false)
	},
	rollDiceShow:function(show){
		var that = this;
		setTimeout(function(){
			if(show){
				that.rollDiceWrap.style.display = "block";
			}else{
				that.mousedown = false;
				that.mouseup = false;
				that.rollCountSelect.style.width = 0;
				that.rollDiceWrap.style.display = "none";
			}
		},200)
	},
	diceNumShow:function(num){
		var that = this;
		setTimeout(function(){
			that.rollNumShow.innerHTML = num;
		},500)
		setTimeout(function(){
			that.rollNumShow.innerHTML = "";
		},1500)
	},
	diceDetailNum:function(diceAll){
		// 根据总骰子数，随机分配每个骰子的点数
		var diceTotalReal = diceAll - 2;
		if(diceTotalReal > 5){
			this.diceOneNum = this.intervalRandom(diceTotalReal - 5,5)
		}else{
			this.diceOneNum = this.intervalRandom(0,diceTotalReal);
		}
		this.diceTwoNum = diceTotalReal - this.diceOneNum;
	},
	convertRoll:function(w){
		switch(true){
			case w <= 50:
				this.diceTotal = this.intervalRandom(2,3);
				break;
			case w > 50 && w <= 100:
				this.diceTotal = this.intervalRandom(3,6);
				break;
			case w > 100 && w <= 150:
				this.diceTotal = this.intervalRandom(6,9);
				break;
			case w > 150 && w <= 200:
				this.diceTotal = this.intervalRandom(9,12);
				break;
			default:break;
		}
	},
	intervalRandom:function(n,m){
		// 获取n到m之间的随机数
		var r = m - n + 1;
		return Math.floor(Math.random() * r + n);
	},
	diceStartRotate:function(){
		this.dicesIsHidden = false;

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
		this.startShakeOneDice = false;
		this.startShakeTwoDice = false;
		this.dicesIsHidden = true;
	},
	cutDown:function(time,callback){
		var cutInterVal,
			cur = time,
			$gameCutDown = this.gameCutDown,
			that = this;
		for(var i = 0;i <= time;i++){
			(function(i){
				cutInterVal = setTimeout(function(){
					if(i === time){
						clearTimeout(cutInterVal);
						$gameCutDown.className = "game-cutdown hide";
						callback();
						return false;
					}
					that.playSound(that.cutSound);
					$gameCutDown.className = "game-cutdown game-cutdown-" + cur;
					cur--;
				},i * 1000)
			})(i)
		}
	},
	drawSprites:function(time){
		context.clearRect(0,0,this.canvasWidth,this.canvasHeight);
		// dice
		this.drawDice(time);
		// roles
		this.updateRoles(time);
	},
	createSprites:function(){
		this.drawElements();
		// dice
		this.createDice();
		// roles
		this.createRoles();
		// 离屏canvas，分层canvas
		this.offScreenCanvasBg();
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
	drawDice:function(time){
		if(this.dicesIsHidden) return;

		this.diceOne.paint(context);
		this.diceOne.update(context,time);

		this.diceTwo.paint(context);
		this.diceTwo.update(context,time);
	},
	drawWalkMap:function(){
		var mapBlockLeft = new Sprite("map-block",new drawStaticImage(Config.imgSource[0],Config.jsonObj["main"]["map-block-left"])),
			mapBlockTop = new Sprite("map-block",new drawStaticImage(Config.imgSource[0],Config.jsonObj["main"]["map-block-top"])),
			mapBlockBottom = new Sprite("map-block",new drawStaticImage(Config.imgSource[0],Config.jsonObj["main"]["map-block-bottom"])),
			mapBlockRight = new Sprite("map-block",new drawStaticImage(Config.imgSource[0],Config.jsonObj["main"]["map-block-right"])),

			mapBlockBlue = new Sprite("map-block",new drawStaticImage(Config.imgSource[0],Config.jsonObj["main"]["block-blue"])),
			mapBlockRed = new Sprite("map-block",new drawStaticImage(Config.imgSource[0],Config.jsonObj["main"]["block-red"])),
			mapBlockGrey = new Sprite("map-block",new drawStaticImage(Config.imgSource[0],Config.jsonObj["main"]["block-grey"])),
			mapBlockWhite = new Sprite("map-block",new drawStaticImage(Config.imgSource[0],Config.jsonObj["main"]["block-white"])),
			mapBlockGreen = new Sprite("map-block",new drawStaticImage(Config.imgSource[0],Config.jsonObj["main"]["block-green"])),
			mapBlockWBlue = new Sprite("map-block",new drawStaticImage(Config.imgSource[0],Config.jsonObj["main"]["block-wblue"])),
			mapBlockBlack = new Sprite("map-block",new drawStaticImage(Config.imgSource[0],Config.jsonObj["main"]["block-black"])),

			mapTopCorner = new Sprite("map-block",new drawStaticImage(Config.imgSource[0],Config.jsonObj["main"]["map-block-top-corner"]));

		this.mapOffCanvas = document.createElement("canvas");
		this.mapOffContext = this.mapOffCanvas.getContext("2d");
		this.mapOffCanvas.width = 2 * this.mapRealHorizontal;
		this.mapOffCanvas.height = 2 * this.mapRealVertical;
 		this.mapOffContext.save();
		this.mapOffContext.translate(this.mapRealHorizontal,0);
		this.mapOffContext.rotate(45 * Config.deg);
		this.mapOffContext.transform(1,-Math.tan(this.slopeAngle),-Math.tan(this.slopeAngle),1,0,0);

		for(var i = 0;i < 24;i++){
			switch(true){
				case i === 0:
					mapBlockGreen.top = 360;// 60 * 24 / 4
					mapBlockGreen.left = 360;// 60 * 6
					mapBlockGreen.paint(this.mapOffContext);
					break;
				case i === 2:
					mapBlockGrey.top = 360;// 60 * 24 / 4
					mapBlockGrey.left = 240;// 60 * 4
					mapBlockGrey.paint(this.mapOffContext);
					break;
				case i === 6:
					mapBlockBlack.left = 0;
					mapBlockBlack.top = 360;// 60 * 6
					mapBlockBlack.paint(this.mapOffContext);
					break;
				case i === 12:
					mapTopCorner.top = 0;
					mapTopCorner.left = 0;
					mapTopCorner.paint(this.mapOffContext);
					break;
				case i < 6:
					mapBlockBlue.top = 360;// 60 * 24 / 4
					mapBlockBottom.top = 360;// 60 * 24 / 4

					if(this.resumeArr.indexOf(i) !== -1){
						mapBlockBlue.left = 60 * (6 - i);
						mapBlockBlue.paint(this.mapOffContext)
					}else{
						mapBlockBottom.left = 60 * (6 - i);
						mapBlockBottom.paint(this.mapOffContext)
					}
					break;
				case i > 6 && i < 12:
					mapBlockRed.left = 0;
					mapBlockRight.left = 0;
					if(this.resumeArr.indexOf(i) !== -1){
						mapBlockRed.top = 60 * (12 - i);
						mapBlockRed.paint(this.mapOffContext)
					}else{
						mapBlockRight.top = 60 * (12 - i);
						mapBlockRight.paint(this.mapOffContext)
					}
					break;
				case i > 12 && i < 18:
					mapBlockWhite.top = 0;
					mapBlockBottom.top = 0;
					if(this.resumeArr.indexOf(i) !== -1){
						mapBlockWhite.left = 60 * (i - 12);
						mapBlockWhite.paint(this.mapOffContext)
					}else{
						mapBlockBottom.left = 60 * (i - 12);
						mapBlockBottom.paint(this.mapOffContext)
					}
					break;
				case i >= 18 && i < 24:
					mapBlockWBlue.left = 360;// 60 * 6
					mapBlockRight.left = 360;// 60 * 6
					if(this.resumeArr.indexOf(i) !== -1){
						mapBlockWBlue.top = 60 * (i - 18);
						mapBlockWBlue.paint(this.mapOffContext)
					}else{
						mapBlockRight.top = 60 * (i - 18);
						mapBlockRight.paint(this.mapOffContext)
					}
					break;
				default:break;
			}
		}
		this.mapOffContext.restore();
	},
	drawEnclosure:function(){
			// 水平围栏
		var enclosureHorizontal = new Sprite("enclosure-horizontal",new drawStaticImage(Config.imgSource[1],
																				Config.jsonObj["embellish"]["enclosure-horizontal"])),
			// 垂直围栏
			enclosureVertical = new Sprite("enclosure-vertical",new drawStaticImage(Config.imgSource[1],
																				Config.jsonObj["embellish"]["enclosure-vertical"]));
		this.enclosureVOffCanvas = document.createElement("canvas");
		this.enclosureVOffContext = this.enclosureVOffCanvas.getContext("2d");
		this.enclosureVOffCanvas.width = 15;
		this.enclosureVOffCanvas.height = 4 * 170;
		for(var i = 0;i < 4 ;i++){
			enclosureVertical.top = i * 170;
			enclosureVertical.paint(this.enclosureVOffContext);
		}

		this.enclosureHOffCanvas = document.createElement("canvas");
		this.enclosureHOffContext = this.enclosureHOffCanvas.getContext("2d");
		this.enclosureHOffCanvas.width = 8 * 132;
		this.enclosureHOffCanvas.height = 30;
		for(var i = 0;i < 8;i++){
			enclosureHorizontal.left = i * 132 + 11;
			enclosureHorizontal.paint(this.enclosureHOffContext);
		}
	},
	drawTrees:function(){
			// 大树1
		var tree1 = new Sprite("tree1",new drawStaticImage(Config.imgSource[1],Config.jsonObj["embellish"]["tree-1"])),
			// 大树2
			tree2 = new Sprite("tree2",new drawStaticImage(Config.imgSource[1],Config.jsonObj["embellish"]["tree-2"]));
		this.tree1OffCanvas = document.createElement("canvas");
		this.tree1OffContext = this.tree1OffCanvas.getContext("2d");
		this.tree1OffCanvas.width = 129;
		this.tree1OffCanvas.height = 124;
		tree1.paint(this.tree1OffContext);

		this.tree2OffCanvas = document.createElement("canvas");
		this.tree2OffContext = this.tree2OffCanvas.getContext("2d");
		this.tree2OffCanvas.width = 160;
		this.tree2OffCanvas.height = 65;
		for(var i = 0;i < 2;i++){
			tree2.left = i * 95;
			tree2.paint(this.tree2OffContext);
		}
	},
	drawTent:function(){
		// 帐篷
		var tent = new Sprite("tent",new drawStaticImage(Config.imgSource[1],Config.jsonObj["embellish"]["tent"]));
		this.tentOffCanvas = document.createElement("canvas");
		this.tentOffContext = this.tentOffCanvas.getContext("2d");
		this.tentOffCanvas.width = 148;
		this.tentOffCanvas.height = 159;
		tent.paint(this.tentOffContext);
	},
	drawFireWood:function(){
		// 柴火（两堆）
		var firewood = new Sprite("firewood",new drawStaticImage(Config.imgSource[1],Config.jsonObj["embellish"]["firewood"]));
		this.firewoodOffCanvas = document.createElement("canvas");
		this.firewoodOffContext = this.firewoodOffCanvas.getContext("2d");
		this.firewoodOffCanvas.width = 96;
		this.firewoodOffCanvas.height = 32;
		for(var i = 0;i < 2;i++){
			firewood.left = i * 64;
			firewood.paint(this.firewoodOffContext);
		}
	},
	drawCask:function(){
		// 木桶（两堆）
		var cask = new Sprite("cask",new drawStaticImage(Config.imgSource[1],Config.jsonObj["embellish"]["cask"]));
		this.caskOffCanvas = document.createElement("canvas");
		this.caskOffContext = this.caskOffCanvas.getContext("2d");
		this.caskOffCanvas.width = 120;
		this.caskOffCanvas.height = 45;
		for(var i = 0;i < 2;i++){
			cask.left = i * 60;
			cask.paint(this.caskOffContext);
		}
	},
	drawChair:function(){
		// chair
		var chair = new Sprite("chair",new drawStaticImage(Config.imgSource[1],Config.jsonObj["embellish"]["chair"]));
		this.chairOffCanvas = document.createElement("canvas");
		this.chairOffContext = this.chairOffCanvas.getContext("2d");
		this.chairOffCanvas.width = 128;
		this.chairOffCanvas.height = 64;
		chair.paint(this.chairOffContext);
	},
	updateRoles:function(time){
		this.currentRole === "jumper" ? this.drawJumper(time) : this.drawRunner(time);
	},
	drawJumper:function(time){
		this.jumper.paint(context);
		if(this.roleIsMoving || this.roleIsAction){
			this.jumper.update(context,time);
		}
	},
	drawRunner:function(time){
		this.runner.paint(context);
		if(this.roleIsMoving){
			this.runner.update(context,time);
		}
	},
	drawElements:function(){
		this.drawWalkMap();
		this.drawEnclosure();
		this.drawTrees();
		this.drawTent();
		this.drawFireWood();
		this.drawCask();
		this.drawChair()
	},
	offScreenCanvasBg:function(){
		// walkMap（行走地图）
		canvasBgContext.drawImage(this.mapOffCanvas,this.walkMapLeft,this.walkMapTop);
		// enclosure（围栏）
		canvasBgContext.drawImage(this.enclosureVOffCanvas,0,0);
		canvasBgContext.drawImage(this.enclosureVOffCanvas,this.canvasWidth - 15,0);
		canvasBgContext.drawImage(this.enclosureHOffCanvas,0,0);
		canvasBgContext.drawImage(this.enclosureHOffCanvas,0,this.canvasHeight - 30);
		// trees（大树）
		canvasBgContext.drawImage(this.tree1OffCanvas,0,0);
		canvasBgContext.drawImage(this.tree2OffCanvas,this.canvasWidth - 95 * 2,this.canvasHeight - 120);
		// tent（帐篷）
		canvasBgContext.drawImage(this.tentOffCanvas,this.canvasWidth - 160,0);
		// firewood（柴火）
		canvasBgContext.drawImage(this.firewoodOffCanvas,this.canvasWidth - 128,160);
		// cask（木桶）
		canvasBgContext.drawImage(this.caskOffCanvas,60,120);
		// chair（椅子）
		canvasBgContext.drawImage(this.chairOffCanvas,50,400);
	},
	selectRole:function(callback){
		var $roleObj = this.roleListAll,
		 	len = $roleObj.length,
			that = this;
		for(var i = 0;i < len;i++){
			(function(i){
				$roleObj[i].addEventListener("click",function(){
					that.role = this.dataset.role;
					that.currentRole = that.role === "runner" ? "runner" : "jumper"; 
					callback();
				},false)
			})(i)
		}
	},
	showSelectRole:function(){
		var that = this;
		this.startGameBtn.addEventListener("click",function(e){
			e.preventDefault();
			that.coverAni(that.gameCover,-that.canvasHeight,that.coverSlideTime,gameEasing.easeOut,function(){
				that.gameCoverWrap.removeChild(that.gameCover);
				console.log("please select role!!");
			})
		},false)
	},
	confirmRoleWH:function(){
		if(this.role === "runner"){
			this.roleWidth = 55;
			this.roleHeight = 80;
		}else {
			this.roleWidth = 150;
			this.roleHeight = 150;
		}
		// 人物初始位置
		this.rolesInitialLeft = this.canvasWidth / 2 - this.roleWidth / 2;
		this.rolesInitialTop = this.walkMapTop + this.mapRealVertical * 2 - this.roleHeight - this.verticalPacePix;
		// 人物在顶点的位置
		this.rolesHalfLeft = this.rolesInitialLeft;
		this.rolesHalfTop = this.rolesInitialTop - 2 * this.mapVertical;
	},
	showBlackRoom:function(){
		var that = this;
		this.entranceBlackRoom = true;
		setTimeout(function(){
			// 显示提示
			that.gameBlackRoom.className = "game-black-room zoomIn animated";
			that.gameBlackRoom.innerHTML = "你真不幸，被关小黑屋啦！想逃离的话，有两种途径：<br />（1）连续掷三次后，自动解除锁定。<br />（2）掷的骰子数相同则自动解除。"
		},500)
		setTimeout(function(){
			that.gameBlackRoom.className = "game-black-room hide";
			that.rollDiceShow(true);
		},4500)
	},
	showMiniGame:function(){
		this.miniGameWrap.className = "mini-game-wrap zoomIn animated";
		var len = this.pokerList.length,
			pokerList = ["two","three","four","five"],
			that = this;
		for(var i = 0;i < len;i++){
			this.pokerList[i].className += " " + pokerList[Math.floor(Math.random() * 4)];
		}
		for(var j = 0;j < len;j++){
			(function(j){
				that.pokerListBack[j].addEventListener("click",function(){
					if(that.pokerSelect) return;
					that.pokerSelect = true;

					var currentPoker = Math.floor(Math.random() * 3);
					that.pokerList[currentPoker].className = "poker-list one";
					this.className += " rollOver180";
					that.pokerList[j].className += " rollOver0";
					if(j === currentPoker){
						// 显示提示
						that.showShortCut("success");
					}else{
						that.showShortCut("fail");
					}
				},false);
			})(j)
		}
	},
	showShortCut:function(msg){
		var that = this;
		setTimeout(function(){
			that.pokerTipsWrap.className = "poker-tips-wrap zoomIn animated";
			that.pokerTipsWrap.innerHTML = "正在加载...";
			if(msg === "success"){
				that.showResume("shortCutKey",Config.resumeJson.shortCutKey,function(res){
					that.shortCutShowResume();
					that.pokerTipsWrap.innerHTML = res.info;
				},true);
			}else{
				that.pokerTipsWrap.innerHTML = "你猜错啦,手气不佳呀，下次再来吧！";
			}
		},500)
		setTimeout(function(){
			that.rollDiceShow(true);

			that.pokerSelect = false;
			// reset
			that.miniGameWrap.className = "mini-game-wrap hide";
			that.pokerTipsWrap.className = "poker-tips-wrap hide";

			for(var i = 0;i < 3;i++){
				that.pokerListBack[i].className = "poker-list-back";
				that.pokerList[i].className = "poker-list";
			}
		},3500)
	},
	showResult:function(index){
		var that = this;
		switch(index){
			case this.resumeArr[0]:
				this.showResume("personalInfo",Config.resumeJson.personalInfo,function(res){
					that.resumeOne.call(that,res);
				});
				break;
			case this.resumeArr[1]:
				this.showResume("contact",Config.resumeJson.contact,function(res){
					that.resumeTwo.call(that,res);
				});
				break;
			case this.resumeArr[2]:
				this.showResume("blog-works",Config.resumeJson.blog,function(res){
					that.resumeThree.call(that,res);
				});
				break;
			case this.resumeArr[3]:
				this.showResume("experience",Config.resumeJson.experience,function(res){
					that.resumeFour.call(that,res);
				});
				break;
			case 2:
				this.showMiniGame();
				break;
			case 6:
				this.showBlackRoom();
				break;
			default:
				this.rollDiceShow(true);
				break;
		}
	},
	shortCutShowResume:function(){
		var that = this;
		document.addEventListener("keydown",function(e){
			if(that.shortCutView) return;
			that.shortCutView = true;
			
			var code = e.keyCode;
			switch(code){
				case 89:
					// Y
					that.showResume("personalInfo",Config.resumeJson.personalInfo,function(res){
						that.resumeOne.call(that,res)
					});
					break;
				case 80:
					// P
					that.showResume("contact",Config.resumeJson.contact,function(res){
						that.resumeTwo.call(that,res);
					});
					break;
				case 66:
					// B
					that.showResume("blog-works",Config.resumeJson.blog,function(res){
						that.resumeThree.call(that,res);
					});
					break;
				case 78:
					// N
					that.showResume("experience",Config.resumeJson.experience,function(res){
						that.resumeFour.call(that,res);
					});
					break;
				default:
					that.shortCutView = false;
					break;
			}
		},false)
	},
	showResume:function(name,url,callback,hide){
		var that = this;
		if(!hide){
			this.gameResumeDetail.className = "game-resume-detail zoomIn animated";
			this.gameResumeWrap.className = "game-resume-wrap loading";
			// resume sound
			this.playSound(this.resumeSound);
		}
		// name 只是个标识
		var xmlHttp = new XMLHttpRequest() || new ActiveXObject("Microsoft.XMLHTTP");
		xmlHttp.onreadystatechange = function(){
			if(xmlHttp.readyState === 4){
				// 去除loading
				that.gameResumeWrap.className = "game-resume-wrap";
				if(xmlHttp.status === 200){
					var res = JSON.parse(xmlHttp.responseText);
					callback(res);
				}else{
				}
			}
		}
		xmlHttp.open("GET",url,true);
		xmlHttp.setRequestHeader("Content-Type","application/json");
		xmlHttp.send(null);
	},
	resumeOne:function(res){
		// 个人信息
		var html = '<h2>' + res.title + '</h2><p>姓名：' + res.name + '</p><p>性别：' + res.gender + '</p><p>出生日期：' + res.birth + '</p><p>学历：' + res.education + '<p>居住地：' + res.location + '</p><p>现在所在公司：' + res.company + '</p><p>前端开发经验：' + res.experience + '</p>'; 
		this.gameResumeWrap.innerHTML = html;
	},
	resumeTwo:function(res){
		// 联系方式
		var html = '<h2>' + res.title + '</h2><p>手机：' + res.mobile + '</p><p>Email：' + res.email + '</p><p>QQ：' + res.qq + '</p>';
		this.gameResumeWrap.innerHTML = html;
	},
	resumeThree:function(res){
		// 作品及博客
		var html = '<h2>' + res.title + '</h2><p>博客：<a href="'+ res.blog +'" target="_blank">点击</a></p><p>GitHub：<a href="'+ res.github +'" target="_blank">点击</a></p><p>jQuery解析：<a href="'+ res["jquery-analysis"] +'" target="_blank">点击</a></p><p>本游戏源码：<a href="'+ res["resume-game"] +'" target="_blank">点击</a></p><p>HTML5微信页面：<a href="'+ res["H5"]["start"] +'" target="_blank">WIFI大作战</a><a href="'+ res["H5"]["jiju"] +'" target="_blank">发布会邀请函</a><a href="'+ res["H5"]["six"] +'" target="_blank">六脉神剑</a></p><p>PC网站：<a href="'+ res["web"]["jly"] +'" target="_blank">点击</a></p><p>其它：' + res.soon + '</p>'; 

		this.gameResumeWrap.innerHTML = html;
	},
	resumeFour:function(res){
		// 工作经历等
		var html = '<h2>'+ res.title +'</h2><div class="game-work-exp">' + res.info + '</div>';
		this.gameResumeWrap.innerHTML = html;
	},
	closeResume:function(){
		var that = this;
		this.gameResumeClose.addEventListener("click",function(){
			that.shortCutView = false;
			that.rollDiceShow(true);
			this.parentNode.className = "game-resume-detail hide";
			// 清空原有的内容
			that.gameResumeWrap.innerHTML = "";
		},false)
	},
	// getSprites:function(name){
	// 	var len = this.sprites.length;
	// 	for(var i = 0;i < len;i++){
	// 		if(name === this.sprites[i].name){
	// 			return this.sprites[i];
	// 		}
	// 	}
	// 	return null;
	// },
	soundIsPlaying:function(sound){
		return !sound.ended && sound.currentTime > 0;
	},
	playSound:function(sound){
		if(this.pauseAudioTag) return;

		if(!this.soundIsPlaying(sound)){
			sound.play();
		}else{
			sound.load();
			sound.play();
		}
	},
	audioToggle:function(){
		var that = this;
		this.audioBtn.addEventListener("click",function(){
			that.pauseAudioTag = !that.pauseAudioTag;
			that.pauseAudioTag ? this.classList.add("close") : this.classList.remove("close");
		},false)
	},
	findCellData:function(name,jsonObj){
		var cellDatas = [];
		for(var i in jsonObj){
			if(i.indexOf(name) !== -1){
				cellDatas.push(jsonObj[i]);
			}
		}
		this.jsonCells[name] = cellDatas;
		return cellDatas;
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
		if(time - this.lastFpsUpdateTime > 1000){
			this.fpsShow.innerHTML = fps.toFixed(0) + " fps";
			this.lastFpsUpdateTime = time;
		}
		return fps; 
	},
	// showFps:function(){
	// 	var that = this;
	// 	this.fpsShow.innerHTML = this.commonFps.toFixed(0) + " fps";
	// 	setTimeout(function(){
	// 		that.showFps.call(that)
	// 	},1000);
	// },
	pauseGame:function(){
		var that = this;
		document.addEventListener("keydown",function(e){
			var code = e.keyCode;
			// Space
			if(code === 32){
				that.spaceTriggerPause = !that.spaceTriggerPause;
				that.togglePaused();
			}
		})
	},
	togglePaused:function(){
		var now = +new Date();
		this.pauseGameTag = !this.pauseGameTag;
		if(this.pauseGameTag){
			// 记录开始暂停的时间点
			this.pauseStartTime = now;
		}else{
			this.lastFrameTime += (now - this.pauseStartTime);
		}
	},
	// 窗口失去/获取焦点时的暂停处理
	windowFocus:function(){
		var that = this;
		if(that.spaceTriggerPause) return;
		window.onblur = function(){
			this.windowHasFocus = false;
			if(!that.pauseGameTag){
				that.togglePaused();
			}
		}
		window.onfocus = function(){
			this.windowHasFocus = true;
			var focusCutTime;
			if(that.pauseGameTag){
				// 人物正在运动或者骰子正在投掷时需要有一个倒计时缓冲时间
				focusCutTime = (that.roleIsMoving || !that.diceStopShake) ? 2 : 0;
				that.cutDown(focusCutTime,function(){
					that.togglePaused();
				});
			}
		}
	},
	// 上下滑动
	coverAni:function(obj,lastTop,aniTime,aniWay,fn){
		var oldTop = obj.style.top ? parseInt(obj.style.top) : 0,
			changeTime = 16,
			i = 1,
			lastTop = parseInt(lastTop),
			topGap = Math.abs(lastTop - oldTop),
			step = topGap / (aniTime/changeTime),
			precent,coverInterVal;

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
	},
	showRules:function(){
		var that = this;
		this.rulesWrap.classList.add("position");
		this.rulesWrap.querySelector(".rules-close-btn").addEventListener("click",function(){
			document.querySelector(".canvas-main").removeChild(that.rulesWrap);
		},false)
	}
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
window.requestAnimationFrame = (function(){
	return 	window.requestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback,element){
				setTimeout(callback,1000/60);
			}
})()
