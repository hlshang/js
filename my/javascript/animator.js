// 计时器
function StopWatch(){
	this.startTime = 0;
	this.running = false;
	this.paused = false;
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
		if(this.paused){
			// 算出总共暂停了多长时间
			this.unpause();
		}
		this.elapsed = +new Date() - this.startTime - this.totalPauseTime;
		this.running = false;
	},
	pause:function(){
		if(this.paused) return;
		this.startPauseTime = +new Date();
		this.paused = true;
	},
	unpause:function(){
		if(!this.paused) return;
		this.totalPauseTime += (+new Date()) - this.startPauseTime;
		this.startPauseTime = 0;
		this.paused = false;
	},
	isRunning:function(){
		return this.running;
	},
	isPause:function(){
		return this.paused;
	},
	getElapsedTime:function(){
		if(this.running){
			// console.log(+new Date,this.totalPauseTime)
			return +new Date() - this.startTime - this.totalPauseTime;
		}
		return this.elapsed;
	},
	reset:function(){
		this.startTime = 0;
		this.running = false;
		this.paused = false;
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
			elapsedTime = elapsedTime * (this.transducer(precentComplete)/precentComplete);
		}
		return elapsedTime;
	}
}

AnimationTimer.makeEaseOutTransducer = function (strength) {
   return function (percentComplete) {
      strength = strength ? strength : 1.0;

      return 1 - Math.pow(1 - percentComplete, strength*2);
   };
};

AnimationTimer.makeEaseInTransducer = function (strength) {
   strength = strength ? strength : 1.0;

   return function (percentComplete) {
      return Math.pow(percentComplete, strength*2);
   };
};

AnimationTimer.makeEaseInOutTransducer = function () {
   return function (percentComplete) {
      return percentComplete - Math.sin(percentComplete*2*Math.PI) / (2*Math.PI);
   };
};

AnimationTimer.makeElasticTransducer = function (passes) {
   passes = passes || 3;

   return function (percentComplete) {
       return ((1-Math.cos(percentComplete * Math.PI * passes)) *
               (1 - percentComplete)) + percentComplete;
   };
};

AnimationTimer.makeBounceTransducer = function (bounces) {
   var fn = AnimationTimer.makeElasticTransducer(bounces);

   bounces = bounces || 2;

   return function (percentComplete) {
      percentComplete = fn(percentComplete);
      return percentComplete <= 1 ? percentComplete : 2-percentComplete;
   }; 
};

AnimationTimer.makeLinearTransducer = function () {
   return function (percentComplete) {
      return percentComplete;
   };
};