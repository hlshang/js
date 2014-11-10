// 计时器
function StopWatch(){
	this.startTime = 0;
	this.running = false;
	this.pause = false;
	this.startPauseTime = 0;
	this.totalPauseTime = 0;
	this.elapsed = 0;
}

StopWatch.prototype = {
	start:function(){
		this.startTime = +new Date();
		this.running = true;
		this.startPauseTime = 0;
		this.totalPauseTime = 0;
	},
	stop:function(){
		if(this.pause){
			// 算出总共暂停了多长时间
			this.unpause();
		}
		this.elapsed = +new Date() - this.startTime - this.totalPauseTime;
	},
	pause:function(){
		if(this.pause) return;
		this.startPauseTime = +new Date();
		this.pause = false;
	},
	unpause:function(){
		if(!this.pause) return;
		this.totalPauseTime = +new Date() - this.startPauseTime;
		this.startPauseTime = 0;
		this.pause = false;
	},
	isRunning:function(){
		return this.running;
	},
	isPause:function(){
		return this.pause;
	},
	getElapsedTime:function(){
		if(this.running){
			return +new Date() - this.startTime - this.totalPauseTime;
		}
		return this.elapsed;
	},
	reset:function(){
		this.startTime = 0;
		this.running = false;
		this.pause = false;
		this.startPauseTime = 0;
		this.totalPauseTime = 0;
		this.elapsed = 0;
	}
} 

// 动画计时器
function AnimationTimer(duration,transducer){
	this.duration = duration || 1000;
	this.transducer = transducer;
	this.stopWatch = new StopWatch();
}
AnimationTimer.prototype = {
	start:function(){
		this.stopWatch.start();
	},
	stop:function(){
		this.stopWatch.stop();
	},
	pause:function(){
		this.stopWatch.pause();
	},
	unpause:function(){
		this.stopWatch.unpause();
	},
	isRunning:function(){
		return this.stopWatch.isRunning();
	},
	isPause:function(){
		return this.stopWatch.isPause();
	},
	reset:function(){
		this.stopWatch.reset();
	},
	isExpired:function(){
		return this.stopWatch.getElapsedTime() > this.duration;
	},
	getRealElapsedTime:function(){
		return this.stopWatch.getElapsedTime();
	},
	getElapsedTime:function(){
		var elapsedTime = this.stopWatch.getElapsedTime(),
			precentComplete = elapsedTime/this.duration;
		if(precentComplete >= 1){
			precentComplete = 1.0;
		}
		if(!!this.transducer && precentComplete > 0){
			elapsedTime = elapsedTime * (this.transducer(elapsedTime)/precentComplete);
		}
		return elapsedTime;
	}
}
