// 针对手持设备的判断
var mobile = {
	init:function(){
		this.orientation();
		this.scaleCanvas();
		this.fixShakeDice()
	},
	orientation:function(){
		document.body.addEventListener("orientationchange",function(){
			var orientationAngle = window.orientation;
			if(orientationAngle === 0 || orientationAngle === 180){
				document.querySelector(".canvas-main").classList.add("hide");
				document.querySelector(".game-cover-wrap").classList.add("hide");
				document.querySelector(".orientation-tip").classList.remove("hide");
			}else{
				document.querySelector(".canvas-main").classList.remove("hide");
				document.querySelector(".game-cover-wrap").classList.remove("hide");
				document.querySelector(".orientation-tip").classList.add("hide");
			}
		},false)

		var event = document.createEvent("HTMLEvents");
		event.initEvent("orientationchange", true, false);
		document.body.dispatchEvent(event);
	},
	scaleCanvas:function(){
		var windowW = window.screen.width > window.screen.height ? window.screen.width : window.screen.height,
			proportion = (windowW / 1080).toFixed(2);
		if(proportion < 1){
			document.querySelector(".game-resume-detail").style.webkitTransform = 'scale('+ proportion +')';
			document.querySelector(".game-resume-detail").style.transform = 'scale('+ proportion +')';
			document.querySelector(".mini-game-wrap").style.webkitTransform = 'scale('+ proportion +')';
			document.querySelector(".mini-game-wrap").style.transform = 'scale('+ proportion +')';
			document.querySelector(".canvas-main").style.webkitTransform = 'scale('+ proportion +')';
			document.querySelector(".canvas-main").style.transform = 'scale('+ proportion +')';
			document.querySelector(".game-cover-wrap").style.webkitTransform = 'scale('+ proportion +')';
			document.querySelector(".game-cover-wrap").style.transform = 'scale('+ proportion +')';
		}
	},
	fixShakeDice:function(){
		Game.prototype.startShakeDice = function(){
			var that = this,
				rollCountInter,
				rollCountW,
				rollCountDirect = "right";
			this.rollBtn.addEventListener("touchstart",function(e){
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
			this.rollBtn.addEventListener("touchmove",function(e){
				if(that.mousedown && !that.pauseGameTag){
					var event = document.createEvent("HTMLEvents");
	  				event.initEvent("mouseup", true, false);
	  				this.dispatchEvent(event);
				}
			},false)
			this.rollBtn.addEventListener("touchend",function(){
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
		}
	}
};
mobile.init();