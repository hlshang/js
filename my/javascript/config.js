// 公用的变量
var Config = {
	sourceList:{
		"images":["img/main.png","img/embellish.png","img/jumpers.png","img/runners.png","img/sub-img.png"],
		// "audio":["sounds/start.mp3","sounds/dice.mp3","sounds/jumper.mp3","sounds/runner.mp3","sounds/resume.mp3","sounds/cutDown.mp3"],
		"json":["resume-json/main.json?0503","resume-json/embellish.json?0503","resume-json/jumpers.json?0503","resume-json/runners.json?0503"]
	},
	resumeJson:{
		"personalInfo":"resume-json/resume-personalInfo.json?0503",
		"contact":"resume-json/resume-contact.json?0503",
		"blog":"resume-json/resume-blog.json?0503",
		"experience":"resume-json/resume-experience.json?0503",
		"shortCutKey":"resume-json/shortCut-key.json?0503"
	},
	// 三种资源
	imgSource : [],
	mediaSource : [],
	jsonSource : [],
	jsonObj : {},
	// 进度条长度
	progressBarW : 450,
	// 进度条高度
	progressBarH : 30,
	// 进度条的半径，必须为高度的一半
	progressRadius : 15,
	// 进度条颜色
	progressColor : "rgba(255,60,10,.8)",
	// 进度条边框颜色
	progressBorderColor : "rgba(255,60,0,1)",
	// 重力加速度
	GRAVITY_FORCE : 9.81,
	// deg
	deg : Math.PI/180,
	slopeAngle : 22,
	zoneWidth : 60,
	zoneHeight : 60
};
