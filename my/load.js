(function(){
	var resumeImg = new Image();
		resumeImg.src = "resume.png";
	var	sourceNums = 0,
		sourceArr = [];

	var loadSources = {
		progress:0,
		init:function(source,callback){
			if(!pb.checkType(source)){
				alert("载入资源格式为数组或者对象！");
				return false;
			}
			if(pb.isArray(source)){
				// 数组格式
				var len = source.length;
				for(var i = 0;i < len;i++){
					sourceNums += source[i].length;
				}
				sourceArr = source;
			}

			if(pb.isObject(source)){
				// 对象格式
				for(var i in source){
					// 统计资源总数
					sourceNums += source[i].length;
					sourceArr.push(source[i]);
				}
			}
			this.loadMain(sourceArr,callback)
		},
		loadMain:function(obj,callback){
			var that = this,
				imageObj = obj[0],
				mediaObj = obj[1],
				jsonObj = obj[2],
				imageId = 0,
				mediaId = 0,
				jsonId = 0,
				jsonFailId = 0;
			var loadImg = function(){
				var	image = new Image();
				image.src = imageObj[imageId];

				image.onload = function(){
					if(image.complete === true){
						Config.imgSource.push(image);
						imageId++;
						if(imageId < imageObj.length){
							loadImg();							
						}
						that.progress = imageId/sourceNums;
						that.showProgressBar(that.progress,imageObj[imageId - 1]);
						if(imageId === imageObj.length){
							loadMedia();
						}
					}
				}
				image.error = function(){
					imageId++;
					loadImg();
					that.progress = parseFloat(imageId/sourceNums).toFixed(2);
					that.showProgressBar(that.progress,imageObj[imageId - 1]);
				}
			}

			function loadMedia() {
				var media = document.createElement("audio");
				media.src = mediaObj[mediaId];
				// 不支持video/audio，则跳过，不要音频文件也罢！
				if(!media.play){
					mediaId = mediaObj.length;
					that.progress = (imageId + mediaId)/sourceNums;
					that.showProgressBar(that.progress,mediaObj[mediaId - 1]);
					loadJson();
					return;
				}
				media.addEventListener("canplay",function(){
					Config.mediaSource.push(media);
					mediaId++;
					if(mediaId < mediaObj.length){
						loadMedia();
					}
					that.progress = (imageId + mediaId)/sourceNums;
					that.showProgressBar(that.progress,mediaObj[mediaId - 1]);
					if(mediaId === mediaObj.length){
						loadJson();
					}
				},false)
			}

			function loadJson(){
				var xmlHttp = new XMLHttpRequest() || new ActiveXObject("Microsoft.XMLHTTP");
				xmlHttp.onreadystatechange = function(){
					if(xmlHttp.readyState === 4){
						if(xmlHttp.status === 200){
							that.dealXmlHttp(xmlHttp);
							jsonId++;
							if(jsonId < jsonObj.length){
								loadJson();
							}
							that.progress = (imageId + mediaId + jsonId)/sourceNums;
							that.showProgressBar(that.progress,jsonObj[jsonId - 1]);
							if(jsonId === jsonObj.length){
								callback();
							}
						}else{
							jsonFailId++;
							if(jsonFailId === 3){
								return false;
							}
							loadJson()
						}
					}
				}
				xmlHttp.open("GET",jsonObj[jsonId],true);
				xmlHttp.setRequestHeader("Content-Type","application/json");
				xmlHttp.send(null);
			}

			loadImg();
		},
		dealXmlHttp:function(xmlHttp){
			var responseText = JSON.parse(xmlHttp.responseText),
				jsonName = responseText.meta.image.replace(/(.png|.jpeg|.jpg|.gif)$/i,"");
			Config.jsonObj[jsonName] = responseText.frames;
		},
		showProgressBar:function(progress,sourceName){
			var width = Config.progressBarW,
				height = Config.progressBarH,
				radius = Config.progressRadius,
				cWidth = canvas.width,
				cHeight = canvas.height,
				progress = parseInt(progress * 100);

			context.clearRect(0,0,cWidth,cHeight);
			context.beginPath();
			context.arc(cWidth/2 - width/2 + radius,cHeight/2 - height/2,radius,0.5*Math.PI,1.5*Math.PI);
			context.lineTo(cWidth/2 + width/2 - radius,cHeight/2 - height);
			context.arc(cWidth/2 + width/2 - radius,cHeight/2 - height/2,radius,1.5*Math.PI,0.5*Math.PI);
			context.lineTo(cWidth/2 - width/2 + radius,cHeight/2 - height/2 + radius);
			context.closePath();

			context.strokeStyle = "rgba(255,60,0,1)";
			context.lineWidth = 2;
			context.stroke();
			
			context.beginPath();
			context.arc(cWidth/2 - width/2 + radius,cHeight/2 - height/2,radius,0.5*Math.PI,1.5*Math.PI);
			context.lineTo(cWidth/2 - width/2 - radius + width * progress/100,cHeight/2 - height);
			context.arc(cWidth/2 - width/2 - radius + width * progress/100,cHeight/2 - height/2,radius,1.5*Math.PI,0.5*Math.PI);
			context.lineTo(cWidth/2 - width/2 + radius,cHeight/2 - height/2 + radius);
			context.closePath();
			context.fillStyle = "rgba(255,60,10,.8)";
			context.fill();
			
			context.drawImage(resumeImg,cWidth/2 - width/2 - radius + width * progress/100,cHeight/2 - height,height,height)
			this.showPrecentNums(progress);
		},
		showPrecentNums:function(precents){
			pb.init("load-precent-nums").innerHTML = precents + "%";
		}
	};

	window.loadSources = loadSources;
})()
